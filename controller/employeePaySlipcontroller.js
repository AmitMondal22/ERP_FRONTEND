const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
  customSelectSqlQuery,
} = require("../models/MasterModel");

const table = "em_payslips";

class employeePaySlipeController {

  //  Create a new payslip
  async createPayslip(req, res) {
    try {
      const {employee_id,pay_period_start,pay_period_end,base_salary,
        allowance,
        overtime_pay,
        bonus,
        deductions,
        tax,
        net_salary,
        issue_date,
      } = req.body;

      // --- Validation ---
      if (!employee_id || !pay_period_start || !pay_period_end || !net_salary) {
        return res.status(400).json({
          success: false,
          message: "employee_id, pay_period_start, pay_period_end, and net_salary are required",
        });
      }

      const data = {
        employee_id,
        pay_period_start,
        pay_period_end,
        base_salary: base_salary || 0,
        allowance: allowance || 0,
        overtime_pay: overtime_pay || 0,
        bonus: bonus || 0,
        deductions: deductions || 0,
        tax: tax || 0,
        net_salary,
        issue_date: issue_date || new Date(),
      };

      const insertId = await insertData(table, data);

      res.status(201).json({
        success: true,
        message: "Payslip created successfully",
        payslip_id: insertId,
      });
    } catch (err) {
      console.error("createPayslip Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ✅ Get all payslips

//   async getAllPayslips(req, res) {
//     try {
//       const rows = await selectData(table, "*", null, "payslip_id DESC");

//       res.json({ success: true, data: rows });
//     } catch (err) {
//       console.error("getAllPayslips Error:", err);
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }

// ✅ Get all payslips with employee name

async getAllPayslips(req, res) {
  try {
    const sql = `
      SELECT 
        p.payslip_id,
        p.employee_id,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        p.pay_period_start,
        p.pay_period_end,
        p.base_salary,
        p.allowance,
        p.overtime_pay,
        p.bonus,
        p.deductions,
        p.tax,
        p.net_salary,
        p.issue_date
      FROM ${table} p
      LEFT JOIN em_employees e ON p.employee_id = e.employee_id
      ORDER BY p.payslip_id DESC
    `;

    const rows = await customSelectSqlQuery(sql);

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("getAllPayslips Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}




  // ✅ Get single payslip by ID
  async getPayslipById(req, res) {
    try {
      const { id } = req.params;
      const row = await selectOneData(table, "*", `payslip_id = ${id}`);
      if (!row) {
        return res.status(404).json({ success: false, message: "Payslip not found" });
      }
      res.json({ success: true, data: row });
    } catch (err) {
      console.error("getPayslipById Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ✅ Update payslip
  async updatePayslip(req, res) {
    try {
      const { id } = req.params;
      const {
        employee_id,
        pay_period_start,
        pay_period_end,
        base_salary,
        allowance,
        overtime_pay,
        bonus,
        deductions,
        tax,
        net_salary,
        issue_date,
      } = req.body;

      const existing = await selectOneData(table, "*", `payslip_id = ${id}`);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Payslip not found" });
      }

      const updateFields = {};
      if (employee_id) updateFields.employee_id = employee_id;
      if (pay_period_start) updateFields.pay_period_start = pay_period_start;
      if (pay_period_end) updateFields.pay_period_end = pay_period_end;
      if (base_salary !== undefined) updateFields.base_salary = base_salary;
      if (allowance !== undefined) updateFields.allowance = allowance;
      if (overtime_pay !== undefined) updateFields.overtime_pay = overtime_pay;
      if (bonus !== undefined) updateFields.bonus = bonus;
      if (deductions !== undefined) updateFields.deductions = deductions;
      if (tax !== undefined) updateFields.tax = tax;
      if (net_salary !== undefined) updateFields.net_salary = net_salary;
      if (issue_date) updateFields.issue_date = issue_date;

      const affected = await updateData(table, updateFields, `payslip_id = ${id}`);

      res.json({
        success: true,
        message: "Payslip updated successfully",
        affected,
      });
    } catch (err) {
      console.error("updatePayslip Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ✅ Delete payslip
  async deletePayslip(req, res) {
    try {
      const { id } = req.params;
      const existing = await selectOneData(table, "*", `payslip_id = ${id}`);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Payslip not found" });
      }

      await deleteData(table, `payslip_id = ${id}`);

      res.json({ success: true, message: "Payslip deleted successfully" });
    } catch (err) {
      console.error("deletePayslip Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new employeePaySlipeController();
