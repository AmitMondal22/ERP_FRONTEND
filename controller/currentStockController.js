const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
  customSelectSqlQuery
} = require("../models/MasterModel");

class currentStockController {

  // --------------------------------------------------------------
  // CREATE / UPDATE STOCK (AUTO UPDATE IF SAME COMBINATION EXISTS)
  // --------------------------------------------------------------
  async addOrUpdateCurrentStock(req, res) {
    try {
      const {
        project_id,
        site_id,
        product_id,
        store_id,
        invoice_qty,
      } = req.body;

      const created_by = req.user.id ||null;

      if (!project_id || !site_id || !product_id) {
        return res.status(400).json({ message: "project_id, site_id, product_id are required" });
      }

      // Check existing record
      const condition = `project_id=${project_id} AND site_id=${site_id} AND product_id=${product_id}`;
      const existing = await selectOneData("tx_current_stock", "*", condition);

      if (existing) {
        // UPDATE QTY
        const updatedQty = existing.invoice_qty + Number(invoice_qty);

        await updateData(
          "tx_current_stock",
          {
            invoice_qty: updatedQty,
            updated_by: created_by,
            updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
          },
          `current_stock_id=${existing.current_stock_id}`
        );

        return res.json({
          message: "Stock updated successfully",
          updated_qty: updatedQty,
          stock_id: existing.current_stock_id
        });
      }

      // INSERT NEW
      const insertObj = {
        project_id,
        site_id,
        product_id,
        store_id,
        invoice_qty,
        created_by,
        created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
      };

      const insertId = await insertData("tx_current_stock", insertObj);

      res.json({ message: "Stock inserted successfully", stock_id: insertId });

    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal Error", error: err });
    }
  }

  // --------------------------------------------------------------
  // GET ALL STOCK WITH JOINING TABLES
  // --------------------------------------------------------------
  async getAllStock(req, res) {
    try {
      let sql = `
        SELECT 
          cs.current_stock_id,
          cs.project_id,
          p.project_name,
          cs.site_id,
          ps.project_site_name,
          cs.product_id,
          pr.product_name,
          cs.store_id,
          cs.invoice_qty,
          cs.created_at,
          cs.updated_at
        FROM tx_current_stock cs
        LEFT JOIN md_project p ON cs.project_id = p.project_id
        LEFT JOIN md_project_site ps ON cs.site_id = ps.project_site_id
        LEFT JOIN md_product pr ON cs.product_id = pr.product_id
        ORDER BY cs.current_stock_id DESC
      `;

      const rows = await customSelectSqlQuery(sql, true);
      res.json(rows);

    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal Error", error: err });
    }
  }

  // --------------------------------------------------------------
  // GET ONE STOCK
  // --------------------------------------------------------------
  async getSingleStock(req, res) {
    try {
      const { id } = req.params;

      let sql = `
        SELECT 
          cs.*,
          p.project_name,
          ps.project_site_name,
          pr.product_name
        FROM tx_current_stock cs
        LEFT JOIN md_project p ON cs.project_id = p.project_id
        LEFT JOIN md_project_site ps ON cs.site_id = ps.project_site_id
        LEFT JOIN md_product pr ON cs.product_id = pr.product_id
        WHERE cs.current_stock_id = ${id}
      `;

      const row = await customSelectSqlQuery(sql, false);
      res.json(row);

    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal Error", error: err });
    }
  }

  // --------------------------------------------------------------
  // UPDATE ANY FIELD OF STOCK
  // --------------------------------------------------------------
  async updateStock(req, res) {
    try {
      const { id } = req.params;

      const updateObj = {
        ...req.body,
        updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
      };

      await updateData("tx_current_stock", updateObj, `current_stock_id=${id}`);

      res.json({ message: "Stock updated successfully" });

    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal Error", error: err });
    }
  }

  // --------------------------------------------------------------
  // DELETE STOCK
  // --------------------------------------------------------------
  async deleteStock(req, res) {
    try {
      const { id } = req.params;

      await deleteData("tx_current_stock", `current_stock_id=${id}`);

      res.json({ message: "Stock deleted successfully" });

    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal Error", error: err });
    }
  }
}

module.exports = new currentStockController();
