const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const {
  insertData,
  batchInsertData,
  selectData,
  selectOneData,
  selectLastData,
  updateData,
  deleteData,
  countRows,
  customSelectSqlQuery2,
} = require("../models/MasterModel");

class WorkBillingController {
// ─────────────────────────────────────────────────────────────────
//  HELPER: generate invoice_no = WO-YYYY-MM-DD/N
//
//  Uses MAX(sequence) — safe against deletions, gaps, and retries.
//  countRows() was WRONG: if /2 was deleted, count=1 → tries /2 again → DUPLICATE.
//  MAX(seq) always moves forward: if /2 was deleted, max=3 → next = 4. Safe.
// ─────────────────────────────────────────────────────────────────
// #generateInvoiceNo = async (date) => {
//   const dateStr = dayjs(date).format("YYYY-MM-DD");

//   const rows = await customSelectSqlQuery2(
//     `SELECT COALESCE(
//        MAX(CAST(SUBSTRING_INDEX(invoice_no, '/', -1) AS UNSIGNED)),
//        0
//      ) AS max_seq
//      FROM work_billing_order
//      WHERE invoice_date = ?`,
//     [dateStr],
//     true
//   );

//   const maxSeq  = parseInt(rows[0]?.max_seq ?? 0, 10) || 0;
//   const nextSeq = maxSeq + 1;

//   return `WO-${dateStr}/${nextSeq}`;
// };

// ─────────────────────────────────────────────────────────────────
//  HELPER: generate invoice_no = WO-YYYY-MM-DD/N
//
//  Uses MAX(sequence) — safe against deletions, gaps, and retries.
//  countRows() was WRONG: if /2 was deleted, count=1 → tries /2 again → DUPLICATE.
//  MAX(seq) always moves forward: if /2 was deleted, max=3 → next = 4. Safe.
// ─────────────────────────────────────────────────────────────────
#generateInvoiceNo = async (date) => {
  const dateStr = dayjs(date).format("YYYY-MM-DD");

  const rows = await customSelectSqlQuery2(
    `SELECT COALESCE(
       MAX(CAST(SUBSTRING_INDEX(invoice_no, '/', -1) AS UNSIGNED)),
       0
     ) AS max_seq
     FROM work_billing_order
     WHERE invoice_date = ?`,
    [dateStr],
    true
  );

  const maxSeq  = parseInt(rows[0]?.max_seq ?? 0, 10) || 0;
  const nextSeq = maxSeq + 1;

  return `WO-${dateStr}/${nextSeq}`;
};

  // ─────────────────────────────────────────────
  //  CREATE  POST /work-billing
  //  Body: { project_id, project_site_id, work_description,
  //          billing_unit, billing_qty, billing_rate, billing_amount,
  //          boms_completed_count, billing_status, invoice_date, remarks,
  //          material_details: [...] }
  // ─────────────────────────────────────────────


// createWorkBilling = async (req, res) => {
//   try {
//     const {
//       project_id,
//       project_site_id,
//       work_description,
//       billing_unit,
//       billing_qty,
//       billing_rate,
//       billing_amount,
//       boms_completed_count = 0,
//       billing_status = "pending",
//       invoice_date,
//       remarks,
//       bomUnitOfLength,
//       material_details,
//       cgst_amt = 0,
//       sgst_amt = 0,
//       igst_amt = 0,
//     } = req.body;

//     // ── Validate top-level fields ──────────────────────────────────────
//     if (
//       !project_id ||
//       !project_site_id ||
//       !work_description ||
//       !billing_unit ||
//       billing_qty == null ||
//       billing_rate == null ||
//       billing_amount == null ||
//       !invoice_date
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Required fields missing",
//       });
//     }

//     if (!Array.isArray(material_details) || material_details.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "material_details array is required and must not be empty",
//       });
//     }

//     //  Block if BOM completed count is less than 1
//     if (Number(boms_completed_count) < 1) {
//       return res.status(400).json({
//         success: false,
//         message: `Cannot create billing — BOM completed count is ${boms_completed_count}, which is less than 1.`,
//       });
//     }

//     // ── Parse bomUnitOfLength ──────────────────────────────────────────
//     const parsedBomUnitOfLength =
//       bomUnitOfLength != null && bomUnitOfLength !== ""
//         ? parseFloat(bomUnitOfLength)
//         : null;

//     if (parsedBomUnitOfLength !== null && isNaN(parsedBomUnitOfLength)) {
//       return res.status(400).json({
//         success: false,
//         message: "bomUnitOfLength must be a valid number",
//       });
//     }

//     // ── Calculate this_bill_quantity & this_bill_amount ────────────────
//     const bomsCompleted      = parseFloat(boms_completed_count);
//     const unitOfLength       = parsedBomUnitOfLength ?? 1;
//     const this_bill_quantity = bomsCompleted * unitOfLength;
//     const this_bill_amount   = this_bill_quantity * parseFloat(billing_rate);

//     // ── Fetch previous cumulative totals ───────────────────────────────
//     // Must match on project_id + project_site_id + work_description
//     const prevRows = await customSelectSqlQuery2(
//       `SELECT 
//          COALESCE(SUM(this_bill_quantity), 0) AS prev_qty,
//          COALESCE(SUM(this_bill_amount),   0) AS prev_amt
//        FROM work_billing_order
//        WHERE project_id       = ?
//          AND project_site_id  = ?
//          AND work_description = ?`,
//       [Number(project_id), Number(project_site_id), work_description],
//       true
//     );

//     const previous_quantity   = parseFloat(prevRows[0]?.prev_qty ?? 0);
//     const previous_amount     = parseFloat(prevRows[0]?.prev_amt ?? 0);
//     const cumulative_quantity = previous_quantity + this_bill_quantity;
//     const cumulative_amount   = previous_amount   + this_bill_amount;

//     // ── Generate invoice_no & insert work_billing_order ───────────────
//     const invoice_no  = await this.#generateInvoiceNo(invoice_date);
//     const now         = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
//     const created_by  = req.user?.id || null;

//     const work_billing_order_id = await insertData("work_billing_order", {
//       invoice_no,
//       project_id:           Number(project_id),
//       project_site_id:      Number(project_site_id),
//       work_description,
//       billing_unit,
//       billing_qty:          parseFloat(billing_qty),
//       billing_rate:         parseFloat(billing_rate),
//       billing_amount:       parseFloat(billing_amount),
//       boms_completed_count: bomsCompleted,
//       billing_status,
//       invoice_date,
//       // ── running-total columns ──
//       previous_quantity,
//       this_bill_quantity,
//       cumulative_quantity,
//       previous_amount,
//       this_bill_amount,
//       cumulative_amount,
//       cgst_amt:  parseFloat(cgst_amt  || 0),
//       sgst_amt:  parseFloat(sgst_amt  || 0),
//       igst_amt:  parseFloat(igst_amt  || 0),
//       remarks:   remarks || null,
//       created_by,
//       created_at: now,
//       updated_at: now,
//     });

//     if (!work_billing_order_id) {
//       throw new Error("Failed to create billing order");
//     }

//     // ── Validate required fields per detail row ───────────────────────
//     const requiredDetailFields = [
//       "bom_id", "bom_unit", "bom_qty", "bom_price", "bom_amount",
//       "progress_step_name", "step_sl_number", "product_id",
//       "product_name", "hsn_code", "unit", "qty_per_bom", "required_qty",
//     ];

//     for (let i = 0; i < material_details.length; i++) {
//       const row     = material_details[i];
//       const missing = requiredDetailFields.filter(
//         (f) => row[f] == null || row[f] === ""
//       );
//       if (missing.length > 0) {
//         return res.status(400).json({
//           success: false,
//           message: `material_details[${i}] is missing: ${missing.join(", ")}`,
//         });
//       }
//     }

//     // ── Build & insert detail rows ────────────────────────────────────
//     const detailCols =
//       "work_billing_order_id, work_progress_site_id, bom_id, bomUnitOfLength, " +
//       "bom_unit, bom_qty, bom_price, bom_amount, progress_step_name, step_sl_number, " +
//       "product_id, product_name, hsn_code, unit, qty_per_bom, required_qty, " +
//       "used_qty, created_at, updated_at";

//     const detailRows = material_details.map((d) => {
//       const rowBomUnitOfLength =
//         d.bomUnitOfLength != null && d.bomUnitOfLength !== ""
//           ? parseFloat(d.bomUnitOfLength)
//           : parsedBomUnitOfLength;

//       return {
//         work_billing_order_id,
//         work_progress_site_id:
//           d.work_progress_site_id != null
//             ? Number(d.work_progress_site_id)
//             : null,
//         bom_id:             d.bom_id,
//         bomUnitOfLength:
//           rowBomUnitOfLength !== null && !isNaN(rowBomUnitOfLength)
//             ? rowBomUnitOfLength
//             : null,
//         bom_unit:           d.bom_unit,
//         bom_qty:            parseFloat(d.bom_qty),
//         bom_price:          parseFloat(d.bom_price),
//         bom_amount:         parseFloat(d.bom_amount),
//         progress_step_name: d.progress_step_name,
//         step_sl_number:     parseFloat(d.step_sl_number),
//         product_id:         Number(d.product_id),
//         product_name:       d.product_name,
//         hsn_code:           d.hsn_code,
//         unit:               d.unit,
//         qty_per_bom:        parseFloat(d.qty_per_bom),
//         required_qty:       parseFloat(d.required_qty),
//         used_qty:           parseFloat(d.used_qty || 0),
//         created_at:         now,
//         updated_at:         now,
//       };
//     });

//     await batchInsertData("billing_material_detail", detailCols, detailRows);

//     return res.status(201).json({
//       success: true,
//       message: "Work billing order created successfully",
//       data: {
//         work_billing_order_id,
//         invoice_no,
//         previous_quantity,
//         this_bill_quantity,
//         cumulative_quantity,
//         previous_amount,
//         this_bill_amount,
//         cumulative_amount,
//       },
//     });

//   } catch (error) {
//     console.error("ERROR in createWorkBilling:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Unable to create work billing order",
//       error: error.message,
//     });
//   }
// };

createWorkBilling = async (req, res) => {
  try {
    const {
      project_id,
      project_site_id,
      work_description,
      billing_unit,
      billing_qty,
      billing_rate,
      billing_amount,
      boms_completed_count = 0,
      billing_status = "pending",
      invoice_date,
      remarks,
      bomUnitOfLength,
      material_details,
      cgst_amt = 0,
      sgst_amt = 0,
      igst_amt = 0,
    } = req.body;

    // ════════════════════════════════════════════════════════════════
    // STEP 1 — Validate top-level required fields
    // ════════════════════════════════════════════════════════════════
    const missingTopFields = [];
    if (!project_id)         missingTopFields.push("project_id");
    if (!project_site_id)    missingTopFields.push("project_site_id");
    if (!work_description)   missingTopFields.push("work_description");
    if (!billing_unit)       missingTopFields.push("billing_unit");
    if (billing_qty   == null) missingTopFields.push("billing_qty");
    if (billing_rate  == null) missingTopFields.push("billing_rate");
    if (billing_amount == null) missingTopFields.push("billing_amount");
    if (!invoice_date) missingTopFields.push("invoice_date");

    if (missingTopFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Required fields missing: ${missingTopFields.join(", ")}`,
      });
    }

    // ════════════════════════════════════════════════════════════════
    // STEP 2 — Validate material_details array
    // ════════════════════════════════════════════════════════════════
    if (!Array.isArray(material_details) || material_details.length === 0) {
      return res.status(400).json({
        success: false,
        message: "material_details must be a non-empty array",
      });
    }

    // ════════════════════════════════════════════════════════════════
    // STEP 3 — Validate boms_completed_count >= 1
    // ════════════════════════════════════════════════════════════════
    const bomsCompleted = parseFloat(boms_completed_count);

    if (isNaN(bomsCompleted) || bomsCompleted < 1) {
      return res.status(400).json({
        success: false,
        message: `Cannot create billing — boms_completed_count is "${boms_completed_count}", must be a number >= 1.`,
      });
    }

    // ════════════════════════════════════════════════════════════════
    // STEP 4 — Sanitise bomUnitOfLength
    //   It is a STRING LABEL ("km", "m", "ft") — NOT a numeric multiplier.
    //   Stored in billing_material_detail only (no column in work_billing_order).
    // ════════════════════════════════════════════════════════════════
    const parsedBomUnitOfLength =
      bomUnitOfLength != null && String(bomUnitOfLength).trim() !== ""
        ? String(bomUnitOfLength).trim()
        : null;

    // ════════════════════════════════════════════════════════════════
    // STEP 5 — De-duplicate material_details
    //   Root cause of double inserts:
    //   Frontend loops boms → progresses → items → consumption_details,
    //   so the same (bom_id + site_id + product_id + step) can appear
    //   multiple times when several progress steps share consumptions.
    //   We keep the FIRST occurrence; later duplicates are dropped.
    // ════════════════════════════════════════════════════════════════
    const seenKeys = new Set();
    const dedupedDetails = [];

    for (const d of material_details) {
      const key = [
        d.bom_id        ?? "?",
        d.work_progress_site_id ?? "null",
        d.product_id    ?? "?",
        d.progress_step_name ?? "?",
        d.step_sl_number ?? "?",
      ].join("__");

      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        dedupedDetails.push(d);
      }
    }

    console.log(
      `[createWorkBilling] material_details received=${material_details.length}, after dedup=${dedupedDetails.length}`
    );

    // ════════════════════════════════════════════════════════════════
    // STEP 6 — Validate required fields per detail row
    //   Done BEFORE any DB writes so we fail fast cleanly.
    // ════════════════════════════════════════════════════════════════
    const requiredDetailFields = [
      "bom_id", "bom_unit", "bom_qty", "bom_price", "bom_amount",
      "progress_step_name", "step_sl_number", "product_id",
      "product_name", "hsn_code", "unit", "qty_per_bom", "required_qty",
    ];

    for (let i = 0; i < dedupedDetails.length; i++) {
      const row = dedupedDetails[i];
      const missing = requiredDetailFields.filter(
        (f) => row[f] == null || String(row[f]).trim() === ""
      );
      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          message: `material_details[${i}] is missing required field(s): ${missing.join(", ")}`,
        });
      }
    }

    // ════════════════════════════════════════════════════════════════
    // STEP 7 — Calculate this_bill_quantity & this_bill_amount
    //
    //   bomUnitOfLength is now a LABEL ("km", "m") — NOT a multiplier.
    //   The multiplier is always 1 (we count BOMs completed directly).
    //
    //   this_bill_quantity = bomsCompleted            (e.g. 2)
    //   this_bill_amount   = bomsCompleted × bom_price_per_unit
    //
    //   bom_price is taken from the first deduped detail row.
    //   All rows under the same BOM share the same bom_price.
    //   Guard: if bom_price is missing/NaN fall back to 0 with a warning.
    // ════════════════════════════════════════════════════════════════
    const rawBomPrice = parseFloat(dedupedDetails[0]?.bom_price);
    const bomPricePerUnit = isNaN(rawBomPrice) ? 0 : rawBomPrice;

    if (bomPricePerUnit === 0) {
      console.warn(
        `[createWorkBilling] bom_price is 0 or missing on first detail row — this_bill_amount will be 0`
      );
    }

    const this_bill_quantity = bomsCompleted;                   // e.g. 2
    const this_bill_amount   = bomsCompleted * bomPricePerUnit; // e.g. 2 × 4000 = 8000

    // ════════════════════════════════════════════════════════════════
    // STEP 8 — Fetch previous cumulative totals
    //   Matches on project_id + project_site_id + work_description.
    //   COALESCE ensures 0 when no prior rows exist (first billing).
    //
    //   1st billing:  previous = 0,     cumulative = this
    //   2nd billing:  previous = this1, cumulative = this1 + this2
    // ════════════════════════════════════════════════════════════════
    let previous_quantity = 0;
    let previous_amount   = 0;

    try {
      const prevRows = await customSelectSqlQuery2(
        `SELECT
           COALESCE(SUM(this_bill_quantity), 0) AS prev_qty,
           COALESCE(SUM(this_bill_amount),   0) AS prev_amt
         FROM work_billing_order
         WHERE project_id       = ?
           AND project_site_id  = ?
           AND work_description = ?`,
        [Number(project_id), Number(project_site_id), work_description],
        true
      );

      previous_quantity = parseFloat(prevRows[0]?.prev_qty ?? 0) || 0;
      previous_amount   = parseFloat(prevRows[0]?.prev_amt ?? 0) || 0;
    } catch (queryErr) {
      // Non-fatal — log and continue with 0 (first-bill assumption)
      console.error("[createWorkBilling] Failed to fetch previous totals:", queryErr.message);
    }

    const cumulative_quantity = previous_quantity + this_bill_quantity;
    const cumulative_amount   = previous_amount   + this_bill_amount;

    // ════════════════════════════════════════════════════════════════
    // STEP 9 — Generate invoice_no & timestamps
    // ════════════════════════════════════════════════════════════════
    // const invoice_no = await this.#generateInvoiceNo(invoice_date);
    // const now        = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
    // const created_by = req.user?.id || null;

    const now        = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
const created_by = req.user?.id || null;

let work_billing_order_id = null;
let invoice_no            = null;
let lastInsertError       = null;

for (let attempt = 1; attempt <= 5; attempt++) {
  try {
    // Re-read MAX on every attempt so we always get a fresh sequence number
    invoice_no = await this.#generateInvoiceNo(invoice_date);

    console.log(`[createWorkBilling] Attempting insert with invoice_no="${invoice_no}" (attempt ${attempt})`);

    work_billing_order_id = await insertData("work_billing_order", {
      invoice_no,
      project_id:           Number(project_id),
      project_site_id:      Number(project_site_id),
      work_description,
      billing_unit,
      billing_qty:          parseFloat(billing_qty)    || 0,
      billing_rate:         parseFloat(billing_rate)   || 0,
      billing_amount:       parseFloat(billing_amount) || 0,
      boms_completed_count: bomsCompleted,
      billing_status,
      invoice_date,
      previous_quantity,
      this_bill_quantity,
      cumulative_quantity,
      previous_amount,
      this_bill_amount,
      cumulative_amount,
      cgst_amt:  parseFloat(cgst_amt)  || 0,
      sgst_amt:  parseFloat(sgst_amt)  || 0,
      igst_amt:  parseFloat(igst_amt)  || 0,
      remarks:   remarks?.trim() || null,
      created_by,
      created_at: now,
      updated_at: now,
    });

    // ✅ Insert succeeded — exit the retry loop
    lastInsertError = null;
    break;

  } catch (insertErr) {
    // Only retry on invoice_no duplicate — all other errors rethrow immediately
    const isDuplicateInvoice =
      insertErr?.code === "ER_DUP_ENTRY" &&
      insertErr?.message?.includes("invoice_no");

    if (isDuplicateInvoice) {
      console.warn(
        `[createWorkBilling] invoice_no collision on "${invoice_no}", attempt=${attempt}. Retrying...`
      );
      lastInsertError = insertErr;
      continue; // re-read MAX and try again
    }

    // Any other DB error (wrong column, constraint, etc.) — fail immediately
    throw insertErr;
  }
}

// If all 5 attempts failed (extremely unlikely — means 5 concurrent requests hit same second)
if (!work_billing_order_id) {
  throw lastInsertError ?? new Error(
    `[createWorkBilling] Failed to insert work_billing_order after 5 attempts — invoice_no collision unresolvable`
  );
}

    // ════════════════════════════════════════════════════════════════
    // STEP 10 — Insert work_billing_order row
    //   NOTE: bomUnitOfLength is NOT a column here —
    //         it lives only in billing_material_detail.
    // ════════════════════════════════════════════════════════════════
    // const work_billing_order_id = await insertData("work_billing_order", {
    //   invoice_no,
    //   project_id:           Number(project_id),
    //   project_site_id:      Number(project_site_id),
    //   work_description,
    //   billing_unit,
    //   billing_qty:          parseFloat(billing_qty)    || 0,
    //   billing_rate:         parseFloat(billing_rate)   || 0,
    //   billing_amount:       parseFloat(billing_amount) || 0,
    //   boms_completed_count: bomsCompleted,
    //   billing_status,
    //   invoice_date,
    //   // ── running-total columns ───────────────────────────
    //   previous_quantity,    // SUM of all past this_bill_quantity (0 on first bill)
    //   this_bill_quantity,   // bomsCompleted (e.g. 2)
    //   cumulative_quantity,  // previous + this  (e.g. 0 + 2 = 2)
    //   previous_amount,      // SUM of all past this_bill_amount (0 on first bill)
    //   this_bill_amount,     // bomsCompleted × bom_price (e.g. 2 × 4000 = 8000)
    //   cumulative_amount,    // previous_amount + this_bill_amount (e.g. 0 + 8000 = 8000)
    //   cgst_amt:  parseFloat(cgst_amt)  || 0,
    //   sgst_amt:  parseFloat(sgst_amt)  || 0,
    //   igst_amt:  parseFloat(igst_amt)  || 0,
    //   remarks:   remarks?.trim() || null,
    //   created_by,
    //   created_at: now,
    //   updated_at: now,
    // });

    // if (!work_billing_order_id) {
    //   throw new Error("insertData returned falsy for work_billing_order — check DB constraints");
    // }

    // ════════════════════════════════════════════════════════════════
    // STEP 11 — Build de-duplicated detail rows
    // ════════════════════════════════════════════════════════════════
    const detailCols =
      "work_billing_order_id, work_progress_site_id, bom_id, bomUnitOfLength, " +
      "bom_unit, bom_qty, bom_price, bom_amount, progress_step_name, step_sl_number, " +
      "product_id, product_name, hsn_code, unit, qty_per_bom, required_qty, " +
      "used_qty, created_at, updated_at";

    const detailRows = dedupedDetails.map((d) => {
      // Per-row label: prefer the row's own value, fall back to top-level label
      const rowBomUnitOfLength =
        d.bomUnitOfLength != null && String(d.bomUnitOfLength).trim() !== ""
          ? String(d.bomUnitOfLength).trim()
          : parsedBomUnitOfLength;

      return {
        work_billing_order_id,
        work_progress_site_id:
          d.work_progress_site_id != null ? Number(d.work_progress_site_id) : null,
        bom_id:             d.bom_id,
        bomUnitOfLength:    rowBomUnitOfLength || null,  // VARCHAR label "km", "m", etc.
        bom_unit:           d.bom_unit,
        bom_qty:            parseFloat(d.bom_qty)    || 0,
        bom_price:          parseFloat(d.bom_price)  || 0,
        bom_amount:         parseFloat(d.bom_amount) || 0,
        progress_step_name: d.progress_step_name,
        step_sl_number:     parseFloat(d.step_sl_number) || 0,
        product_id:         Number(d.product_id),
        product_name:       d.product_name,
        hsn_code:           String(d.hsn_code ?? ""),
        unit:               d.unit,
        qty_per_bom:        parseFloat(d.qty_per_bom)   || 0,
        required_qty:       parseFloat(d.required_qty)  || 0,
        used_qty:           parseFloat(d.used_qty)      || 0,
        created_at:         now,
        updated_at:         now,
      };
    });

    // ════════════════════════════════════════════════════════════════
    // STEP 12 — Batch insert detail rows
    // ════════════════════════════════════════════════════════════════
    await batchInsertData("billing_material_detail", detailCols, detailRows);

    console.log(
      `[createWorkBilling] SUCCESS — order_id=${work_billing_order_id}, invoice=${invoice_no}, ` +
      `this_bill_qty=${this_bill_quantity}, this_bill_amt=${this_bill_amount}, ` +
      `prev_qty=${previous_quantity}, cumulative_qty=${cumulative_quantity}, ` +
      `prev_amt=${previous_amount}, cumulative_amt=${cumulative_amount}, ` +
      `detail_rows_inserted=${detailRows.length}`
    );

    // ════════════════════════════════════════════════════════════════
    // STEP 13 — Respond
    // ════════════════════════════════════════════════════════════════
    return res.status(201).json({
      success: true,
      message: "Work billing order created successfully",
      data: {
        work_billing_order_id,
        invoice_no,
        previous_quantity,
        this_bill_quantity,
        cumulative_quantity,
        previous_amount,
        this_bill_amount,
        cumulative_amount,
        detail_rows_inserted: detailRows.length,
      },
    });

  } catch (error) {
    console.error("[createWorkBilling] UNHANDLED ERROR:", error.message, error.stack);
    return res.status(500).json({
      success: false,
      message: "Unable to create work billing order",
      error: error.message,
    });
  }
};



  // ─────────────────────────────────────────────
  //  GET ALL   GET /work-billing
  //  Optional query: ?project_id=&project_site_id=&billing_status=
  // ─────────────────────────────────────────────
  getAll = async (req, res) => {
    try {
      const { project_id, project_site_id, billing_status } = req.query;

      const conditions = [];
      if (project_id)      conditions.push(`wbo.project_id = ${project_id}`);
      if (project_site_id) conditions.push(`wbo.project_site_id = ${project_site_id}`);
      if (billing_status)  conditions.push(`wbo.billing_status = '${billing_status}'`);

      const condition = conditions.length ? conditions.join(" AND ") : null;

      const table = `
        work_billing_order AS wbo
        JOIN md_project AS p      ON wbo.project_id = p.project_id
        JOIN md_project_site AS ps ON wbo.project_site_id = ps.project_site_id
      `;

      const select = `
        wbo.*,
        p.project_name,
        ps.project_site_name
      `;

      const orders = await selectData(table, select, condition, "wbo.work_billing_order_id DESC");

      if (!orders || orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No billing orders found",
        });
      }

      return res.status(200).json({
        success: true,
        data: orders,
      });

    } catch (error) {
      console.error("Error in WorkBilling.getAll:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to fetch billing orders",
        error: error.message,
      });
    }
  };


  // ─────────────────────────────────────────────
  //  GET BY ID   GET /work-billing/:id
  //  Returns parent + all child detail rows
  // ─────────────────────────────────────────────
  getById = async (req, res) => {
    try {
      const { id } = req.params;

      const table = `
        work_billing_order AS wbo
        JOIN md_project AS p       ON wbo.project_id = p.project_id
        JOIN md_project_site AS ps ON wbo.project_site_id = ps.project_site_id
      `;

      const select = `
        wbo.*,
        p.project_name,
        ps.project_site_name
      `;

      const billing = await selectOneData(
        table,
        select,
        `wbo.work_billing_order_id = ${id}`
      );

      if (!billing) {
        return res.status(404).json({
          success: false,
          message: "Billing order not found",
        });
      }

      // Fetch child detail rows — single query, no loops
      const details = await selectData(
        "billing_material_detail",
        "*",
        `work_billing_order_id = ${id}`,
        "step_sl_number ASC"
      );

      return res.status(200).json({
        success: true,
        data: {
          ...billing,
          material_details: details || [],
        },
      });

    } catch (error) {
      console.error("Error in WorkBilling.getById:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to fetch billing order",
        error: error.message,
      });
    }
  };


  // ─────────────────────────────────────────────
  //  GET HISTORY BY INVOICE_NO   GET /work-billing/history/:invoice_no
  //  Returns all versions of the same invoice_no (original + updates)
  // ─────────────────────────────────────────────
  getHistoryByInvoiceNo = async (req, res) => {
    try {
      const { invoice_no } = req.params;

      const sql = `
        SELECT
          wbo.*,
          p.project_name,
          ps.project_site_name
        FROM work_billing_order wbo
        JOIN md_project AS p       ON wbo.project_id = p.project_id
        JOIN md_project_site AS ps ON wbo.project_site_id = ps.project_site_id
        WHERE wbo.invoice_no = ?
        ORDER BY wbo.work_billing_order_id ASC
      `;

      const versions = await customSelectSqlQuery2(sql, [invoice_no], true);

      if (!versions || versions.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No records found for this invoice_no",
        });
      }

      return res.status(200).json({
        success: true,
        invoice_no,
        total_versions: versions.length,
        data: versions,
      });

    } catch (error) {
      console.error("Error in WorkBilling.getHistoryByInvoiceNo:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to fetch invoice history",
        error: error.message,
      });
    }
  };


  // ─────────────────────────────────────────────
  //  UPDATE   PUT /work-billing/:id
  //
  //  Strategy (versioning / append):
  //   1. Fetch the existing row
  //   2. Keep existing row untouched (historical record stays)
  //   3. Insert a NEW row with:
  //        - same invoice_no  (links versions together)
  //        - updated field values
  //        - previous_billing_amount = old billing_amount
  //        - parent_billing_id       = original id (audit trail)
  //   4. Insert fresh material_details for the new version
  // ─────────────────────────────────────────────
  update = async (req, res) => {
    try {
      const { id } = req.params;

      // ── Fetch existing record ──
      const existing = await selectOneData(
        "work_billing_order",
        "*",
        `work_billing_order_id = ${id}`
      );

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Billing order not found",
        });
      }

      const {
        work_description,
        billing_unit,
        billing_qty,
        billing_rate,
        billing_amount,
        boms_completed_count,
        billing_status,
        invoice_date,
        remarks,
        material_details,
      } = req.body;

      if (!Array.isArray(material_details) || material_details.length === 0) {
        return res.status(400).json({
          success: false,
          message: "material_details array is required for update (versioning creates a new row)",
        });
      }

      const now        = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
      const created_by = req.user?.id || null;

      // ── Merge: use incoming value if provided, else keep existing ──
      const newParentRow = {
        invoice_no:              existing.invoice_no,          // same invoice_no = links versions
        project_id:              existing.project_id,          // project never changes on update
        project_site_id:         existing.project_site_id,
        work_description:        work_description        ?? existing.work_description,
        billing_unit:            billing_unit            ?? existing.billing_unit,
        billing_qty:             billing_qty             ?? existing.billing_qty,
        billing_rate:            billing_rate            ?? existing.billing_rate,
        billing_amount:          billing_amount          ?? existing.billing_amount,
        previous_billing_amount: existing.billing_amount,      // snapshot of old amount
        boms_completed_count:    boms_completed_count    ?? existing.boms_completed_count,
        billing_status:          billing_status          ?? existing.billing_status,
        invoice_date:            invoice_date            ?? existing.invoice_date,
        remarks:                 remarks                 ?? existing.remarks,
        parent_billing_id:       existing.parent_billing_id ?? existing.work_billing_order_id,
        created_by,
        created_at:              now,
        updated_at:              now,
      };

      // ── Insert new version of the parent ──
      const new_work_billing_order_id = await insertData("work_billing_order", newParentRow);
      if (!new_work_billing_order_id) throw new Error("Failed to insert updated billing version");

      // ── Validate detail rows ──
      const requiredDetailFields = [
        "bom_name", "bom_unit", "bom_qty", "bom_price", "bom_amount",
        "progress_step_name", "step_sl_number",
        "product_id", "product_name", "hsn_code", "unit",
        "qty_per_bom", "required_qty", "used_qty",
      ];

      for (let i = 0; i < material_details.length; i++) {
        const row = material_details[i];
        const missing = requiredDetailFields.filter(
          (f) => row[f] == null || row[f] === ""
        );
        if (missing.length > 0) {
          return res.status(400).json({
            success: false,
            message: `material_details[${i}] is missing: ${missing.join(", ")}`,
          });
        }
      }

      // ── Build and batch insert new detail rows ──
      const detailCols =
        "work_billing_order_id, bom_name, bom_unit, bom_qty, bom_price, bom_amount, " +
        "progress_step_name, step_sl_number, product_id, product_name, hsn_code, unit, " +
        "qty_per_bom, required_qty, used_qty, created_at, updated_at";

      const detailRows = [];
      for (let i = 0; i < material_details.length; i++) {
        const d = material_details[i];
        detailRows.push({
          work_billing_order_id: new_work_billing_order_id,
          bom_name:              d.bom_name,
          bom_unit:              d.bom_unit,
          bom_qty:               d.bom_qty,
          bom_price:             d.bom_price,
          bom_amount:            d.bom_amount,
          progress_step_name:    d.progress_step_name,
          step_sl_number:        d.step_sl_number,
          product_id:            d.product_id,
          product_name:          d.product_name,
          hsn_code:              d.hsn_code,
          unit:                  d.unit,
          qty_per_bom:           d.qty_per_bom,
          required_qty:          d.required_qty,
          used_qty:              d.used_qty,
          created_at:            now,
          updated_at:            now,
        });
      }

      await batchInsertData("billing_material_detail", detailCols, detailRows);

      return res.status(200).json({
        success: true,
        message: "Billing order updated — new version created",
        data: {
          previous_work_billing_order_id: existing.work_billing_order_id,
          new_work_billing_order_id,
          invoice_no: existing.invoice_no,
          previous_billing_amount: existing.billing_amount,
          new_billing_amount: newParentRow.billing_amount,
        },
      });

    } catch (error) {
      console.error("Error in WorkBilling.update:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to update billing order",
        error: error.message,
      });
    }
  };


  // ─────────────────────────────────────────────
  //  UPDATE STATUS ONLY   PATCH /work-billing/:id/status
  //  Lightweight — just flips billing_status, no versioning needed
  // ─────────────────────────────────────────────
  updateStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { billing_status } = req.body;

      const allowed = ["pending", "ongoing", "completed"];
      if (!billing_status || !allowed.includes(billing_status)) {
        return res.status(400).json({
          success: false,
          message: `billing_status must be one of: ${allowed.join(", ")}`,
        });
      }

      const now = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

      const affected = await updateData(
        "work_billing_order",
        { billing_status, updated_at: now },
        `work_billing_order_id = ${id}`
      );

      if (affected === 0) {
        return res.status(404).json({
          success: false,
          message: "Billing order not found or status unchanged",
        });
      }

      return res.status(200).json({
        success: true,
        message: `Billing status updated to '${billing_status}'`,
      });

    } catch (error) {
      console.error("Error in WorkBilling.updateStatus:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to update billing status",
        error: error.message,
      });
    }
  };


  // ─────────────────────────────────────────────
  //  DELETE   DELETE /work-billing/:id
  //  Deletes parent + cascades to detail rows (FK CASCADE)
  // ─────────────────────────────────────────────
  delete = async (req, res) => {
    try {
      const { id } = req.params;

      const existing = await selectOneData(
        "work_billing_order",
        "work_billing_order_id, invoice_no",
        `work_billing_order_id = ${id}`
      );

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Billing order not found",
        });
      }

      // Child rows auto-deleted via ON DELETE CASCADE on FK
      const deleted = await deleteData(
        "work_billing_order",
        `work_billing_order_id = ${id}`
      );

      if (deleted === 0) {
        return res.status(404).json({
          success: false,
          message: "Billing order not found or already deleted",
        });
      }

      return res.status(200).json({
        success: true,
        message: `Billing order ${existing.invoice_no} deleted successfully`,
      });

    } catch (error) {
      console.error("Error in WorkBilling.delete:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to delete billing order",
        error: error.message,
      });
    }
  };


/*----------------------------------------*/


// ─────────────────────────────────────────────
//  GET BY PROJECT ID   POST /work-billing/by-project
//  Body: { project_id }
//  Returns all data from work_billing_order + billing_material_detail
// ─────────────────────────────────────────────




// getAllWorkBillingByProjectId = async (req, res) => {
//   try {
//     const { project_id } = req.body;

//     if (!project_id) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id is required in request body",
//       });
//     }
// // ── Fetch project + site meta ──────────────────────────────────────



// const projectSql =`SELECT
//   cl.client_id,
//   cl.client_name,
//   cl.client_type,
//   cl.client_mobile,
//   cl.client_phone,
//   cl.client_email,
//   cl.client_address,

//   mps.address    AS site_address,
//   mps.from_date  AS site_from_date,
//   mps.to_date    AS site_to_date,
//   mps.project_id AS site_project_id

// FROM md_project AS mp

// LEFT JOIN md_client AS cl
//   ON mp.client_id = cl.client_id

// LEFT JOIN md_project_site AS mps
//   ON mps.project_id = mp.project_id

// WHERE mp.project_id = ?
// LIMIT 1`

// const projectMeta = await customSelectSqlQuery2(projectSql, [project_id], false);

//     // ── Fetch all billing orders with material details + BOQ info ──────
//     const sql = `
//       SELECT
//         wbo.work_billing_order_id,
//         wbo.invoice_no,
//         wbo.project_id,
//         wbo.project_site_id,
//         wbo.work_description,
//         wbo.billing_unit,
//         wbo.billing_qty,
//         wbo.billing_rate,
//         wbo.billing_amount,
//         wbo.boms_completed_count,
//         wbo.billing_status,
//         wbo.invoice_date,
//         wbo.remarks,
//         wbo.created_by,
//         wbo.created_at,
//         wbo.updated_at,

//         wbo.previous_quantity,
//         wbo.this_bill_quantity,
//         wbo.cumulative_quantity,
//         wbo.previous_amount,
//         wbo.this_bill_amount,
//         wbo.cumulative_amount,
//         wbo.cgst_amt,
//         wbo.sgst_amt,
//         wbo.igst_amt,

//         mpb.quantity   AS boq_qty,
//         mpb.rate       AS boq_rate,
//         mpb.amount     AS boq_amount,
//         mpb.hsn_code   AS boq_hsn_code,

//         bmd.billing_material_detail_id,
//         bmd.work_progress_site_id,
//         bmd.bom_id,
//         bmd.bomUnitOfLength     AS detail_bom_unit_of_length,
//         bmd.bom_unit,
//         bmd.bom_qty,
//         bmd.bom_price,
//         bmd.bom_amount          AS detail_bom_amount,
//         bmd.progress_step_name,
//         bmd.step_sl_number,
//         bmd.product_id,
//         bmd.product_name,
//         bmd.hsn_code,
//         bmd.unit,
//         bmd.qty_per_bom,
//         bmd.required_qty,
//         bmd.used_qty

//       FROM work_billing_order AS wbo

//       LEFT JOIN md_project_billing AS mpb
//         ON  mpb.project_id               = wbo.project_id
//         AND mpb.project_work_description = wbo.work_description

//       LEFT JOIN billing_material_detail AS bmd
//         ON bmd.work_billing_order_id = wbo.work_billing_order_id

//       WHERE wbo.project_id = ?
//       ORDER BY
//         wbo.work_description      ASC,
//         wbo.work_billing_order_id ASC,
//         bmd.step_sl_number        ASC
//     `;

//     const rows = await customSelectSqlQuery2(sql, [project_id], true);

//     if (!rows || rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No billing orders found for this project",
//       });
//     }

//     // ── STEP 1: Build orderMap ─────────────────────────────────────────
//     const orderMap   = {};
//     const orderIndex = [];

//     for (let i = 0; i < rows.length; i++) {
//       const row     = rows[i];
//       const orderId = row.work_billing_order_id;

//       if (!orderMap[orderId]) {
//         orderMap[orderId] = {
//           work_billing_order_id: orderId,
//           invoice_no:            row.invoice_no,
//           project_id:            row.project_id,
//           project_site_id:       row.project_site_id,
//           work_description:      row.work_description,
//           billing_unit:          row.billing_unit,
//           billing_qty:           parseFloat(row.billing_qty        || 0),
//           billing_rate:          parseFloat(row.billing_rate       || 0),
//           billing_amount:        parseFloat(row.billing_amount     || 0),
//           boms_completed_count:  parseFloat(row.boms_completed_count || 0),
//           billing_status:        row.billing_status,
//           invoice_date:          row.invoice_date,
//           remarks:               row.remarks || "",

//           previous_quantity:   parseFloat(row.previous_quantity   || 0),
//           this_bill_quantity:  parseFloat(row.this_bill_quantity   || 0),
//           cumulative_quantity: parseFloat(row.cumulative_quantity  || 0),
//           previous_amount:     parseFloat(row.previous_amount     || 0),
//           this_bill_amount:    parseFloat(row.this_bill_amount     || 0),
//           cumulative_amount:   parseFloat(row.cumulative_amount    || 0),

//           cgst_amt: parseFloat(row.cgst_amt || 0),
//           sgst_amt: parseFloat(row.sgst_amt || 0),
//           igst_amt: parseFloat(row.igst_amt || 0),

//           boq_qty:    parseFloat(row.boq_qty    || 0),
//           boq_rate:   parseFloat(row.boq_rate   || 0),
//           boq_amount: parseFloat(row.boq_amount || 0),
//           boq_hsn:    row.boq_hsn_code || "",

//           created_by: row.created_by,
//           created_at: row.created_at,
//           updated_at: row.updated_at,

//           material_details: [],
//         };
//         orderIndex.push(orderId);
//       }

//       if (row.billing_material_detail_id) {
//         orderMap[orderId].material_details.push({
//           billing_material_detail_id: row.billing_material_detail_id,
//           work_progress_site_id:      row.work_progress_site_id,
//           bom_id:                     row.bom_id,
//           bom_unit_of_length:         parseFloat(row.detail_bom_unit_of_length || 0),
//           bom_unit:                   row.bom_unit,
//           bom_qty:                    parseFloat(row.bom_qty           || 0),
//           bom_price:                  parseFloat(row.bom_price         || 0),
//           bom_amount:                 parseFloat(row.detail_bom_amount || 0),
//           progress_step_name:         row.progress_step_name,
//           step_sl_number:             row.step_sl_number,
//           product_id:                 row.product_id,
//           product_name:               row.product_name,
//           hsn_code:                   row.hsn_code,
//           unit:                       row.unit,
//           qty_per_bom:                parseFloat(row.qty_per_bom  || 0),
//           required_qty:               parseFloat(row.required_qty || 0),
//           used_qty:                   parseFloat(row.used_qty     || 0),
//         });
//       }
//     }

//     // ── STEP 2: Group by work_description ─────────────────────────────
//     const descMap   = {};
//     const descOrder = [];

//     for (let i = 0; i < orderIndex.length; i++) {
//       const order = orderMap[orderIndex[i]];
//       const desc  = order.work_description;

//       if (!descMap[desc]) {
//         descMap[desc] = {
//           work_description: desc,
//           billing_unit:     order.billing_unit,
//           billing_rate:     order.billing_rate,
//           boq_qty:          order.boq_qty,
//           boq_rate:         order.boq_rate,
//           boq_amount:       order.boq_amount,
//           boq_hsn:          order.boq_hsn,

//           previous_quantity:   0,
//           this_bill_quantity:  0,
//           cumulative_quantity: 0,
//           previous_amount:     0,
//           this_bill_amount:    0,
//           cumulative_amount:   0,

//           bills: [],
//         };
//         descOrder.push(desc);
//       }

//       descMap[desc].bills.push(order);
//       // ✅ Track latest invoice per work_description


// // if (
// //   !descMap[desc].latest_invoice_date ||
// //   new Date(order.invoice_date) > new Date(descMap[desc].latest_invoice_date)
// // ) {
// //   descMap[desc].latest_invoice_date = order.invoice_date;
// //   descMap[desc].latest_invoice_no = order.invoice_no;
// // }



// // Track latest invoice using MAX ID (correct way)
// if (
//   !descMap[desc].latest_order_id ||
//   order.work_billing_order_id > descMap[desc].latest_order_id
// ) {
//   descMap[desc].latest_order_id = order.work_billing_order_id;
//   descMap[desc].latest_invoice_no = order.invoice_no;
// }


//     }

//     // ── STEP 3: Set group-level totals from latest bill ────────────────
//     for (let i = 0; i < descOrder.length; i++) {
//       const group      = descMap[descOrder[i]];
//       const latestBill = group.bills[group.bills.length - 1];

//       group.previous_quantity   = parseFloat(latestBill.previous_quantity   || 0);
//       group.this_bill_quantity  = parseFloat(latestBill.this_bill_quantity   || 0);
//       group.cumulative_quantity = parseFloat(latestBill.cumulative_quantity  || 0);
//       group.previous_amount     = parseFloat(latestBill.previous_amount     || 0);
//       group.this_bill_amount    = parseFloat(latestBill.this_bill_amount     || 0);
//       group.cumulative_amount   = parseFloat(latestBill.cumulative_amount    || 0);
//     }

//     // ── STEP 4: Build bill_details block ──────────────────────────────
//     // ── STEP 4: Build bill_details block ──────────────────────────────
// const bill_details = {
//   invoice_no:     projectMeta?.invoiceNo,
//   client_id:       projectMeta?.client_id || "N/A",
//   client_name:     projectMeta?.client_name || "N/A",
//   client_type:     projectMeta?.client_type || "N/A",
//   client_mobile:   projectMeta?.client_mobile || "N/A",
//   client_phone:    projectMeta?.client_phone || "N/A",
//   client_email:    projectMeta?.client_email || "N/A",
//   client_address:  projectMeta?.client_address || "N/A",

//   date:              projectMeta?.site_from_date || "N/A",
//   place_of_delivery: projectMeta?.site_address   || "N/A",
//   to_date:           projectMeta?.site_to_date   || "N/A",
//   project_id:        projectMeta?.site_project_id || "N/A",
// };

//     // ── STEP 5: Build final response ──────────────────────────────────
//     const result = [];
//     for (let i = 0; i < descOrder.length; i++) {
//       const group = descMap[descOrder[i]];
//       result.push({
//         work_description:    group.work_description,
//         invoice_no: group.latest_invoice_no || "N/A",
//         billing_unit:        group.billing_unit,
//         billing_rate:        group.billing_rate,
//         boq_qty:             group.boq_qty,
//         boq_rate:            group.boq_rate,
//         boq_amount:          group.boq_amount,
//         boq_hsn:             group.boq_hsn,
//         previous_quantity:   group.previous_quantity,
//         this_bill_quantity:  group.this_bill_quantity,
//         cumulative_quantity: group.cumulative_quantity,
//         previous_amount:     group.previous_amount,
//         this_bill_amount:    group.this_bill_amount,
//         cumulative_amount:   group.cumulative_amount,
//       });
//     }

//     return res.status(200).json({
//       success:      true,
//       total:        result.length,
      
//       bill_details, // ← Date, Place of Delivery, project & site info
//       data:         result,
//     });

//   } catch (error) {
//     console.error("Error in getAllWorkBillingByProjectId:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch billing orders for project",
//       error:   error.message,
//     });
//   }
// };




// getAllWorkBillingByProjectId = async (req, res) => {
//   try {
//     const { project_id } = req.body;

//     if (!project_id) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id is required in request body",
//       });
//     }

//     // ── PROJECT + CLIENT + SITE META ─────────────────────────────
//     const projectSql = `
//       SELECT
//         cl.client_id,
//         cl.client_name,
//         cl.client_type,
//         cl.client_mobile,
//         cl.client_phone,
//         cl.client_email,
//         cl.client_address,

//         mps.address    AS site_address,
//         mps.from_date  AS site_from_date,
//         mps.to_date    AS site_to_date,
//         mps.project_id AS site_project_id

//       FROM md_project AS mp

//       LEFT JOIN md_client AS cl
//         ON mp.client_id = cl.client_id

//       LEFT JOIN md_project_site AS mps
//         ON mps.project_id = mp.project_id

//       WHERE mp.project_id = ?
//       LIMIT 1
//     `;

//     const projectMeta = await customSelectSqlQuery2(projectSql, [project_id], false);

//     // ── BILLING DATA ─────────────────────────────────────────────
//     const sql = `
//       SELECT
//         wbo.work_billing_order_id,
//         wbo.invoice_no,
//         wbo.project_id,
//         wbo.project_site_id,
//         wbo.work_description,
//         wbo.billing_unit,
//         wbo.billing_qty,
//         wbo.billing_rate,
//         wbo.billing_amount,
//         wbo.boms_completed_count,
//         wbo.billing_status,
//         wbo.invoice_date,
//         wbo.remarks,
//         wbo.created_by,
//         wbo.created_at,
//         wbo.updated_at,

//         wbo.previous_quantity,
//         wbo.this_bill_quantity,
//         wbo.cumulative_quantity,
//         wbo.previous_amount,
//         wbo.this_bill_amount,
//         wbo.cumulative_amount,
//         wbo.cgst_amt,
//         wbo.sgst_amt,
//         wbo.igst_amt,

//         mpb.quantity   AS boq_qty,
//         mpb.rate       AS boq_rate,
//         mpb.amount     AS boq_amount,
//         mpb.hsn_code   AS boq_hsn_code,

//         bmd.billing_material_detail_id,
//         bmd.work_progress_site_id,
//         bmd.bom_id,
//         bmd.bomUnitOfLength     AS detail_bom_unit_of_length,
//         bmd.bom_unit,
//         bmd.bom_qty,
//         bmd.bom_price,
//         bmd.bom_amount          AS detail_bom_amount,
//         bmd.progress_step_name,
//         bmd.step_sl_number,
//         bmd.product_id,
//         bmd.product_name,
//         bmd.hsn_code,
//         bmd.unit,
//         bmd.qty_per_bom,
//         bmd.required_qty,
//         bmd.used_qty

//       FROM work_billing_order AS wbo

//       LEFT JOIN md_project_billing AS mpb
//         ON mpb.project_id = wbo.project_id
//         AND mpb.project_work_description = wbo.work_description

//       LEFT JOIN billing_material_detail AS bmd
//         ON bmd.work_billing_order_id = wbo.work_billing_order_id

//       WHERE wbo.project_id = ?
//       ORDER BY
//         wbo.work_description ASC,
//         wbo.work_billing_order_id ASC,
//         bmd.step_sl_number ASC
//     `;

//     const rows = await customSelectSqlQuery2(sql, [project_id], true);

//     if (!rows || rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No billing orders found for this project",
//       });
//     }

//     // ── STEP 1: BUILD ORDER MAP ─────────────────────────────
//     const orderMap = {};
//     const orderIndex = [];

//     rows.forEach((row) => {
//       const orderId = row.work_billing_order_id;

//       if (!orderMap[orderId]) {
//         orderMap[orderId] = {
//           work_billing_order_id: orderId,
//           invoice_no: row.invoice_no,
//           project_id: row.project_id,
//           project_site_id: row.project_site_id,
//           work_description: row.work_description,

//           billing_unit: row.billing_unit,
//           billing_qty: Number(row.billing_qty || 0),
//           billing_rate: Number(row.billing_rate || 0),
//           billing_amount: Number(row.billing_amount || 0),

//           previous_quantity: Number(row.previous_quantity || 0),
//           this_bill_quantity: Number(row.this_bill_quantity || 0),
//           cumulative_quantity: Number(row.cumulative_quantity || 0),

//           previous_amount: Number(row.previous_amount || 0),
//           this_bill_amount: Number(row.this_bill_amount || 0),
//           cumulative_amount: Number(row.cumulative_amount || 0),

//           boq_qty: Number(row.boq_qty || 0),
//           boq_rate: Number(row.boq_rate || 0),
//           boq_amount: Number(row.boq_amount || 0),
//           boq_hsn: row.boq_hsn_code || "",

//           invoice_date: row.invoice_date,
//           material_details: [],
//         };

//         orderIndex.push(orderId);
//       }

//       if (row.billing_material_detail_id) {
//         orderMap[orderId].material_details.push({
//           billing_material_detail_id: row.billing_material_detail_id,
//           product_name: row.product_name,
//           qty_per_bom: Number(row.qty_per_bom || 0),
//           required_qty: Number(row.required_qty || 0),
//           used_qty: Number(row.used_qty || 0),
//         });
//       }
//     });

//     // ── STEP 2: GROUP BY WORK DESCRIPTION ─────────────────────
//     const descMap = {};
//     const descOrder = [];

//     orderIndex.forEach((id) => {
//       const order = orderMap[id];
//       const key = `${order.project_site_id}_${order.work_description}`;

//       if (!descMap[key]) {
//         descMap[key] = {
//           work_description: order.work_description,
//           billing_unit: order.billing_unit,
//           billing_rate: order.billing_rate,

//           boq_qty: order.boq_qty,
//           boq_rate: order.boq_rate,
//           boq_amount: order.boq_amount,
//           boq_hsn: order.boq_hsn,

//           bills: [],
//           latest_order_id: 0,
//           latest_invoice_no: null,
//         };

//         descOrder.push(key);
//       }

//       descMap[key].bills.push(order);

//       // ✅ FIX: latest invoice using MAX ID
//       if (order.work_billing_order_id > descMap[key].latest_order_id) {
//         descMap[key].latest_order_id = order.work_billing_order_id;
//         descMap[key].latest_invoice_no = order.invoice_no;
//       }
//     });

//     // ── STEP 3: BUILD RESULT ─────────────────────────────
//     const result = descOrder.map((key) => {
//       const group = descMap[key];
//       const latestBill = group.bills[group.bills.length - 1];

//       return {
//         work_description: group.work_description,
//         invoice_no: group.latest_invoice_no || "N/A",

//         billing_unit: group.billing_unit,
//         billing_rate: group.billing_rate,

//         boq_qty: group.boq_qty,
//         boq_rate: group.boq_rate,
//         boq_amount: group.boq_amount,
//         boq_hsn: group.boq_hsn,

//         previous_quantity: Number(latestBill.previous_quantity || 0),
//         this_bill_quantity: Number(latestBill.this_bill_quantity || 0),
//         cumulative_quantity: Number(latestBill.cumulative_quantity || 0),

//         previous_amount: Number(latestBill.previous_amount || 0),
//         this_bill_amount: Number(latestBill.this_bill_amount || 0),
//         cumulative_amount: Number(latestBill.cumulative_amount || 0),
//       };
//     });

//     // ── OPTIONAL: OVERALL LATEST INVOICE ─────────────────────
//     const latestInvoice = rows.reduce((max, row) => {
//       return (!max || row.work_billing_order_id > max.work_billing_order_id)
//         ? row
//         : max;
//     }, null);

//     // ── STEP 4: BILL DETAILS ─────────────────────────────
//     const bill_details = {
//       invoice_no: latestInvoice?.invoice_no || "N/A",

//       client_id: projectMeta?.client_id || "N/A",
//       client_name: projectMeta?.client_name || "N/A",
//       client_type: projectMeta?.client_type || "N/A",
//       client_mobile: projectMeta?.client_mobile || "N/A",
//       client_phone: projectMeta?.client_phone || "N/A",
//       client_email: projectMeta?.client_email || "N/A",
//       client_address: projectMeta?.client_address || "N/A",

//       date: projectMeta?.site_from_date || "N/A",
//       place_of_delivery: projectMeta?.site_address || "N/A",
//       to_date: projectMeta?.site_to_date || "N/A",
//       project_id: projectMeta?.site_project_id || "N/A",
//     };

//     // ── FINAL RESPONSE ─────────────────────────────
//     return res.status(200).json({
//       success: true,
//       total: result.length,
//       bill_details,
//       data: result,
//     });

//   } catch (error) {
//     console.error("Error:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch billing orders",
//       error: error.message,
//     });
//   }
// };


// getAllWorkBillingByProjectId = async (req, res) => {
//   try {
//     const { project_id } = req.body;

//     // ── VALIDATION ─────────────────────────────────────────────
//     if (!project_id) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id is required in request body",
//       });
//     }

//     // ── PROJECT + CLIENT + SITE META ─────────────────────────────
//     const projectSql = `
//       SELECT
//         cl.client_id,
//         cl.client_name,
//         cl.client_type,
//         cl.client_mobile,
//         cl.client_phone,
//         cl.client_email,
//         cl.client_address,

//         mps.address    AS site_address,
//         mps.from_date  AS site_from_date,
//         mps.to_date    AS site_to_date,
//         mps.project_id AS site_project_id

//       FROM md_project AS mp

//       LEFT JOIN md_client AS cl
//         ON mp.client_id = cl.client_id

//       LEFT JOIN md_project_site AS mps
//         ON mps.project_id = mp.project_id

//       WHERE mp.project_id = ?
//       LIMIT 1
//     `;

//     const projectMeta = await customSelectSqlQuery2(
//       projectSql,
//       [project_id],
//       false
//     );

//     // ── BILLING DATA ─────────────────────────────────────────────
//     const sql = `
//       SELECT
//         wbo.work_billing_order_id,
//         wbo.invoice_no,

//         -- ✅ MAIN TABLE VALUES
//         wbo.project_id,
//         wbo.project_site_id,

//         wbo.work_description,
//         wbo.billing_unit,
//         wbo.billing_qty,
//         wbo.billing_rate,
//         wbo.billing_amount,
//         wbo.boms_completed_count,
//         wbo.billing_status,
//         wbo.invoice_date,
//         wbo.remarks,
//         wbo.created_by,
//         wbo.created_at,
//         wbo.updated_at,

//         wbo.previous_quantity,
//         wbo.this_bill_quantity,
//         wbo.cumulative_quantity,

//         wbo.previous_amount,
//         wbo.this_bill_amount,
//         wbo.cumulative_amount,

//         wbo.cgst_amt,
//         wbo.sgst_amt,
//         wbo.igst_amt,

//         -- ✅ BOQ
//         mpb.quantity   AS boq_qty,
//         mpb.rate       AS boq_rate,
//         mpb.amount     AS boq_amount,
//         mpb.hsn_code   AS boq_hsn_code,

//         -- ✅ CHILD TABLE
//         bmd.billing_material_detail_id,
//         bmd.work_progress_site_id,
//         bmd.bom_id,
//         bmd.bomUnitOfLength AS detail_bom_unit_of_length,
//         bmd.bom_unit,
//         bmd.bom_qty,
//         bmd.bom_price,
//         bmd.bom_amount AS detail_bom_amount,
//         bmd.progress_step_name,
//         bmd.step_sl_number,
//         bmd.product_id,
//         bmd.product_name,
//         bmd.hsn_code,
//         bmd.unit,
//         bmd.qty_per_bom,
//         bmd.required_qty,
//         bmd.used_qty,

//         -- ✅ REP TASK
//         tpde.rep_task

//       FROM work_billing_order AS wbo

//       LEFT JOIN md_project_billing AS mpb
//         ON mpb.project_id = wbo.project_id
//         AND mpb.project_work_description = wbo.work_description

//       LEFT JOIN billing_material_detail AS bmd
//         ON bmd.work_billing_order_id = wbo.work_billing_order_id

//       -- ✅ REP TASK JOIN
//       LEFT JOIN tx_project_details_with_estimation AS tpde
//         ON tpde.project_id = wbo.project_id
//         AND tpde.site_id = wbo.project_site_id
//         AND tpde.bom_id = bmd.bom_id

//       WHERE wbo.project_id = ?

//       ORDER BY
//         wbo.work_description ASC,
//         wbo.work_billing_order_id ASC,
//         bmd.step_sl_number ASC
//     `;

//     const rows = await customSelectSqlQuery2(
//       sql,
//       [project_id],
//       true
//     );

//     // ── NO DATA ─────────────────────────────────────────────
//     if (!rows || rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No billing orders found for this project",
//       });
//     }

//     // ── STEP 1: BUILD ORDER MAP ─────────────────────────────
//     const orderMap = {};
//     const orderIndex = [];

//     rows.forEach((row) => {
//       const orderId = row.work_billing_order_id;

//       if (!orderMap[orderId]) {
//         orderMap[orderId] = {
//           work_billing_order_id: orderId,

//           invoice_no: row.invoice_no,

//           // ✅ FROM MAIN TABLE
//           project_id: row.project_id,
//           project_site_id: row.project_site_id,

//           work_description: row.work_description,

//           // ✅ SITE ID MUST COME FROM wbo.project_site_id
//           site_id: row.project_site_id || null,

//           // ✅ FROM CHILD TABLE
//           bom_id: row.bom_id || null,

//           // ✅ FROM tx_project_details_with_estimation
//           rep_task: row.rep_task || "",

//           billing_unit: row.billing_unit,

//           billing_qty: Number(row.billing_qty || 0),
//           billing_rate: Number(row.billing_rate || 0),
//           billing_amount: Number(row.billing_amount || 0),

//           previous_quantity: Number(
//             row.previous_quantity || 0
//           ),

//           this_bill_quantity: Number(
//             row.this_bill_quantity || 0
//           ),

//           cumulative_quantity: Number(
//             row.cumulative_quantity || 0
//           ),

//           previous_amount: Number(
//             row.previous_amount || 0
//           ),

//           this_bill_amount: Number(
//             row.this_bill_amount || 0
//           ),

//           cumulative_amount: Number(
//             row.cumulative_amount || 0
//           ),

//           boq_qty: Number(row.boq_qty || 0),
//           boq_rate: Number(row.boq_rate || 0),
//           boq_amount: Number(row.boq_amount || 0),

//           boq_hsn: row.boq_hsn_code || "",

//           invoice_date: row.invoice_date,

//           material_details: [],
//         };

//         orderIndex.push(orderId);
//       }

//       // ── MATERIAL DETAILS ─────────────────────────────
//       if (row.billing_material_detail_id) {
//         orderMap[orderId].material_details.push({
//           billing_material_detail_id:
//             row.billing_material_detail_id,

//           product_name: row.product_name,

//           qty_per_bom: Number(
//             row.qty_per_bom || 0
//           ),

//           required_qty: Number(
//             row.required_qty || 0
//           ),

//           used_qty: Number(
//             row.used_qty || 0
//           ),
//         });
//       }
//     });

//     // ── STEP 2: GROUP BY WORK DESCRIPTION ─────────────────────
//     const descMap = {};
//     const descOrder = [];

//     orderIndex.forEach((id) => {
//       const order = orderMap[id];

//       const key = `${order.project_site_id}_${order.work_description}`;

//       if (!descMap[key]) {
//         descMap[key] = {
//           work_description: order.work_description,

//           billing_unit: order.billing_unit,
//           billing_rate: order.billing_rate,

//           boq_qty: order.boq_qty,
//           boq_rate: order.boq_rate,
//           boq_amount: order.boq_amount,
//           boq_hsn: order.boq_hsn,

//           bills: [],

//           latest_order_id: 0,
//           latest_invoice_no: null,
//         };

//         descOrder.push(key);
//       }

//       descMap[key].bills.push(order);

//       // ── LATEST ORDER ─────────────────────────────
//       if (
//         order.work_billing_order_id >
//         descMap[key].latest_order_id
//       ) {
//         descMap[key].latest_order_id =
//           order.work_billing_order_id;

//         descMap[key].latest_invoice_no =
//           order.invoice_no;
//       }
//     });

//     // ── STEP 3: BUILD FINAL RESULT ─────────────────────────────
//     const result = descOrder.map((key) => {
//       const group = descMap[key];

//       const latestBill =
//         group.bills[group.bills.length - 1];

//       return {
//         work_description: group.work_description,

//         invoice_no:
//           group.latest_invoice_no || "N/A",

//         // ✅ CORRECT SITE ID
//         site_id: latestBill.site_id,

//         // ✅ BOM ID
//         bom_id: latestBill.bom_id,

//         // ✅ REP TASK
//         rep_task: latestBill.rep_task,

//         billing_unit: group.billing_unit,
//         billing_rate: group.billing_rate,

//         boq_qty: group.boq_qty,
//         boq_rate: group.boq_rate,
//         boq_amount: group.boq_amount,
//         boq_hsn: group.boq_hsn,

//         previous_quantity: Number(
//           latestBill.previous_quantity || 0
//         ),

//         this_bill_quantity: Number(
//           latestBill.this_bill_quantity || 0
//         ),

//         cumulative_quantity: Number(
//           latestBill.cumulative_quantity || 0
//         ),

//         previous_amount: Number(
//           latestBill.previous_amount || 0
//         ),

//         this_bill_amount: Number(
//           latestBill.this_bill_amount || 0
//         ),

//         cumulative_amount: Number(
//           latestBill.cumulative_amount || 0
//         ),
//       };
//     });

//     // ── LATEST INVOICE ─────────────────────────────
//     const latestInvoice = rows.reduce((max, row) => {
//       return (
//         !max ||
//         row.work_billing_order_id >
//           max.work_billing_order_id
//       )
//         ? row
//         : max;
//     }, null);

//     // ── BILL DETAILS ─────────────────────────────
//     const bill_details = {
//       invoice_no: latestInvoice?.invoice_no || "N/A",

//       client_id: projectMeta?.client_id || "N/A",
//       client_name: projectMeta?.client_name || "N/A",
//       client_type: projectMeta?.client_type || "N/A",

//       client_mobile:
//         projectMeta?.client_mobile || "N/A",

//       client_phone:
//         projectMeta?.client_phone || "N/A",

//       client_email:
//         projectMeta?.client_email || "N/A",

//       client_address:
//         projectMeta?.client_address || "N/A",

//       date: projectMeta?.site_from_date || "N/A",

//       place_of_delivery:
//         projectMeta?.site_address || "N/A",

//       to_date:
//         projectMeta?.site_to_date || "N/A",

//       project_id:
//         projectMeta?.site_project_id || "N/A",
//     };

//     // ── FINAL RESPONSE ─────────────────────────────
//     return res.status(200).json({
//       success: true,
//       total: result.length,
//       bill_details,
//       data: result,
//     });

//   } catch (error) {
//     console.error(
//       "Error in getAllWorkBillingByProjectId:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch billing orders",
//       error: error.message,
//     });
//   }
// };

 getAllWorkBillingByProjectId = async (req, res) => {
  try {
    const rawProjectId = req?.body?.project_id;

    // ── VALIDATION ─────────────────────────────────────────────
    if (
      rawProjectId === undefined ||
      rawProjectId === null ||
      rawProjectId === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "project_id is required in request body",
      });
    }

    const project_id = Number(rawProjectId);

    if (!Number.isInteger(project_id) || project_id <= 0) {
      return res.status(400).json({
        success: false,
        message: "project_id must be a valid positive integer",
      });
    }

    // Small numeric helper, avoids repeated Number(...) noise
    const toNumber = (value) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    };

    // ── PROJECT + CLIENT + SITE META ─────────────────────────────
    // LIMIT 1 kept intentionally to preserve existing logic,
    // but ORDER BY added for deterministic row selection.
    const projectSql = `
      SELECT
        cl.client_id,
        cl.client_name,
        cl.client_type,
        cl.client_mobile,
        cl.client_phone,
        cl.client_email,
        cl.client_address,

        mps.address    AS site_address,
        mps.from_date  AS site_from_date,
        mps.to_date    AS site_to_date,
        mps.project_id AS site_project_id

      FROM md_project AS mp

      LEFT JOIN md_client AS cl
        ON mp.client_id = cl.client_id

      LEFT JOIN md_project_site AS mps
        ON mps.project_id = mp.project_id

      WHERE mp.project_id = ?
      ORDER BY mps.project_site_id ASC
      LIMIT 1
    `;

    const projectMeta = await customSelectSqlQuery2(
      projectSql,
      [project_id],
      false
    );

    // ── BILLING DATA ─────────────────────────────────────────────
    const sql = `
      SELECT
        wbo.work_billing_order_id,
        wbo.invoice_no,

        wbo.project_id,
        wbo.project_site_id,

        wbo.work_description,
        wbo.billing_unit,
        wbo.billing_qty,
        wbo.billing_rate,
        wbo.billing_amount,
        wbo.boms_completed_count,
        wbo.billing_status,
        wbo.invoice_date,
        wbo.remarks,
        wbo.created_by,
        wbo.created_at,
        wbo.updated_at,

        wbo.previous_quantity,
        wbo.this_bill_quantity,
        wbo.cumulative_quantity,

        wbo.previous_amount,
        wbo.this_bill_amount,
        wbo.cumulative_amount,

        wbo.cgst_amt,
        wbo.sgst_amt,
        wbo.igst_amt,

        mpb.quantity   AS boq_qty,
        mpb.rate       AS boq_rate,
        mpb.amount     AS boq_amount,
        mpb.hsn_code   AS boq_hsn_code,

        bmd.billing_material_detail_id,
        bmd.work_progress_site_id,
        bmd.bom_id,
        bmd.bomUnitOfLength AS detail_bom_unit_of_length,
        bmd.bom_unit,
        bmd.bom_qty,
        bmd.bom_price,
        bmd.bom_amount AS detail_bom_amount,
        bmd.progress_step_name,
        bmd.step_sl_number,
        bmd.product_id,
        bmd.product_name,
        bmd.hsn_code,
        bmd.unit,
        bmd.qty_per_bom,
        bmd.required_qty,
        bmd.used_qty,

        tpde.rep_task

      FROM work_billing_order AS wbo

      LEFT JOIN md_project_billing AS mpb
        ON mpb.project_id = wbo.project_id
        AND mpb.project_work_description = wbo.work_description

      LEFT JOIN billing_material_detail AS bmd
        ON bmd.work_billing_order_id = wbo.work_billing_order_id

      LEFT JOIN tx_project_details_with_estimation AS tpde
        ON tpde.project_id = wbo.project_id
        AND tpde.site_id = wbo.project_site_id
        AND tpde.bom_id = bmd.bom_id

      WHERE wbo.project_id = ?

      ORDER BY
        wbo.work_description ASC,
        wbo.work_billing_order_id ASC,
        bmd.step_sl_number ASC,
        bmd.billing_material_detail_id ASC
    `;

    const rows = await customSelectSqlQuery2(sql, [project_id], true);

    // ── NO DATA ─────────────────────────────────────────────
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No billing orders found for this project",
      });
    }

    // ── STEP 1: BUILD ORDER MAP ─────────────────────────────
    // Use Map for safer keyed access and stable insertion order.
    const orderMap = new Map();
    const orderIndex = [];

    for (const row of rows) {
      const orderId = row.work_billing_order_id;

      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, {
          work_billing_order_id: orderId,
          invoice_no: row.invoice_no,

          project_id: row.project_id,
          project_site_id: row.project_site_id,

          work_description: row.work_description,
          site_id: row.project_site_id || null,

          bom_id: row.bom_id || null,
          rep_task: row.rep_task || "",

          billing_unit: row.billing_unit,
          billing_qty: toNumber(row.billing_qty),
          billing_rate: toNumber(row.billing_rate),
          billing_amount: toNumber(row.billing_amount),

          previous_quantity: toNumber(row.previous_quantity),
          this_bill_quantity: toNumber(row.this_bill_quantity),
          cumulative_quantity: toNumber(row.cumulative_quantity),

          previous_amount: toNumber(row.previous_amount),
          this_bill_amount: toNumber(row.this_bill_amount),
          cumulative_amount: toNumber(row.cumulative_amount),

          boq_qty: toNumber(row.boq_qty),
          boq_rate: toNumber(row.boq_rate),
          boq_amount: toNumber(row.boq_amount),
          boq_hsn: row.boq_hsn_code || "",

          invoice_date: row.invoice_date,
          material_details: [],
          _materialIds: new Set(), // internal dedupe guard
        });

        orderIndex.push(orderId);
      }

      const order = orderMap.get(orderId);

      // Preserve first non-null bom_id / rep_task exactly in spirit of current logic
      if (order.bom_id == null && row.bom_id != null) {
        order.bom_id = row.bom_id;
      }

      if (!order.rep_task && row.rep_task) {
        order.rep_task = row.rep_task;
      }

      // ── MATERIAL DETAILS ─────────────────────────────
      if (
        row.billing_material_detail_id &&
        !order._materialIds.has(row.billing_material_detail_id)
      ) {
        order._materialIds.add(row.billing_material_detail_id);

        order.material_details.push({
          billing_material_detail_id: row.billing_material_detail_id,
          product_name: row.product_name,
          qty_per_bom: toNumber(row.qty_per_bom),
          required_qty: toNumber(row.required_qty),
          used_qty: toNumber(row.used_qty),
        });
      }
    }

    // remove internal sets to keep response clean
    for (const orderId of orderIndex) {
      const order = orderMap.get(orderId);
      delete order._materialIds;
    }

    // ── STEP 2: GROUP BY WORK DESCRIPTION ─────────────────────
    const descMap = new Map();
    const descOrder = [];

    for (const id of orderIndex) {
      const order = orderMap.get(id);
      const key = `${order.project_site_id}_${order.work_description}`;

      if (!descMap.has(key)) {
        descMap.set(key, {
          work_description: order.work_description,

          billing_unit: order.billing_unit,
          billing_rate: order.billing_rate,

          boq_qty: order.boq_qty,
          boq_rate: order.boq_rate,
          boq_amount: order.boq_amount,
          boq_hsn: order.boq_hsn,

          bills: [],
          latest_order_id: 0,
          latest_invoice_no: null,
        });

        descOrder.push(key);
      }

      const group = descMap.get(key);
      group.bills.push(order);

      if (order.work_billing_order_id > group.latest_order_id) {
        group.latest_order_id = order.work_billing_order_id;
        group.latest_invoice_no = order.invoice_no;
      }
    }

    // ── STEP 3: BUILD FINAL RESULT ─────────────────────────────
    const result = descOrder.map((key) => {
      const group = descMap.get(key);

      // Use actual highest order ID bill deterministically,
      // not merely last array item.
      let latestBill = group.bills[0];

      for (let i = 1; i < group.bills.length; i++) {
        if (
          group.bills[i].work_billing_order_id >
          latestBill.work_billing_order_id
        ) {
          latestBill = group.bills[i];
        }
      }

      return {
        work_description: group.work_description,
        invoice_no: group.latest_invoice_no || "N/A",

        site_id: latestBill.site_id,
        bom_id: latestBill.bom_id,
        rep_task: latestBill.rep_task,

        billing_unit: group.billing_unit,
        billing_rate: group.billing_rate,

        boq_qty: group.boq_qty,
        boq_rate: group.boq_rate,
        boq_amount: group.boq_amount,
        boq_hsn: group.boq_hsn,

        previous_quantity: toNumber(latestBill.previous_quantity),
        this_bill_quantity: toNumber(latestBill.this_bill_quantity),
        cumulative_quantity: toNumber(latestBill.cumulative_quantity),

        previous_amount: toNumber(latestBill.previous_amount),
        this_bill_amount: toNumber(latestBill.this_bill_amount),
        cumulative_amount: toNumber(latestBill.cumulative_amount),
      };
    });

    // ── LATEST INVOICE ─────────────────────────────
    let latestInvoice = rows[0];
    for (let i = 1; i < rows.length; i++) {
      if (
        rows[i].work_billing_order_id >
        latestInvoice.work_billing_order_id
      ) {
        latestInvoice = rows[i];
      }
    }

    // ── BILL DETAILS ─────────────────────────────
    const bill_details = {
      invoice_no: latestInvoice?.invoice_no || "N/A",

      client_id: projectMeta?.client_id || "N/A",
      client_name: projectMeta?.client_name || "N/A",
      client_type: projectMeta?.client_type || "N/A",

      client_mobile: projectMeta?.client_mobile || "N/A",
      client_phone: projectMeta?.client_phone || "N/A",
      client_email: projectMeta?.client_email || "N/A",
      client_address: projectMeta?.client_address || "N/A",

      date: projectMeta?.site_from_date || "N/A",
      place_of_delivery: projectMeta?.site_address || "N/A",
      to_date: projectMeta?.site_to_date || "N/A",
      project_id: projectMeta?.site_project_id || "N/A",
    };

    // ── FINAL RESPONSE ─────────────────────────────
    return res.status(200).json({
      success: true,
      total: result.length,
      bill_details,
      data: result,
    });
  } catch (error) {
    console.error("Error in getAllWorkBillingByProjectId:", {
      message: error?.message,
      stack: error?.stack,
      body: req?.body,
    });

    return res.status(500).json({
      success: false,
      message: "Unable to fetch billing orders",
    });
  }
};

}

module.exports = new WorkBillingController();