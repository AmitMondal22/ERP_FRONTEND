const connect = require("../DBConfig/db");

class ContractorTeamController {
  // Create Contractor Team
  createTeam = async (req, res) => {
    let conn;
    try {
      const {
        team_name,
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

      conn = await connect();
      const insertSql = `
        INSERT INTO md_contractor_team (
          team_name, vendor_id, project_id, site_id, team_lead_id,
          date, remarks, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        team_name,
        vendor_id ? parseInt(vendor_id) : null,
        project_id ? parseInt(project_id) : null,
        site_id ? parseInt(site_id) : null,
        team_lead_id ? parseInt(team_lead_id) : null,
        date || new Date().toISOString().split("T")[0],
        remarks || null,
        status || "ACTIVE",
        created_by,
      ];

      const [result] = await conn.execute(insertSql, values);
      const teamId = result.insertId;

      // Assign Team Lead if provided
      if (team_lead_id) {
        await conn.execute(
          `UPDATE md_contractual_employee SET contractor_team_id = ?, role_type = 'TEAM_LEAD' WHERE contractual_employee_id = ?`,
          [teamId, parseInt(team_lead_id)]
        );
      }

      // Assign initial members if provided
      if (Array.isArray(member_ids) && member_ids.length > 0) {
        for (const empId of member_ids) {
          await conn.execute(
            `UPDATE md_contractual_employee SET contractor_team_id = ? WHERE contractual_employee_id = ?`,
            [teamId, parseInt(empId)]
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
    } finally {
      if (conn) await conn.end();
    }
  };

  // Get All Contractor Teams
  getAllTeams = async (req, res) => {
    let conn;
    try {
      const { project_id, site_id, vendor_id, status } = req.query;

      let query = `
        SELECT 
          ct.*,
          v.vendor_name,
          p.project_name,
          ps.project_site_name AS site_name,
          ps.project_site_name,
          lead.full_name AS team_lead_name,
          lead.phone AS team_lead_phone,
          lead.email AS team_lead_email,
          COUNT(ce.contractual_employee_id) AS total_members
        FROM md_contractor_team ct
        LEFT JOIN md_vendor v ON ct.vendor_id = v.vendor_id
        LEFT JOIN md_project p ON ct.project_id = p.project_id
        LEFT JOIN md_project_site ps ON ct.site_id = ps.project_site_id
        LEFT JOIN md_contractual_employee lead ON ct.team_lead_id = lead.contractual_employee_id
        LEFT JOIN md_contractual_employee ce ON ct.contractor_team_id = ce.contractor_team_id
        WHERE 1=1
      `;
      const params = [];

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

      conn = await connect();
      const [rows] = await conn.execute(query, params);

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
    } finally {
      if (conn) await conn.end();
    }
  };

  // Get Team by ID with Member List
  getTeamById = async (req, res) => {
    let conn;
    try {
      const { id } = req.params;
      conn = await connect();

      const teamQuery = `
        SELECT 
          ct.*,
          v.vendor_name,
          p.project_name,
          ps.project_site_name AS site_name,
          ps.project_site_name,
          lead.full_name AS team_lead_name,
          lead.phone AS team_lead_phone,
          lead.email AS team_lead_email
        FROM md_contractor_team ct
        LEFT JOIN md_vendor v ON ct.vendor_id = v.vendor_id
        LEFT JOIN md_project p ON ct.project_id = p.project_id
        LEFT JOIN md_project_site ps ON ct.site_id = ps.project_site_id
        LEFT JOIN md_contractual_employee lead ON ct.team_lead_id = lead.contractual_employee_id
        WHERE ct.contractor_team_id = ?
      `;

      const [teamRows] = await conn.execute(teamQuery, [id]);
      if (teamRows.length === 0) {
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
      const [members] = await conn.execute(memberQuery, [id]);

      res.status(200).json({
        success: true,
        data: {
          ...teamRows[0],
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
    } finally {
      if (conn) await conn.end();
    }
  };

  // Update Contractor Team
  updateTeam = async (req, res) => {
    let conn;
    try {
      const { id } = req.params;
      const {
        team_name,
        vendor_id,
        project_id,
        site_id,
        team_lead_id,
        date,
        remarks,
        status,
        member_ids,
      } = req.body;

      conn = await connect();

      const [existing] = await conn.execute(
        `SELECT * FROM md_contractor_team WHERE contractor_team_id = ?`,
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Contractor team not found",
        });
      }

      const current = existing[0];

      const updateSql = `
        UPDATE md_contractor_team SET
          team_name = ?,
          vendor_id = ?,
          project_id = ?,
          site_id = ?,
          team_lead_id = ?,
          date = ?,
          remarks = ?,
          status = ?
        WHERE contractor_team_id = ?
      `;

      const values = [
        team_name || current.team_name,
        vendor_id !== undefined ? (vendor_id ? parseInt(vendor_id) : null) : current.vendor_id,
        project_id !== undefined ? (project_id ? parseInt(project_id) : null) : current.project_id,
        site_id !== undefined ? (site_id ? parseInt(site_id) : null) : current.site_id,
        team_lead_id !== undefined ? (team_lead_id ? parseInt(team_lead_id) : null) : current.team_lead_id,
        date || current.date,
        remarks !== undefined ? remarks : current.remarks,
        status || current.status,
        id,
      ];

      await conn.execute(updateSql, values);

      // If team lead updated, update employee's team and role
      if (team_lead_id && parseInt(team_lead_id) !== current.team_lead_id) {
        await conn.execute(
          `UPDATE md_contractual_employee SET contractor_team_id = ?, role_type = 'TEAM_LEAD' WHERE contractual_employee_id = ?`,
          [id, parseInt(team_lead_id)]
        );
      }

      // If member_ids explicitly passed, re-sync team members
      if (Array.isArray(member_ids)) {
        // Unassign old members who are not in new member_ids (except team lead)
        await conn.execute(
          `UPDATE md_contractual_employee SET contractor_team_id = NULL WHERE contractor_team_id = ?`,
          [id]
        );

        if (member_ids.length > 0) {
          for (const empId of member_ids) {
            await conn.execute(
              `UPDATE md_contractual_employee SET contractor_team_id = ? WHERE contractual_employee_id = ?`,
              [id, parseInt(empId)]
            );
          }
        }

        // Ensure team lead is also assigned to this team
        if (team_lead_id || current.team_lead_id) {
          const leadId = team_lead_id || current.team_lead_id;
          await conn.execute(
            `UPDATE md_contractual_employee SET contractor_team_id = ?, role_type = 'TEAM_LEAD' WHERE contractual_employee_id = ?`,
            [id, parseInt(leadId)]
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
    } finally {
      if (conn) await conn.end();
    }
  };

  // Delete Contractor Team
  deleteTeam = async (req, res) => {
    let conn;
    try {
      const { id } = req.params;
      conn = await connect();

      // Unassign all members from this team
      await conn.execute(
        `UPDATE md_contractual_employee SET contractor_team_id = NULL WHERE contractor_team_id = ?`,
        [id]
      );

      const [result] = await conn.execute(
        `DELETE FROM md_contractor_team WHERE contractor_team_id = ?`,
        [id]
      );

      if (result.affectedRows === 0) {
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
    } finally {
      if (conn) await conn.end();
    }
  };

  // Assign Members to Team
  assignMembers = async (req, res) => {
    let conn;
    try {
      const { id } = req.params;
      const { employee_ids, action = "ADD" } = req.body; // action: 'ADD' or 'REMOVE'

      if (!Array.isArray(employee_ids) || employee_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: "employee_ids array is required",
        });
      }

      conn = await connect();
      const teamIdInt = parseInt(id);

      for (const empId of employee_ids) {
        const empIdInt = parseInt(empId);
        if (action === "ADD") {
          // Employee belongs exclusively to this one team
          await conn.execute(
            `UPDATE md_contractual_employee SET contractor_team_id = ? WHERE contractual_employee_id = ?`,
            [teamIdInt, empIdInt]
          );
        } else if (action === "REMOVE") {
          // Unassign employee from team
          await conn.execute(
            `UPDATE md_contractual_employee SET contractor_team_id = NULL WHERE contractual_employee_id = ?`,
            [empIdInt]
          );
          // If this employee was the team lead on md_contractor_team, clear team_lead_id
          await conn.execute(
            `UPDATE md_contractor_team SET team_lead_id = NULL WHERE contractor_team_id = ? AND team_lead_id = ?`,
            [teamIdInt, empIdInt]
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
    } finally {
      if (conn) await conn.end();
    }
  };
}

module.exports = new ContractorTeamController();
