/////////////////////////////////////////////////////////////////////////////

// dayjs = require("dayjs");
// const utc = require("dayjs/plugin/utc");
// dayjs.extend(utc);

// const {
//   insertData,
//   updateData,
//   deleteData,
//   selectOneData,
//   customSelectSqlQuery,
// } = require("../models/MasterModel");

// const table = "md_project_billing";

// class projectBillingController {

//   // -------------------------------------------------------------
//   // 1️⃣ CREATE BILLING ITEM
//   // -------------------------------------------------------------
//   createBillingItem = async (req, res) => {
//     try {
//       const {
//         project_id,
//         bom_id,
//         unit,
//         quantity,
//         rate,
//         amount,
//         remarks,
//       } = req.body;

//       if (!project_id || !bom_id) {
//         return res.status(400).json({
//           success: false,
//           message: "project_id & bom_id are required",
//         });
//       }

//       const insertObj = {
//         project_id,
//         bom_id,
//         unit,
//         quantity,
//         rate,
//         amount,
//         remarks,
//         created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
//       };

//       const billing_id = await insertData(table, insertObj);

//       return res.status(201).json({
//         success: true,
//         message: "Billing item created successfully",
//         billing_id,
//       });

//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({
//         success: false,
//         message: "Error creating billing item",
//       });
//     }
//   };

//   // -------------------------------------------------------------
//   // 2️⃣ GET ALL BILLING ITEMS BY PROJECT (WITH BOM NAME)
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

//       const sql = `
//         SELECT 
//           pb.billing_id,
//           pb.project_id,
//           pb.bom_id,
//           b.bom_name,
//           pb.unit,
//           pb.quantity,
//           pb.rate,
//           pb.amount,
//           pb.remarks,
//           pb.created_at
//         FROM md_project_billing pb
//         LEFT JOIN md_bom b 
//           ON pb.bom_id = b.bom_id
//         WHERE pb.project_id = ${project_id}
//         ORDER BY pb.billing_id DESC
//       `;

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
//   // 3️⃣ GET SINGLE BILLING ITEM (WITH BOM NAME)
//   // -------------------------------------------------------------
//   getBillingItemById = async (req, res) => {
//     try {
//       const { id } = req.params;

//       const sql = `
//         SELECT 
//           pb.*,
//           b.bom_name
//         FROM md_project_billing pb
//         LEFT JOIN md_bom b 
//           ON pb.bom_id = b.bom_id
//         WHERE pb.billing_id = ${id}
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
//       console.error(err);
//       return res.status(500).json({
//         success: false,
//         message: "Error fetching billing item",
//       });
//     }
//   };

//   // -------------------------------------------------------------
//   // 4️⃣ UPDATE BILLING ITEM
//   // -------------------------------------------------------------
//   updateBillingItem = async (req, res) => {
//     try {
//       const { id } = req.params;

//       const {
//         project_id,
//         bom_id,
//         unit,
//         quantity,
//         rate,
//         amount,
//         remarks,
//       } = req.body;

//       if (!project_id) {
//         return res.status(400).json({
//           success: false,
//           message: "project_id is required",
//         });
//       }

//       const setObj = {
//         project_id,
//         bom_id,
//         unit,
//         quantity,
//         rate,
//         amount,
//         remarks,
//         updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
//       };

//       const affected = await updateData(table, setObj, `billing_id = ${id}`);

//       if (affected === 0) {
//         return res.status(404).json({
//           success: false,
//           message: "Billing item not found",
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Billing item updated successfully",
//       });

//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({
//         success: false,
//         message: "Error updating billing item",
//       });
//     }
//   };

//   // -------------------------------------------------------------
//   // 5️⃣ DELETE BILLING ITEM
//   // -------------------------------------------------------------
//   deleteBillingItem = async (req, res) => {
//     try {
//       const { id } = req.params;

//       const affected = await deleteData(table, `billing_id = ${id}`);

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
//       console.error(err);
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

  // -------------------------------------------------------------
  //  CREATE BILLING ITEM
  // -------------------------------------------------------------
  // createBillingItem = async (req, res) => {
  //   try {
  //     const {
  //       project_id,
  //       project_work_description,
  //       unit,
  //       quantity,
  //       rate,
  //       amount,
  //       remarks,
  //     } = req.body;

  //     if (!project_id || !project_work_description) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "project_id & project_work_description are required",
  //       });
  //     }

  //     const insertObj = {
  //       project_id,
  //       project_work_description,
  //       unit,
  //       quantity,
  //       rate,
  //       amount,
  //       remarks,
  //       created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
  //     };

  //     const billing_id = await insertData(table, insertObj);

  //     return res.status(201).json({
  //       success: true,
  //       message: "Billing item created successfully",
  //       billing_id,
  //     });

  //   } catch (err) {
  //     console.error("❌ Create Billing Error:", err);
  //     return res.status(500).json({
  //       success: false,
  //       message: "Error creating billing item",
  //     });
  //   }
  // };

  createBillingItem = async (req, res) => {
  try {
    const {
      project_id,
      project_work_description,
      hsn_code,
      unit,
      quantity,
      rate,
      amount,
      remarks,
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

    /* -------------------- Insert Object -------------------- */
    const insertObj = {
      project_id,
      project_work_description,
      hsn_code,
      unit,
      quantity,
      rate,
      amount,
      remarks,
      created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
    };


    if (hsn_code && hsn_code.length > 20) {
  return res.status(400).json({
    success: false,
    error: {
      code: "INVALID_HSN",
      message: "HSN code too long",
    },
  });
}
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

    /* -------------------- Success -------------------- */
    return res.status(201).json({
      success: true,
      message: "Billing item created successfully",
      data: {
        billing_id,
      },
    });

  } catch (err) {
    console.error("❌ Create Billing Error:", {
      message: err.message,
      stack: err.stack,
    });

    /* -------------------- Unexpected Error -------------------- */
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong while creating billing item",
      },
    });
  }
};
  // -------------------------------------------------------------
  // 2️⃣ GET ALL BILLING ITEMS BY PROJECT
  // -------------------------------------------------------------
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

      // const sql = `
      //   SELECT 
      //     billing_id,
      //     project_id,
      //     project_work_description,
      //     unit,
      //     quantity,
      //     rate,
      //     amount,
      //     remarks,
      //     hsn_code,
      //     created_at
      //   FROM md_project_billing
      //   WHERE project_id = ${project_id}
      //   ORDER BY billing_id DESC
      // `;



      const sql =`SELECT 
  pb.billing_id,
  pb.project_id,
  pb.project_work_description,
  pb.unit,
  pb.quantity,
  pb.rate,
  pb.amount,
  pb.remarks,
  pb.hsn_code,
  pb.created_at,

  pr.project_name,

  -- ✅ only required client fields
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

ORDER BY pb.billing_id DESC`





      const rows = await customSelectSqlQuery(sql, true);

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

  // -------------------------------------------------------------
  // 3 GET SINGLE BILLING ITEM
  // -------------------------------------------------------------
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
      console.error(" Get Billing Error:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching billing item",
      });
    }
  };

// -------------------------------------------------------------
//  UPDATE BILLING ITEM
// -------------------------------------------------------------
//   updateBillingItem = async (req, res) => {
//     try {
//       const { id } = req.params;

//       const {
//         project_id,
//         project_work_description,
//         unit,
//         quantity,
//         rate,
//         amount,
//         remarks,
//       } = req.body;

//       if (!project_id || !project_work_description) {
//         return res.status(400).json({
//           success: false,
//           message: "project_id & project_work_description are required",
//         });
//       }

//       const setObj = {
//         project_id,
//         project_work_description,
//         unit,
//         quantity,
//         rate,
//         amount,
//         remarks,
//         updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
//       };


// if (!billingId || billingId === 'undefined') {
//   throw new Error('Invalid billing_id provided');
// }


//       const affected = await updateData(
//         table,
//         setObj,
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
//         message: "Billing item updated successfully",
//       });

//     } catch (err) {
//       console.error(" Update Billing Error:", err);
//       return res.status(500).json({
//         success: false,
//         message: "Error updating billing item",
//       });
//     }
//   };




updateBillingItem = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      project_id,
      project_work_description,
      unit,
      quantity,
      rate,
      amount,
      hsn_code,
      remarks,
    } = req.body;

    if (!project_id || !project_work_description) {
      return res.status(400).json({
        success: false,
        message: "project_id & project_work_description are required",
      });
    }

    //  validate id from params
    if (!id || id === 'undefined' || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid billing_id provided",
      });
    }

    const setObj = {
      project_id,
      project_work_description,
      unit,
      quantity,
      rate,
      amount,
      remarks,
      hsn_code,
      updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
    };

    const affected = await updateData(
      table,
      setObj,
      `billing_id = ${Number(id)}`
    );

    if (affected === 0) {
      return res.status(404).json({
        success: false,
        message: "Billing item not found",
      });
    }

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



// updateBillingItem = async (req, res) => {
//   try {
//     const billingId = Number(req.params.id);

//     /* -------------------- ID Validation -------------------- */
//     if (!billingId || isNaN(billingId) || billingId <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid billing_id is required in URL",
//       });
//     }

//     const {
//       project_id,
//       project_work_description,
//       unit,
//       quantity,
//       rate,
//       amount,
//       remarks,
//     } = req.body;

//     // ✅ Better validation
//     if (!project_id || !project_work_description) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id & project_work_description are required",
//       });
//     }

//     // ✅ Sanitize numeric fields
//     const sanitizedData = {
//       project_id: Number(project_id),
//       project_work_description: project_work_description.trim(),
//       unit: unit?.trim() || null,
//       quantity: Number(quantity) || 0,
//       rate: Number(rate) || 0,
//       amount: Number(amount) || 0,
//       remarks: remarks?.trim() || null,
//       updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
//     };

//     // ✅ Validate required numeric fields
//     if (sanitizedData.quantity < 0 || sanitizedData.rate < 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Quantity and rate must be positive numbers",
//       });
//     }

//     const affected = await updateData(
//       table, // ✅ Ensure 'table' is defined (project_billing?)
//       sanitizedData,
//       `billing_id = ${mysql.escape(billingId)}` // ✅ SQL Injection protection
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
//       data: { billing_id: billingId }
//     });

//   } catch (err) {
//     console.error("❌ Update Billing Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };



  // -------------------------------------------------------------
  // 5️⃣ DELETE BILLING ITEM
  // -------------------------------------------------------------
 
 
 
  deleteBillingItem = async (req, res) => {
    try {
      const { id } = req.params;

      const affected = await deleteData(
        table,
        `billing_id = ${id}`
      );

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
