const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
  customSelectSqlQuery,
} = require("../models/MasterModel");

class progressController {
  // ---------- CREATE ----------
  createProgress = async (req, res) => {
    try {
      const {
        project_id,
        product_id,
       // site_id,
        edit_status,
        bom_id,
        product_qty,
        qty_pack,
        step_id,
        total_qty,
        exact_total,
      } = req.body;

      // ✅ Basic validation
      if (!project_id  || !product_qty || !bom_id || !step_id) {
        return res.status(400).json({
          success: false,
          message:
            "project_id, bom_id, step_id, and product_qty are required",
        });
      }

      const created_by = req.user?.id || null;
      const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

      //  Insert into tx_progress
      const progressValues = {
        project_id,
        //site_id,
        step_id,
        bom_id,
        edit_status,
        product_qty,
        qty_pack,
        created_at,
        created_by,
      };

      const progress_id = await insertData("tx_progress", progressValues);

      // Insert into td_progress_item
      const progressItemValues = {
        bom_id,
        step_id,
        edit_status,
        product_id,
        product_qty,
        qty_pack,
        total_qty,
        exact_total,
        progress_id,
        //site_id,
        created_at,
        created_by,
      };

      await insertData("td_progress_item", progressItemValues);

      return res.status(201).json({
        success: true,
        message: "Progress created successfully in both tables",
        data: { id: progress_id, ...progressValues },
      });
    } catch (error) {
      console.error("❌ Error creating progress:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };

  // ---------- READ ALL ----------
  getAllProgress = async (req, res) => {
    try {
      const data = await selectData("tx_progress", "*", null, "id DESC");
      return res.status(200).json({
        success: true,
        message: "Progress records fetched successfully",
        data,
      });
    } catch (error) {
      console.error("❌ Error fetching progress records:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };

  // ---------- READ ONE ----------
  getProgressById = async (req, res) => {
    try {
      const { id } = req.params;
      const progress = await selectOneData("tx_progress", "*", `id=${id}`);

      if (!progress) {
        return res.status(404).json({
          success: false,
          message: "Progress record not found",
        });
      }

      // ✅ Also fetch related td_progress_item rows
      const items = await selectData("td_progress_item", "*", `progress_id=${id}`);

      return res.status(200).json({
        success: true,
        message: "Progress record fetched successfully",
        data: { ...progress, items },
      });
    } catch (error) {
      console.error("❌ Error fetching progress by ID:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };

  // ---------- UPDATE ----------
  updateProgress = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        project_id,
       // site_id,
        edit_status,
        product_qty,
        qty_pack,
        date,
        total_qty,
        exact_total,
      } = req.body;

      if (!project_id || !product_qty) {
        return res.status(400).json({
          success: false,
          message: "project_id, and product_qty are required",
        });
      }

      const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
      const updated_by = req.user?.id || null;

      // ✅ Update tx_progress
      const updateValues = {
        project_id,
        //site_id,
        edit_status,
        product_qty,
        qty_pack,
        date,
        updated_at,
        updated_by,
      };

      const affectedRows = await updateData(
        "tx_progress",
        updateValues,
        `id=${id}`
      );

      // ✅ Update td_progress_item as well
      const updateItemValues = {
        edit_status,
        product_qty,
        qty_pack,
        total_qty,
        exact_total,
        updated_at,
        updated_by,
      };

      await updateData("td_progress_item", updateItemValues, `progress_id=${id}`);

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Progress record not found or no changes made",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Progress updated successfully in both tables",
        data: { id, ...updateValues },
      });
    } catch (error) {
      console.error("❌ Error updating progress:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };

  // ---------- DELETE ----------
  deleteProgress = async (req, res) => {
    try {
      const { id } = req.params;

      // ✅ First delete from td_progress_item (foreign key relation)
      await deleteData("td_progress_item", `progress_id=${id}`);

      // ✅ Then delete from tx_progress
      const deleted = await deleteData("tx_progress", `id=${id}`);

      if (deleted === 0) {
        return res.status(404).json({
          success: false,
          message: "Progress record not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Progress deleted successfully from both tables",
      });
    } catch (error) {
      console.error("❌ Error deleting progress:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };
}

module.exports = new progressController();
