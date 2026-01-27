const dayjs = require("dayjs");

const {insertData,selectData,selectOneData, updateData,deleteData} = require("../models/MasterModel");

const TABLE = "em_leave_assigned";

class employeeleaveassigned {

  /* =========================
     CREATE / ASSIGN LEAVE
     ========================= */
  async createEmployeeLeave(req, res) {
    try {
      const {
        employee_id,
        privilege_leave,
        casual_leave,
        earned_leave,
        maternity_leave,
        sick_leave,
        created_by
      } = req.body;

      if (!employee_id || !created_by) {
        return res.status(400).json({
          success: false,
          message: "employee_id and created_by are required"
        });
      }

      // Check if already assigned
      const existing = await selectOneData(
        TABLE,
        "*",
        `employee_id = ${employee_id}`
      );

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Leave already assigned to this employee"
        });
      }

      const payload = {
        employee_id,
        privilege_leave: privilege_leave || 0,
        casual_leave: casual_leave || 0,
        earned_leave: earned_leave || 0,
        maternity_leave: maternity_leave || 0,
        sick_leave: sick_leave || 0,
        created_by,
        created_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss")
      };

      const insertId = await insertData(TABLE, payload);

      return res.status(201).json({
        success: true,
        message: "Leave assigned successfully",
        data: { leave_assigned_id: insertId }
      });

    } catch (error) {
      console.error("Create leave assigned error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to assign leave",
        error: error.message
      });
    }
  }

  /* =========================
     GET ALL
     ========================= */
  async getAllEmployeeleaveAssigned(req, res) {
    try {
      const rows = await selectData(TABLE);
      return res.status(200).json({
        success: true,
        count: rows.length,
        data: rows
      });
    } catch (error) {
      console.error("Get all leave assigned error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch leave data"
      });
    }
  }

  /* =========================
     GET BY EMPLOYEE ID
     ========================= */
  async getEmployeeleaveByEmployeeId(req, res) {
    try {
      const { employee_id } = req.params;

      if (!employee_id) {
        return res.status(400).json({
          success: false,
          message: "employee_id is required"
        });
      }

      const row = await selectOneData(
        TABLE,
        "*",
        `employee_id = ${employee_id}`
      );

      if (!row) {
        return res.status(404).json({
          success: false,
          message: "Leave record not found for this employee"
        });
      }

      return res.status(200).json({
        success: true,
        data: row
      });

    } catch (error) {
      console.error("Get leave by employee error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch leave data"
      });
    }
  }

  /* =========================
     UPDATE BY EMPLOYEE ID
     ========================= */
  async updateEmployeeLeavebyEmployeeId(req, res) {
    try {
      const { employee_id } = req.params;

      if (!employee_id) {
        return res.status(400).json({
          success: false,
          message: "employee_id is required"
        });
      }

      const updatePayload = {
        ...req.body,
        updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss")
      };

      // Prevent employee_id overwrite
      delete updatePayload.employee_id;
      delete updatePayload.created_by;
      delete updatePayload.created_at;

      if (Object.keys(updatePayload).length === 1) {
        return res.status(400).json({
          success: false,
          message: "No valid fields to update"
        });
      }

      const affectedRows = await updateData(
        TABLE,
        updatePayload,
        `employee_id = ${employee_id}`
      );

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Leave record not found or not updated"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Leave updated successfully"
      });

    } catch (error) {
      console.error("Update leave assigned error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update leave",
        error: error.message
      });
    }
  }

  /* =========================
     DELETE BY EMPLOYEE ID
     ========================= */
  async deleteByEmployeeId(req, res) {
    try {
      const { employee_id } = req.params;

      if (!employee_id) {
        return res.status(400).json({
          success: false,
          message: "employee_id is required"
        });
      }

      const affectedRows = await deleteData(
        TABLE,
        `employee_id = ${employee_id}`
      );

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Leave record not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Leave record deleted successfully"
      });

    } catch (error) {
      console.error("Delete leave assigned error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete leave record"
      });
    }
  }
}

module.exports = new employeeleaveassigned();
