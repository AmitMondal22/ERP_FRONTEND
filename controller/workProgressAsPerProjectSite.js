const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
  customSelectSqlQuery,
  batchInsertData,
  updateStockQuantities,
} = require("../models/MasterModel");

class WorkProgressAsPerProjectSiteController {

  // ------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------


// createWorkProgress = async (req, res) => {
//   try {
//     // Extract values from body
// const{
//   project_id,
//   project_site_id,
//   bom_id,
//   bom_progress_id,
//   remarks,
//   total_progress,
//   rep_task,
//   packet_qty,
//   total_qty_of_material_used,
//   date,
//   created_by} = req.body;

//     // Validate required fields
//     if (!project_id || !project_site_id || !bom_id) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id, project_site_id and bom_id are required"
//       });
//     }

//     // Prepare data for insert
//     const data = {
//       project_id: project_id || null,
//       project_site_id: project_site_id || null,
//       bom_id: bom_id || null,
//       bom_progress_id:bom_progress_id ||null,
//       remarks: remarks || null,
//       total_progress: total_progress || 0,
//       rep_task: rep_task || null,
//       packet_qty: packet_qty || 0,
//       total_qty_of_material_used: total_qty_of_material_used || 0,

//       date: date || dayjs().format("YYYY-MM-DD"),
//       created_by: created_by || null,
//       created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
//       updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
//     };

//     // Convert undefined → null (safety)
//     Object.keys(data).forEach(key => {
//       if (data[key] === undefined) data[key] = null;
//     });

//     const insertId = await insertData("tx_work_progress_as_per_project_site", data);

//     return res.status(201).json({
//       success: true,
//       message: "Work progress added successfully",
//       id: insertId
//     });

//   } catch (err) {
//     console.error("CREATE ERROR:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Unable to create work progress"
//     });
//   }
// };



////////////////

// createWorkProgress = async (req, res) => {
//   try {
//     const {
//       project_id,
//       project_site_id,
//       bom_id,
//       bom_progress_id,
//       remarks,
//       total_progress,
//       rep_task,
//       packet_qty,
//       total_qty_of_material_used,
//       date,
//       created_by,
//       consumed_products = []  // default to empty array if not sent
//     } = req.body;

//     // Basic required fields check
//     if (!project_id || !project_site_id || !bom_id) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id, project_site_id and bom_id are required"
//       });
//     }

//     // Validate consumed_products is an array
//     if (!Array.isArray(consumed_products)) {
//       return res.status(400).json({
//         success: false,
//         message: "consumed_products must be an array"
//       });
//     }

//     // Prepare main work progress data
//     const workProgressData = {
//       project_id,
//       project_site_id,
//       bom_id,
//       bom_progress_id: bom_progress_id || null,
//       remarks: remarks || null,
//       total_progress: total_progress || 0,
//       rep_task: rep_task || null,
//       packet_qty: packet_qty || 0,
//       total_qty_of_material_used: total_qty_of_material_used || 0,
//       date: date || dayjs().format("YYYY-MM-DD"),
//       created_by: created_by || null,
//       created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
//       updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
//     };

//     // Insert main work progress record
//     const insertId = await insertData("tx_work_progress_as_per_project_site", workProgressData);

//     // If there are consumed products, insert them
//     if (consumed_products.length > 0) {
//       const expenseRows = consumed_products.map(item => {
//         if (!item.product_id || !item.quantity_of_product || item.quantity_of_product <= 0) {
//           throw new Error("Each product must have product_id and quantity_of_product > 0");
//         }

//         return {
//           product_id: item.product_id,
//           work_progress_site_id: insertId,
//           quantity_of_product: item.quantity_of_product,
//           created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
//           updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
//         };
//       });

//       // Batch insert all expense rows
//       const columns = "product_id, work_progress_site_id, quantity_of_product, created_at, updated_at";
//       await batchInsertData("tx_expenses_of_product_as_per_project_site", columns, expenseRows);
//     }

//     return res.status(201).json({
//       success: true,
//       message: "Work progress created successfully",
//       work_progress_site_id: insertId
//     });

//   } catch (err) {
//     console.error("CREATE ERROR:", err);

//     // Friendly message for validation errors
//     if (err.message.includes("product_id") || err.message.includes("quantity")) {
//       return res.status(400).json({
//         success: false,
//         message: err.message
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Unable to create work progress"
//     });
//   }
// };


///////////


createWorkProgress = async (req, res) => {
  try {
    const {
      project_id,
      project_site_id,
      bom_id,
      bom_progress_id,
      remarks,
      total_progress,
      rep_task,
      packet_qty,
      total_qty_of_material_used,
      date,
      created_by,
      consumed_products = []
    } = req.body;

    if (!project_id || !project_site_id || !bom_id) {
      return res.status(400).json({
        success: false,
        message: "project_id, project_site_id and bom_id are required"
      });
    }

    if (!Array.isArray(consumed_products)) {
      return res.status(400).json({
        success: false,
        message: "consumed_products must be an array"
      });
    }

    const workProgressData = {
      project_id,
      project_site_id,
      bom_id,
      bom_progress_id: bom_progress_id || null,
      remarks: remarks || null,
      total_progress: total_progress || 0,
      rep_task: rep_task || null,
      packet_qty: packet_qty || 0,
      total_qty_of_material_used: total_qty_of_material_used || 0,
      date: date || dayjs().format("YYYY-MM-DD"),
      created_by: created_by || null,
      created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
      updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
    };

    const insertId = await insertData("tx_work_progress_as_per_project_site", workProgressData);

    if (consumed_products.length > 0) {
      // Validate in single pass
      const invalidProduct = consumed_products.find(
        item => !item.product_id || !item.quantity_of_product || item.quantity_of_product <= 0
      );
      
      if (invalidProduct) {
        throw new Error("Each product must have product_id and quantity_of_product > 0");
      }

      const expenseRows = consumed_products.map(item => ({
        product_id: item.product_id,
        work_progress_site_id: insertId,
        quantity_of_product: item.quantity_of_product,
        created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
        updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
      }));

      const columns = "product_id, work_progress_site_id, quantity_of_product, created_at, updated_at";
      await batchInsertData("tx_expenses_of_product_as_per_project_site", columns, expenseRows);

      // Single fast stock update
      await updateStockQuantities(consumed_products, project_id, project_site_id);
    }

    return res.status(201).json({
      success: true,
      message: "Work progress created successfully",
      work_progress_site_id: insertId
    });

  } catch (err) {
    console.error("CREATE ERROR:", err);
    
    if (err.message.includes("product_id") || err.message.includes("quantity")) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create work progress"
    });
  }
};

  // ------------------------------------------------------------
  // READ (GROUPED)
  // ------------------------------------------------------------




// getWorkProgressByProjectAndSite = async (req, res) => {
//   try {
//     const { project_id, project_site_id } = req.body;

//     if (!project_id || !project_site_id) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id and project_site_id are required"
//       });
//     }

//     const sql = `
//         SELECT DISTINCT
//           w.work_progress_site_id,
//           w.project_id,
//           w.project_site_id,
//           w.bom_id,
//           w.bom_progress_id,        -- ADDED HERE
//           w.remarks,
//           w.total_progress, 
//           w.rep_task,
//           w.packet_qty,
//           w.total_qty_of_material_used,
//           w.date,
//           w.created_at,
//           w.updated_at,
//           w.created_by,

//           CONCAT(e.first_name, ' ', e.last_name) AS created_by_name,
//           p.project_name,
//           s.project_site_name,
//           b.bom_name,

//           bi.bom_item_id,
//           bi.bom_progress_id AS bom_item_progress_id,
//           bi.product_id AS bom_product_id,
//           bi.qty AS bom_item_qty,
//           bi.total_qty AS bom_item_total_qty,

//           bp.bom_progress_name AS bom_progress_name,

//           pr.product_name

//         FROM tx_work_progress_as_per_project_site w
//         LEFT JOIN md_project p ON w.project_id = p.project_id
//         LEFT JOIN md_project_site s ON w.project_site_id = s.project_site_id
//         LEFT JOIN md_bom b ON w.bom_id = b.bom_id
//         LEFT JOIN em_employees e ON w.created_by = e.employee_id

//         LEFT JOIN md_bom_item bi ON w.bom_id = bi.bom_id
//         LEFT JOIN md_bom_progress bp ON w.bom_progress_id = bp.bom_progress_id   -- UPDATED JOIN
//         LEFT JOIN md_product pr ON bi.product_id = pr.product_id

//         WHERE w.project_id = ${project_id}
//         AND w.project_site_id = ${project_site_id}

//         ORDER BY w.bom_id, w.work_progress_site_id, bi.bom_item_id;
//       `;

//     const rows = await customSelectSqlQuery(sql);

//     return res.status(200).json({
//       success: true,
//       data: rows
//     });

//   } catch (err) {
//     console.error("FETCH ERROR:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch work progress"
//     });
//   }
// };



getWorkProgressByProjectAndSite = async (req, res) => {
  try {
    const { project_id, project_site_id } = req.body;

    if (!project_id || !project_site_id) {
      return res.status(400).json({
        success: false,
        message: "project_id and project_site_id are required",
      });
    }

    const sql = `
      SELECT DISTINCT
          w.work_progress_site_id,
          w.project_id,
          w.project_site_id,
          w.bom_id,
          w.bom_progress_id,
          w.remarks,
          w.total_progress,
          w.rep_task,
          w.packet_qty,
          w.total_qty_of_material_used,
          w.date,
          w.created_at,
          w.updated_at,
          w.created_by,

          CONCAT(e.first_name, ' ', e.last_name) AS created_by_name,
          p.project_name,
          s.project_site_name,
          b.bom_name,

          bi.bom_item_id,
          bi.bom_progress_id AS bom_item_progress_id,
          bi.product_id AS bom_product_id,
          bi.qty AS bom_item_qty,
          bi.total_qty AS bom_item_total_qty,

          bp.bom_progress_name AS bom_progress_name,

          pr.product_name

      FROM tx_work_progress_as_per_project_site w
      LEFT JOIN md_project p ON w.project_id = p.project_id
      LEFT JOIN md_project_site s ON w.project_site_id = s.project_site_id
      LEFT JOIN md_bom b ON w.bom_id = b.bom_id
      LEFT JOIN em_employees e ON w.created_by = e.employee_id

      -- FIXED JOIN ↓↓↓
      LEFT JOIN md_bom_item bi 
             ON bi.bom_id = w.bom_id
            AND bi.bom_progress_id = w.bom_progress_id  -- IMPORTANT JOIN FIX

      LEFT JOIN md_bom_progress bp 
             ON w.bom_progress_id = bp.bom_progress_id 

      LEFT JOIN md_product pr 
             ON bi.product_id = pr.product_id

      WHERE w.project_id = ${project_id}
        AND w.project_site_id = ${project_site_id}

      ORDER BY w.bom_id, w.bom_progress_id, bi.bom_item_id;
    `;

    const rows = await customSelectSqlQuery(sql);

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("FETCH ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch work progress",
    });
  }
};





  // ------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------
  updateWorkProgress = async (req, res) => {
  try {
    const {
      work_progress_site_id,
      project_id,
      project_site_id,
      bom_id,
      bom_progress_id,
      remarks,
      total_progress,
      rep_task,
      packet_qty,
      total_qty_of_material_used,
      date,
      created_by
    } = req.body;

    if (!work_progress_site_id) {
      return res.status(400).json({
        success: false,
        message: "work_progress_site_id is required"
      });
    }

    const updateObj = {
      project_id: project_id || null,
      project_site_id: project_site_id || null,
      bom_id: bom_id || null,
      bom_progress_id: bom_progress_id || null,
      remarks: remarks || null,
      total_progress: total_progress || 0,
      rep_task: rep_task || null,
      packet_qty: packet_qty || 0,
      total_qty_of_material_used: total_qty_of_material_used || 0,
      date: date || null,
      created_by: created_by || null,
      updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
    };

    // Convert undefined → null just in case
    Object.keys(updateObj).forEach(key => {
      if (updateObj[key] === undefined) updateObj[key] = null;
    });

    await updateData(
      "tx_work_progress_as_per_project_site",
      updateObj,
      `work_progress_site_id = ${work_progress_site_id}`
    );

    res.status(200).json({
      success: true,
      message: "Work progress updated"
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Unable to update work progress"
    });
  }
};





  // ------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------
  deleteWorkProgress = async (req, res) => {
    try {
      const { work_progress_site_id } = req.body;

      if (!work_progress_site_id) {
        return res.status(400).json({
          success: false,
          message: "work_progress_site_id is required"
        });
      }

      await deleteData(
        "tx_work_progress_as_per_project_site",
        `work_progress_site_id = ${work_progress_site_id}`
      );

      res.status(200).json({ success: true, message: "Work progress deleted" });

    } catch (err) {
      console.error("DELETE ERROR:", err);
      res.status(500).json({ success: false, message: "Unable to delete work progress" });
    }
  };




  getWorkProgressfulldatafromprojectandsiteId = async (req, res) => {
  try {
    const { project_id, project_site_id } = req.body;

    if (!project_id || !project_site_id) {
      return res.status(400).json({
        success: false,
        message: "project_id and project_site_id are required",
      });
    }

    const sql = `
      SELECT 
          w.*,

          -- Project Name
          p.project_name,

          -- Project Site Name
          ps.project_site_name,

          -- BOM Name
          b.bom_name,

          -- Progress Name
          bp.bom_progress_name

      FROM tx_work_progress_as_per_project_site w

      LEFT JOIN md_project p 
        ON p.project_id = w.project_id

      LEFT JOIN md_project_site ps 
        ON ps.project_site_id = w.project_site_id

      LEFT JOIN md_bom b 
        ON b.bom_id = w.bom_id

      LEFT JOIN md_bom_progress bp 
        ON bp.bom_progress_id = w.bom_progress_id

      WHERE w.project_id = ${project_id}
        AND w.project_site_id = ${project_site_id}

      ORDER BY w.work_progress_site_id DESC;
    `;

    const rows = await customSelectSqlQuery(sql);

    return res.status(200).json({
      success: true,
      data: rows,
    });

  } catch (err) {
    console.error("FETCH ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch work progress",
    });
  }
};


}

module.exports = new WorkProgressAsPerProjectSiteController();
