const {
  selectData,
  selectOneData,
  insertData,
  updateData,
  deleteData,
  countRows,
  selectDataInRanges,
  customSelectSqlQuery2,
} = require("../models/MasterModel");




class ClaimsReimbursementsController {




// CREATE  →  POST /api/claims
  // async create(req, res) {
  //   try {
  //     const {
  //       employee_id,
  //       claimType_id,
  //       claim_title,
  //       claim_date,
  //       claim_amount,
  //       submit_date,
  //       attachment_file = null,
  //       remarks = null,
  //     } = req.body;

  //     // ── required field validation ──
  //     if (!employee_id || !claimType_id || !claim_title || !claim_date || !claim_amount)
  //       return res.status(400).json({
  //         success: false,
  //         message: "employee_id, claimType_id, claim_title, claim_date, claim_amount are required",
  //       });

  //     if (Number(claim_amount) <= 0)
  //       return res
  //         .status(400)
  //         .json({ success: false, message: "claim_amount must be greater than 0" });

  //     // ── check claim type exists & active ──
  //     const claimType = await selectOneData(
  //       "em_claim_types",
  //       "claimType_id, max_limit_amount, is_active",
  //       `claimType_id = ${claimType_id}`
  //     );
  //     if (!claimType)
  //       return res
  //         .status(404)
  //         .json({ success: false, message: "Claim type not found" });
  //     if (!claimType.is_active)
  //       return res
  //         .status(400)
  //         .json({ success: false, message: "Selected claim type is inactive" });

  //     // ── optional: max limit check ──
  //     if (
  //       claimType.max_limit_amount !== null &&
  //       Number(claim_amount) > Number(claimType.max_limit_amount)
  //     ) {
  //       return res.status(400).json({
  //         success: false,
  //         message: `Claim amount exceeds the maximum limit of ${claimType.max_limit_amount} for this claim type`,
  //       });
  //     }

  //     const today = new Date().toISOString().split("T")[0];

  //     const insertId = await insertData("claims_reimbursements", {
  //       employee_id,
  //       claimType_id,
  //       claim_title,
  //       claim_date,
  //       claim_amount,
  //       submit_date: submit_date || today,
  //       attachment_file,
  //       claim_status: "Pending",
  //       remarks,
  //     });

  //     return res.status(201).json({
  //       success: true,
  //       message: "Claim submitted successfully",
  //       claim_id: insertId,
  //     });
  //   } catch (err) {
  //     return res.status(500).json({ success: false, message: err.message });
  //   }
  // }

async create(req, res) {
  try {
    const {
      employee_id,
      claimType_id,
      claim_title,
      claim_date,
      claim_amount,
      submit_date,
      remarks = null,
    } = req.body;

    // ✅ get uploaded file path
    let attachment_file = null;

    if (req.files && req.files.length > 0) {
      attachment_file = req.files[0].path; // or filename depending on multer config
    }

    // validation
    if (!employee_id || !claimType_id || !claim_title || !claim_date || !claim_amount)
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });

    if (Number(claim_amount) <= 0)
      return res.status(400).json({
        success: false,
        message: "claim_amount must be greater than 0",
      });

    const today = new Date().toISOString().split("T")[0];

    const insertId = await insertData("claims_reimbursements", {
      employee_id,
      claimType_id,
      claim_title,
      claim_date,
      claim_amount,
      submit_date: submit_date || today,
      attachment_file,   // ✅ now real file path
      claim_status: "Pending",
      remarks,
    });

    return res.status(201).json({
      success: true,
      message: "Claim submitted successfully",
      claim_id: insertId,
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}


  // GET ALL  →  GET /api/claims
  async getAll(req, res) {
    try {
      const sql = `
        SELECT 
          cr.*,
          ct.claim_type_name,
          ct.max_limit_amount
        FROM claims_reimbursements cr
        LEFT JOIN em_claim_types ct ON cr.claimType_id = ct.claimType_id
        ORDER BY cr.submit_date DESC
      `;
      const data = await customSelectSqlQuery2(sql);
      return res.status(200).json({
        success: true,
        message: "Claims fetched successfully",
        data,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET BY EMPLOYEE  →  GET /api/claims/employee/:employeeId
  async getByEmployee(req, res) {
    try {
      const { employeeId } = req.params;
      const sql = `
        SELECT 
          cr.*,
          ct.claim_type_name,
          ct.max_limit_amount
        FROM claims_reimbursements cr
        LEFT JOIN em_claim_types ct ON cr.claimType_id = ct.claimType_id
        WHERE cr.employee_id = ?
        ORDER BY cr.submit_date DESC
      `;
      const data = await customSelectSqlQuery2(sql, [employeeId]);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET BY ID  →  GET /api/claims/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const sql = `
        SELECT 
          cr.*,
          ct.claim_type_name,
          ct.max_limit_amount
        FROM claims_reimbursements cr
        LEFT JOIN em_claim_types ct ON cr.claimType_id = ct.claimType_id
        WHERE cr.claim_id = ?
        LIMIT 1
      `;
      const data = await customSelectSqlQuery2(sql, [id], false);
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Claim not found" });

      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET BY STATUS  →  GET /api/claims/status/:status
  async getByStatus(req, res) {
    try {
      const { status } = req.params;
      const validStatuses = ["Pending", "Under Review", "Approved", "Rejected", "Paid"];
      if (!validStatuses.includes(status))
        return res
          .status(400)
          .json({ success: false, message: "Invalid status value" });

      const sql = `
        SELECT 
          cr.*,
          ct.claim_type_name
        FROM claims_reimbursements cr
        LEFT JOIN em_claim_types ct ON cr.claimType_id = ct.claimType_id
        WHERE cr.claim_status = ?
        ORDER BY cr.submit_date DESC
      `;
      const data = await customSelectSqlQuery2(sql, [status]);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // PAGINATED  →  GET /api/claims/paginate?page=1&limit=10
  async getPaginated(req, res) {
    try {
      const page  = parseInt(req.query.page)  || 1;
      const limit = parseInt(req.query.limit) || 10;
      const start = (page - 1) * limit + 1;
      const end   = page * limit;

      const result = await selectDataInRanges(
        `cr.*, ct.claim_type_name`,
        `claims_reimbursements cr LEFT JOIN em_claim_types ct ON cr.claimType_id = ct.claimType_id`,
        start,
        end
      );

      return res.status(200).json({
        success: true,
        page,
        limit,
        total: result.total_count,
        total_pages: Math.ceil(result.total_count / limit),
        data: result.row_data,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  

  // UPDATE (employee can edit while Pending)  →  PUT /api/claims/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        claimType_id,
        claim_title,
        claim_date,
        claim_amount,
        submit_date,
        attachment_file,
        remarks,
      } = req.body;

      const existing = await selectOneData(
        "claims_reimbursements",
        "claim_id, claim_status",
        `claim_id = ${id}`
      );
      if (!existing)
        return res
          .status(404)
          .json({ success: false, message: "Claim not found" });

      if (existing.claim_status !== "Pending")
        return res.status(400).json({
          success: false,
          message: `Cannot edit a claim that is already '${existing.claim_status}'`,
        });

      const updatePayload = {};
      if (claimType_id    !== undefined) updatePayload.claimType_id    = claimType_id;
      if (claim_title     !== undefined) updatePayload.claim_title     = claim_title;
      if (claim_date      !== undefined) updatePayload.claim_date      = claim_date;
      if (claim_amount    !== undefined) updatePayload.claim_amount    = claim_amount;
      if (submit_date     !== undefined) updatePayload.submit_date     = submit_date;
      if (attachment_file !== undefined) updatePayload.attachment_file = attachment_file;
      if (remarks         !== undefined) updatePayload.remarks         = remarks;

      if (Object.keys(updatePayload).length === 0)
        return res
          .status(400)
          .json({ success: false, message: "No fields to update" });

      await updateData("claims_reimbursements", updatePayload, `claim_id = ${id}`);

      return res.status(200).json({
        success: true,
        message: "Claim updated successfully",
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // UPDATE STATUS (HR/Admin)  →  PATCH /api/claims/:id/status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { claim_status, reviewed_by, remarks, paid_date } = req.body;

      const validStatuses = ["Pending", "Under Review", "Approved", "Rejected", "Paid"];
      if (!claim_status || !validStatuses.includes(claim_status))
        return res
          .status(400)
          .json({ success: false, message: "Invalid or missing claim_status" });

      const existing = await selectOneData(
        "claims_reimbursements",
        "claim_id, claim_status",
        `claim_id = ${id}`
      );
      if (!existing)
        return res
          .status(404)
          .json({ success: false, message: "Claim not found" });

      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      const updatePayload = {
        claim_status,
        reviewed_at: now,
      };

      if (reviewed_by !== undefined) updatePayload.reviewed_by = reviewed_by;
      if (remarks     !== undefined) updatePayload.remarks     = remarks;

      // auto-set paid_date when marking as Paid
      if (claim_status === "Paid") {
        updatePayload.paid_date = paid_date || new Date().toISOString().split("T")[0];
      }

      await updateData("claims_reimbursements", updatePayload, `claim_id = ${id}`);

      return res.status(200).json({
        success: true,
        message: `Claim status updated to '${claim_status}'`,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // DELETE (only Pending claims)  →  DELETE /api/claims/:id
  async delete(req, res) {
    try {
      const { id } = req.params;

      const existing = await selectOneData(
        "claims_reimbursements",
        "claim_id, claim_status",
        `claim_id = ${id}`
      );
      if (!existing)
        return res
          .status(404)
          .json({ success: false, message: "Claim not found" });

      if (existing.claim_status !== "Pending")
        return res.status(400).json({
          success: false,
          message: `Cannot delete a claim with status '${existing.claim_status}'`,
        });

      await deleteData("claims_reimbursements", `claim_id = ${id}`);
      return res.status(200).json({
        success: true,
        message: "Claim deleted successfully",
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // SUMMARY STATS  →  GET /api/claims/summary/:employeeId
  async getSummary(req, res) {
    try {
      const { employeeId } = req.params;
      const sql = `
        SELECT
          claim_status,
          COUNT(*)               AS total_claims,
          SUM(claim_amount)      AS total_amount,
          AVG(claim_amount)      AS avg_amount
        FROM claims_reimbursements
        WHERE employee_id = ?
        GROUP BY claim_status
      `;
      const data = await customSelectSqlQuery2(sql, [employeeId]);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}


module.exports= new ClaimsReimbursementsController()