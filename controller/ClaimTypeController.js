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

// ============================================================
//  CLAIM TYPES CONTROLLER
// ============================================================
class ClaimTypeController {

  // GET ALL  →  GET /api/claim-types
  async getAll(req, res) {
    try {
      const data = await selectData(
        "em_claim_types",
        "*",
        null,
        "created_at DESC"
      );
      return res.status(200).json({
        success: true,
        message: "Claim types fetched successfully",
        data,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET ACTIVE ONLY  →  GET /api/claim-types/active
  async getActive(req, res) {
    try {
      const data = await selectData(
        "em_claim_types",
        "*",
        "is_active = 1",
        "claim_type_name ASC"
      );
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET BY ID  →  GET /api/claim-types/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await selectOneData(
        "em_claim_types",
        "*",
        `claimType_id = ${id}`
      );
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Claim type not found" });

      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // CREATE  →  POST /api/claim-types
  async create(req, res) {
    try {
      const { claim_type_name, max_limit_amount = null, is_active = 1 } = req.body;

      if (!claim_type_name)
        return res
          .status(400)
          .json({ success: false, message: "claim_type_name is required" });

      // duplicate check
      const exists = await selectOneData(
        "em_claim_types",
        "claimType_id",
        `claim_type_name = '${claim_type_name}'`
      );
      if (exists)
        return res
          .status(409)
          .json({ success: false, message: "Claim type already exists" });

      const insertId = await insertData("em_claim_types", {
        claim_type_name,
        max_limit_amount,
        is_active,
      });

      return res.status(201).json({
        success: true,
        message: "Claim type created successfully",
        claimType_id: insertId,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // UPDATE  →  PUT /api/claim-types/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const { claim_type_name, max_limit_amount, is_active } = req.body;

      const exists = await selectOneData(
        "em_claim_types",
        "claimType_id",
        `claimType_id = ${id}`
      );
      if (!exists)
        return res
          .status(404)
          .json({ success: false, message: "Claim type not found" });

      const updatePayload = {};
      if (claim_type_name !== undefined) updatePayload.claim_type_name = claim_type_name;
      if (max_limit_amount !== undefined) updatePayload.max_limit_amount = max_limit_amount;
      if (is_active !== undefined) updatePayload.is_active = is_active;

      if (Object.keys(updatePayload).length === 0)
        return res
          .status(400)
          .json({ success: false, message: "No fields to update" });

      await updateData("em_claim_types", updatePayload, `claimType_id = ${id}`);

      return res.status(200).json({
        success: true,
        message: "Claim type updated successfully",
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // SOFT DELETE (toggle is_active)  →  PATCH /api/claim-types/:id/toggle
  async toggleActive(req, res) {
    try {
      const { id } = req.params;
      const existing = await selectOneData(
        "em_claim_types",
        "is_active",
        `claimType_id = ${id}`
      );
      if (!existing)
        return res
          .status(404)
          .json({ success: false, message: "Claim type not found" });

      const newStatus = existing.is_active ? 0 : 1;
      await updateData(
        "em_claim_types",
        { is_active: newStatus },
        `claimType_id = ${id}`
      );

      return res.status(200).json({
        success: true,
        message: `Claim type ${newStatus ? "activated" : "deactivated"} successfully`,
        is_active: newStatus,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // HARD DELETE  →  DELETE /api/claim-types/:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      const exists = await selectOneData(
        "em_claim_types",
        "claimType_id",
        `claimType_id = ${id}`
      );
      if (!exists)
        return res
          .status(404)
          .json({ success: false, message: "Claim type not found" });

      await deleteData("em_claim_types", `claimType_id = ${id}`);
      return res.status(200).json({
        success: true,
        message: "Claim type deleted successfully",
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new ClaimTypeController();
  
 