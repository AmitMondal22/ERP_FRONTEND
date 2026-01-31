// services/payrollService.js
const dayjs = require('dayjs');
// your DB functions
const PAYSLIP_TABLE = 'em_payslip'; // your constant

async function generateAllMonthlyPayslipsService(created_by = null) {
  try {
    const monthStart = dayjs().startOf("month");
    const monthEnd = dayjs().endOf("month");
    const totalDaysInMonth = monthEnd.date();

    const employees = await selectData(
      "em_employees",
      "employee_id",
      "status = 'ACTIVE'"
    );

    if (!employees.length) {
      return { 
        success: true, 
        message: "No active employees",
        summary: { total: 0, generated: 0, skipped: 0, errors: 0 },
        errors: []
      };
    }

    // Holiday count
    const holidayDays = parseInt(
      (await customSelectSqlQuery2(
        `SELECT COUNT(*) AS holiday_days
         FROM em_annual_holiday
         WHERE holiday_date BETWEEN ? AND ?`,
        [monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
        false
      ))?.holiday_days || 0
    );

    let generated = 0, skipped = 0, errors = [];

    for (const emp of employees) {
      const employee_id = emp.employee_id;

      try {
        // ⏭ Skip if already generated
        const exists = await selectOneData(
          PAYSLIP_TABLE,
          "payslip_id",
          `employee_id = ${employee_id}
           AND month_date = '${monthStart.format("YYYY-MM-DD")}'`
        );
        if (exists) { skipped++; continue; }

        /* =====================================================
           STEP 1: ATTENDANCE
        ===================================================== */
        const presentDays = parseInt(
          (await customSelectSqlQuery2(
            `SELECT COUNT(DISTINCT work_date) AS present_days
             FROM em_attendance
             WHERE employee_id = ?
               AND work_date BETWEEN ? AND ?`,
            [employee_id, monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
            false
          ))?.present_days || 0
        );

        const approvedLeaveDays = parseInt(
          (await customSelectSqlQuery2(
            `SELECT IFNULL(
              SUM(DATEDIFF(LEAST(end_date,?), GREATEST(start_date,?)) + 1), 0
            ) AS approved_leave_days
            FROM em_leave_requests
            WHERE employee_id = ?
              AND status = 'APPROVED'
              AND start_date <= ?
              AND end_date >= ?`,
            [
              monthEnd.format("YYYY-MM-DD"),
              monthStart.format("YYYY-MM-DD"),
              employee_id,
              monthEnd.format("YYYY-MM-DD"),
              monthStart.format("YYYY-MM-DD")
            ],
            false
          ))?.approved_leave_days || 0
        );

        const paidDays = presentDays + approvedLeaveDays + holidayDays;
        const unpaidDays = Math.max(0, totalDaysInMonth - paidDays);

        /* =====================================================
           STEP 2: SALARY STRUCTURE
        ===================================================== */
        const salary = await selectLastData(
          "em_salary",
          "*",
          `employee_id = ${employee_id} AND last_salary_status = 'Y'`
        );
        if (!salary) { skipped++; continue; }

        /* =====================================================
           STEP 3: MONTHLY CTC
        ===================================================== */
        const ctcFields = [
          'basic_salary','basic_pay','dearness_allowance',
          'house_rent_allowance','conveyance_allowance',
          'medical_allowance','special_allowance',
          'performance_bonus','incentive','attendance_allowance'
        ];

        const monthCtcAmount = ctcFields.reduce(
          (sum, f) => sum + parseFloat(salary[f] || 0),
          0
        );

        /* =====================================================
           STEP 4: PAYROLL FORMULA
           (amount / monthDays) × paidDays
        ===================================================== */
        const perDaySalary = monthCtcAmount / totalDaysInMonth;
        const grossSalaryAfterLOP = perDaySalary * paidDays;
        const lopAmount = monthCtcAmount - grossSalaryAfterLOP;

        /* =====================================================
           STEP 5: ALL DEDUCTIONS (TABLE MATCH)
        ===================================================== */

        // Employee deductions (salary impact)
        const employeeDeductions = {
          epf_employee_contribution: +salary.epf_employee_contribution || 0,
          esi_employee_contribution: +salary.esi_employee_contribution || 0,
          professional_tax: +salary.professional_tax || 0,
          labour_welfare_fund: +salary.labour_welfare_fund || 0,
          income_tax_tds: +salary.income_tax_tds || 0,
          loan_deduction: +salary.loan_deduction || 0,
          advance_salary_recovery: +salary.advance_salary_recovery || 0,
          meal_deduction: +salary.meal_deduction || 0,
          insurance_premium_employee: +salary.insurance_premium_employee || 0,
          late_coming_lop: +salary.late_coming_lop || 0,
          notice_period_recovery: +salary.notice_period_recovery || 0,
          damage_penalty_deduction: +salary.damage_penalty_deduction || 0
        };

        // 🏢 Employer contributions (NO salary impact)
        const employerContributions = {
          epf_employer_contribution: +salary.epf_employer_contribution || 0,
          esi_employer_contribution: +salary.esi_employer_contribution || 0
        };

        const employeeDeductionTotal = Object.values(employeeDeductions)
          .reduce((a, b) => a + b, 0);

        /* =====================================================
           STEP 6: FINAL SALARY
        ===================================================== */
        const salaryInHand = grossSalaryAfterLOP - employeeDeductionTotal;

        /* =====================================================
           STEP 7: INSERT PAYSLIP
        ===================================================== */
        const payslip_id = await insertData(PAYSLIP_TABLE, {
          employee_id,
          month_date: monthStart.format("YYYY-MM-DD"),
          total_present_in_months: paidDays,
          total_absent_in_month: unpaidDays,
          month_ctc_amount: monthCtcAmount.toFixed(2),
          lop_amount: lopAmount.toFixed(2),
          month_deducted_amount: employeeDeductionTotal.toFixed(2),
          salary_in_hand: salaryInHand.toFixed(2),
          created_by,
          created_at: dayjs().format("YYYY-MM-DD HH:mm:ss")
        });

        /* =====================================================
           STEP 8: INSERT em_payslip_deductions
        ===================================================== */
        await insertData("em_payslip_deductions", {
          payslip_id,
          employee_id,
          month_date: monthStart.format("YYYY-MM-DD"),

          // employee
          ...employeeDeductions,

          // employer (stored, not deducted)
          ...employerContributions,

          total_deducted_amount: employeeDeductionTotal.toFixed(2),
          created_by,
          created_at: dayjs().format("YYYY-MM-DD HH:mm:ss")
        });

        generated++;

      } catch (err) {
        console.error("❌ Error:", err);
        errors.push({ employee_id, error: err.message });
        skipped++;
      }
    }

    return {
      success: true,
      message: "Payslip generation completed",
      summary: { total: employees.length, generated, skipped, errors: errors.length },
      errors
    };

  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  }
}

module.exports = { generateAllMonthlyPayslipsService };
