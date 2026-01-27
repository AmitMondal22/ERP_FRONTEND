// const {
//   insertData,
//   selectData,
//   selectOneData,
//   updateData,
//   deleteData,
//   customSelectSqlQuery,
// } = require("../models/MasterModel");

// const table = "em_payslips";

// class employeePaySlipeController {
 
//   //  Create a new payslip
//   async createPayslip(req, res) {
//     try {
//       const {employee_id,pay_period_start,pay_period_end,base_salary,
//         allowance,
//         overtime_pay,
//         bonus,
//         deductions,
//         tax,
//         net_salary,
//         issue_date,
//       } = req.body;

//       // --- Validation ---
//       if (!employee_id || !pay_period_start || !pay_period_end || !net_salary) {
//         return res.status(400).json({
//           success: false,
//           message: "employee_id, pay_period_start, pay_period_end, and net_salary are required",
//         });
//       }

//       const data = {
//         employee_id,
//         pay_period_start,
//         pay_period_end,
//         base_salary: base_salary || 0,
//         allowance: allowance || 0,
//         overtime_pay: overtime_pay || 0,
//         bonus: bonus || 0,
//         deductions: deductions || 0,
//         tax: tax || 0,
//         net_salary,
//         issue_date: issue_date || new Date(),
//       };

//       const insertId = await insertData(table, data);

//       res.status(201).json({
//         success: true,
//         message: "Payslip created successfully",
//         payslip_id: insertId,
//       });
//     } catch (err) {
//       console.error("createPayslip Error:", err);
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }

//   // ✅ Get all payslips

// //   async getAllPayslips(req, res) {
// //     try {
// //       const rows = await selectData(table, "*", null, "payslip_id DESC");

// //       res.json({ success: true, data: rows });
// //     } catch (err) {
// //       console.error("getAllPayslips Error:", err);
// //       res.status(500).json({ success: false, message: err.message });
// //     }
// //   }

// // ✅ Get all payslips with employee name

// async getAllPayslips(req, res) {
//   try {
//     const sql = `
//       SELECT 
//         p.payslip_id,
//         p.employee_id,
//         CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
//         p.pay_period_start,
//         p.pay_period_end,
//         p.base_salary,
//         p.allowance,
//         p.overtime_pay,
//         p.bonus,
//         p.deductions,
//         p.tax,
//         p.net_salary,
//         p.issue_date
//       FROM ${table} p
//       LEFT JOIN em_employees e ON p.employee_id = e.employee_id
//       ORDER BY p.payslip_id DESC
//     `;

//     const rows = await customSelectSqlQuery(sql);

//     res.json({
//       success: true,
//       data: rows,
//     });
//   } catch (err) {
//     console.error("getAllPayslips Error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// }




//   // ✅ Get single payslip by ID
//   async getPayslipById(req, res) {
//     try {
//       const { id } = req.params;
//       const row = await selectOneData(table, "*", `payslip_id = ${id}`);
//       if (!row) {
//         return res.status(404).json({ success: false, message: "Payslip not found" });
//       }
//       res.json({ success: true, data: row });
//     } catch (err) {
//       console.error("getPayslipById Error:", err);
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }

//   // ✅ Update payslip
//   async updatePayslip(req, res) {
//     try {
//       const { id } = req.params;
//       const {
//         employee_id,
//         pay_period_start,
//         pay_period_end,
//         base_salary,
//         allowance,
//         overtime_pay,
//         bonus,
//         deductions,
//         tax,
//         net_salary,
//         issue_date,
//       } = req.body;

//       const existing = await selectOneData(table, "*", `payslip_id = ${id}`);
//       if (!existing) {
//         return res.status(404).json({ success: false, message: "Payslip not found" });
//       }

//       const updateFields = {};
//       if (employee_id) updateFields.employee_id = employee_id;
//       if (pay_period_start) updateFields.pay_period_start = pay_period_start;
//       if (pay_period_end) updateFields.pay_period_end = pay_period_end;
//       if (base_salary !== undefined) updateFields.base_salary = base_salary;
//       if (allowance !== undefined) updateFields.allowance = allowance;
//       if (overtime_pay !== undefined) updateFields.overtime_pay = overtime_pay;
//       if (bonus !== undefined) updateFields.bonus = bonus;
//       if (deductions !== undefined) updateFields.deductions = deductions;
//       if (tax !== undefined) updateFields.tax = tax;
//       if (net_salary !== undefined) updateFields.net_salary = net_salary;
//       if (issue_date) updateFields.issue_date = issue_date;

//       const affected = await updateData(table, updateFields, `payslip_id = ${id}`);

//       res.json({
//         success: true,
//         message: "Payslip updated successfully",
//         affected,
//       });
//     } catch (err) {
//       console.error("updatePayslip Error:", err);
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }

//   // ✅ Delete payslip
//   async deletePayslip(req, res) {
//     try {
//       const { id } = req.params;
//       const existing = await selectOneData(table, "*", `payslip_id = ${id}`);
//       if (!existing) { 
//         return res.status(404).json({ success: false, message: "Payslip not found" });
//       }

//       await deleteData(table, `payslip_id = ${id}`);

//       res.json({ success: true, message: "Payslip deleted successfully" });
//     } catch (err) {
//       console.error("deletePayslip Error:", err);
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }
// }

// module.exports = new employeePaySlipeController();



// const dayjs = require("dayjs");
// const {
//   selectData,
//   selectOneData,
//   customSelectSqlQuery,
//   insertData,
//   customSelectSqlQuery2
// } = require("../models/MasterModel");

// const PAYSLIP_TABLE = "em_payslips";

// class employeePaySlipController {

//   // 🔥 Generate payslips for ALL employees (current month)
//   // async generateAllMonthlyPayslips(req, res) {
//   //   try {
//   //     const created_by = req.user?.id || 1; // fallback system user

//   //     // 📅 Current month
//   //     const monthStart = dayjs().startOf("month");
//   //     const monthEnd = dayjs().endOf("month");
//   //     const totalDaysInMonth = monthEnd.date();

//   //     // 1️⃣ Get all active employees
//   //     const employees = await selectData(
//   //       "em_employees",
//   //       "employee_id",
//   //       "status = 'ACTIVE'"
//   //     );

//   //     if (!employees.length) {
//   //       return res.json({
//   //         success: true,
//   //         message: "No active employees found",
//   //       });
//   //     }

//   //     let generated = 0;
//   //     let skipped = 0;

//   //     // 2️⃣ Company holidays (once)
//   //     const holidaySql = `
//   //       SELECT COUNT(*) AS holiday_days
//   //       FROM em_annual_holiday
//   //       WHERE holiday_date BETWEEN
//   //       '${monthStart.format("YYYY-MM-DD")}'
//   //       AND '${monthEnd.format("YYYY-MM-DD")}'
//   //     `;
//   //     const [holidayRow] = await customSelectSqlQuery(holidaySql);
//   //     const holidayDays = holidayRow?.holiday_days || 0;

//   //     for (const emp of employees) {
//   //       const employee_id = emp.employee_id;

//   //       // 🚫 Skip if payslip already generated
//   //       const existing = await selectOneData(
//   //         PAYSLIP_TABLE,
//   //         "payslip_id",
//   //         `employee_id = ${employee_id}
//   //          AND month_date = '${monthStart.format("YYYY-MM-DD")}'`
//   //       );

//   //       if (existing) {
//   //         skipped++;
//   //         continue;
//   //       }

//   //       // 3️⃣ Present days
//   //       const presentSql = `
//   //         SELECT COUNT(DISTINCT attendance_date) AS present_days
//   //         FROM em_attendance
//   //         WHERE employee_id = ${employee_id}
//   //         AND attendance_date BETWEEN
//   //         '${monthStart.format("YYYY-MM-DD")}'
//   //         AND '${monthEnd.format("YYYY-MM-DD")}'
//   //       `;
//   //       const [presentRow] = await customSelectSqlQuery(presentSql);
//   //       const presentDays = presentRow?.present_days || 0;

//   //       // 4️⃣ Approved leaves
//   //       const approvedLeaveSql = `
//   //         SELECT IFNULL(SUM(
//   //           DATEDIFF(
//   //             LEAST(end_date, '${monthEnd.format("YYYY-MM-DD")}'),
//   //             GREATEST(start_date, '${monthStart.format("YYYY-MM-DD")}')
//   //           ) + 1
//   //         ),0) AS approved_leave_days
//   //         FROM em_leave_requests
//   //         WHERE employee_id = ${employee_id}
//   //         AND status = 'APPROVED'
//   //         AND start_date <= '${monthEnd.format("YYYY-MM-DD")}'
//   //         AND end_date >= '${monthStart.format("YYYY-MM-DD")}'
//   //       `;
//   //       const [leaveRow] = await customSelectSqlQuery(approvedLeaveSql);
//   //       const approvedLeaveDays = leaveRow?.approved_leave_days || 0;

//   //       const paidDays =
//   //         presentDays + approvedLeaveDays + holidayDays;

//   //       const unpaidDays =
//   //         totalDaysInMonth - paidDays < 0
//   //           ? 0
//   //           : totalDaysInMonth - paidDays;

//   //       // 5️⃣ Salary
//   //       const salary = await selectOneData(
//   //         "em_salary",
//   //         "*",
//   //         `employee_id = ${employee_id} AND last_salary_status = 'Y'`
//   //       );

//   //       if (!salary) {
//   //         skipped++;
//   //         continue;
//   //       }

//   //       const monthCtcAmount = Number(salary.ctc || 0);

//   //       const monthDeductedAmount =
//   //         Number(salary.pf_amount || 0) +
//   //         Number(salary.esi_amount || 0) +
//   //         Number(salary.professional_tax || 0) +
//   //         Number(salary.other_deductions || 0);

//   //       // 6️⃣ LOP
//   //       const perDaySalary = monthCtcAmount / totalDaysInMonth;
//   //       const lopAmount = unpaidDays * perDaySalary;

//   //       const salaryInHand =
//   //         monthCtcAmount - monthDeductedAmount - lopAmount;

//   //       // 7️⃣ Insert payslip
//   //       await insertData(PAYSLIP_TABLE, {
//   //         employee_id,
//   //         month_date: monthStart.format("YYYY-MM-DD"),
//   //         total_present_in_month: paidDays,
//   //         total_absent_in_month: unpaidDays,
//   //         month_ctc_amount: monthCtcAmount.toFixed(2),
//   //         month_deducted_amount: monthDeductedAmount.toFixed(2),
//   //         salary_in_hand: salaryInHand.toFixed(2),
//   //         created_by,
//   //         created_at: new Date(),
//   //       });

//   //       generated++;
//   //     }

//   //     return res.json({
//   //       success: true,
//   //       message: "Monthly payslip generation completed",
//   //       month: monthStart.format("YYYY-MM"),
//   //       summary: {
//   //         total_employees: employees.length,
//   //         generated,
//   //         skipped,
//   //       },
//   //     });

//   //   } catch (err) {
//   //     console.error("generateAllMonthlyPayslips Error:", err);
//   //     return res.status(500).json({
//   //       success: false,
//   //       message: err.message,
//   //     });
//   //   }
//   // }

//  async generateAllMonthlyPayslips(req, res) {
//     try {
//       // 📅 Current month
//       const monthStart = dayjs().startOf("month");
//       const monthEnd = dayjs().endOf("month");
//       const totalDaysInMonth = monthEnd.date();

//       // 1️⃣ Get all active employees
//       const employees = await selectData(
//         "em_employees",
//         "employee_id",
//         "status = 'ACTIVE'"
//       );

//       if (!employees.length) {
//         return res.json({
//           success: true,
//           message: "No active employees found",
//         });
//       }

//       // 2️⃣ Get company holidays once (PAID)
//       const holidaySql = `
//         SELECT COUNT(*) AS holiday_days
//         FROM em_annual_holiday
//         WHERE holiday_date BETWEEN ? AND ?
//       `;
//       const holidayRow = await customSelectSqlQuery2(
//         holidaySql,
//         [monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
//         false
//       );
//       const holidayDays = holidayRow?.holiday_days || 0;

//       let generated = 0;
//       let skipped = 0;

//       // 3️⃣ Loop through employees
//       for (const emp of employees) {
//         const employee_id = emp.employee_id;

//         // 🚫 Skip if payslip already exists
//         const existing = await selectOneData(
//           PAYSLIP_TABLE,
//           "payslip_id",
//           `employee_id = ${employee_id}
//            AND month_date = '${monthStart.format("YYYY-MM-DD")}'`
//         );

//         if (existing) {
//           skipped++;
//           continue;
//         }

//         // 4️⃣ Present days from attendance (work_date)
//         const presentSql = `
//           SELECT COUNT(DISTINCT work_date) AS present_days
//           FROM em_attendance
//           WHERE employee_id = ?
//           AND in_out_status = 'IN'
//           AND work_date BETWEEN ? AND ?
//         `;
//         const presentRow = await customSelectSqlQuery2(
//           presentSql,
//           [
//             employee_id,
//             monthStart.format("YYYY-MM-DD"),
//             monthEnd.format("YYYY-MM-DD"),
//           ],
//           false
//         );
//         const presentDays = presentRow?.present_days || 0;

//         // 5️⃣ Approved leave days (PAID)
//         const approvedLeaveSql = `
//           SELECT IFNULL(SUM(
//             DATEDIFF(
//               LEAST(end_date, ?),
//               GREATEST(start_date, ?)
//             ) + 1
//           ),0) AS approved_leave_days
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
//         const approvedLeaveDays = leaveRow?.approved_leave_days || 0;

//         // 6️⃣ Attendance summary
//         const paidDays =
//           presentDays + approvedLeaveDays + holidayDays;

//         const unpaidDays =
//           totalDaysInMonth - paidDays < 0
//             ? 0
//             : totalDaysInMonth - paidDays;

//         // 7️⃣ Active salary
//         const salary = await selectOneData(
//           "em_salary",
//           "*",
//           `employee_id = ${employee_id} AND last_salary_status = 'Y'`
//         );

//         if (!salary) {
//           skipped++;
//           continue;
//         }

//         const monthCtcAmount = Number(salary.ctc || 0);

//         const monthDeductedAmount =
//           Number(salary.pf_amount || 0) +
//           Number(salary.esi_amount || 0) +
//           Number(salary.professional_tax || 0) +
//           Number(salary.other_deductions || 0);

//         // 8️⃣ LOP calculation
//         const perDaySalary = monthCtcAmount / totalDaysInMonth;
//         const lopAmount = unpaidDays * perDaySalary;

//         const salaryInHand =
//           monthCtcAmount - monthDeductedAmount - lopAmount;

//         // 9️⃣ Insert payslip
//         // await insertData(PAYSLIP_TABLE, {
//         //   employee_id,
//         //   month_date: monthStart.format("YYYY-MM-DD"),
//         //   total_present_in_month: paidDays,
//         //   total_absent_in_month: unpaidDays,
//         //   month_ctc_amount: monthCtcAmount.toFixed(2),
//         //   month_deducted_amount: monthDeductedAmount.toFixed(2),
//         //   salary_in_hand: salaryInHand.toFixed(2),
//         //   created_at: new Date(),
//         // });
//         await insertData(PAYSLIP_TABLE, {
//   employee_id,
//   month_date: monthStart.format("YYYY-MM-DD"),
//   total_present_in_months: paidDays,   // ✅ FIXED
//   total_absent_in_month: unpaidDays,
//   month_ctc_amount: monthCtcAmount.toFixed(2),
//   month_deducted_amount: monthDeductedAmount.toFixed(2),
//   salary_in_hand: salaryInHand.toFixed(2),
//   created_at: new Date(),
// });


//         generated++;
//       }

//       return res.json({
//         success: true,
//         message: "Monthly payslip generation completed",
//         month: monthStart.format("YYYY-MM"),
//         summary: {
//           total_employees: employees.length,
//           generated,
//           skipped,
//         },
//       });

//     } catch (err) {
//       console.error("generateAllMonthlyPayslips Error:", err);
//       return res.status(500).json({
//         success: false,
//         message: err.message,
//       });
//     }
//   }


//   async generateMonthlyPayslip(req, res) {
//   try {
//     const { employee_id, month } = req.body;

//     if (!employee_id || !month) {
//       return res.status(400).json({
//         success: false,
//         message: "employee_id and month (YYYY-MM) are required",
//       });
//     }

//     // 📅 Month calculations
//     const monthStart = dayjs(`${month}-01`).startOf("month");
//     const monthEnd = monthStart.endOf("month");
//     const totalDaysInMonth = monthEnd.date();

//     // 1️⃣ Present days
//     const presentSql = `
//       SELECT COUNT(DISTINCT attendance_date) AS present_days
//       FROM em_attendance
//       WHERE employee_id = ${employee_id}
//       AND attendance_date BETWEEN
//       '${monthStart.format("YYYY-MM-DD")}'
//       AND '${monthEnd.format("YYYY-MM-DD")}'
//     `;
//     const [presentRow] = await customSelectSqlQuery(presentSql);
//     const presentDays = presentRow?.present_days || 0;

//     // 2️⃣ Approved leave days (PAID)
//     const approvedLeaveSql = `
//       SELECT IFNULL(SUM(
//         DATEDIFF(
//           LEAST(end_date, '${monthEnd.format("YYYY-MM-DD")}'),
//           GREATEST(start_date, '${monthStart.format("YYYY-MM-DD")}')
//         ) + 1
//       ),0) AS approved_leave_days
//       FROM em_leave_requests
//       WHERE employee_id = ${employee_id}
//       AND status = 'APPROVED'
//       AND start_date <= '${monthEnd.format("YYYY-MM-DD")}'
//       AND end_date >= '${monthStart.format("YYYY-MM-DD")}'
//     `;
//     const [approvedLeaveRow] = await customSelectSqlQuery(approvedLeaveSql);
//     const approvedLeaveDays = approvedLeaveRow?.approved_leave_days || 0;

//     // 3️⃣ Company holidays (PAID)
//     const holidaySql = `
//       SELECT COUNT(*) AS holiday_days
//       FROM em_annual_holiday
//       WHERE holiday_date BETWEEN
//       '${monthStart.format("YYYY-MM-DD")}'
//       AND '${monthEnd.format("YYYY-MM-DD")}'
//     `;
//     const [holidayRow] = await customSelectSqlQuery(holidaySql);
//     const holidayDays = holidayRow?.holiday_days || 0;

//     // 4️⃣ Attendance summary
//     const paidDays =
//       presentDays + approvedLeaveDays + holidayDays;

//     const unpaidDays =
//       totalDaysInMonth - paidDays < 0
//         ? 0
//         : totalDaysInMonth - paidDays;

//     // 5️⃣ Salary
//     const salary = await selectOneData(
//       "em_salary",
//       "*",
//       `employee_id = ${employee_id} AND last_salary_status = 'Y'`
//     );

//     if (!salary) {
//       return res.status(404).json({
//         success: false,
//         message: "Active salary structure not found",
//       });
//     }

//     const monthCtcAmount = Number(salary.ctc || 0);

//     const monthDeductedAmount =
//       Number(salary.pf_amount || 0) +
//       Number(salary.esi_amount || 0) +
//       Number(salary.professional_tax || 0) +
//       Number(salary.other_deductions || 0);

//     // 6️⃣ LOP calculation
//     const perDaySalary = monthCtcAmount / totalDaysInMonth;
//     const lopAmount = unpaidDays * perDaySalary;

//     const salaryInHand =
//       monthCtcAmount - monthDeductedAmount - lopAmount;

//     // 7️⃣ Insert payslip (NO created_by)
//     const insertDataObj = {
//       employee_id,
//       month_date: monthStart.format("YYYY-MM-DD"),
//       total_present_in_month: paidDays,
//       total_absent_in_month: unpaidDays,
//       month_ctc_amount: monthCtcAmount.toFixed(2),
//       month_deducted_amount: monthDeductedAmount.toFixed(2),
//       salary_in_hand: salaryInHand.toFixed(2),
//       created_at: new Date(),
//     };

//     const payslipId = await insertData(
//       PAYSLIP_TABLE,
//       insertDataObj
//     );

//     return res.status(201).json({
//       success: true,
//       message: "Payslip generated successfully",
//       payslip_id: payslipId,
//       data: insertDataObj,
//     });

//   } catch (err) {
//     console.error("generateMonthlyPayslip Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// }

// }

// module.exports = new employeePaySlipController();




const dayjs = require("dayjs");
const {
  selectData,
  selectOneData,
  customSelectSqlQuery,
  customSelectSqlQuery2,
  insertData,
  updateData,
  deleteData,
} = require("../models/MasterModel");

const PAYSLIP_TABLE = "em_payslips";

class employeePaySlipController {
  
  
// // 🔥 Generate payslips for ALL employees (current month) - UPDATED WITH CTC CALCULATION
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




//  Generate payslips for ALL employees (current month) - UPDATED WITH CTC CALCULATION
async generateAllMonthlyPayslips(req, res) {
  try {
    const created_by = req.user?.id || null;

    // 📅 Current month
    const monthStart = dayjs().startOf("month");
    const monthEnd = dayjs().endOf("month");
    const totalDaysInMonth = monthEnd.date();

    console.log('📅 Generating payslips for:', monthStart.format("YYYY-MM"));
    console.log('📅 Total days in month:', totalDaysInMonth);

    // 1️⃣ Get all active employees
    const employees = await selectData(
      "em_employees",
      "employee_id",
      "status = 'ACTIVE'"
    );

    if (!employees.length) {
      return res.json({
        success: true,
        message: "No active employees found",
      });
    }

    console.log('👥 Found', employees.length, 'active employees');

    // 2️⃣ Get company holidays once (PAID)
    const holidaySql = `
      SELECT COUNT(*) AS holiday_days
      FROM em_annual_holiday
      WHERE holiday_date BETWEEN ? AND ?
    `;
    const holidayRow = await customSelectSqlQuery2(
      holidaySql,
      [monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
      false
    );
    const holidayDays = holidayRow?.holiday_days || 0;

    console.log('🎉 Company holidays in this month:', holidayDays);

    let generated = 0;
    let skipped = 0;
    const errors = [];

    // 3️⃣ Loop through employees using while loop for better performance
    let index = 0;
    while (index < employees.length) {
      const emp = employees[index];
      const employee_id = emp.employee_id;
      
      try {
        console.log(`\n👤 Processing employee_id: ${employee_id}`);

        // 🚫 Skip if payslip already exists
        const existing = await selectOneData(
          PAYSLIP_TABLE,
          "payslip_id",
          `employee_id = ${employee_id} AND month_date = '${monthStart.format("YYYY-MM-DD")}'`
        );

        if (existing) {
          console.log(`⏭️  Skipped: Payslip already exists`);
          skipped++;
          index++;
          continue;
        }

        // 4️⃣ Present days from attendance
        const presentSql = `
          SELECT COUNT(DISTINCT work_date) AS present_days
          FROM em_attendance
          WHERE employee_id = ?
          AND work_date BETWEEN ? AND ?
        `;
        const presentRow = await customSelectSqlQuery2(
          presentSql,
          [employee_id, monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
          false
        );
        const presentDays = parseInt(presentRow?.present_days || 0);

        console.log(`   📊 Present days: ${presentDays}`);

        // 5️⃣ Approved leave days (PAID)
        const approvedLeaveSql = `
          SELECT IFNULL(SUM(
            DATEDIFF(
              LEAST(end_date, ?),
              GREATEST(start_date, ?)
            ) + 1
          ), 0) AS approved_leave_days
          FROM em_leave_requests
          WHERE employee_id = ?
          AND status = 'APPROVED'
          AND start_date <= ?
          AND end_date >= ?
        `;
        const leaveRow = await customSelectSqlQuery2(
          approvedLeaveSql,
          [
            monthEnd.format("YYYY-MM-DD"),
            monthStart.format("YYYY-MM-DD"),
            employee_id,
            monthEnd.format("YYYY-MM-DD"),
            monthStart.format("YYYY-MM-DD"),
          ],
          false
        );
        const approvedLeaveDays = parseInt(leaveRow?.approved_leave_days || 0);

        console.log(`   🏖️  Approved leave days: ${approvedLeaveDays}`);

        // 6️⃣ Attendance summary
        const paidDays = presentDays + approvedLeaveDays + holidayDays;
        const unpaidDays = totalDaysInMonth - paidDays < 0 ? 0 : totalDaysInMonth - paidDays;

        console.log(`   ✅ Total paid days: ${paidDays}`);
        console.log(`   ❌ Total unpaid days: ${unpaidDays}`);

        // 7️⃣ Active salary - WITH CTC CALCULATION
        const salary = await selectOneData(
          "em_salary",
          "*",
          `employee_id = ${employee_id} AND last_salary_status = 'Y'`
        );

        if (!salary) {
          console.log(`   ⚠️  WARNING: No active salary structure found - SKIPPING`);
          errors.push({
            employee_id,
            error: 'No active salary structure found'
          });
          skipped++;
          index++;
          continue;
        }

        // ✨ CALCULATE CTC from all salary components
        const monthCtcAmount = 
          parseFloat(salary.basic_salary || 0) +
          parseFloat(salary.basic_pay || 0) +
          parseFloat(salary.basic_wages || 0) +
          parseFloat(salary.dearness_allowance || 0) +
          parseFloat(salary.house_rent_allowance || 0) +
          parseFloat(salary.conveyance_allowance || 0) +
          parseFloat(salary.medical_allowance || 0) +
          parseFloat(salary.special_allowance || 0) +
          parseFloat(salary.city_compensatory_allowance || 0) +
          parseFloat(salary.education_allowance || 0) +
          parseFloat(salary.uniform_allowance || 0) +
          parseFloat(salary.telephone_mobile_allowance || 0) +
          parseFloat(salary.internet_allowance || 0) +
          parseFloat(salary.fuel_allowance || 0) +
          parseFloat(salary.books_periodicals_allowance || 0) +
          parseFloat(salary.child_education_allowance || 0) +
          parseFloat(salary.hostel_allowance || 0) +
          parseFloat(salary.food_allowance || 0) +
          parseFloat(salary.other_allowance || 0) +
          parseFloat(salary.performance_bonus || 0) +
          parseFloat(salary.annual_bonus || 0) +
          parseFloat(salary.incentive || 0) +
          parseFloat(salary.sales_commission || 0) +
          parseFloat(salary.productivity_bonus || 0) +
          parseFloat(salary.profit_linked_bonus || 0) +
          parseFloat(salary.attendance_allowance || 0) +
          parseFloat(salary.shift_allowance || 0) +
          parseFloat(salary.night_shift_allowance || 0) +
          parseFloat(salary.weekend_allowance || 0) +
          parseFloat(salary.on_call_allowance || 0) +
          parseFloat(salary.project_allowance || 0) +
          parseFloat(salary.site_allowance || 0) +
          parseFloat(salary.location_allowance || 0) +
          parseFloat(salary.hazard_allowance || 0) +
          parseFloat(salary.hardship_allowance || 0);
        
        if (monthCtcAmount <= 0) {
          console.log(`   ⚠️  WARNING: Calculated CTC is 0 or invalid - SKIPPING`);
          console.log(`   💡 TIP: Check if salary components are filled in em_salary table`);
          errors.push({
            employee_id,
            error: 'Calculated CTC is 0 (no salary components found)'
          });
          skipped++;
          index++;
          continue;
        }

        console.log(`   💰 Calculated Monthly CTC: ${monthCtcAmount.toFixed(2)}`);

        // ✨ CALCULATE DEDUCTIONS from relevant fields
        const monthDeductedAmount =
          parseFloat(salary.epf_employee_contribution || 0) +
          parseFloat(salary.esi_employee_contribution || 0) +
          parseFloat(salary.professional_tax || 0) +
          parseFloat(salary.labour_welfare_fund || 0) +
          parseFloat(salary.income_tax_tds || 0) +
          parseFloat(salary.loan_deduction || 0) +
          parseFloat(salary.advance_salary_recovery || 0) +
          parseFloat(salary.meal_deduction || 0) +
          parseFloat(salary.insurance_premium_employee || 0) +
          parseFloat(salary.late_coming_lop || 0) +
          parseFloat(salary.notice_period_recovery || 0) +
          parseFloat(salary.damage_penalty_deduction || 0);

        console.log(`   💸 Total deductions: ${monthDeductedAmount.toFixed(2)}`);

        // 8️⃣ LOP calculation
        const perDaySalary = monthCtcAmount / totalDaysInMonth;
        const lopAmount = unpaidDays * perDaySalary;

        console.log(`   📉 Per day salary: ${perDaySalary.toFixed(2)}`);
        console.log(`   📉 LOP amount: ${lopAmount.toFixed(2)}`);

        const salaryInHand = monthCtcAmount - monthDeductedAmount - lopAmount;

        console.log(`   💵 Salary in hand: ${salaryInHand.toFixed(2)}`);

        // 9️⃣ Insert payslip
        const payslipData = {
          employee_id: parseInt(employee_id),
          month_date: monthStart.format("YYYY-MM-DD"),
          total_present_in_months: parseInt(paidDays),
          total_absent_in_month: parseInt(unpaidDays),
          month_ctc_amount: parseFloat(monthCtcAmount.toFixed(2)),
          month_deducted_amount: parseFloat(monthDeductedAmount.toFixed(2)),
          salary_in_hand: parseFloat(salaryInHand.toFixed(2)),
          created_by: created_by || null,
          created_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        };

        console.log('   📝 Inserting payslip data:', payslipData);

        await insertData(PAYSLIP_TABLE, payslipData);

        console.log(`   ✅ Payslip generated successfully`);
        generated++;

      } catch (empError) {
        console.error(`   ❌ Error processing employee ${employee_id}:`, empError);
        errors.push({
          employee_id,
          error: empError.message
        });
        skipped++;
      }
      
      // Increment index for next iteration
      index++;
    }

    return res.json({
      success: true,
      message: "Monthly payslip generation completed",
      month: monthStart.format("YYYY-MM"),
      summary: {
        total_employees: employees.length,
        generated,
        skipped,
        errors: errors.length > 0 ? errors : undefined
      },
    });
  } catch (err) {
    console.error("❌ generateAllMonthlyPayslips Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}

// 📊 Generate payslip for single employee for specific month - UPDATED WITH CTC CALCULATION
async generateMonthlyPayslip(req, res) {
  try {
    const { employee_id, month } = req.body;
    const created_by = req.user?.id || null;

    if (!employee_id || !month) {
      return res.status(400).json({
        success: false,
        message: "employee_id and month (YYYY-MM) are required",
      });
    }

    console.log(`\n👤 Generating payslip for employee ${employee_id}, month ${month}`);

    // 📅 Month calculations
    const monthStart = dayjs(`${month}-01`).startOf("month");
    const monthEnd = monthStart.endOf("month");
    const totalDaysInMonth = monthEnd.date();

    console.log('📅 Total days in month:', totalDaysInMonth);

    // Check if payslip already exists
    const existing = await selectOneData(
      PAYSLIP_TABLE,
      "payslip_id",
      `employee_id = ${employee_id} AND month_date = '${monthStart.format("YYYY-MM-DD")}'`
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Payslip already exists for this month",
        payslip_id: existing.payslip_id
      });
    }

    // 1️⃣ Present days
    const presentSql = `
      SELECT COUNT(DISTINCT work_date) AS present_days
      FROM em_attendance
      WHERE employee_id = ?
      AND work_date BETWEEN ? AND ?
    `;
    const presentRow = await customSelectSqlQuery2(
      presentSql,
      [employee_id, monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
      false
    );
    const presentDays = parseInt(presentRow?.present_days || 0);

    console.log(`📊 Present days: ${presentDays}`);

    // 2️⃣ Approved leave days (PAID)
    const approvedLeaveSql = `
      SELECT IFNULL(SUM(
        DATEDIFF(
          LEAST(end_date, ?),
          GREATEST(start_date, ?)
        ) + 1
      ), 0) AS approved_leave_days
      FROM em_leave_requests
      WHERE employee_id = ?
      AND status = 'APPROVED'
      AND start_date <= ?
      AND end_date >= ?
    `;
    const leaveRow = await customSelectSqlQuery2(
      approvedLeaveSql,
      [
        monthEnd.format("YYYY-MM-DD"),
        monthStart.format("YYYY-MM-DD"),
        employee_id,
        monthEnd.format("YYYY-MM-DD"),
        monthStart.format("YYYY-MM-DD"),
      ],
      false
    );
    const approvedLeaveDays = parseInt(leaveRow?.approved_leave_days || 0);

    console.log(`🏖️  Approved leave days: ${approvedLeaveDays}`);

    // 3️⃣ Company holidays (PAID)
    const holidaySql = `
      SELECT COUNT(*) AS holiday_days
      FROM em_annual_holiday
      WHERE holiday_date BETWEEN ? AND ?
    `;
    const holidayRow = await customSelectSqlQuery2(
      holidaySql,
      [monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
      false
    );
    const holidayDays = parseInt(holidayRow?.holiday_days || 0);

    console.log(`🎉 Company holidays: ${holidayDays}`);

    // 4️⃣ Attendance summary
    const paidDays = presentDays + approvedLeaveDays + holidayDays;
    const unpaidDays = totalDaysInMonth - paidDays < 0 ? 0 : totalDaysInMonth - paidDays;

    console.log(`✅ Total paid days: ${paidDays}`);
    console.log(`❌ Total unpaid days: ${unpaidDays}`);

    // 5️⃣ Salary - WITH CTC CALCULATION
    const salary = await selectOneData(
      "em_salary",
      "*",
      `employee_id = ${employee_id} AND last_salary_status = 'Y'`
    );

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Active salary structure not found for this employee",
        help: "Please create a salary record with last_salary_status = 'Y'"
      });
    }

    // ✨ CALCULATE CTC from all salary components
    const monthCtcAmount = 
      parseFloat(salary.basic_salary || 0) +
      parseFloat(salary.basic_pay || 0) +
      parseFloat(salary.basic_wages || 0) +
      parseFloat(salary.dearness_allowance || 0) +
      parseFloat(salary.house_rent_allowance || 0) +
      parseFloat(salary.conveyance_allowance || 0) +
      parseFloat(salary.medical_allowance || 0) +
      parseFloat(salary.special_allowance || 0) +
      parseFloat(salary.city_compensatory_allowance || 0) +
      parseFloat(salary.education_allowance || 0) +
      parseFloat(salary.uniform_allowance || 0) +
      parseFloat(salary.telephone_mobile_allowance || 0) +
      parseFloat(salary.internet_allowance || 0) +
      parseFloat(salary.fuel_allowance || 0) +
      parseFloat(salary.books_periodicals_allowance || 0) +
      parseFloat(salary.child_education_allowance || 0) +
      parseFloat(salary.hostel_allowance || 0) +
      parseFloat(salary.food_allowance || 0) +
      parseFloat(salary.other_allowance || 0) +
      parseFloat(salary.performance_bonus || 0) +
      parseFloat(salary.annual_bonus || 0) +
      parseFloat(salary.incentive || 0) +
      parseFloat(salary.sales_commission || 0) +
      parseFloat(salary.productivity_bonus || 0) +
      parseFloat(salary.profit_linked_bonus || 0) +
      parseFloat(salary.attendance_allowance || 0) +
      parseFloat(salary.shift_allowance || 0) +
      parseFloat(salary.night_shift_allowance || 0) +
      parseFloat(salary.weekend_allowance || 0) +
      parseFloat(salary.on_call_allowance || 0) +
      parseFloat(salary.project_allowance || 0) +
      parseFloat(salary.site_allowance || 0) +
      parseFloat(salary.location_allowance || 0) +
      parseFloat(salary.hazard_allowance || 0) +
      parseFloat(salary.hardship_allowance || 0);

    if (monthCtcAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Calculated CTC is 0 or invalid",
        help: "Please check if salary components (basic_salary, allowances, etc.) are filled in the em_salary table",
        employee_id
      });
    }

    console.log(`💰 Calculated Monthly CTC: ${monthCtcAmount.toFixed(2)}`);

    // ✨ CALCULATE DEDUCTIONS from relevant fields
    const monthDeductedAmount =
      parseFloat(salary.epf_employee_contribution || 0) +
      parseFloat(salary.esi_employee_contribution || 0) +
      parseFloat(salary.professional_tax || 0) +
      parseFloat(salary.labour_welfare_fund || 0) +
      parseFloat(salary.income_tax_tds || 0) +
      parseFloat(salary.loan_deduction || 0) +
      parseFloat(salary.advance_salary_recovery || 0) +
      parseFloat(salary.meal_deduction || 0) +
      parseFloat(salary.insurance_premium_employee || 0) +
      parseFloat(salary.late_coming_lop || 0) +
      parseFloat(salary.notice_period_recovery || 0) +
      parseFloat(salary.damage_penalty_deduction || 0);

    console.log(`💸 Total deductions: ${monthDeductedAmount.toFixed(2)}`);

    // 6️⃣ LOP calculation
    const perDaySalary = monthCtcAmount / totalDaysInMonth;
    const lopAmount = unpaidDays * perDaySalary;
    const salaryInHand = monthCtcAmount - monthDeductedAmount - lopAmount;

    console.log(`📉 Per day salary: ${perDaySalary.toFixed(2)}`);
    console.log(`📉 LOP amount: ${lopAmount.toFixed(2)}`);
    console.log(`💵 Salary in hand: ${salaryInHand.toFixed(2)}`);

    // 7️⃣ Insert payslip
    const insertDataObj = {
      employee_id: parseInt(employee_id),
      month_date: monthStart.format("YYYY-MM-DD"),
      total_present_in_months: parseInt(paidDays),
      total_absent_in_month: parseInt(unpaidDays),
      month_ctc_amount: parseFloat(monthCtcAmount.toFixed(2)),
      month_deducted_amount: parseFloat(monthDeductedAmount.toFixed(2)),
      salary_in_hand: parseFloat(salaryInHand.toFixed(2)),
      created_by: created_by || null,
      created_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    };

    console.log('📝 Inserting payslip data:', insertDataObj);

    const payslipId = await insertData(PAYSLIP_TABLE, insertDataObj);

    console.log(`✅ Payslip generated successfully with ID: ${payslipId}`);

    return res.status(201).json({
      success: true,
      message: "Payslip generated successfully",
      payslip_id: payslipId,
      data: insertDataObj,
    });
  } catch (err) {
    console.error("❌ generateMonthlyPayslip Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}

// 📋 Get all payslips with employee details
async getAllPayslips(req, res) {
  try {
    const sql = `
      SELECT 
        p.payslip_id,
        p.employee_id,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        p.month_date,
        p.total_present_in_months,
        p.total_absent_in_month,
        p.month_ctc_amount,
        p.month_deducted_amount,
        p.salary_in_hand,
        p.created_by,
        p.created_at
      FROM ${PAYSLIP_TABLE} p
      LEFT JOIN em_employees e ON p.employee_id = e.employee_id
      ORDER BY p.month_date DESC, p.payslip_id DESC
    `;
    const rows = await customSelectSqlQuery(sql);

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("getAllPayslips Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// 🔍 Get single payslip by ID
async getPayslipById(req, res) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        p.*,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.email,
        e.phone,
        d.department_name,
        des.designation_name
      FROM ${PAYSLIP_TABLE} p
      LEFT JOIN em_employees e ON p.employee_id = e.employee_id
      LEFT JOIN em_departments d ON e.department_id = d.department_id
      LEFT JOIN em_designations des ON e.designation_id = des.designation_id
      WHERE p.payslip_id = ${id}
    `;
    const [row] = await customSelectSqlQuery(sql);

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found",
      });
    }

    res.json({
      success: true,
      data: row,
    });
  } catch (err) {
    console.error("getPayslipById Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// 👤 Get payslips by employee ID
async getPayslipsByEmployee(req, res) {
  try {
    const { employee_id } = req.params;

    const sql = `
      SELECT 
        p.*,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name
      FROM ${PAYSLIP_TABLE} p
      LEFT JOIN em_employees e ON p.employee_id = e.employee_id
      WHERE p.employee_id = ${employee_id}
      ORDER BY p.month_date DESC
    `;
    const rows = await customSelectSqlQuery(sql);

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("getPayslipsByEmployee Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// 📅 Get month-wise attendance and salary breakdown for an employee - UPDATED
async getMonthlyAttendanceBreakdown(req, res) {
  try {
    const { employee_id, month } = req.query;

    if (!employee_id || !month) {
      return res.status(400).json({
        success: false,
        message: "employee_id and month (YYYY-MM) are required",
      });
    }

    const monthStart = dayjs(`${month}-01`).startOf("month");
    const monthEnd = monthStart.endOf("month");
    const totalDaysInMonth = monthEnd.date();

    // 1️⃣ Present days
    const presentSql = `
      SELECT COUNT(DISTINCT work_date) AS present_days
      FROM em_attendance
      WHERE employee_id = ?
      AND work_date BETWEEN ? AND ?
    `;
    const presentRow = await customSelectSqlQuery2(
      presentSql,
      [employee_id, monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
      false
    );
    const presentDays = parseInt(presentRow?.present_days || 0);

    // 2️⃣ Approved leaves (PAID)
    const approvedLeaveSql = `
      SELECT 
        IFNULL(SUM(
          DATEDIFF(
            LEAST(end_date, ?),
            GREATEST(start_date, ?)
          ) + 1
        ), 0) AS approved_leave_days
      FROM em_leave_requests
      WHERE employee_id = ?
      AND status = 'APPROVED'
      AND start_date <= ?
      AND end_date >= ?
    `;
    const approvedLeaveRow = await customSelectSqlQuery2(
      approvedLeaveSql,
      [
        monthEnd.format("YYYY-MM-DD"),
        monthStart.format("YYYY-MM-DD"),
        employee_id,
        monthEnd.format("YYYY-MM-DD"),
        monthStart.format("YYYY-MM-DD"),
      ],
      false
    );
    const approvedLeaveDays = parseInt(approvedLeaveRow?.approved_leave_days || 0);

    // 3️⃣ Rejected/Pending leaves (UNPAID)
    const rejectedLeaveSql = `
      SELECT 
        IFNULL(SUM(
          DATEDIFF(
            LEAST(end_date, ?),
            GREATEST(start_date, ?)
          ) + 1
        ), 0) AS rejected_leave_days
      FROM em_leave_requests
      WHERE employee_id = ?
      AND status IN ('REJECTED', 'PENDING')
      AND start_date <= ?
      AND end_date >= ?
    `;
    const rejectedLeaveRow = await customSelectSqlQuery2(
      rejectedLeaveSql,
      [
        monthEnd.format("YYYY-MM-DD"),
        monthStart.format("YYYY-MM-DD"),
        employee_id,
        monthEnd.format("YYYY-MM-DD"),
        monthStart.format("YYYY-MM-DD"),
      ],
      false
    );
    const rejectedLeaveDays = parseInt(rejectedLeaveRow?.rejected_leave_days || 0);

    // 4️⃣ Company holidays (PAID)
    const holidaySql = `
      SELECT 
        COUNT(*) AS holiday_days,
        GROUP_CONCAT(holiday_name SEPARATOR ', ') AS holiday_names
      FROM em_annual_holiday
      WHERE holiday_date BETWEEN ? AND ?
    `;
    const holidayRow = await customSelectSqlQuery2(
      holidaySql,
      [monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
      false
    );
    const holidayDays = parseInt(holidayRow?.holiday_days || 0);
    const holidayNames = holidayRow?.holiday_names || "None";

    // 5️⃣ Calculate paid and unpaid days
    const paidDays = presentDays + approvedLeaveDays + holidayDays;
    const unpaidDays = totalDaysInMonth - paidDays < 0 ? 0 : totalDaysInMonth - paidDays;

    // 6️⃣ Salary breakdown - WITH CTC CALCULATION
    const salary = await selectOneData(
      "em_salary",
      "*",
      `employee_id = ${employee_id} AND last_salary_status = 'Y'`
    );

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Active salary structure not found",
      });
    }

    // ✨ CALCULATE CTC
    const monthCtcAmount = 
      parseFloat(salary.basic_salary || 0) +
      parseFloat(salary.basic_pay || 0) +
      parseFloat(salary.basic_wages || 0) +
      parseFloat(salary.dearness_allowance || 0) +
      parseFloat(salary.house_rent_allowance || 0) +
      parseFloat(salary.conveyance_allowance || 0) +
      parseFloat(salary.medical_allowance || 0) +
      parseFloat(salary.special_allowance || 0) +
      parseFloat(salary.city_compensatory_allowance || 0) +
      parseFloat(salary.education_allowance || 0) +
      parseFloat(salary.uniform_allowance || 0) +
      parseFloat(salary.telephone_mobile_allowance || 0) +
      parseFloat(salary.internet_allowance || 0) +
      parseFloat(salary.fuel_allowance || 0) +
      parseFloat(salary.books_periodicals_allowance || 0) +
      parseFloat(salary.child_education_allowance || 0) +
      parseFloat(salary.hostel_allowance || 0) +
      parseFloat(salary.food_allowance || 0) +
      parseFloat(salary.other_allowance || 0) +
      parseFloat(salary.performance_bonus || 0) +
      parseFloat(salary.annual_bonus || 0) +
      parseFloat(salary.incentive || 0) +
      parseFloat(salary.sales_commission || 0) +
      parseFloat(salary.productivity_bonus || 0) +
      parseFloat(salary.profit_linked_bonus || 0) +
      parseFloat(salary.attendance_allowance || 0) +
      parseFloat(salary.shift_allowance || 0) +
      parseFloat(salary.night_shift_allowance || 0) +
      parseFloat(salary.weekend_allowance || 0) +
      parseFloat(salary.on_call_allowance || 0) +
      parseFloat(salary.project_allowance || 0) +
      parseFloat(salary.site_allowance || 0) +
      parseFloat(salary.location_allowance || 0) +
      parseFloat(salary.hazard_allowance || 0) +
      parseFloat(salary.hardship_allowance || 0);

    const perDaySalary = monthCtcAmount / totalDaysInMonth;
    const earnedSalary = perDaySalary * presentDays;
    const lopAmount = unpaidDays * perDaySalary;

    const deductions = {
      epf_employee_contribution: parseFloat(salary.epf_employee_contribution || 0),
      esi_employee_contribution: parseFloat(salary.esi_employee_contribution || 0),
      professional_tax: parseFloat(salary.professional_tax || 0),
      labour_welfare_fund: parseFloat(salary.labour_welfare_fund || 0),
      income_tax_tds: parseFloat(salary.income_tax_tds || 0),
      loan_deduction: parseFloat(salary.loan_deduction || 0),
      advance_salary_recovery: parseFloat(salary.advance_salary_recovery || 0),
      meal_deduction: parseFloat(salary.meal_deduction || 0),
      insurance_premium_employee: parseFloat(salary.insurance_premium_employee || 0),
      late_coming_lop: parseFloat(salary.late_coming_lop || 0),
      notice_period_recovery: parseFloat(salary.notice_period_recovery || 0),
      damage_penalty_deduction: parseFloat(salary.damage_penalty_deduction || 0),
    };

    const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);

    const salaryInHand = monthCtcAmount - totalDeductions - lopAmount;

    res.json({
      success: true,
      data: {
        employee_id,
        month,
        total_days_in_month: totalDaysInMonth,
        attendance_breakdown: {
          present_days: presentDays,
          approved_leave_days: approvedLeaveDays,
          rejected_pending_leave_days: rejectedLeaveDays,
          company_holidays: holidayDays,
          holiday_names: holidayNames,
          total_paid_days: paidDays,
          total_unpaid_days: unpaidDays,
        },
        salary_breakdown: {
          month_ctc: monthCtcAmount.toFixed(2),
          per_day_salary: perDaySalary.toFixed(2),
          earned_salary_for_present_days: earnedSalary.toFixed(2),
          deductions: {
            epf_employee_contribution: deductions.epf_employee_contribution.toFixed(2),
            esi_employee_contribution: deductions.esi_employee_contribution.toFixed(2),
            professional_tax: deductions.professional_tax.toFixed(2),
            labour_welfare_fund: deductions.labour_welfare_fund.toFixed(2),
            income_tax_tds: deductions.income_tax_tds.toFixed(2),
            loan_deduction: deductions.loan_deduction.toFixed(2),
            advance_salary_recovery: deductions.advance_salary_recovery.toFixed(2),
            meal_deduction: deductions.meal_deduction.toFixed(2),
            insurance_premium_employee: deductions.insurance_premium_employee.toFixed(2),
            late_coming_lop: deductions.late_coming_lop.toFixed(2),
            notice_period_recovery: deductions.notice_period_recovery.toFixed(2),
            damage_penalty_deduction: deductions.damage_penalty_deduction.toFixed(2),
            total: totalDeductions.toFixed(2),
          },
          lop_deduction: lopAmount.toFixed(2),
          net_salary_in_hand: salaryInHand.toFixed(2),
        },
      },
    });
  } catch (err) {
    console.error("getMonthlyAttendanceBreakdown Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// 📊 Get employee daily income calculation - UPDATED
async getEmployeeDailyIncome(req, res) {
  try {
    const { employee_id, month } = req.query;

    if (!employee_id || !month) {
      return res.status(400).json({
        success: false,
        message: "employee_id and month (YYYY-MM) are required",
      });
    }

    const monthStart = dayjs(`${month}-01`).startOf("month");
    const monthEnd = monthStart.endOf("month");
    const totalDaysInMonth = monthEnd.date();

    // Get salary - WITH CTC CALCULATION
    const salary = await selectOneData(
      "em_salary",
      "*",
      `employee_id = ${employee_id} AND last_salary_status = 'Y'`
    );

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Active salary structure not found",
      });
    }

    // ✨ CALCULATE CTC
    const monthCtcAmount = 
      parseFloat(salary.basic_salary || 0) +
      parseFloat(salary.basic_pay || 0) +
      parseFloat(salary.basic_wages || 0) +
      parseFloat(salary.dearness_allowance || 0) +
      parseFloat(salary.house_rent_allowance || 0) +
      parseFloat(salary.conveyance_allowance || 0) +
      parseFloat(salary.medical_allowance || 0) +
      parseFloat(salary.special_allowance || 0) +
      parseFloat(salary.city_compensatory_allowance || 0) +
      parseFloat(salary.education_allowance || 0) +
      parseFloat(salary.uniform_allowance || 0) +
      parseFloat(salary.telephone_mobile_allowance || 0) +
      parseFloat(salary.internet_allowance || 0) +
      parseFloat(salary.fuel_allowance || 0) +
      parseFloat(salary.books_periodicals_allowance || 0) +
      parseFloat(salary.child_education_allowance || 0) +
      parseFloat(salary.hostel_allowance || 0) +
      parseFloat(salary.food_allowance || 0) +
      parseFloat(salary.other_allowance || 0) +
      parseFloat(salary.performance_bonus || 0) +
      parseFloat(salary.annual_bonus || 0) +
      parseFloat(salary.incentive || 0) +
      parseFloat(salary.sales_commission || 0) +
      parseFloat(salary.productivity_bonus || 0) +
      parseFloat(salary.profit_linked_bonus || 0) +
      parseFloat(salary.attendance_allowance || 0) +
      parseFloat(salary.shift_allowance || 0) +
      parseFloat(salary.night_shift_allowance || 0) +
      parseFloat(salary.weekend_allowance || 0) +
      parseFloat(salary.on_call_allowance || 0) +
      parseFloat(salary.project_allowance || 0) +
      parseFloat(salary.site_allowance || 0) +
      parseFloat(salary.location_allowance || 0) +
      parseFloat(salary.hazard_allowance || 0) +
      parseFloat(salary.hardship_allowance || 0);

    const perDaySalary = monthCtcAmount / totalDaysInMonth;

    // Get present days
    const presentSql = `
      SELECT COUNT(DISTINCT work_date) AS present_days
      FROM em_attendance
      WHERE employee_id = ?
      AND work_date BETWEEN ? AND ?
    `;
    const presentRow = await customSelectSqlQuery2(
      presentSql,
      [employee_id, monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
      false
    );
    const presentDays = parseInt(presentRow?.present_days || 0);

    const dailyIncome = perDaySalary * presentDays;

    res.json({
      success: true,
      data: {
        employee_id,
        month,
        total_days_in_month: totalDaysInMonth,
        month_ctc_amount: monthCtcAmount.toFixed(2),
        per_day_salary: perDaySalary.toFixed(2),
        present_days: presentDays,
        total_daily_income_for_present_days: dailyIncome.toFixed(2),
        calculation: `${monthCtcAmount.toFixed(2)} / ${totalDaysInMonth} * ${presentDays} = ${dailyIncome.toFixed(2)}`,
      },
    });
  } catch (err) {
    console.error("getEmployeeDailyIncome Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// 🔄 Update payslip
async updatePayslip(req, res) {
  try {
    const { id } = req.params;
    const {
      total_present_in_months,
      total_absent_in_month,
      month_ctc_amount,
      month_deducted_amount,
      salary_in_hand,
    } = req.body;

    const existing = await selectOneData(
      PAYSLIP_TABLE,
      "*",
      `payslip_id = ${id}`
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found",
      });
    }

    const updateFields = { updated_at: new Date() };

    if (total_present_in_months !== undefined)
      updateFields.total_present_in_months = parseInt(total_present_in_months);
    if (total_absent_in_month !== undefined)
      updateFields.total_absent_in_month = parseInt(total_absent_in_month);
    if (month_ctc_amount !== undefined)
      updateFields.month_ctc_amount = parseFloat(month_ctc_amount);
    if (month_deducted_amount !== undefined)
      updateFields.month_deducted_amount = parseFloat(month_deducted_amount);
    if (salary_in_hand !== undefined)
      updateFields.salary_in_hand = parseFloat(salary_in_hand);

    await updateData(PAYSLIP_TABLE, updateFields, `payslip_id = ${id}`);

    res.json({
      success: true,
      message: "Payslip updated successfully",
    });
  } catch (err) {
    console.error("updatePayslip Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}














// 📊 Generate payslip for single employee for specific month - UPDATED WITH CTC CALCULATION
async generateMonthlyPayslip(req, res) {
  try {
    const { employee_id, month } = req.body;
    const created_by = req.user?.id || null;

    if (!employee_id || !month) {
      return res.status(400).json({
        success: false,
        message: "employee_id and month (YYYY-MM) are required",
      });
    }

    console.log(`\n👤 Generating payslip for employee ${employee_id}, month ${month}`);

    // 📅 Month calculations
    const monthStart = dayjs(`${month}-01`).startOf("month");
    const monthEnd = monthStart.endOf("month");
    const totalDaysInMonth = monthEnd.date();

    console.log('📅 Total days in month:', totalDaysInMonth);

    // Check if payslip already exists
    const existing = await selectOneData(
      PAYSLIP_TABLE,
      "payslip_id",
      `employee_id = ${employee_id} AND month_date = '${monthStart.format("YYYY-MM-DD")}'`
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Payslip already exists for this month",
        payslip_id: existing.payslip_id
      });
    }

    // 1️⃣ Present days
    const presentSql = `
      SELECT COUNT(DISTINCT work_date) AS present_days
      FROM em_attendance
      WHERE employee_id = ?
      AND work_date BETWEEN ? AND ?
    `;
    const presentRow = await customSelectSqlQuery2(
      presentSql,
      [employee_id, monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
      false
    );
    const presentDays = parseInt(presentRow?.present_days || 0);

    console.log(`📊 Present days: ${presentDays}`);

    // 2️⃣ Approved leave days (PAID)
    const approvedLeaveSql = `
      SELECT IFNULL(SUM(
        DATEDIFF(
          LEAST(end_date, ?),
          GREATEST(start_date, ?)
        ) + 1
      ), 0) AS approved_leave_days
      FROM em_leave_requests
      WHERE employee_id = ?
      AND status = 'APPROVED'
      AND start_date <= ?
      AND end_date >= ?
    `;
    const leaveRow = await customSelectSqlQuery2(
      approvedLeaveSql,
      [
        monthEnd.format("YYYY-MM-DD"),
        monthStart.format("YYYY-MM-DD"),
        employee_id,
        monthEnd.format("YYYY-MM-DD"),
        monthStart.format("YYYY-MM-DD"),
      ],
      false
    );
    const approvedLeaveDays = parseInt(leaveRow?.approved_leave_days || 0);

    console.log(`🏖️  Approved leave days: ${approvedLeaveDays}`);

    // 3️⃣ Company holidays (PAID)
    const holidaySql = `
      SELECT COUNT(*) AS holiday_days
      FROM em_annual_holiday
      WHERE holiday_date BETWEEN ? AND ?
    `;
    const holidayRow = await customSelectSqlQuery2(
      holidaySql,
      [monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
      false
    );
    const holidayDays = parseInt(holidayRow?.holiday_days || 0);

    console.log(`🎉 Company holidays: ${holidayDays}`);

    // 4️⃣ Attendance summary
    const paidDays = presentDays + approvedLeaveDays + holidayDays;
    const unpaidDays = totalDaysInMonth - paidDays < 0 ? 0 : totalDaysInMonth - paidDays;

    console.log(`✅ Total paid days: ${paidDays}`);
    console.log(`❌ Total unpaid days: ${unpaidDays}`);

    // 5️⃣ Salary - WITH CTC CALCULATION
    const salary = await selectOneData(
      "em_salary",
      "*",
      `employee_id = ${employee_id} AND last_salary_status = 'Y'`
    );

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Active salary structure not found for this employee",
        help: "Please create a salary record with last_salary_status = 'Y'"
      });
    }

    // ✨ CALCULATE CTC from all salary components
    const monthCtcAmount = 
      parseFloat(salary.basic_salary || 0) +
      parseFloat(salary.basic_pay || 0) +
      parseFloat(salary.basic_wages || 0) +
      parseFloat(salary.dearness_allowance || 0) +
      parseFloat(salary.house_rent_allowance || 0) +
      parseFloat(salary.conveyance_allowance || 0) +
      parseFloat(salary.medical_allowance || 0) +
      parseFloat(salary.special_allowance || 0) +
      parseFloat(salary.city_compensatory_allowance || 0) +
      parseFloat(salary.education_allowance || 0) +
      parseFloat(salary.uniform_allowance || 0) +
      parseFloat(salary.telephone_mobile_allowance || 0) +
      parseFloat(salary.internet_allowance || 0) +
      parseFloat(salary.fuel_allowance || 0) +
      parseFloat(salary.books_periodicals_allowance || 0) +
      parseFloat(salary.child_education_allowance || 0) +
      parseFloat(salary.hostel_allowance || 0) +
      parseFloat(salary.food_allowance || 0) +
      parseFloat(salary.other_allowance || 0) +
      parseFloat(salary.performance_bonus || 0) +
      parseFloat(salary.annual_bonus || 0) +
      parseFloat(salary.incentive || 0) +
      parseFloat(salary.sales_commission || 0) +
      parseFloat(salary.productivity_bonus || 0) +
      parseFloat(salary.profit_linked_bonus || 0) +
      parseFloat(salary.attendance_allowance || 0) +
      parseFloat(salary.shift_allowance || 0) +
      parseFloat(salary.night_shift_allowance || 0) +
      parseFloat(salary.weekend_allowance || 0) +
      parseFloat(salary.on_call_allowance || 0) +
      parseFloat(salary.project_allowance || 0) +
      parseFloat(salary.site_allowance || 0) +
      parseFloat(salary.location_allowance || 0) +
      parseFloat(salary.hazard_allowance || 0) +
      parseFloat(salary.hardship_allowance || 0);

    if (monthCtcAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Calculated CTC is 0 or invalid",
        help: "Please check if salary components (basic_salary, allowances, etc.) are filled in the em_salary table",
        employee_id
      });
    }

    console.log(`💰 Calculated Monthly CTC: ${monthCtcAmount.toFixed(2)}`);

    // ✨ CALCULATE DEDUCTIONS from relevant fields
    const monthDeductedAmount =
      parseFloat(salary.epf_employee_contribution || 0) +
      parseFloat(salary.esi_employee_contribution || 0) +
      parseFloat(salary.professional_tax || 0) +
      parseFloat(salary.labour_welfare_fund || 0) +
      parseFloat(salary.income_tax_tds || 0) +
      parseFloat(salary.loan_deduction || 0) +
      parseFloat(salary.advance_salary_recovery || 0) +
      parseFloat(salary.meal_deduction || 0) +
      parseFloat(salary.insurance_premium_employee || 0) +
      parseFloat(salary.late_coming_lop || 0) +
      parseFloat(salary.notice_period_recovery || 0) +
      parseFloat(salary.damage_penalty_deduction || 0);

    console.log(`💸 Total deductions: ${monthDeductedAmount.toFixed(2)}`);

    // 6️⃣ LOP calculation
    const perDaySalary = monthCtcAmount / totalDaysInMonth;
    const lopAmount = unpaidDays * perDaySalary;
    const salaryInHand = monthCtcAmount - monthDeductedAmount - lopAmount;

    console.log(`📉 Per day salary: ${perDaySalary.toFixed(2)}`);
    console.log(`📉 LOP amount: ${lopAmount.toFixed(2)}`);
    console.log(`💵 Salary in hand: ${salaryInHand.toFixed(2)}`);

    // 7️⃣ Insert payslip
    const insertDataObj = {
      employee_id: parseInt(employee_id),
      month_date: monthStart.format("YYYY-MM-DD"),
      total_present_in_months: parseInt(paidDays),
      total_absent_in_month: parseInt(unpaidDays),
      month_ctc_amount: parseFloat(monthCtcAmount.toFixed(2)),
      month_deducted_amount: parseFloat(monthDeductedAmount.toFixed(2)),
      salary_in_hand: parseFloat(salaryInHand.toFixed(2)),
      created_by: created_by || null,
      created_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    };

    console.log('📝 Inserting payslip data:', insertDataObj);

    const payslipId = await insertData(PAYSLIP_TABLE, insertDataObj);

    console.log(`✅ Payslip generated successfully with ID: ${payslipId}`);

    return res.status(201).json({
      success: true,
      message: "Payslip generated successfully",
      payslip_id: payslipId,
      data: insertDataObj,
    });
  } catch (err) {
    console.error("❌ generateMonthlyPayslip Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}
































/*-------------------------------------*/
// 📋 Get all payslips with employee details
async getAllPayslips(req, res) {
  try {
    const sql = `
      SELECT 
        p.payslip_id,
        p.employee_id,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        p.month_date,
        p.total_present_in_months,
        p.total_absent_in_month,
        p.month_ctc_amount,
        p.month_deducted_amount,
        p.salary_in_hand,
        p.created_by,
        p.created_at
      FROM ${PAYSLIP_TABLE} p
      LEFT JOIN em_employees e ON p.employee_id = e.employee_id
      ORDER BY p.month_date DESC, p.payslip_id DESC
    `;
    const rows = await customSelectSqlQuery(sql);

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("getAllPayslips Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// 🔍 Get single payslip by ID
async getPayslipById(req, res) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        p.*,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.email,
        e.phone,
        d.department_name,
        des.designation_name
      FROM ${PAYSLIP_TABLE} p
      LEFT JOIN em_employees e ON p.employee_id = e.employee_id
      LEFT JOIN em_departments d ON e.department_id = d.department_id
      LEFT JOIN em_designations des ON e.designation_id = des.designation_id
      WHERE p.payslip_id = ${id}
    `;
    const [row] = await customSelectSqlQuery(sql);

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found",
      });
    }

    res.json({
      success: true,
      data: row,
    });
  } catch (err) {
    console.error("getPayslipById Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// 👤 Get payslips by employee ID
async getPayslipsByEmployee(req, res) {
  try {
    const { employee_id } = req.params;

    const sql = `
      SELECT 
        p.*,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name
      FROM ${PAYSLIP_TABLE} p
      LEFT JOIN em_employees e ON p.employee_id = e.employee_id
      WHERE p.employee_id = ${employee_id}
      ORDER BY p.month_date DESC
    `;
    const rows = await customSelectSqlQuery(sql);

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("getPayslipsByEmployee Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// 📅 Get month-wise attendance and salary breakdown for an employee - UPDATED
async getMonthlyAttendanceBreakdown(req, res) {
  try {
    const { employee_id, month } = req.query;

    if (!employee_id || !month) {
      return res.status(400).json({
        success: false,
        message: "employee_id and month (YYYY-MM) are required",
      });
    }

    const monthStart = dayjs(`${month}-01`).startOf("month");
    const monthEnd = monthStart.endOf("month");
    const totalDaysInMonth = monthEnd.date();

    // 1️⃣ Present days
    const presentSql = `
      SELECT COUNT(DISTINCT work_date) AS present_days
      FROM em_attendance
      WHERE employee_id = ?
      AND work_date BETWEEN ? AND ?
    `;
    const presentRow = await customSelectSqlQuery2(
      presentSql,
      [employee_id, monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
      false
    );
    const presentDays = parseInt(presentRow?.present_days || 0);

    // 2️⃣ Approved leaves (PAID)
    const approvedLeaveSql = `
      SELECT 
        IFNULL(SUM(
          DATEDIFF(
            LEAST(end_date, ?),
            GREATEST(start_date, ?)
          ) + 1
        ), 0) AS approved_leave_days
      FROM em_leave_requests
      WHERE employee_id = ?
      AND status = 'APPROVED'
      AND start_date <= ?
      AND end_date >= ?
    `;
    const approvedLeaveRow = await customSelectSqlQuery2(
      approvedLeaveSql,
      [
        monthEnd.format("YYYY-MM-DD"),
        monthStart.format("YYYY-MM-DD"),
        employee_id,
        monthEnd.format("YYYY-MM-DD"),
        monthStart.format("YYYY-MM-DD"),
      ],
      false
    );
    const approvedLeaveDays = parseInt(approvedLeaveRow?.approved_leave_days || 0);

    // 3️⃣ Rejected/Pending leaves (UNPAID)
    const rejectedLeaveSql = `
      SELECT 
        IFNULL(SUM(
          DATEDIFF(
            LEAST(end_date, ?),
            GREATEST(start_date, ?)
          ) + 1
        ), 0) AS rejected_leave_days
      FROM em_leave_requests
      WHERE employee_id = ?
      AND status IN ('REJECTED', 'PENDING')
      AND start_date <= ?
      AND end_date >= ?
    `;
    const rejectedLeaveRow = await customSelectSqlQuery2(
      rejectedLeaveSql,
      [
        monthEnd.format("YYYY-MM-DD"),
        monthStart.format("YYYY-MM-DD"),
        employee_id,
        monthEnd.format("YYYY-MM-DD"),
        monthStart.format("YYYY-MM-DD"),
      ],
      false
    );
    const rejectedLeaveDays = parseInt(rejectedLeaveRow?.rejected_leave_days || 0);

    // 4️⃣ Company holidays (PAID)
    const holidaySql = `
      SELECT 
        COUNT(*) AS holiday_days,
        GROUP_CONCAT(holiday_name SEPARATOR ', ') AS holiday_names
      FROM em_annual_holiday
      WHERE holiday_date BETWEEN ? AND ?
    `;
    const holidayRow = await customSelectSqlQuery2(
      holidaySql,
      [monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
      false
    );
    const holidayDays = parseInt(holidayRow?.holiday_days || 0);
    const holidayNames = holidayRow?.holiday_names || "None";

    // 5️⃣ Calculate paid and unpaid days
    const paidDays = presentDays + approvedLeaveDays + holidayDays;
    const unpaidDays = totalDaysInMonth - paidDays < 0 ? 0 : totalDaysInMonth - paidDays;

    // 6️⃣ Salary breakdown - WITH CTC CALCULATION
    const salary = await selectOneData(
      "em_salary",
      "*",
      `employee_id = ${employee_id} AND last_salary_status = 'Y'`
    );

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Active salary structure not found",
      });
    }

    // ✨ CALCULATE CTC
    const monthCtcAmount = 
      parseFloat(salary.basic_salary || 0) +
      parseFloat(salary.basic_pay || 0) +
      parseFloat(salary.basic_wages || 0) +
      parseFloat(salary.dearness_allowance || 0) +
      parseFloat(salary.house_rent_allowance || 0) +
      parseFloat(salary.conveyance_allowance || 0) +
      parseFloat(salary.medical_allowance || 0) +
      parseFloat(salary.special_allowance || 0) +
      parseFloat(salary.city_compensatory_allowance || 0) +
      parseFloat(salary.education_allowance || 0) +
      parseFloat(salary.uniform_allowance || 0) +
      parseFloat(salary.telephone_mobile_allowance || 0) +
      parseFloat(salary.internet_allowance || 0) +
      parseFloat(salary.fuel_allowance || 0) +
      parseFloat(salary.books_periodicals_allowance || 0) +
      parseFloat(salary.child_education_allowance || 0) +
      parseFloat(salary.hostel_allowance || 0) +
      parseFloat(salary.food_allowance || 0) +
      parseFloat(salary.other_allowance || 0) +
      parseFloat(salary.performance_bonus || 0) +
      parseFloat(salary.annual_bonus || 0) +
      parseFloat(salary.incentive || 0) +
      parseFloat(salary.sales_commission || 0) +
      parseFloat(salary.productivity_bonus || 0) +
      parseFloat(salary.profit_linked_bonus || 0) +
      parseFloat(salary.attendance_allowance || 0) +
      parseFloat(salary.shift_allowance || 0) +
      parseFloat(salary.night_shift_allowance || 0) +
      parseFloat(salary.weekend_allowance || 0) +
      parseFloat(salary.on_call_allowance || 0) +
      parseFloat(salary.project_allowance || 0) +
      parseFloat(salary.site_allowance || 0) +
      parseFloat(salary.location_allowance || 0) +
      parseFloat(salary.hazard_allowance || 0) +
      parseFloat(salary.hardship_allowance || 0);

    const perDaySalary = monthCtcAmount / totalDaysInMonth;
    const earnedSalary = perDaySalary * presentDays;
    const lopAmount = unpaidDays * perDaySalary;

    const deductions = {
      epf_employee_contribution: parseFloat(salary.epf_employee_contribution || 0),
      esi_employee_contribution: parseFloat(salary.esi_employee_contribution || 0),
      professional_tax: parseFloat(salary.professional_tax || 0),
      labour_welfare_fund: parseFloat(salary.labour_welfare_fund || 0),
      income_tax_tds: parseFloat(salary.income_tax_tds || 0),
      loan_deduction: parseFloat(salary.loan_deduction || 0),
      advance_salary_recovery: parseFloat(salary.advance_salary_recovery || 0),
      meal_deduction: parseFloat(salary.meal_deduction || 0),
      insurance_premium_employee: parseFloat(salary.insurance_premium_employee || 0),
      late_coming_lop: parseFloat(salary.late_coming_lop || 0),
      notice_period_recovery: parseFloat(salary.notice_period_recovery || 0),
      damage_penalty_deduction: parseFloat(salary.damage_penalty_deduction || 0),
    };

    const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);

    const salaryInHand = monthCtcAmount - totalDeductions - lopAmount;

    res.json({
      success: true,
      data: {
        employee_id,
        month,
        total_days_in_month: totalDaysInMonth,
        attendance_breakdown: {
          present_days: presentDays,
          approved_leave_days: approvedLeaveDays,
          rejected_pending_leave_days: rejectedLeaveDays,
          company_holidays: holidayDays,
          holiday_names: holidayNames,
          total_paid_days: paidDays,
          total_unpaid_days: unpaidDays,
        },
        salary_breakdown: {
          month_ctc: monthCtcAmount.toFixed(2),
          per_day_salary: perDaySalary.toFixed(2),
          earned_salary_for_present_days: earnedSalary.toFixed(2),
          deductions: {
            epf_employee_contribution: deductions.epf_employee_contribution.toFixed(2),
            esi_employee_contribution: deductions.esi_employee_contribution.toFixed(2),
            professional_tax: deductions.professional_tax.toFixed(2),
            labour_welfare_fund: deductions.labour_welfare_fund.toFixed(2),
            income_tax_tds: deductions.income_tax_tds.toFixed(2),
            loan_deduction: deductions.loan_deduction.toFixed(2),
            advance_salary_recovery: deductions.advance_salary_recovery.toFixed(2),
            meal_deduction: deductions.meal_deduction.toFixed(2),
            insurance_premium_employee: deductions.insurance_premium_employee.toFixed(2),
            late_coming_lop: deductions.late_coming_lop.toFixed(2),
            notice_period_recovery: deductions.notice_period_recovery.toFixed(2),
            damage_penalty_deduction: deductions.damage_penalty_deduction.toFixed(2),
            total: totalDeductions.toFixed(2),
          },
          lop_deduction: lopAmount.toFixed(2),
          net_salary_in_hand: salaryInHand.toFixed(2),
        },
      },
    });
  } catch (err) {
    console.error("getMonthlyAttendanceBreakdown Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// 📊 Get employee daily income calculation - UPDATED
async getEmployeeDailyIncome(req, res) {
  try {
    const { employee_id, month } = req.query;

    if (!employee_id || !month) {
      return res.status(400).json({
        success: false,
        message: "employee_id and month (YYYY-MM) are required",
      });
    }

    const monthStart = dayjs(`${month}-01`).startOf("month");
    const monthEnd = monthStart.endOf("month");
    const totalDaysInMonth = monthEnd.date();

    // Get salary - WITH CTC CALCULATION
    const salary = await selectOneData(
      "em_salary",
      "*",
      `employee_id = ${employee_id} AND last_salary_status = 'Y'`
    );

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Active salary structure not found",
      });
    }

    // ✨ CALCULATE CTC
    const monthCtcAmount = 
      parseFloat(salary.basic_salary || 0) +
      parseFloat(salary.basic_pay || 0) +
      parseFloat(salary.basic_wages || 0) +
      parseFloat(salary.dearness_allowance || 0) +
      parseFloat(salary.house_rent_allowance || 0) +
      parseFloat(salary.conveyance_allowance || 0) +
      parseFloat(salary.medical_allowance || 0) +
      parseFloat(salary.special_allowance || 0) +
      parseFloat(salary.city_compensatory_allowance || 0) +
      parseFloat(salary.education_allowance || 0) +
      parseFloat(salary.uniform_allowance || 0) +
      parseFloat(salary.telephone_mobile_allowance || 0) +
      parseFloat(salary.internet_allowance || 0) +
      parseFloat(salary.fuel_allowance || 0) +
      parseFloat(salary.books_periodicals_allowance || 0) +
      parseFloat(salary.child_education_allowance || 0) +
      parseFloat(salary.hostel_allowance || 0) +
      parseFloat(salary.food_allowance || 0) +
      parseFloat(salary.other_allowance || 0) +
      parseFloat(salary.performance_bonus || 0) +
      parseFloat(salary.annual_bonus || 0) +
      parseFloat(salary.incentive || 0) +
      parseFloat(salary.sales_commission || 0) +
      parseFloat(salary.productivity_bonus || 0) +
      parseFloat(salary.profit_linked_bonus || 0) +
      parseFloat(salary.attendance_allowance || 0) +
      parseFloat(salary.shift_allowance || 0) +
      parseFloat(salary.night_shift_allowance || 0) +
      parseFloat(salary.weekend_allowance || 0) +
      parseFloat(salary.on_call_allowance || 0) +
      parseFloat(salary.project_allowance || 0) +
      parseFloat(salary.site_allowance || 0) +
      parseFloat(salary.location_allowance || 0) +
      parseFloat(salary.hazard_allowance || 0) +
      parseFloat(salary.hardship_allowance || 0);

    const perDaySalary = monthCtcAmount / totalDaysInMonth;

    // Get present days
    const presentSql = `
      SELECT COUNT(DISTINCT work_date) AS present_days
      FROM em_attendance
      WHERE employee_id = ?
      AND work_date BETWEEN ? AND ?
    `;
    const presentRow = await customSelectSqlQuery2(
      presentSql,
      [employee_id, monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
      false
    );
    const presentDays = parseInt(presentRow?.present_days || 0);

    const dailyIncome = perDaySalary * presentDays;

    res.json({
      success: true,
      data: {
        employee_id,
        month,
        total_days_in_month: totalDaysInMonth,
        month_ctc_amount: monthCtcAmount.toFixed(2),
        per_day_salary: perDaySalary.toFixed(2),
        present_days: presentDays,
        total_daily_income_for_present_days: dailyIncome.toFixed(2),
        calculation: `${monthCtcAmount.toFixed(2)} / ${totalDaysInMonth} * ${presentDays} = ${dailyIncome.toFixed(2)}`,
      },
    });
  } catch (err) {
    console.error("getEmployeeDailyIncome Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// 🔄 Update payslip
async updatePayslip(req, res) {
  try {
    const { id } = req.params;
    const {
      total_present_in_months,
      total_absent_in_month,
      month_ctc_amount,
      month_deducted_amount,
      salary_in_hand,
    } = req.body;

    const existing = await selectOneData(
      PAYSLIP_TABLE,
      "*",
      `payslip_id = ${id}`
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found",
      });
    }

    const updateFields = { updated_at: new Date() };

    if (total_present_in_months !== undefined)
      updateFields.total_present_in_months = parseInt(total_present_in_months);
    if (total_absent_in_month !== undefined)
      updateFields.total_absent_in_month = parseInt(total_absent_in_month);
    if (month_ctc_amount !== undefined)
      updateFields.month_ctc_amount = parseFloat(month_ctc_amount);
    if (month_deducted_amount !== undefined)
      updateFields.month_deducted_amount = parseFloat(month_deducted_amount);
    if (salary_in_hand !== undefined)
      updateFields.salary_in_hand = parseFloat(salary_in_hand);

    await updateData(PAYSLIP_TABLE, updateFields, `payslip_id = ${id}`);

    res.json({
      success: true,
      message: "Payslip updated successfully",
    });
  } catch (err) {
    console.error("updatePayslip Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// // 📊 Generate payslip for single employee for specific month - UPDATED WITH CTC CALCULATION
// async generateMonthlyPayslip(req, res) {
//   try {
//     const { employee_id, month } = req.body;
//     const created_by = req.user?.id || null;

//     if (!employee_id || !month) {
//       return res.status(400).json({
//         success: false,
//         message: "employee_id and month (YYYY-MM) are required",
//       });
//     }

//     console.log(`\n👤 Generating payslip for employee ${employee_id}, month ${month}`);

//     // 📅 Month calculations
//     const monthStart = dayjs(`${month}-01`).startOf("month");
//     const monthEnd = monthStart.endOf("month");
//     const totalDaysInMonth = monthEnd.date();

//     console.log('📅 Total days in month:', totalDaysInMonth);

//     // Check if payslip already exists
//     const existing = await selectOneData(
//       PAYSLIP_TABLE,
//       "payslip_id",
//       `employee_id = ${employee_id} AND month_date = '${monthStart.format("YYYY-MM-DD")}'`
//     );

//     if (existing) {
//       return res.status(400).json({
//         success: false,
//         message: "Payslip already exists for this month",
//         payslip_id: existing.payslip_id
//       });
//     }

//     // 1️⃣ Present days
//     const presentSql = `
//       SELECT COUNT(DISTINCT work_date) AS present_days
//       FROM em_attendance
//       WHERE employee_id = ?
//       AND work_date BETWEEN ? AND ?
//     `;
//     const presentRow = await customSelectSqlQuery2(
//       presentSql,
//       [employee_id, monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
//       false
//     );
//     const presentDays = parseInt(presentRow?.present_days || 0);

//     console.log(`📊 Present days: ${presentDays}`);

//     // 2️⃣ Approved leave days (PAID)
//     const approvedLeaveSql = `
//       SELECT IFNULL(SUM(
//         DATEDIFF(
//           LEAST(end_date, ?),
//           GREATEST(start_date, ?)
//         ) + 1
//       ), 0) AS approved_leave_days
//       FROM em_leave_requests
//       WHERE employee_id = ?
//       AND status = 'APPROVED'
//       AND start_date <= ?
//       AND end_date >= ?
//     `;
//     const leaveRow = await customSelectSqlQuery2(
//       approvedLeaveSql,
//       [
//         monthEnd.format("YYYY-MM-DD"),
//         monthStart.format("YYYY-MM-DD"),
//         employee_id,
//         monthEnd.format("YYYY-MM-DD"),
//         monthStart.format("YYYY-MM-DD"),
//       ],
//       false
//     );
//     const approvedLeaveDays = parseInt(leaveRow?.approved_leave_days || 0);

//     console.log(`🏖️  Approved leave days: ${approvedLeaveDays}`);

//     // 3️⃣ Company holidays (PAID)
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
//     const holidayDays = parseInt(holidayRow?.holiday_days || 0);

//     console.log(`🎉 Company holidays: ${holidayDays}`);

//     // 4️⃣ Attendance summary
//     const paidDays = presentDays + approvedLeaveDays + holidayDays;
//     const unpaidDays = totalDaysInMonth - paidDays < 0 ? 0 : totalDaysInMonth - paidDays;

//     console.log(`✅ Total paid days: ${paidDays}`);
//     console.log(`❌ Total unpaid days: ${unpaidDays}`);

//     // 5️⃣ Salary - WITH CTC CALCULATION
//     const salary = await selectOneData(
//       "em_salary",
//       "*",
//       `employee_id = ${employee_id} AND last_salary_status = 'Y'`
//     );

//     if (!salary) {
//       return res.status(404).json({
//         success: false,
//         message: "Active salary structure not found for this employee",
//         help: "Please create a salary record with last_salary_status = 'Y'"
//       });
//     }

//     // ✨ CALCULATE CTC from all salary components
//     const monthCtcAmount = 
//       parseFloat(salary.basic_salary || 0) +
//       parseFloat(salary.basic_pay || 0) +
//       parseFloat(salary.basic_wages || 0) +
//       parseFloat(salary.dearness_allowance || 0) +
//       parseFloat(salary.house_rent_allowance || 0) +
//       parseFloat(salary.conveyance_allowance || 0) +
//       parseFloat(salary.medical_allowance || 0) +
//       parseFloat(salary.special_allowance || 0) +
//       parseFloat(salary.city_compensatory_allowance || 0) +
//       parseFloat(salary.education_allowance || 0) +
//       parseFloat(salary.uniform_allowance || 0) +
//       parseFloat(salary.telephone_mobile_allowance || 0) +
//       parseFloat(salary.internet_allowance || 0) +
//       parseFloat(salary.fuel_allowance || 0) +
//       parseFloat(salary.books_periodicals_allowance || 0) +
//       parseFloat(salary.child_education_allowance || 0) +
//       parseFloat(salary.hostel_allowance || 0) +
//       parseFloat(salary.food_allowance || 0) +
//       parseFloat(salary.other_allowance || 0) +
//       parseFloat(salary.performance_bonus || 0) +
//       parseFloat(salary.annual_bonus || 0) +
//       parseFloat(salary.incentive || 0) +
//       parseFloat(salary.sales_commission || 0) +
//       parseFloat(salary.productivity_bonus || 0) +
//       parseFloat(salary.profit_linked_bonus || 0) +
//       parseFloat(salary.attendance_allowance || 0) +
//       parseFloat(salary.shift_allowance || 0) +
//       parseFloat(salary.night_shift_allowance || 0) +
//       parseFloat(salary.weekend_allowance || 0) +
//       parseFloat(salary.on_call_allowance || 0) +
//       parseFloat(salary.project_allowance || 0) +
//       parseFloat(salary.site_allowance || 0) +
//       parseFloat(salary.location_allowance || 0) +
//       parseFloat(salary.hazard_allowance || 0) +
//       parseFloat(salary.hardship_allowance || 0);

//     if (monthCtcAmount <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Calculated CTC is 0 or invalid",
//         help: "Please check if salary components (basic_salary, allowances, etc.) are filled in the em_salary table",
//         employee_id
//       });
//     }

//     console.log(`💰 Calculated Monthly CTC: ${monthCtcAmount.toFixed(2)}`);

//     // ✨ CALCULATE DEDUCTIONS from relevant fields
//     const monthDeductedAmount =
//       parseFloat(salary.epf_employee_contribution || 0) +
//       parseFloat(salary.esi_employee_contribution || 0) +
//       parseFloat(salary.professional_tax || 0) +
//       parseFloat(salary.labour_welfare_fund || 0) +
//       parseFloat(salary.income_tax_tds || 0) +
//       parseFloat(salary.loan_deduction || 0) +
//       parseFloat(salary.advance_salary_recovery || 0) +
//       parseFloat(salary.meal_deduction || 0) +
//       parseFloat(salary.insurance_premium_employee || 0) +
//       parseFloat(salary.late_coming_lop || 0) +
//       parseFloat(salary.notice_period_recovery || 0) +
//       parseFloat(salary.damage_penalty_deduction || 0);

//     console.log(`💸 Total deductions: ${monthDeductedAmount.toFixed(2)}`);

//     // 6️⃣ LOP calculation
//     const perDaySalary = monthCtcAmount / totalDaysInMonth;
//     const lopAmount = unpaidDays * perDaySalary;
//     const salaryInHand = monthCtcAmount - monthDeductedAmount - lopAmount;

//     console.log(`📉 Per day salary: ${perDaySalary.toFixed(2)}`);
//     console.log(`📉 LOP amount: ${lopAmount.toFixed(2)}`);
//     console.log(`💵 Salary in hand: ${salaryInHand.toFixed(2)}`);

//     // 7️⃣ Insert payslip
//     const insertDataObj = {
//       employee_id,
//       month_date: monthStart.format("YYYY-MM-DD"),
//       total_present_in_months: paidDays,
//       total_absent_in_month: unpaidDays,
//       month_ctc_amount: parseFloat(monthCtcAmount.toFixed(2)),
//       month_deducted_amount: parseFloat(monthDeductedAmount.toFixed(2)),
//       salary_in_hand: parseFloat(salaryInHand.toFixed(2)),
//       created_by,
//       created_at: new Date(),
//     };

//     console.log('📝 Inserting payslip data:', insertDataObj);

//     const payslipId = await insertData(PAYSLIP_TABLE, insertDataObj);

//     console.log(`✅ Payslip generated successfully with ID: ${payslipId}`);

//     return res.status(201).json({
//       success: true,
//       message: "Payslip generated successfully",
//       payslip_id: payslipId,
//       data: insertDataObj,
//     });
//   } catch (err) {
//     console.error("❌ generateMonthlyPayslip Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//       stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//     });
//   }
// }

// // 📋 Get all payslips with employee details
// async getAllPayslips(req, res) {
//   try {
//     const sql = `
//       SELECT 
//         p.payslip_id,
//         p.employee_id,
//         CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
//         p.month_date,
//         p.total_present_in_months,
//         p.total_absent_in_month,
//         p.month_ctc_amount,
//         p.month_deducted_amount,
//         p.salary_in_hand,
//         p.created_by,
//         p.created_at
//       FROM ${PAYSLIP_TABLE} p
//       LEFT JOIN em_employees e ON p.employee_id = e.employee_id
//       ORDER BY p.month_date DESC, p.payslip_id DESC
//     `;
//     const rows = await customSelectSqlQuery(sql);

//     res.json({
//       success: true,
//       count: rows.length,
//       data: rows,
//     });
//   } catch (err) {
//     console.error("getAllPayslips Error:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// }

// // 🔍 Get single payslip by ID
// async getPayslipById(req, res) {
//   try {
//     const { id } = req.params;

//     const sql = `
//       SELECT 
//         p.*,
//         CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
//         e.email,
//         e.phone,
//         d.department_name,
//         des.designation_name
//       FROM ${PAYSLIP_TABLE} p
//       LEFT JOIN em_employees e ON p.employee_id = e.employee_id
//       LEFT JOIN em_departments d ON e.department_id = d.department_id
//       LEFT JOIN em_designations des ON e.designation_id = des.designation_id
//       WHERE p.payslip_id = ${id}
//     `;
//     const [row] = await customSelectSqlQuery(sql);

//     if (!row) {
//       return res.status(404).json({
//         success: false,
//         message: "Payslip not found",
//       });
//     }

//     res.json({
//       success: true,
//       data: row,
//     });
//   } catch (err) {
//     console.error("getPayslipById Error:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// }

// // 👤 Get payslips by employee ID
// async getPayslipsByEmployee(req, res) {
//   try {
//     const { employee_id } = req.params;

//     const sql = `
//       SELECT 
//         p.*,
//         CONCAT(e.first_name, ' ', e.last_name) AS employee_name
//       FROM ${PAYSLIP_TABLE} p
//       LEFT JOIN em_employees e ON p.employee_id = e.employee_id
//       WHERE p.employee_id = ${employee_id}
//       ORDER BY p.month_date DESC
//     `;
//     const rows = await customSelectSqlQuery(sql);

//     res.json({
//       success: true,
//       count: rows.length,
//       data: rows,
//     });
//   } catch (err) {
//     console.error("getPayslipsByEmployee Error:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// }

// // 📅 Get month-wise attendance and salary breakdown for an employee - UPDATED
// async getMonthlyAttendanceBreakdown(req, res) {
//   try {
//     const { employee_id, month } = req.query;

//     if (!employee_id || !month) {
//       return res.status(400).json({
//         success: false,
//         message: "employee_id and month (YYYY-MM) are required",
//       });
//     }

//     const monthStart = dayjs(`${month}-01`).startOf("month");
//     const monthEnd = monthStart.endOf("month");
//     const totalDaysInMonth = monthEnd.date();

//     // 1️⃣ Present days
//     const presentSql = `
//       SELECT COUNT(DISTINCT work_date) AS present_days
//       FROM em_attendance
//       WHERE employee_id = ?
//       AND work_date BETWEEN ? AND ?
//     `;
//     const presentRow = await customSelectSqlQuery2(
//       presentSql,
//       [employee_id, monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
//       false
//     );
//     const presentDays = parseInt(presentRow?.present_days || 0);

//     // 2️⃣ Approved leaves (PAID)
//     const approvedLeaveSql = `
//       SELECT 
//         IFNULL(SUM(
//           DATEDIFF(
//             LEAST(end_date, ?),
//             GREATEST(start_date, ?)
//           ) + 1
//         ), 0) AS approved_leave_days
//       FROM em_leave_requests
//       WHERE employee_id = ?
//       AND status = 'APPROVED'
//       AND start_date <= ?
//       AND end_date >= ?
//     `;
//     const approvedLeaveRow = await customSelectSqlQuery2(
//       approvedLeaveSql,
//       [
//         monthEnd.format("YYYY-MM-DD"),
//         monthStart.format("YYYY-MM-DD"),
//         employee_id,
//         monthEnd.format("YYYY-MM-DD"),
//         monthStart.format("YYYY-MM-DD"),
//       ],
//       false
//     );
//     const approvedLeaveDays = parseInt(approvedLeaveRow?.approved_leave_days || 0);

//     // 3️⃣ Rejected/Pending leaves (UNPAID)
//     const rejectedLeaveSql = `
//       SELECT 
//         IFNULL(SUM(
//           DATEDIFF(
//             LEAST(end_date, ?),
//             GREATEST(start_date, ?)
//           ) + 1
//         ), 0) AS rejected_leave_days
//       FROM em_leave_requests
//       WHERE employee_id = ?
//       AND status IN ('REJECTED', 'PENDING')
//       AND start_date <= ?
//       AND end_date >= ?
//     `;
//     const rejectedLeaveRow = await customSelectSqlQuery2(
//       rejectedLeaveSql,
//       [
//         monthEnd.format("YYYY-MM-DD"),
//         monthStart.format("YYYY-MM-DD"),
//         employee_id,
//         monthEnd.format("YYYY-MM-DD"),
//         monthStart.format("YYYY-MM-DD"),
//       ],
//       false
//     );
//     const rejectedLeaveDays = parseInt(rejectedLeaveRow?.rejected_leave_days || 0);

//     // 4️⃣ Company holidays (PAID)
//     const holidaySql = `
//       SELECT 
//         COUNT(*) AS holiday_days,
//         GROUP_CONCAT(holiday_name SEPARATOR ', ') AS holiday_names
//       FROM em_annual_holiday
//       WHERE holiday_date BETWEEN ? AND ?
//     `;
//     const holidayRow = await customSelectSqlQuery2(
//       holidaySql,
//       [monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
//       false
//     );
//     const holidayDays = parseInt(holidayRow?.holiday_days || 0);
//     const holidayNames = holidayRow?.holiday_names || "None";

//     // 5️⃣ Calculate paid and unpaid days
//     const paidDays = presentDays + approvedLeaveDays + holidayDays;
//     const unpaidDays = totalDaysInMonth - paidDays < 0 ? 0 : totalDaysInMonth - paidDays;

//     // 6️⃣ Salary breakdown - WITH CTC CALCULATION
//     const salary = await selectOneData(
//       "em_salary",
//       "*",
//       `employee_id = ${employee_id} AND last_salary_status = 'Y'`
//     );

//     if (!salary) {
//       return res.status(404).json({
//         success: false,
//         message: "Active salary structure not found",
//       });
//     }

//     // ✨ CALCULATE CTC
//     const monthCtcAmount = 
//       parseFloat(salary.basic_salary || 0) +
//       parseFloat(salary.basic_pay || 0) +
//       parseFloat(salary.basic_wages || 0) +
//       parseFloat(salary.dearness_allowance || 0) +
//       parseFloat(salary.house_rent_allowance || 0) +
//       parseFloat(salary.conveyance_allowance || 0) +
//       parseFloat(salary.medical_allowance || 0) +
//       parseFloat(salary.special_allowance || 0) +
//       parseFloat(salary.city_compensatory_allowance || 0) +
//       parseFloat(salary.education_allowance || 0) +
//       parseFloat(salary.uniform_allowance || 0) +
//       parseFloat(salary.telephone_mobile_allowance || 0) +
//       parseFloat(salary.internet_allowance || 0) +
//       parseFloat(salary.fuel_allowance || 0) +
//       parseFloat(salary.books_periodicals_allowance || 0) +
//       parseFloat(salary.child_education_allowance || 0) +
//       parseFloat(salary.hostel_allowance || 0) +
//       parseFloat(salary.food_allowance || 0) +
//       parseFloat(salary.other_allowance || 0) +
//       parseFloat(salary.performance_bonus || 0) +
//       parseFloat(salary.annual_bonus || 0) +
//       parseFloat(salary.incentive || 0) +
//       parseFloat(salary.sales_commission || 0) +
//       parseFloat(salary.productivity_bonus || 0) +
//       parseFloat(salary.profit_linked_bonus || 0) +
//       parseFloat(salary.attendance_allowance || 0) +
//       parseFloat(salary.shift_allowance || 0) +
//       parseFloat(salary.night_shift_allowance || 0) +
//       parseFloat(salary.weekend_allowance || 0) +
//       parseFloat(salary.on_call_allowance || 0) +
//       parseFloat(salary.project_allowance || 0) +
//       parseFloat(salary.site_allowance || 0) +
//       parseFloat(salary.location_allowance || 0) +
//       parseFloat(salary.hazard_allowance || 0) +
//       parseFloat(salary.hardship_allowance || 0);

//     const perDaySalary = monthCtcAmount / totalDaysInMonth;
//     const earnedSalary = perDaySalary * presentDays;
//     const lopAmount = unpaidDays * perDaySalary;

//     const deductions = {
//       epf_employee_contribution: parseFloat(salary.epf_employee_contribution || 0),
//       esi_employee_contribution: parseFloat(salary.esi_employee_contribution || 0),
//       professional_tax: parseFloat(salary.professional_tax || 0),
//       labour_welfare_fund: parseFloat(salary.labour_welfare_fund || 0),
//       income_tax_tds: parseFloat(salary.income_tax_tds || 0),
//       loan_deduction: parseFloat(salary.loan_deduction || 0),
//       advance_salary_recovery: parseFloat(salary.advance_salary_recovery || 0),
//       meal_deduction: parseFloat(salary.meal_deduction || 0),
//       insurance_premium_employee: parseFloat(salary.insurance_premium_employee || 0),
//       late_coming_lop: parseFloat(salary.late_coming_lop || 0),
//       notice_period_recovery: parseFloat(salary.notice_period_recovery || 0),
//       damage_penalty_deduction: parseFloat(salary.damage_penalty_deduction || 0),
//     };

//     const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);

//     const salaryInHand = monthCtcAmount - totalDeductions - lopAmount;

//     res.json({
//       success: true,
//       data: {
//         employee_id,
//         month,
//         total_days_in_month: totalDaysInMonth,
//         attendance_breakdown: {
//           present_days: presentDays,
//           approved_leave_days: approvedLeaveDays,
//           rejected_pending_leave_days: rejectedLeaveDays,
//           company_holidays: holidayDays,
//           holiday_names: holidayNames,
//           total_paid_days: paidDays,
//           total_unpaid_days: unpaidDays,
//         },
//         salary_breakdown: {
//           month_ctc: monthCtcAmount.toFixed(2),
//           per_day_salary: perDaySalary.toFixed(2),
//           earned_salary_for_present_days: earnedSalary.toFixed(2),
//           deductions: {
//             epf_employee_contribution: deductions.epf_employee_contribution.toFixed(2),
//             esi_employee_contribution: deductions.esi_employee_contribution.toFixed(2),
//             professional_tax: deductions.professional_tax.toFixed(2),
//             labour_welfare_fund: deductions.labour_welfare_fund.toFixed(2),
//             income_tax_tds: deductions.income_tax_tds.toFixed(2),
//             loan_deduction: deductions.loan_deduction.toFixed(2),
//             advance_salary_recovery: deductions.advance_salary_recovery.toFixed(2),
//             meal_deduction: deductions.meal_deduction.toFixed(2),
//             insurance_premium_employee: deductions.insurance_premium_employee.toFixed(2),
//             late_coming_lop: deductions.late_coming_lop.toFixed(2),
//             notice_period_recovery: deductions.notice_period_recovery.toFixed(2),
//             damage_penalty_deduction: deductions.damage_penalty_deduction.toFixed(2),
//             total: totalDeductions.toFixed(2),
//           },
//           lop_deduction: lopAmount.toFixed(2),
//           net_salary_in_hand: salaryInHand.toFixed(2),
//         },
//       },
//     });
//   } catch (err) {
//     console.error("getMonthlyAttendanceBreakdown Error:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// }

// // 📊 Get employee daily income calculation - UPDATED
// async getEmployeeDailyIncome(req, res) {
//   try {
//     const { employee_id, month } = req.query;

//     if (!employee_id || !month) {
//       return res.status(400).json({
//         success: false,
//         message: "employee_id and month (YYYY-MM) are required",
//       });
//     }

//     const monthStart = dayjs(`${month}-01`).startOf("month");
//     const monthEnd = monthStart.endOf("month");
//     const totalDaysInMonth = monthEnd.date();

//     // Get salary - WITH CTC CALCULATION
//     const salary = await selectOneData(
//       "em_salary",
//       "*",
//       `employee_id = ${employee_id} AND last_salary_status = 'Y'`
//     );

//     if (!salary) {
//       return res.status(404).json({
//         success: false,
//         message: "Active salary structure not found",
//       });
//     }

//     // ✨ CALCULATE CTC
//     const monthCtcAmount = 
//       parseFloat(salary.basic_salary || 0) +
//       parseFloat(salary.basic_pay || 0) +
//       parseFloat(salary.basic_wages || 0) +
//       parseFloat(salary.dearness_allowance || 0) +
//       parseFloat(salary.house_rent_allowance || 0) +
//       parseFloat(salary.conveyance_allowance || 0) +
//       parseFloat(salary.medical_allowance || 0) +
//       parseFloat(salary.special_allowance || 0) +
//       parseFloat(salary.city_compensatory_allowance || 0) +
//       parseFloat(salary.education_allowance || 0) +
//       parseFloat(salary.uniform_allowance || 0) +
//       parseFloat(salary.telephone_mobile_allowance || 0) +
//       parseFloat(salary.internet_allowance || 0) +
//       parseFloat(salary.fuel_allowance || 0) +
//       parseFloat(salary.books_periodicals_allowance || 0) +
//       parseFloat(salary.child_education_allowance || 0) +
//       parseFloat(salary.hostel_allowance || 0) +
//       parseFloat(salary.food_allowance || 0) +
//       parseFloat(salary.other_allowance || 0) +
//       parseFloat(salary.performance_bonus || 0) +
//       parseFloat(salary.annual_bonus || 0) +
//       parseFloat(salary.incentive || 0) +
//       parseFloat(salary.sales_commission || 0) +
//       parseFloat(salary.productivity_bonus || 0) +
//       parseFloat(salary.profit_linked_bonus || 0) +
//       parseFloat(salary.attendance_allowance || 0) +
//       parseFloat(salary.shift_allowance || 0) +
//       parseFloat(salary.night_shift_allowance || 0) +
//       parseFloat(salary.weekend_allowance || 0) +
//       parseFloat(salary.on_call_allowance || 0) +
//       parseFloat(salary.project_allowance || 0) +
//       parseFloat(salary.site_allowance || 0) +
//       parseFloat(salary.location_allowance || 0) +
//       parseFloat(salary.hazard_allowance || 0) +
//       parseFloat(salary.hardship_allowance || 0);

//     const perDaySalary = monthCtcAmount / totalDaysInMonth;

//     // Get present days
//     const presentSql = `
//       SELECT COUNT(DISTINCT work_date) AS present_days
//       FROM em_attendance
//       WHERE employee_id = ?
//       AND work_date BETWEEN ? AND ?
//     `;
//     const presentRow = await customSelectSqlQuery2(
//       presentSql,
//       [employee_id, monthStart.format("YYYY-MM-DD"), monthEnd.format("YYYY-MM-DD")],
//       false
//     );
//     const presentDays = parseInt(presentRow?.present_days || 0);

//     const dailyIncome = perDaySalary * presentDays;

//     res.json({
//       success: true,
//       data: {
//         employee_id,
//         month,
//         total_days_in_month: totalDaysInMonth,
//         month_ctc_amount: monthCtcAmount.toFixed(2),
//         per_day_salary: perDaySalary.toFixed(2),
//         present_days: presentDays,
//         total_daily_income_for_present_days: dailyIncome.toFixed(2),
//         calculation: `${monthCtcAmount.toFixed(2)} / ${totalDaysInMonth} * ${presentDays} = ${dailyIncome.toFixed(2)}`,
//       },
//     });
//   } catch (err) {
//     console.error("getEmployeeDailyIncome Error:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// }

// //  Update payslip
// async updatePayslip(req, res) {
//   try {
//     const { id } = req.params;
//     const {
//       total_present_in_months,
//       total_absent_in_month,
//       month_ctc_amount,
//       month_deducted_amount,
//       salary_in_hand,
//     } = req.body;

//     const existing = await selectOneData(
//       PAYSLIP_TABLE,
//       "*",
//       `payslip_id = ${id}`
//     );

//     if (!existing) {
//       return res.status(404).json({
//         success: false,
//         message: "Payslip not found",
//       });
//     }

//     const updateFields = { updated_at: new Date() };

//     if (total_present_in_months !== undefined)
//       updateFields.total_present_in_months = parseInt(total_present_in_months);
//     if (total_absent_in_month !== undefined)
//       updateFields.total_absent_in_month = parseInt(total_absent_in_month);
//     if (month_ctc_amount !== undefined)
//       updateFields.month_ctc_amount = parseFloat(month_ctc_amount);
//     if (month_deducted_amount !== undefined)
//       updateFields.month_deducted_amount = parseFloat(month_deducted_amount);
//     if (salary_in_hand !== undefined)
//       updateFields.salary_in_hand = parseFloat(salary_in_hand);

//     await updateData(PAYSLIP_TABLE, updateFields, `payslip_id = ${id}`);

//     res.json({
//       success: true,
//       message: "Payslip updated successfully",
//     });
//   } catch (err) {
//     console.error("updatePayslip Error:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// }
//   // 🗑️ Delete payslip
//   async deletePayslip(req, res) {
//     try {
//       const { id } = req.params;

//       const existing = await selectOneData(
//         PAYSLIP_TABLE,
//         "*",
//         `payslip_id = ${id}`
//       );

//       if (!existing) {
//         return res.status(404).json({
//           success: false,
//           message: "Payslip not found",
//         });
//       }

//       await deleteData(PAYSLIP_TABLE, `payslip_id = ${id}`);

//       res.json({
//         success: true,
//         message: "Payslip deleted successfully",
//       });
//     } catch (err) {
//       console.error("deletePayslip Error:", err);
//       res.status(500).json({
//         success: false,
//         message: err.message,
//       });
//     }
//   }

//   // 📈 Get payslip statistics for dashboard
//   async getPayslipStatistics(req, res) {
//     try {
//       const { month } = req.query;

//       let dateCondition = "";
//       if (month) {
//         const monthStart = dayjs(`${month}-01`).format("YYYY-MM-DD");
//         dateCondition = `WHERE month_date = '${monthStart}'`;
//       }

//       const sql = `
//         SELECT 
//           COUNT(*) AS total_payslips,
//           SUM(month_ctc_amount) AS total_ctc,
//           SUM(month_deducted_amount) AS total_deductions,
//           SUM(salary_in_hand) AS total_salary_paid,
//           AVG(total_present_in_months) AS avg_present_days,
//           AVG(total_absent_in_month) AS avg_absent_days
//         FROM ${PAYSLIP_TABLE}
//         ${dateCondition}
//       `;

//       const [stats] = await customSelectSqlQuery(sql);

//       res.json({
//         success: true,
//         data: stats || {},
//       });
//     } catch (err) {
//       console.error("getPayslipStatistics Error:", err);
//       res.status(500).json({
//         success: false,
//         message: err.message,
//       });
//     }
//   }
}

module.exports = new employeePaySlipController();