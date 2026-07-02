// const {
//   selectData,
//   selectOneData,
//   insertData,
//   updateData,
//   customSelectSqlQuery,
//   customSelectSqlQuery2,
// } = require("../models/MasterModel"); // adjust path as needed

// const dayjs = require("dayjs");
// const utc = require("dayjs/plugin/utc");
// dayjs.extend(utc);

// class StoreStockController {

//   // -----------------------------------------------------------------------
//   // 1. ADD PURCHASE ENTRY  (called when purchase invoice is created)
//   // POST /api/stock-ledger/purchase
//   // -----------------------------------------------------------------------
//   async addPurchaseEntry(req, res) {
//     try {
//       const {
//         store_id,
//         project_id,
//         site_id,
//         product_id,
//         reference_id,   // invoice_id
//         qty_in,
//         transaction_date,
//         created_by,
//       } = req.body;

//       // Validation
//       if (!store_id || !project_id || !site_id || !product_id || !reference_id || !qty_in) {
//         return res.status(400).json({
//           success: false,
//           message: "store_id, project_id, site_id, product_id, reference_id and qty_in are required",
//         });
//       }

//       // Get last balance for this store + product
//       const lastEntry = await selectOneData(
//         "tx_store_stock_ledger",
//         "balance_qty",
//         `store_id = ${store_id} AND product_id = ${product_id}`,
//         "ledger_id"
//       );

//       const prevBalance = lastEntry ? parseFloat(lastEntry.balance_qty) : 0;
//       const newBalance  = prevBalance + parseFloat(qty_in);

//       const data = {
//         store_id,
//         project_id,
//         site_id,
//         product_id,
//         from_store_id:   null,
//         from_project_id: null,
//         from_site_id:    null,
//         to_store_id:     store_id,
//         to_project_id:   project_id,
//         to_site_id:      site_id,
//         transaction_type: "PURCHASE",
//         reference_id,
//         qty_in:      parseFloat(qty_in),
//         qty_out:     0,
//         balance_qty: newBalance,
//         transaction_date: transaction_date || dayjs().format("YYYY-MM-DD"),
//         created_by,
//       };

//       const ledger_id = await insertData("tx_store_stock_ledger", data);

//       return res.status(201).json({
//         success: true,
//         message: "Purchase entry added to ledger",
//         data: { ledger_id, balance_qty: newBalance },
//       });

//     } catch (err) {
//       console.error("[addPurchaseEntry]", err);
//       return res.status(500).json({ success: false, message: err.message });
//     }
//   }


//   // -----------------------------------------------------------------------
//   // 2. ADD DPR ISSUE ENTRY  (called when DPR consumes stock)
//   // POST /api/stock-ledger/dpr-issue
//   // -----------------------------------------------------------------------
//   async addDprIssueEntry(req, res) {
//     try {
//       const {
//         store_id,
//         project_id,
//         site_id,
//         product_id,
//         reference_id,   // dpr_id
//         qty_out,
//         transaction_date,
//         created_by,
//       } = req.body;

//       if (!store_id || !project_id || !site_id || !product_id || !reference_id || !qty_out) {
//         return res.status(400).json({
//           success: false,
//           message: "store_id, project_id, site_id, product_id, reference_id and qty_out are required",
//         });
//       }

//       // Check available balance
//       const balanceRow = await customSelectSqlQuery(
//         `SELECT SUM(qty_in) - SUM(qty_out) AS available
//          FROM tx_store_stock_ledger
//          WHERE store_id = ${store_id}
//            AND product_id = ${product_id}
//            AND project_id = ${project_id}
//            AND site_id = ${site_id}`,
//         false
//       );

//       const available = parseFloat(balanceRow?.available || 0);

//       if (parseFloat(qty_out) > available) {
//         return res.status(400).json({
//           success: false,
//           message: `Insufficient stock. Available: ${available}, Requested: ${qty_out}`,
//         });
//       }

//       const newBalance = available - parseFloat(qty_out);

//       const data = {
//         store_id,
//         project_id,
//         site_id,
//         product_id,
//         from_store_id:   store_id,
//         from_project_id: project_id,
//         from_site_id:    site_id,
//         to_store_id:     null,
//         to_project_id:   null,
//         to_site_id:      null,
//         transaction_type: "DPR_ISSUE",
//         reference_id,
//         qty_in:      0,
//         qty_out:     parseFloat(qty_out),
//         balance_qty: newBalance,
//         transaction_date: transaction_date || dayjs().format("YYYY-MM-DD"),
//         created_by,
//       };

//       const ledger_id = await insertData("tx_store_stock_ledger", data);

//       return res.status(201).json({
//         success: true,
//         message: "DPR issue entry added to ledger",
//         data: { ledger_id, balance_qty: newBalance },
//       });

//     } catch (err) {
//       console.error("[addDprIssueEntry]", err);
//       return res.status(500).json({ success: false, message: err.message });
//     }
//   }


//   // -----------------------------------------------------------------------
//   // 3. TRANSFER STOCK BETWEEN STORES
//   // POST /api/stock-ledger/transfer
//   // -----------------------------------------------------------------------
//   async transferStock(req, res) {
//     try {
//       const {
//         from_store_id,
//         from_project_id,
//         from_site_id,
//         to_store_id,
//         to_project_id,
//         to_site_id,
//         product_id,
//         transfer_qty,
//         reference_id,   // tx_stock_transfer id (if you have transfer table)
//         transaction_date,
//         created_by,
//       } = req.body;

//       // Validation
//       if (
//         !from_store_id || !from_project_id || !from_site_id ||
//         !to_store_id   || !to_project_id   || !to_site_id   ||
//         !product_id    || !transfer_qty
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "All from/to fields, product_id and transfer_qty are required",
//         });
//       }

//       if (from_store_id === to_store_id && from_project_id === to_project_id && from_site_id === to_site_id) {
//         return res.status(400).json({
//           success: false,
//           message: "Source and destination cannot be the same",
//         });
//       }

//       // Check available balance at source
//       const sourceBalance = await customSelectSqlQuery(
//         `SELECT SUM(qty_in) - SUM(qty_out) AS available
//          FROM tx_store_stock_ledger
//          WHERE store_id    = ${from_store_id}
//            AND project_id  = ${from_project_id}
//            AND site_id     = ${from_site_id}
//            AND product_id  = ${product_id}`,
//         false
//       );

//       const available = parseFloat(sourceBalance?.available || 0);

//       if (parseFloat(transfer_qty) > available) {
//         return res.status(400).json({
//           success: false,
//           message: `Insufficient stock in source store. Available: ${available}, Requested: ${transfer_qty}`,
//         });
//       }

//       // Get destination current balance
//       const destBalance = await customSelectSqlQuery(
//         `SELECT SUM(qty_in) - SUM(qty_out) AS available
//          FROM tx_store_stock_ledger
//          WHERE store_id    = ${to_store_id}
//            AND project_id  = ${to_project_id}
//            AND site_id     = ${to_site_id}
//            AND product_id  = ${product_id}`,
//         false
//       );

//       const destAvailable   = parseFloat(destBalance?.available || 0);
//       const txDate          = transaction_date || dayjs().format("YYYY-MM-DD");
//       const qty             = parseFloat(transfer_qty);
//       const refId           = reference_id || 0;

//       // ---- TRANSFER OUT (source store) ----
//       const transferOutData = {
//         store_id:         from_store_id,
//         project_id:       from_project_id,
//         site_id:          from_site_id,
//         product_id,
//         from_store_id,
//         from_project_id,
//         from_site_id,
//         to_store_id,
//         to_project_id,
//         to_site_id,
//         transaction_type: "TRANSFER_OUT",
//         reference_id:     refId,
//         qty_in:           0,
//         qty_out:          qty,
//         balance_qty:      available - qty,
//         transaction_date: txDate,
//         created_by,
//       };

//       await insertData("tx_store_stock_ledger", transferOutData);

//       // ---- TRANSFER IN (destination store) ----
//       const transferInData = {
//         store_id:         to_store_id,
//         project_id:       to_project_id,
//         site_id:          to_site_id,
//         product_id,
//         from_store_id,
//         from_project_id,
//         from_site_id,
//         to_store_id,
//         to_project_id,
//         to_site_id,
//         transaction_type: "TRANSFER_IN",
//         reference_id:     refId,
//         qty_in:           qty,
//         qty_out:          0,
//         balance_qty:      destAvailable + qty,
//         transaction_date: txDate,
//         created_by,
//       };

//       const ledger_id = await insertData("tx_store_stock_ledger", transferInData);

//       return res.status(201).json({
//         success: true,
//         message: "Stock transferred successfully",
//         data: {
//           ledger_id,
//           from_store_id,
//           to_store_id,
//           product_id,
//           transfer_qty: qty,
//           source_balance_after:      available - qty,
//           destination_balance_after: destAvailable + qty,
//         },
//       });

//     } catch (err) {
//       console.error("[transferStock]", err);
//       return res.status(500).json({ success: false, message: err.message });
//     }
//   }


//   // -----------------------------------------------------------------------
//   // 4. GET STORE-WISE CURRENT STOCK REPORT
//   // GET /api/stock-ledger/report/store-stock?store_id=1
//   // -----------------------------------------------------------------------
//   async getStoreWiseStock(req, res) {
//     try {
//       const { store_id } = req.query;

//       let condition = store_id ? `WHERE ssl.store_id = ${store_id}` : "";

//       const sql = `
//         SELECT
//           ssl.store_id,
//           s.store_name,
//           ssl.project_id,
//           ssl.site_id,
//           ssl.product_id,
//           p.product_name,
//           SUM(ssl.qty_in)  AS total_in,
//           SUM(ssl.qty_out) AS total_out,
//           SUM(ssl.qty_in) - SUM(ssl.qty_out) AS current_balance
//         FROM tx_store_stock_ledger ssl
//         LEFT JOIN md_store   s ON s.store_id     = ssl.store_id
//         LEFT JOIN md_product p ON p.product_id   = ssl.product_id
//         ${condition}
//         GROUP BY ssl.store_id, ssl.project_id, ssl.site_id, ssl.product_id
//         HAVING current_balance > 0
//         ORDER BY ssl.store_id, ssl.product_id
//       `;

//       const rows = await customSelectSqlQuery(sql);

//       return res.status(200).json({
//         success: true,
//         message: "Store-wise stock report",
//         data: rows,
//       });

//     } catch (err) {
//       console.error("[getStoreWiseStock]", err);
//       return res.status(500).json({ success: false, message: err.message });
//     }
//   }


//   // -----------------------------------------------------------------------
//   // 5. GET LEDGER HISTORY FOR A STORE + PRODUCT
//   // GET /api/stock-ledger/history?store_id=1&product_id=5
//   // -----------------------------------------------------------------------
//   async getLedgerHistory(req, res) {
//     try {
//       const { store_id, product_id, from_date, to_date } = req.query;

//       if (!store_id || !product_id) {
//         return res.status(400).json({
//           success: false,
//           message: "store_id and product_id are required",
//         });
//       }

//       let dateFilter = "";
//       if (from_date && to_date) {
//         dateFilter = `AND ssl.transaction_date BETWEEN '${from_date}' AND '${to_date}'`;
//       }

//       const sql = `
//         SELECT
//           ssl.ledger_id,
//           ssl.transaction_type,
//           ssl.transaction_date,
//           ssl.qty_in,
//           ssl.qty_out,
//           ssl.balance_qty,
//           ssl.reference_id,
//           fs.store_name  AS from_store_name,
//           ts.store_name  AS to_store_name,
//           ssl.from_project_id,
//           ssl.from_site_id,
//           ssl.to_project_id,
//           ssl.to_site_id,
//           ssl.created_by,
//           ssl.created_at
//         FROM tx_store_stock_ledger ssl
//         LEFT JOIN md_store fs ON fs.store_id = ssl.from_store_id
//         LEFT JOIN md_store ts ON ts.store_id = ssl.to_store_id
//         WHERE ssl.store_id   = ${store_id}
//           AND ssl.product_id = ${product_id}
//           ${dateFilter}
//         ORDER BY ssl.ledger_id ASC
//       `;

//       const rows = await customSelectSqlQuery(sql);

//       return res.status(200).json({
//         success: true,
//         message: "Ledger history fetched",
//         data: rows,
//       });

//     } catch (err) {
//       console.error("[getLedgerHistory]", err);
//       return res.status(500).json({ success: false, message: err.message });
//     }
//   }


//   // -----------------------------------------------------------------------
//   // 6. GET PRODUCT LOCATION — which stores hold a specific product
//   // GET /api/stock-ledger/report/product-location?product_id=5
//   // -----------------------------------------------------------------------
//   async getProductLocation(req, res) {
//     try {
//       const { product_id } = req.query;

//       if (!product_id) {
//         return res.status(400).json({ success: false, message: "product_id is required" });
//       }

//       const sql = `
//         SELECT
//           ssl.store_id,
//           s.store_name,
//           ssl.project_id,
//           ssl.site_id,
//           SUM(ssl.qty_in) - SUM(ssl.qty_out) AS current_balance
//         FROM tx_store_stock_ledger ssl
//         LEFT JOIN md_store s ON s.store_id = ssl.store_id
//         WHERE ssl.product_id = ${product_id}
//         GROUP BY ssl.store_id, ssl.project_id, ssl.site_id
//         HAVING current_balance > 0
//         ORDER BY current_balance DESC
//       `;

//       const rows = await customSelectSqlQuery(sql);

//       return res.status(200).json({
//         success: true,
//         message: "Product location report",
//         data: rows,
//       });

//     } catch (err) {
//       console.error("[getProductLocation]", err);
//       return res.status(500).json({ success: false, message: err.message });
//     }
//   }


//   // -----------------------------------------------------------------------
//   // 7. GET TRANSFER HISTORY
//   // GET /api/stock-ledger/report/transfers?store_id=1
//   // -----------------------------------------------------------------------
//   async getTransferHistory(req, res) {
//     try {
//       const { store_id, from_date, to_date } = req.query;

//       let conditions = [`ssl.transaction_type IN ('TRANSFER_IN','TRANSFER_OUT')`];
//       if (store_id)  conditions.push(`(ssl.from_store_id = ${store_id} OR ssl.to_store_id = ${store_id})`);
//       if (from_date && to_date) conditions.push(`ssl.transaction_date BETWEEN '${from_date}' AND '${to_date}'`);

//       const sql = `
//         SELECT
//           ssl.ledger_id,
//           ssl.transaction_type,
//           ssl.transaction_date,
//           ssl.product_id,
//           p.product_name,
//           ssl.qty_in,
//           ssl.qty_out,
//           ssl.balance_qty,
//           ssl.from_store_id,
//           fs.store_name AS from_store_name,
//           ssl.from_project_id,
//           ssl.from_site_id,
//           ssl.to_store_id,
//           ts.store_name AS to_store_name,
//           ssl.to_project_id,
//           ssl.to_site_id,
//           ssl.created_at
//         FROM tx_store_stock_ledger ssl
//         LEFT JOIN md_store   fs ON fs.store_id   = ssl.from_store_id
//         LEFT JOIN md_store   ts ON ts.store_id   = ssl.to_store_id
//         LEFT JOIN md_product p  ON p.product_id  = ssl.product_id
//         WHERE ${conditions.join(" AND ")}
//         ORDER BY ssl.transaction_date DESC, ssl.ledger_id DESC
//       `;

//       const rows = await customSelectSqlQuery(sql);

//       return res.status(200).json({
//         success: true,
//         message: "Transfer history fetched",
//         data: rows,
//       });

//     } catch (err) {
//       console.error("[getTransferHistory]", err);
//       return res.status(500).json({ success: false, message: err.message });
//     }
//   }


//   // -----------------------------------------------------------------------
//   // 8. GET SINGLE LEDGER ENTRY
//   // GET /api/stock-ledger/:ledger_id
//   // -----------------------------------------------------------------------
//   async getLedgerById(req, res) {
//     try {
//       const { ledger_id } = req.params;

//       const row = await selectOneData(
//         "tx_store_stock_ledger",
//         "*",
//         `ledger_id = ${ledger_id}`
//       );

//       if (!row) {
//         return res.status(404).json({ success: false, message: "Ledger entry not found" });
//       }

//       return res.status(200).json({ success: true, data: row });

//     } catch (err) {
//       console.error("[getLedgerById]", err);
//       return res.status(500).json({ success: false, message: err.message });
//     }
//   }


//   // -----------------------------------------------------------------------
//   // 9. GET AVAILABLE STOCK (used before transfer / DPR validation)
//   // GET /api/stock-ledger/available?store_id=1&project_id=1&site_id=1&product_id=5
//   // -----------------------------------------------------------------------
//   async getAvailableStock(req, res) {
//     try {
//       const { store_id, project_id, site_id, product_id } = req.query;

//       if (!store_id || !product_id) {
//         return res.status(400).json({ success: false, message: "store_id and product_id are required" });
//       }

//       let condition = `store_id = ${store_id} AND product_id = ${product_id}`;
//       if (project_id) condition += ` AND project_id = ${project_id}`;
//       if (site_id)    condition += ` AND site_id = ${site_id}`;

//       const sql = `
//         SELECT
//           SUM(qty_in)                      AS total_in,
//           SUM(qty_out)                     AS total_out,
//           SUM(qty_in) - SUM(qty_out)       AS available_qty
//         FROM tx_store_stock_ledger
//         WHERE ${condition}
//       `;

//       const row = await customSelectSqlQuery(sql, false);

//       return res.status(200).json({
//         success: true,
//         data: {
//           store_id,
//           product_id,
//           total_in:      parseFloat(row?.total_in   || 0),
//           total_out:     parseFloat(row?.total_out  || 0),
//           available_qty: parseFloat(row?.available_qty || 0),
//         },
//       });

//     } catch (err) {
//       console.error("[getAvailableStock]", err);
//       return res.status(500).json({ success: false, message: err.message });
//     }
//   }

// }

// module.exports = new StoreStockController();

//////////////////////////////////////////////////////////////////////////////////














const {
  selectData,
  selectOneData,
  insertData,
  updateData,
  customSelectSqlQuery,
  customSelectSqlQuery2,
  batchInsertData
} = require("../models/MasterModel");

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

class StoreStockController {

  // -----------------------------------------------------------------------
  // 1. ADD PURCHASE ENTRY  (called when purchase invoice is created)
  // POST /api/stock-ledger/purchase
  // -----------------------------------------------------------------------
  async addPurchaseEntry(req, res) {
    try {
      const {
        store_id,
        project_id,
        site_id,
        product_id,
        purchase_id,        // ← from purchase table
        invoice_no,         // ← e.g. "INV-2024-001"
        qty_in,
        transaction_date,
        created_by,
      } = req.body;

      // Validation
      if (!store_id || !project_id || !site_id || !product_id || !purchase_id || !invoice_no || !qty_in) {
        return res.status(400).json({
          success: false,
          message: "store_id, project_id, site_id, product_id, purchase_id, invoice_no and qty_in are required",
        });
      }

      // Get last balance for this store + product
      const lastEntry = await selectOneData(
        "tx_store_stock_ledger",
        "balance_qty",
        `store_id = ${store_id} AND product_id = ${product_id}`,
        "ledger_id"
      );

      const prevBalance = lastEntry ? parseFloat(lastEntry.balance_qty) : 0;
      const newBalance  = prevBalance + parseFloat(qty_in);

      const data = {
        store_id,
        project_id,
        site_id,
        product_id,
        purchase_id,               // ← new
        invoice_no,                // ← new
        from_store_id:   null,
        from_project_id: null,
        from_site_id:    null,
        to_store_id:     store_id,
        to_project_id:   project_id,
        to_site_id:      site_id,
        transaction_type: "PURCHASE",
        qty_in:      parseFloat(qty_in),
        qty_out:     0,
        balance_qty: newBalance,
        transaction_date: transaction_date || dayjs().format("YYYY-MM-DD"),
        created_by,
      };

      const ledger_id = await insertData("tx_store_stock_ledger", data);

      return res.status(201).json({
        success: true,
        message: "Purchase entry added to ledger",
        data: { ledger_id, balance_qty: newBalance },
      });

    } catch (err) {
      console.error("[addPurchaseEntry]", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  // -----------------------------------------------------------------------
  // 2. ADD DPR ISSUE ENTRY  (called when DPR consumes stock)
  // POST /api/stock-ledger/dpr-issue
  // -----------------------------------------------------------------------
  async addDprIssueEntry(req, res) {
    try {
      const {
        store_id,
        project_id,
        site_id,
        product_id,
        dpr_id,             // ← DPR reference
        qty_out,
        transaction_date,
        created_by,
      } = req.body;

      // Validation
      if (!store_id || !project_id || !site_id || !product_id || !dpr_id || !qty_out) {
        return res.status(400).json({
          success: false,
          message: "store_id, project_id, site_id, product_id, dpr_id and qty_out are required",
        });
      }

      // Check available balance
      const balanceRow = await customSelectSqlQuery(
        `SELECT SUM(qty_in) - SUM(qty_out) AS available
         FROM tx_store_stock_ledger
         WHERE store_id   = ${store_id}
           AND product_id = ${product_id}
           AND project_id = ${project_id}
           AND site_id    = ${site_id}`,
        false
      );

      const available = parseFloat(balanceRow?.available || 0);

      if (parseFloat(qty_out) > available) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${available}, Requested: ${qty_out}`,
        });
      }

      const newBalance = available - parseFloat(qty_out);

      const data = {
        store_id,
        project_id,
        site_id,
        product_id,
        purchase_id:     null,     // ← NULL for DPR
        invoice_no:      null,     // ← NULL for DPR
        from_store_id:   store_id,
        from_project_id: project_id,
        from_site_id:    site_id,
        to_store_id:     null,
        to_project_id:   null,
        to_site_id:      null,
        transaction_type: "DPR_ISSUE",
        dpr_id,                    // ← DPR reference stored
        qty_in:      0,
        qty_out:     parseFloat(qty_out),
        balance_qty: newBalance,
        transaction_date: transaction_date || dayjs().format("YYYY-MM-DD"),
        created_by,
      };

      const ledger_id = await insertData("tx_store_stock_ledger", data);

      return res.status(201).json({
        success: true,
        message: "DPR issue entry added to ledger",
        data: { ledger_id, balance_qty: newBalance },
      });

    } catch (err) {
      console.error("[addDprIssueEntry]", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  ////////////////////////////////////////

  // -----------------------------------------------------------------------
  // 3. TRANSFER STOCK BETWEEN STORES
  // POST /api/stock-ledger/transfer
  // -----------------------------------------------------------------------
 




// async transferStock(req, res) {
//   try {

//     const {
//       from_store_id,
//       from_project_id,
//       from_site_id,
//       to_store_id,
//       to_project_id,
//       to_site_id,
//       product_id,
//       transfer_qty,
//       purchase_id = null,
//       invoice_no = null,
//       transaction_date,
//       created_by
//     } = req.body;

//     // ---------------- VALIDATION ----------------
//     if (
//       !from_store_id || !from_project_id || !from_site_id ||
//       !to_store_id   || !to_project_id   || !to_site_id   ||
//       !product_id    || !transfer_qty
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "All from/to fields, product_id and transfer_qty are required"
//       });
//     }

//     if (
//       parseInt(from_store_id) === parseInt(to_store_id) &&
//       parseInt(from_project_id) === parseInt(to_project_id) &&
//       parseInt(from_site_id) === parseInt(to_site_id)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Source and destination cannot be same"
//       });
//     }

//     const qty = parseFloat(transfer_qty);
//     const txDate = transaction_date || dayjs().format("YYYY-MM-DD");

//     // ---------------- SOURCE CURRENT STOCK ----------------
//     const sourceStock = await selectOneData(
//       "tx_current_stock",
//       "*",
//       `project_id=${from_project_id}
//        AND site_id=${from_site_id}
//        AND store_id=${from_store_id}
//        AND product_id=${product_id}`
//     );

//     if (!sourceStock) {
//       return res.status(400).json({
//         success: false,
//         message: "Source stock not found"
//       });
//     }

//     const availableQty = parseFloat(sourceStock.invoice_qty);

//     if (qty > availableQty) {
//       return res.status(400).json({
//         success: false,
//         message: `Insufficient stock. Available ${availableQty}`
//       });
//     }

//     const remainingQty = availableQty - qty;

//     // ---------------- UPDATE SOURCE STOCK ----------------
//     await updateData(
//       "tx_current_stock",
//       {
//         invoice_qty: remainingQty,
//         updated_by: created_by,
//         updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss")
//       },
//       `current_stock_id=${sourceStock.current_stock_id}`
//     );

//     // ---------------- DESTINATION STOCK ----------------
//     const destStock = await selectOneData(
//       "tx_current_stock",
//       "*",
//       `project_id=${to_project_id}
//        AND site_id=${to_site_id}
//        AND store_id=${to_store_id}
//        AND product_id=${product_id}`
//     );

//     let destFinalQty = 0;

//     if (destStock) {

//       destFinalQty = parseFloat(destStock.invoice_qty) + qty;

//       await updateData(
//         "tx_current_stock",
//         {
//           invoice_qty: destFinalQty,
//           updated_by: created_by,
//           updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss")
//         },
//         `current_stock_id=${destStock.current_stock_id}`
//       );

//     } else {

//       destFinalQty = qty;

//       await insertData("tx_current_stock", {
//         project_id: to_project_id,
//         site_id: to_site_id,
//         store_id: to_store_id,
//         product_id,
//         invoice_qty: qty,
//         created_by
//       });

//     }

//     // ---------------- SOURCE LEDGER BALANCE ----------------
//     const sourceBalance = await customSelectSqlQuery(
//       `SELECT COALESCE(SUM(qty_in) - SUM(qty_out),0) AS balance
//        FROM tx_store_stock_ledger
//        WHERE store_id=${from_store_id}
//        AND project_id=${from_project_id}
//        AND site_id=${from_site_id}
//        AND product_id=${product_id}`,
//       false
//     );

//     const sourceLedgerBalance = parseFloat(sourceBalance?.balance || 0);

//     // ---------------- DEST LEDGER BALANCE ----------------
//     const destBalance = await customSelectSqlQuery(
//       `SELECT COALESCE(SUM(qty_in) - SUM(qty_out),0) AS balance
//        FROM tx_store_stock_ledger
//        WHERE store_id=${to_store_id}
//        AND project_id=${to_project_id}
//        AND site_id=${to_site_id}
//        AND product_id=${product_id}`,
//       false
//     );

//     const destLedgerBalance = parseFloat(destBalance?.balance || 0);

//     // ---------------- TRANSFER OUT LEDGER ----------------
//     await insertData("tx_store_stock_ledger", {

//       store_id: from_store_id,
//       project_id: from_project_id,
//       site_id: from_site_id,
//       product_id,

//       purchase_id,
//       invoice_no,

//       from_store_id,
//       from_project_id,
//       from_site_id,

//       to_store_id,
//       to_project_id,
//       to_site_id,

//       transaction_type: "TRANSFER_OUT",

//       qty_in: 0,
//       qty_out: qty,

//       balance_qty: sourceLedgerBalance - qty,

//       transaction_date: txDate,
//       created_by
//     });

//     // ---------------- TRANSFER IN LEDGER ----------------
//     const ledger_id = await insertData("tx_store_stock_ledger", {

//       store_id: to_store_id,
//       project_id: to_project_id,
//       site_id: to_site_id,
//       product_id,

//       purchase_id,
//       invoice_no,

//       from_store_id,
//       from_project_id,
//       from_site_id,

//       to_store_id,
//       to_project_id,
//       to_site_id,

//       transaction_type: "TRANSFER_IN",

//       qty_in: qty,
//       qty_out: 0,

//       balance_qty: destLedgerBalance + qty,

//       transaction_date: txDate,
//       created_by
//     });

//     // ---------------- RESPONSE ----------------
//     return res.status(201).json({
//       success: true,
//       message: "Stock transferred successfully",
//       data: {
//         ledger_id,
//         product_id,
//         transfer_qty: qty,
//         purchase_id,
//         invoice_no,
//         source_balance_after: remainingQty,
//         destination_balance_after: destFinalQty
//       }
//     });

//   } catch (err) {

//     console.error("[transferStock]", err);

//     return res.status(500).json({
//       success: false,
//       message: err.message
//     });

//   }
// }

// async transferStock(req, res) {
//   try {

//     const {
//       from_store_id,
//       from_project_id,
//       from_site_id,
//       to_store_id,
//       to_project_id,
//       to_site_id,
//       products,           // [{ product_id, transfer_qty, purchase_id, invoice_no }]
//       transaction_date,
//       created_by
//     } = req.body;

//     // ---------------- VALIDATION ----------------
//     if (
//       !from_store_id || !from_project_id || !from_site_id ||
//       !to_store_id   || !to_project_id   || !to_site_id
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "All from/to store, project, and site fields are required"
//       });
//     }

//     if (
//       parseInt(from_store_id) === parseInt(to_store_id) &&
//       parseInt(from_project_id) === parseInt(to_project_id) &&
//       parseInt(from_site_id) === parseInt(to_site_id)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Source and destination cannot be the same"
//       });
//     }

//     if (!Array.isArray(products) || products.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "products must be a non-empty array"
//       });
//     }

//     const txDate = transaction_date || dayjs().format("YYYY-MM-DD");
//     const now    = dayjs().format("YYYY-MM-DD HH:mm:ss");

//     // ---------------- PER-PRODUCT STOCK CHECKS & UPDATES ----------------
//     const transferOutRows = [];   // batch ledger rows for TRANSFER_OUT
//     const transferInRows  = [];   // batch ledger rows for TRANSFER_IN
//     const results         = [];

//     for (const item of products) {

//       const { product_id, transfer_qty, purchase_id = null, invoice_no = null } = item;

//       if (!product_id || !transfer_qty) {
//         return res.status(400).json({
//           success: false,
//           message: `product_id and transfer_qty are required for every product (failed on product_id: ${product_id})`
//         });
//       }

//       const qty = parseFloat(transfer_qty);

//       // ── SOURCE STOCK ──
//       const sourceStock = await selectOneData(
//         "tx_current_stock",
//         "*",
//         `project_id=${from_project_id}
//          AND site_id=${from_site_id}
//          AND store_id=${from_store_id}
//          AND product_id=${product_id}`
//       );

//       if (!sourceStock) {
//         return res.status(400).json({
//           success: false,
//           message: `Source stock not found for product_id: ${product_id}`
//         });
//       }

//       const availableQty = parseFloat(sourceStock.invoice_qty);

//       if (qty > availableQty) {
//         return res.status(400).json({
//           success: false,
//           message: `Insufficient stock for product_id: ${product_id}. Available: ${availableQty}`
//         });
//       }

//       const remainingQty = availableQty - qty;

//       // ── UPDATE SOURCE STOCK ──
//       await updateData(
//         "tx_current_stock",
//         {
//           invoice_qty: remainingQty,
//           updated_by:  created_by,
//           updated_at:  now
//         },
//         `current_stock_id=${sourceStock.current_stock_id}`
//       );

//       // ── DESTINATION STOCK ──
//       const destStock = await selectOneData(
//         "tx_current_stock",
//         "*",
//         `project_id=${to_project_id}
//          AND site_id=${to_site_id}
//          AND store_id=${to_store_id}
//          AND product_id=${product_id}`
//       );

//       let destFinalQty = 0;

//       if (destStock) {

//         destFinalQty = parseFloat(destStock.invoice_qty) + qty;

//         await updateData(
//           "tx_current_stock",
//           {
//             invoice_qty: destFinalQty,
//             updated_by:  created_by,
//             updated_at:  now
//           },
//           `current_stock_id=${destStock.current_stock_id}`
//         );

//       } else {

//         destFinalQty = qty;

//         await insertData("tx_current_stock", {
//           project_id: to_project_id,
//           site_id:    to_site_id,
//           store_id:   to_store_id,
//           product_id,
//           invoice_qty: qty,
//           created_by
//         });

//       }

//       // ── SOURCE LEDGER BALANCE ──
//       const sourceBalance = await customSelectSqlQuery(
//         `SELECT COALESCE(SUM(qty_in) - SUM(qty_out), 0) AS balance
//          FROM tx_store_stock_ledger
//          WHERE store_id=${from_store_id}
//            AND project_id=${from_project_id}
//            AND site_id=${from_site_id}
//            AND product_id=${product_id}`,
//         false
//       );

//       const sourceLedgerBalance = parseFloat(sourceBalance?.balance || 0);

//       // ── DEST LEDGER BALANCE ──
//       const destBalance = await customSelectSqlQuery(
//         `SELECT COALESCE(SUM(qty_in) - SUM(qty_out), 0) AS balance
//          FROM tx_store_stock_ledger
//          WHERE store_id=${to_store_id}
//            AND project_id=${to_project_id}
//            AND site_id=${to_site_id}
//            AND product_id=${product_id}`,
//         false
//       );

//       const destLedgerBalance = parseFloat(destBalance?.balance || 0);

//       // ── COLLECT LEDGER ROWS ──
//       transferOutRows.push({
//         store_id:    from_store_id,
//         project_id:  from_project_id,
//         site_id:     from_site_id,
//         product_id,
//         purchase_id,
//         invoice_no,
//         from_store_id,
//         from_project_id,
//         from_site_id,
//         to_store_id,
//         to_project_id,
//         to_site_id,
//         transaction_type: "TRANSFER_OUT",
//         qty_in:           0,
//         qty_out:          qty,
//         balance_qty:      sourceLedgerBalance - qty,
//         transaction_date: txDate,
//         created_by
//       });

//       transferInRows.push({
//         store_id:    to_store_id,
//         project_id:  to_project_id,
//         site_id:     to_site_id,
//         product_id,
//         purchase_id,
//         invoice_no,
//         from_store_id,
//         from_project_id,
//         from_site_id,
//         to_store_id,
//         to_project_id,
//         to_site_id,
//         transaction_type: "TRANSFER_IN",
//         qty_in:           qty,
//         qty_out:          0,
//         balance_qty:      destLedgerBalance + qty,
//         transaction_date: txDate,
//         created_by
//       });

//       results.push({
//         product_id,
//         transfer_qty:              qty,
//         purchase_id,
//         invoice_no,
//         source_balance_after:      remainingQty,
//         destination_balance_after: destFinalQty
//       });
//     }

//     // ---------------- BATCH INSERT BOTH LEDGER SETS ----------------
//     const ledgerColumns =
//       "store_id, project_id, site_id, product_id, purchase_id, invoice_no, " +
//       "from_store_id, from_project_id, from_site_id, " +
//       "to_store_id, to_project_id, to_site_id, " +
//       "transaction_type, qty_in, qty_out, balance_qty, transaction_date, created_by";

//     await batchInsertData(
//       "tx_store_stock_ledger",
//       ledgerColumns,
//       transferOutRows
//     );

//     await batchInsertData(
//       "tx_store_stock_ledger",
//       ledgerColumns,
//       transferInRows
//     );

//     // ---------------- RESPONSE ----------------
//     return res.status(201).json({
//       success: true,
//       message: `${products.length} product(s) transferred successfully`,
//       data: results
//     });

//   } catch (err) {

//     console.error("[transferStock]", err);

//     return res.status(500).json({
//       success: false,
//       message: err.message
//     });

//   }
// }


async transferStock(req, res) {
  try {

    const {
      from_store_id,
      from_project_id,
      from_site_id,
      to_store_id,
      to_project_id,
      to_site_id,
      products,
      transaction_date,
     
    } = req.body;
 const created_by = req.user.id;
    // ---------------- SANITIZE HELPER ----------------
    const sanitize = (obj) =>
      Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, v === undefined ? null : v])
      );

    // ---------------- VALIDATION ----------------
    if (
      !from_store_id || !from_project_id || !from_site_id ||
      !to_store_id   || !to_project_id   || !to_site_id
    ) {
      return res.status(400).json({
        success: false,
        message: "All from/to store, project, and site fields are required"
      });
    }

    if (
      parseInt(from_store_id) === parseInt(to_store_id) &&
      parseInt(from_project_id) === parseInt(to_project_id) &&
      parseInt(from_site_id) === parseInt(to_site_id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Source and destination cannot be the same"
      });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "products must be a non-empty array"
      });
    }

    const txDate = transaction_date || dayjs().format("YYYY-MM-DD");
    const now    = dayjs().format("YYYY-MM-DD HH:mm:ss");

    // ---------------- PER-PRODUCT STOCK CHECKS & UPDATES ----------------
    const transferOutRows = [];
    const transferInRows  = [];
    const results         = [];

    for (const item of products) {

      const { product_id, transfer_qty } = item;
      const purchase_id = item.purchase_id ?? null;  // ✅ undefined → null
      const invoice_no  = item.invoice_no  ?? null;  // ✅ undefined → null

      if (!product_id || !transfer_qty) {
        return res.status(400).json({
          success: false,
          message: `product_id and transfer_qty are required for every product (failed on product_id: ${product_id})`
        });
      }

      const qty = parseFloat(transfer_qty);

      // ── SOURCE STOCK ──
      const sourceStock = await selectOneData(
        "tx_current_stock",
        "*",
        `project_id=${from_project_id}
         AND site_id=${from_site_id}
         AND store_id=${from_store_id}
         AND product_id=${product_id}`
      );

      if (!sourceStock) {
        return res.status(400).json({
          success: false,
          message: `Source stock not found for product_id: ${product_id}`
        });
      }

      const availableQty = parseFloat(sourceStock.invoice_qty);

      if (qty > availableQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product_id: ${product_id}. Available: ${availableQty}`
        });
      }

      const remainingQty = availableQty - qty;

      // ── UPDATE SOURCE STOCK ──
      await updateData(
        "tx_current_stock",
        {
          invoice_qty: remainingQty,
          updated_by:  created_by ?? null,
          updated_at:  now
        },
        `current_stock_id=${sourceStock.current_stock_id}`
      );

      // ── DESTINATION STOCK ──
      const destStock = await selectOneData(
        "tx_current_stock",
        "*",
        `project_id=${to_project_id}
         AND site_id=${to_site_id}
         AND store_id=${to_store_id}
         AND product_id=${product_id}`
      );

      let destFinalQty = 0;

      if (destStock) {

        destFinalQty = parseFloat(destStock.invoice_qty) + qty;

        await updateData(
          "tx_current_stock",
          {
            invoice_qty: destFinalQty,
            updated_by:  created_by ?? null,
            updated_at:  now
          },
          `current_stock_id=${destStock.current_stock_id}`
        );

      } else {

        destFinalQty = qty;

        await insertData("tx_current_stock", sanitize({
          project_id:  to_project_id,
          site_id:     to_site_id,
          store_id:    to_store_id,
          product_id,
          invoice_qty: qty,
          created_by
        }));

      }

      // ── SOURCE LEDGER BALANCE ──
      const sourceBalance = await customSelectSqlQuery(
        `SELECT COALESCE(SUM(qty_in) - SUM(qty_out), 0) AS balance
         FROM tx_store_stock_ledger
         WHERE store_id=${from_store_id}
           AND project_id=${from_project_id}
           AND site_id=${from_site_id}
           AND product_id=${product_id}`,
        false
      );

      const sourceLedgerBalance = parseFloat(sourceBalance?.balance || 0);

      // ── DEST LEDGER BALANCE ──
      const destBalance = await customSelectSqlQuery(
        `SELECT COALESCE(SUM(qty_in) - SUM(qty_out), 0) AS balance
         FROM tx_store_stock_ledger
         WHERE store_id=${to_store_id}
           AND project_id=${to_project_id}
           AND site_id=${to_site_id}
           AND product_id=${product_id}`,
        false
      );

      const destLedgerBalance = parseFloat(destBalance?.balance || 0);

      // ── COLLECT LEDGER ROWS ──
      transferOutRows.push(sanitize({
        store_id:         from_store_id,
        project_id:       from_project_id,
        site_id:          from_site_id,
        product_id,
        purchase_id,
        invoice_no,
        from_store_id,
        from_project_id,
        from_site_id,
        to_store_id,
        to_project_id,
        to_site_id,
        transaction_type: "TRANSFER_OUT",
        qty_in:           0,
        qty_out:          qty,
        balance_qty:      sourceLedgerBalance - qty,
        transaction_date: txDate,
        created_by
      }));

      transferInRows.push(sanitize({
        store_id:         to_store_id,
        project_id:       to_project_id,
        site_id:          to_site_id,
        product_id,
        purchase_id,
        invoice_no,
        from_store_id,
        from_project_id,
        from_site_id,
        to_store_id,
        to_project_id,
        to_site_id,
        transaction_type: "TRANSFER_IN",
        qty_in:           qty,
        qty_out:          0,
        balance_qty:      destLedgerBalance + qty,
        transaction_date: txDate,
        created_by
      }));

      results.push({
        product_id,
        transfer_qty:              qty,
        purchase_id,
        invoice_no,
        source_balance_after:      remainingQty,
        destination_balance_after: destFinalQty
      });
    }

    // ---------------- BATCH INSERT BOTH LEDGER SETS ----------------
    const ledgerColumns =
      "store_id, project_id, site_id, product_id, purchase_id, invoice_no, " +
      "from_store_id, from_project_id, from_site_id, " +
      "to_store_id, to_project_id, to_site_id, " +
      "transaction_type, qty_in, qty_out, balance_qty, transaction_date, created_by";

    await batchInsertData(
      "tx_store_stock_ledger",
      ledgerColumns,
      transferOutRows
    );

    await batchInsertData(
      "tx_store_stock_ledger",
      ledgerColumns,
      transferInRows
    );

    // ---------------- RESPONSE ----------------
    return res.status(201).json({
      success: true,
      message: `${products.length} product(s) transferred successfully`,
      data: results
    });

  } catch (err) {

    console.error("[transferStock]", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }
}
//----------------------------------
       

//----------------------------------

// -----------------------------------------------------------------------
// 13. GET PROJECTS UNDER A STORE (where stock exists)
// GET /api/stock-ledger/store-projects/:store_id
// -----------------------------------------------------------------------
async getProjectsUnderStore(req, res) {
  try {
    const { store_id } = req.params;

    if (!store_id) {
      return res.status(400).json({
        success: false,
        message: "store_id is required",
      });
    }

    const sql = `
      SELECT DISTINCT
        sl.project_id,
        proj.project_name
      FROM tx_store_stock_ledger sl
      LEFT JOIN md_project proj
        ON proj.project_id = sl.project_id
      WHERE sl.store_id = ${store_id}
        AND (sl.qty_in - sl.qty_out) > 0
      ORDER BY proj.project_name ASC
    `;

    const rows = await customSelectSqlQuery(sql);  // fetchAll = true

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No projects with stock found for store_id: ${store_id}`,
      });
    }

    return res.status(200).json({
      success : true,
      message : "Projects fetched successfully",
      data    : rows,
    });

  } catch (err) {
    console.error("[getProjectsUnderStore]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}



  ///////////////////////////////-----------    

  // -----------------------------------------------------------------------
  // 4. GET STORE-WISE CURRENT STOCK REPORT
  // GET /api/stock-ledger/report/store-stock?store_id=1
  // -----------------------------------------------------------------------
  async getStoreWiseStock(req, res) {
    try {
      const { store_id } = req.query;

      let condition = store_id ? `WHERE ssl.store_id = ${store_id}` : "";

      const sql = `
        SELECT
          ssl.store_id,
          s.store_name,
          ssl.project_id,
          ssl.site_id,
          ssl.product_id,
          p.product_name,
          SUM(ssl.qty_in)                    AS total_in,
          SUM(ssl.qty_out)                   AS total_out,
          SUM(ssl.qty_in) - SUM(ssl.qty_out) AS current_balance
        FROM tx_store_stock_ledger ssl
        LEFT JOIN md_store   s ON s.store_id   = ssl.store_id
        LEFT JOIN md_product p ON p.product_id = ssl.product_id
        ${condition}
        GROUP BY ssl.store_id, ssl.project_id, ssl.site_id, ssl.product_id
        HAVING current_balance > 0
        ORDER BY ssl.store_id, ssl.product_id
      `;

      const rows = await customSelectSqlQuery(sql);

      return res.status(200).json({
        success: true,
        message: "Store-wise stock report",
        data: rows,
      });

    } catch (err) {
      console.error("[getStoreWiseStock]", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  // -----------------------------------------------------------------------
  // 5. GET LEDGER HISTORY FOR A STORE + PRODUCT
  // GET /api/stock-ledger/history?store_id=1&product_id=5
  // -----------------------------------------------------------------------
  async getLedgerHistory(req, res) {
    try {
      const { store_id, product_id, from_date, to_date } = req.query;

      if (!store_id || !product_id) {
        return res.status(400).json({
          success: false,
          message: "store_id and product_id are required",
        });
      }

      let dateFilter = "";
      if (from_date && to_date) {
        dateFilter = `AND ssl.transaction_date BETWEEN '${from_date}' AND '${to_date}'`;
      }

      const sql = `
        SELECT
          ssl.ledger_id,
          ssl.transaction_type,
          ssl.transaction_date,
          ssl.purchase_id,
          ssl.invoice_no,
          ssl.dpr_id,
          ssl.qty_in,
          ssl.qty_out,
          ssl.balance_qty,
          fs.store_name  AS from_store_name,
          ts.store_name  AS to_store_name,
          ssl.from_project_id,
          ssl.from_site_id,
          ssl.to_project_id,
          ssl.to_site_id,
          ssl.created_by,
          ssl.created_at
        FROM tx_store_stock_ledger ssl
        LEFT JOIN md_store fs ON fs.store_id = ssl.from_store_id
        LEFT JOIN md_store ts ON ts.store_id = ssl.to_store_id
        WHERE ssl.store_id   = ${store_id}
          AND ssl.product_id = ${product_id}
          ${dateFilter}
        ORDER BY ssl.ledger_id ASC
      `;

      const rows = await customSelectSqlQuery(sql);

      return res.status(200).json({
        success: true,
        message: "Ledger history fetched",
        data: rows,
      });

    } catch (err) {
      console.error("[getLedgerHistory]", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  // -----------------------------------------------------------------------
  // 6. GET PRODUCT LOCATION — which stores hold a specific product
  // GET /api/stock-ledger/report/product-location?product_id=5
  // -----------------------------------------------------------------------
  async getProductLocation(req, res) {
    try {
      const { product_id } = req.query;

      if (!product_id) {
        return res.status(400).json({ success: false, message: "product_id is required" });
      }

      const sql = `
        SELECT
          ssl.store_id,
          s.store_name,
          ssl.project_id,
          ssl.site_id,
          SUM(ssl.qty_in) - SUM(ssl.qty_out) AS current_balance
        FROM tx_store_stock_ledger ssl
        LEFT JOIN md_store s ON s.store_id = ssl.store_id
        WHERE ssl.product_id = ${product_id}
        GROUP BY ssl.store_id, ssl.project_id, ssl.site_id
        HAVING current_balance > 0
        ORDER BY current_balance DESC
      `;

      const rows = await customSelectSqlQuery(sql);

      return res.status(200).json({
        success: true,
        message: "Product location report",
        data: rows,
      });

    } catch (err) {
      console.error("[getProductLocation]", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  // -----------------------------------------------------------------------
  // 7. GET TRANSFER HISTORY
  // GET /api/stock-ledger/report/transfers?store_id=1
  // -----------------------------------------------------------------------
  async getTransferHistory(req, res) {
    try {
      const { store_id, from_date, to_date } = req.query;

      let conditions = [`ssl.transaction_type IN ('TRANSFER_IN','TRANSFER_OUT')`];
      if (store_id)              conditions.push(`(ssl.from_store_id = ${store_id} OR ssl.to_store_id = ${store_id})`);
      if (from_date && to_date)  conditions.push(`ssl.transaction_date BETWEEN '${from_date}' AND '${to_date}'`);

      const sql = `
        SELECT
          ssl.ledger_id,
          ssl.transaction_type,
          ssl.transaction_date,
          ssl.product_id,
          p.product_name,
          ssl.qty_in,
          ssl.qty_out,
          ssl.balance_qty,
          ssl.from_store_id,
          fs.store_name AS from_store_name,
          ssl.from_project_id,
          ssl.from_site_id,
          ssl.to_store_id,
          ts.store_name AS to_store_name,
          ssl.to_project_id,
          ssl.to_site_id,
          ssl.created_at
        FROM tx_store_stock_ledger ssl
        LEFT JOIN md_store   fs ON fs.store_id   = ssl.from_store_id
        LEFT JOIN md_store   ts ON ts.store_id   = ssl.to_store_id
        LEFT JOIN md_product p  ON p.product_id  = ssl.product_id
        WHERE ${conditions.join(" AND ")}
        ORDER BY ssl.transaction_date DESC, ssl.ledger_id DESC
      `;

      const rows = await customSelectSqlQuery(sql);

      return res.status(200).json({
        success: true,
        message: "Transfer history fetched",
        data: rows,
      });

    } catch (err) {
      console.error("[getTransferHistory]", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  // -----------------------------------------------------------------------
  // 8. GET SINGLE LEDGER ENTRY
  // GET /api/stock-ledger/:ledger_id
  // -----------------------------------------------------------------------
  async getLedgerById(req, res) {
    try {
      const { ledger_id } = req.params;

      const row = await selectOneData(
        "tx_store_stock_ledger",
        "*",
        `ledger_id = ${ledger_id}`
      );

      if (!row) {
        return res.status(404).json({ success: false, message: "Ledger entry not found" });
      }

      return res.status(200).json({ success: true, data: row });

    } catch (err) {
      console.error("[getLedgerById]", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  

  // -----------------------------------------------------------------------
  // 9. GET AVAILABLE STOCK (used before transfer / DPR validation)
  // GET /api/stock-ledger/available?store_id=1&project_id=1&site_id=1&product_id=5
  // -----------------------------------------------------------------------
  async getAvailableStock(req, res) {
    try {
      const { store_id, project_id, site_id, product_id } = req.query;

      if (!store_id || !product_id) {
        return res.status(400).json({ success: false, message: "store_id and product_id are required" });
      }

      let condition = `store_id = ${store_id} AND product_id = ${product_id}`;
      if (project_id) condition += ` AND project_id = ${project_id}`;
      if (site_id)    condition += ` AND site_id = ${site_id}`;

      const sql = `
        SELECT
          SUM(qty_in)                  AS total_in,
          SUM(qty_out)                 AS total_out,
          SUM(qty_in) - SUM(qty_out)   AS available_qty
        FROM tx_store_stock_ledger
        WHERE ${condition}
      `;

      const row = await customSelectSqlQuery(sql, false);

      return res.status(200).json({
        success: true,
        data: {
          store_id,
          product_id,
          total_in:      parseFloat(row?.total_in      || 0),
          total_out:     parseFloat(row?.total_out     || 0),
          available_qty: parseFloat(row?.available_qty || 0),
        },
      });

    } catch (err) {
      console.error("[getAvailableStock]", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }




// -----------------------------------------------------------------------
  // 10. GET FULL STORE DETAILS WITH ALL JOINED DATA
  // GET /api/stock-ledger/store-details/:store_id
  // -----------------------------------------------------------------------
 async getStoreFullDetails(req, res) {
  try {
    const { store_id } = req.params;

    if (!store_id) {
      return res.status(400).json({
        success: false,
        message: "store_id is required",
      });
    }

    // ───────────────── STORE INFO ─────────────────
    const store_info_sql = `
      SELECT store_id, store_name, store_address
      FROM md_store
      WHERE store_id = ?
      LIMIT 1
    `;

    const store_info = await customSelectSqlQuery2(store_info_sql, [store_id], false);

    if (!store_info) {
      return res.status(404).json({
        success: false,
        message: `No store found for store_id: ${store_id}`,
      });
    }

    // ───────────────── STOCK SUMMARY ─────────────────
    const stock_summary_sql = `
      SELECT
        sl.product_id,
        prd.product_name,
        SUM(sl.qty_in)  AS total_in,
        SUM(sl.qty_out) AS total_out,
        SUM(sl.qty_in) - SUM(sl.qty_out) AS current_balance
      FROM tx_store_stock_ledger AS sl
      LEFT JOIN md_product AS prd
        ON prd.product_id = sl.product_id
      WHERE sl.store_id = ?
      GROUP BY sl.product_id, prd.product_name
      HAVING SUM(sl.qty_in) - SUM(sl.qty_out) > 0
      ORDER BY prd.product_name ASC
    `;

    const stock_summary = await customSelectSqlQuery2(
      stock_summary_sql,
      [store_id]
    );

    // ───────────────── TRANSACTION DETAILS ─────────────────
    const transactions_sql = `
      SELECT
        sl.ledger_id,
        sl.transaction_type,
        sl.transaction_date,
        sl.qty_in,
        sl.qty_out,
        sl.balance_qty,
        sl.created_by,
        sl.created_at AS ledger_created_at,

        -- PRODUCT
        sl.product_id,
        prd.product_name,
        prd.model_no,

        -- PROJECT
        sl.project_id,
        proj.project_name,

        -- PROJECT SITE
        sl.site_id,
        ps.project_site_name,
        ps.address AS project_site_address,

        -- PURCHASE
        sl.purchase_id,
        sl.invoice_no,
        pur.invoice_date,
        pur.delivery_date,
        pur.due_date,
        pur.vendor_id,
        pur.purchase_order_id,
        pur.transport_insurance,
        pur.remarks AS purchase_remarks,

        -- FROM STORE
        sl.from_store_id,
        fs.store_name    AS from_store_name,
        fs.store_address AS from_store_address,
        sl.from_project_id,
        sl.from_site_id,

        -- TO STORE
        sl.to_store_id,
        ts.store_name    AS to_store_name,
        ts.store_address AS to_store_address,
        sl.to_project_id,
        sl.to_site_id

      FROM tx_store_stock_ledger sl

      LEFT JOIN md_product AS prd
        ON prd.product_id = sl.product_id

      LEFT JOIN md_project AS proj
        ON proj.project_id = sl.project_id

      LEFT JOIN md_project_site AS ps
        ON ps.project_site_id = sl.site_id

      LEFT JOIN td_purchase AS pur
        ON pur.purchase_id = sl.purchase_id

      LEFT JOIN md_store AS fs
        ON fs.store_id = sl.from_store_id

      LEFT JOIN md_store AS ts
        ON ts.store_id = sl.to_store_id

      WHERE sl.store_id = ?
      ORDER BY sl.ledger_id ASC
    `;

    const transactions = await customSelectSqlQuery2(
      transactions_sql,
      [store_id]
    );

    // ───────────────── RESPONSE ─────────────────
    return res.status(200).json({
      success: true,
      message: "Store full details fetched successfully",
      data: {
        store_info,
        stock_summary,
        transactions,
      },
    });

  } catch (err) {
    console.error("[getStoreFullDetails] Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
}







// ============================================================
// Add this function inside your StoreStockController class
// ============================================================

// -----------------------------------------------------------------------
// 11. DEDUCT QTY AND RECALCULATE balance_qty
//     for all ledger rows of a given project + site + product
//
// POST /api/stock-ledger/deduct
//
// Body:
// {
//   project_id      : 69,
//   site_id         : 10,
//   product_id      : 19,
//   qty_to_deduct   : 4,
//   dpr_id          : 41,        // optional — bom_progress_id reference
//   transaction_date: "2026-03-09",
//   created_by      : 5
// }
//
// What it does:
//   STEP 1 → Get current net balance  (SUM qty_in - SUM qty_out)
//            for this project + site + product (across ALL stores)
//
//   STEP 2 → Check if deduction is possible (balance >= qty_to_deduct)
//
//   STEP 3 → Insert a new DPR_ISSUE ledger row with:
//              qty_out     = qty_to_deduct
//              balance_qty = old_balance - qty_to_deduct
//
//   NOTE: We do NOT touch old rows — we only INSERT a new row.
//         balance_qty on the new row reflects the new running total.
//         This preserves the full audit trail.
// -----------------------------------------------------------------------

// async deductStockByProjectSite(req, res) {
//   try {
//     const {
//       project_id,
//       site_id,
//       product_id,
//       qty_to_deduct,
//       dpr_id        = null,
//       transaction_date,
//       created_by,
//     } = req.body;

//     // ── Validation ──
//     if (!project_id || !site_id || !product_id || !qty_to_deduct) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id, site_id, product_id and qty_to_deduct are required",
//       });
//     }

//     const deductQty = parseFloat(qty_to_deduct);

//     if (deductQty <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "qty_to_deduct must be greater than 0",
//       });
//     }

//     // ── STEP 1: Get current net balance for project + site + product ──
//     // We look across ALL stores — because you only have project_id + site_id
//     const balanceRow = await customSelectSqlQuery2(
//       `SELECT
//          COALESCE(SUM(qty_in) - SUM(qty_out), 0) AS current_balance,
//          store_id   -- take any store_id linked to this project+site+product
//        FROM tx_store_stock_ledger
//        WHERE project_id = ?
//          AND site_id    = ?
//          AND product_id = ?
//        GROUP BY store_id
//        ORDER BY MAX(ledger_id) DESC
//        LIMIT 1`,
//       [project_id, site_id, product_id],
//       false  // single row
//     );

//     if (!balanceRow) {
//       return res.status(404).json({
//         success: false,
//         message: `No stock ledger entries found for project_id=${project_id}, site_id=${site_id}, product_id=${product_id}`,
//       });
//     }

//     const current_balance = parseFloat(balanceRow.current_balance || 0);
//     const store_id        = balanceRow.store_id;  // reuse the store_id from latest row

//     // ── STEP 2: Sufficient stock check ──
//     if (deductQty > current_balance) {
//       return res.status(400).json({
//         success: false,
//         message: `Insufficient stock. Current balance: ${current_balance}, Requested deduction: ${deductQty}`,
//         data: {
//           project_id,
//           site_id,
//           product_id,
//           current_balance,
//           qty_to_deduct: deductQty,
//         },
//       });
//     }

//     const new_balance = current_balance - deductQty;

//     // ── STEP 3: Insert a new DPR_ISSUE row ──
//     // This is the correct ledger pattern — never update old rows,
//     // always append a new deduction row with the new running balance.
//     const ledger_id = await insertData("tx_store_stock_ledger", {
//       store_id,           // reused from latest ledger row for this project+site
//       project_id,
//       site_id,
//       product_id,

//       purchase_id      : null,
//       invoice_no       : null,

//       from_store_id    : store_id,
//       from_project_id  : project_id,
//       from_site_id     : site_id,

//       to_store_id      : null,
//       to_project_id    : null,
//       to_site_id       : null,

//       transaction_type : "DPR_ISSUE",

//       dpr_id,            // bom_progress_id or any DPR reference

//       qty_in           : 0,
//       qty_out          : deductQty,
//       balance_qty      : new_balance,   // ← updated balance after deduction

//       transaction_date : transaction_date || dayjs().format("YYYY-MM-DD"),
//       created_by,
//     });

//     return res.status(201).json({
//       success : true,
//       message : "Stock deducted successfully",
//       data    : {
//         ledger_id,
//         project_id,
//         site_id,
//         product_id,
//         store_id,
//         qty_deducted    : deductQty,
//         balance_before  : current_balance,
//         balance_after   : new_balance,    // ← this is your updated balance_qty
//       },
//     });

//   } catch (err) {
//     console.error("[deductStockByProjectSite]", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// }



async deductStockByProjectSite(req, res) {
  try {
    const {
      project_id,
      site_id,
      product_id,
      qty_to_deduct,
      dpr_id = null,
      transaction_date,
      created_by,
    } = req.body;

    // ── Validation ──
    if (!project_id || !site_id || !product_id || !qty_to_deduct) {
      return res.status(400).json({
        success: false,
        message: "project_id, site_id, product_id and qty_to_deduct are required",
      });
    }

    const deductQty = parseFloat(qty_to_deduct);

    if (deductQty <= 0) {
      return res.status(400).json({
        success: false,
        message: "qty_to_deduct must be greater than 0",
      });
    }

    // ── STEP 1: Get latest PURCHASE row for this project + site + product ──
    // We copy all fields from this row for the new DPR_ISSUE entry
    const latestPurchaseRow = await customSelectSqlQuery2(
      `SELECT *
       FROM tx_store_stock_ledger
       WHERE project_id      = ?
         AND site_id         = ?
         AND product_id      = ?
         AND transaction_type = 'PURCHASE'
       ORDER BY ledger_id DESC
       LIMIT 1`,
      [project_id, site_id, product_id],
      false
    );

    if (!latestPurchaseRow) {
      return res.status(404).json({
        success: false,
        message: `No PURCHASE entry found for project_id=${project_id}, site_id=${site_id}, product_id=${product_id}`,
      });
    }

    // ── STEP 2: Get current net balance ──
    const balanceRow = await customSelectSqlQuery2(
      `SELECT COALESCE(SUM(qty_in) - SUM(qty_out), 0) AS current_balance
       FROM tx_store_stock_ledger
       WHERE project_id = ?
         AND site_id    = ?
         AND product_id = ?`,
      [project_id, site_id, product_id],
      false
    );

    const current_balance = parseFloat(balanceRow?.current_balance || 0);

    // ── STEP 3: Sufficient stock check ──
    if (deductQty > current_balance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Current balance: ${current_balance}, Requested deduction: ${deductQty}`,
        data: {
          project_id,
          site_id,
          product_id,
          current_balance,
          qty_to_deduct: deductQty,
        },
      });
    }

    const new_balance = current_balance - deductQty;

    // ── STEP 4: Insert new DPR_ISSUE row ──
    // Copy everything from latest PURCHASE row, only override changed fields
    const ledger_id = await insertData("tx_store_stock_ledger", {
      // ── copied from latest PURCHASE row ──
      store_id        : latestPurchaseRow.store_id,
      project_id      : latestPurchaseRow.project_id,
      site_id         : latestPurchaseRow.site_id,
      product_id      : latestPurchaseRow.product_id,
      purchase_id     : latestPurchaseRow.purchase_id,
      invoice_no      : latestPurchaseRow.invoice_no,
      from_store_id   : latestPurchaseRow.from_store_id,
      from_project_id : latestPurchaseRow.from_project_id,
      to_store_id     : latestPurchaseRow.to_store_id,
      to_project_id   : latestPurchaseRow.to_project_id,
      to_site_id      : latestPurchaseRow.to_site_id,

      // ── changed fields ──
      from_site_id     : site_id,            // 🔄 changed
      transaction_type : "DPR_ISSUE",        // 🔄 changed
      qty_in           : 0,                  // 🔄 changed
      qty_out          : deductQty,          // 🔄 changed
      balance_qty      : new_balance,        // 🔄 changed
      transaction_date : transaction_date || dayjs().format("YYYY-MM-DD"), // 🔄 changed
      dpr_id,                                // 🔄 changed
      created_by,
    });

    return res.status(201).json({
      success : true,
      message : "Stock deducted successfully",
      data    : {
        ledger_id,
        project_id,
        site_id,
        product_id,
        store_id        : latestPurchaseRow.store_id,
        qty_deducted    : deductQty,
        balance_before  : current_balance,
        balance_after   : new_balance,
      },
    });

  } catch (err) {
    console.error("[deductStockByProjectSite]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}


// -----------------------------------------------------------------------
// 12. BULK DEDUCT — for multiple products at once (DPR consumed_products)
//
// POST /api/stock-ledger/deduct-bulk
//
// Body:
// {
//   project_id      : 69,
//   site_id         : 10,
//   dpr_id          : 41,
//   transaction_date: "2026-03-09",
//   created_by      : 5,
//   products: [
//     { product_id: 19, qty_to_deduct: 4 },
//     { product_id: 3,  qty_to_deduct: 4 }
//   ]
// }
// -----------------------------------------------------------------------

// async deductStockBulk(req, res) {
//   try {
//     const {
//       project_id,
//       site_id,
//       dpr_id        = null,
//       transaction_date,
//       created_by,
//       products      = [],
//     } = req.body;

//     // ── Validation ──
//     if (!project_id || !site_id || !products.length) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id, site_id and products[] are required",
//       });
//     }

//     const txDate  = transaction_date || dayjs().format("YYYY-MM-DD");
//     const success = [];
//     const failed  = [];

//     // ── Process each product ──
//     for (const item of products) {
//       const { product_id, qty_to_deduct } = item;
//       const deductQty = parseFloat(qty_to_deduct || 0);

//       if (!product_id || deductQty <= 0) {
//         failed.push({
//           product_id,
//           qty_to_deduct: deductQty,
//           reason: "Invalid product_id or qty_to_deduct <= 0",
//         });
//         continue;
//       }

//       try {
//         // Get current balance + store_id for this product at project+site
//         const balanceRow = await customSelectSqlQuery2(
//           `SELECT
//              COALESCE(SUM(qty_in) - SUM(qty_out), 0) AS current_balance,
//              store_id
//            FROM tx_store_stock_ledger
//            WHERE project_id = ?
//              AND site_id    = ?
//              AND product_id = ?
//            GROUP BY store_id
//            ORDER BY MAX(ledger_id) DESC
//            LIMIT 1`,
//           [project_id, site_id, product_id],
//           false
//         );

//         if (!balanceRow) {
//           failed.push({
//             product_id,
//             qty_to_deduct: deductQty,
//             reason: "No ledger entry found for this product at project+site",
//           });
//           continue;
//         }

//         const current_balance = parseFloat(balanceRow.current_balance || 0);
//         const store_id        = balanceRow.store_id;

//         if (deductQty > current_balance) {
//           failed.push({
//             product_id,
//             qty_to_deduct  : deductQty,
//             current_balance,
//             reason         : `Insufficient stock. Available: ${current_balance}`,
//           });
//           continue;
//         }

//         const new_balance = current_balance - deductQty;

//         // Insert DPR_ISSUE row
//         const ledger_id = await insertData("tx_store_stock_ledger", {
//           store_id,
//           project_id,
//           site_id,
//           product_id,

//           purchase_id      : null,
//           invoice_no       : null,

//           from_store_id    : store_id,
//           from_project_id  : project_id,
//           from_site_id     : site_id,

//           to_store_id      : null,
//           to_project_id    : null,
//           to_site_id       : null,

//           transaction_type : "DPR_ISSUE",
//           dpr_id,

//           qty_in           : 0,
//           qty_out          : deductQty,
//           balance_qty      : new_balance,

//           transaction_date : txDate,
//           created_by,
//         });

//         success.push({
//           product_id,
//           ledger_id,
//           store_id,
//           qty_deducted   : deductQty,
//           balance_before : current_balance,
//           balance_after  : new_balance,
//         });

//       } catch (innerErr) {
//         failed.push({
//           product_id,
//           qty_to_deduct: deductQty,
//           reason: innerErr.message,
//         });
//       }
//     }

//     return res.status(201).json({
//       success : true,
//       message : `Bulk deduction complete. Processed: ${success.length}, Failed: ${failed.length}`,
//       data    : {
//         project_id,
//         site_id,
//         dpr_id,
//         transaction_date : txDate,
//         processed        : success,
//         failed,
//       },
//     });

//   } catch (err) {
//     console.error("[deductStockBulk]", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// }


async deductStockBulk(req, res) {
  try {
    const {
      project_id,
      site_id,
      dpr_id = null,
      transaction_date,
      products      = [],
    } = req.body;

    const created_by = req.user?.id;   

if (!created_by) {
  return res.status(401).json({
    success: false,
    message: "Unable to identify authenticated user",
  });
}

    if (!project_id || !site_id || !products.length) {
      return res.status(400).json({
        success: false,
        message: "project_id, site_id and products[] are required",
      });
    }

    const txDate  = transaction_date || dayjs().format("YYYY-MM-DD");
    const success = [];
    const failed  = [];

    for (const item of products) {
      const { product_id, qty_to_deduct } = item;
      const deductQty = parseFloat(qty_to_deduct || 0);

      if (!product_id || deductQty <= 0) {
        failed.push({
          product_id,
          qty_to_deduct: deductQty,
          reason: "Invalid product_id or qty_to_deduct <= 0",
        });
        continue;
      }

      try {
        // ── Get current balance + store_id (unchanged) ──
        const balanceRow = await customSelectSqlQuery2(
          `SELECT
             COALESCE(SUM(qty_in) - SUM(qty_out), 0) AS current_balance,
             store_id
           FROM tx_store_stock_ledger
           WHERE project_id = ?
             AND site_id    = ?
             AND product_id = ?
           GROUP BY store_id
           ORDER BY MAX(ledger_id) DESC
           LIMIT 1`,
          [project_id, site_id, product_id],
          false
        );

        if (!balanceRow) {
          failed.push({
            product_id,
            qty_to_deduct: deductQty,
            reason: "No ledger entry found for this product at project+site",
          });
          continue;
        }

        const current_balance = parseFloat(balanceRow.current_balance || 0);
        const store_id        = balanceRow.store_id;

        if (deductQty > current_balance) {
          failed.push({
            product_id,
            qty_to_deduct  : deductQty,
            current_balance,
            reason         : `Insufficient stock. Available: ${current_balance}`,
          });
          continue;
        }

        // ── ✅ NEW: Fetch latest purchase_id & invoice_no for this product ──
        const prevRow = await customSelectSqlQuery2(
          `SELECT purchase_id, invoice_no
           FROM tx_store_stock_ledger
           WHERE project_id  = ?
             AND site_id     = ?
             AND product_id  = ?
             AND purchase_id IS NOT NULL
           ORDER BY ledger_id DESC
           LIMIT 1`,
          [project_id, site_id, product_id],
          false
        );

        const purchase_id = prevRow?.purchase_id ?? null;
        const invoice_no  = prevRow?.invoice_no  ?? null;
        // ── end new block ──

        const new_balance = current_balance - deductQty;

        const ledger_id = await insertData("tx_store_stock_ledger", {
          store_id,
          project_id,
          site_id,
          product_id,

          purchase_id,        // ✅ now carried forward from previous row
          invoice_no,         // ✅ now carried forward from previous row

          from_store_id    : store_id,
          from_project_id  : project_id,
          from_site_id     : site_id,

          to_store_id      : null,
          to_project_id    : null,
          to_site_id       : null,

          transaction_type : "DPR_ISSUE",
          dpr_id,

          qty_in           : 0,
          qty_out          : deductQty,
          balance_qty      : new_balance,

          transaction_date : txDate,
          created_by,
        });

        success.push({
          product_id,
          ledger_id,
          store_id,
          qty_deducted   : deductQty,
          balance_before : current_balance,
          balance_after  : new_balance,
          purchase_id,    // optional: useful for debugging
          invoice_no,
        });

      } catch (innerErr) {
        failed.push({
          product_id,
          qty_to_deduct: deductQty,
          reason: innerErr.message,
        });
      }
    }

    return res.status(201).json({
      success : true,
      message : `Bulk deduction complete. Processed: ${success.length}, Failed: ${failed.length}`,
      data    : {
        project_id,
        site_id,
        dpr_id,
        transaction_date : txDate,
        processed        : success,
        failed,
      },
    });

  } catch (err) {
    console.error("[deductStockBulk]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

///////////////////////////////////


// async getStoreProjectSiteStock(req, res) {
//   try {
//    // const { store_id, project_id, site_id } = req.params;

//    const { store_id, project_id, site_id } = req.body;

//     const sql = `
//       SELECT
//         a.store_id,
//         s.store_name,
//         a.project_id,
//         a.site_id,
//         a.product_id,
//         p.product_name,
//         a.balance_qty AS current_balance
//       FROM tx_store_stock_ledger a
//       INNER JOIN (
//         SELECT 
//           product_id,
//           MAX(ledger_id) AS last_ledger_id
//         FROM tx_store_stock_ledger
//         WHERE store_id = ${store_id}
//           AND project_id = ${project_id}
//           AND site_id = ${site_id}
//         GROUP BY product_id
//       ) b ON a.ledger_id = b.last_ledger_id
//       LEFT JOIN md_store s ON s.store_id = a.store_id
//       LEFT JOIN md_product p ON p.product_id = a.product_id
//       ORDER BY a.product_id
//     `;
//     const rows = await customSelectSqlQuery(sql);

//     return res.status(200).json({
//       success: true,
//       message: "Store project site stock",
//       data: rows,
//     });

//   } catch (err) {
//     console.error("[getStoreProjectSiteStock]", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// }



// async getStoreProjectSiteStock(req, res) {
//   try {

//     const { store_id, project_id, site_id } = req.body;

//     const sql = `
//       SELECT
//         a.store_id,
//         s.store_name,

//         a.project_id,
//         pr.project_name,

//         a.site_id,
//         ps.project_site_name,

//         a.product_id,
//         p.product_name,
//         a.balance_qty AS current_balance

//       FROM tx_store_stock_ledger a

//       INNER JOIN (
//         SELECT 
//           product_id,
//           MAX(ledger_id) AS last_ledger_id
//         FROM tx_store_stock_ledger
//         WHERE store_id = ${store_id}
//           AND project_id = ${project_id}
//           AND site_id = ${site_id}
//         GROUP BY product_id
//       ) b ON a.ledger_id = b.last_ledger_id

//       LEFT JOIN md_store s 
//         ON s.store_id = a.store_id

//       LEFT JOIN md_product p 
//         ON p.product_id = a.product_id

//       LEFT JOIN md_project pr 
//         ON pr.project_id = a.project_id

//       LEFT JOIN md_project_site ps 
//         ON ps.project_site_id = a.site_id

//       ORDER BY a.product_id
//     `;

//     const rows = await customSelectSqlQuery(sql);

//     return res.status(200).json({
//       success: true,
//       message: "Store project site stock",
//       data: rows,
//     });

//   } catch (err) {
//     console.error("[getStoreProjectSiteStock]", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// }



async getStoreProjectSiteStock(req, res) {
  try {

    const { store_id, project_id, site_id } = req.body;

    const sql = `
      SELECT
        a.store_id,
        s.store_name,

        a.project_id,
        pr.project_name,

        a.site_id,
        ps.project_site_name,

        a.product_id,
        p.product_name,

        a.purchase_id,
        a.invoice_no,

        a.balance_qty AS current_balance

      FROM tx_store_stock_ledger a

      INNER JOIN (
        SELECT 
          product_id,
          MAX(ledger_id) AS last_ledger_id
        FROM tx_store_stock_ledger
        WHERE store_id = ${store_id}
          AND project_id = ${project_id}
          AND site_id = ${site_id}
        GROUP BY product_id
      ) b ON a.ledger_id = b.last_ledger_id

      LEFT JOIN md_store s 
        ON s.store_id = a.store_id

      LEFT JOIN md_product p 
        ON p.product_id = a.product_id

      LEFT JOIN md_project pr 
        ON pr.project_id = a.project_id

      LEFT JOIN md_project_site ps 
        ON ps.project_site_id = a.site_id

      ORDER BY a.product_id
    `;

    const rows = await customSelectSqlQuery(sql);

    return res.status(200).json({
      success: true,
      message: "Store project site stock",
      data: rows,
    });

  } catch (err) {
    console.error("[getStoreProjectSiteStock]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}



}

module.exports = new StoreStockController();