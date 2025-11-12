const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
} = require("../models/MasterModel");

const table = "em_leave_types";


class LeaveController {
  //  CREATE (POST)
  createLeaveType = async (req, res) => {
    try {
      const { type_name, default_days } = req.body;

      if (!type_name || default_days === undefined) {
        return res.status(400).json({
          success: false,
          message: "type_name and default_days are required",
        });
      }

      const data = {
        type_name,
        default_days,
      };

      const insertId = await insertData(table, data);

      return res.status(201).json({
        success: true,
        message: "Leave type created successfully",
        leave_type_id: insertId,
      });
    } catch (error) {
      console.error("createLeaveType Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create leave type",
        error: error.message,
      });
    }
  };

  //  READ ALL (GET)
  getAllLeaveTypes = async (req, res) => {
    try {
      const rows = await selectData(table, "*", null, "leave_type_id DESC");
      return res.status(200).json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error("getAllLeaveTypes Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch leave types",
        error: error.message,
      });
    }
  };

  //  READ ONE BY ID (GET /:id)
  getLeaveTypeById = async (req, res) => {
    try {
      const { id } = req.params;

      const row = await selectOneData(
        table,
        "*",
        `leave_type_id = ${id}`
      );

      if (!row) {
        return res.status(404).json({
          success: false,
          message: "Leave type not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: row,
      });
    } catch (error) {
      console.error("getLeaveTypeById Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch leave type",
        error: error.message,
      });
    }
  };

  //  UPDATE (PUT /:id)
  updateLeaveType = async (req, res) => {
    try {
      const { id } = req.params;
      const { type_name, default_days } = req.body;

      if (!type_name && default_days === undefined) {
        return res.status(400).json({
          success: false,
          message: "At least one field (type_name or default_days) is required",
        });
      }

      const updateObj = {};
      if (type_name) updateObj.type_name = type_name;
      if (default_days !== undefined) updateObj.default_days = default_days;

      const affectedRows = await updateData(
        table,
        updateObj,
        `leave_type_id = ${id}`
      );

      if (!affectedRows) {
        return res.status(404).json({
          success: false,
          message: "Leave type not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Leave type updated successfully",
      });
    } catch (error) {
      console.error("updateLeaveType Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update leave type",
        error: error.message,
      });
    }
  };

  // ✅ DELETE (DELETE /:id)
  deleteLeaveType = async (req, res) => {
    try {
      const { id } = req.params;

      const affectedRows = await deleteData(table, `leave_type_id = ${id}`);

      if (!affectedRows) {
        return res.status(404).json({
          success: false,
          message: "Leave type not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Leave type deleted successfully",
      });
    } catch (error) {
      console.error("deleteLeaveType Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete leave type",
        error: error.message,
      });
    }
  };
}

module.exports = new LeaveController();
