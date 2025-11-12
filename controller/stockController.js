const dayjs = require("dayjs");
const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
  customSelectSqlQuery,
} = require("../models/MasterModel");

const table = "stock_matrial";

class stockController {
  // 🔹 CREATE
  async createStock(req, res) {
    try {
      const {
        product_type_id,
        product_id,
        vendor_id,
        qty,
        price,
        unit_id,
        po_number,
        po_date,
        invoice_number,
        invoice_date,
        delivery_date,
        mtc,
        image_path,
      } = req.body;

      const created_by = req.user?.id || null;
      const created_at = dayjs().format("YYYY-MM-DD HH:mm:ss");

      const data = {
        product_type_id,
        product_id,
        vendor_id,
        qty,
        price,
        unit_id,
        po_number,
        po_date,
        invoice_number,
        invoice_date,
        delivery_date,
        mtc,
        image_path,
        created_by,
        created_at,
      };

      const insertId = await insertData(table, data);
      res.json({
        success: true,
        message: "Stock material created successfully",
        insertId,
      });
    } catch (err) {
      console.error("createStock Error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // 🔹 READ ALL with JOINS
  async getAllStock(req, res) {
    try {
      const sql = `
        SELECT 
          s.stock_id,
          s.product_type_id,
          pt.product_type_name,
          s.product_id,
          p.product_name,
          s.vendor_id,
          v.vendor_name,
          s.qty,
          s.price,
          s.unit_id,
          u.unit_name,
          s.po_number,
          s.po_date,
          s.invoice_number,
          s.invoice_date,
          s.delivery_date,
          s.mtc,
          s.image_path,
          s.created_by,
          s.created_at,
          s.updated_at
        FROM stock_matrial s
        LEFT JOIN md_product_type pt ON s.product_type_id = pt.product_type_id
        LEFT JOIN md_product p ON s.product_id = p.product_id
        LEFT JOIN md_vendor v ON s.vendor_id = v.vendor_id
        LEFT JOIN md_unit u ON s.unit_id = u.unit_id
        ORDER BY s.stock_id DESC
      `;

      const rows = await customSelectSqlQuery(sql);
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error("getAllStock Error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // 🔹 READ ONE by ID
  async getStockById(req, res) {
    try {
      const { id } = req.params;
      const sql = `
        SELECT 
          s.stock_id,
          s.product_type_id,
          pt.product_type_name,
          s.product_id,
          p.product_name,
          s.vendor_id,
          v.vendor_name,
          s.qty,
          s.price,
          s.unit_id,
          u.unit_name,
          s.po_number,
          s.po_date,
          s.invoice_number,
          s.invoice_date,
          s.delivery_date,
          s.mtc,
          s.image_path,
          s.created_by,
          s.created_at,
          s.updated_at
        FROM stock_matrial s
        LEFT JOIN md_product_type pt ON s.product_type_id = pt.product_type_id
        LEFT JOIN md_product p ON s.product_id = p.product_id
        LEFT JOIN md_vendor v ON s.vendor_id = v.vendor_id
        LEFT JOIN md_unit u ON s.unit_id = u.unit_id
        WHERE s.stock_id = ${id}
      `;

      const row = await customSelectSqlQuery(sql, false);
      if (!row) {
        return res.status(404).json({ success: false, message: "Stock not found" });
      }

      res.json({ success: true, data: row });
    } catch (err) {
      console.error("getStockById Error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // 🔹 UPDATE
  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const updated_at = dayjs().format("YYYY-MM-DD HH:mm:ss");
      const data = { ...req.body, updated_at };

      const affected = await updateData(table, data, `stock_id = ${id}`);
      if (!affected) {
        return res.status(404).json({ success: false, message: "Stock not found" });
      }

      res.json({ success: true, message: "Stock updated successfully" });
    } catch (err) {
      console.error("updateStock Error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // 🔹 DELETE
  async deleteStock(req, res) {
    try {
      const { id } = req.params;
      const affected = await deleteData(table, `stock_id = ${id}`);
      if (!affected) {
        return res.status(404).json({ success: false, message: "Stock not found" });
      }

      res.json({ success: true, message: "Stock deleted successfully" });
    } catch (err) {
      console.error("deleteStock Error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
}

module.exports = new stockController();
