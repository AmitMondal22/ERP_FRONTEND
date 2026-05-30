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
  // getAllInvoices = async (req, res) => {
  //   try {
  //     const invoices = await selectData(
  //       "tx_invoice_item",
  //       "*",
  //       null,
  //       "invoice_item_id DESC"
  //     );

  //     res.json({
  //       success: true,
  //       data: invoices,
  //     });

  //   } catch (err) {
  //     console.error("Get All Invoices Error:", err);
  //     res.status(500).json({
  //       success: false,
  //       message: "Failed to fetch invoices",
  //     });
  //   }
  // };



 getAllInvoices = async (req, res) => {
  try {
    const query = `
      SELECT 
        wbo.*,   -- ✅ this gives ALL columns from work_billing_order

        p.project_name,
        ps.project_site_name,

        c.client_name,
        c.client_mobile,
        c.client_email,
        c.client_address

      FROM work_billing_order wbo

      LEFT JOIN md_project p 
        ON wbo.project_id = p.project_id

      LEFT JOIN md_project_site ps 
        ON wbo.project_site_id = ps.project_site_id

      LEFT JOIN md_client c 
        ON p.client_id = c.client_id

      ORDER BY wbo.created_at DESC
    `;

    const data = await customSelectSqlQuery(query);

    res.json({
      success: true,
      total: data.length,
      data: data
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch work billing orders",
      error: error.message
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

///////////////////////////////////////////////////////

 

// getBillingDataFullinDetails = async (req, res) => {
//   try {
//     const project_id = parseInt(req.body.project_id, 10);
//     const project_site_id = parseInt(req.body.project_site_id, 10);

//     if (!project_id || !project_site_id || isNaN(project_id) || isNaN(project_site_id)) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id and project_site_id are required and must be valid integers"
//       });
//     }

//     /* ---------------- BOM DATA ---------------- */
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
//       WHERE t.project_id = ?
//         AND t.site_id = ?
//       ORDER BY t.billing_id, t.bom_id, bp.sl_number, bi.bom_item_id
//     `;

//     /* ---------------- 🔥 MATERIAL USED (ONLY PENDING DPR) ---------------- */
//     const materialSql = `
//       SELECT
//         w.work_progress_site_id,
//         w.bom_id,
//         w.bom_progress_id,
//         si.product_id,
//         SUM(COALESCE(si.Act_Qty, 0)) AS total_material_used
//       FROM tx_work_progress w
//       INNER JOIN tx_site_used_items si
//         ON si.work_progress_site_id = w.work_progress_site_id
//       WHERE w.project_id = ?
//         AND w.project_site_id = ?
//         AND w.billing_status = 'PENDING'
//       GROUP BY
//         w.work_progress_site_id,
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
//         message: "No billing data found",
//         data: []
//       });
//     }

//     /* ---------------- 🔥 BUILD WORK MAP (MULTIPLE DPR SUPPORT) ---------------- */
//     const workMap = new Map();

//     for (const row of materialRows || []) {
//       if (!row.bom_id || !row.bom_progress_id || !row.product_id) continue;

//       const key = `${row.bom_id}_${row.bom_progress_id}_${row.product_id}`;

//       if (!workMap.has(key)) {
//         workMap.set(key, []);
//       }

//       workMap.get(key).push({
//         work_progress_site_id: row.work_progress_site_id,
//         used: parseFloat(row.total_material_used || 0)
//       });
//     }

//     /* ---------------- BUILD FINAL STRUCTURE ---------------- */
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
//       const workEntries = workMap.get(key) || [];

//       const totalUsed = workEntries.reduce((sum, w) => sum + w.used, 0);

//       const work_progress_site_ids = workEntries.map(w => w.work_progress_site_id);

//       const consumption_details = workEntries.map(w => ({
//         work_progress_site_id: w.work_progress_site_id,
//         used_qty: w.used
//       }));

//       bom.progresses.get(row.bom_progress_id).items.push({
//         bom_item_id: row.bom_item_id,
//         product_id: row.product_id,
//         qty: row.per_unit_qty,
//         total_qty: row.total_qty,

//         total_Material_required_for_bom_quantity: requiredQty.toFixed(2),

//         total_material_used_in_site: totalUsed.toFixed(2),

//         work_progress_site_ids,        // ✅ MULTIPLE DPR IDs
//         consumption_details,           // ✅ BEST FOR BILLING UI

//         product: {
//           product_id: row.product_id,
//           product_name: row.product_name,
//           unit: row.unit || "Pc",
//           product_type_id: row.product_type_id,
//           hsn_code: row.hsn_code
//         }
//       });
//     }

//     /* ---------------- FINAL FORMAT ---------------- */
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
//     console.error("[getBillingDataFullinDetails] ERROR:", err);

//     return res.status(500).json({
//       success: false,
//       message: "Billing data fetch failed"
//     });
//   }
// };

getBillingDataFullinDetails = async (req, res) => {
  try {
    const project_id = parseInt(req.body.project_id, 10);
    const project_site_id = req.body.project_site_id
      ? parseInt(req.body.project_site_id, 10)
      : null;

    /* ---------------- VALIDATION ---------------- */
    if (!project_id || isNaN(project_id)) {
      return res.status(400).json({
        success: false,
        message: "project_id is required and must be a valid integer"
      });
    }

    if (project_site_id !== null && isNaN(project_site_id)) {
      return res.status(400).json({
        success: false,
        message: "project_site_id must be a valid integer"
      });
    }

    /* ---------------- BOM DATA ---------------- */
    // const bomSql = `
    //   SELECT
    //     t.project_estimation_id,
    //     t.project_id,
    //     p.project_name,
    //     t.site_id,
    //     s.project_site_name,
    //     t.bom_id,
    //     t.bom_name,
    //     t.rep_task,
    //     t.billing_id,
    //     t.bom_price,
    //     t.bom_unit,
    //     t.bom_value_unit,
    //     billing.project_work_description,
    //     billing.unit AS billing_unit,
    //     billing.quantity AS billing_quantity,
    //     billing.rate AS billing_rate,
    //     billing.amount AS billing_amount,
    //     billing.remarks AS billing_remarks,
    //     bp.bom_progress_id,
    //     bp.bom_progress_name,
    //     bp.sl_number,
    //     bi.bom_item_id,
    //     bi.product_id,
    //     bi.qty AS per_unit_qty,
    //     bi.total_qty,
    //     pr.product_name,
    //     pr.product_type_id,
    //     pr.hsn_code,
    //     uom.unit_name AS unit
    //   FROM tx_project_details_with_estimation t
    //   LEFT JOIN md_project p ON t.project_id = p.project_id
    //   LEFT JOIN md_project_site s ON t.site_id = s.project_site_id
    //   LEFT JOIN md_project_billing billing ON t.billing_id = billing.billing_id
    //   LEFT JOIN md_bom_progress bp ON t.bom_id = bp.bom_id
    //   LEFT JOIN md_bom_item bi 
    //     ON bp.bom_progress_id = bi.bom_progress_id
    //    AND t.bom_id = bi.bom_id
    //   LEFT JOIN md_product pr ON bi.product_id = pr.product_id
    //   LEFT JOIN md_unit uom ON pr.unit_id = uom.unit_id
    //   WHERE t.project_id = ?
    //     AND (? IS NULL OR t.site_id = ?)
    //   ORDER BY t.billing_id, t.bom_id, bp.sl_number, bi.bom_item_id
    // `;


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
    billing.gst_type AS gst_type,
    billing.sgst_percent AS sgst_percent,
    billing.cgst_percent AS cgst_percent,
    billing.igst_percent AS igst_percent,
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
  LEFT JOIN md_project p ON t.project_id = p.project_id
  LEFT JOIN md_project_site s ON t.site_id = s.project_site_id
  LEFT JOIN md_project_billing billing ON t.billing_id = billing.billing_id
  LEFT JOIN md_bom_progress bp ON t.bom_id = bp.bom_id
  LEFT JOIN md_bom_item bi 
    ON bp.bom_progress_id = bi.bom_progress_id
   AND t.bom_id = bi.bom_id
  LEFT JOIN md_product pr ON bi.product_id = pr.product_id
  LEFT JOIN md_unit uom ON pr.unit_id = uom.unit_id
  WHERE t.project_id = ?
    AND (? IS NULL OR t.site_id = ?)
  ORDER BY t.billing_id, t.bom_id, bp.sl_number, bi.bom_item_id
`;


    /* ---------------- MATERIAL USED ---------------- */
    const materialSql = `
      SELECT
        w.work_progress_site_id,
        w.bom_id,
        w.bom_progress_id,
        si.product_id,
        SUM(COALESCE(si.Act_Qty, 0)) AS total_material_used
      FROM tx_work_progress w
      INNER JOIN tx_site_used_items si
        ON si.work_progress_site_id = w.work_progress_site_id
      WHERE w.project_id = ?
        AND (? IS NULL OR w.project_site_id = ?)
        AND w.billing_status = 'PENDING'
      GROUP BY
        w.work_progress_site_id,
        w.bom_id,
        w.bom_progress_id,
        si.product_id
    `;

    /* ---------------- PARAMS ---------------- */
    const bomParams =
      project_site_id !== null
        ? [project_id, project_site_id, project_site_id]
        : [project_id, null, null];

    const materialParams =
      project_site_id !== null
        ? [project_id, project_site_id, project_site_id]
        : [project_id, null, null];

    const [bomRows, materialRows] = await Promise.all([
      customSelectSqlQuery2(bomSql, bomParams),
      customSelectSqlQuery2(materialSql, materialParams)
    ]);

    if (!bomRows || bomRows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No billing data found",
        data: []
      });
    }

    /* ---------------- WORK MAP ---------------- */
    const workMap = new Map();

    for (const row of materialRows || []) {
      if (!row.bom_id || !row.bom_progress_id || !row.product_id) continue;

      const key = `${row.bom_id}_${row.bom_progress_id}_${row.product_id}`;

      if (!workMap.has(key)) {
        workMap.set(key, []);
      }

      workMap.get(key).push({
        work_progress_site_id: row.work_progress_site_id,
        used: parseFloat(row.total_material_used || 0)
      });
    }

    /* ---------------- BUILD FINAL STRUCTURE ---------------- */
    const billingMap = new Map();

    for (const row of bomRows) {

      if (!billingMap.has(row.billing_id)) {
        billingMap.set(row.billing_id, {
          // billing_id: row.billing_id,
          // project_id: row.project_id,
          // project_name: row.project_name,
          // site_id: row.site_id,
          // site_name: row.project_site_name,
          // project_work_description: row.project_work_description,
          // billing_unit: row.billing_unit,
          // billing_quantity: row.billing_quantity,
          // billing_rate: row.billing_rate,
          // billing_amount: row.billing_amount,
          // billing_remarks: row.billing_remarks,
          // boms: new Map()


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
  gst_type: row.gst_type,
  sgst_percent: row.sgst_percent,
  cgst_percent: row.cgst_percent,
  igst_percent: row.igst_percent,
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
      const workEntries = workMap.get(key) || [];

      const totalUsed = workEntries.reduce((sum, w) => sum + w.used, 0);

      const work_progress_site_ids = workEntries.map(w => w.work_progress_site_id);

      const consumption_details = workEntries.map(w => ({
        work_progress_site_id: w.work_progress_site_id,
        used_qty: w.used
      }));

      bom.progresses.get(row.bom_progress_id).items.push({
        bom_item_id: row.bom_item_id,
        product_id: row.product_id,
        qty: row.per_unit_qty,
        total_qty: row.total_qty,

        total_Material_required_for_bom_quantity: requiredQty.toFixed(2),

        total_material_used_in_site: totalUsed.toFixed(2),

        work_progress_site_ids,
        consumption_details,

        product: {
          product_id: row.product_id,
          product_name: row.product_name,
          unit: row.unit || "Pc",
          product_type_id: row.product_type_id,
          hsn_code: row.hsn_code
        }
      });
    }

    /* ---------------- FINAL FORMAT ---------------- */
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
    console.error("[getBillingDataFullinDetails] ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Billing data fetch failed"
    });
  }
};

///////////////////////////////////////////////////////////////////////////////


// updateWorkProgressBillingStatus = async (req, res) => {
//   try {
//     const { work_progress_site_id, project_id } = req.body;

//     // 1. Validation
//     if (!work_progress_site_id) {
//       return res.status(400).json({
//         success: false,
//         message: "work_progress_site_id is required",
//       });
//     }

//     if (!project_id) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id is required",
//       });
//     }

//     // 2. Payload
//     const payload = {
//       billing_status: "BILLED",
//       updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
//     };

//     // 3. Condition (NO IN, just direct match)
//     const condition = `
//       work_progress_site_id = ${Number(work_progress_site_id)} 
//       AND project_id = ${Number(project_id)}
//     `;

//     // 4. Update
//     const affectedRows = await updateData(
//       "tx_work_progress",
//       payload,
//       condition
//     );

//     // 5. Response
//     res.status(200).json({
//       success: true,
//       message: `Successfully marked ${affectedRows} record as BILLED`,
//       data: {
//         updated_count: affectedRows,
//       },
//     });

//   } catch (err) {
//     console.error("Update Billing Status Error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update work progress status",
//     });
//   }
// };

updateWorkProgressBillingStatus = async (req, res) => {
  try {
    const { work_progress_site_ids, project_id } = req.body;

    if (!Array.isArray(work_progress_site_ids) || work_progress_site_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "work_progress_site_ids must be a non-empty array",
      });
    }

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "project_id is required",
      });
    }

    const payload = {
      billing_status: "BILLED",
      updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
    };

    // ✅ Build IN clause
    const ids = work_progress_site_ids.map(id => Number(id)).join(",");

    const condition = `
      work_progress_site_id IN (${ids})
      AND project_id = ${Number(project_id)}
    `;

    const affectedRows = await updateData(
      "tx_work_progress",
      payload,
      condition
    );

    res.status(200).json({
      success: true,
      message: `Successfully marked ${affectedRows} records as BILLED`,
      data: { updated_count: affectedRows },
    });

  } catch (err) {
    console.error("Update Billing Status Error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to update work progress status",
    });
  }
};


}

module.exports = new BillingController();
