// const {
//   selectData,
//   selectOneData,
//   insertData,
//   updateData,
//   deleteData,
//   countRows,
//   customSelectSqlQuery2,
// } = require("../models/MasterModel");

// class ClientController {



//  // ================================================================
//   // CREATE CLIENT (md_client + md_client_details in one call)
//   // ================================================================
//   async createClient(req, res) {
//     try {
//       const {
//         // md_client fields
//         client_name, client_type, industry_type,
//         client_mobile, client_phone, client_email, client_website,
//         client_address, city_id, state_id, country_id, pincode,
//         client_gst_in, client_pan, client_tan, client_cin, msme_number,
//         client_status, client_category, is_verified, remarks, created_by,

//         // md_client_details fields
//         credit_limit, credit_days, currency_id, payment_terms,
//         bank_name, bank_account_number, bank_ifsc_code, bank_branch,
//         contact_person_name, contact_person_mobile,
//         contact_person_email, contact_person_designation,
//       } = req.body;

//       // Validation
//       if (!client_name) {
//         return res.status(400).json({ success: false, message: "client_name is required" });
//       }

//       // ── Step 1: Insert into md_client ──
//       const clientData = {
//         ...(client_name        && { client_name }),
//         ...(client_type        && { client_type }),
//         ...(industry_type      && { industry_type }),
//         ...(client_mobile      && { client_mobile }),
//         ...(client_phone       && { client_phone }),
//         ...(client_email       && { client_email }),
//         ...(client_website     && { client_website }),
//         ...(client_address     && { client_address }),
//         ...(city_id            && { city_id }),
//         ...(state_id           && { state_id }),
//         ...(country_id         && { country_id }),
//         ...(pincode            && { pincode }),
//         ...(client_gst_in      && { client_gst_in }),
//         ...(client_pan         && { client_pan }),
//         ...(client_tan         && { client_tan }),
//         ...(client_cin         && { client_cin }),
//         ...(msme_number        && { msme_number }),
//         ...(client_status      && { client_status }),
//         ...(client_category    && { client_category }),
//         is_verified: is_verified ?? 0,
//         ...(remarks            && { remarks }),
//         ...(created_by         && { created_by }),
//       };

//       const client_id = await insertData("md_client", clientData);

//       // ── Step 2: Insert into md_client_details ──
//       const detailData = {
//         client_id,
//         credit_limit:               credit_limit               ?? 0,
//         credit_days:                credit_days                ?? 0,
//         ...(currency_id             && { currency_id }),
//         ...(payment_terms           && { payment_terms }),
//         ...(bank_name               && { bank_name }),
//         ...(bank_account_number     && { bank_account_number }),
//         ...(bank_ifsc_code          && { bank_ifsc_code }),
//         ...(bank_branch             && { bank_branch }),
//         ...(contact_person_name     && { contact_person_name }),
//         ...(contact_person_mobile   && { contact_person_mobile }),
//         ...(contact_person_email    && { contact_person_email }),
//         ...(contact_person_designation && { contact_person_designation }),
//         ...(created_by              && { created_by }),
//       };

//       await insertData("md_client_details", detailData);

//       return res.status(201).json({
//         success: true,
//         message: "Client created successfully",
//         data: { client_id },
//       });
//     } catch (err) {
//       console.error("createClient error:", err);
//       return res.status(500).json({ success: false, message: "Internal server error" });
//     }
//   }


//   // ================================================================
//   // GET ALL CLIENTS (with details joined)
//   // ================================================================
//   async getAllClients(req, res) {
//     try {
//       const sql = `
//         SELECT 
//           c.client_id, c.client_code, c.client_name, c.client_type,
//           c.industry_type, c.client_mobile, c.client_phone,
//           c.client_email, c.client_website, c.client_address,
//           c.city_id, c.state_id, c.country_id, c.pincode,
//           c.client_gst_in, c.client_pan, c.client_tan,
//           c.client_cin, c.msme_number, c.client_status,
//           c.client_category, c.is_verified, c.remarks,
//           c.created_at, c.updated_at,
//           cd.client_detail_id, cd.credit_limit, cd.credit_days,
//           cd.currency_id, cd.payment_terms, cd.bank_name,
//           cd.bank_account_number, cd.bank_ifsc_code, cd.bank_branch,
//           cd.contact_person_name, cd.contact_person_mobile,
//           cd.contact_person_email, cd.contact_person_designation
//         FROM md_client c
//         LEFT JOIN md_client_details cd ON c.client_id = cd.client_id
//         ORDER BY c.created_at DESC
//       `;
//       const data = await customSelectSqlQuery2(sql);
//       return res.status(200).json({ success: true, data });
//     } catch (err) {
//       console.error("getAllClients error:", err);
//       return res.status(500).json({ success: false, message: "Internal server error" });
//     }
//   }

//   // ================================================================
//   // GET CLIENT BY ID
//   // ================================================================
//   async getClientById(req, res) {
//     try {
//       const { id } = req.params;
//       const sql = `
//         SELECT 
//           c.*, 
//           cd.client_detail_id, cd.credit_limit, cd.credit_days,
//           cd.currency_id, cd.payment_terms, cd.bank_name,
//           cd.bank_account_number, cd.bank_ifsc_code, cd.bank_branch,
//           cd.contact_person_name, cd.contact_person_mobile,
//           cd.contact_person_email, cd.contact_person_designation
//         FROM md_client c
//         LEFT JOIN md_client_details cd ON c.client_id = cd.client_id
//         WHERE c.client_id = ?
//         LIMIT 1
//       `;
//       const data = await customSelectSqlQuery2(sql, [id], false);
//       if (!data) {
//         return res.status(404).json({ success: false, message: "Client not found" });
//       }
//       return res.status(200).json({ success: true, data });
//     } catch (err) {
//       console.error("getClientById error:", err);
//       return res.status(500).json({ success: false, message: "Internal server error" });
//     }
//   }

//   // ================================================================
//   // GET CLIENTS BY STATUS
//   // ================================================================
//   async getClientsByStatus(req, res) {
//     try {
//       const { status } = req.params;
//       const validStatuses = ["Active", "Inactive", "Blacklisted", "Prospect"];
//       if (!validStatuses.includes(status)) {
//         return res.status(400).json({ success: false, message: "Invalid status value" });
//       }
//       const data = await selectData(
//         "md_client",
//         "*",
//         `client_status = '${status}'`,
//         "client_name ASC"
//       );
//       return res.status(200).json({ success: true, data });
//     } catch (err) {
//       console.error("getClientsByStatus error:", err);
//       return res.status(500).json({ success: false, message: "Internal server error" });
//     }
//   }

 

//   // ================================================================
//   // UPDATE CLIENT
//   // ================================================================
//   async updateClient(req, res) {
//     try {
//       const { id } = req.params;

//       const {
//         // md_client fields
//         client_name, client_type, industry_type,
//         client_mobile, client_phone, client_email, client_website,
//         client_address, city_id, state_id, country_id, pincode,
//         client_gst_in, client_pan, client_tan, client_cin, msme_number,
//         client_status, client_category, is_verified, remarks, updated_by,

//         // md_client_details fields
//         credit_limit, credit_days, currency_id, payment_terms,
//         bank_name, bank_account_number, bank_ifsc_code, bank_branch,
//         contact_person_name, contact_person_mobile,
//         contact_person_email, contact_person_designation,
//       } = req.body;

//       // Check client exists
//       const existing = await selectOneData("md_client", "*", `client_id = ${id}`);
//       if (!existing) {
//         return res.status(404).json({ success: false, message: "Client not found" });
//       }

//       // ── Step 1: Update md_client ──
//       const clientUpdate = {
//         ...(client_name     !== undefined && { client_name }),
//         ...(client_type     !== undefined && { client_type }),
//         ...(industry_type   !== undefined && { industry_type }),
//         ...(client_mobile   !== undefined && { client_mobile }),
//         ...(client_phone    !== undefined && { client_phone }),
//         ...(client_email    !== undefined && { client_email }),
//         ...(client_website  !== undefined && { client_website }),
//         ...(client_address  !== undefined && { client_address }),
//         ...(city_id         !== undefined && { city_id }),
//         ...(state_id        !== undefined && { state_id }),
//         ...(country_id      !== undefined && { country_id }),
//         ...(pincode         !== undefined && { pincode }),
//         ...(client_gst_in   !== undefined && { client_gst_in }),
//         ...(client_pan      !== undefined && { client_pan }),
//         ...(client_tan      !== undefined && { client_tan }),
//         ...(client_cin      !== undefined && { client_cin }),
//         ...(msme_number     !== undefined && { msme_number }),
//         ...(client_status   !== undefined && { client_status }),
//         ...(client_category !== undefined && { client_category }),
//         ...(is_verified     !== undefined && { is_verified }),
//         ...(remarks         !== undefined && { remarks }),
//         ...(updated_by      !== undefined && { updated_by }),
//       };

//       if (Object.keys(clientUpdate).length > 0) {
//         await updateData("md_client", clientUpdate, `client_id = ${id}`);
//       }

//       // ── Step 2: Update md_client_details (upsert pattern) ──
//       const existingDetail = await selectOneData(
//         "md_client_details", "*", `client_id = ${id}`
//       );

//       const detailPayload = {
//         ...(credit_limit               !== undefined && { credit_limit }),
//         ...(credit_days                !== undefined && { credit_days }),
//         ...(currency_id                !== undefined && { currency_id }),
//         ...(payment_terms              !== undefined && { payment_terms }),
//         ...(bank_name                  !== undefined && { bank_name }),
//         ...(bank_account_number        !== undefined && { bank_account_number }),
//         ...(bank_ifsc_code             !== undefined && { bank_ifsc_code }),
//         ...(bank_branch                !== undefined && { bank_branch }),
//         ...(contact_person_name        !== undefined && { contact_person_name }),
//         ...(contact_person_mobile      !== undefined && { contact_person_mobile }),
//         ...(contact_person_email       !== undefined && { contact_person_email }),
//         ...(contact_person_designation !== undefined && { contact_person_designation }),
//         ...(updated_by                 !== undefined && { updated_by }),
//       };

//       if (Object.keys(detailPayload).length > 0) {
//         if (existingDetail) {
//           // UPDATE
//           await updateData("md_client_details", detailPayload, `client_id = ${id}`);
//         } else {
//           // INSERT (detail row missing — create it)
//           await insertData("md_client_details", { client_id: parseInt(id), ...detailPayload });
//         }
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Client updated successfully",
//       });
//     } catch (err) {
//       console.error("updateClient error:", err);
//       return res.status(500).json({ success: false, message: "Internal server error" });
//     }
//   }

//   // ================================================================
//   // UPDATE CLIENT STATUS ONLY
//   // ================================================================
//   async updateClientStatus(req, res) {
//     try {
//       const { id } = req.params;
//       const { client_status, updated_by } = req.body;

//       const validStatuses = ["Active", "Inactive", "Blacklisted", "Prospect"];
//       if (!validStatuses.includes(client_status)) {
//         return res.status(400).json({ success: false, message: "Invalid status value" });
//       }

//       const affected = await updateData(
//         "md_client",
//         { client_status, ...(updated_by && { updated_by }) },
//         `client_id = ${id}`
//       );

//       if (!affected) {
//         return res.status(404).json({ success: false, message: "Client not found" });
//       }

//       return res.status(200).json({ success: true, message: "Client status updated" });
//     } catch (err) {
//       console.error("updateClientStatus error:", err);
//       return res.status(500).json({ success: false, message: "Internal server error" });
//     }
//   }

//   // ================================================================
//   // DELETE CLIENT (cascades to md_client_details via FK)
//   // ================================================================
//   async deleteClient(req, res) {
//     try {
//       const { id } = req.params;

//       const existing = await selectOneData("md_client", "client_id", `client_id = ${id}`);
//       if (!existing) {
//         return res.status(404).json({ success: false, message: "Client not found" });
//       }

//       // FK ON DELETE CASCADE handles md_client_details automatically
//       await deleteData("md_client", `client_id = ${id}`);

//       return res.status(200).json({
//         success: true,
//         message: "Client deleted successfully",
//       });
//     } catch (err) {
//       console.error("deleteClient error:", err);
//       return res.status(500).json({ success: false, message: "Internal server error" });
//     }
//   }

//   // ================================================================
//   // GET CLIENT COUNT
//   // ================================================================
//   async getClientCount(req, res) {
//     try {
//       const total      = await countRows("md_client");
//       const active     = await countRows("md_client", "client_status = 'Active'");
//       const inactive   = await countRows("md_client", "client_status = 'Inactive'");
//       const prospect   = await countRows("md_client", "client_status = 'Prospect'");
//       const blacklisted= await countRows("md_client", "client_status = 'Blacklisted'");

//       return res.status(200).json({
//         success: true,
//         data: { total, active, inactive, prospect, blacklisted },
//       });
//     } catch (err) {
//       console.error("getClientCount error:", err);
//       return res.status(500).json({ success: false, message: "Internal server error" });
//     }
//   }
// }

// module.exports = new ClientController();





const {
  selectData,
  selectOneData,
  insertData,
  updateData,
  deleteData,
  countRows,
  customSelectSqlQuery2,
} = require("../models/MasterModel");

class ClientController {

  // ================================================================
  // CREATE CLIENT (md_client + md_client_details + contacts)
  // ================================================================
  async createClient(req, res) {
    try {
      const {
        // md_client fields
        client_name, client_type, industry_type,
        client_mobile, client_phone, client_email, client_website,
        client_address, city_id, state_id, country_id, pincode,
        client_gst_in, client_pan, client_tan, client_cin, msme_number,
        client_status, client_category, is_verified, remarks, created_by,

        // md_client_details fields (NO contact person fields here anymore)
        credit_limit, credit_days, currency_id, payment_terms,
        bank_name, bank_account_number, bank_ifsc_code, bank_branch,

        // md_client_contact_person — array of contacts (optional)
        // Expected format: [ { contact_person_name, contact_person_mobile, contact_person_email, contact_person_designation, is_primary } ]
        contact_persons,
      } = req.body;

      // ── Validation ──
      if (!client_name) {
        return res.status(400).json({ success: false, message: "client_name is required" });
      }

      // ── Step 1: Insert into md_client ──
      const clientData = {
        ...(client_name     && { client_name }),
        ...(client_type     && { client_type }),
        ...(industry_type   && { industry_type }),
        ...(client_mobile   && { client_mobile }),
        ...(client_phone    && { client_phone }),
        ...(client_email    && { client_email }),
        ...(client_website  && { client_website }),
        ...(client_address  && { client_address }),
        ...(city_id         && { city_id }),
        ...(state_id        && { state_id }),
        ...(country_id      && { country_id }),
        ...(pincode         && { pincode }),
        ...(client_gst_in   && { client_gst_in }),
        ...(client_pan      && { client_pan }),
        ...(client_tan      && { client_tan }),
        ...(client_cin      && { client_cin }),
        ...(msme_number     && { msme_number }),
        ...(client_status   && { client_status }),
        ...(client_category && { client_category }),
        is_verified: is_verified ?? 0,
        ...(remarks         && { remarks }),
        ...(created_by      && { created_by }),
      };

      const client_id = await insertData("md_client", clientData);

      // ── Step 2: Insert into md_client_details ──
      const detailData = {
        client_id,
        credit_limit:           credit_limit ?? 0,
        credit_days:            credit_days  ?? 0,
        ...(currency_id         && { currency_id }),
        ...(payment_terms       && { payment_terms }),
        ...(bank_name           && { bank_name }),
        ...(bank_account_number && { bank_account_number }),
        ...(bank_ifsc_code      && { bank_ifsc_code }),
        ...(bank_branch         && { bank_branch }),
        ...(created_by          && { created_by }),
      };

      await insertData("md_client_details", detailData);

      // ── Step 3: Insert contact persons (if provided) ──
      if (Array.isArray(contact_persons) && contact_persons.length > 0) {
        for (const cp of contact_persons) {
          if (!cp.contact_person_name) continue; // skip empty entries

          await insertData("md_client_contact_person", {
            client_id,
            contact_person_name:        cp.contact_person_name,
            ...(cp.contact_person_mobile      && { contact_person_mobile: cp.contact_person_mobile }),
            ...(cp.contact_person_email       && { contact_person_email: cp.contact_person_email }),
            ...(cp.contact_person_designation && { contact_person_designation: cp.contact_person_designation }),
            is_primary: cp.is_primary ?? 0,
            ...(created_by && { created_by }),
          });
        }
      }

      return res.status(201).json({
        success: true,
        message: "Client created successfully",
        data: { client_id },
      });
    } catch (err) {
      console.error("createClient error:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }


  // ================================================================
  // GET ALL CLIENTS (with details joined)
  // ================================================================
  async getAllClients(req, res) {
    try {
      const sql = `
        SELECT 
          c.client_id, c.client_code, c.client_name, c.client_type,
          c.industry_type, c.client_mobile, c.client_phone,
          c.client_email, c.client_website, c.client_address,
          c.city_id, c.state_id, c.country_id, c.pincode,
          c.client_gst_in, c.client_pan, c.client_tan,
          c.client_cin, c.msme_number, c.client_status,
          c.client_category, c.is_verified, c.remarks,
          c.created_at, c.updated_at,
          cd.client_detail_id, cd.credit_limit, cd.credit_days,
          cd.currency_id, cd.payment_terms, cd.bank_name,
          cd.bank_account_number, cd.bank_ifsc_code, cd.bank_branch
        FROM md_client c
        LEFT JOIN md_client_details cd ON c.client_id = cd.client_id
        ORDER BY c.created_at DESC
      `;
      const clients = await customSelectSqlQuery2(sql);

      // Fetch primary contact for each client (for list view)
      for (const client of clients) {
        const primaryContact = await selectOneData(
          "md_client_contact_person",
          "contact_id, contact_person_name, contact_person_mobile, contact_person_email, contact_person_designation",
          `client_id = ${client.client_id} AND is_primary = 1`
        );
        client.primary_contact = primaryContact || null;
      }

      return res.status(200).json({ success: true, data: clients });
    } catch (err) {
      console.error("getAllClients error:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }


  // ================================================================
  // GET CLIENT BY ID (with all contact persons)
  // ================================================================
  async getClientById(req, res) {
    try {
      const { id } = req.params;

      const sql = `
        SELECT 
          c.*, 
          cd.client_detail_id, cd.credit_limit, cd.credit_days,
          cd.currency_id, cd.payment_terms, cd.bank_name,
          cd.bank_account_number, cd.bank_ifsc_code, cd.bank_branch
        FROM md_client c
        LEFT JOIN md_client_details cd ON c.client_id = cd.client_id
        WHERE c.client_id = ?
        LIMIT 1
      `;
      const client = await customSelectSqlQuery2(sql, [id], false);

      if (!client) {
        return res.status(404).json({ success: false, message: "Client not found" });
      }

      // Attach all contact persons for this client
      const contacts = await selectData(
        "md_client_contact_person",
        "*",
        `client_id = ${id}`,
        "is_primary DESC, created_at ASC"
      );
      client.contact_persons = contacts || [];

      return res.status(200).json({ success: true, data: client });
    } catch (err) {
      console.error("getClientById error:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }


  // ================================================================
  // GET CLIENTS BY STATUS
  // ================================================================
  async getClientsByStatus(req, res) {
    try {
      const { status } = req.params;
      const validStatuses = ["Active", "Inactive", "Blacklisted", "Prospect"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status value" });
      }
      const data = await selectData(
        "md_client",
        "*",
        `client_status = '${status}'`,
        "client_name ASC"
      );
      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error("getClientsByStatus error:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }


  // ================================================================
  // UPDATE CLIENT (md_client + md_client_details only)
  // Use separate contact person endpoints to manage contacts
  // ================================================================
  // async updateClient(req, res) {
  //   try {
  //     const { id } = req.params;

  //     const {
  //       // md_client fields
  //       client_name, client_type, industry_type,
  //       client_mobile, client_phone, client_email, client_website,
  //       client_address, city_id, state_id, country_id, pincode,
  //       client_gst_in, client_pan, client_tan, client_cin, msme_number,
  //       client_status, client_category, is_verified, remarks, updated_by,

  //       // md_client_details fields
  //       credit_limit, credit_days, currency_id, payment_terms,
  //       bank_name, bank_account_number, bank_ifsc_code, bank_branch,
  //     } = req.body;

  //     // Check client exists
  //     const existing = await selectOneData("md_client", "*", `client_id = ${id}`);
  //     if (!existing) {
  //       return res.status(404).json({ success: false, message: "Client not found" });
  //     }

  //     // ── Step 1: Update md_client ──
  //     const clientUpdate = {
  //       ...(client_name     !== undefined && { client_name }),
  //       ...(client_type     !== undefined && { client_type }),
  //       ...(industry_type   !== undefined && { industry_type }),
  //       ...(client_mobile   !== undefined && { client_mobile }),
  //       ...(client_phone    !== undefined && { client_phone }),
  //       ...(client_email    !== undefined && { client_email }),
  //       ...(client_website  !== undefined && { client_website }),
  //       ...(client_address  !== undefined && { client_address }),
  //       ...(city_id         !== undefined && { city_id }),
  //       ...(state_id        !== undefined && { state_id }),
  //       ...(country_id      !== undefined && { country_id }),
  //       ...(pincode         !== undefined && { pincode }),
  //       ...(client_gst_in   !== undefined && { client_gst_in }),
  //       ...(client_pan      !== undefined && { client_pan }),
  //       ...(client_tan      !== undefined && { client_tan }),
  //       ...(client_cin      !== undefined && { client_cin }),
  //       ...(msme_number     !== undefined && { msme_number }),
  //       ...(client_status   !== undefined && { client_status }),
  //       ...(client_category !== undefined && { client_category }),
  //       ...(is_verified     !== undefined && { is_verified }),
  //       ...(remarks         !== undefined && { remarks }),
  //       ...(updated_by      !== undefined && { updated_by }),
  //     };

  //     if (Object.keys(clientUpdate).length > 0) {
  //       await updateData("md_client", clientUpdate, `client_id = ${id}`);
  //     }

  //     // ── Step 2: Upsert md_client_details ──
  //     const existingDetail = await selectOneData(
  //       "md_client_details", "*", `client_id = ${id}`
  //     );

  //     const detailPayload = {
  //       ...(credit_limit        !== undefined && { credit_limit }),
  //       ...(credit_days         !== undefined && { credit_days }),
  //       ...(currency_id         !== undefined && { currency_id }),
  //       ...(payment_terms       !== undefined && { payment_terms }),
  //       ...(bank_name           !== undefined && { bank_name }),
  //       ...(bank_account_number !== undefined && { bank_account_number }),
  //       ...(bank_ifsc_code      !== undefined && { bank_ifsc_code }),
  //       ...(bank_branch         !== undefined && { bank_branch }),
  //       ...(updated_by          !== undefined && { updated_by }),
  //     };

  //     if (Object.keys(detailPayload).length > 0) {
  //       if (existingDetail) {
  //         await updateData("md_client_details", detailPayload, `client_id = ${id}`);
  //       } else {
  //         await insertData("md_client_details", { client_id: parseInt(id), ...detailPayload });
  //       }
  //     }

  //     return res.status(200).json({
  //       success: true,
  //       message: "Client updated successfully",
  //     });
  //   } catch (err) {
  //     console.error("updateClient error:", err);
  //     return res.status(500).json({ success: false, message: "Internal server error" });
  //   }
  // }


  async updateClient(req, res) {
    try {
      const { id } = req.params;

      const {
        // md_client fields
        client_name, client_type, industry_type,
        client_mobile, client_phone, client_email, client_website,
        client_address, city_id, state_id, country_id, pincode,
        client_gst_in, client_pan, client_tan, client_cin, msme_number,
        client_status, client_category, is_verified, remarks, updated_by,

        // md_client_details fields
        credit_limit, credit_days, currency_id, payment_terms,
        bank_name, bank_account_number, bank_ifsc_code, bank_branch,

        // contact persons
        contact_persons,
      } = req.body;

      // Check client exists
      const existing = await selectOneData("md_client", "*", `client_id = ${id}`);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Client not found" });
      }

      // ── Step 1: Update md_client ──
      const clientUpdate = {
        ...(client_name     !== undefined && { client_name }),
        ...(client_type     !== undefined && { client_type }),
        ...(industry_type   !== undefined && { industry_type }),
        ...(client_mobile   !== undefined && { client_mobile }),
        ...(client_phone    !== undefined && { client_phone }),
        ...(client_email    !== undefined && { client_email }),
        ...(client_website  !== undefined && { client_website }),
        ...(client_address  !== undefined && { client_address }),
        ...(city_id         !== undefined && { city_id }),
        ...(state_id        !== undefined && { state_id }),
        ...(country_id      !== undefined && { country_id }),
        ...(pincode         !== undefined && { pincode }),
        ...(client_gst_in   !== undefined && { client_gst_in }),
        ...(client_pan      !== undefined && { client_pan }),
        ...(client_tan      !== undefined && { client_tan }),
        ...(client_cin      !== undefined && { client_cin }),
        ...(msme_number     !== undefined && { msme_number }),
        ...(client_status   !== undefined && { client_status }),
        ...(client_category !== undefined && { client_category }),
        ...(is_verified     !== undefined && { is_verified }),
        ...(remarks         !== undefined && { remarks }),
        ...(updated_by      !== undefined && { updated_by }),
      };

      if (Object.keys(clientUpdate).length > 0) {
        await updateData("md_client", clientUpdate, `client_id = ${id}`);
      }

      // ── Step 2: Upsert md_client_details ──
      const existingDetail = await selectOneData(
        "md_client_details", "*", `client_id = ${id}`
      );

      const detailPayload = {
        ...(credit_limit        !== undefined && { credit_limit }),
        ...(credit_days         !== undefined && { credit_days }),
        ...(currency_id         !== undefined && { currency_id }),
        ...(payment_terms       !== undefined && { payment_terms }),
        ...(bank_name           !== undefined && { bank_name }),
        ...(bank_account_number !== undefined && { bank_account_number }),
        ...(bank_ifsc_code      !== undefined && { bank_ifsc_code }),
        ...(bank_branch         !== undefined && { bank_branch }),
        ...(updated_by          !== undefined && { updated_by }),
      };

      if (Object.keys(detailPayload).length > 0) {
        if (existingDetail) {
          await updateData("md_client_details", detailPayload, `client_id = ${id}`);
        } else {
          await insertData("md_client_details", { client_id: parseInt(id), ...detailPayload });
        }
      }

      // ── Step 3: Sync md_client_contact_person ──
      if (Array.isArray(contact_persons)) {

        // 3a. Separate existing (have contact_id) from new (no contact_id)
        const toUpdate = contact_persons.filter(p => p.contact_id);
        const toInsert = contact_persons.filter(p => !p.contact_id);

        // 3b. Hard delete contacts that were removed by the user
        //     (exist in DB but are not present in the incoming payload)
        const incomingIds = toUpdate.map(p => p.contact_id);

        if (incomingIds.length > 0) {
          // Delete only those NOT in the incoming list
          await deleteData(
            "md_client_contact_person",
            `client_id = ${id} AND contact_id NOT IN (${incomingIds.join(",")})`
          );
        } else {
          // No existing contacts kept — delete all for this client
          await deleteData(
            "md_client_contact_person",
            `client_id = ${id}`
          );
        }

        // 3c. Update existing contacts
        for (const person of toUpdate) {
          const personPayload = {
            ...(person.contact_person_name        !== undefined && { contact_person_name: person.contact_person_name }),
            ...(person.contact_person_mobile      !== undefined && { contact_person_mobile: person.contact_person_mobile }),
            ...(person.contact_person_email       !== undefined && { contact_person_email: person.contact_person_email }),
            ...(person.contact_person_designation !== undefined && { contact_person_designation: person.contact_person_designation }),
            ...(person.is_primary                 !== undefined && { is_primary: person.is_primary }),
            ...(updated_by                        !== undefined && { updated_by }),
          };

          if (Object.keys(personPayload).length > 0) {
            await updateData(
              "md_client_contact_person",
              personPayload,
              `contact_id = ${person.contact_id} AND client_id = ${id}`
            );
          }
        }

        // 3d. Insert new contacts (no contact_id in payload)
        for (const person of toInsert) {
          const newPerson = {
            client_id: parseInt(id),
            ...(person.contact_person_name        !== undefined && { contact_person_name: person.contact_person_name }),
            ...(person.contact_person_mobile      !== undefined && { contact_person_mobile: person.contact_person_mobile }),
            ...(person.contact_person_email       !== undefined && { contact_person_email: person.contact_person_email }),
            ...(person.contact_person_designation !== undefined && { contact_person_designation: person.contact_person_designation }),
            ...(person.is_primary                 !== undefined && { is_primary: person.is_primary }),
            ...(updated_by                        !== undefined && { created_by: updated_by, updated_by }),
          };
          await insertData("md_client_contact_person", newPerson);
        }
      }

      return res.status(200).json({
        success: true, 
        message: "Client updated successfully",
      });
    } catch (err) {
      console.error("updateClient error:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  // ================================================================
  // UPDATE CLIENT STATUS ONLY
  // ================================================================
  async updateClientStatus(req, res) {
    try {
      const { id } = req.params;
      const { client_status, updated_by } = req.body;

      const validStatuses = ["Active", "Inactive", "Blacklisted", "Prospect"];
      if (!validStatuses.includes(client_status)) {
        return res.status(400).json({ success: false, message: "Invalid status value" });
      }

      const affected = await updateData(
        "md_client",
        { client_status, ...(updated_by && { updated_by }) },
        `client_id = ${id}`
      );

      if (!affected) {
        return res.status(404).json({ success: false, message: "Client not found" });
      }

      return res.status(200).json({ success: true, message: "Client status updated" });
    } catch (err) {
      console.error("updateClientStatus error:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }


  // ================================================================
  // DELETE CLIENT (cascades to md_client_details + contacts via FK)
  // ================================================================
  async deleteClient(req, res) {
    try {
      const { id } = req.params;

      const existing = await selectOneData("md_client", "client_id", `client_id = ${id}`);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Client not found" });
      }

      // ON DELETE CASCADE handles md_client_details + md_client_contact_person automatically
      await deleteData("md_client", `client_id = ${id}`);

      return res.status(200).json({
        success: true,
        message: "Client deleted successfully",
      });
    } catch (err) {
      console.error("deleteClient error:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }


  // ================================================================
  // GET CLIENT COUNT
  // ================================================================
  async getClientCount(req, res) {
    try {
      const total       = await countRows("md_client");
      const active      = await countRows("md_client", "client_status = 'Active'");
      const inactive    = await countRows("md_client", "client_status = 'Inactive'");
      const prospect    = await countRows("md_client", "client_status = 'Prospect'");
      const blacklisted = await countRows("md_client", "client_status = 'Blacklisted'");

      return res.status(200).json({
        success: true,
        data: { total, active, inactive, prospect, blacklisted },
      });
    } catch (err) {
      console.error("getClientCount error:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }


  // ================================================================
  // ---- CONTACT PERSON CRUD ----------------------------------------
  // ================================================================

  // ADD CONTACT PERSON to a client
  async addContactPerson(req, res) {
    try {
      const { id } = req.params; // client_id

      const {
        contact_person_name, contact_person_mobile,
        contact_person_email, contact_person_designation,
        is_primary, created_by,
      } = req.body;

      if (!contact_person_name) {
        return res.status(400).json({ success: false, message: "contact_person_name is required" });
      }

      // Check client exists
      const client = await selectOneData("md_client", "client_id", `client_id = ${id}`);
      if (!client) {
        return res.status(404).json({ success: false, message: "Client not found" });
      }

      // If new contact is primary → unset existing primary for this client
      if (is_primary == 1 || is_primary === true) {
        await updateData(
          "md_client_contact_person",
          { is_primary: 0 },
          `client_id = ${id}`
        );
      }

      const contact_id = await insertData("md_client_contact_person", {
        client_id: parseInt(id),
        contact_person_name,
        ...(contact_person_mobile      && { contact_person_mobile }),
        ...(contact_person_email       && { contact_person_email }),
        ...(contact_person_designation && { contact_person_designation }),
        is_primary: is_primary ?? 0,
        ...(created_by && { created_by }),
      });

      return res.status(201).json({
        success: true,
        message: "Contact person added successfully",
        data: { contact_id },
      });
    } catch (err) {
      console.error("addContactPerson error:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }


  // GET ALL CONTACT PERSONS for a client
  async getContactPersons(req, res) {
    try {
      const { id } = req.params; // client_id

      const client = await selectOneData("md_client", "client_id", `client_id = ${id}`);
      if (!client) {
        return res.status(404).json({ success: false, message: "Client not found" });
      }

      const contacts = await selectData(
        "md_client_contact_person",
        "*",
        `client_id = ${id}`,
        "is_primary DESC, created_at ASC"
      );

      return res.status(200).json({ success: true, data: contacts || [] });
    } catch (err) {
      console.error("getContactPersons error:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }


  // UPDATE A SPECIFIC CONTACT PERSON
  async updateContactPerson(req, res) {
    try {
      const { id, contact_id } = req.params; // id = client_id

      const {
        contact_person_name, contact_person_mobile,
        contact_person_email, contact_person_designation,
        is_primary, updated_by,
      } = req.body;

      // Check contact exists and belongs to this client
      const existing = await selectOneData(
        "md_client_contact_person",
        "*",
        `contact_id = ${contact_id} AND client_id = ${id}`
      );
      if (!existing) {
        return res.status(404).json({ success: false, message: "Contact person not found" });
      }

      // If setting as primary → unset others for this client
      if (is_primary == 1 || is_primary === true) {
        await updateData(
          "md_client_contact_person",
          { is_primary: 0 },
          `client_id = ${id} AND contact_id != ${contact_id}`
        );
      }

      const updatePayload = {
        ...(contact_person_name        !== undefined && { contact_person_name }),
        ...(contact_person_mobile      !== undefined && { contact_person_mobile }),
        ...(contact_person_email       !== undefined && { contact_person_email }),
        ...(contact_person_designation !== undefined && { contact_person_designation }),
        ...(is_primary                 !== undefined && { is_primary }),
        ...(updated_by                 !== undefined && { updated_by }),
      };

      if (Object.keys(updatePayload).length === 0) {
        return res.status(400).json({ success: false, message: "No fields to update" });
      }

      await updateData(
        "md_client_contact_person",
        updatePayload,
        `contact_id = ${contact_id} AND client_id = ${id}`
      );

      return res.status(200).json({ success: true, message: "Contact person updated successfully" });
    } catch (err) {
      console.error("updateContactPerson error:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }


  // DELETE A SPECIFIC CONTACT PERSON
  async deleteContactPerson(req, res) {
    try {
      const { id, contact_id } = req.params; // id = client_id

      const existing = await selectOneData(
        "md_client_contact_person",
        "contact_id",
        `contact_id = ${contact_id} AND client_id = ${id}`
      );
      if (!existing) {
        return res.status(404).json({ success: false, message: "Contact person not found" });
      }

      await deleteData(
        "md_client_contact_person",
        `contact_id = ${contact_id} AND client_id = ${id}`
      );

      return res.status(200).json({ success: true, message: "Contact person deleted successfully" });
    } catch (err) {
      console.error("deleteContactPerson error:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }


  // SET A CONTACT PERSON AS PRIMARY
  async setPrimaryContact(req, res) {
    try {
      const { id, contact_id } = req.params; // id = client_id

      const existing = await selectOneData(
        "md_client_contact_person",
        "contact_id",
        `contact_id = ${contact_id} AND client_id = ${id}`
      );
      if (!existing) {
        return res.status(404).json({ success: false, message: "Contact person not found" });
      }

      // Unset all primaries for this client
      await updateData(
        "md_client_contact_person",
        { is_primary: 0 },
        `client_id = ${id}`
      );

      // Set the selected one as primary
      await updateData(
        "md_client_contact_person",
        { is_primary: 1 },
        `contact_id = ${contact_id} AND client_id = ${id}`
      );

      return res.status(200).json({ success: true, message: "Primary contact updated successfully" });
    } catch (err) {
      console.error("setPrimaryContact error:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
}

module.exports = new ClientController();