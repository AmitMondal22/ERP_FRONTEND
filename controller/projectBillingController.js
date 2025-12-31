// const dayjs = require("dayjs");
// const utc = require("dayjs/plugin/utc");
// dayjs.extend(utc);

// const {
//   insertData,
//   updateData,
//   deleteData,
//   selectData,
//   selectOneData,
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

//       if (!project_id || !description_of_work) {
//         return res.status(400).json({
//           success: false,
//           message: "project_id & description_of_work are required",
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
//   // 2️⃣ GET ALL BILLING ITEMS FOR A PROJECT
//   // -------------------------------------------------------------

//   // getBillingItemsByProjectId = async (req, res) => {
//   //   try {
//   //     const { id } = req.params;
//   //     console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
//   //     // Convert to number
//   //     const pid = Number(id);

//   //     // Validate
//   //     if (!pid || isNaN(pid)) {
//   //       return res.status(400).json({
//   //         success: false,
//   //         message: "Valid project_id is required",
//   //       });
//   //     }

//   //     // Fetch ALL billing items for this project
//   //     const rows = await selectData(
//   //       "md_project_billing",
//   //       "*",
//   //       `project_id = ${pid}`,
//   //       "billing_id DESC"
//   //     );

//   //     return res.status(200).json({
//   //       success: true,
//   //       data: rows,
//   //     });
//   //   } catch (err) {
//   //     console.error("❌ Billing Fetch Error:", err);
//   //     return res.status(500).json({
//   //       success: false,
//   //       message: "Error fetching billing items",
//   //     });
//   //   }
//   // };

  
// getBillingItemsByProjectId = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const project_id = Number(id);

//     if (!project_id || isNaN(project_id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid project_id is required",
//       });
//     }

//     const query = `
//       SELECT 
//         pb.billing_id,
//         pb.project_id,
//         pb.bom_id,
//         b.bom_name,
//         pb.unit,
//         pb.quantity,
//         pb.rate,
//         pb.amount,
//         pb.remarks,
//         pb.created_at
//       FROM md_project_billing pb
//       LEFT JOIN md_bom b ON pb.bom_id = b.bom_id
//       WHERE pb.project_id = ?
//       ORDER BY pb.billing_id DESC
//     `;

//     const [rows] = await db.query(query, [project_id]);

//     return res.status(200).json({
//       success: true,
//       data: rows,
//     });
//   } catch (err) {
//     console.error("❌ Billing Fetch Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching billing items",
//     });
//   }
// };

//   // -------------------------------------------------------------
//   // 3️⃣ GET A SINGLE BILLING ITEM BY ID
//   // -------------------------------------------------------------

//   // getBillingItemById = async (req, res) => {
//   //   try {
//   //     const { billing_id } = req.body;

//   //     const row = await selectOneData(table, "*", `billing_id = ${billing_id}`);

//   //     if (!row) {
//   //       return res.status(404).json({
//   //         success: false,
//   //         message: "Billing item not found",
//   //       });
//   //     }

//   //     return res.status(200).json({
//   //       success: true,
//   //       data: row,
//   //     });
//   //   } catch (err) {
//   //     console.error(err);
//   //     return res.status(500).json({
//   //       success: false,
//   //       message: "Error fetching billing item",
//   //     });
//   //   }
//   // };

//   getBillingItemById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const query = `
//       SELECT 
//         pb.*,
//         b.bom_name
//       FROM md_project_billing pb
//       LEFT JOIN md_bom b ON pb.bom_id = b.bom_id
//       WHERE pb.billing_id = ?
//     `;

//     const [rows] = await db.query(query, [id]);

//     if (!rows.length) {
//       return res.status(404).json({
//         success: false,
//         message: "Billing item not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: rows[0],
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching billing item",
//     });
//   }
// };


//   // -------------------------------------------------------------
//   // 4️⃣ UPDATE BILLING ITEM
//   // -------------------------------------------------------------

//   updateBillingItem = async (req, res) => {
//     try {
//       const { id } = req.params;

//       // ✅ FIX — extract fields from req.body
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

//       const affected = await deleteData(
//         "md_project_billing",
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
//       console.error(err);
//       return res.status(500).json({
//         success: false,
//         message: "Error deleting billing item",
//       });
//     }
//   };
// }

// module.exports = new projectBillingController();

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
  // 1️⃣ CREATE BILLING ITEM
  // -------------------------------------------------------------
  createBillingItem = async (req, res) => {
    try {
      const {
        project_id,
        project_work_description,
        unit,
        quantity,
        rate,
        amount,
        remarks,
      } = req.body;

      if (!project_id || !project_work_description) {
        return res.status(400).json({
          success: false,
          message: "project_id & project_work_description are required",
        });
      }

      const insertObj = {
        project_id,
        project_work_description,
        unit,
        quantity,
        rate,
        amount,
        remarks,
        created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
      };

      const billing_id = await insertData(table, insertObj);

      return res.status(201).json({
        success: true,
        message: "Billing item created successfully",
        billing_id,
      });

    } catch (err) {
      console.error("❌ Create Billing Error:", err);
      return res.status(500).json({
        success: false,
        message: "Error creating billing item",
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

      const sql = `
        SELECT 
          billing_id,
          project_id,
          project_work_description,
          unit,
          quantity,
          rate,
          amount,
          remarks,
          created_at
        FROM md_project_billing
        WHERE project_id = ${project_id}
        ORDER BY billing_id DESC
      `;

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
  // 3️⃣ GET SINGLE BILLING ITEM
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
      console.error("❌ Get Billing Error:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching billing item",
      });
    }
  };

  // -------------------------------------------------------------
  // 4️⃣ UPDATE BILLING ITEM
  // -------------------------------------------------------------
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
        remarks,
      } = req.body;

      if (!project_id || !project_work_description) {
        return res.status(400).json({
          success: false,
          message: "project_id & project_work_description are required",
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
        updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
      };

      const affected = await updateData(
        table,
        setObj,
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
