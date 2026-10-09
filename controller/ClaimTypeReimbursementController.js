const {
  selectData,
  selectOneData,
  insertData,
  batchInsertData,
  updateData,
  deleteData,
  countRows,
  selectDataInRanges,
  customSelectSqlQuery2,
} = require("../models/MasterModel");
const { sendClaimStatusEmail } = require("../utils/mailer");

class ClaimsReimbursementsController {
  // CREATE → POST /api/create-claim
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
        bills: rawBills,
      } = req.body;

      if (!employee_id || !claimType_id || !claim_title) {
        return res.status(400).json({
          success: false,
          message: "employee_id, claimType_id, and claim_title are required",
        });
      }

      // Parse bills if sent as JSON string
      let parsedBills = [];
      if (rawBills) {
        try {
          parsedBills = typeof rawBills === "string" ? JSON.parse(rawBills) : rawBills;
        } catch (e) {
          console.warn("Failed to parse bills JSON:", e);
          parsedBills = [];
        }
      }

      // Map uploaded files
      const uploadedFiles = req.files || [];
      const filePaths = uploadedFiles.map((f) => f.path);
      const primaryAttachment = filePaths.length > 0 ? filePaths[0] : null;

      // Calculate total claim amount
      let totalAmount = Number(claim_amount) || 0;
      if (parsedBills.length > 0) {
        const billsSum = parsedBills.reduce(
          (sum, b) => sum + (Number(b.bill_amount) || 0),
          0
        );
        if (billsSum > 0) {
          totalAmount = billsSum;
        }
      }

      if (totalAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Claim amount must be greater than 0",
        });
      }

      const today = new Date().toISOString().split("T")[0];

      // Insert master record in claims_reimbursements
      const masterData = {
        employee_id,
        claimType_id,
        claim_title: claim_title.trim(),
        claim_date: claim_date || today,
        claim_amount: totalAmount,
        submit_date: submit_date || today,
        attachment_file: primaryAttachment,
        attachments: JSON.stringify(filePaths),
        claim_status: "Pending",
        remarks: remarks || null,
      };

      const claimId = await insertData("claims_reimbursements", masterData);

      // Insert bills into claims_reimbursement_bills using batchInsertData
      if (parsedBills.length > 0) {
        const billRows = parsedBills.map((bill, i) => {
          let billFilePath = null;
          if (bill.file_index !== undefined && uploadedFiles[bill.file_index]) {
            billFilePath = uploadedFiles[bill.file_index].path;
          } else if (uploadedFiles[i]) {
            billFilePath = uploadedFiles[i].path;
          } else if (bill.bill_file) {
            billFilePath = bill.bill_file;
          }

          return {
            claim_id: claimId,
            bill_title: bill.bill_title || `${claim_title} - Bill #${i + 1}`,
            bill_date: bill.bill_date || claim_date || today,
            bill_amount: Number(bill.bill_amount) || 0,
            bill_file: billFilePath || null,
          };
        });

        await batchInsertData(
          "claims_reimbursement_bills",
          "claim_id, bill_title, bill_date, bill_amount, bill_file",
          billRows
        );
      } else if (primaryAttachment || totalAmount > 0) {
        // Create 1 default line item
        await batchInsertData(
          "claims_reimbursement_bills",
          "claim_id, bill_title, bill_date, bill_amount, bill_file",
          [
            {
              claim_id: claimId,
              bill_title: claim_title,
              bill_date: claim_date || today,
              bill_amount: totalAmount,
              bill_file: primaryAttachment,
            },
          ]
        );
      }

      return res.status(201).json({
        success: true,
        message: "Claim submitted successfully with multiple bills",
        claim_id: claimId,
      });
    } catch (err) {
      console.error("Create claim error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET ALL → GET /api/getall/claims
  async getAll(req, res) {
    try {
      const sql = `
        SELECT 
          cr.claim_id,
          cr.employee_id,
          cr.claimType_id,
          cr.claim_title,
          cr.claim_date,
          cr.claim_amount,
          cr.approved_amount,
          cr.submit_date,
          cr.attachment_file,
          cr.attachments,
          cr.claim_status,
          cr.paid_date,
          cr.remarks,
          cr.admin_remarks,
          cr.reviewed_by,
          cr.reviewed_at,
          cr.currency,
          cr.created_at,
          cr.updated_at,
          ct.claim_type_name,
          e.first_name AS employee_first_name,
          e.last_name AS employee_last_name,
          e.email AS employee_email
        FROM claims_reimbursements cr
        LEFT JOIN em_claim_types ct ON cr.claimType_id = ct.claimType_id
        LEFT JOIN em_employees e ON cr.employee_id = e.employee_id
        ORDER BY cr.claim_id DESC
      `;
      const claims = await customSelectSqlQuery2(sql);

      // Fetch all attached bills
      if (Array.isArray(claims) && claims.length > 0) {
        const claimIds = claims.map((c) => c.claim_id).filter(Boolean);
        if (claimIds.length > 0) {
          const billsSql = `SELECT * FROM claims_reimbursement_bills WHERE claim_id IN (${claimIds.join(",")}) ORDER BY bill_id ASC`;
          const allBills = await customSelectSqlQuery2(billsSql);
          const billsMap = {};
          if (Array.isArray(allBills)) {
            allBills.forEach((b) => {
              if (!billsMap[b.claim_id]) billsMap[b.claim_id] = [];
              billsMap[b.claim_id].push(b);
            });
          }
          claims.forEach((claim) => {
            claim.bills = billsMap[claim.claim_id] || [];
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: "Claims fetched successfully",
        data: claims || [],
      });
    } catch (err) {
      console.error("Get all claims error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET BY EMPLOYEE → GET /api/claims/employee/:employeeId
  async getByEmployee(req, res) {
    try {
      const { employeeId } = req.params;
      const sql = `
        SELECT 
          cr.*,
          ct.claim_type_name
        FROM claims_reimbursements cr
        LEFT JOIN em_claim_types ct ON cr.claimType_id = ct.claimType_id
        WHERE cr.employee_id = ?
        ORDER BY cr.claim_id DESC
      `;
      const claims = await customSelectSqlQuery2(sql, [employeeId]);

      if (Array.isArray(claims) && claims.length > 0) {
        const claimIds = claims.map((c) => c.claim_id).filter(Boolean);
        if (claimIds.length > 0) {
          const billsSql = `SELECT * FROM claims_reimbursement_bills WHERE claim_id IN (${claimIds.join(",")}) ORDER BY bill_id ASC`;
          const allBills = await customSelectSqlQuery2(billsSql);
          const billsMap = {};
          if (Array.isArray(allBills)) {
            allBills.forEach((b) => {
              if (!billsMap[b.claim_id]) billsMap[b.claim_id] = [];
              billsMap[b.claim_id].push(b);
            });
          }
          claims.forEach((claim) => {
            claim.bills = billsMap[claim.claim_id] || [];
          });
        }
      }

      return res.status(200).json({ success: true, data: claims || [] });
    } catch (err) {
      console.error("Get employee claims error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET BY ID → GET /api/claims/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const sql = `
        SELECT 
          cr.*,
          ct.claim_type_name,
          e.first_name AS employee_first_name,
          e.last_name AS employee_last_name,
          e.email AS employee_email
        FROM claims_reimbursements cr
        LEFT JOIN em_claim_types ct ON cr.claimType_id = ct.claimType_id
        LEFT JOIN em_employees e ON cr.employee_id = e.employee_id
        WHERE cr.claim_id = ?
        LIMIT 1
      `;
      const claim = await customSelectSqlQuery2(sql, [id], false);
      if (!claim) {
        return res.status(404).json({ success: false, message: "Claim not found" });
      }

      const billsSql = `SELECT * FROM claims_reimbursement_bills WHERE claim_id = ? ORDER BY bill_id ASC`;
      const bills = await customSelectSqlQuery2(billsSql, [id]);
      claim.bills = Array.isArray(bills) ? bills : [];

      return res.status(200).json({ success: true, data: claim });
    } catch (err) {
      console.error("Get claim by id error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET BY STATUS → GET /api/claims/status/:status
  async getByStatus(req, res) {
    try {
      const { status } = req.params;
      const validStatuses = ["Pending", "Under Review", "Approved", "Rejected", "Paid"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status value" });
      }

      const sql = `
        SELECT 
          cr.*,
          ct.claim_type_name
        FROM claims_reimbursements cr
        LEFT JOIN em_claim_types ct ON cr.claimType_id = ct.claimType_id
        WHERE cr.claim_status = ?
        ORDER BY cr.claim_id DESC
      `;
      const data = await customSelectSqlQuery2(sql, [status]);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // PAGINATED → GET /api/claims/paginate
  async getPaginated(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const start = (page - 1) * limit + 1;
      const end = page * limit;

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

  // UPDATE (Employee editing pending claim) → PUT /api/claims/:id
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
        bills: rawBills,
      } = req.body;

      const existing = await selectOneData(
        "claims_reimbursements",
        "claim_id, claim_status",
        `claim_id = ${id}`
      );
      if (!existing) {
        return res.status(404).json({ success: false, message: "Claim not found" });
      }

      if (existing.claim_status !== "Pending") {
        return res.status(400).json({
          success: false,
          message: `Cannot edit a claim that is already '${existing.claim_status}'`,
        });
      }

      const updatePayload = {};
      if (claimType_id !== undefined) updatePayload.claimType_id = claimType_id;
      if (claim_title !== undefined) updatePayload.claim_title = claim_title;
      if (claim_date !== undefined) updatePayload.claim_date = claim_date;
      if (claim_amount !== undefined) updatePayload.claim_amount = claim_amount;
      if (submit_date !== undefined) updatePayload.submit_date = submit_date;
      if (attachment_file !== undefined) updatePayload.attachment_file = attachment_file;
      if (remarks !== undefined) updatePayload.remarks = remarks;

      if (Object.keys(updatePayload).length > 0) {
        await updateData("claims_reimbursements", updatePayload, `claim_id = ${id}`);
      }

      // If bills updated
      if (rawBills) {
        let parsedBills = [];
        try {
          parsedBills = typeof rawBills === "string" ? JSON.parse(rawBills) : rawBills;
        } catch (e) {
          console.warn("Failed to parse bills:", e);
        }
        if (parsedBills.length > 0) {
          await deleteData("claims_reimbursement_bills", `claim_id = ${id}`);
          const billRows = parsedBills.map((bill) => ({
            claim_id: id,
            bill_title: bill.bill_title || claim_title || "Bill",
            bill_date: bill.bill_date || claim_date || new Date().toISOString().split("T")[0],
            bill_amount: Number(bill.bill_amount) || 0,
            bill_file: bill.bill_file || null,
          }));

          await batchInsertData(
            "claims_reimbursement_bills",
            "claim_id, bill_title, bill_date, bill_amount, bill_file",
            billRows
          );
        }
      }

      return res.status(200).json({
        success: true,
        message: "Claim updated successfully",
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // UPDATE STATUS & APPROVAL (HR/Admin) → PATCH /api/claims/:id/status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const {
        claim_status,
        approved_amount,
        admin_remarks,
        reviewed_by,
        paid_date,
      } = req.body;

      const validStatuses = ["Pending", "Under Review", "Approved", "Rejected", "Paid"];
      if (!claim_status || !validStatuses.includes(claim_status)) {
        return res.status(400).json({ success: false, message: "Invalid or missing claim_status" });
      }

      // Ensure required columns exist in claims_reimbursements table
      try {
        const cols = await customSelectSqlQuery("SHOW COLUMNS FROM claims_reimbursements");
        if (Array.isArray(cols)) {
          const colNames = cols.map((c) => (c.Field || "").toLowerCase());
          if (!colNames.includes("approved_amount")) {
            await customSelectSqlQuery("ALTER TABLE claims_reimbursements ADD COLUMN approved_amount DECIMAL(10,2) DEFAULT NULL");
          }
          if (!colNames.includes("admin_remarks")) {
            await customSelectSqlQuery("ALTER TABLE claims_reimbursements ADD COLUMN admin_remarks TEXT DEFAULT NULL");
          }
          if (!colNames.includes("reviewed_by")) {
            await customSelectSqlQuery("ALTER TABLE claims_reimbursements ADD COLUMN reviewed_by VARCHAR(255) DEFAULT NULL");
          }
          if (!colNames.includes("reviewed_at")) {
            await customSelectSqlQuery("ALTER TABLE claims_reimbursements ADD COLUMN reviewed_at DATETIME DEFAULT NULL");
          }
        }
      } catch (colErr) {
        console.warn("Column migration notice:", colErr.message);
      }

      const existingSql = `
        SELECT 
          cr.*,
          ct.claim_type_name,
          e.first_name AS employee_first_name,
          e.last_name AS employee_last_name,
          e.email AS employee_email
        FROM claims_reimbursements cr
        LEFT JOIN em_claim_types ct ON cr.claimType_id = ct.claimType_id
        LEFT JOIN em_employees e ON cr.employee_id = e.employee_id
        WHERE cr.claim_id = ?
        LIMIT 1
      `;
      const existing = await customSelectSqlQuery2(existingSql, [id], false);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Claim not found" });
      }

      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      const updatePayload = {
        claim_status,
        reviewed_at: now,
      };

      if (approved_amount !== undefined && approved_amount !== null && approved_amount !== "") {
        updatePayload.approved_amount = Number(approved_amount);
      } else if (claim_status === "Approved" && (existing.approved_amount === null || existing.approved_amount === undefined)) {
        updatePayload.approved_amount = Number(existing.claim_amount);
      }

      if (admin_remarks !== undefined) updatePayload.admin_remarks = admin_remarks;
      if (reviewed_by !== undefined) updatePayload.reviewed_by = reviewed_by;

      if (claim_status === "Paid") {
        updatePayload.paid_date = paid_date || new Date().toISOString().split("T")[0];
      }

      await updateData("claims_reimbursements", updatePayload, `claim_id = ${id}`);

      // Trigger email notification to employee asynchronously (non-blocking)
      const recipientEmail = existing.employee_email;
      const empName = `${existing.employee_first_name || ""} ${existing.employee_last_name || ""}`.trim() || "Employee";

      if (recipientEmail) {
        sendClaimStatusEmail({
          to: recipientEmail,
          employeeName: empName,
          claimId: id,
          claimTitle: existing.claim_title,
          claimType: existing.claim_type_name,
          claimedAmount: existing.claim_amount,
          approvedAmount:
            updatePayload.approved_amount !== undefined
              ? updatePayload.approved_amount
              : existing.approved_amount,
          status: claim_status,
          adminRemarks: admin_remarks || existing.admin_remarks,
          paidDate: updatePayload.paid_date || existing.paid_date,
        }).catch((mailErr) => {
          console.error("Async email dispatch notice:", mailErr);
        });
      }

      return res.status(200).json({
        success: true,
        message: `Claim status updated to '${claim_status}'`,
        data: {
          claim_id: id,
          claim_status,
          approved_amount:
            updatePayload.approved_amount !== undefined
              ? updatePayload.approved_amount
              : existing.approved_amount,
          admin_remarks: admin_remarks || existing.admin_remarks,
        },
      });
    } catch (err) {
      console.error("Update claim status error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // DELETE → DELETE /api/claims/:id
  async delete(req, res) {
    try {
      const { id } = req.params;

      const existing = await selectOneData(
        "claims_reimbursements",
        "claim_id, claim_status",
        `claim_id = ${id}`
      );
      if (!existing) {
        return res.status(404).json({ success: false, message: "Claim not found" });
      }

      if (existing.claim_status !== "Pending") {
        return res.status(400).json({
          success: false,
          message: `Cannot delete a claim with status '${existing.claim_status}'`,
        });
      }

      await deleteData("claims_reimbursement_bills", `claim_id = ${id}`);
      await deleteData("claims_reimbursements", `claim_id = ${id}`);

      return res.status(200).json({
        success: true,
        message: "Claim and associated bills deleted successfully",
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // SUMMARY STATS → GET /api/claims/summary/:employeeId
  async getSummary(req, res) {
    try {
      const { employeeId } = req.params;
      const sql = `
        SELECT
          claim_status,
          COUNT(*)               AS total_claims,
          SUM(claim_amount)      AS total_amount,
          SUM(COALESCE(approved_amount, claim_amount)) AS total_approved_amount,
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

module.exports = new ClaimsReimbursementsController();