const {
  insertData,
  updateData,
  deleteData,
  customSelectSqlQuery,
  selectOneData,
} = require("../models/MasterModel");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const now = dayjs.utc().format("YYYY-MM-DD HH:mm:ss");


class purchaseOrderController {

    
  //  CREATE
  async createPurchaseOrder(req, res) {
    try {
      const {
        voucher_no,
        reference_no_and_date,
        vendor_id,
        date,
        delivery_date,
        format_no,
        mode_terms_of_payment,
        remarks,
        created_by,
      } = req.body;

      if (!vendor_id) {
        return res.status(400).json({ success: false, message: "vendor_id is required" });
      }

      const data = {
        voucher_no,
        reference_no_and_date,
        vendor_id,
        date,
        delivery_date,
        format_no,
        mode_terms_of_payment,
        remarks,
        created_by,
        updated_by: created_by,
        created_at: now,
        updated_at: now,
      };

      const insertId = await insertData("td_purchase_order", data);

      res.json({
        success: true,
        message: "Purchase order created successfully",
        insertId,
      });
    } catch (err) {
      console.error("createPurchaseOrder Error:", err);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }

  //  READ (GET ALL with JOIN)
  async getAllPurchaseOrders(req, res) {
    try {
      const sql = `
        SELECT 
          p.purchase_order_id,
          p.voucher_no,
          p.reference_no_and_date,
          p.vendor_id,
          v.vendor_name,
          p.date,
          p.delivery_date,
          p.format_no,
          p.mode_terms_of_payment,
          p.remarks,
          p.created_by,
          p.updated_by,
          p.created_at,
          p.updated_at
        FROM td_purchase_order p
        LEFT JOIN md_vendor v ON p.vendor_id = v.vendor_id
        ORDER BY p.purchase_order_id DESC
      `;

      const rows = await customSelectSqlQuery(sql);

      res.json({
        success: true,
        count: rows.length,
        data: rows,
      });
    } catch (err) {
      console.error("getAllPurchaseOrders Error:", err);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }


  //  READ ONE BY ID
  async getPurchaseOrderById(req, res) {
    try {
      const { id } = req.params;

      const sql = `
        SELECT 
          p.purchase_order_id,
          p.voucher_no,
          p.reference_no_and_date,
          p.vendor_id,
          v.vendor_name,
          p.date,
          p.delivery_date,
          p.format_no,
          p.mode_terms_of_payment,
          p.remarks,
          p.created_by,
          p.updated_by,
          p.created_at,
          p.updated_at
        FROM td_purchase_order p
        LEFT JOIN md_vendor v ON p.vendor_id = v.vendor_id
        WHERE p.purchase_order_id = ${id}
      `;

      const row = await customSelectSqlQuery(sql, false);

      if (!row) {
        return res.status(404).json({ success: false, message: "Purchase order not found" });
      }

      res.json({ success: true, data: row });
    } catch (err) {
      console.error("getPurchaseOrderById Error:", err);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }

  

  //  UPDATE
  async updatePurchaseOrder(req, res) {
    try {
      const { id } = req.params;

      const {
        voucher_no,
        reference_no_and_date,
        vendor_id,
        date,
        delivery_date,
        format_no,
        mode_terms_of_payment,
        remarks,
        updated_by,
      } = req.body;

      const existing = await selectOneData("td_purchase_order", "*", `purchase_order_id=${id}`);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Purchase order not found" });
      }

      const updateObj = {
        voucher_no,
        reference_no_and_date,
        vendor_id,
        date,
        delivery_date,
        format_no,
        mode_terms_of_payment,
        remarks,
        updated_by,
        updated_at: now,
      };

      await updateData("td_purchase_order", updateObj, `purchase_order_id=${id}`);

      res.json({ success: true, message: "Purchase order updated successfully" });
    } catch (err) {
      console.error("updatePurchaseOrder Error:", err);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }


  //  DELETE
  async deletePurchaseOrder(req, res) {
    try {
      const { id } = req.params;

      const existing = await selectOneData("td_purchase_order", "*", `purchase_order_id=${id}`);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Purchase order not found" });
      }

      await deleteData("td_purchase_order", `purchase_order_id=${id}`);

      res.json({ success: true, message: "Purchase order deleted successfully" });
    } catch (err) {
      console.error("deletePurchaseOrder Error:", err);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }
}

module.exports = new purchaseOrderController();
