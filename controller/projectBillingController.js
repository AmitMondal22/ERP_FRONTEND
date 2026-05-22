// dayjs = require("dayjs");
// const utc = require("dayjs/plugin/utc");
// dayjs.extend(utc);

// const {
//   insertData,
//   updateData,
//   deleteData,
//   customSelectSqlQuery,
// } = require("../models/MasterModel");

// const table = "md_project_billing";

// class projectBillingController {

//   createBillingItem = async (req, res) => {
//   try {
//     const {
//       project_id,   
//       project_work_description,
//       hsn_code,
//       unit,
//       quantity,
//       rate,
//       amount,
//       remarks,
//     } = req.body;

//     /* -------------------- Validation -------------------- */
//     if (!project_id || !project_work_description) {
//       return res.status(400).json({
//         success: false,
//         error: {
//           code: "VALIDATION_ERROR",
//           message: "project_id and project_work_description are required",
//           fields: {
//             project_id: !project_id ? "Required" : null,
//             project_work_description: !project_work_description ? "Required" : null,
//           },
//         },
//       });
//     }

//     if (quantity !== undefined && Number(quantity) <= 0) {
//       return res.status(400).json({
//         success: false,
//         error: {
//           code: "INVALID_QUANTITY",
//           message: "Quantity must be greater than 0",
//         },
//       });
//     }

//     if (rate !== undefined && Number(rate) < 0) {
//       return res.status(400).json({
//         success: false,
//         error: {
//           code: "INVALID_RATE",
//           message: "Rate cannot be negative",
//         },
//       });
//     }

//     /* -------------------- Insert Object -------------------- */
//     const insertObj = {
//       project_id,
//       project_work_description,
//       hsn_code,
//       unit,
//       quantity,
//       rate,
//       amount,
//       remarks,
//       created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
//     };


//     if (hsn_code && hsn_code.length > 20) {
//   return res.status(400).json({
//     success: false,
//     error: {
//       code: "INVALID_HSN",
//       message: "HSN code too long",
//     },
//   });
// }
//     /* -------------------- DB Insert -------------------- */
//     const billing_id = await insertData(table, insertObj);

//     if (!billing_id) {
//       return res.status(500).json({
//         success: false,
//         error: {
//           code: "DB_INSERT_FAILED",
//           message: "Failed to create billing item",
//         },
//       });
//     }

//     /* -------------------- Success -------------------- */
//     return res.status(201).json({
//       success: true,
//       message: "Billing item created successfully",
//       data: {
//         billing_id,
//       },
//     });

//   } catch (err) {
//     console.error("❌ Create Billing Error:", {
//       message: err.message,
//       stack: err.stack,
//     });

//     /* -------------------- Unexpected Error -------------------- */
//     return res.status(500).json({
//       success: false,
//       error: {
//         code: "INTERNAL_SERVER_ERROR",
//         message: "Something went wrong while creating billing item",
//       },
//     });
//   }
// };
//   // -------------------------------------------------------------
//   // 2️⃣ GET ALL BILLING ITEMS BY PROJECT
//   // -------------------------------------------------------------
//   getBillingItemsByProjectId = async (req, res) => {
//     try {
//       const { id } = req.params;
//       const project_id = Number(id);

//       if (!project_id || isNaN(project_id)) {
//         return res.status(400).json({
//           success: false,
//           message: "Valid project_id is required",
//         });
//       }

//       // const sql = `
//       //   SELECT 
//       //     billing_id,
//       //     project_id,
//       //     project_work_description,
//       //     unit,
//       //     quantity,
//       //     rate,
//       //     amount,
//       //     remarks,
//       //     hsn_code,
//       //     created_at
//       //   FROM md_project_billing
//       //   WHERE project_id = ${project_id}
//       //   ORDER BY billing_id DESC
//       // `;



//       const sql =`SELECT 
//   pb.billing_id,
//   pb.project_id,
//   pb.project_work_description,
//   pb.unit,
//   pb.quantity,
//   pb.rate,
//   pb.amount,
//   pb.remarks,
//   pb.hsn_code,
//   pb.created_at,

//   pr.project_name,

//   -- ✅ only required client fields
//   cl.client_id,
//   cl.client_name,
//   cl.client_type,
//   cl.client_mobile,
//   cl.client_phone,
//   cl.client_email

// FROM md_project_billing pb

// LEFT JOIN md_project pr
//   ON pb.project_id = pr.project_id

// LEFT JOIN md_client cl
//   ON pr.client_id = cl.client_id

// WHERE pb.project_id = ${project_id}

// ORDER BY pb.billing_id DESC`





//       const rows = await customSelectSqlQuery(sql, true);

//       return res.status(200).json({
//         success: true,
//         data: rows,
//       });

//     } catch (err) {
//       console.error("❌ Billing Fetch Error:", err);
//       return res.status(500).json({
//         success: false,
//         message: "Error fetching billing items",
//       });
//     }
//   };

//   // -------------------------------------------------------------
//   // 3 GET SINGLE BILLING ITEM
//   // -------------------------------------------------------------
//   getBillingItemById = async (req, res) => {
//     try {
//       const { id } = req.params;

//       const sql = `
//         SELECT *
//         FROM md_project_billing
//         WHERE billing_id = ${id}
//         LIMIT 1
//       `;

//       const row = await customSelectSqlQuery(sql, false);

//       if (!row) {
//         return res.status(404).json({
//           success: false,
//           message: "Billing item not found",
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         data: row,
//       });

//     } catch (err) {
//       console.error(" Get Billing Error:", err);
//       return res.status(500).json({
//         success: false,
//         message: "Error fetching billing item",
//       });
//     }
//   };




// updateBillingItem = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const {
//       project_id,
//       project_work_description,
//       unit,
//       quantity,
//       rate,
//       amount,
//       hsn_code,
//       remarks,
//     } = req.body;

//     if (!project_id || !project_work_description) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id & project_work_description are required",
//       });
//     }

//     //  validate id from params
//     if (!id || id === 'undefined' || isNaN(Number(id))) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid billing_id provided",
//       });
//     }

//     const setObj = {
//       project_id,
//       project_work_description,
//       unit,
//       quantity,
//       rate,
//       amount,
//       remarks,
//       hsn_code,
//       updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
//     };

//     const affected = await updateData(
//       table,
//       setObj,
//       `billing_id = ${Number(id)}`
//     );

//     if (affected === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Billing item not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Billing item updated successfully",
//     });

//   } catch (err) {
//     console.error("❌ Update Billing Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Error updating billing item",
//     });
//   }
// };


 
 
//   deleteBillingItem = async (req, res) => {
//     try {
//       const { id } = req.params;

//       const affected = await deleteData(
//         table,
//         `billing_id = ${id}`
//       );

//       if (affected === 0) {
//         return res.status(404).json({
//           success: false,
//           message: "Billing item not found",
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Billing item deleted successfully",
//       });

//     } catch (err) {
//       console.error("❌ Delete Billing Error:", err);
//       return res.status(500).json({
//         success: false,
//         message: "Error deleting billing item",
//       });
//     }
//   };
// }

// module.exports = new projectBillingController();



dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const {
  insertData,
  updateData,
  deleteData,
  customSelectSqlQuery,
} = require("../models/MasterModel");

const table = "md_project_billing";

class projectBillingController {

  /* ============================================================
     1. CREATE BILLING ITEM
     ============================================================ */
  createBillingItem = async (req, res) => {
    try {
      const {
        project_id,
        project_work_description,
        hsn_code,
        unit,
        quantity,
        rate,
        base_amount,
        amount,
        remarks,
        gst_type,
        sgst_percent,
        sgst_amount,
        cgst_percent,
        cgst_amount,
        igst_percent,
        igst_amount,
      } = req.body;

      /* -------------------- Validation -------------------- */
      if (!project_id || !project_work_description) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "project_id and project_work_description are required",
            fields: {
              project_id: !project_id ? "Required" : null,
              project_work_description: !project_work_description ? "Required" : null,
            },
          },
        });
      }

      if (quantity !== undefined && Number(quantity) <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_QUANTITY",
            message: "Quantity must be greater than 0",
          },
        });
      }

      if (rate !== undefined && Number(rate) < 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_RATE",
            message: "Rate cannot be negative",
          },
        });
      }

      if (hsn_code && hsn_code.length > 20) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_HSN",
            message: "HSN code too long",
          },
        });
      }

      /* ---- GST mutual exclusion validation ---- */
      const hasIgst = igst_percent != null && Number(igst_percent) > 0;
      const hasCgstSgst =
        (cgst_percent != null && Number(cgst_percent) > 0) ||
        (sgst_percent != null && Number(sgst_percent) > 0);

      if (hasIgst && hasCgstSgst) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_GST",
            message: "Cannot use IGST together with CGST/SGST",
          },
        });
      }

      /* -------------------- Insert Object -------------------- */
      const insertObj = {
        project_id,
        project_work_description,
        hsn_code:     hsn_code     || null,
        unit,    
        quantity,
        rate,
        base_amount:  base_amount  != null ? Number(base_amount)  : null,
        amount,                         // final amount (incl. GST if any)
        gst_type:     gst_type     || "none",
        sgst_percent: sgst_percent != null ? Number(sgst_percent) : null,
        sgst_amount:  sgst_amount  != null ? Number(sgst_amount)  : null,
        cgst_percent: cgst_percent != null ? Number(cgst_percent) : null,
        cgst_amount:  cgst_amount  != null ? Number(cgst_amount)  : null,
        igst_percent: igst_percent != null ? Number(igst_percent) : null,
        igst_amount:  igst_amount  != null ? Number(igst_amount)  : null,
        created_at:   dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
        remarks:      remarks      || null,
        created_by: req.user.id,
      };

      /* -------------------- DB Insert -------------------- */
      const billing_id = await insertData(table, insertObj);

      if (!billing_id) {
        return res.status(500).json({
          success: false,
          error: {
            code: "DB_INSERT_FAILED",
            message: "Failed to create billing item",
          },
        });
      }

      /* -------------------- Success (response unchanged) -------------------- */
      return res.status(201).json({
        success: true,
        message: "Billing item created successfully",
        data: { billing_id },
      });

    } catch (err) {
      console.error("❌ Create Billing Error:", { message: err.message, stack: err.stack });
      return res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong while creating billing item",
        },
      });
    }
  };

  /* ============================================================
     2. GET ALL BILLING ITEMS BY PROJECT
        — response shape UNCHANGED, just added new columns to SELECT
     ============================================================ */
  getBillingItemsByProjectId = async (req, res) => {
    try {
      const { id } = req.params;
      const project_id = Number(id);

      if (!project_id || isNaN(project_id)) {
        return res.status(400).json({
          success: false,
          message: "Valid project_id is required",
        });
      }

      const sql = `
        SELECT
          pb.billing_id,
          pb.project_id,
          pb.project_work_description,
          pb.unit,
          pb.hsn_code,
          pb.quantity,
          pb.rate,
          pb.base_amount,
          pb.amount,
          pb.remarks,
          pb.gst_type,
          pb.sgst_percent,
          pb.sgst_amount,
          pb.cgst_percent,
          pb.cgst_amount,
          pb.igst_percent,
          pb.igst_amount,
          pb.created_at,

          pr.project_name,

          cl.client_id,
          cl.client_name,
          cl.client_type,
          cl.client_mobile,
          cl.client_phone,
          cl.client_email

        FROM md_project_billing pb

        LEFT JOIN md_project pr
          ON pb.project_id = pr.project_id

        LEFT JOIN md_client cl
          ON pr.client_id = cl.client_id

        WHERE pb.project_id = ${project_id}

        ORDER BY pb.billing_id DESC
      `;

      const rows = await customSelectSqlQuery(sql, true);

      /* ---- response shape UNCHANGED ---- */
      return res.status(200).json({
        success: true,
        data: rows,
      });

    } catch (err) {
      console.error("❌ Billing Fetch Error:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching billing items",
      });
    }
  };

  /* ============================================================
     3. GET SINGLE BILLING ITEM  — unchanged
     ============================================================ */
  getBillingItemById = async (req, res) => {
    try {
      const { id } = req.params;

      const sql = `
        SELECT *
        FROM md_project_billing
        WHERE billing_id = ${id}
        LIMIT 1
      `;

      const row = await customSelectSqlQuery(sql, false);

      if (!row) {
        return res.status(404).json({
          success: false,
          message: "Billing item not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: row,
      });

    } catch (err) {
      console.error("Get Billing Error:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching billing item",
      });
    }
  };

  /* ============================================================
     4. UPDATE BILLING ITEM
     ============================================================ */
  updateBillingItem = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || id === "undefined" || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid billing_id provided",
        });
      }

      const {
        project_id,
        project_work_description,
        unit,
        quantity,
        rate,
        base_amount,
        amount,
        hsn_code,
        remarks,
        gst_type,
        sgst_percent,
        sgst_amount,
        cgst_percent,
        cgst_amount,
        igst_percent,
        igst_amount,
      } = req.body;

      if (!project_id || !project_work_description) {
        return res.status(400).json({
          success: false,
          message: "project_id & project_work_description are required",
        });
      }

      /* ---- GST mutual exclusion validation ---- */
      const hasIgst = igst_percent != null && Number(igst_percent) > 0;
      const hasCgstSgst =
        (cgst_percent != null && Number(cgst_percent) > 0) ||
        (sgst_percent != null && Number(sgst_percent) > 0);

      if (hasIgst && hasCgstSgst) {
        return res.status(400).json({
          success: false,
          message: "Cannot use IGST together with CGST/SGST",
        });
      }

      const setObj = {
        project_id,
        project_work_description,
        unit,
        quantity,
        rate,
        base_amount:  base_amount  != null ? Number(base_amount)  : null,
        amount,                         // final amount (incl. GST if any)
        hsn_code:     hsn_code     || null,
        gst_type:     gst_type     || "none",
        sgst_percent: sgst_percent != null ? Number(sgst_percent) : null,
        sgst_amount:  sgst_amount  != null ? Number(sgst_amount)  : null,
        cgst_percent: cgst_percent != null ? Number(cgst_percent) : null,
        cgst_amount:  cgst_amount  != null ? Number(cgst_amount)  : null,
        igst_percent: igst_percent != null ? Number(igst_percent) : null,
        igst_amount:  igst_amount  != null ? Number(igst_amount)  : null,
        updated_at:   dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
        remarks:      remarks      || null,
        created_by: req.user.id,
      };

      const affected = await updateData(table, setObj, `billing_id = ${Number(id)}`);

      if (affected === 0) {
        return res.status(404).json({
          success: false,
          message: "Billing item not found",
        });
      }

      /* ---- response shape UNCHANGED ---- */
      return res.status(200).json({
        success: true,
        message: "Billing item updated successfully",
      });

    } catch (err) {
      console.error("❌ Update Billing Error:", err);
      return res.status(500).json({
        success: false,
        message: "Error updating billing item",
      });
    }
  };

  /* ============================================================
     5. DELETE BILLING ITEM  — completely unchanged
     ============================================================ */
  deleteBillingItem = async (req, res) => {
    try {
      const { id } = req.params;

      const affected = await deleteData(table, `billing_id = ${id}`);

      if (affected === 0) {
        return res.status(404).json({
          success: false,
          message: "Billing item not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Billing item deleted successfully",
      });

    } catch (err) {
      console.error("❌ Delete Billing Error:", err);
      return res.status(500).json({
        success: false,
        message: "Error deleting billing item",
      });
    }
  };
}

module.exports = new projectBillingController();