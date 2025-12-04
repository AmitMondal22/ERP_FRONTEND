const { insertData, customSelectSqlQuery, updateData, deleteData } = require("../models/MasterModel");

class returnPurchaseController {

  // CREATE
  createReturn = async (req, res) => {
    try {
      const { quality_material } = req.body;

      if (!quality_material) {
        return res.status(400).json({ success: false, message: "quality_material is required" });
      }

      const insert = await insertData("td_return_purchase_product", { quality_material });

      return res.json({ success: true, message: "Return purchase created", return_id: insert.insertId });
    } catch (err) {
      console.error("CREATE ERROR:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };

  // GET ALL
  getAllReturns = async (req, res) => {
    try {
      const data = await customSelectSqlQuery("SELECT * FROM td_return_purchase_product ORDER BY return_id DESC");
      return res.json({ success: true, data });
    } catch (err) {
      console.error("GET ALL ERROR:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };

  // GET BY ID
  getReturnById = async (req, res) => {
    try {
      const { id } = req.params;
      const rows = await customSelectSqlQuery(`SELECT * FROM td_return_purchase_product WHERE return_id = ${id}`);
      if (!rows.length) return res.status(404).json({ success: false, message: "Return data not found" });
      return res.json({ success: true, data: rows[0] });
    } catch (err) {
      console.error("GET BY ID ERROR:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };

  // UPDATE
  updateReturn = async (req, res) => {
    try {
      const { id } = req.params;
      const { quality_material } = req.body;

      await updateData("td_return_purchase_product", { quality_material }, "return_id", id);

      return res.json({ success: true, message: "Return data updated" });
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };

  // DELETE
  deleteReturn = async (req, res) => {
    try {
      const { id } = req.params;
      await deleteData("td_return_purchase_product", "return_id", id);
      return res.json({ success: true, message: "Return data deleted" });
    } catch (err) {
      console.error("DELETE ERROR:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };
}

module.exports = new returnPurchaseController();
