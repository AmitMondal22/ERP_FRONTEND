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

  // ─────────────────────────────────────────────
  //  HELPER: generate invoice_no = WO-YYYY-MM-DD/N
  // ─────────────────────────────────────────────
  #generateInvoiceNo = async (date) => {
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    const count = await countRows(
      "work_billing_order",
      `invoice_date = '${dateStr}'`
    );
    return `WO-${dateStr}/${count + 1}`;
  };


  // ─────────────────────────────────────────────
  //  CREATE  POST /work-billing
  //  Body: { project_id, project_site_id, work_description,
  //          billing_unit, billing_qty, billing_rate, billing_amount,
  //          boms_completed_count, billing_status, invoice_date, remarks,
  //          material_details: [...] }
  // ─────────────────────────────────────────────




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
    } = req.body;

    // ── Validate top-level fields ──────────────────────────────────────
    if (
      !project_id ||
      !project_site_id ||
      !work_description ||
      !billing_unit ||
      billing_qty == null ||
      billing_rate == null ||
      billing_amount == null ||
      !invoice_date
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    if (!Array.isArray(material_details) || material_details.length === 0) {
      return res.status(400).json({
        success: false,
        message: "material_details array is required and must not be empty",
      });
    }

    // ── Parse bomUnitOfLength ──────────────────────────────────────────
    const parsedBomUnitOfLength =
      bomUnitOfLength != null && bomUnitOfLength !== ""
        ? parseFloat(bomUnitOfLength)
        : null;

    if (parsedBomUnitOfLength !== null && isNaN(parsedBomUnitOfLength)) {
      return res.status(400).json({
        success: false,
        message: "bomUnitOfLength must be a valid number",
      });
    }

    // ── Generate invoice_no & insert work_billing_order ───────────────
    const invoice_no = await this.#generateInvoiceNo(invoice_date);
    const now = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
    const created_by = req.user?.id || null;

    const work_billing_order_id = await insertData("work_billing_order", {
      invoice_no,
      project_id: Number(project_id),
      project_site_id: Number(project_site_id),
      work_description,
      billing_unit,
      billing_qty: parseFloat(billing_qty),
      billing_rate: parseFloat(billing_rate),
      billing_amount: parseFloat(billing_amount),
      boms_completed_count: parseFloat(boms_completed_count || 0),
      billing_status,
      invoice_date,
      remarks: remarks || null,
      created_by,
      created_at: now,
      updated_at: now,
    });

    if (!work_billing_order_id) {
      throw new Error("Failed to create billing order");
    }

    // ── Validate required fields per detail row ───────────────────────
    const requiredDetailFields = [
      "bom_id", "bom_unit", "bom_qty", "bom_price", "bom_amount",
      "progress_step_name", "step_sl_number", "product_id",
      "product_name", "hsn_code", "unit", "qty_per_bom",
      "required_qty",
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

    // ── Build detail rows — one row per material_detail item ──────────
    // ✅ No expansion needed — frontend already sent one row per consumption
    const detailCols =
      "work_billing_order_id, work_progress_site_id, bom_id, bomUnitOfLength, " +
      "bom_unit, bom_qty, bom_price, bom_amount, progress_step_name, step_sl_number, " +
      "product_id, product_name, hsn_code, unit, qty_per_bom, required_qty, " +
      "used_qty, created_at, updated_at";

    const detailRows = material_details.map((d) => {
      const rowBomUnitOfLength =
        d.bomUnitOfLength != null && d.bomUnitOfLength !== ""
          ? parseFloat(d.bomUnitOfLength)
          : parsedBomUnitOfLength;

      return {
        work_billing_order_id,
        work_progress_site_id:
          d.work_progress_site_id != null
            ? Number(d.work_progress_site_id)
            : null,                                    // ✅ single value, not array
        bom_id: d.bom_id,
        bomUnitOfLength:
          rowBomUnitOfLength !== null && !isNaN(rowBomUnitOfLength)
            ? rowBomUnitOfLength
            : null,
        bom_unit: d.bom_unit,
        bom_qty: parseFloat(d.bom_qty),
        bom_price: parseFloat(d.bom_price),
        bom_amount: parseFloat(d.bom_amount),
        progress_step_name: d.progress_step_name,
        step_sl_number: parseFloat(d.step_sl_number),
        product_id: Number(d.product_id),
        product_name: d.product_name,
        hsn_code: d.hsn_code,
        unit: d.unit,
        qty_per_bom: parseFloat(d.qty_per_bom),
        required_qty: parseFloat(d.required_qty),
        used_qty: parseFloat(d.used_qty || 0),         // ✅ per-site used_qty
        created_at: now,
        updated_at: now,
      };
    });

    await batchInsertData("billing_material_detail", detailCols, detailRows);

    return res.status(201).json({
      success: true,
      message: "Work billing order created successfully",
      data: { work_billing_order_id, invoice_no },
    });

  } catch (error) {
    console.error("ERROR in createWorkBilling:", error.message);
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
getAllWorkBillingByProjectId = async (req, res) => {
  try {
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "project_id is required in request body",
      });
    }

    const sql = `
      SELECT
        wbo.*,
        bmd.billing_material_detail_id,
        bmd.bom_name,
        bmd.bom_unit,
        bmd.bom_qty,
        bmd.bom_price,
        bmd.bom_amount,
        bmd.progress_step_name,
        bmd.step_sl_number,
        bmd.product_id,
        bmd.product_name,
        bmd.hsn_code,
        bmd.unit,
        bmd.qty_per_bom,
        bmd.required_qty,
        bmd.used_qty
      FROM work_billing_order AS wbo
      LEFT JOIN billing_material_detail AS bmd
        ON wbo.work_billing_order_id = bmd.work_billing_order_id
      WHERE wbo.project_id = ?
      ORDER BY wbo.work_billing_order_id DESC, bmd.step_sl_number ASC
    `;

    const rows = await customSelectSqlQuery2(sql, [project_id], true);

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No billing orders found for this project",
      });
    }

    // ── Group detail rows under each billing order ──
    const resultMap = {};
    const resultOrder = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const key = row.work_billing_order_id;

      if (!resultMap[key]) {
        resultMap[key] = {
          work_billing_order_id:   row.work_billing_order_id,
          invoice_no:              row.invoice_no,
          project_id:              row.project_id,
          project_site_id:         row.project_site_id,
          work_description:        row.work_description,
          billing_unit:            row.billing_unit,
          billing_qty:             row.billing_qty,
          billing_rate:            row.billing_rate,
          billing_amount:          row.billing_amount,
          previous_billing_amount: row.previous_billing_amount,
          boms_completed_count:    row.boms_completed_count,
          billing_status:          row.billing_status,
          invoice_date:            row.invoice_date,
          remarks:                 row.remarks,
          parent_billing_id:       row.parent_billing_id,
          created_by:              row.created_by,
          created_at:              row.created_at,
          updated_at:              row.updated_at,
          material_details:        [],
        };
        resultOrder.push(key);
      }

      // ── Only push detail if it actually exists (LEFT JOIN) ──
      if (row.billing_material_detail_id) {
        resultMap[key].material_details.push({
          billing_material_detail_id: row.billing_material_detail_id,
          bom_name:                   row.bom_name,
          bom_unit:                   row.bom_unit,
          bom_qty:                    row.bom_qty,
          bom_price:                  row.bom_price,
          bom_amount:                 row.bom_amount,
          progress_step_name:         row.progress_step_name,
          step_sl_number:             row.step_sl_number,
          product_id:                 row.product_id,
          product_name:               row.product_name,
          hsn_code:                   row.hsn_code,
          unit:                       row.unit,
          qty_per_bom:                row.qty_per_bom,
          required_qty:               row.required_qty,
          used_qty:                   row.used_qty,
        });
      }
    }

    // ── Build final array using resultOrder index loop ──
    const result = [];
    for (let i = 0; i < resultOrder.length; i++) {
      result.push(resultMap[resultOrder[i]]);
    }

    return res.status(200).json({
      success: true,
      total: result.length,
      data: result,
    });

  } catch (error) {
    console.error("Error in WorkBilling.getByProjectId:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch billing orders for project",
      error: error.message,
    });
  }
};




}

module.exports = new WorkBillingController();