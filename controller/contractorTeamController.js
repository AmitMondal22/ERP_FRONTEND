const {
  selectData,
  selectOneData,
  insertData,
  updateData,
  deleteData,
  customSelectSqlQuery2,
} = require("../models/MasterModel");

class ContractorTeamController {
  // Create Contractor Team
  createTeam = async (req, res) => {
    try {
      const {
        team_name,
        contractor_company_id,
        vendor_id,
        project_id,
        site_id,
        team_lead_id,
        date,
        remarks,
        status = "ACTIVE",
        member_ids = [],
      } = req.body;

      if (!team_name) {
        return res.status(400).json({
          success: false,
          message: "Team name is required",
        });
      }

      const created_by = req.user?.id || 1;

      const teamId = await insertData("md_contractor_team", {
        team_name,
        contractor_company_id: contractor_company_id ? parseInt(contractor_company_id) : null,
        vendor_id: vendor_id ? parseInt(vendor_id) : null,
        project_id: project_id ? parseInt(project_id) : null,
        site_id: site_id ? parseInt(site_id) : null,
        team_lead_id: team_lead_id ? parseInt(team_lead_id) : null,
        date: date || new Date().toISOString().split("T")[0],
        remarks: remarks || null,
        status: status || "ACTIVE",
        created_by,
      });

      // Assign Team Lead if provided
      if (team_lead_id) {
        await updateData(
          "md_contractual_employee",
          {
            contractor_team_id: teamId,
            role_type: "TEAM_LEAD",
          },
          `contractual_employee_id = ${parseInt(team_lead_id)}`
        );
      }

      // Assign initial members if provided
      if (Array.isArray(member_ids) && member_ids.length > 0) {
        for (const empId of member_ids) {
          await updateData(
            "md_contractual_employee",
            { contractor_team_id: teamId },
            `contractual_employee_id = ${parseInt(empId)}`
          );
        }
      }

      res.status(201).json({
        success: true,
        message: "Contractor team created successfully",
        data: {
          contractor_team_id: teamId,
          team_name,
        },
      });
    } catch (error) {
      console.error("Error creating contractor team:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create contractor team",
        error: error.message,
      });
    }
  };

  // Get All Contractor Teams
  getAllTeams = async (req, res) => {
    try {
      const { project_id, site_id, vendor_id, contractor_company_id, company_id, status } = req.query;

      let query = `
        SELECT 
          ct.*,
          COALESCE(cc.company_name, v.vendor_name) AS company_name,
          v.vendor_name,
          p.project_name,
          ps.project_site_name AS site_name,
          ps.project_site_name,
          lead.full_name AS team_lead_name,
          lead.phone AS team_lead_phone,
          lead.email AS team_lead_email,
          COUNT(ce.contractual_employee_id) AS total_members
        FROM md_contractor_team ct
        LEFT JOIN md_contractor_company cc ON ct.contractor_company_id = cc.contractor_company_id
        LEFT JOIN md_vendor v ON ct.vendor_id = v.vendor_id
        LEFT JOIN md_project p ON ct.project_id = p.project_id
        LEFT JOIN md_project_site ps ON ct.site_id = ps.project_site_id
        LEFT JOIN md_contractual_employee lead ON ct.team_lead_id = lead.contractual_employee_id
        LEFT JOIN md_contractual_employee ce ON ct.contractor_team_id = ce.contractor_team_id
        WHERE 1=1
      `;
      const params = [];

      const targetCompanyId = contractor_company_id || company_id;
      if (targetCompanyId) {
        query += ` AND ct.contractor_company_id = ?`;
        params.push(parseInt(targetCompanyId));
      }
      if (project_id) {
        query += ` AND ct.project_id = ?`;
        params.push(parseInt(project_id));
      }
      if (site_id) {
        query += ` AND ct.site_id = ?`;
        params.push(parseInt(site_id));
      }
      if (vendor_id) {
        query += ` AND ct.vendor_id = ?`;
        params.push(parseInt(vendor_id));
      }
      if (status) {
        query += ` AND ct.status = ?`;
        params.push(status);
      }

      query += ` GROUP BY ct.contractor_team_id ORDER BY ct.contractor_team_id DESC`;

      const rows = await customSelectSqlQuery2(query, params);

      res.status(200).json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error("Error fetching contractor teams:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch contractor teams",
        error: error.message,
      });
    }
  };

  // Get Team by ID with Member List
  getTeamById = async (req, res) => {
    try {
      const { id } = req.params;

      const teamQuery = `
        SELECT 
          ct.*,
          COALESCE(cc.company_name, v.vendor_name) AS company_name,
          v.vendor_name,
          p.project_name,
          ps.project_site_name AS site_name,
          ps.project_site_name,
          lead.full_name AS team_lead_name,
          lead.phone AS team_lead_phone,
          lead.email AS team_lead_email
        FROM md_contractor_team ct
        LEFT JOIN md_contractor_company cc ON ct.contractor_company_id = cc.contractor_company_id
        LEFT JOIN md_vendor v ON ct.vendor_id = v.vendor_id
        LEFT JOIN md_project p ON ct.project_id = p.project_id
        LEFT JOIN md_project_site ps ON ct.site_id = ps.project_site_id
        LEFT JOIN md_contractual_employee lead ON ct.team_lead_id = lead.contractual_employee_id
        WHERE ct.contractor_team_id = ?
      `;

      const team = await customSelectSqlQuery2(teamQuery, [id], false);
      if (!team) {
        return res.status(404).json({
          success: false,
          message: "Contractor team not found",
        });
      }

      // Fetch all member employees assigned to this team
      const memberQuery = `
        SELECT 
          contractual_employee_id,
          full_name,
          email,
          phone,
          aadhar_no,
          aadhar_photo,
          employee_photo,
          role_type,
          daily_rate,
          status,
          date_of_joining
        FROM md_contractual_employee
        WHERE contractor_team_id = ?
        ORDER BY (role_type = 'TEAM_LEAD') DESC, full_name ASC
      `;
      const members = await customSelectSqlQuery2(memberQuery, [id]);

      res.status(200).json({
        success: true,
        data: {
          ...team,
          members,
        },
      });
    } catch (error) {
      console.error("Error fetching team by ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch team details",
        error: error.message,
      });
    }
  };

  // Update Contractor Team
  updateTeam = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        team_name,
        contractor_company_id,
        vendor_id,
        project_id,
        site_id,
        team_lead_id,
        date,
        remarks,
        status,
        member_ids,
      } = req.body;

      const current = await selectOneData(
        "md_contractor_team",
        "*",
        `contractor_team_id = ${parseInt(id)}`
      );

      if (!current) {
        return res.status(404).json({
          success: false,
          message: "Contractor team not found",
        });
      }

      await updateData(
        "md_contractor_team",
        {
          team_name: team_name || current.team_name,
          contractor_company_id: contractor_company_id !== undefined ? (contractor_company_id ? parseInt(contractor_company_id) : null) : current.contractor_company_id,
          vendor_id: vendor_id !== undefined ? (vendor_id ? parseInt(vendor_id) : null) : current.vendor_id,
          project_id: project_id !== undefined ? (project_id ? parseInt(project_id) : null) : current.project_id,
          site_id: site_id !== undefined ? (site_id ? parseInt(site_id) : null) : current.site_id,
          team_lead_id: team_lead_id !== undefined ? (team_lead_id ? parseInt(team_lead_id) : null) : current.team_lead_id,
          date: date || current.date,
          remarks: remarks !== undefined ? remarks : current.remarks,
          status: status || current.status,
        },
        `contractor_team_id = ${parseInt(id)}`
      );

      // If team lead updated, update employee's team and role
      if (team_lead_id && parseInt(team_lead_id) !== current.team_lead_id) {
        await updateData(
          "md_contractual_employee",
          {
            contractor_team_id: parseInt(id),
            role_type: "TEAM_LEAD",
          },
          `contractual_employee_id = ${parseInt(team_lead_id)}`
        );
      }

      // If member_ids explicitly passed, re-sync team members
      if (Array.isArray(member_ids)) {
        // Unassign old members who were in this team
        await updateData(
          "md_contractual_employee",
          { contractor_team_id: null },
          `contractor_team_id = ${parseInt(id)}`
        );

        if (member_ids.length > 0) {
          for (const empId of member_ids) {
            await updateData(
              "md_contractual_employee",
              { contractor_team_id: parseInt(id) },
              `contractual_employee_id = ${parseInt(empId)}`
            );
          }
        }

        // Ensure team lead is also assigned to this team
        if (team_lead_id || current.team_lead_id) {
          const leadId = team_lead_id || current.team_lead_id;
          await updateData(
            "md_contractual_employee",
            {
              contractor_team_id: parseInt(id),
              role_type: "TEAM_LEAD",
            },
            `contractual_employee_id = ${parseInt(leadId)}`
          );
        }
      }

      res.status(200).json({
        success: true,
        message: "Contractor team updated successfully",
      });
    } catch (error) {
      console.error("Error updating contractor team:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update contractor team",
        error: error.message,
      });
    }
  };

  // Delete Contractor Team
  deleteTeam = async (req, res) => {
    try {
      const { id } = req.params;

      // Unassign all members from this team
      await updateData(
        "md_contractual_employee",
        { contractor_team_id: null },
        `contractor_team_id = ${parseInt(id)}`
      );

      const affected = await deleteData(
        "md_contractor_team",
        `contractor_team_id = ${parseInt(id)}`
      );

      if (affected === 0) {
        return res.status(404).json({
          success: false,
          message: "Contractor team not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Contractor team deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting contractor team:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete contractor team",
        error: error.message,
      });
    }
  };

  // Assign Members to Team
  assignMembers = async (req, res) => {
    try {
      const { id } = req.params;
      const { employee_ids, action = "ADD" } = req.body; // action: 'ADD' or 'REMOVE'

      if (!Array.isArray(employee_ids) || employee_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: "employee_ids array is required",
        });
      }

      const teamIdInt = parseInt(id);

      for (const empId of employee_ids) {
        const empIdInt = parseInt(empId);
        if (action === "ADD") {
          // Employee belongs exclusively to this one team
          await updateData(
            "md_contractual_employee",
            { contractor_team_id: teamIdInt },
            `contractual_employee_id = ${empIdInt}`
          );
        } else if (action === "REMOVE") {
          // Unassign employee from team
          await updateData(
            "md_contractual_employee",
            { contractor_team_id: null },
            `contractual_employee_id = ${empIdInt}`
          );
          // If this employee was the team lead on md_contractor_team, clear team_lead_id
          await updateData(
            "md_contractor_team",
            { team_lead_id: null },
            `contractor_team_id = ${teamIdInt} AND team_lead_id = ${empIdInt}`
          );
        }
      }

      res.status(200).json({
        success: true,
        message: `Members successfully ${action === "ADD" ? "assigned to" : "removed from"} team`,
      });
    } catch (error) {
      console.error("Error assigning members:", error);
      res.status(500).json({
        success: false,
        message: "Failed to assign members",
        error: error.message,
      });
    }
  };
}

module.exports = new ContractorTeamController();
