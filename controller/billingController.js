const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const {
  insertData,
  updateData,
  selectOneData,
  selectData,
  deleteData,
  customSelectSqlQuery,
  customSelectSqlQuery2
} = require("../models/MasterModel");

class BillingController {

  /* ---------------------------------------------------
     Generate Invoice No → DDMMYYYY/0001
  --------------------------------------------------- */
  async generateInvoiceNo() {
    const today = dayjs().format("DDMMYYYY");

    const sql = `
      SELECT invoice_no
      FROM tx_invoice_item
      WHERE invoice_no LIKE '${today}%'
      ORDER BY invoice_item_id DESC
      LIMIT 1
    `;

    const rows = await customSelectSqlQuery(sql);

    let nextSeq = 1;

    if (rows.length > 0) {
      const lastSeq = parseInt(rows[0].invoice_no.split("/")[1], 10);
      nextSeq = lastSeq + 1;
    }

    return `${today}/${String(nextSeq).padStart(4, "0")}`;
  }

  /* ---------------------------------------------------
     CREATE Invoice
  --------------------------------------------------- */

  // createInvoice = async (req, res) => {
  //   try {
  //     const {
  //       terms_and_condition,
  //       remarks,
  //       bill_to_id,
  //       shift_to_id,
  //       irn,
  //       ack_no,
  //       ack_date,
  //       bill_status = "N",
  //       date,
  //       client_id,
  //       work_progress_id,
  //       create_by,
  //     } = req.body;

  //     // if (!client_id || !work_progress_id) {
  //     //   return res.status(400).json({
  //     //     success: false,
  //     //     message: "client_id and work_progress_id are required",
  //     //   });
  //     // }

  //     const invoice_no = await this.generateInvoiceNo();

  //     const payload = {
  //       invoice_no,
  //       terms_and_condition,
  //       remarks,
  //       bill_to_id,
  //       shift_to_id,
  //       irn,
  //       ack_no,
  //       ack_date,
  //       bill_status,
  //       date: date || dayjs().format("YYYY-MM-DD"),
  //       client_id,
  //       work_progress_id,
  //       create_by,
  //       created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
  //     };

  //     const insertId = await insertData("tx_invoice_item", payload);

  //     res.status(201).json({
  //       success: true,
  //       message: "Invoice created successfully",
  //       data: {
  //         invoice_item_id: insertId,
  //         invoice_no,
  //       },
  //     });

  //   } catch (err) {
  //     console.error("Create Invoice Error:", err);
  //     res.status(500).json({
  //       success: false,
  //       message: "Failed to create invoice",
  //     });
  //   }
  // };




  createInvoice = async (req, res) => {
  try {
    const {
      terms_and_condition,
      remarks,
      bill_to_id,
      shift_to_id,
      irn,
      ack_no,
      ack_date,
      bill_status = "N",
      date,
      client_id,
      work_progress_id,
      create_by,
    } = req.body;

    const invoice_no = await this.generateInvoiceNo();

    const payload = {
      invoice_no,
      terms_and_condition,
      remarks,
      bill_to_id,
      shift_to_id,
      irn,
      ack_no,
      ack_date,
      bill_status,
      date: date || dayjs().format("YYYY-MM-DD"),
      client_id,
      work_progress_id,
      create_by,
      created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
    };

    /* ----------------------------------
     * 1️ Insert invoice (unchanged)
     * ---------------------------------- */
    const insertId = await insertData("tx_invoice_item", payload);

    /* ----------------------------------
     * 2️ Update billing_status in tx_work_progress
     *     (ONLY ADDITION)
     * ---------------------------------- */
    // if (work_progress_id) {
    //   await updateData(
    //     "tx_work_progress",
    //     { billing_status: "Y" },              // ENUM update
    //     "work_progress_site_id = ?",          // WHERE clause
    //     [work_progress_id]
    //   );
    // }



    if (work_progress_id) {
  await updateData(
    "tx_work_progress",
    { billing_status: "Y" },
    `work_progress_site_id = ${Number(work_progress_id)}`
  );
}


    /* ----------------------------------
     * 3 Response (unchanged)
     * ---------------------------------- */
    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: {
        invoice_item_id: insertId,
        invoice_no,
      },
    });

  } catch (err) {
    console.error("Create Invoice Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create invoice",
    });
  }
};



  /* ---------------------------------------------------
     GET Single Invoice
  --------------------------------------------------- */
  getInvoiceById = async (req, res) => {
    try {
      const { invoice_item_id } = req.params;

      const invoice = await selectOneData(
        "tx_invoice_item",
        "*",
        `invoice_item_id = ${invoice_item_id}`
      );

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found",
        });
      }

      res.json({
        success: true,
        data: invoice,
      });

    } catch (err) {
      console.error("Get Invoice Error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch invoice",
      });
    }
  };

  /* ---------------------------------------------------
     GET All Invoices
  --------------------------------------------------- */
  getAllInvoices = async (req, res) => {
    try {
      const invoices = await selectData(
        "tx_invoice_item",
        "*",
        null,
        "invoice_item_id DESC"
      );

      res.json({
        success: true,
        data: invoices,
      });

    } catch (err) {
      console.error("Get All Invoices Error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch invoices",
      });
    }
  };

  /* ---------------------------------------------------
     UPDATE Invoice
  --------------------------------------------------- */
  updateInvoice = async (req, res) => {
    try {
      const { invoice_item_id } = req.params;

      const payload = {
        ...req.body,
        updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
      };

      const affectedRows = await updateData(
        "tx_invoice_item",
        payload,
        `invoice_item_id = ${invoice_item_id}`
      );

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found",
        });
      }

      res.json({
        success: true,
        message: "Invoice updated successfully",
      });

    } catch (err) {
      console.error("Update Invoice Error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to update invoice",
      });
    }
  };

  /* ---------------------------------------------------
     DELETE Invoice
  --------------------------------------------------- */
  deleteInvoice = async (req, res) => {
    try {
      const { invoice_item_id } = req.params;

      const affectedRows = await deleteData(
        "tx_invoice_item",
        `invoice_item_id = ${invoice_item_id}`
      );

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found",
        });
      }

      res.json({
        success: true,
        message: "Invoice deleted successfully",
      });

    } catch (err) {
      console.error("Delete Invoice Error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to delete invoice",
      });
    }
  };




// getBillingDataFullinDetails = async (req, res) => {
//   try {
//     const { project_id, project_site_id } = req.body;

//     if (!project_id || !project_site_id) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id and project_site_id are required"
//       });
//     }
//     /* ===============================
//        1. FETCH BOM DATA
//     =============================== */
//     const bomSql = `
//       SELECT 
//         t.project_estimation_id,
//         t.project_id,
//         p.project_name,
//         t.site_id,
//         s.project_site_name,
//         t.bom_id,
//         t.bom_name,
//         t.rep_task,
//         t.billing_id,
//         b.unit AS bom_unit,

//         billing.project_work_description,
//         billing.unit AS billing_unit,
//         billing.quantity AS billing_quantity,
//         billing.rate AS billing_rate,
//         billing.amount AS billing_amount,
//         billing.remarks AS billing_remarks,

//         bp.bom_progress_id,
//         bp.bom_progress_name,
//         bp.sl_number,

//         bi.bom_item_id,
//         bi.product_id,
//         bi.qty AS per_unit_qty,
//         bi.total_qty,

//         pr.product_name,
//         pr.product_type_id,
//         pr.hsn_code,
//         uom.unit_name AS unit

//       FROM tx_project_details_with_estimation t
//       LEFT JOIN md_project p ON t.project_id = p.project_id
//       LEFT JOIN md_project_site s ON t.site_id = s.project_site_id
//       LEFT JOIN md_project_billing billing ON t.billing_id = billing.billing_id
//       LEFT JOIN md_bom_progress bp ON t.bom_id = bp.bom_id
//       LEFT JOIN md_bom_item bi 
//         ON bp.bom_progress_id = bi.bom_progress_id 
//        AND t.bom_id = bi.bom_id
//       LEFT JOIN md_product pr ON bi.product_id = pr.product_id
//       LEFT JOIN md_unit uom ON pr.unit_id = uom.unit_id
//       LEFT JOIN md_bom b ON t.bom_id = b.bom_id

//       WHERE t.project_id = ${project_id}
//         AND t.site_id = ${project_site_id}

//       ORDER BY t.billing_id, t.bom_id, bp.sl_number, bi.bom_item_id
//     `;

//     const bomRows = await customSelectSqlQuery(bomSql);

//     /* ===============================
//        2. FETCH WORK PROGRESS
//     =============================== */
//     const workSql = `
//       SELECT
//         w.bom_id,
//         w.bom_progress_id,
//         bi.product_id,
//         SUM(w.total_qty_of_material_used) AS total_material_used,
//         SUM(w.total_progress) AS actual_quantity_done

//       FROM tx_work_progress w
//       LEFT JOIN md_bom_item bi 
//         ON bi.bom_id = w.bom_id 
//        AND bi.bom_progress_id = w.bom_progress_id

//       WHERE w.project_id = ${project_id}
//         AND w.project_site_id = ${project_site_id}
//         AND (w.billing_status IS NULL OR w.billing_status != 'Y')

//       GROUP BY w.bom_id, w.bom_progress_id, bi.product_id
//     `;

//     const workRows = await customSelectSqlQuery(workSql);

//     /* ===============================
//        3. CREATE WORK MAP
//     =============================== */
//     const workMap = new Map();

//     workRows.forEach(row => {
//       if (!row.product_id) return;

//       const key = `${row.bom_id}_${row.bom_progress_id}_${row.product_id}`;

//       workMap.set(key, {
//         used: parseFloat(row.total_material_used || 0),
//         done: parseFloat(row.actual_quantity_done || 0)
//       });
//     });

//     /* ===============================
//        4. BUILD FINAL RESPONSE
//        Structure:
//          billing_id (grouped by work_description)
//            └── boms[]
//                  └── progresses[]
//                        └── items[]
//     =============================== */
//     const billingMap = new Map();

//     for (const row of bomRows) {

//       // ── Level 1: Billing Group (same billing_id = same work description) ──
//       if (!billingMap.has(row.billing_id)) {
//         billingMap.set(row.billing_id, {
//           billing_id: row.billing_id,
//           project_id: row.project_id,
//           project_name: row.project_name,
//           site_id: row.site_id,
//           site_name: row.project_site_name,
//           project_work_description: row.project_work_description,
//           billing_unit: row.billing_unit,
//           billing_quantity: row.billing_quantity,
//           billing_rate: row.billing_rate,
//           billing_amount: row.billing_amount,
//           billing_remarks: row.billing_remarks,
//           boms: new Map()
//         });
//       }

//       const billing = billingMap.get(row.billing_id);

//       // ── Level 2: BOM (nested inside billing group) ──
//       if (!billing.boms.has(row.project_estimation_id)) {
//         billing.boms.set(row.project_estimation_id, {
//           project_estimation_id: row.project_estimation_id,
//           bom_id: row.bom_id,
//           bom_name: row.bom_name,
//           bom_unit: row.bom_unit || null, 
//           rep_task: row.rep_task,
//           progresses: new Map()
//         });
//       }

//       const bom = billing.boms.get(row.project_estimation_id);

//       // ── Level 3: Progress (nested inside BOM) ──
//       if (row.bom_progress_id && !bom.progresses.has(row.bom_progress_id)) {
//         bom.progresses.set(row.bom_progress_id, {
//           bom_progress_id: row.bom_progress_id,
//           bom_progress_name: row.bom_progress_name,
//           sl_number: row.sl_number,
//           items: []
//         });
//       }

//       // ── Level 4: Items (nested inside Progress) ──
//       if (row.bom_item_id && row.bom_progress_id) {

//         const totalQty  = parseFloat(row.total_qty || 0);
//         const repTask   = parseFloat(row.rep_task  || 1);
//         const requiredQty = totalQty * repTask;

//         const key      = `${row.bom_id}_${row.bom_progress_id}_${row.product_id}`;
//         const workData = workMap.get(key) || { used: 0, done: 0 };

//         bom.progresses.get(row.bom_progress_id).items.push({
//           bom_item_id: row.bom_item_id,
//           product_id:  row.product_id,
//           qty:         row.per_unit_qty,
//           total_qty:   row.total_qty,
//           total_Material_required_for_all_bom_quantity: requiredQty.toFixed(2),
//           total_material_used_in_site: workData.used.toFixed(2),
//           actual_quantity_done:        workData.done.toFixed(2),
//           product: {
//             product_id:      row.product_id,
//             product_name:    row.product_name,
//             unit:            row.unit || 'Pc',
//             product_type_id: row.product_type_id,
//             hsn_code:        row.hsn_code,
//           }
//         });
//       }
//     }

//     /* ===============================
//        5. CONVERT MAPS → ARRAYS
//     =============================== */
//     const result = [];

//     for (const billing of billingMap.values()) {
//       const bomsArray = [];

//       for (const bom of billing.boms.values()) {
//         bom.progresses = Array.from(bom.progresses.values());
//         bomsArray.push(bom);
//       }

//       billing.boms = bomsArray;
//       result.push(billing);
//     }

//     return res.status(200).json({
//       success: true,
//       data: result
//     });

//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({
//       success: false,
//       message: "Billing generation failed"
//     });
//   }
// };



//------------------------------------------------------------------//





// getBillingDataFullinDetails = async (req, res) => {
//   try {
//     const { project_id, project_site_id } = req.body;

//     if (!project_id || !project_site_id) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id and project_site_id are required"
//       });
//     }

//     /* ===============================
//        1. FETCH BOM DATA
//     =============================== */
//     const bomSql = `
//       SELECT 
//         t.project_estimation_id,
//         t.project_id,
//         p.project_name,
//         t.site_id,
//         s.project_site_name,
//         t.bom_id,
//         t.bom_name,
//         t.rep_task,
//         t.billing_id,
//         t.bom_price,
//         t.bom_unit,
//         t.bom_value_unit,

//         billing.project_work_description,
//         billing.unit AS billing_unit,
//         billing.quantity AS billing_quantity,
//         billing.rate AS billing_rate,
//         billing.amount AS billing_amount,
//         billing.remarks AS billing_remarks,

//         bp.bom_progress_id,
//         bp.bom_progress_name,
//         bp.sl_number,

//         bi.bom_item_id,
//         bi.product_id,
//         bi.qty AS per_unit_qty,
//         bi.total_qty,

//         pr.product_name,
//         pr.product_type_id,
//         pr.hsn_code,
//         uom.unit_name AS unit

//       FROM tx_project_details_with_estimation t
//       LEFT JOIN md_project p ON t.project_id = p.project_id
//       LEFT JOIN md_project_site s ON t.site_id = s.project_site_id
//       LEFT JOIN md_project_billing billing ON t.billing_id = billing.billing_id
//       LEFT JOIN md_bom_progress bp ON t.bom_id = bp.bom_id
//       LEFT JOIN md_bom_item bi 
//         ON bp.bom_progress_id = bi.bom_progress_id 
//        AND t.bom_id = bi.bom_id
//       LEFT JOIN md_product pr ON bi.product_id = pr.product_id
//       LEFT JOIN md_unit uom ON pr.unit_id = uom.unit_id

//       WHERE t.project_id = ${project_id}
//         AND t.site_id = ${project_site_id}

//       ORDER BY t.billing_id, t.bom_id, bp.sl_number, bi.bom_item_id
//     `;

//     const bomRows = await customSelectSqlQuery(bomSql);

//     /* ===============================
//        2. FETCH WORK PROGRESS
//        ✅ FIX: Removed JOIN to md_bom_item since tx_work_progress
//        has no product_id column. Group only by bom_id + bom_progress_id.
//     =============================== */
//     const workSql = `
//       SELECT
//         w.bom_id,
//         w.bom_progress_id,
//         SUM(w.total_qty_of_material_used) AS total_material_used,
//         SUM(w.total_progress)             AS actual_quantity_done

//       FROM tx_work_progress w

//       WHERE w.project_id      = ${project_id}
//         AND w.project_site_id = ${project_site_id}
//         AND (w.billing_status IS NULL OR w.billing_status != 'Y')

//       GROUP BY w.bom_id, w.bom_progress_id
//     `;

//     const workRows = await customSelectSqlQuery(workSql);

//     /* ===============================
//        3. CREATE WORK MAP
//        ✅ FIX: Key is bom_id + bom_progress_id only.
//        No product_id — it does not exist on tx_work_progress.
//        Previously the JOIN was multiplying rows per product causing
//        SUM() to double/triple count the material used.
//     =============================== */
//     const workMap = new Map();

//     workRows.forEach(row => {
//       const key = `${row.bom_id}_${row.bom_progress_id}`;

//       workMap.set(key, {
//         used: parseFloat(row.total_material_used || 0),
//         done: parseFloat(row.actual_quantity_done || 0)
//       });
//     });

//     /* ===============================
//        4. BUILD FINAL RESPONSE
//        Structure:
//          billing_id (grouped by work_description)
//            └── boms[]
//                  └── progresses[]
//                        └── items[]
//     =============================== */
//     const billingMap = new Map();

//     for (const row of bomRows) {

//       // ── Level 1: Billing Group ──
//       if (!billingMap.has(row.billing_id)) {
//         billingMap.set(row.billing_id, {
//           billing_id: row.billing_id,
//           project_id: row.project_id,
//           project_name: row.project_name,
//           site_id: row.site_id,
//           site_name: row.project_site_name,
//           project_work_description: row.project_work_description,
//           billing_unit: row.billing_unit,
//           billing_quantity: row.billing_quantity,
//           billing_rate: row.billing_rate,
//           billing_amount: row.billing_amount,
//           billing_remarks: row.billing_remarks,
//           boms: new Map()
//         });
//       }

//       const billing = billingMap.get(row.billing_id);

//       // ── Level 2: BOM ──
//       if (!billing.boms.has(row.project_estimation_id)) {
//         billing.boms.set(row.project_estimation_id, {
//           project_estimation_id: row.project_estimation_id,
//           bom_id: row.bom_id,
//           bom_name: row.bom_name,
//           rep_task: row.rep_task,
//           bom_price: row.bom_price,
//           bom_unit: row.bom_unit || null,
//           bom_value_unit: row.bom_value_unit,
//           progresses: new Map()
//         });
//       }

//       const bom = billing.boms.get(row.project_estimation_id);

//       // ── Level 3: Progress ──
//       if (row.bom_progress_id && !bom.progresses.has(row.bom_progress_id)) {
//         bom.progresses.set(row.bom_progress_id, {
//           bom_progress_id: row.bom_progress_id,
//           bom_progress_name: row.bom_progress_name,
//           sl_number: row.sl_number,
//           items: []
//         });
//       }

//       // ── Level 4: Items ──
//       if (row.bom_item_id && row.bom_progress_id) {

//         const totalQty    = parseFloat(row.total_qty || 0);
//         const repTask     = parseFloat(row.rep_task  || 1);
//         const requiredQty = totalQty * repTask;

//         // ✅ FIX: Key uses only bom_id + bom_progress_id (no product_id)
//         // All items under the same progress step share the same
//         // work progress data since tx_work_progress tracks per step,
//         // not per individual material/product.
//         const key      = `${row.bom_id}_${row.bom_progress_id}`;
//         const workData = workMap.get(key) || { used: 0, done: 0 };

//         bom.progresses.get(row.bom_progress_id).items.push({
//           bom_item_id: row.bom_item_id,
//           product_id:  row.product_id,
//           qty:         row.per_unit_qty,
//           total_qty:   row.total_qty,
//           total_Material_required_for_bom_quantity: requiredQty.toFixed(2),
//           total_material_used_in_site: workData.used.toFixed(2),  // ✅ now correct
//           actual_quantity_done:        workData.done.toFixed(2),  // ✅ now correct
//           product: {
//             product_id:      row.product_id,
//             product_name:    row.product_name,
//             unit:            row.unit || 'Pc',
//             product_type_id: row.product_type_id,
//             hsn_code:        row.hsn_code,
//           }
//         });
//       }
//     }

//     /* ===============================
//        5. CONVERT MAPS → ARRAYS
//     =============================== */
//     const result = [];

//     for (const billing of billingMap.values()) {
//       const bomsArray = [];

//       for (const bom of billing.boms.values()) {
//         bom.progresses = Array.from(bom.progresses.values());
//         bomsArray.push(bom);
//       }

//       billing.boms = bomsArray;
//       result.push(billing);
//     }

//     return res.status(200).json({
//       success: true,
//       data: result
//     });

//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({
//       success: false,
//       message: "Billing generation failed"
//     });
//   }
// };





//  getBillingDataFullinDetails = async (req, res) => {
//   try {
//     const project_id = parseInt(req.body.project_id, 10);
//     const project_site_id = parseInt(req.body.project_site_id, 10);

//     if (!project_id || !project_site_id || isNaN(project_id) || isNaN(project_site_id)) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id and project_site_id are required and must be valid integers"
//       });
//     }

//     const bomSql = `
//       SELECT
//         t.project_estimation_id,
//         t.project_id,
//         p.project_name,
//         t.site_id,
//         s.project_site_name,
//         t.bom_id,
//         t.bom_name,
//         t.rep_task,
//         t.billing_id,
//         t.bom_price,
//         t.bom_unit,
//         t.bom_value_unit,

//         billing.project_work_description,
//         billing.unit AS billing_unit,
//         billing.quantity AS billing_quantity,
//         billing.rate AS billing_rate,
//         billing.amount AS billing_amount,
//         billing.remarks AS billing_remarks,

//         bp.bom_progress_id,
//         bp.bom_progress_name,
//         bp.sl_number,

//         bi.bom_item_id,
//         bi.product_id,
//         bi.qty AS per_unit_qty,
//         bi.total_qty,

//         pr.product_name,
//         pr.product_type_id,
//         pr.hsn_code,
//         uom.unit_name AS unit

//       FROM tx_project_details_with_estimation t
//       LEFT JOIN md_project p
//         ON t.project_id = p.project_id
//       LEFT JOIN md_project_site s
//         ON t.site_id = s.project_site_id
//       LEFT JOIN md_project_billing billing
//         ON t.billing_id = billing.billing_id
//       LEFT JOIN md_bom_progress bp
//         ON t.bom_id = bp.bom_id
//       LEFT JOIN md_bom_item bi
//         ON bp.bom_progress_id = bi.bom_progress_id
//        AND t.bom_id = bi.bom_id
//       LEFT JOIN md_product pr
//         ON bi.product_id = pr.product_id
//       LEFT JOIN md_unit uom
//         ON pr.unit_id = uom.unit_id
//       WHERE t.project_id = ?
//         AND t.site_id = ?
//       ORDER BY t.billing_id, t.bom_id, bp.sl_number, bi.bom_item_id
//     `;

//     /*
//       Updated logic:
//       - Join tx_work_progress -> tx_site_used_items by work_progress_site_id
//       - Filter same project + site
//       - Sum only Act_Qty
//       - Restrict only product_id = 8
//       - Group at bom + progress + product level
//     */
//     const materialSql = `
//       SELECT
//         w.bom_id,
//         w.bom_progress_id,
//         si.product_id,
//         SUM(COALESCE(si.Act_Qty, 0)) AS total_material_used
//       FROM tx_work_progress w
//       INNER JOIN tx_site_used_items si
//         ON si.work_progress_site_id = w.work_progress_site_id
//       WHERE w.project_id = ?
//         AND w.project_site_id = ?
//         AND si.product_id = 8
//       GROUP BY
//         w.bom_id,
//         w.bom_progress_id,
//         si.product_id
//     `;

//     const [bomRows, materialRows] = await Promise.all([
//       customSelectSqlQuery2(bomSql, [project_id, project_site_id]),
//       customSelectSqlQuery2(materialSql, [project_id, project_site_id])
//     ]);

//     if (!bomRows || bomRows.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: "No billing data found for this project and site",
//         data: []
//       });
//     }

//     const workMap = new Map();

//     if (materialRows && materialRows.length > 0) {
//       for (const row of materialRows) {
//         if (!row.bom_id || !row.bom_progress_id || !row.product_id) continue;

//         const key = `${row.bom_id}_${row.bom_progress_id}_${row.product_id}`;
//         workMap.set(key, parseFloat(row.total_material_used || 0));
//       }
//     }

//     const billingMap = new Map();

//     for (const row of bomRows) {
//       if (!billingMap.has(row.billing_id)) {
//         billingMap.set(row.billing_id, {
//           billing_id: row.billing_id,
//           project_id: row.project_id,
//           project_name: row.project_name,
//           site_id: row.site_id,
//           site_name: row.project_site_name,
//           project_work_description: row.project_work_description,
//           billing_unit: row.billing_unit,
//           billing_quantity: row.billing_quantity,
//           billing_rate: row.billing_rate,
//           billing_amount: row.billing_amount,
//           billing_remarks: row.billing_remarks,
//           boms: new Map()
//         });
//       }

//       const billing = billingMap.get(row.billing_id);

//       if (!billing.boms.has(row.project_estimation_id)) {
//         billing.boms.set(row.project_estimation_id, {
//           project_estimation_id: row.project_estimation_id,
//           bom_id: row.bom_id,
//           bom_name: row.bom_name,
//           rep_task: row.rep_task,
//           bom_price: row.bom_price,
//           bom_unit: row.bom_unit || null,
//           bom_value_unit: row.bom_value_unit,
//           progresses: new Map()
//         });
//       }

//       const bom = billing.boms.get(row.project_estimation_id);

//       if (row.bom_progress_id && !bom.progresses.has(row.bom_progress_id)) {
//         bom.progresses.set(row.bom_progress_id, {
//           bom_progress_id: row.bom_progress_id,
//           bom_progress_name: row.bom_progress_name,
//           sl_number: row.sl_number,
//           items: []
//         });
//       }

//       if (!row.bom_item_id || !row.bom_progress_id) continue;

//       const totalQty = parseFloat(row.total_qty || 0);
//       const repTask = parseFloat(row.rep_task || 1);
//       const requiredQty = totalQty * repTask;

//       const key = `${row.bom_id}_${row.bom_progress_id}_${row.product_id}`;
//       const used = workMap.get(key) || 0;

//       bom.progresses.get(row.bom_progress_id).items.push({
//         bom_item_id: row.bom_item_id,
//         product_id: row.product_id,
//         qty: row.per_unit_qty,
//         total_qty: row.total_qty,
//         total_Material_required_for_bom_quantity: requiredQty.toFixed(2),
//         total_material_used_in_site: used.toFixed(2),
//         product: {
//           product_id: row.product_id,
//           product_name: row.product_name,
//           unit: row.unit || "Pc",
//           product_type_id: row.product_type_id,
//           hsn_code: row.hsn_code
//         }
//       });
//     }

//     const result = [];

//     for (const billing of billingMap.values()) {
//       const bomsArray = [];

//       for (const bom of billing.boms.values()) {
//         bom.progresses = Array.from(bom.progresses.values());
//         bomsArray.push(bom);
//       }

//       billing.boms = bomsArray;
//       result.push(billing);
//     }

//     return res.status(200).json({
//       success: true,
//       data: result
//     });

//   } catch (err) {
//     console.error("[getBillingDataFullinDetails] ERROR:", {
//       message: err.message,
//       stack: err.stack,
//       body: req.body
//     });

//     return res.status(500).json({
//       success: false,
//       message: "Billing data fetch failed. Please try again."
//     });
//   }
// };



getBillingDataFullinDetails = async (req, res) => {
  try {
    const project_id = parseInt(req.body.project_id, 10);
    const project_site_id = parseInt(req.body.project_site_id, 10);

    if (!project_id || !project_site_id || isNaN(project_id) || isNaN(project_site_id)) {
      return res.status(400).json({
        success: false,
        message: "project_id and project_site_id are required and must be valid integers"
      });
    }

    const bomSql = `
      SELECT
        t.project_estimation_id,
        t.project_id,
        p.project_name,
        t.site_id,
        s.project_site_name,
        t.bom_id,
        t.bom_name,
        t.rep_task,
        t.billing_id,
        t.bom_price,
        t.bom_unit,
        t.bom_value_unit,
        billing.project_work_description,
        billing.unit AS billing_unit,
        billing.quantity AS billing_quantity,
        billing.rate AS billing_rate,
        billing.amount AS billing_amount,
        billing.remarks AS billing_remarks,
        bp.bom_progress_id,
        bp.bom_progress_name,
        bp.sl_number,
        bi.bom_item_id,
        bi.product_id,
        bi.qty AS per_unit_qty,
        bi.total_qty,
        pr.product_name,
        pr.product_type_id,
        pr.hsn_code,
        uom.unit_name AS unit
      FROM tx_project_details_with_estimation t
      LEFT JOIN md_project p
        ON t.project_id = p.project_id
      LEFT JOIN md_project_site s
        ON t.site_id = s.project_site_id
      LEFT JOIN md_project_billing billing
        ON t.billing_id = billing.billing_id
      LEFT JOIN md_bom_progress bp
        ON t.bom_id = bp.bom_id
      LEFT JOIN md_bom_item bi
        ON bp.bom_progress_id = bi.bom_progress_id
       AND t.bom_id = bi.bom_id
      LEFT JOIN md_product pr
        ON bi.product_id = pr.product_id
      LEFT JOIN md_unit uom
        ON pr.unit_id = uom.unit_id
      WHERE t.project_id = ?
        AND t.site_id = ?
      ORDER BY t.billing_id, t.bom_id, bp.sl_number, bi.bom_item_id
    `;

    const materialSql = `
      SELECT
        w.bom_id,
        w.bom_progress_id,
        si.product_id,
        SUM(COALESCE(si.Act_Qty, 0)) AS total_material_used
      FROM tx_work_progress w
      INNER JOIN tx_site_used_items si
        ON si.work_progress_site_id = w.work_progress_site_id
      WHERE w.project_id = ?
        AND w.project_site_id = ?
      GROUP BY
        w.bom_id,
        w.bom_progress_id,
        si.product_id
    `;

    const [bomRows, materialRows] = await Promise.all([
      customSelectSqlQuery2(bomSql, [project_id, project_site_id]),
      customSelectSqlQuery2(materialSql, [project_id, project_site_id])
    ]);

    if (!bomRows || bomRows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No billing data found for this project and site",
        data: []
      });
    }

    const workMap = new Map();
    for (const row of materialRows || []) {
      if (!row.bom_id || !row.bom_progress_id || !row.product_id) continue;
      const key = `${row.bom_id}_${row.bom_progress_id}_${row.product_id}`;
      workMap.set(key, parseFloat(row.total_material_used || 0));
    }

    const billingMap = new Map();

    for (const row of bomRows) {
      if (!billingMap.has(row.billing_id)) {
        billingMap.set(row.billing_id, {
          billing_id: row.billing_id,
          project_id: row.project_id,
          project_name: row.project_name,
          site_id: row.site_id,
          site_name: row.project_site_name,
          project_work_description: row.project_work_description,
          billing_unit: row.billing_unit,
          billing_quantity: row.billing_quantity,
          billing_rate: row.billing_rate,
          billing_amount: row.billing_amount,
          billing_remarks: row.billing_remarks,
          boms: new Map()
        });
      }

      const billing = billingMap.get(row.billing_id);

      if (!billing.boms.has(row.project_estimation_id)) {
        billing.boms.set(row.project_estimation_id, {
          project_estimation_id: row.project_estimation_id,
          bom_id: row.bom_id,
          bom_name: row.bom_name,
          rep_task: row.rep_task,
          bom_price: row.bom_price,
          bom_unit: row.bom_unit || null,
          bom_value_unit: row.bom_value_unit,
          progresses: new Map()
        });
      }

      const bom = billing.boms.get(row.project_estimation_id);

      if (row.bom_progress_id && !bom.progresses.has(row.bom_progress_id)) {
        bom.progresses.set(row.bom_progress_id, {
          bom_progress_id: row.bom_progress_id,
          bom_progress_name: row.bom_progress_name,
          sl_number: row.sl_number,
          items: []
        });
      }

      if (!row.bom_item_id || !row.bom_progress_id) continue;

      const totalQty = parseFloat(row.total_qty || 0);
      const repTask = parseFloat(row.rep_task || 1);
      const requiredQty = totalQty * repTask;

      const key = `${row.bom_id}_${row.bom_progress_id}_${row.product_id}`;
      const used = workMap.get(key) || 0;

      bom.progresses.get(row.bom_progress_id).items.push({
        bom_item_id: row.bom_item_id,
        product_id: row.product_id,
        qty: row.per_unit_qty,
        total_qty: row.total_qty,
        total_Material_required_for_bom_quantity: requiredQty.toFixed(2),
        total_material_used_in_site: used.toFixed(2),
        product: {
          product_id: row.product_id,
          product_name: row.product_name,
          unit: row.unit || "Pc",
          product_type_id: row.product_type_id,
          hsn_code: row.hsn_code
        }
      });
    }

    const result = [];
    for (const billing of billingMap.values()) {
      const bomsArray = [];
      for (const bom of billing.boms.values()) {
        bom.progresses = Array.from(bom.progresses.values());
        bomsArray.push(bom);
      }
      billing.boms = bomsArray;
      result.push(billing);
    }

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error("[getBillingDataFullinDetails] ERROR:", {
      message: err.message,
      stack: err.stack,
      body: req.body
    });

    return res.status(500).json({
      success: false,
      message: "Billing data fetch failed. Please try again."
    });
  }
};




getBillableBoms = async (req, res) => {
  try {
    const { project_id, project_site_id } = req.body;

    if (!project_id || !project_site_id) {
      return res.status(400).json({
        success: false,
        message: "project_id and project_site_id are required"
      });
    }

    /* ===============================
       1. TOTAL BOM COUNT
    =============================== */
    const totalBomSql = `
      SELECT 
  t.billing_id,
  COUNT(DISTINCT t.bom_id) AS completed_boms
  FROM tx_project_details_with_estimation t
  WHERE t.project_id = ${project_id}
  AND t.site_id = ${project_site_id}
  AND t.bom_id IN (

    SELECT bp.bom_id
    FROM md_bom_progress bp

    LEFT JOIN (
      SELECT DISTINCT bom_id, bom_progress_id
      FROM tx_work_progress
      WHERE project_id = ${project_id}
        AND project_site_id = ${project_site_id}
    ) wp 
    ON bp.bom_id = wp.bom_id 
    AND bp.bom_progress_id = wp.bom_progress_id

    GROUP BY bp.bom_id
    HAVING COUNT(bp.bom_progress_id) = COUNT(wp.bom_progress_id)

  )
   GROUP BY t.billing_id
    `;

    const totalBoms = await customSelectSqlQuery(totalBomSql);

    /* ===============================
       2. COMPLETED BOM COUNT
    =============================== */
    const completedBomSql = `
      SELECT 
        t.billing_id,
        COUNT(b.bom_id) AS completed_boms
      FROM tx_project_details_with_estimation t
      JOIN md_bom b ON t.bom_id = b.bom_id
      WHERE t.project_id = ${project_id}
        AND t.site_id = ${project_site_id}
        AND b.is_completed = 1
      GROUP BY t.billing_id
    `;

    const completedBoms = await customSelectSqlQuery(completedBomSql);

    /* ===============================
       3. BILLING MASTER DATA
    =============================== */
    const billingSql = `
      SELECT 
        billing_id,
        project_work_description,
        unit,
        quantity,
        rate,
        amount
      FROM md_project_billing
      WHERE project_id = ${project_id}
    `;

    const billingRows = await customSelectSqlQuery(billingSql);

    /* ===============================
       4. MAP DATA
    =============================== */
    const totalMap = new Map();
    const completedMap = new Map();

    totalBoms.forEach(row => {
      totalMap.set(row.billing_id, parseFloat(row.total_boms));
    });

    completedBoms.forEach(row => {
      completedMap.set(row.billing_id, parseFloat(row.completed_boms));
    });

    /* ===============================
       5. FINAL CALCULATION
    =============================== */
    const result = billingRows.map(row => {

      const total_boms = totalMap.get(row.billing_id) || 0;
      const completed_boms = completedMap.get(row.billing_id) || 0;

      const billing_qty = parseFloat(row.quantity || 0);
      const rate = parseFloat(row.rate || 0);

      const per_bom_qty = total_boms > 0 ? billing_qty / total_boms : 0;
      const billable_qty = completed_boms * per_bom_qty;
      const billable_amount = billable_qty * rate;

      return {
        billing_id: row.billing_id,
        project_work_description: row.project_work_description,
        unit: row.unit,
        total_boms,
        completed_boms,
        per_bom_qty: per_bom_qty.toFixed(2),
        billable_qty: billable_qty.toFixed(2),
        rate,
        billable_amount: billable_amount.toFixed(2)
      };
    });

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error("Billing API Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate billing"
    });
  }
};


}

module.exports = new BillingController();
