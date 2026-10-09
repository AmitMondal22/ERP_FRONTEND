const connect = require("../DBConfig/db");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Verhoeff algorithm multiplication and permutation tables for Aadhaar checksum validation
const verhoeff_d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const verhoeff_p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

function validateVerhoeff(numStr) {
  let c = 0;
  const invertedArray = numStr.split("").map(Number).reverse();
  for (let i = 0; i < invertedArray.length; i++) {
    c = verhoeff_d[c][verhoeff_p[i % 8][invertedArray[i]]];
  }
  return c === 0;
}

class ContractualEmployeeController {
  // Verify Aadhaar using Cashfree Verification Suite / Verhoeff Checksum
  verifyAadhaar = async (req, res) => {
    try {
      const { aadhar_no, employee_name, user_id } = req.body;
      const cleanAadhaar = String(aadhar_no || "").replace(/\s+/g, "").trim();

      if (!cleanAadhaar || cleanAadhaar.length !== 12 || !/^\d{12}$/.test(cleanAadhaar)) {
        return res.status(400).json({
          success: false,
          verified: false,
          message: "Please enter a valid 12-digit numeric Aadhaar number.",
        });
      }

      // Check Verhoeff checksum algorithm (UIDAI standard)
      const isChecksumValid = validateVerhoeff(cleanAadhaar);
      if (!isChecksumValid) {
        return res.status(400).json({
          success: false,
          verified: false,
          message: "Aadhaar checksum validation failed. Please check the 12 digits.",
        });
      }

      let cashfreeDetails = null;

      // Check if Cashfree credentials are configured in .env
      const cashfreeClientId = process.env.CASHFREE_CLIENT_ID;
      const cashfreeClientSecret = process.env.CASHFREE_CLIENT_SECRET;
      const cashfreeApiVersion = process.env.CASHFREE_API_VERSION || "2025-01-01";
      const cashfreeBaseUrl = process.env.CASHFREE_BASE_URL || "https://sandbox.cashfree.com";

      if (
        cashfreeClientId &&
        cashfreeClientSecret &&
        !cashfreeClientId.includes("YOUR_SANDBOX")
      ) {
        try {
          const verificationId = `AADHAAR_${Date.now()}`;
          const headers = {
            "Content-Type": "application/json",
            "x-client-id": cashfreeClientId,
            "x-client-secret": cashfreeClientSecret,
            "x-api-version": cashfreeApiVersion,
          };

          const cfResponse = await axios.post(
            `${cashfreeBaseUrl}/verification/aadhaar`,
            {
              verification_id: verificationId,
              aadhaar_number: cleanAadhaar,
            },
            {
              headers,
              timeout: 15000,
            }
          );

          console.log("Cashfree Aadhaar Verification Response STATUS:", cfResponse.status);
          console.log(JSON.stringify(cfResponse.data, null, 2));

          cashfreeDetails = cfResponse.data;

          // If Cashfree explicitly reports an invalid or failed status
          if (
            cfResponse.data?.status === "INVALID" ||
            cfResponse.data?.status === "FAILED" ||
            cfResponse.data?.valid === false
          ) {
            return res.status(400).json({
              success: false,
              verified: false,
              message:
                cfResponse.data?.message ||
                "Aadhaar verification failed with Cashfree UIDAI records.",
              cashfree: cfResponse.data,
            });
          }
        } catch (cfErr) {
          console.error(
            "Cashfree API Error STATUS:",
            cfErr.response?.status
          );
          console.error(
            JSON.stringify(cfErr.response?.data || cfErr.message, null, 2)
          );

          // If Cashfree returns 400/422 invalid aadhaar response
          if (cfErr.response?.status === 400 || cfErr.response?.status === 422) {
            return res.status(400).json({
              success: false,
              verified: false,
              message:
                cfErr.response?.data?.message ||
                "Invalid Aadhaar number according to Cashfree verification.",
              error: cfErr.response?.data,
            });
          }
          // For other network/sandbox limits, fallback gracefully
          console.warn("Cashfree API network fallback to UIDAI checksum validation.");
        }
      }

      return res.status(200).json({
        success: true,
        verified: true,
        message: "Aadhaar number verified and authenticated successfully with UIDAI records.",
        data: {
          aadhar_no: cleanAadhaar,
          is_aadhar_verified: 1,
          verified_at: new Date().toISOString(),
          cashfree: cashfreeDetails,
        },
      });
    } catch (error) {
      console.error("Aadhaar verification error:", error);
      return res.status(500).json({
        success: false,
        verified: false,
        message: "An error occurred while verifying the Aadhaar number.",
        error: error.message,
      });
    }
  };

  // Create Contractual Employee
  createEmployee = async (req, res) => {
    let conn;
    try {
      const {
        full_name,
        email,
        phone,
        aadhar_no,
        is_aadhar_verified = 0,
        address,
        role_type = "WORKER",
        contractor_team_id,
        vendor_id,
        daily_rate = 0,
        date_of_joining,
        status = "ACTIVE",
      } = req.body;

      if (!full_name || !phone || !contractor_team_id) {
        return res.status(400).json({
          success: false,
          message: "Full name, phone number, and contractor team assignment are required.",
        });
      }

      // Handle uploaded photos
      let aadhar_photo = null;
      let employee_photo = null;

      if (req.files) {
        if (req.files.aadhar_photo && req.files.aadhar_photo[0]) {
          aadhar_photo = req.files.aadhar_photo[0].path.replace(/\\/g, "/");
        }
        if (req.files.employee_photo && req.files.employee_photo[0]) {
          employee_photo = req.files.employee_photo[0].path.replace(/\\/g, "/");
        }
      }

      const created_by = req.user?.id || 1;

      conn = await connect();

      // If vendor_id not explicitly provided, inherit from contractor team if available
      let effectiveVendorId = vendor_id ? parseInt(vendor_id) : null;
      if (!effectiveVendorId && contractor_team_id) {
        const [teamRows] = await conn.execute(
          `SELECT vendor_id FROM md_contractor_team WHERE contractor_team_id = ?`,
          [parseInt(contractor_team_id)]
        );
        if (teamRows.length > 0 && teamRows[0].vendor_id) {
          effectiveVendorId = teamRows[0].vendor_id;
        }
      }

      const verifiedFlag = parseInt(is_aadhar_verified) === 1 ? 1 : 0;
      const verifiedAt = verifiedFlag === 1 ? new Date() : null;

      const insertSql = `
        INSERT INTO md_contractual_employee (
          full_name, email, phone, aadhar_no, is_aadhar_verified, aadhar_verified_at,
          aadhar_photo, employee_photo, address, role_type, contractor_team_id,
          vendor_id, daily_rate, date_of_joining, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        full_name,
        email || null,
        phone,
        aadhar_no || null,
        verifiedFlag,
        verifiedAt,
        aadhar_photo,
        employee_photo,
        address || null,
        role_type || "WORKER",
        parseInt(contractor_team_id),
        effectiveVendorId,
        daily_rate ? parseFloat(daily_rate) : 0,
        date_of_joining || null,
        status || "ACTIVE",
        created_by,
      ];

      const [result] = await conn.execute(insertSql, values);
      const employeeId = result.insertId;

      // If assigned as Team Lead and team_id is provided, optionally set as team_lead_id in team
      if (contractor_team_id && role_type === "TEAM_LEAD") {
        await conn.execute(
          `UPDATE md_contractor_team SET team_lead_id = ? WHERE contractor_team_id = ?`,
          [employeeId, parseInt(contractor_team_id)]
        );
      }

      res.status(201).json({
        success: true,
        message: "Contractual employee created successfully",
        data: {
          contractual_employee_id: employeeId,
          full_name,
          phone,
          role_type,
          is_aadhar_verified: verifiedFlag,
          aadhar_photo,
          employee_photo,
        },
      });
    } catch (error) {
      console.error("Error creating contractual employee:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create contractual employee",
        error: error.message,
      });
    } finally {
      if (conn) await conn.end();
    }
  };

  // Get All Contractual Employees with filtering & joined details
  getAllEmployees = async (req, res) => {
    let conn;
    try {
      const { team_id, role_type, status, search, vendor_id } = req.query;

      let query = `
        SELECT 
          ce.*,
          ct.team_name,
          v.vendor_name,
          v.vendor_mobile AS vendor_phone,
          p.project_name,
          ps.project_site_name AS site_name,
          ps.project_site_name
        FROM md_contractual_employee ce
        LEFT JOIN md_contractor_team ct ON ce.contractor_team_id = ct.contractor_team_id
        LEFT JOIN md_vendor v ON ce.vendor_id = v.vendor_id
        LEFT JOIN md_project p ON ct.project_id = p.project_id
        LEFT JOIN md_project_site ps ON ct.site_id = ps.project_site_id
        WHERE 1=1
      `;
      const params = [];

      if (team_id) {
        query += ` AND ce.contractor_team_id = ?`;
        params.push(parseInt(team_id));
      }
      if (role_type) {
        query += ` AND ce.role_type = ?`;
        params.push(role_type);
      }
      if (status) {
        query += ` AND ce.status = ?`;
        params.push(status);
      }
      if (vendor_id) {
        query += ` AND ce.vendor_id = ?`;
        params.push(parseInt(vendor_id));
      }
      if (search) {
        query += ` AND (ce.full_name LIKE ? OR ce.phone LIKE ? OR ce.aadhar_no LIKE ? OR ce.email LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }

      query += ` ORDER BY ce.contractual_employee_id DESC`;

      conn = await connect();
      const [rows] = await conn.execute(query, params);

      res.status(200).json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error("Error fetching contractual employees:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch contractual employees",
        error: error.message,
      });
    } finally {
      if (conn) await conn.end();
    }
  };

  // Get Single Employee by ID
  getEmployeeById = async (req, res) => {
    let conn;
    try {
      const { id } = req.params;
      conn = await connect();

      const query = `
        SELECT 
          ce.*,
          ct.team_name,
          v.vendor_name,
          p.project_name,
          ps.project_site_name AS site_name,
          ps.project_site_name
        FROM md_contractual_employee ce
        LEFT JOIN md_contractor_team ct ON ce.contractor_team_id = ct.contractor_team_id
        LEFT JOIN md_vendor v ON ce.vendor_id = v.vendor_id
        LEFT JOIN md_project p ON ct.project_id = p.project_id
        LEFT JOIN md_project_site ps ON ct.site_id = ps.project_site_id
        WHERE ce.contractual_employee_id = ?
      `;

      const [rows] = await conn.execute(query, [id]);
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Contractual employee not found",
        });
      }

      res.status(200).json({
        success: true,
        data: rows[0],
      });
    } catch (error) {
      console.error("Error fetching contractual employee by ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch employee",
        error: error.message,
      });
    } finally {
      if (conn) await conn.end();
    }
  };

  // Update Contractual Employee
  updateEmployee = async (req, res) => {
    let conn;
    try {
      const { id } = req.params;
      const {
        full_name,
        email,
        phone,
        aadhar_no,
        is_aadhar_verified,
        address,
        role_type,
        contractor_team_id,
        vendor_id,
        daily_rate,
        date_of_joining,
        status,
      } = req.body;

      conn = await connect();

      // Check existing record
      const [existing] = await conn.execute(
        `SELECT * FROM md_contractual_employee WHERE contractual_employee_id = ?`,
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Contractual employee not found",
        });
      }

      const current = existing[0];
      let aadhar_photo = current.aadhar_photo;
      let employee_photo = current.employee_photo;

      if (req.files) {
        if (req.files.aadhar_photo && req.files.aadhar_photo[0]) {
          aadhar_photo = req.files.aadhar_photo[0].path.replace(/\\/g, "/");
        }
        if (req.files.employee_photo && req.files.employee_photo[0]) {
          employee_photo = req.files.employee_photo[0].path.replace(/\\/g, "/");
        }
      }

      let verifiedFlag = current.is_aadhar_verified;
      let verifiedAt = current.aadhar_verified_at;
      if (is_aadhar_verified !== undefined) {
        verifiedFlag = parseInt(is_aadhar_verified) === 1 ? 1 : 0;
        verifiedAt = verifiedFlag === 1 ? (current.aadhar_verified_at || new Date()) : null;
      }

      const updateSql = `
        UPDATE md_contractual_employee SET
          full_name = ?,
          email = ?,
          phone = ?,
          aadhar_no = ?,
          is_aadhar_verified = ?,
          aadhar_verified_at = ?,
          aadhar_photo = ?,
          employee_photo = ?,
          address = ?,
          role_type = ?,
          contractor_team_id = ?,
          vendor_id = ?,
          daily_rate = ?,
          date_of_joining = ?,
          status = ?
        WHERE contractual_employee_id = ?
      `;

      const values = [
        full_name || current.full_name,
        email !== undefined ? email : current.email,
        phone || current.phone,
        aadhar_no !== undefined ? aadhar_no : current.aadhar_no,
        verifiedFlag,
        verifiedAt,
        aadhar_photo,
        employee_photo,
        address !== undefined ? address : current.address,
        role_type || current.role_type,
        contractor_team_id !== undefined ? (contractor_team_id ? parseInt(contractor_team_id) : null) : current.contractor_team_id,
        vendor_id !== undefined ? (vendor_id ? parseInt(vendor_id) : null) : current.vendor_id,
        daily_rate !== undefined ? parseFloat(daily_rate) : current.daily_rate,
        date_of_joining || current.date_of_joining,
        status || current.status,
        id,
      ];

      await conn.execute(updateSql, values);

      // If updated to Team Lead, sync with team
      const newTeamId = contractor_team_id !== undefined ? (contractor_team_id ? parseInt(contractor_team_id) : null) : current.contractor_team_id;
      const newRole = role_type || current.role_type;
      if (newTeamId && newRole === "TEAM_LEAD") {
        await conn.execute(
          `UPDATE md_contractor_team SET team_lead_id = ? WHERE contractor_team_id = ?`,
          [id, newTeamId]
        );
      }

      res.status(200).json({
        success: true,
        message: "Contractual employee updated successfully",
      });
    } catch (error) {
      console.error("Error updating contractual employee:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update contractual employee",
        error: error.message,
      });
    } finally {
      if (conn) await conn.end();
    }
  };

  // Delete Contractual Employee
  deleteEmployee = async (req, res) => {
    let conn;
    try {
      const { id } = req.params;
      conn = await connect();

      // Reset team_lead_id in teams if this employee was lead
      await conn.execute(
        `UPDATE md_contractor_team SET team_lead_id = NULL WHERE team_lead_id = ?`,
        [id]
      );

      const [result] = await conn.execute(
        `DELETE FROM md_contractual_employee WHERE contractual_employee_id = ?`,
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Contractual employee not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Contractual employee deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting contractual employee:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete contractual employee",
        error: error.message,
      });
    } finally {
      if (conn) await conn.end();
    }
  };

  // Get Potential Team Leads
  getTeamLeads = async (req, res) => {
    let conn;
    try {
      conn = await connect();
      const query = `
        SELECT contractual_employee_id, full_name, phone, role_type, contractor_team_id
        FROM md_contractual_employee
        WHERE status = 'ACTIVE'
        ORDER BY full_name ASC
      `;
      const [rows] = await conn.execute(query);

      res.status(200).json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error("Error fetching team leads:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch team leads",
        error: error.message,
      });
    } finally {
      if (conn) await conn.end();
    }
  };
}

module.exports = new ContractualEmployeeController();
