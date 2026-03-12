// const dayjs = require("dayjs");
// const utc = require("dayjs/plugin/utc");
// dayjs.extend(utc);

// const {
//   insertData,
//   selectData,
//   selectOneData,
//   updateData,
//   deleteData,
//   customSelectSqlQuery
// } = require("../models/MasterModel");

// class currentStockController {

//   // --------------------------------------------------------------
//   // CREATE / UPDATE STOCK (AUTO UPDATE IF SAME COMBINATION EXISTS)
//   // --------------------------------------------------------------
//   async addOrUpdateCurrentStock(req, res) {
//     try {
//       const {
//         project_id,
//         site_id,
//         product_id,
//         store_id,
//         invoice_qty,
//       } = req.body;

//       const created_by = req.user.id ||null;

//       if (!project_id || !site_id || !product_id) {
//         return res.status(400).json({ message: "project_id, site_id, product_id are required" });
//       }

//       // Check existing record
//       const condition = `project_id=${project_id} AND site_id=${site_id} AND product_id=${product_id}`;
//       const existing = await selectOneData("tx_current_stock", "*", condition);

//       if (existing) {
//         // UPDATE QTY
//         const updatedQty = existing.invoice_qty + Number(invoice_qty);

//         await updateData(
//           "tx_current_stock",
//           {
//             invoice_qty: updatedQty,
//             updated_by: created_by,
//             updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
//           },
//           `current_stock_id=${existing.current_stock_id}`
//         );

//         return res.json({
//           message: "Stock updated successfully",
//           updated_qty: updatedQty,
//           stock_id: existing.current_stock_id
//         });
//       }

//       // INSERT NEW
//       const insertObj = {
//         project_id,
//         site_id,
//         product_id,
//         store_id,
//         invoice_qty,
//         created_by,
//         created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
//       };

//       const insertId = await insertData("tx_current_stock", insertObj);

//       res.json({ message: "Stock inserted successfully", stock_id: insertId });

//     } catch (err) {
//       console.log(err);
//       res.status(500).json({ message: "Internal Error", error: err });
//     }
//   }

//   // --------------------------------------------------------------
//   // GET ALL STOCK WITH JOINING TABLES
//   // --------------------------------------------------------------
//   async getAllStock(req, res) {
//     try {
//       let sql = `
//         SELECT 
//           cs.current_stock_id,
//           cs.project_id,
//           p.project_name,
//           cs.site_id,
//           ps.project_site_name,
//           cs.product_id,
//           pr.product_name,
//           cs.store_id,
//           cs.invoice_qty,
//           cs.created_at,
//           cs.updated_at
//         FROM tx_current_stock cs
//         LEFT JOIN md_project p ON cs.project_id = p.project_id
//         LEFT JOIN md_project_site ps ON cs.site_id = ps.project_site_id
//         LEFT JOIN md_product pr ON cs.product_id = pr.product_id
//         ORDER BY cs.current_stock_id DESC
//       `;

//       const rows = await customSelectSqlQuery(sql, true);
//       res.json(rows);

//     } catch (err) {
//       console.log(err);
//       res.status(500).json({ message: "Internal Error", error: err });
//     }
//   }

//   // --------------------------------------------------------------
//   // GET ONE STOCK
//   // --------------------------------------------------------------
//   async getSingleStock(req, res) {
//     try {
//       const { id } = req.params;

//       let sql = `
//         SELECT 
//           cs.*,
//           p.project_name,
//           ps.project_site_name,
//           pr.product_name
//         FROM tx_current_stock cs
//         LEFT JOIN md_project p ON cs.project_id = p.project_id
//         LEFT JOIN md_project_site ps ON cs.site_id = ps.project_site_id
//         LEFT JOIN md_product pr ON cs.product_id = pr.product_id
//         WHERE cs.current_stock_id = ${id}
//       `;

//       const row = await customSelectSqlQuery(sql, false);
//       res.json(row);

//     } catch (err) {
//       console.log(err);
//       res.status(500).json({ message: "Internal Error", error: err });
//     }
//   }

//   // --------------------------------------------------------------
//   // UPDATE ANY FIELD OF STOCK
//   // --------------------------------------------------------------
//   async updateStock(req, res) {
//     try {
//       const { id } = req.params;

//       const updateObj = {
//         ...req.body,
//         updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
//       };

//       await updateData("tx_current_stock", updateObj, `current_stock_id=${id}`);

//       res.json({ message: "Stock updated successfully" });

//     } catch (err) {
//       console.log(err);
//       res.status(500).json({ message: "Internal Error", error: err });
//     }
//   }

//   // --------------------------------------------------------------
//   // DELETE STOCK
//   // --------------------------------------------------------------
//   async deleteStock(req, res) {
//     try {
//       const { id } = req.params;

//       await deleteData("tx_current_stock", `current_stock_id=${id}`);

//       res.json({ message: "Stock deleted successfully" });

//     } catch (err) {
//       console.log(err);
//       res.status(500).json({ message: "Internal Error", error: err });
//     }
//   }
// }

// module.exports = new currentStockController();

































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
  // site_id is now OPTIONAL.
  //   - If site_id is provided  → stock is site-specific
  //   - If site_id is omitted   → stock is project-level (shared across all sites)
  // --------------------------------------------------------------
  async addOrUpdateCurrentStock(req, res) {
    try {
      const {
        project_id,    
        site_id,    // optional
        product_id,
        store_id,
        invoice_qty,
      } = req.body;

      const created_by = req.user.id || null;

      if (!project_id || !product_id) {
        return res.status(400).json({ message: "project_id and product_id are required" });
      }

      // Build condition — site_id is optional
      let condition = `project_id=${project_id} AND product_id=${product_id}`;
      if (site_id) {
        condition += ` AND site_id=${site_id}`;
      } else {
        condition += ` AND (site_id IS NULL OR site_id = 0)`;
      }

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
          stock_id: existing.current_stock_id,
          scope: site_id ? "site-level" : "project-level"
        });
      }

      // INSERT NEW
      const insertObj = {
        project_id,
        site_id: site_id || null,   // NULL = shared across all sites of this project
        product_id,
        store_id,
        invoice_qty,
        created_by,
        created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
      };

      
      const insertId = await insertData("tx_current_stock", insertObj);

      res.json({
        message: "Stock inserted successfully",
        stock_id: insertId,
        scope: site_id ? "site-level" : "project-level"
      });

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
          CASE 
            WHEN cs.site_id IS NULL OR cs.site_id = 0 
            THEN 'Project-Level (All Sites)' 
            ELSE 'Site-Specific' 
          END AS stock_scope,
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
          pr.product_name,
          CASE 
            WHEN cs.site_id IS NULL OR cs.site_id = 0 
            THEN 'Project-Level (All Sites)' 
            ELSE 'Site-Specific' 
          END AS stock_scope
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
  // GET AVAILABLE STOCK FOR A GIVEN PROJECT + SITE + PRODUCT
  // (Used by DPR to check if material is available)
  //
  // Logic:
  //   1. First check site-specific stock  (project_id + site_id + product_id)
  //   2. If not found, fall back to project-level stock (project_id + product_id, site_id NULL)
  //   3. Returns combined available qty and which scope it came from
  // --------------------------------------------------------------
  async getAvailableStockForDPR(req, res) {
    try {
      const { project_id, site_id, product_id } = req.query;

      if (!project_id || !site_id || !product_id) {
        return res.status(400).json({ message: "project_id, site_id and product_id are required" });
      }

      let sql = `
        SELECT 
          cs.current_stock_id,
          cs.project_id,
          cs.site_id,
          cs.product_id,
          cs.invoice_qty,
          pr.product_name,
          CASE 
            WHEN cs.site_id = ${site_id} THEN 'site-specific'
            ELSE 'project-level'
          END AS stock_scope
        FROM tx_current_stock cs
        LEFT JOIN md_product pr ON cs.product_id = pr.product_id
        WHERE 
          cs.project_id = ${project_id}
          AND cs.product_id = ${product_id}
          AND (
            cs.site_id = ${site_id}               -- site-specific stock
            OR cs.site_id IS NULL                  -- project-level stock (shared)
            OR cs.site_id = 0                      -- project-level stock (shared)
          )
        ORDER BY cs.site_id DESC                   -- site-specific rows come first
      `;

      const rows = await customSelectSqlQuery(sql, true);

      if (!rows || rows.length === 0) {
        return res.status(404).json({
          message: "No stock available for this product in the given project/site",
          available_qty: 0
        });
      }

      // Prefer site-specific stock; fall back to project-level
      const siteStock    = rows.find(r => r.stock_scope === "site-specific");
      const projectStock = rows.find(r => r.stock_scope === "project-level");

      const resolved = siteStock || projectStock;

      return res.json({
        current_stock_id: resolved.current_stock_id,
        project_id:       resolved.project_id,
        site_id:          resolved.site_id,
        product_id:       resolved.product_id,
        product_name:     resolved.product_name,
        available_qty:    resolved.invoice_qty,
        stock_scope:      resolved.stock_scope,
        message: resolved.stock_scope === "project-level"
          ? "Stock is available at project level and shared across all sites"
          : "Stock is site-specific"
      });

    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal Error", error: err });
    }
  }

  // --------------------------------------------------------------
  // DEDUCT STOCK (called from DPR when material is consumed)
  //
  // Logic:
  //   1. First try to deduct from site-specific stock
  //   2. If not found, deduct from project-level stock
  //   3. Prevents over-deduction (qty cannot go below 0)
  // --------------------------------------------------------------
  async deductStockForDPR(req, res) {
    try {
      const { project_id, site_id, product_id, used_qty } = req.body;
      const updated_by = req.user.id || null;

      if (!project_id || !site_id || !product_id || !used_qty) {
        return res.status(400).json({ message: "project_id, site_id, product_id and used_qty are required" });
      }

      // 1. Try site-specific stock first
      let condition = `project_id=${project_id} AND site_id=${site_id} AND product_id=${product_id}`;
      let stockRecord = await selectOneData("tx_current_stock", "*", condition);

      // 2. Fall back to project-level stock
      if (!stockRecord) {
        condition = `project_id=${project_id} AND product_id=${product_id} AND (site_id IS NULL OR site_id = 0)`;
        stockRecord = await selectOneData("tx_current_stock", "*", condition);
      }

      if (!stockRecord) {
        return res.status(404).json({ message: "No stock record found for this product in the project/site" });
      }

      if (stockRecord.invoice_qty < Number(used_qty)) {
        return res.status(400).json({
          message: "Insufficient stock",
          available_qty: stockRecord.invoice_qty,
          requested_qty: Number(used_qty)
        });
      }

      const remainingQty = stockRecord.invoice_qty - Number(used_qty);

      await updateData(
        "tx_current_stock",
        {
          invoice_qty: remainingQty,
          updated_by,
          updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
        },
        `current_stock_id=${stockRecord.current_stock_id}`
      );

      return res.json({
        message: "Stock deducted successfully",
        stock_id:      stockRecord.current_stock_id,
        stock_scope:   stockRecord.site_id ? "site-specific" : "project-level",
        deducted_qty:  Number(used_qty),
        remaining_qty: remainingQty
      });

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