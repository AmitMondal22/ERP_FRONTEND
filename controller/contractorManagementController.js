const {
  selectData,
  selectOneData,
  insertData,
  batchInsertData,
  deleteData,
  updateData,
  countRows,
  customSelectSqlQuery,
  customSelectSqlQuery2,
} = require("../models/MasterModel");

class ContractorManagementController {
  // =========================================================================
  // 1. CONTRACTOR COMPANY CONTROLLERS
  // =========================================================================

  // Get all contractor companies with summary metrics
  getAllCompanies = async (req, res) => {
    try {
      const { status, search } = req.query;

      let query = `
        SELECT 
          c.*,
          COUNT(DISTINCT t.contractor_team_id) AS total_teams,
          COUNT(DISTINCT e.contractual_employee_id) AS total_employees,
          COALESCE(SUM(DISTINCT b.grand_total_cost), 0) AS total_bom_cost,
          COALESCE(SUM(DISTINCT a.net_paid_amount), 0) AS total_advance_paid,
          COALESCE(SUM(DISTINCT a.tds_amount), 0) AS total_tds_cut,
          COALESCE(SUM(DISTINCT d.deductible_penalty_amount), 0) AS total_damages
        FROM md_contractor_company c
        LEFT JOIN md_contractor_team t ON c.contractor_company_id = t.contractor_company_id
        LEFT JOIN md_contractual_employee e ON c.contractor_company_id = e.contractor_company_id
        LEFT JOIN td_contractor_team_bom_assignment b ON c.contractor_company_id = b.contractor_company_id
        LEFT JOIN td_contractor_advance_payment a ON c.contractor_company_id = a.contractor_company_id
        LEFT JOIN td_contractor_damage_penalty d ON c.contractor_company_id = d.contractor_company_id
        WHERE 1=1
      `;
      const params = [];

      if (status) {
        query += ` AND c.status = ?`;
        params.push(status);
      }
      if (search) {
        query += ` AND (c.company_name LIKE ? OR c.contact_person LIKE ? OR c.mobile LIKE ?)`;
        const wild = `%${search}%`;
        params.push(wild, wild, wild);
      }

      query += ` GROUP BY c.contractor_company_id ORDER BY c.contractor_company_id DESC`;

      const rows = await customSelectSqlQuery2(query, params);
      res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error("Error fetching contractor companies:", error);
      res.status(500).json({ success: false, message: "Failed to fetch companies", error: error.message });
    }
  };

  // Get company by ID with its teams and details
  getCompanyById = async (req, res) => {
    try {
      const { id } = req.params;

      const company = await selectOneData(
        "md_contractor_company",
        "*",
        `contractor_company_id = ${parseInt(id)}`
      );

      if (!company) {
        return res.status(404).json({ success: false, message: "Company not found" });
      }

      // Fetch teams under this company
      const teams = await customSelectSqlQuery2(`
        SELECT 
          t.*,
          p.project_name,
          ps.project_site_name,
          lead.full_name AS team_lead_name,
          COUNT(e.contractual_employee_id) AS total_members
        FROM md_contractor_team t
        LEFT JOIN md_project p ON t.project_id = p.project_id
        LEFT JOIN md_project_site ps ON t.site_id = ps.project_site_id
        LEFT JOIN md_contractual_employee lead ON t.team_lead_id = lead.contractual_employee_id
        LEFT JOIN md_contractual_employee e ON t.contractor_team_id = e.contractor_team_id
        WHERE t.contractor_company_id = ?
        GROUP BY t.contractor_team_id
        ORDER BY t.contractor_team_id DESC
      `, [id]);

      res.status(200).json({
        success: true,
        data: {
          ...company,
          teams,
        },
      });
    } catch (error) {
      console.error("Error fetching company details:", error);
      res.status(500).json({ success: false, message: "Failed to fetch company details", error: error.message });
    }
  };

  // Create contractor company
  createCompany = async (req, res) => {
    try {
      const {
        company_name,
        vendor_id,
        contact_person,
        mobile,
        email,
        address,
        city_id,
        gst_no,
        pan_no,
        bank_name,
        bank_account_no,
        bank_ifsc,
        default_tds_percent = 1.00,
        status = "ACTIVE",
        remarks,
      } = req.body;

      if (!company_name || !mobile) {
        return res.status(400).json({ success: false, message: "Company name and mobile are required" });
      }

      const created_by = req.user?.id || 5;

      const insertId = await insertData("md_contractor_company", {
        company_name,
        vendor_id: vendor_id ? parseInt(vendor_id) : null,
        contact_person: contact_person || null,
        mobile,
        email: email || null,
        address: address || null,
        city_id: city_id ? parseInt(city_id) : null,
        gst_no: gst_no || null,
        pan_no: pan_no || null,
        bank_name: bank_name || null,
        bank_account_no: bank_account_no || null,
        bank_ifsc: bank_ifsc || null,
        default_tds_percent: parseFloat(default_tds_percent) || 1.00,
        status: status || "ACTIVE",
        remarks: remarks || null,
        created_by,
      });

      res.status(201).json({
        success: true,
        message: "Contractor company created successfully",
        data: { contractor_company_id: insertId, company_name },
      });
    } catch (error) {
      console.error("Error creating contractor company:", error);
      res.status(500).json({ success: false, message: "Failed to create company", error: error.message });
    }
  };

  // Update contractor company
  updateCompany = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        company_name,
        vendor_id,
        contact_person,
        mobile,
        email,
        address,
        city_id,
        gst_no,
        pan_no,
        bank_name,
        bank_account_no,
        bank_ifsc,
        default_tds_percent,
        status,
        remarks,
      } = req.body;

      const curr = await selectOneData(
        "md_contractor_company",
        "*",
        `contractor_company_id = ${parseInt(id)}`
      );
      if (!curr) {
        return res.status(404).json({ success: false, message: "Company not found" });
      }

      await updateData(
        "md_contractor_company",
        {
          company_name: company_name || curr.company_name,
          vendor_id: vendor_id !== undefined ? (vendor_id ? parseInt(vendor_id) : null) : curr.vendor_id,
          contact_person: contact_person !== undefined ? contact_person : curr.contact_person,
          mobile: mobile || curr.mobile,
          email: email !== undefined ? email : curr.email,
          address: address !== undefined ? address : curr.address,
          city_id: city_id !== undefined ? (city_id ? parseInt(city_id) : null) : curr.city_id,
          gst_no: gst_no !== undefined ? gst_no : curr.gst_no,
          pan_no: pan_no !== undefined ? pan_no : curr.pan_no,
          bank_name: bank_name !== undefined ? bank_name : curr.bank_name,
          bank_account_no: bank_account_no !== undefined ? bank_account_no : curr.bank_account_no,
          bank_ifsc: bank_ifsc !== undefined ? bank_ifsc : curr.bank_ifsc,
          default_tds_percent: default_tds_percent !== undefined ? parseFloat(default_tds_percent) : curr.default_tds_percent,
          status: status || curr.status,
          remarks: remarks !== undefined ? remarks : curr.remarks,
        },
        `contractor_company_id = ${parseInt(id)}`
      );

      res.status(200).json({ success: true, message: "Contractor company updated successfully" });
    } catch (error) {
      console.error("Error updating contractor company:", error);
      res.status(500).json({ success: false, message: "Failed to update company", error: error.message });
    }
  };

  // Delete contractor company
  deleteCompany = async (req, res) => {
    try {
      const { id } = req.params;

      // Check if teams exist under this company
      const teamCount = await countRows("md_contractor_team", `contractor_company_id = ${parseInt(id)}`);
      if (teamCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete company with ${teamCount} active team(s). Reassign or delete teams first.`,
        });
      }

      await deleteData("md_contractor_company", `contractor_company_id = ${parseInt(id)}`);
      res.status(200).json({ success: true, message: "Company deleted successfully" });
    } catch (error) {
      console.error("Error deleting contractor company:", error);
      res.status(500).json({ success: false, message: "Failed to delete company", error: error.message });
    }
  };

  // =========================================================================
  // 2. TEAM BOM ASSIGNMENT CONTROLLERS (Quantity, Rate & Cost)
  // =========================================================================

  // Get all BOM assignments with filtering
  getAllBomAssignments = async (req, res) => {
    try {
      const { company_id, team_id, project_id, site_id, status } = req.query;

      let query = `
        SELECT 
          ba.*,
          c.company_name,
          c.vendor_id AS company_vendor_id,
          t.team_name,
          t.vendor_id AS team_vendor_id,
          p.project_name,
          ps.project_site_name
        FROM td_contractor_team_bom_assignment ba
        LEFT JOIN md_contractor_company c ON ba.contractor_company_id = c.contractor_company_id
        LEFT JOIN md_contractor_team t ON ba.contractor_team_id = t.contractor_team_id
        LEFT JOIN md_project p ON ba.project_id = p.project_id
        LEFT JOIN md_project_site ps ON ba.site_id = ps.project_site_id
        WHERE 1=1
      `;
      const params = [];

      if (company_id) {
        query += ` AND ba.contractor_company_id = ?`;
        params.push(parseInt(company_id));
      }
      if (team_id) {
        query += ` AND ba.contractor_team_id = ?`;
        params.push(parseInt(team_id));
      }
      if (project_id) {
        query += ` AND ba.project_id = ?`;
        params.push(parseInt(project_id));
      }
      if (site_id) {
        query += ` AND ba.site_id = ?`;
        params.push(parseInt(site_id));
      }
      if (status) {
        query += ` AND ba.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY ba.assignment_id DESC`;

      const rows = await customSelectSqlQuery2(query, params);

      // Fetch items for each assignment (supporting both work_description and legacy bom)
      for (const assignment of rows) {
        const items = await customSelectSqlQuery2(`
          SELECT 
            bi.*,
            bi.project_work_description_id,
            wd.work_description,
            COALESCE(wd.work_description, b.bom_name) AS work_description_name,
            b.bom_name AS bom_name,
            b.unit AS default_unit
          FROM td_contractor_team_bom_items bi
          LEFT JOIN md_project_work_description wd ON bi.project_work_description_id = wd.project_work_description_id
          LEFT JOIN md_bom b ON bi.bom_id = b.bom_id
          WHERE bi.assignment_id = ?
        `, [assignment.assignment_id]);
        assignment.items = items;
      }

      res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error("Error fetching BOM / Work Description assignments:", error);
      res.status(500).json({ success: false, message: "Failed to fetch work assignments", error: error.message });
    }
  };

  // Get single BOM / Work assignment by ID
  getBomAssignmentById = async (req, res) => {
    try {
      const { id } = req.params;

      const assignment = await customSelectSqlQuery2(`
        SELECT 
          ba.*,
          c.company_name,
          c.vendor_id AS company_vendor_id,
          t.team_name,
          t.vendor_id AS team_vendor_id,
          p.project_name,
          ps.project_site_name
        FROM td_contractor_team_bom_assignment ba
        LEFT JOIN md_contractor_company c ON ba.contractor_company_id = c.contractor_company_id
        LEFT JOIN md_contractor_team t ON ba.contractor_team_id = t.contractor_team_id
        LEFT JOIN md_project p ON ba.project_id = p.project_id
        LEFT JOIN md_project_site ps ON ba.site_id = ps.project_site_id
        WHERE ba.assignment_id = ?
      `, [id], false);

      if (!assignment) {
        return res.status(404).json({ success: false, message: "Work assignment not found" });
      }

      const items = await customSelectSqlQuery2(`
        SELECT 
          bi.*,
          bi.project_work_description_id,
          wd.work_description,
          COALESCE(wd.work_description, b.bom_name) AS work_description_name,
          b.bom_name AS bom_name,
          b.unit AS default_unit
        FROM td_contractor_team_bom_items bi
        LEFT JOIN md_project_work_description wd ON bi.project_work_description_id = wd.project_work_description_id
        LEFT JOIN md_bom b ON bi.bom_id = b.bom_id
        WHERE bi.assignment_id = ?
      `, [id]);

      res.status(200).json({
        success: true,
        data: {
          ...assignment,
          items,
        },
      });
    } catch (error) {
      console.error("Error fetching work assignment by ID:", error);
      res.status(500).json({ success: false, message: "Failed to fetch work assignment", error: error.message });
    }
  };

  // Create Team Work Description / BOM Assignment with line items
  createBomAssignment = async (req, res) => {
    try {
      const {
        contractor_company_id,
        contractor_team_id,
        project_id,
        site_id,
        assignment_date = new Date().toISOString().split("T")[0],
        target_completion_date,
        status = "ALLOCATED",
        remarks,
        items = [], // Array of { project_work_description_id, bom_id, assigned_qty, unit, unit_rate, remarks }
      } = req.body;

      if (!contractor_company_id || !contractor_team_id) {
        return res.status(400).json({
          success: false,
          message: "Contractor Company and Team are required fields",
        });
      }

      // Generate unique assignment code (WO-WD for Work Descriptions)
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const assignment_code = `WO-WD-${Date.now().toString().slice(-4)}${randNum}`;

      // Calculate totals
      let total_items = Array.isArray(items) ? items.length : 0;
      let total_assigned_qty = 0;
      let grand_total_cost = 0;

      for (const item of items) {
        const qty = parseFloat(item.assigned_qty) || 0;
        const rate = parseFloat(item.unit_rate) || 0;
        const total = qty * rate;
        total_assigned_qty += qty;
        grand_total_cost += total;
      }

      const created_by = req.user?.id || 5;

      const assignmentId = await insertData("td_contractor_team_bom_assignment", {
        assignment_code,
        contractor_company_id: parseInt(contractor_company_id),
        contractor_team_id: parseInt(contractor_team_id),
        project_id: project_id ? parseInt(project_id) : null,
        site_id: site_id ? parseInt(site_id) : null,
        assignment_date,
        target_completion_date: target_completion_date || null,
        total_work_descriptions: total_items,
        total_boms: total_items,
        total_assigned_qty,
        grand_total_cost,
        status,
        remarks: remarks || null,
        created_by,
      });

      // Insert line items
      if (Array.isArray(items) && items.length > 0) {
        const itemRows = items.map((item) => {
          const qty = parseFloat(item.assigned_qty) || 0;
          const rate = parseFloat(item.unit_rate) || 0;
          const total = qty * rate;
          const workDescId = item.project_work_description_id || item.work_description_id || null;
          const bomId = item.bom_id ? parseInt(item.bom_id) : null;

          return {
            assignment_id: assignmentId,
            project_work_description_id: workDescId ? parseInt(workDescId) : null,
            bom_id: bomId,
            assigned_qty: qty,
            unit: item.unit || null,
            unit_rate: rate,
            total_cost: total,
            remarks: item.remarks || null,
          };
        });

        await batchInsertData(
          "td_contractor_team_bom_items",
          Object.keys(itemRows[0]).join(", "),
          itemRows
        );
      }

      res.status(201).json({
        success: true,
        message: "Work Description successfully assigned to contractor team",
        data: {
          assignment_id: assignmentId,
          assignment_code,
          grand_total_cost,
          total_work_descriptions: total_items,
          total_boms: total_items,
        },
      });
    } catch (error) {
      console.error("Error assigning Work Descriptions to team:", error);
      res.status(500).json({ success: false, message: "Failed to assign work descriptions", error: error.message });
    }
  };

  // Update Team Work Description / BOM Assignment
  updateBomAssignment = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        contractor_company_id,
        contractor_team_id,
        project_id,
        site_id,
        assignment_date,
        target_completion_date,
        status,
        remarks,
        items, // Optional array to re-sync
      } = req.body;

      const curr = await selectOneData(
        "td_contractor_team_bom_assignment",
        "*",
        `assignment_id = ${parseInt(id)}`
      );
      if (!curr) {
        return res.status(404).json({ success: false, message: "Work assignment not found" });
      }

      // If items provided, recompute and update
      if (Array.isArray(items)) {
        await deleteData("td_contractor_team_bom_items", `assignment_id = ${parseInt(id)}`);

        let total_items = items.length;
        let total_assigned_qty = 0;
        let grand_total_cost = 0;

        const itemRows = items.map((item) => {
          const qty = parseFloat(item.assigned_qty) || 0;
          const rate = parseFloat(item.unit_rate) || 0;
          const total = qty * rate;
          total_assigned_qty += qty;
          grand_total_cost += total;

          const workDescId = item.project_work_description_id || item.work_description_id || null;
          const bomId = item.bom_id ? parseInt(item.bom_id) : null;

          return {
            assignment_id: parseInt(id),
            project_work_description_id: workDescId ? parseInt(workDescId) : null,
            bom_id: bomId,
            assigned_qty: qty,
            unit: item.unit || null,
            unit_rate: rate,
            total_cost: total,
            remarks: item.remarks || null,
          };
        });

        if (itemRows.length > 0) {
          await batchInsertData(
            "td_contractor_team_bom_items",
            Object.keys(itemRows[0]).join(", "),
            itemRows
          );
        }

        await updateData(
          "td_contractor_team_bom_assignment",
          {
            contractor_company_id: contractor_company_id ? parseInt(contractor_company_id) : curr.contractor_company_id,
            contractor_team_id: contractor_team_id ? parseInt(contractor_team_id) : curr.contractor_team_id,
            project_id: project_id !== undefined ? (project_id ? parseInt(project_id) : null) : curr.project_id,
            site_id: site_id !== undefined ? (site_id ? parseInt(site_id) : null) : curr.site_id,
            assignment_date: assignment_date || curr.assignment_date,
            target_completion_date: target_completion_date !== undefined ? target_completion_date : curr.target_completion_date,
            total_work_descriptions: total_items,
            total_boms: total_items,
            total_assigned_qty,
            grand_total_cost,
            status: status || curr.status,
            remarks: remarks !== undefined ? remarks : curr.remarks,
          },
          `assignment_id = ${parseInt(id)}`
        );
      } else {
        await updateData(
          "td_contractor_team_bom_assignment",
          {
            contractor_company_id: contractor_company_id ? parseInt(contractor_company_id) : curr.contractor_company_id,
            contractor_team_id: contractor_team_id ? parseInt(contractor_team_id) : curr.contractor_team_id,
            project_id: project_id !== undefined ? (project_id ? parseInt(project_id) : null) : curr.project_id,
            site_id: site_id !== undefined ? (site_id ? parseInt(site_id) : null) : curr.site_id,
            assignment_date: assignment_date || curr.assignment_date,
            status: status || curr.status,
            remarks: remarks !== undefined ? remarks : curr.remarks,
            target_completion_date: target_completion_date !== undefined ? target_completion_date : curr.target_completion_date,
          },
          `assignment_id = ${parseInt(id)}`
        );
      }

      res.status(200).json({ success: true, message: "Work assignment updated successfully" });
    } catch (error) {
      console.error("Error updating work assignment:", error);
      res.status(500).json({ success: false, message: "Failed to update work assignment", error: error.message });
    }
  };

  // Delete individual line item from a work assignment
  deleteBomAssignmentItem = async (req, res) => {
    try {
      const { assignmentId, itemId } = req.params;

      await deleteData(
        "td_contractor_team_bom_items",
        `assignment_id = ${parseInt(assignmentId)} AND assignment_item_id = ${parseInt(itemId)}`
      );

      // Recalculate remaining items and totals
      const remaining = await customSelectSqlQuery2(
        `SELECT COUNT(*) as count, COALESCE(SUM(assigned_qty), 0) as total_qty, COALESCE(SUM(total_cost), 0) as total_cost 
         FROM td_contractor_team_bom_items WHERE assignment_id = ?`,
        [assignmentId],
        false
      );

      const count = remaining?.count || 0;
      if (count === 0) {
        await deleteData("td_contractor_team_bom_assignment", `assignment_id = ${parseInt(assignmentId)}`);
      } else {
        const totalQty = parseFloat(remaining?.total_qty || 0);
        const totalCost = parseFloat(remaining?.total_cost || 0);
        await updateData(
          "td_contractor_team_bom_assignment",
          {
            total_work_descriptions: count,
            total_boms: count,
            total_assigned_qty: totalQty,
            grand_total_cost: totalCost,
          },
          `assignment_id = ${parseInt(assignmentId)}`
        );
      }

      res.status(200).json({
        success: true,
        message: "Work item removed successfully",
        data: { remainingItems: count },
      });
    } catch (error) {
      console.error("Error deleting BOM item:", error);
      res.status(500).json({ success: false, message: "Failed to delete BOM item", error: error.message });
    }
  };

  // Delete Team BOM Assignment
  deleteBomAssignment = async (req, res) => {
    try {
      const { id } = req.params;

      await deleteData("td_contractor_team_bom_items", `assignment_id = ${parseInt(id)}`);
      await deleteData("td_contractor_team_bom_assignment", `assignment_id = ${parseInt(id)}`);

      res.status(200).json({ success: true, message: "BOM assignment deleted successfully" });
    } catch (error) {
      console.error("Error deleting BOM assignment:", error);
      res.status(500).json({ success: false, message: "Failed to delete BOM assignment", error: error.message });
    }
  };

  // =========================================================================
  // 3. ADVANCE PAYMENTS & TDS TAX CUT CONTROLLERS
  // =========================================================================

  // Get all advances
  getAllAdvances = async (req, res) => {
    try {
      const { company_id, team_id, project_id, site_id, payment_status } = req.query;

      let query = `
        SELECT 
          ap.*,
          c.company_name,
          t.team_name,
          p.project_name,
          ps.project_site_name,
          ba.assignment_code
        FROM td_contractor_advance_payment ap
        LEFT JOIN md_contractor_company c ON ap.contractor_company_id = c.contractor_company_id
        LEFT JOIN md_contractor_team t ON ap.contractor_team_id = t.contractor_team_id
        LEFT JOIN md_project p ON ap.project_id = p.project_id
        LEFT JOIN md_project_site ps ON ap.site_id = ps.project_site_id
        LEFT JOIN td_contractor_team_bom_assignment ba ON ap.assignment_id = ba.assignment_id
        WHERE 1=1
      `;
      const params = [];

      if (company_id) {
        query += ` AND ap.contractor_company_id = ?`;
        params.push(parseInt(company_id));
      }
      if (team_id) {
        query += ` AND ap.contractor_team_id = ?`;
        params.push(parseInt(team_id));
      }
      if (project_id) {
        query += ` AND ap.project_id = ?`;
        params.push(parseInt(project_id));
      }
      if (site_id) {
        query += ` AND ap.site_id = ?`;
        params.push(parseInt(site_id));
      }
      if (payment_status) {
        query += ` AND ap.payment_status = ?`;
        params.push(payment_status);
      }

      query += ` ORDER BY ap.advance_id DESC`;

      const rows = await customSelectSqlQuery2(query, params);
      res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error("Error fetching advance payments:", error);
      res.status(500).json({ success: false, message: "Failed to fetch advances", error: error.message });
    }
  };

  // Create advance voucher with automatic TDS tax calculation
  createAdvancePayment = async (req, res) => {
    try {
      const {
        contractor_company_id,
        contractor_team_id,
        project_id,
        site_id,
        assignment_id,
        payment_date = new Date().toISOString().split("T")[0],
        work_description,
        gross_amount,
        tds_section = "194C",
        tds_percent = 1.00,
        other_deduction_amount = 0.00,
        payment_mode = "BANK_TRANSFER",
        transaction_reference,
        bank_name,
        payment_status = "PAID",
        receipt_attachment,
        remarks,
      } = req.body;

      if (!contractor_company_id || !contractor_team_id || !gross_amount) {
        return res.status(400).json({
          success: false,
          message: "Company, Team, and Gross Amount are required",
        });
      }

      const gross = parseFloat(gross_amount);
      const tdsRate = parseFloat(tds_percent) || 0;
      const tdsAmt = parseFloat(((gross * tdsRate) / 100).toFixed(2));
      const otherDed = parseFloat(other_deduction_amount) || 0;
      const netPaid = parseFloat((gross - tdsAmt - otherDed).toFixed(2));

      // Generate voucher number
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const payment_voucher_no = `ADV-${Date.now().toString().slice(-4)}${randNum}`;
      const created_by = req.user?.id || 5;

      const advanceId = await insertData("td_contractor_advance_payment", {
        payment_voucher_no,
        contractor_company_id: parseInt(contractor_company_id),
        contractor_team_id: parseInt(contractor_team_id),
        project_id: project_id ? parseInt(project_id) : null,
        site_id: site_id ? parseInt(site_id) : null,
        assignment_id: assignment_id ? parseInt(assignment_id) : null,
        payment_date,
        work_description: work_description || null,
        gross_amount: gross,
        tds_section,
        tds_percent: tdsRate,
        tds_amount: tdsAmt,
        other_deduction_amount: otherDed,
        net_paid_amount: netPaid,
        payment_mode,
        transaction_reference: transaction_reference || null,
        bank_name: bank_name || null,
        payment_status,
        receipt_attachment: receipt_attachment || null,
        remarks: remarks || null,
        created_by,
      });

      res.status(201).json({
        success: true,
        message: "Advance voucher recorded successfully",
        data: {
          advance_id: advanceId,
          payment_voucher_no,
          gross_amount: gross,
          tds_amount: tdsAmt,
          net_paid_amount: netPaid,
        },
      });
    } catch (error) {
      console.error("Error creating advance payment:", error);
      res.status(500).json({ success: false, message: "Failed to record advance", error: error.message });
    }
  };

  // Update advance voucher
  updateAdvancePayment = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        payment_date,
        work_description,
        gross_amount,
        tds_section,
        tds_percent,
        other_deduction_amount,
        payment_mode,
        transaction_reference,
        bank_name,
        payment_status,
        remarks,
      } = req.body;

      const curr = await selectOneData(
        "td_contractor_advance_payment",
        "*",
        `advance_id = ${parseInt(id)}`
      );
      if (!curr) {
        return res.status(404).json({ success: false, message: "Advance voucher not found" });
      }

      const gross = gross_amount !== undefined ? parseFloat(gross_amount) : parseFloat(curr.gross_amount);
      const tdsRate = tds_percent !== undefined ? parseFloat(tds_percent) : parseFloat(curr.tds_percent);
      const tdsAmt = parseFloat(((gross * tdsRate) / 100).toFixed(2));
      const otherDed = other_deduction_amount !== undefined ? parseFloat(other_deduction_amount) : parseFloat(curr.other_deduction_amount);
      const netPaid = parseFloat((gross - tdsAmt - otherDed).toFixed(2));

      await updateData(
        "td_contractor_advance_payment",
        {
          payment_date: payment_date || curr.payment_date,
          work_description: work_description !== undefined ? work_description : curr.work_description,
          gross_amount: gross,
          tds_section: tds_section || curr.tds_section,
          tds_percent: tdsRate,
          tds_amount: tdsAmt,
          other_deduction_amount: otherDed,
          net_paid_amount: netPaid,
          payment_mode: payment_mode || curr.payment_mode,
          transaction_reference: transaction_reference !== undefined ? transaction_reference : curr.transaction_reference,
          bank_name: bank_name !== undefined ? bank_name : curr.bank_name,
          payment_status: payment_status || curr.payment_status,
          remarks: remarks !== undefined ? remarks : curr.remarks,
        },
        `advance_id = ${parseInt(id)}`
      );

      res.status(200).json({ success: true, message: "Advance voucher updated successfully" });
    } catch (error) {
      console.error("Error updating advance payment:", error);
      res.status(500).json({ success: false, message: "Failed to update advance", error: error.message });
    }
  };

  // Delete advance voucher
  deleteAdvancePayment = async (req, res) => {
    try {
      const { id } = req.params;
      await deleteData("td_contractor_advance_payment", `advance_id = ${parseInt(id)}`);
      res.status(200).json({ success: true, message: "Advance voucher deleted successfully" });
    } catch (error) {
      console.error("Error deleting advance payment:", error);
      res.status(500).json({ success: false, message: "Failed to delete advance voucher", error: error.message });
    }
  };

  // =========================================================================
  // 4. MACHINERY & EQUIPMENT DAMAGE PENALTY CONTROLLERS
  // =========================================================================

  // Get all damages
  getAllDamages = async (req, res) => {
    try {
      const { company_id, team_id, project_id, site_id, recovery_status } = req.query;

      let query = `
        SELECT 
          d.*,
          c.company_name,
          t.team_name,
          p.project_name,
          ps.project_site_name,
          e.full_name AS employee_name,
          e.role_type AS employee_role
        FROM td_contractor_damage_penalty d
        LEFT JOIN md_contractor_company c ON d.contractor_company_id = c.contractor_company_id
        LEFT JOIN md_contractor_team t ON d.contractor_team_id = t.contractor_team_id
        LEFT JOIN md_project p ON d.project_id = p.project_id
        LEFT JOIN md_project_site ps ON d.site_id = ps.project_site_id
        LEFT JOIN md_contractual_employee e ON d.contractual_employee_id = e.contractual_employee_id
        WHERE 1=1
      `;
      const params = [];

      if (company_id) {
        query += ` AND d.contractor_company_id = ?`;
        params.push(parseInt(company_id));
      }
      if (team_id) {
        query += ` AND d.contractor_team_id = ?`;
        params.push(parseInt(team_id));
      }
      if (project_id) {
        query += ` AND d.project_id = ?`;
        params.push(parseInt(project_id));
      }
      if (site_id) {
        query += ` AND d.site_id = ?`;
        params.push(parseInt(site_id));
      }
      if (recovery_status) {
        query += ` AND d.recovery_status = ?`;
        params.push(recovery_status);
      }

      query += ` ORDER BY d.damage_id DESC`;

      const rows = await customSelectSqlQuery2(query, params);
      res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error("Error fetching damage records:", error);
      res.status(500).json({ success: false, message: "Failed to fetch damages", error: error.message });
    }
  };

  // Create damage incident & penalty deduction
  createDamage = async (req, res) => {
    try {
      const {
        contractor_company_id,
        contractor_team_id,
        contractual_employee_id,
        project_id,
        site_id,
        incident_date = new Date().toISOString().split("T")[0],
        item_type = "MACHINE",
        item_name,
        damage_severity = "MEDIUM",
        damage_description,
        repair_estimated_cost = 0,
        deductible_penalty_amount = 0,
        recovery_status = "PENDING",
        evidence_photo_1,
        evidence_photo_2,
        investigated_by,
        remarks,
      } = req.body;

      if (!contractor_company_id || !contractor_team_id || !item_name) {
        return res.status(400).json({
          success: false,
          message: "Contractor Company, Team, and Damaged Item Name are required",
        });
      }

      // Generate incident code
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const incident_code = `DMG-${Date.now().toString().slice(-4)}${randNum}`;
      const created_by = req.user?.id || 5;
      const finalDesc = (damage_description && damage_description.trim())
        ? damage_description.trim()
        : (remarks && remarks.trim())
          ? remarks.trim()
          : "Machinery/equipment damage incident deduction";

      const damageId = await insertData("td_contractor_damage_penalty", {
        incident_code,
        contractor_company_id: parseInt(contractor_company_id),
        contractor_team_id: parseInt(contractor_team_id),
        contractual_employee_id: contractual_employee_id ? parseInt(contractual_employee_id) : null,
        project_id: project_id ? parseInt(project_id) : null,
        site_id: site_id ? parseInt(site_id) : null,
        incident_date: incident_date || new Date().toISOString().split("T")[0],
        item_type: item_type || "MACHINE",
        item_name: item_name.trim(),
        damage_severity: damage_severity || "MEDIUM",
        damage_description: finalDesc,
        repair_estimated_cost: parseFloat(repair_estimated_cost) || 0,
        deductible_penalty_amount: parseFloat(deductible_penalty_amount) || 0,
        recovery_status: recovery_status || "PENDING",
        evidence_photo_1: evidence_photo_1 || null,
        evidence_photo_2: evidence_photo_2 || null,
        investigated_by: investigated_by || null,
        remarks: remarks || null,
        created_by,
      });

      res.status(201).json({
        success: true,
        message: "Damage incident & penalty recorded successfully",
        data: {
          damage_id: damageId,
          incident_code,
          deductible_penalty_amount,
        },
      });
    } catch (error) {
      console.error("Error creating damage penalty record:", error);
      res.status(500).json({ success: false, message: "Failed to record damage penalty", error: error.message });
    }
  };

  // Update damage incident / recovery status
  updateDamage = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        contractor_company_id,
        contractor_team_id,
        contractual_employee_id,
        project_id,
        site_id,
        incident_date,
        item_type,
        item_name,
        damage_severity,
        damage_description,
        repair_estimated_cost,
        deductible_penalty_amount,
        recovery_status,
        investigated_by,
        remarks,
      } = req.body;

      const curr = await selectOneData(
        "td_contractor_damage_penalty",
        "*",
        `damage_id = ${parseInt(id)}`
      );
      if (!curr) {
        return res.status(404).json({ success: false, message: "Damage incident not found" });
      }

      await updateData(
        "td_contractor_damage_penalty",
        {
          contractor_company_id: contractor_company_id !== undefined ? (contractor_company_id ? parseInt(contractor_company_id) : null) : curr.contractor_company_id,
          contractor_team_id: contractor_team_id !== undefined ? (contractor_team_id ? parseInt(contractor_team_id) : null) : curr.contractor_team_id,
          contractual_employee_id: contractual_employee_id !== undefined ? (contractual_employee_id ? parseInt(contractual_employee_id) : null) : curr.contractual_employee_id,
          project_id: project_id !== undefined ? (project_id ? parseInt(project_id) : null) : curr.project_id,
          site_id: site_id !== undefined ? (site_id ? parseInt(site_id) : null) : curr.site_id,
          incident_date: incident_date || curr.incident_date,
          item_type: item_type || curr.item_type,
          item_name: item_name || curr.item_name,
          damage_severity: damage_severity || curr.damage_severity,
          damage_description: damage_description !== undefined ? damage_description : curr.damage_description,
          repair_estimated_cost: repair_estimated_cost !== undefined ? parseFloat(repair_estimated_cost) : curr.repair_estimated_cost,
          deductible_penalty_amount: deductible_penalty_amount !== undefined ? parseFloat(deductible_penalty_amount) : curr.deductible_penalty_amount,
          recovery_status: recovery_status || curr.recovery_status,
          investigated_by: investigated_by !== undefined ? investigated_by : curr.investigated_by,
          remarks: remarks !== undefined ? remarks : curr.remarks,
        },
        `damage_id = ${parseInt(id)}`
      );

      res.status(200).json({ success: true, message: "Damage penalty record updated successfully" });
    } catch (error) {
      console.error("Error updating damage penalty record:", error);
      res.status(500).json({ success: false, message: "Failed to update damage record", error: error.message });
    }
  };

  // Delete damage record
  deleteDamage = async (req, res) => {
    try {
      const { id } = req.params;
      await deleteData("td_contractor_damage_penalty", `damage_id = ${parseInt(id)}`);
      res.status(200).json({ success: true, message: "Damage record deleted successfully" });
    } catch (error) {
      console.error("Error deleting damage penalty record:", error);
      res.status(500).json({ success: false, message: "Failed to delete damage record", error: error.message });
    }
  };

  // =========================================================================
  // 5. UNIFIED FINANCIAL RECONCILIATION SUMMARY (BOM vs Advance vs Damages)
  // =========================================================================

  getFinancialSummary = async (req, res) => {
    try {
      const { company_id, team_id } = req.query;

      let companyFilter = company_id ? `WHERE c.contractor_company_id = ${parseInt(company_id)}` : "";

      const query = `
        SELECT 
          c.contractor_company_id,
          c.company_name,
          c.contact_person,
          c.mobile,
          c.default_tds_percent,
          COALESCE((
            SELECT SUM(grand_total_cost) 
            FROM td_contractor_team_bom_assignment 
            WHERE contractor_company_id = c.contractor_company_id
            ${team_id ? `AND contractor_team_id = ${parseInt(team_id)}` : ""}
          ), 0) AS total_bom_work_cost,
          COALESCE((
            SELECT SUM(gross_amount) 
            FROM td_contractor_advance_payment 
            WHERE contractor_company_id = c.contractor_company_id
            ${team_id ? `AND contractor_team_id = ${parseInt(team_id)}` : ""}
          ), 0) AS total_advance_gross,
          COALESCE((
            SELECT SUM(tds_amount) 
            FROM td_contractor_advance_payment 
            WHERE contractor_company_id = c.contractor_company_id
            ${team_id ? `AND contractor_team_id = ${parseInt(team_id)}` : ""}
          ), 0) AS total_tds_cut,
          COALESCE((
            SELECT SUM(net_paid_amount) 
            FROM td_contractor_advance_payment 
            WHERE contractor_company_id = c.contractor_company_id
            ${team_id ? `AND contractor_team_id = ${parseInt(team_id)}` : ""}
          ), 0) AS total_advance_net_paid,
          COALESCE((
            SELECT SUM(deductible_penalty_amount) 
            FROM td_contractor_damage_penalty 
            WHERE contractor_company_id = c.contractor_company_id
            ${team_id ? `AND contractor_team_id = ${parseInt(team_id)}` : ""}
          ), 0) AS total_damages_deducted
        FROM md_contractor_company c
        ${companyFilter}
        ORDER BY c.company_name ASC
      `;

      const rows = await customSelectSqlQuery(query);

      // Compute balance payable for each company
      const formatted = rows.map((r) => {
        const bomCost = parseFloat(r.total_bom_work_cost) || 0;
        const advanceNet = parseFloat(r.total_advance_net_paid) || 0;
        const damagePenalty = parseFloat(r.total_damages_deducted) || 0;
        const balancePayable = bomCost - advanceNet - damagePenalty;

        return {
          ...r,
          total_bom_work_cost: bomCost,
          total_advance_gross: parseFloat(r.total_advance_gross) || 0,
          total_tds_cut: parseFloat(r.total_tds_cut) || 0,
          total_advance_net_paid: advanceNet,
          total_damages_deducted: damagePenalty,
          balance_payable: balancePayable,
        };
      });

      res.status(200).json({ success: true, data: formatted });
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      res.status(500).json({ success: false, message: "Failed to fetch financial summary", error: error.message });
    }
  };

  // =========================================================================
  // 6. DYNAMIC CONTRACTOR MEASUREMENT BILLING SHEET (Linked to DPR Work Progress)
  // =========================================================================
  getCompanyBillingMeasurementSheet = async (req, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate, team_id } = req.query;

      const company = await selectOneData(
        "md_contractor_company",
        "*",
        `contractor_company_id = ${parseInt(id)}`
      );

      if (!company) {
        return res.status(404).json({ success: false, message: "Contractor company not found" });
      }

      // 1. Fetch all teams belonging to this company
      let teamQuery = `
        SELECT t.contractor_team_id, t.team_name, t.project_id, t.site_id, p.project_name, ps.project_site_name
        FROM md_contractor_team t
        LEFT JOIN md_project p ON t.project_id = p.project_id
        LEFT JOIN md_project_site ps ON t.site_id = ps.project_site_id
        WHERE t.contractor_company_id = ?
      `;
      const teamParams = [parseInt(id)];
      if (team_id && team_id !== "ALL") {
        teamQuery += ` AND t.contractor_team_id = ?`;
        teamParams.push(parseInt(team_id));
      }
      const teams = await customSelectSqlQuery2(teamQuery, teamParams);
      const teamIds = teams.map((t) => t.contractor_team_id);

      // 2. Fetch assigned work items from td_contractor_team_bom_assignment & items
      let workItems = [];
      if (teamIds.length > 0) {
        const placeholders = teamIds.map(() => "?").join(",");
        const assignItemsQuery = `
          SELECT 
            bi.assignment_item_id,
            bi.assignment_id,
            ba.contractor_team_id,
            bi.project_work_description_id,
            bi.bom_id,
            bi.assigned_qty AS total_work_qty,
            bi.unit_rate AS rate,
            bi.unit,
            bi.total_cost,
            bi.remarks,
            ba.assignment_code,
            ba.project_id,
            ba.site_id,
            p.project_name,
            ps.project_site_name,
            t.team_name,
            wd.work_description,
            COALESCE(wd.work_description, b.bom_name, 'Contract Work Item') AS description_of_work
          FROM td_contractor_team_bom_items bi
          JOIN td_contractor_team_bom_assignment ba ON bi.assignment_id = ba.assignment_id
          LEFT JOIN md_project_work_description wd ON bi.project_work_description_id = wd.project_work_description_id
          LEFT JOIN md_bom b ON bi.bom_id = b.bom_id
          LEFT JOIN md_contractor_team t ON ba.contractor_team_id = t.contractor_team_id
          LEFT JOIN md_project p ON ba.project_id = p.project_id
          LEFT JOIN md_project_site ps ON ba.site_id = ps.project_site_id
          WHERE ba.contractor_company_id = ? AND ba.contractor_team_id IN (${placeholders})
          ORDER BY bi.assignment_item_id ASC
        `;
        const itemRows = await customSelectSqlQuery2(assignItemsQuery, [parseInt(id), ...teamIds]);

        const accountedTeamBoms = new Set();
        for (let i = 0; i < itemRows.length; i++) {
          const item = itemRows[i];
          const tId = item.contractor_team_id;

          let targetBomIds = [];
          if (item.bom_id) {
            targetBomIds.push(item.bom_id);
            accountedTeamBoms.add(`${tId}_${item.bom_id}`);
          }
          if (item.project_work_description_id) {
            const linkedBoms = await customSelectSqlQuery2(
              `SELECT bom_id FROM tx_project_details_with_estimation WHERE billing_id = ?`,
              [item.project_work_description_id]
            );
            linkedBoms.forEach((lb) => {
              if (lb.bom_id && !targetBomIds.includes(lb.bom_id)) {
                targetBomIds.push(lb.bom_id);
                accountedTeamBoms.add(`${tId}_${lb.bom_id}`);
              }
            });
          }

          let prevQty = 0;
          let currentQty = 0;

          if (targetBomIds.length > 0) {
            const bomPlaceholders = targetBomIds.map(() => "?").join(",");

            if (startDate) {
              const prevRes = await customSelectSqlQuery2(`
                SELECT COALESCE(SUM(total_progress), 0) AS prev_qty
                FROM tx_work_progress
                WHERE contractor_team_id = ? AND bom_id IN (${bomPlaceholders}) AND date < ?
              `, [tId, ...targetBomIds, startDate]);
              prevQty = parseFloat(prevRes[0]?.prev_qty || 0);

              let currSql = `
                SELECT COALESCE(SUM(total_progress), 0) AS curr_qty
                FROM tx_work_progress
                WHERE contractor_team_id = ? AND bom_id IN (${bomPlaceholders}) AND date >= ?
              `;
              const currParams = [tId, ...targetBomIds, startDate];
              if (endDate) {
                currSql += ` AND date <= ?`;
                currParams.push(endDate);
              }
              const currRes = await customSelectSqlQuery2(currSql, currParams);
              currentQty = parseFloat(currRes[0]?.curr_qty || 0);
            } else {
              let allSql = `
                SELECT COALESCE(SUM(total_progress), 0) AS curr_qty
                FROM tx_work_progress
                WHERE contractor_team_id = ? AND bom_id IN (${bomPlaceholders})
              `;
              const allParams = [tId, ...targetBomIds];
              if (endDate) {
                allSql += ` AND date <= ?`;
                allParams.push(endDate);
              }
              const allRes = await customSelectSqlQuery2(allSql, allParams);
              currentQty = parseFloat(allRes[0]?.curr_qty || 0);
              prevQty = 0;
            }
          }

          const totalWorkQty = parseFloat(item.total_work_qty || 0);
          const cumulativeWork = prevQty + currentQty;
          const balanceQty = totalWorkQty > 0 ? (totalWorkQty - cumulativeWork) : 0;
          const rate = parseFloat(item.rate || 0);
          const amount = currentQty * rate;

          workItems.push({
            id: `item-${item.assignment_item_id}`,
            sn: i + 1,
            assignment_item_id: item.assignment_item_id,
            description: item.description_of_work,
            team_name: item.team_name,
            project_name: item.project_name,
            project_site_name: item.project_site_name,
            unit: item.unit || "RMT",
            totalWorkQty,
            prevQty,
            currentQty,
            cumulativeWork,
            balanceQty,
            rate,
            amount,
            remarks: item.remarks || "",
          });
        }

        // Check for any additional BOMs executed in tx_work_progress by these teams
        const extraProgressQuery = `
          SELECT 
            wp.bom_id,
            wp.contractor_team_id,
            t.team_name,
            p.project_name,
            ps.project_site_name,
            b.bom_name
          FROM tx_work_progress wp
          LEFT JOIN md_bom b ON wp.bom_id = b.bom_id
          LEFT JOIN md_contractor_team t ON wp.contractor_team_id = t.contractor_team_id
          LEFT JOIN md_project p ON wp.project_id = p.project_id
          LEFT JOIN md_project_site ps ON wp.project_site_id = ps.project_site_id
          WHERE wp.contractor_team_id IN (${placeholders})
          GROUP BY wp.bom_id, wp.contractor_team_id
        `;
        const extraRows = await customSelectSqlQuery2(extraProgressQuery, teamIds);

        for (const er of extraRows) {
          if (!er.bom_id) continue;
          const key = `${er.contractor_team_id}_${er.bom_id}`;
          if (accountedTeamBoms.has(key)) continue;

          let prevQty = 0;
          let currentQty = 0;

          if (startDate) {
            const pRes = await customSelectSqlQuery2(`
              SELECT COALESCE(SUM(total_progress), 0) AS prev_qty
              FROM tx_work_progress
              WHERE contractor_team_id = ? AND bom_id = ? AND date < ?
            `, [er.contractor_team_id, er.bom_id, startDate]);
            prevQty = parseFloat(pRes[0]?.prev_qty || 0);

            let cSql = `
              SELECT COALESCE(SUM(total_progress), 0) AS curr_qty
              FROM tx_work_progress
              WHERE contractor_team_id = ? AND bom_id = ? AND date >= ?
            `;
            const cParams = [er.contractor_team_id, er.bom_id, startDate];
            if (endDate) {
              cSql += ` AND date <= ?`;
              cParams.push(endDate);
            }
            const cRes = await customSelectSqlQuery2(cSql, cParams);
            currentQty = parseFloat(cRes[0]?.curr_qty || 0);
          } else {
            let aSql = `
              SELECT COALESCE(SUM(total_progress), 0) AS curr_qty
              FROM tx_work_progress
              WHERE contractor_team_id = ? AND bom_id = ?
            `;
            const aParams = [er.contractor_team_id, er.bom_id];
            if (endDate) {
              aSql += ` AND date <= ?`;
              aParams.push(endDate);
            }
            const aRes = await customSelectSqlQuery2(aSql, aParams);
            currentQty = parseFloat(aRes[0]?.curr_qty || 0);
          }

          let estRate = 0;
          let estTotalQty = 0;
          let estUnit = "RMT";
          const estRow = await customSelectSqlQuery2(`
            SELECT bom_price, rep_task, bom_unit 
            FROM tx_project_details_with_estimation 
            WHERE bom_id = ? 
            ORDER BY project_estimation_id DESC LIMIT 1
          `, [er.bom_id]);
          if (estRow && estRow.length > 0) {
            estRate = parseFloat(estRow[0].bom_price || 0);
            estTotalQty = parseFloat(estRow[0].rep_task || 0);
            estUnit = estRow[0].bom_unit || "RMT";
          }

          const cumulativeWork = prevQty + currentQty;
          const totalWorkQty = estTotalQty > 0 ? estTotalQty : cumulativeWork;
          const balanceQty = totalWorkQty > 0 ? (totalWorkQty - cumulativeWork) : 0;
          const amount = currentQty * estRate;

          workItems.push({
            id: `item-progress-${er.contractor_team_id}-${er.bom_id}`,
            sn: workItems.length + 1,
            assignment_item_id: null,
            description: (er.bom_name || "Contract Work Item").toUpperCase(),
            team_name: er.team_name,
            project_name: er.project_name,
            project_site_name: er.project_site_name,
            unit: estUnit,
            totalWorkQty,
            prevQty,
            currentQty,
            cumulativeWork,
            balanceQty,
            rate: estRate,
            amount,
            remarks: "",
          });
        }
      }

      // 3. Fetch advances for this company
      let advQuery = `
        SELECT * FROM td_contractor_advance_payment 
        WHERE contractor_company_id = ?
      `;
      const advParams = [parseInt(id)];
      if (team_id && team_id !== "ALL") {
        advQuery += ` AND contractor_team_id = ?`;
        advParams.push(parseInt(team_id));
      }
      if (startDate) {
        advQuery += ` AND payment_date >= ?`;
        advParams.push(startDate);
      }
      if (endDate) {
        advQuery += ` AND payment_date <= ?`;
        advParams.push(endDate);
      }
      advQuery += ` ORDER BY payment_date ASC`;
      const advances = await customSelectSqlQuery2(advQuery, advParams);

      // 4. Fetch damages / tool penalties
      let dmgQuery = `
        SELECT * FROM td_contractor_damage_penalty
        WHERE contractor_company_id = ?
      `;
      const dmgParams = [parseInt(id)];
      if (team_id && team_id !== "ALL") {
        dmgQuery += ` AND contractor_team_id = ?`;
        dmgParams.push(parseInt(team_id));
      }
      if (startDate) {
        dmgQuery += ` AND incident_date >= ?`;
        dmgParams.push(startDate);
      }
      if (endDate) {
        dmgQuery += ` AND incident_date <= ?`;
        dmgParams.push(endDate);
      }
      dmgQuery += ` ORDER BY incident_date ASC`;
      const damages = await customSelectSqlQuery2(dmgQuery, dmgParams);

      res.status(200).json({
        success: true,
        data: {
          company,
          teams,
          workItems,
          advances,
          damages,
        },
      });
    } catch (error) {
      console.error("Error fetching contractor measurement billing sheet:", error);
      res.status(500).json({ success: false, message: "Failed to fetch measurement sheet", error: error.message });
    }
  };
}

module.exports = new ContractorManagementController();
