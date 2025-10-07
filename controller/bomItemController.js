const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const {updateData,selectOneData,insertData,deleteData,selectData,} = require("../models/MasterModel");


const TABLE = "md_bom_item";
 

class BomItemController {   
  // CREATE 
  async createBomItem(req, res) {
    try {
      const { bom_id, bom_progress_id, product_id, qty,total_qty } = req.body;

      const data = {
        bom_id,bom_progress_id,product_id,qty,total_qty,
        created_by: req.user.id,

        created_at: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
        updated_at: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
      };

      const insertId = await insertData(TABLE, data);

      return res.status(201).json({
        success: true,
        message: "BOM Item created successfully",
        bom_item_id: insertId,
      });
    } catch (err) {
      console.error("Error creating BOM Item:", err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }

  
  // READ ALL
  async getAllBomItems(req, res) {
    try {
      const items = await selectData(TABLE, "*", null, "bom_item_id DESC");
      res.json({ success: true, data: items });
    } catch (err) {
      console.error("Error fetching BOM Items:", err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }

  // READ ONE
  async getBomItemById(req, res) {
    try {
      const { id } = req.params;
      const item = await selectOneData(
        TABLE,
        "*",
        `bom_item_id = ${id}`
      );

      if (!item) {
        return res.status(404).json({ success: false, message: "BOM Item not found" });
      }

      res.json({ success: true, data: item });
    } catch (err) {
      console.error("Error fetching BOM Item:", err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }

  // UPDATE
//  async updateBomItem(req, res) {
//   try {
//     const { id } = req.params;
//     const { bom_id, bom_progress_id, product_id, qty, created_by } = req.body;

//     // Ensure undefined → null (so MySQL accepts it)
//     const safeValue = (val) => (val === undefined ? null : val);

//     const data = {
//       bom_id: safeValue(bom_id),
//       bom_progress_id: safeValue(bom_progress_id),
//       product_id: safeValue(product_id),
//       qty: safeValue(qty),
//       created_by: safeValue(created_by),
//       updated_at: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
//     };

//     const affectedRows = await updateData(TABLE, data, `bom_item_id = ?`, [id]);

//     if (!affectedRows) {
//       return res.status(404).json({ success: false, message: "BOM Item not found" });
//     }

//     res.json({ success: true, message: "BOM Item updated successfully" });
//   } catch (err) {
//     console.error("Error updating BOM Item:", err);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// }

async updateBomItem(req, res) {
  try {
    const { id } = req.params;
    const { bom_id, bom_progress_id, product_id, qty, created_by } = req.body;

    // helper to replace undefined with null
    const safe = (val) => (val === undefined ? null : val);

    const data = {
      bom_id: safe(bom_id),
      bom_progress_id: safe(bom_progress_id),
      product_id: safe(product_id),
      qty: safe(qty),
      created_by: safe(created_by),
      updated_at: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
    };

    const affectedRows = await updateData(TABLE, data, `bom_item_id = ${Number(id)}`);

    if (!affectedRows) {
      return res.status(404).json({ success: false, message: "BOM Item not found" });
    }

    res.json({ success: true, message: "BOM Item updated successfully" });
  } catch (err) {
    console.error("Error updating BOM Item:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}


  // DELETE
  async deleteBomItem(req, res) {
    try {
      const { id } = req.params;
      const affectedRows = await deleteData(TABLE, `bom_item_id = ${id}`);

      if (!affectedRows) {
        return res.status(404).json({ success: false, message: "BOM Item not found" });
      }

      res.json({ success: true, message: "BOM Item deleted successfully" });
    } catch (err) {
      console.error("Error deleting BOM Item:", err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
}

module.exports = new BomItemController();
