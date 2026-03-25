
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const {
  selectData,
  selectOneData,
  customSelectSqlQuery,
  customSelectSqlQuery2,
  insertData,
  updateData,
  deleteData,
  selectLastData,
} = require("../models/MasterModel");

const PAYSLIP_TABLE = "em_payslips";

class employeePaySlipController {
  
  
// //  Generate payslips for ALL employees (current month) - UPDATED WITH CTC CALCULATION
// async generateAllMonthlyPayslips(req, res) {
//   try {
//     const created_by = req.user?.id || null;

//     // 📅 Current month
//     const monthStart = dayjs().startOf("month");
//     const monthEnd = dayjs().endOf("month");
//     const totalDaysInMonth = monthEnd.date();

//     console.log("iam being called")

//     console.log('📅 Generating payslips for:', monthStart.format("YYYY-MM"));
//     console.log('📅 Total days in month:', totalDaysInMonth);

//     // 1️⃣ Get all active employees
//     const employees = await selectData(
//       "em_employees",
//       "employee_id",
//       "status = 'ACTIVE'"
//     );

//     if (!employees.length) {
//       return res.json({
//         success: true,
//         message: "No active employees found",
//       });
//     }

//     console.log('👥 Found', employees.length, 'active employees');

//     // 2️⃣ Get company holidays once (PAID)
//     const holidaySql = `
//       SELECT COUNT(*) AS holiday_days
//       FROM em_annual_holiday
//       WHERE holiday_date BETWEEN ? AND ?
//     `;
//     const holidayRow = await customSelectSqlQuery2(
//       holidaySql,
//       [monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
//       false
//     );
//     const holidayDays = holidayRow?.holiday_days || 0;

//     console.log('🎉 Company holidays in this month:', holidayDays);

//     let generated = 0;
//     let skipped = 0;
//     const errors = [];

//     // 3️⃣ Loop through employees
//     for (const emp of employees) {
//       const employee_id = emp.employee_id;
      
//       try {
//         console.log(`\n👤 Processing employee_id: ${employee_id}`);

//         // 🚫 Skip if payslip already exists
//         const existing = await selectOneData(
//           PAYSLIP_TABLE,
//           "payslip_id",
//           `employee_id = ${employee_id} AND month_date = '${monthStart.format("YYYY-MM-DD")}'`
//         );

//         if (existing) {
//           console.log(`⏭️  Skipped: Payslip already exists`);
//           skipped++;
//           continue;
//         }

//         // 4️⃣ Present days from attendance
//         const presentSql = `
//           SELECT COUNT(DISTINCT work_date) AS present_days
//           FROM em_attendance
//           WHERE employee_id = ?
//           AND work_date BETWEEN ? AND ?
//         `;
//         const presentRow = await customSelectSqlQuery2(
//           presentSql,
//           [employee_id, monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
//           false
//         );
//         const presentDays = parseInt(presentRow?.present_days || 0);

//         console.log(`   📊 Present days: ${presentDays}`);

//         // 5️⃣ Approved leave days (PAID)
//         const approvedLeaveSql = `
//           SELECT IFNULL(SUM(
//             DATEDIFF(
//               LEAST(end_date, ?),
//               GREATEST(start_date, ?)
//             ) + 1
//           ), 0) AS approved_leave_days
//           FROM em_leave_requests
//           WHERE employee_id = ?
//           AND status = 'APPROVED'
//           AND start_date <= ?
//           AND end_date >= ?
//         `;
//         const leaveRow = await customSelectSqlQuery2(
//           approvedLeaveSql,
//           [
//             monthEnd.format("YYYY-MM-DD"),
//             monthStart.format("YYYY-MM-DD"),
//             employee_id,
//             monthEnd.format("YYYY-MM-DD"),
//             monthStart.format("YYYY-MM-DD"),
//           ],
//           false
//         );
//         const approvedLeaveDays = parseInt(leaveRow?.approved_leave_days || 0);

//         console.log(`   🏖️  Approved leave days: ${approvedLeaveDays}`);

//         // 6️⃣ Attendance summary
//         const paidDays = presentDays + approvedLeaveDays + holidayDays;
//         const unpaidDays = totalDaysInMonth - paidDays < 0 ? 0 : totalDaysInMonth - paidDays;

//         console.log(`   ✅ Total paid days: ${paidDays}`);
//         console.log(`   ❌ Total unpaid days: ${unpaidDays}`);

//         // 7️⃣ Active salary - WITH CTC CALCULATION
//         const salary = await selectOneData(
//           "em_salary",
//           "*",
//           `employee_id = ${employee_id} AND last_salary_status = 'Y'`
//         );

//         if (!salary) {
//           console.log(`   ⚠️  WARNING: No active salary structure found - SKIPPING`);
//           errors.push({
//             employee_id,
//             error: 'No active salary structure found'
//           });
//           skipped++;
//           continue;
//         }

//         // ✨ CALCULATE CTC from all salary components
//         const monthCtcAmount = 
//           parseFloat(salary.basic_salary || 0) +
//           parseFloat(salary.basic_pay || 0) +
//           parseFloat(salary.basic_wages || 0) +
//           parseFloat(salary.dearness_allowance || 0) +
//           parseFloat(salary.house_rent_allowance || 0) +
//           parseFloat(salary.conveyance_allowance || 0) +
//           parseFloat(salary.medical_allowance || 0) +
//           parseFloat(salary.special_allowance || 0) +
//           parseFloat(salary.city_compensatory_allowance || 0) +
//           parseFloat(salary.education_allowance || 0) +
//           parseFloat(salary.uniform_allowance || 0) +
//           parseFloat(salary.telephone_mobile_allowance || 0) +
//           parseFloat(salary.internet_allowance || 0) +
//           parseFloat(salary.fuel_allowance || 0) +
//           parseFloat(salary.books_periodicals_allowance || 0) +
//           parseFloat(salary.child_education_allowance || 0) +
//           parseFloat(salary.hostel_allowance || 0) +
//           parseFloat(salary.food_allowance || 0) +
//           parseFloat(salary.other_allowance || 0) +
//           parseFloat(salary.performance_bonus || 0) +
//           parseFloat(salary.annual_bonus || 0) +
//           parseFloat(salary.incentive || 0) +
//           parseFloat(salary.sales_commission || 0) +
//           parseFloat(salary.productivity_bonus || 0) +
//           parseFloat(salary.profit_linked_bonus || 0) +
//           parseFloat(salary.attendance_allowance || 0) +
//           parseFloat(salary.shift_allowance || 0) +
//           parseFloat(salary.night_shift_allowance || 0) +
//           parseFloat(salary.weekend_allowance || 0) +
//           parseFloat(salary.on_call_allowance || 0) +
//           parseFloat(salary.project_allowance || 0) +
//           parseFloat(salary.site_allowance || 0) +
//           parseFloat(salary.location_allowance || 0) +
//           parseFloat(salary.hazard_allowance || 0) +
//           parseFloat(salary.hardship_allowance || 0);
        
//         if (monthCtcAmount <= 0) {
//           console.log(`   ⚠️  WARNING: Calculated CTC is 0 or invalid - SKIPPING`);
//           console.log(`   💡 TIP: Check if salary components are filled in em_salary table`);
//           errors.push({
//             employee_id,
//             error: 'Calculated CTC is 0 (no salary components found)'
//           });
//           skipped++;
//           continue;
//         }

//         console.log(`   💰 Calculated Monthly CTC: ${monthCtcAmount.toFixed(2)}`);

//         // ✨ CALCULATE DEDUCTIONS from relevant fields
//         const monthDeductedAmount =
//           parseFloat(salary.epf_employee_contribution || 0) +
//           parseFloat(salary.esi_employee_contribution || 0) +
//           parseFloat(salary.professional_tax || 0) +
//           parseFloat(salary.labour_welfare_fund || 0) +
//           parseFloat(salary.income_tax_tds || 0) +
//           parseFloat(salary.loan_deduction || 0) +
//           parseFloat(salary.advance_salary_recovery || 0) +
//           parseFloat(salary.meal_deduction || 0) +
//           parseFloat(salary.insurance_premium_employee || 0) +
//           parseFloat(salary.late_coming_lop || 0) +
//           parseFloat(salary.notice_period_recovery || 0) +
//           parseFloat(salary.damage_penalty_deduction || 0);

//         console.log(`   💸 Total deductions: ${monthDeductedAmount.toFixed(2)}`);

//         // 8️⃣ LOP calculation
//         const perDaySalary = monthCtcAmount / totalDaysInMonth;
//         const lopAmount = unpaidDays * perDaySalary;

//         console.log(`   📉 Per day salary: ${perDaySalary.toFixed(2)}`);
//         console.log(`   📉 LOP amount: ${lopAmount.toFixed(2)}`);

//         const salaryInHand = monthCtcAmount - monthDeductedAmount - lopAmount;

//         console.log(`   💵 Salary in hand: ${salaryInHand.toFixed(2)}`);

//         // 9️⃣ Insert payslip
//         const payslipData = {
//           employee_id: parseInt(employee_id),
//           month_date: monthStart.format("YYYY-MM-DD"),
//           total_present_in_months: parseInt(paidDays),
//           total_absent_in_month: parseInt(unpaidDays),
//           month_ctc_amount: parseFloat(monthCtcAmount.toFixed(2)),
//           month_deducted_amount: parseFloat(monthDeductedAmount.toFixed(2)),
//           salary_in_hand: parseFloat(salaryInHand.toFixed(2)),
//           created_by: created_by || null,
//           created_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
//         };

//         console.log('   📝 Inserting payslip data:', payslipData);

//         await insertData(PAYSLIP_TABLE, payslipData);

//         console.log(`   ✅ Payslip generated successfully`);
//         generated++;

//       } catch (empError) {
//         console.error(`   ❌ Error processing employee ${employee_id}:`, empError);
//         errors.push({
//           employee_id,
//           error: empError.message
//         });
//         skipped++;
//       }
//     }

//     return res.json({
//       success: true,
//       message: "Monthly payslip generation completed",
//       month: monthStart.format("YYYY-MM"),
//       summary: {
//         total_employees: employees.length,
//         generated,
//         skipped,
//         errors: errors.length > 0 ? errors : undefined
//       },
//     });
//   } catch (err) {
//     console.error("❌ generateAllMonthlyPayslips Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//       stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//     });
//   }
// }

////////////////////////////////////////////////** */

// async generateAllMonthlyPayslips(req, res) {
//   try {
//     const created_by = req.user?.id || null;
//     const monthStart = dayjs().startOf("month");
//     const monthEnd = dayjs().endOf("month");
//     const totalDaysInMonth = monthEnd.date();

//     console.log("📅 Generating payslips for:", monthStart.format("YYYY-MM"));

//     const employees = await selectData("em_employees", "employee_id", "status = 'ACTIVE'");
//     if (!employees.length) return res.json({ success: true, message: "No active employees" });

//     const holidayDays = (await customSelectSqlQuery2(
//       `SELECT COUNT(*) AS holiday_days FROM em_annual_holiday WHERE holiday_date BETWEEN ? AND ?`,
//       [monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")], false
//     ))?.holiday_days || 0;

//     let generated = 0, skipped = 0, errors = [];
//     let index = 0;

//     while (index < employees.length) {
//       const employee_id = employees[index].employee_id;
      
//       try {
//         // Skip existing payslips
//         if (await selectOneData(PAYSLIP_TABLE, "payslip_id", 
//           `employee_id = ${employee_id} AND month_date = '${monthStart.format("YYYY-MM-DD")}'`)) {
//           console.log(`⏭️  Payslip exists for ${employee_id}`);
//           skipped++; index++; continue;
//         }

//         // Calculate attendance
//         const presentDays = parseInt((await customSelectSqlQuery2(
//           `SELECT COUNT(DISTINCT work_date) AS present_days FROM em_attendance WHERE employee_id = ? AND work_date BETWEEN ? AND ?`,
//           [employee_id, monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")], false
//         ))?.present_days || 0);

//         const approvedLeaveDays = parseInt((await customSelectSqlQuery2(
//           `SELECT IFNULL(SUM(DATEDIFF(LEAST(end_date,?),GREATEST(start_date,?))+1),0) AS approved_leave_days 
//            FROM em_leave_requests WHERE employee_id=? AND status='APPROVED' AND start_date<=? AND end_date>=?`,
//           [monthEnd.format("YYYY-MM-DD"), monthStart.format("YYYY-MM-DD"), employee_id, monthEnd.format("YYYY-MM-DD"), monthStart.format("YYYY-MM-DD")], false
//         ))?.approved_leave_days || 0);

//         const paidDays = presentDays + approvedLeaveDays + holidayDays;
//         const unpaidDays = Math.max(0, totalDaysInMonth - paidDays);

//         // Get LATEST salary record
//         const salary = await selectLastData("em_salary", "*", `employee_id = ${employee_id} AND last_salary_status = 'Y'`);
        
//         if (!salary) {
//           console.log(`❌ No active salary for employee ${employee_id}`);
//           skipped++; index++; continue;
//         }

//         // 🔥 COMPREHENSIVE LOGGING
//         console.log("\n" + "=".repeat(80));
//         console.log(`🔍 EMPLOYEE ID: ${employee_id} | em_salary_id: ${salary.em_salary_id}`);
//         console.log("=".repeat(80));
        
//         console.log("\n📋 COMPLETE SALARY RECORD:");
//         Object.entries(salary).forEach(([key, value]) => {
//           if (value !== null && value !== "" && value !== "0" && value !== "0.00") {
//             console.log(`  ${key}: "${value}"`);
//           }
//         });

//         // Calculate CTC
//         const ctcFields = [
//           'basic_salary', 'basic_pay', 'basic_wages', 'dearness_allowance', 'house_rent_allowance',
//           'conveyance_allowance', 'medical_allowance', 'special_allowance', 'city_compensatory_allowance',
//           'education_allowance', 'uniform_allowance', 'telephone_mobile_allowance', 'internet_allowance',
//           'fuel_allowance', 'books_periodicals_allowance', 'child_education_allowance', 'hostel_allowance',
//           'food_allowance', 'other_allowance', 'performance_bonus', 'annual_bonus', 'incentive',
//           'sales_commission', 'productivity_bonus', 'profit_linked_bonus', 'attendance_allowance',
//           'shift_allowance', 'night_shift_allowance', 'weekend_allowance', 'on_call_allowance',
//           'project_allowance', 'site_allowance', 'location_allowance', 'hazard_allowance', 'hardship_allowance'
//         ];
        
//         const monthCtcAmount = ctcFields.reduce((sum, field) => sum + parseFloat(salary[field] || 0), 0);
        
//         console.log("\n💰 CTC BREAKDOWN:");
//         ctcFields.forEach(field => {
//           const value = parseFloat(salary[field] || 0);
//           if (value > 0) console.log(`  ✅ ${field}: ${value.toFixed(2)}`);
//         });
//         console.log(`  🎯 TOTAL CTC: ${monthCtcAmount.toFixed(2)}`);

//         // 🔥 EMPLOYEE DEDUCTIONS (for em_payslip_deductions table)
//         const employeeDeductions = {
//           epf_employee_contribution: parseFloat(salary.epf_employee_contribution || 0),
//           esi_employee_contribution: parseFloat(salary.esi_employee_contribution || 0),
//           professional_tax: parseFloat(salary.professional_tax || 0),
//           labour_welfare_fund: parseFloat(salary.labour_welfare_fund || 0),
//           income_tax_tds: parseFloat(salary.income_tax_tds || 0),
//           loan_deduction: parseFloat(salary.loan_deduction || 0),
//           advance_salary_recovery: parseFloat(salary.advance_salary_recovery || 0),
//           meal_deduction: parseFloat(salary.meal_deduction || 0),
//           insurance_premium_employee: parseFloat(salary.insurance_premium_employee || 0),
//           late_coming_lop: parseFloat(salary.late_coming_lop || 0),
//           notice_period_recovery: parseFloat(salary.notice_period_recovery || 0),
//           damage_penalty_deduction: parseFloat(salary.damage_penalty_deduction || 0)
//         };

//         const employeeDeductionsTotal = Object.values(employeeDeductions).reduce((sum, val) => sum + val, 0);

//         // 🔥 EMPLOYER CONTRIBUTIONS (separate calculation)
//         const employerContributions = {
//           epf_employer_contribution: parseFloat(salary.epf_employer_contribution || 0),
//           esi_employer_contribution: parseFloat(salary.esi_employer_contribution || 0),
//           insurance_premium_employer: parseFloat(salary.insurance_premium_employer || 0),
//           gratuity_employer: parseFloat(salary.gratuity_employer || 0)
//         };

//         const employerContributionsTotal = Object.values(employerContributions).reduce((sum, val) => sum + val, 0);

//         // 🔥 TOTAL DEDUCTIONS (employee + employer)
//         const monthDeductedAmount = employeeDeductionsTotal + employerContributionsTotal;

//         console.log("\n📊 EMPLOYEE DEDUCTIONS:");
//         Object.entries(employeeDeductions).forEach(([key, value]) => {
//           if (value > 0) console.log(`  ✅ ${key}: ${value.toFixed(2)}`);
//         });
//         console.log(`  💵 Employee Deductions Total: ${employeeDeductionsTotal.toFixed(2)}`);

//         console.log("\n🏢 EMPLOYER CONTRIBUTIONS:");
//         Object.entries(employerContributions).forEach(([key, value]) => {
//           if (value > 0) console.log(`  ✅ ${key}: ${value.toFixed(2)}`);
//         });
//         console.log(`  💼 Employer Contributions Total: ${employerContributionsTotal.toFixed(2)}`);

//         console.log(`\n💸 TOTAL DEDUCTIONS (Employee + Employer): ${monthDeductedAmount.toFixed(2)}`);

//         const perDaySalary = totalDaysInMonth > 0 ? monthCtcAmount / totalDaysInMonth : 0;
//         const lopAmount = unpaidDays * perDaySalary;
//         const salaryInHand = monthCtcAmount - monthDeductedAmount - lopAmount;

//         console.log("\n🧮 FINAL CALCULATION:");
//         console.log(`  CTC: ${monthCtcAmount.toFixed(2)}`);
//         console.log(`  Employee Deductions: -${employeeDeductionsTotal.toFixed(2)}`);
//         console.log(`  Employer Contributions: -${employerContributionsTotal.toFixed(2)}`);
//         console.log(`  Total Deductions: -${monthDeductedAmount.toFixed(2)}`);
//         console.log(`  LOP (${unpaidDays} days): -${lopAmount.toFixed(2)}`);
//         console.log(`  💵 SALARY IN HAND: ${salaryInHand.toFixed(2)}`);

//         // Insert payslip
//         const payslip_id = await insertData(PAYSLIP_TABLE, {
//           employee_id: parseInt(employee_id),
//           month_date: monthStart.format("YYYY-MM-DD"),
//           total_present_in_months: paidDays,
//           total_absent_in_month: unpaidDays,
//           month_ctc_amount: parseFloat(monthCtcAmount.toFixed(2)),
//           month_deducted_amount: parseFloat(monthDeductedAmount.toFixed(2)),
//           salary_in_hand: parseFloat(salaryInHand.toFixed(2)),
//           created_by: created_by || null,
//           created_at: dayjs().format("YYYY-MM-DD HH:mm:ss")
//         });

//         console.log(`\n✅ PAYSLIP INSERTED: payslip_id=${payslip_id}`);

//         // Insert employee deductions ONLY (not employer contributions)
//         await insertData("em_payslip_deductions", {
//           payslip_id: parseInt(payslip_id),
//           employee_id: parseInt(employee_id),
//           month_date: monthStart.format("YYYY-MM-DD"),
//           ...employeeDeductions,
//           total_deducted_amount: parseFloat(employeeDeductionsTotal.toFixed(2)),
//           created_by: created_by || null,
//           created_at: dayjs().format("YYYY-MM-DD HH:mm:ss")
//         });

//         console.log(`✅ DEDUCTIONS INSERTED for payslip_id=${payslip_id}`);
//         console.log("=".repeat(80) + "\n");
        
//         generated++;

//       } catch (err) {
//         console.error(`\n❌ ERROR for employee ${employee_id}:`, err.message);
//         console.error(err.stack);
//         errors.push({ employee_id, error: err.message });
//         skipped++;
//       }
//       index++;
//     }

//     console.log("\n" + "🎉".repeat(40));
//     console.log("GENERATION COMPLETE");
//     console.log("🎉".repeat(40));
//     console.log(`Total Employees: ${employees.length}`);
//     console.log(`✅ Generated: ${generated}`);
//     console.log(`⏭️  Skipped: ${skipped}`);
//     console.log(`❌ Errors: ${errors.length}`);
//     if (errors.length > 0) {
//       console.log("\nError Details:");
//       errors.forEach(err => console.log(`  Employee ${err.employee_id}: ${err.error}`));
//     }

//     res.json({
//       success: true,
//       message: "Payslip generation completed",
//       summary: { total: employees.length, generated, skipped, errors: errors.length },
//       errorDetails: errors
//     });

//   } catch (err) {
//     console.error("💥 FATAL ERROR:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// }

// ///////////////////////
// async generateAllMonthlyPayslips(req, res) {
//   try {
//     const created_by = req.user?.id || null;
//     const monthStart = dayjs().startOf("month");
//     const monthEnd = dayjs().endOf("month");
//     const totalDaysInMonth = monthEnd.date();

//     // console.log("📅 Generating payslips for:", monthStart.format("YYYY-MM"));

//     const employees = await selectData("em_employees", "employee_id", "status = 'ACTIVE'");
//     if (!employees.length) return res.json({ success: true, message: "No active employees" });

//     const holidayDays = (await customSelectSqlQuery2(
//       `SELECT COUNT(*) AS holiday_days FROM em_annual_holiday WHERE holiday_date BETWEEN ? AND ?`,
//       [monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")], false
//     ))?.holiday_days || 0;

//     let generated = 0, skipped = 0, errors = [];
//     let index = 0;

//     while (index < employees.length) {
//       const employee_id = employees[index].employee_id;
      
//       try {
//         // Skip existing payslips
//         if (await selectOneData(PAYSLIP_TABLE, "payslip_id", 
//           `employee_id = ${employee_id} AND month_date = '${monthStart.format("YYYY-MM-DD")}'`)) {
//           // console.log(`⏭️  Payslip exists for ${employee_id}`);
//           skipped++; index++; continue;
//         }

//         // Calculate attendance
//         const presentDays = parseInt((await customSelectSqlQuery2(
//           `SELECT COUNT(DISTINCT work_date) AS present_days FROM em_attendance WHERE employee_id = ? AND work_date BETWEEN ? AND ?`,
//           [employee_id, monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")], false
//         ))?.present_days || 0);

//         const approvedLeaveDays = parseInt((await customSelectSqlQuery2(
//           `SELECT IFNULL(SUM(DATEDIFF(LEAST(end_date,?),GREATEST(start_date,?))+1),0) AS approved_leave_days 
//            FROM em_leave_requests WHERE employee_id=? AND status='APPROVED' AND start_date<=? AND end_date>=?`,
//           [monthEnd.format("YYYY-MM-DD"), monthStart.format("YYYY-MM-DD"), employee_id, monthEnd.format("YYYY-MM-DD"), monthStart.format("YYYY-MM-DD")], false
//         ))?.approved_leave_days || 0);

//         const paidDays = presentDays + approvedLeaveDays + holidayDays;
//         const unpaidDays = Math.max(0, totalDaysInMonth - paidDays);

//         // Get LATEST salary record
//         const salary = await selectLastData("em_salary", "*", `employee_id = ${employee_id} AND last_salary_status = 'Y'`);
        
//         if (!salary) {
//           // console.log(`❌ No active salary for employee ${employee_id}`);
//           skipped++; index++; continue;
//         }

//         // COMPREHENSIVE LOGGING - COMMENTED FOR PRODUCTION
//         // console.log("\n" + "=".repeat(80));
//         // console.log(`🔍 EMPLOYEE ID: ${employee_id} | em_salary_id: ${salary.em_salary_id}`);
//         // console.log("=".repeat(80));
        
//         // console.log("\n📋 COMPLETE SALARY RECORD:");
//         // Object.entries(salary).forEach(([key, value]) => {
//         //   if (value !== null && value !== "" && value !== "0" && value !== "0.00") {
//         //     console.log(`  ${key}: "${value}"`);
//         //   }
//         // });

//         // Calculate CTC
//         const ctcFields = [
//           'basic_salary', 'basic_pay', 'basic_wages', 'dearness_allowance', 'house_rent_allowance',
//           'conveyance_allowance', 'medical_allowance', 'special_allowance', 'city_compensatory_allowance',
//           'education_allowance', 'uniform_allowance', 'telephone_mobile_allowance', 'internet_allowance',
//           'fuel_allowance', 'books_periodicals_allowance', 'child_education_allowance', 'hostel_allowance',
//           'food_allowance', 'other_allowance', 'performance_bonus', 'annual_bonus', 'incentive',
//           'sales_commission', 'productivity_bonus', 'profit_linked_bonus', 'attendance_allowance',
//           'shift_allowance', 'night_shift_allowance', 'weekend_allowance', 'on_call_allowance',
//           'project_allowance', 'site_allowance', 'location_allowance', 'hazard_allowance', 'hardship_allowance'
//         ];
        
//         const monthCtcAmount = ctcFields.reduce((sum, field) => sum + parseFloat(salary[field] || 0), 0);
        
//         // console.log("\n💰 CTC BREAKDOWN:");
//         // ctcFields.forEach(field => {
//         //   const value = parseFloat(salary[field] || 0);
//         //   if (value > 0) console.log(`  ✅ ${field}: ${value.toFixed(2)}`);
//         // });
//         // console.log(`  🎯 TOTAL CTC: ${monthCtcAmount.toFixed(2)}`);

//         // EMPLOYEE DEDUCTIONS (for em_payslip_deductions table)
//         const employeeDeductions = {
//           epf_employee_contribution: parseFloat(salary.epf_employee_contribution || 0),
//           esi_employee_contribution: parseFloat(salary.esi_employee_contribution || 0),
//           professional_tax: parseFloat(salary.professional_tax || 0),
//           labour_welfare_fund: parseFloat(salary.labour_welfare_fund || 0),
//           income_tax_tds: parseFloat(salary.income_tax_tds || 0),
//           loan_deduction: parseFloat(salary.loan_deduction || 0),
//           advance_salary_recovery: parseFloat(salary.advance_salary_recovery || 0),
//           meal_deduction: parseFloat(salary.meal_deduction || 0),
//           insurance_premium_employee: parseFloat(salary.insurance_premium_employee || 0),
//           late_coming_lop: parseFloat(salary.late_coming_lop || 0),
//           notice_period_recovery: parseFloat(salary.notice_period_recovery || 0),
//           damage_penalty_deduction: parseFloat(salary.damage_penalty_deduction || 0)
//         };

//         const employeeDeductionsTotal = Object.values(employeeDeductions).reduce((sum, val) => sum + val, 0);

//         // EMPLOYER CONTRIBUTIONS (separate calculation)
//         const employerContributions = {
//           epf_employer_contribution: parseFloat(salary.epf_employer_contribution || 0),
//           esi_employer_contribution: parseFloat(salary.esi_employer_contribution || 0),
//           insurance_premium_employer: parseFloat(salary.insurance_premium_employer || 0),
//           gratuity_employer: parseFloat(salary.gratuity_employer || 0)
//         };

//         const employerContributionsTotal = Object.values(employerContributions).reduce((sum, val) => sum + val, 0);

//         // TOTAL DEDUCTIONS (employee + employer)
//         const monthDeductedAmount = employeeDeductionsTotal + employerContributionsTotal;

//         // console.log("\n📊 EMPLOYEE DEDUCTIONS:");
//         // Object.entries(employeeDeductions).forEach(([key, value]) => {
//         //   if (value > 0) console.log(`  ✅ ${key}: ${value.toFixed(2)}`);
//         // });
//         // console.log(`  💵 Employee Deductions Total: ${employeeDeductionsTotal.toFixed(2)}`);

//         // console.log("\n🏢 EMPLOYER CONTRIBUTIONS:");
//         // Object.entries(employerContributions).forEach(([key, value]) => {
//         //   if (value > 0) console.log(`  ✅ ${key}: ${value.toFixed(2)}`);
//         // });
//         // console.log(`  💼 Employer Contributions Total: ${employerContributionsTotal.toFixed(2)}`);

//         // console.log(`\n💸 TOTAL DEDUCTIONS (Employee + Employer): ${monthDeductedAmount.toFixed(2)}`);

//         const perDaySalary = totalDaysInMonth > 0 ? monthCtcAmount / totalDaysInMonth : 0;
//         const lopAmount = unpaidDays * perDaySalary;
//         const salaryInHand = monthCtcAmount - monthDeductedAmount - lopAmount;

//         // console.log("\n🧮 FINAL CALCULATION:");
//         // console.log(`  CTC: ${monthCtcAmount.toFixed(2)}`);
//         // console.log(`  Employee Deductions: -${employeeDeductionsTotal.toFixed(2)}`);
//         // console.log(`  Employer Contributions: -${employerContributionsTotal.toFixed(2)}`);
//         // console.log(`  Total Deductions: -${monthDeductedAmount.toFixed(2)}`);
//         // console.log(`  LOP (${unpaidDays} days): -${lopAmount.toFixed(2)}`);
//         // console.log(`  💵 SALARY IN HAND: ${salaryInHand.toFixed(2)}`);

//         // Insert payslip
//         const payslip_id = await insertData(PAYSLIP_TABLE, {
//           employee_id: parseInt(employee_id),
//           month_date: monthStart.format("YYYY-MM-DD"),
//           total_present_in_months: paidDays,
//           total_absent_in_month: unpaidDays,
//           month_ctc_amount: parseFloat(monthCtcAmount.toFixed(2)),
//           month_deducted_amount: parseFloat(monthDeductedAmount.toFixed(2)),
//           salary_in_hand: parseFloat(salaryInHand.toFixed(2)),
//           created_by: created_by || null,
//           created_at: dayjs().format("YYYY-MM-DD HH:mm:ss")
//         });

//         // console.log(`\n✅ PAYSLIP INSERTED: payslip_id=${payslip_id}`);

//         // Insert employee deductions ONLY (not employer contributions)
//         await insertData("em_payslip_deductions", {
//           payslip_id: parseInt(payslip_id),
//           employee_id: parseInt(employee_id),
//           month_date: monthStart.format("YYYY-MM-DD"),
//           ...employeeDeductions,
//           total_deducted_amount: parseFloat(employeeDeductionsTotal.toFixed(2)),
//           created_by: created_by || null,
//           created_at: dayjs().format("YYYY-MM-DD HH:mm:ss")
//         });

//         // console.log(`✅ DEDUCTIONS INSERTED for payslip_id=${payslip_id}`);
//         // console.log("=".repeat(80) + "\n");
        
//         generated++;

//       } catch (err) {
//         console.error(`❌ ERROR for employee ${employee_id}:`, err.message); // Keep error logs
//         // console.error(err.stack); // Commented stack trace for production
//         errors.push({ employee_id, error: err.message });
//         skipped++;
//       }
//       index++;
//     }

//     // console.log("\n" + "🎉".repeat(40));
//     // console.log("GENERATION COMPLETE");
//     // console.log("🎉".repeat(40));
//     // console.log(`Total Employees: ${employees.length}`);
//     // console.log(`✅ Generated: ${generated}`);
//     // console.log(`⏭️  Skipped: ${skipped}`);
//     // console.log(`❌ Errors: ${errors.length}`);
//     // if (errors.length > 0) {
//     //   console.log("\nError Details:");
//     //   errors.forEach(err => console.log(`  Employee ${err.employee_id}: ${err.error}`));
//     // }

//     res.json({
//       success: true,
//       message: "Payslip generation completed",
//       summary: { total: employees.length, generated, skipped, errors: errors.length },
//       errorDetails: errors
//     });

//   } catch (err) {
//     console.error("💥 FATAL ERROR:", err); // Keep fatal error logs
//     res.status(500).json({ success: false, message: err.message });
//   }
// }


async generateAllMonthlyPayslips(req, res) {
  try {
    const created_by = req.user?.id || null;

    const monthStart = dayjs().startOf("month");
    const monthEnd = dayjs().endOf("month");
    const totalDaysInMonth = monthEnd.date();

    const employees = await selectData(
      "em_employees",
      "employee_id",
      "status = 'ACTIVE'"
    );

    if (!employees.length) {
      return res.json({ success: true, message: "No active employees" });
    }

    //  Holiday count
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

        //  Employee deductions (salary impact)
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

        //  Employer contributions (NO salary impact)
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

    return res.json({
      success: true,
      message: "Payslip generation completed",
      summary: { total: employees.length, generated, skipped, errors: errors.length },
      errors
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// async getPayslipsByDateRange(req, res) {
//   try {
//     const { fromDate, toDate } = req.body;

//     if (!fromDate || !toDate) {
//       return res.status(400).json({
//         success: false,
//         message: "fromDate and toDate are required"
//       });
//     }

//     // ✅ EXPLICIT FORMAT PARSING (THIS FIXES EVERYTHING)
//     const startDate = dayjs(fromDate, "DD/MM/YYYY", true);
//     const endDate   = dayjs(toDate, "DD/MM/YYYY", true);

//     if (!startDate.isValid() || !endDate.isValid()) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid date format. Use DD/MM/YYYY"
//       });
//     }

//     const sqlStartDate = startDate
//       .startOf("day")
//       .format("YYYY-MM-DD HH:mm:ss");

//     const sqlEndDate = endDate
//       .endOf("day")
//       .format("YYYY-MM-DD HH:mm:ss");

//     const sql = `
//       SELECT 
//         ps.payslip_id,
//         ps.employee_id,
//         ps.month_date,
//         ps.total_present_in_months,
//         ps.total_absent_in_month,
//         ps.month_ctc_amount,
//         ps.lop_amount,
//         ps.month_deducted_amount,
//         ps.salary_in_hand,

//         pd.epf_employee_contribution,
//         pd.esi_employee_contribution,
//         pd.epf_employer_contribution,
//         pd.esi_employer_contribution,
//         pd.professional_tax,
//         pd.labour_welfare_fund,
//         pd.income_tax_tds,
//         pd.loan_deduction,
//         pd.advance_salary_recovery,
//         pd.meal_deduction,
//         pd.insurance_premium_employee,
//         pd.late_coming_lop,
//         pd.notice_period_recovery,
//         pd.damage_penalty_deduction,
//         pd.total_deducted_amount

//       FROM em_payslips ps
//       LEFT JOIN em_payslip_deductions pd
//         ON ps.payslip_id = pd.payslip_id
//       WHERE ps.month_date BETWEEN ? AND ?
//       ORDER BY ps.month_date DESC
//     `;

//     const data = await customSelectSqlQuery2(
//       sql,
//       [sqlStartDate, sqlEndDate],
//       true
//     );

//     return res.json({
//       success: true,
//       count: data.length,
//       data
//     });

//   } catch (err) {
//     console.error("❌ getPayslipsByDateRange:", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// }



async getPayslipsByDateRange(req, res) {
  try {
    const { fromDate, toDate } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "fromDate and toDate are required"
      });
    }

    const startDate = dayjs(fromDate, "DD/MM/YYYY", true);
    const endDate   = dayjs(toDate, "DD/MM/YYYY", true);

    if (!startDate.isValid() || !endDate.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use DD/MM/YYYY"
      });
    }

    const sqlStartDate = startDate.startOf("day").format("YYYY-MM-DD HH:mm:ss");
    const sqlEndDate   = endDate.endOf("day").format("YYYY-MM-DD HH:mm:ss");

    const sql = `
      SELECT 
        ps.payslip_id,
        ps.employee_id,

        -- EMPLOYEE DETAILS
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.email AS employee_email,
        e.phone AS employee_phone,

        ps.month_date,
        ps.total_present_in_months,
        ps.total_absent_in_month,
        ps.month_ctc_amount,
        ps.lop_amount,
        ps.month_deducted_amount,
        ps.salary_in_hand,

        pd.epf_employee_contribution,
        pd.esi_employee_contribution,
        pd.epf_employer_contribution,
        pd.esi_employer_contribution,
        pd.professional_tax,
        pd.labour_welfare_fund,
        pd.income_tax_tds,
        pd.loan_deduction,
        pd.advance_salary_recovery,
        pd.meal_deduction,
        pd.insurance_premium_employee,
        pd.late_coming_lop,
        pd.notice_period_recovery,
        pd.damage_penalty_deduction,
        pd.total_deducted_amount

      FROM em_payslips ps
      LEFT JOIN em_payslip_deductions pd
        ON ps.payslip_id = pd.payslip_id

      -- 👇 JOIN EMPLOYEES TABLE
      LEFT JOIN em_employees e
        ON ps.employee_id = e.employee_id

      WHERE ps.month_date BETWEEN ? AND ?
      ORDER BY ps.month_date DESC
    `;

    const data = await customSelectSqlQuery2(
      sql,
      [sqlStartDate, sqlEndDate],
      true
    );

    return res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (err) {
    console.error("❌ getPayslipsByDateRange:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
}


////////////////////////////////////////////////////////


// async getPayslipById(req, res) {
//   try {
//     const { payslip_id } = req.params;

//     const data = await customSelectSqlQuery2(
//       `
//       SELECT 
//         ps.*,
//         pd.*
//       FROM em_payslips ps
//       LEFT JOIN em_payslip_deductions pd
//         ON ps.payslip_id = pd.payslip_id
//       WHERE ps.payslip_id = ?
//       `,
//       [payslip_id],
//       false
//     );

//     if (!data) {
//       return res.status(404).json({
//         success: false,
//         message: "Payslip not found"
//       });
//     }

//     return res.json({
//       success: true,
//       data
//     });

//   } catch (err) {
//     console.error("❌ getPayslipById:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// }


async getPayslipById(req, res) {
  try {
    const { payslip_id } = req.params;

    // First, let's check what the actual payslip data looks like
    const debugData = await customSelectSqlQuery2(
      `SELECT * FROM em_payslips WHERE payslip_id = ?`,
      [payslip_id],
      false
    );
    console.log("Payslip data:", debugData);

    const data = await customSelectSqlQuery2(
      `
      SELECT 
        ps.*,
        pd.*,

        -- EMPLOYEE DETAILS
        e.employee_id,
        e.first_name,
        e.middle_name,
        e.last_name,
        CONCAT(e.first_name, ' ', COALESCE(e.middle_name, ''), ' ', e.last_name) AS employee_name,
        e.email,
        e.phone,
        e.hire_date,
        e.department,
        e.job_title,
        e.em_id,
        e.employee_dob,
        e.employee_address,
        e.date_of_joining,

        -- BANK DETAILS
        e.bank_name,
        e.bank_account_no,
        e.ifsc_no,
        e.pf_account_no

      FROM em_payslips ps
      LEFT JOIN em_payslip_deductions pd
        ON ps.payslip_id = pd.payslip_id

      LEFT JOIN em_employees e
        ON ps.employee_id = e.employee_id
        -- If the above JOIN doesn't work, try one of these instead:
        -- ON ps.user_id = e.user_id
        -- OR check what field em_payslips actually uses to reference employees

      WHERE ps.payslip_id = ?
      `,
      [payslip_id],
      false
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found"
      });
    }

    console.log("Final data:", data);

    return res.json({
      success: true,
      data
    });

  } catch (err) {
    console.error("❌ getPayslipById:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

/////////
async getMyPayslipByMonth(req, res) {
  try {
    // ✅ Extract user id from token (set by authcheck middleware)
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user ID found in token"
      });
    }

    const { month } = req.body;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: "month is required (format: MM/YYYY)"
      });
    }

    // Parse month
    let parsedMonth = dayjs(month, "MM/YYYY", true);
    if (!parsedMonth.isValid()) {
      parsedMonth = dayjs(month, "YYYY-MM", true);
    }

    if (!parsedMonth.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid month format. Use MM/YYYY or YYYY-MM"
      });
    }

    const monthDate = parsedMonth.startOf("month").format("YYYY-MM-DD");

    // ✅ Find employee using user_id from users table
    const employee = await selectOneData(
      "em_employees",
      "employee_id",
      `user_id = ${user_id}`
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "No employee record found for this user"
      });
    }

    const employee_id = employee.employee_id;

    // Fetch payslip with full details
    const data = await customSelectSqlQuery2(
      `
      SELECT
        -- PAYSLIP CORE
        ps.payslip_id,
        ps.employee_id,
        ps.month_date,
        ps.total_present_in_months,
        ps.total_absent_in_month,
        ps.month_ctc_amount,
        ps.lop_amount,
        ps.month_deducted_amount,
        ps.salary_in_hand,

        -- DEDUCTIONS
        pd.epf_employee_contribution,
        pd.esi_employee_contribution,
        pd.epf_employer_contribution,
        pd.esi_employer_contribution,
        pd.professional_tax,
        pd.labour_welfare_fund,
        pd.income_tax_tds,
        pd.loan_deduction,
        pd.advance_salary_recovery,
        pd.meal_deduction,
        pd.insurance_premium_employee,
        pd.late_coming_lop,
        pd.notice_period_recovery,
        pd.damage_penalty_deduction,
        pd.total_deducted_amount,

        -- EMPLOYEE DETAILS
        e.employee_id,
        e.first_name,
        e.middle_name,
        e.last_name,
        CONCAT(e.first_name, ' ', COALESCE(e.middle_name, ''), ' ', e.last_name) AS employee_name,
        e.email,
        e.phone,
        e.hire_date,
        e.department,
        e.job_title,
        e.em_id,
        e.employee_dob,
        e.employee_address,
        e.date_of_joining,

        -- BANK DETAILS
        e.bank_name,
        e.bank_account_no,
        e.ifsc_no,
        e.pf_account_no

      FROM em_payslips ps
      LEFT JOIN em_payslip_deductions pd
        ON ps.payslip_id = pd.payslip_id
      LEFT JOIN em_employees e
        ON ps.employee_id = e.employee_id
      WHERE ps.employee_id = ?
        AND ps.month_date = ?
      `,
      [employee_id, monthDate],
      false
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: `No payslip found for ${parsedMonth.format("MMMM YYYY")}`
      });
    }

    return res.json({
      success: true,
      data
    });

  } catch (err) {
    console.error("❌ getMyPayslipByMonth:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

////

async deletePayslipById(req, res) {
  try {
    const { payslip_id } = req.params;

    if (!payslip_id) {
      return res.status(400).json({
        success: false,
        message: "payslip_id is required in URL"
      });
    }

    // 1️⃣ delete deductions
    await deleteData(
      "em_payslip_deductions",
      `payslip_id = ${payslip_id}`
    );

    // 2️⃣ delete payslip
    const deleted = await deleteData(
      "em_payslips",
      `payslip_id = ${payslip_id}`
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found"
      });
    }

    return res.json({
      success: true,
      message: "Payslip deleted successfully"
    });

  } catch (err) {
    console.error("❌ deletePayslipById:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

////////




async updatePayslipById(req, res) {
  try {
    const { payslip_id } = req.params;

    if (!payslip_id) {
      return res.status(400).json({
        success: false,
        message: "payslip_id is required in URL"
      });
    }

    /* ===============================
       FIELD DEFINITIONS
    =============================== */

    const payslipFields = [
      "total_present_in_months",
      "total_absent_in_month",
      "month_ctc_amount",
      "lop_amount",
      "month_deducted_amount",
      "salary_in_hand"
    ];

    const deductionFields = [
      "epf_employee_contribution",
      "esi_employee_contribution",
      "epf_employer_contribution",
      "esi_employer_contribution",
      "professional_tax",
      "labour_welfare_fund",
      "income_tax_tds",
      "loan_deduction",
      "advance_salary_recovery",
      "meal_deduction",
      "insurance_premium_employee",
      "late_coming_lop",
      "notice_period_recovery",
      "damage_penalty_deduction",
      "total_deducted_amount"
    ];

    /* ===============================
       BUILD UPDATE PAYLOADS (BATCH)
    =============================== */

    const payslipUpdateData = {};
    payslipFields.forEach(field => {
      if (req.body[field] !== undefined) {
        payslipUpdateData[field] = req.body[field];
      }
    });

    if (Object.keys(payslipUpdateData).length > 0) {
      payslipUpdateData.updated_at = dayjs().format("YYYY-MM-DD HH:mm:ss");
    }

    const deductionUpdateData = {};
    deductionFields.forEach(field => {
      if (req.body[field] !== undefined) {
        deductionUpdateData[field] = req.body[field];
      }
    });

    if (
      Object.keys(payslipUpdateData).length === 0 &&
      Object.keys(deductionUpdateData).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update"
      });
    }

    /* ===============================
       BATCH EXECUTION
    =============================== */

    const updateTasks = [];

    if (Object.keys(payslipUpdateData).length > 0) {
      updateTasks.push(
        updateData(
          "em_payslips",
          payslipUpdateData,
          `payslip_id = ${payslip_id}`
        )
      );
    }

    if (Object.keys(deductionUpdateData).length > 0) {
      updateTasks.push(
        updateData(
          "em_payslip_deductions",
          deductionUpdateData,
          `payslip_id = ${payslip_id}`
        )
      );
    }

    // 🔥 Execute as a batch
    await Promise.all(updateTasks);

    return res.json({
      success: true,
      message: "Payslip updated successfully"
    });

  } catch (err) {
    console.error("❌ updatePayslipById:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
}



}

module.exports = new employeePaySlipController();