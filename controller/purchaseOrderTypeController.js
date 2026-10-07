const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
} = require("../models/MasterModel");

class PurchaseOrderTypeController {

  createPurchaseOrderType = async (req, res) => {
    try {
      const { po_type_name, po_type_code, status } = req.body;

      if (!po_type_name || !po_type_name.trim()) {
        return res.status(400).json({
          success: false,
          message: "po_type_name is required",
        });
      }

      const created_by = req.user?.id || null;
      const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

      // Default code generated from name if not supplied (e.g., "Regular PO" -> "RPO" or trimmed name)
      const code = po_type_code && po_type_code.trim()
        ? po_type_code.trim()
        : po_type_name.trim().replace(/\s+/g, "_").toUpperCase();

      const insertValues = {
        po_type_name: po_type_name.trim(),
        po_type_code: code,
        status: status || "Active",
        created_by,
        created_at,
        updated_at: created_at,
      };

      const po_type_id = await insertData("md_purchase_order_type", insertValues);

      return res.status(200).json({
        success: true,
        message: "Purchase order type added successfully",
        data: {
          po_type_id,
          ...insertValues,
        },
      });
    } catch (error) {
      console.error("Error adding purchase order type:", error);
      return res.status(500).json({
        success: false,
        message: "Unable to add purchase order type",
        error: error.message,
      });
    }
  };

  //  Get all Purchase Order Types
  getAllPurchaseOrderTypes = async (req, res) => {
    try {
      const poTypes = await selectData(
        "md_purchase_order_type",
        "*",
        null,
        "po_type_id DESC"
      );

      return res.status(200).json({
        success: true,
        message: "Purchase order types fetched successfully",
        data: poTypes || [],
      });
    } catch (error) {
      console.error("Error fetching purchase order types:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };

  //  Get single Purchase Order Type by ID
  getPurchaseOrderTypeById = async (req, res) => {
    try {
      const { id } = req.params;
      const condition = `po_type_id = ${Number(id)}`;
      const poType = await selectOneData("md_purchase_order_type", "*", condition);

      if (!poType) {
        return res.status(404).json({
          success: false,
          message: "Purchase order type not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: poType,
      });
    } catch (error) {
      console.error("Error fetching purchase order type:", error);
      return res.status(500).json({
        success: false,
        message: "Unable to fetch purchase order type",
        error: error.message,
      });
    }
  };

  // ✅ Update Purchase Order Type by ID
  updatePurchaseOrderType = async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Purchase order type ID is required",
        });
      }

      const { po_type_name, po_type_code, status } = req.body;
      const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

      const setValues = {
        updated_at,
      };

      if (po_type_name !== undefined) setValues.po_type_name = po_type_name.trim();
      if (po_type_code !== undefined) setValues.po_type_code = po_type_code.trim();
      if (status !== undefined) setValues.status = status;
      if (req.user?.id) setValues.updated_by = req.user.id;

      const condition = `po_type_id = ${Number(id)}`;
      const updatedRows = await updateData("md_purchase_order_type", setValues, condition);

      if (!updatedRows) {
        return res.status(404).json({
          success: false,
          message: "Purchase order type not found or nothing to update",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Purchase order type updated successfully",
        data: updatedRows,
      });
    } catch (error) {
      console.error("Error updating purchase order type:", error);
      return res.status(500).json({
        success: false,
        message: "Unable to update purchase order type",
        error: error.message,
      });
    }
  };

  // ✅ Delete Purchase Order Type by ID
  deletePurchaseOrderType = async (req, res) => {
    try {
      const { id } = req.params;
      const condition = `po_type_id = ${Number(id)}`;
      const deletedRows = await deleteData("md_purchase_order_type", condition);

      if (!deletedRows) {
        return res.status(404).json({
          success: false,
          message: "Purchase order type not found or already deleted",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Purchase order type deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting purchase order type:", error);
      return res.status(500).json({
        success: false,
        message: "Unable to delete purchase order type",
        error: error.message,
      });
    }
  };
}

module.exports = new PurchaseOrderTypeController();
