
const {insertData,selectData,selectOneData,updateData,deleteData,customSelectSqlQuery} = require("../models/MasterModel");
const table = "em_leave_requests";


class employeeLeaveRequestController {

  //  Create new leave request
  async createLeaveRequest(req, res) {
    try {
    const { employee_id,leave_type_id, start_date,end_date, status = "pending", reason = "",} = req.body;

      // --- Validation ---
      if (!employee_id || !leave_type_id || !start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: "employee_id, leave_type_id, start_date, and end_date are required.",
        });
      }

      const data = {
        employee_id,
        leave_type_id,
        start_date,
        end_date,
        status,
        reason,
        request_date: new Date(),
      };

      const insertId = await insertData(table, data);

      res.status(201).json({
        success: true,
        message: "Leave request created successfully.",
        leave_id: insertId,
      });
    } catch (err) {
      console.error("createLeaveRequest Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // 🔍 Get leave requests with employee + leave type info

  async getAllLeaveRequestsWithDetails(req, res) {
    try {
      const sql = `
        SELECT 
          lr.leave_id,
          CONCAT(emp.first_name, ' ', emp.last_name) AS employee_name,
          lt.type_name AS leave_type,
          lr.start_date AS from_date,
          lr.end_date AS to_date,
          lr.reason,
          lr.status,
          lr.request_date
        FROM em_leave_requests lr
        LEFT JOIN em_employees emp ON lr.employee_id = emp.employee_id
        LEFT JOIN em_leave_types lt ON lr.leave_type_id = lt.leave_type_id
        ORDER BY lr.leave_id DESC
      `;

      const result = await customSelectSqlQuery(sql);
      
      // Format dates
      const formattedResult = result.map(record => ({
        ...record,
        from_date: record.from_date ? record.from_date.toISOString().split('T')[0] : null,
        to_date: record.to_date ? record.to_date.toISOString().split('T')[0] : null,
      }));

      res.json({
        success: true,
        data: formattedResult,
      });
    } catch (err) {
      console.error("getAllLeaveRequestsWithDetails Error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch detailed leave requests",
        error: err.message,
      });
    }
  }



  //  Get all leave requests
  async getAllLeaveRequests(req, res) {
    try {
      const rows = await selectData(table, "*", null, "leave_id DESC");
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error("getAllLeaveRequests Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }




  //  Get single leave request by ID
  async getLeaveRequestById(req, res) {
    try {
      const { id } = req.params;
      const row = await selectOneData(table, "*", `leave_id = ${id}`);
      if (!row) {
        return res.status(404).json({ success: false, message: "Leave request not found" });
      }
      res.json({ success: true, data: row });
    } catch (err) {
      console.error("getLeaveRequestById Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }


  
  //  Update leave request
  async updateLeaveRequest(req, res) {
    try {
      const { id } = req.params;
      const {
        employee_id,
        leave_type_id,
        start_date,
        end_date,
        status,
        reason,
      } = req.body;

      const existing = await selectOneData(table, "*", `leave_id = ${id}`);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Leave request not found" });
      }

      const updateFields = {};
      if (employee_id) updateFields.employee_id = employee_id;
      if (leave_type_id) updateFields.leave_type_id = leave_type_id;
      if (start_date) updateFields.start_date = start_date;
      if (end_date) updateFields.end_date = end_date;
      if (status) updateFields.status = status;
      if (reason !== undefined) updateFields.reason = reason;

      const affected = await updateData(table, updateFields, `leave_id = ${id}`);

      res.json({
        success: true,
        message: "Leave request updated successfully",
        affected,
      });
    } catch (err) {
      console.error("updateLeaveRequest Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ❌ Delete leave request
  async deleteLeaveRequest(req, res) {
    try {
      const { id } = req.params;

      const existing = await selectOneData(table, "*", `leave_id = ${id}`);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Leave request not found" });
      }

      await deleteData(table, `leave_id = ${id}`);

      res.json({ success: true, message: "Leave request deleted successfully" });
    } catch (err) {
      console.error("deleteLeaveRequest Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }


// ✅ Update leave request status (Approve / Reject)
async updateLeaveStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // expecting 'approved' or 'rejected'

    // --- Validation ---
    if (!status || !["approved", "rejected"].includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Must be 'approved' or 'rejected'.",
      });
    }

    // --- Check if leave exists ---
    const existing = await selectOneData(table, "*", `leave_id = ${id}`);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Leave request not found." });
    }

    // --- Prevent re-updating approved/rejected leaves ---
    if (existing.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot change status. Leave is already '${existing.status}'.`,
      });
    }

    // --- Update status ---
    const affected = await updateData(
      table,
      { status: status.toLowerCase() },
      `leave_id = ${id}`
    );

    res.json({
      success: true,
      message: `Leave status updated to '${status}'.`,
      affected,
    });
  } catch (err) {
    console.error("updateLeaveStatus Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update leave status.",
      error: err.message,
    });
  }
}



}

module.exports = new employeeLeaveRequestController();
