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
  customSelectSqlQuery2,
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

//     const insertId = await insertData("tx_work_progress", data);

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
//     const insertId = await insertData("tx_work_progress", workProgressData);

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
//       await batchInsertData("tx_site_used_items", columns, expenseRows);
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
//       consumed_products = []
//     } = req.body;


//     if (!project_id || !project_site_id || !bom_id) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id, project_site_id and bom_id are required"
//       });
//     }


//     if (!Array.isArray(consumed_products)) {
//       return res.status(400).json({
//         success: false,
//         message: "consumed_products must be an array"
//       });
//     }


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


//     const insertId = await insertData("tx_work_progress", workProgressData);


//     if (consumed_products.length > 0) {
//       // Validate in single pass
//       const invalidProduct = consumed_products.find(
//         item => !item.product_id || !item.quantity_of_product || item.quantity_of_product <= 0
//       );
      
//       if (invalidProduct) {
//         throw new Error("Each product must have product_id and quantity_of_product > 0");
//       }


//       const expenseRows = consumed_products.map(item => ({
//         product_id: item.product_id,
//         work_progress_site_id: insertId,
//         quantity_of_product: item.quantity_of_product,
//         Act_Qty: item.Act_Qty || null,
//         created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
//         updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
//       }));


//       const columns = "product_id, work_progress_site_id, quantity_of_product, Act_Qty, created_at, updated_at";
//       await batchInsertData("tx_site_used_items", columns, expenseRows);


//       // Single fast stock update
//       await updateStockQuantities(consumed_products, project_id, project_site_id);
//     }


//     return res.status(201).json({
//       success: true,
//       message: "Work progress created successfully",
//       work_progress_site_id: insertId
//     });


//   } catch (err) {
//     console.error("CREATE ERROR:", err);
    
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
      billing_status,
     // created_by,
      consumed_products = []
    } = req.body;

        const created_by = req.user?.id || null;

    /* ---------------- BASIC VALIDATION ---------------- */
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

    /* ---------------- INSERT tx_work_progress ---------------- */
    const workProgressData = {
      project_id,
      project_site_id,
      bom_id,
      bom_progress_id: bom_progress_id || null,
      remarks: remarks || null,
      total_progress: total_progress || 0,
      rep_task: rep_task || 0,
      packet_qty: packet_qty || 0,
      total_qty_of_material_used: total_qty_of_material_used || 0,
      date: date || dayjs().format("YYYY-MM-DD"),
      billing_status: billing_status || "PENDING",
      created_by: created_by || null,
      created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
      updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
    };

    const insertId = await insertData("tx_work_progress", workProgressData);

    /* ---------------- INSERT tx_site_used_items ---------------- */
    if (consumed_products.length > 0) {

     const invalidItem = consumed_products.find(item =>
  !item.product_id ||
  item.Atc_total === undefined ||
  item.Atc_total < 0
);


      if (invalidItem) {
        return res.status(400).json({
          success: false,
          message: "Each consumed product must have valid product_id and quantity_of_product"
        });
      }
const expenseRows = consumed_products.map(item => ({
  expenses_of_project_site_id: item.expenses_of_project_site_id || null,
  work_progress_site_id: insertId,
  product_id: item.product_id,

  //  quantity_of_product REMOVED
  //  Atc_total is the total consumed qty (replacement)

  bom_product_qty: item.bom_product_qty || 0,
  Atc_total: item.Atc_total || 0,     // <-- MAIN VALUE
  Act_Qty: item.Act_Qty || 0,          // per-unit / step qty

  created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
  updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
}));



      // quantity_of_product,--->Atc_total  same 
      const columns = `
      expenses_of_project_site_id,
      work_progress_site_id,
      product_id,      
      bom_product_qty,
      Atc_total,
      Act_Qty,
      created_at,
     updated_at
     `;

      await batchInsertData("tx_site_used_items", columns, expenseRows);

      await updateStockQuantities(consumed_products, project_id, project_site_id);
    }

    /* ---------------- RESPONSE ---------------- */
    return res.status(201).json({
      success: true,
      message: "Work progress created successfully",
      work_progress_site_id: insertId
    });

  } catch (err) {
    console.error("CREATE WORK PROGRESS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: `Unable to create work progress ${err}`
    });
  }
};
















// getMonthlyWorkReport = async (req, res) => {
//   try {
//     const { project_id, project_site_id, fromDate, toDate } = req.body;

//     /* 1. Basic validation */
//     if (!project_id || !fromDate || !toDate) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id, fromDate and toDate are required",
//       });
//     }

//     if (!dayjs(fromDate).isValid() || !dayjs(toDate).isValid()) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid date format. Use YYYY-MM-DD",
//       });
//     }

//     /* 2. Load project header info */
//     const projectQuery = `
//       SELECT 
//         p.project_id,
//         p.project_name,
//         p.city_id,
//         c.name AS city_name,
//         c.state_id,
//         s.name AS state_name,
//         p.create_by,
//         u.name AS created_by_name,
//         p.created_at
//       FROM md_project p
//       LEFT JOIN lo_cities c ON p.city_id = c.id
//       LEFT JOIN lo_states s ON c.state_id = s.id
//       LEFT JOIN users u ON p.create_by = u.id
//       WHERE p.project_id = ?
//     `;

//     const project = await customSelectSqlQuery2(projectQuery, [project_id], false);

//     if (!project) {
//       return res.status(404).json({
//         success: false,
//         message: "Project not found",
//       });
//     }

//     /* 3. Load work progress rows in the given period */
//     let workProgressQuery = `
//       SELECT 
//         wp.work_progress_site_id,
//         wp.project_id,
//         wp.project_site_id,
//         wp.bom_id,
//         wp.bom_progress_id,
        
//         wp.remarks,
//         wp.total_progress,
//         wp.rep_task,
//         wp.packet_qty,
//         wp.total_qty_of_material_used,
//         wp.date,
//         wp.created_by,
//         wp.created_at,
//         wp.updated_at,

//         -- Project Site
//         ps.project_site_name,
//         ps.city_id AS site_city_id,
//         sc.name AS site_city_name,
//         sc.state_id AS site_state_id,
//         ss.name AS site_state_name,

//         -- BOM
//         b.bom_name,

//         -- BOM Progress
//         bp.bom_progress_name,
//         bp.sl_number AS progress_sl_number,

//         -- Creator
//         u.name AS creator_name,
//         u.email AS creator_email,

//         -- Month keys
//         DATE_FORMAT(wp.date, '%M %Y') AS month_year,
//         DATE_FORMAT(wp.date, '%Y-%m') AS year_month_sort
        
//       FROM tx_work_progress wp
//       LEFT JOIN md_project_site ps ON wp.project_site_id = ps.project_site_id
//       LEFT JOIN lo_cities sc ON ps.city_id = sc.id
//       LEFT JOIN lo_states ss ON sc.state_id = ss.id
//       LEFT JOIN md_bom b ON wp.bom_id = b.bom_id
//       LEFT JOIN md_bom_progress bp ON wp.bom_progress_id = bp.bom_progress_id
//       LEFT JOIN users u ON wp.created_by = u.id
//       WHERE wp.project_id = ?
//         AND wp.date BETWEEN ? AND ?
//     `;

//     const workParams = [project_id, fromDate, toDate];

//     if (project_site_id) {
//       workProgressQuery += ` AND wp.project_site_id = ?`;
//       workParams.push(project_site_id);
//     }

//     workProgressQuery += ` ORDER BY wp.date DESC, wp.work_progress_site_id DESC`;

//     const workRows = await customSelectSqlQuery2(workProgressQuery, workParams);

//     if (!workRows || workRows.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: "No work progress found for the given criteria",
//         report_info: {
//           project,
//           from_date: fromDate,
//           to_date: toDate,
//           total_records: 0,
//         },
//         monthly_data: [],
//         overall_summary: {
//           total_months: 0,
//           total_work_entries: 0,
//           total_progress: 0,
//           total_packets: 0,
//           total_materials_used: 0,
//           total_products_consumed: 0,
//           unique_sites: 0,
//           unique_boms: 0,
//         },
//       });
//     }

//     /* 4. Load all consumed products - FIXED QUERY */
//     const workIds = workRows.map((wp) => wp.work_progress_site_id);
//     const idList = workIds.join(",");

//     // ✅ REMOVED md_manufacturer JOIN - assuming manufacturer info is in md_product
//     const consumedQuery = `
//       SELECT 
//         ep.expenses_of_project_site_id,
//         ep.product_id,
//         ep.work_progress_site_id,
//         ep.Atc_total,
//         ep.created_at,

//         p.product_name,
//         p.model_no,
//         p.hsn_code,
//         p.manufacturer_name,

//         pt.product_type_name,
//         u.unit_name
        
//       FROM tx_site_used_items ep      --tx_site_used_items--
//       LEFT JOIN md_product p ON ep.product_id = p.product_id
//       LEFT JOIN md_product_type pt ON p.product_type_id = pt.product_type_id
//       LEFT JOIN md_unit u ON p.unit_id = u.unit_id
//       WHERE ep.work_progress_site_id IN (${idList})
//       ORDER BY ep.work_progress_site_id, ep.product_id
//     `;

//     const consumedRows = await customSelectSqlQuery2(consumedQuery, []);

//     /* 5. Build a map: work_progress_site_id -> list of products */
//     const productsByWorkId = {};
//     for (const row of consumedRows) {
//       const key = row.work_progress_site_id;
//       if (!productsByWorkId[key]) productsByWorkId[key] = [];

//       productsByWorkId[key].push({
//         expenses_id: row.expenses_of_project_site_id,
//         product_id: row.product_id,
//         product_name: row.product_name,
//         model_no: row.model_no,
//         hsn_code: row.hsn_code,
//         product_type: row.product_type_name,
//         manufacturer: row.manufacturer_name, // ✅ Now from md_product
//         unit: row.unit_name,
//         quantity_consumed: parseFloat(row.Atc_total || 0),
//         consumed_at: row.created_at,
//       });
//     }

//     /* 6. Group work rows by month and attach products */
//     const monthBuckets = {};

//     for (const wp of workRows) {
//       const monthKey = wp.year_month_sort;

//       if (!monthBuckets[monthKey]) {
//         monthBuckets[monthKey] = {
//           month_year: wp.month_year,
//           year_month: wp.year_month_sort,
//           work_progress_entries: [],
//           summary: {
//             total_entries: 0,
//             total_progress: 0,
//             total_packets: 0,
//             total_materials_used: 0,
//             total_products_consumed: 0,
//           },
//         };
//       }

//       const entry = {
//         work_progress_site_id: wp.work_progress_site_id,
//         date: wp.date,
//         project_site: {
//           site_id: wp.project_site_id,
//           site_name: wp.project_site_name,
//           city: wp.site_city_name,
//           state: wp.site_state_name,
//         },
//         bom: {
//           bom_id: wp.bom_id,
//           bom_name: wp.bom_name,
//         },
//         bom_progress: {
//           progress_id: wp.bom_progress_id,
//           progress_name: wp.bom_progress_name,
//           sl_number: wp.progress_sl_number,
//         },
//         work_details: {
//           remarks: wp.remarks,
//           total_progress: parseFloat(wp.total_progress || 0),
//           rep_task: wp.rep_task,
//           packet_qty: parseFloat(wp.packet_qty || 0),
//           total_qty_of_material_used: parseFloat(wp.total_qty_of_material_used || 0),
//         },
//         consumed_products: productsByWorkId[wp.work_progress_site_id] || [],
//         created_by: {
//           user_id: wp.created_by,
//           user_name: wp.creator_name,
//           user_email: wp.creator_email,
//         },
//         timestamps: {
//           created_at: wp.created_at,
//           updated_at: wp.updated_at,
//         },
//       };

//       monthBuckets[monthKey].work_progress_entries.push(entry);

//       monthBuckets[monthKey].summary.total_entries += 1;
//       monthBuckets[monthKey].summary.total_progress += entry.work_details.total_progress;
//       monthBuckets[monthKey].summary.total_packets += entry.work_details.packet_qty;
//       monthBuckets[monthKey].summary.total_materials_used += entry.work_details.total_qty_of_material_used;
//       monthBuckets[monthKey].summary.total_products_consumed += entry.consumed_products.length;
//     }

//     const monthly_data = Object.values(monthBuckets).sort((a, b) =>
//       b.year_month.localeCompare(a.year_month)
//     );

//     /* 7. Build overall summary */
//     const overall_summary = {
//       total_months: monthly_data.length,
//       total_work_entries: workRows.length,
//       total_progress: workRows.reduce(
//         (sum, wp) => sum + parseFloat(wp.total_progress || 0),
//         0
//       ),
//       total_packets: workRows.reduce(
//         (sum, wp) => sum + parseFloat(wp.packet_qty || 0),
//         0
//       ),
//       total_materials_used: workRows.reduce(
//         (sum, wp) => sum + parseFloat(wp.total_qty_of_material_used || 0),
//         0
//       ),
//       total_products_consumed: consumedRows.length,
//       unique_sites: new Set(workRows.map((wp) => wp.project_site_id)).size,
//       unique_boms: new Set(workRows.map((wp) => wp.bom_id)).size,
//     };

//     /* 8. Final response */
//     return res.status(200).json({
//       success: true,
//       message: "Monthly work report generated successfully",
//       report_info: {
//         project,
//         from_date: fromDate,
//         to_date: toDate,
//         report_period: `${dayjs(fromDate).format("DD MMM YYYY")} to ${dayjs(toDate).format(
//           "DD MMM YYYY"
//         )}`,
//         generated_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
//       },
//       overall_summary,
//       monthly_data,
//     });
//   } catch (error) {
//     console.error("Error generating monthly work report:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to generate monthly work report",
//       error: error.message,
//     });
//   }
// };









getMonthlyWorkReport = async (req, res) => {
  try {
    const { project_id, project_site_id, fromDate, toDate } = req.body;


    /* 1. Basic validation */
    if (!project_id || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "project_id, fromDate and toDate are required",
      });
    }


    if (!dayjs(fromDate).isValid() || !dayjs(toDate).isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }


    /* 2. Load project header info */
    const projectQuery = `
      SELECT 
        p.project_id,
        p.project_name,
        p.city_id,
        c.name AS city_name,
        c.state_id,
        s.name AS state_name,
        p.create_by,
        u.name AS created_by_name,
        p.created_at
      FROM md_project p
      LEFT JOIN lo_cities c ON p.city_id = c.id
      LEFT JOIN lo_states s ON c.state_id = s.id
      LEFT JOIN users u ON p.create_by = u.id
      WHERE p.project_id = ?
    `;


    const project = await customSelectSqlQuery2(projectQuery, [project_id], false);


    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

//work_details_id
    /* 3. Load work progress rows in the given period */
    let workProgressQuery = `
      SELECT 
        wp.work_progress_site_id,
        wp.project_id,
        wp.project_site_id,
        wp.bom_id,
        wp.bom_progress_id,
        wp.remarks,
        wp.total_progress,
        wp.rep_task,
        wp.packet_qty,
        wp.total_qty_of_material_used,
        wp.date,
        wp.created_by,
        wp.created_at,
        wp.updated_at,


        -- Project Site
        ps.project_site_name,
        ps.city_id AS site_city_id,
        sc.name AS site_city_name,
        sc.state_id AS site_state_id,
        ss.name AS site_state_name,


        -- BOM
        b.bom_name,


        -- BOM Progress
        bp.bom_progress_name,
        bp.sl_number AS progress_sl_number,


        -- Creator
        u.name AS creator_name,
        u.email AS creator_email,


        -- Month keys
        DATE_FORMAT(wp.date, '%M %Y') AS month_year,
        DATE_FORMAT(wp.date, '%Y-%m') AS year_month_sort
        
      FROM tx_work_progress wp
      LEFT JOIN md_project_site ps ON wp.project_site_id = ps.project_site_id
      LEFT JOIN lo_cities sc ON ps.city_id = sc.id
      LEFT JOIN lo_states ss ON sc.state_id = ss.id
      LEFT JOIN md_bom b ON wp.bom_id = b.bom_id
      LEFT JOIN md_bom_progress bp ON wp.bom_progress_id = bp.bom_progress_id
      LEFT JOIN users u ON wp.created_by = u.id
      WHERE wp.project_id = ?
        AND wp.date BETWEEN ? AND ?
    `;


    const workParams = [project_id, fromDate, toDate];


    if (project_site_id) {
      workProgressQuery += ` AND wp.project_site_id = ?`;
      workParams.push(project_site_id);
    }


    workProgressQuery += ` ORDER BY wp.date DESC, wp.work_progress_site_id DESC`;


    const workRows = await customSelectSqlQuery2(workProgressQuery, workParams);


    if (!workRows || workRows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No work progress found for the given criteria",
        report_info: {
          project,
          from_date: fromDate,
          to_date: toDate,
          total_records: 0,
        },
        monthly_data: [],
        overall_summary: {
          total_months: 0,
          total_work_entries: 0,
          total_progress: 0,
          total_packets: 0,
          total_materials_used: 0,
          // total_products_consumed: 0,
          unique_sites: 0,
          unique_boms: 0,
        },
        duplicate_steps_analysis: {
          total_duplicate_steps_found: 0,
          duplicate_steps: []
        }
      });
    }


    /* 4. Load all consumed products */
    const workIds = workRows.map((wp) => wp.work_progress_site_id);
    const idList = workIds.join(",");


    const consumedQuery = `
      SELECT 
        ep.expenses_of_project_site_id,
        ep.product_id,
        ep.work_progress_site_id,
        ep.Atc_total,
        ep.Act_Qty,
        ep.created_at,

        p.product_name,
        p.model_no,
        p.hsn_code,
        p.manufacturer_name,


        pt.product_type_name,
        u.unit_name
        
      FROM tx_site_used_items ep
      LEFT JOIN md_product p ON ep.product_id = p.product_id
      LEFT JOIN md_product_type pt ON p.product_type_id = pt.product_type_id
      LEFT JOIN md_unit u ON p.unit_id = u.unit_id
      WHERE ep.work_progress_site_id IN (${idList})
      ORDER BY ep.work_progress_site_id, ep.product_id
    `;


    const consumedRows = await customSelectSqlQuery2(consumedQuery, []);


    /* 5. Build a map: work_progress_site_id -> list of products */
    const productsByWorkId = {};
    for (const row of consumedRows) {
      const key = row.work_progress_site_id;
      if (!productsByWorkId[key]) productsByWorkId[key] = [];


      productsByWorkId[key].push({
        expenses_id: row.expenses_of_project_site_id,
        product_id: row.product_id,
        product_name: row.product_name,
        model_no: row.model_no,
        hsn_code: row.hsn_code,
        product_type: row.product_type_name,
        manufacturer: row.manufacturer_name,
        unit: row.unit_name,
        act_qty: parseFloat(row.Act_Qty || 0),       // ✅ per-step qty
         total_qty: parseFloat(row.Atc_total || 0),   // ✅ total consumed qty

        quantity_consumed: parseFloat(row.Act_Qty),
        consumed_at: row.created_at,
      });
    }


    /* 6. Group work rows by month and attach products */
    const monthBuckets = {};


    for (const wp of workRows) {
      const monthKey = wp.year_month_sort;


      if (!monthBuckets[monthKey]) {
        monthBuckets[monthKey] = {
          month_year: wp.month_year,
          year_month: wp.year_month_sort,
          work_progress_entries: [],
          summary: {
            total_entries: 0,
            total_progress: 0,
            total_packets: 0,
            total_materials_used: 0,
           // total_products_consumed: 0,
          },
        };
      }


      const entry = {
        work_progress_site_id: wp.work_progress_site_id,
        date: wp.date,
        project_site: {
          site_id: wp.project_site_id,
          site_name: wp.project_site_name,
          city: wp.site_city_name,
          state: wp.site_state_name,
        },
        bom: {
          bom_id: wp.bom_id,
          bom_name: wp.bom_name,
        },
        bom_progress: {
          progress_id: wp.bom_progress_id,
          progress_name: wp.bom_progress_name,
          sl_number: wp.progress_sl_number,
        },
        work_details: {
          remarks: wp.remarks,
          total_progress: parseFloat(wp.total_progress || 0),
          rep_task: wp.rep_task,
          packet_qty: parseFloat(wp.packet_qty || 0),
          total_qty_of_material_used: parseFloat(wp.total_qty_of_material_used || 0),
        },
        consumed_products: productsByWorkId[wp.work_progress_site_id] || [],
        created_by: {
          user_id: wp.created_by,
          user_name: wp.creator_name,
          user_email: wp.creator_email,
        },
        timestamps: {
          created_at: wp.created_at,
          updated_at: wp.updated_at,
        },
      };


      monthBuckets[monthKey].work_progress_entries.push(entry);


      monthBuckets[monthKey].summary.total_entries += 1;
      monthBuckets[monthKey].summary.total_progress += entry.work_details.total_progress;
      monthBuckets[monthKey].summary.total_packets += entry.work_details.packet_qty;
      monthBuckets[monthKey].summary.total_materials_used += entry.work_details.total_qty_of_material_used;
      //monthBuckets[monthKey].summary.total_products_consumed += entry.consumed_products.length;
    }


    const monthly_data = Object.values(monthBuckets).sort((a, b) =>
      b.year_month.localeCompare(a.year_month)
    );


    /* 7. Build overall summary */
    const overall_summary = {
      total_months: monthly_data.length,
      total_work_entries: workRows.length,
      total_progress: workRows.reduce(
        (sum, wp) => sum + parseFloat(wp.total_progress || 0),
        0
      ),
      total_packets: workRows.reduce(
        (sum, wp) => sum + parseFloat(wp.packet_qty || 0),
        0
      ),
      total_materials_used: workRows.reduce(
        (sum, wp) => sum + parseFloat(wp.total_qty_of_material_used || 0),
        0
      ),
     // total_products_consumed: consumedRows.length,
      unique_sites: new Set(workRows.map((wp) => wp.project_site_id)).size,
      unique_boms: new Set(workRows.map((wp) => wp.bom_id)).size,
    };


    /* 8. Detect duplicate STEPS (BOM Progress) per project site */
    const stepUsageByProjectSite = {};

    for (const wp of workRows) {
      const siteId = wp.project_site_id;
      const stepId = wp.bom_progress_id;
      
      if (!stepUsageByProjectSite[siteId]) {
        stepUsageByProjectSite[siteId] = {};
      }
      
      if (!stepUsageByProjectSite[siteId][stepId]) {
        stepUsageByProjectSite[siteId][stepId] = {
          step_id: stepId,
          step_name: wp.bom_progress_name,
          sl_number: wp.progress_sl_number,
          site_id: siteId,
          site_name: wp.project_site_name,
          site_city: wp.site_city_name,
          site_state: wp.site_state_name,
          usage_count: 0,
          used_in_boms: []
        };
      }
      
      stepUsageByProjectSite[siteId][stepId].usage_count += 1;
      stepUsageByProjectSite[siteId][stepId].used_in_boms.push({
        work_progress_site_id: wp.work_progress_site_id,
        date: wp.date,
        bom_id: wp.bom_id,
        bom_name: wp.bom_name,
        remarks: wp.remarks,
        total_progress: parseFloat(wp.total_progress || 0),
        packet_qty: parseFloat(wp.packet_qty || 0),
        total_qty_of_material_used: parseFloat(wp.total_qty_of_material_used || 0),
        created_by: wp.creator_name
      });
    }

    // Extract only duplicate steps (used more than once)
    const duplicate_steps_report = [];

    for (const siteId in stepUsageByProjectSite) {
      for (const stepId in stepUsageByProjectSite[siteId]) {
        const stepData = stepUsageByProjectSite[siteId][stepId];
        
        if (stepData.usage_count > 1) {
          duplicate_steps_report.push({
            project_site: {
              site_id: stepData.site_id,
              site_name: stepData.site_name,
              city: stepData.site_city,
              state: stepData.site_state
            },
            step: {
              step_id: stepData.step_id,
              step_name: stepData.step_name,
              sl_number: stepData.sl_number
            },
            duplicate_count: stepData.usage_count,
            used_in_boms: stepData.used_in_boms.sort((a, b) => 
              new Date(b.date) - new Date(a.date)
            )
          });
        }
      }
    }

    // Sort by duplicate count (highest first)
    duplicate_steps_report.sort((a, b) => b.duplicate_count - a.duplicate_count);


    /* 9. Final response */
    return res.status(200).json({
      success: true,
      message: "Monthly work report generated successfully",
      report_info: {
        project,
        from_date: fromDate,
        to_date: toDate,
        report_period: `${dayjs(fromDate).format("DD MMM YYYY")} to ${dayjs(toDate).format(
          "DD MMM YYYY"
        )}`,
        generated_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      },
      overall_summary,
      monthly_data,
      duplicate_steps_analysis: {
        total_duplicate_steps_found: duplicate_steps_report.length,
        duplicate_steps: duplicate_steps_report
      }
    });
  } catch (error) {
    console.error("Error generating monthly work report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate monthly work report",
      error: error.message,
    });
  }
};



  // ------------------------------------------------------------
  // READ (GROUPED)
  // ------------------------------------------------------------

// getBomItemsByProjectAndSiteForComparison = async (req, res) => {
//   try {
//     const { project_id, project_site_id } = req.body;

//     if (!project_id || !project_site_id) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id and project_site_id are required",
//       });
//     }

//     const sql = `
//       SELECT 
//           bi.bom_item_id,
//           bi.bom_id,
//           bi.bom_progress_id,
//           bi.product_id,
//           bi.qty,
//           bi.total_qty,
//           bi.created_by,
//           bi.created_at,
//           bi.updated_at,

//           p.product_name,
//           p.qty AS product_qty,
//           u.unit_name

//       FROM md_bom_item bi

//       LEFT JOIN md_product p 
//         ON bi.product_id = p.product_id

//       LEFT JOIN md_unit u
//         ON p.unit_id = u.unit_id

//       LEFT JOIN tx_work_progress w
//         ON bi.bom_id = w.bom_id
//        AND bi.bom_progress_id = w.bom_progress_id

//       WHERE w.project_id = ${project_id}
//         AND w.project_site_id = ${project_site_id}

//       ORDER BY bi.bom_item_id;
//     `;

//     const rows = await customSelectSqlQuery(sql);

//     return res.status(200).json({
//       success: true,
//       data: rows,
//     });

//   } catch (error) {
//     console.error("FETCH BOM ITEMS ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch BOM items",
//     });
//   }
// };


// getBomItemsByProjectAndSiteForComparison = async (req, res) => {
//   try {
//     const { project_id, project_site_id } = req.body;

//     if (!project_id || !project_site_id) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id and project_site_id are required",
//       });
//     }

//     const sql = `
//       SELECT 
//           bi.product_id,
//           p.product_name,
//           u.unit_name,

//           SUM(bi.qty) AS qty,
//           SUM(bi.total_qty) AS total_qty,
//           SUM(p.qty) AS product_qty,

//           MIN(bi.bom_item_id) AS bom_item_id,
//           MIN(bi.bom_id) AS bom_id,
//           MIN(bi.bom_progress_id) AS bom_progress_id,
//           MIN(bi.created_by) AS created_by,
//           MIN(bi.created_at) AS created_at,
//           MIN(bi.updated_at) AS updated_at

//       FROM md_bom_item bi

//       LEFT JOIN md_product p 
//         ON bi.product_id = p.product_id

//       LEFT JOIN md_unit u
//         ON p.unit_id = u.unit_id

//       LEFT JOIN tx_work_progress w
//         ON bi.bom_id = w.bom_id
//        AND bi.bom_progress_id = w.bom_progress_id

//       WHERE w.project_id = ?
//         AND w.project_site_id = ?

//       GROUP BY 
//           bi.product_id,
//           p.product_name,
//           u.unit_name

//       ORDER BY bi.product_id;
//     `;

//     const rows = await customSelectSqlQuery2(sql, [
//       project_id,
//       project_site_id,
//     ]);

//     return res.status(200).json({
//       success: true,
//       data: rows,
//     });

//   } catch (error) {
//     console.error("FETCH GROUPED BOM ITEMS ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch grouped BOM items",
//     });
//   }
// };





getBomItemsByProjectAndSiteForComparison = async (req, res) => {
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
          bi.product_id,
          p.product_name,
          u.unit_name,

          SUM(w.total_qty_of_material_used) AS used_qty,  -- ✅ SITE USED QTY
        --  SUM(bi.total_qty) AS total_bom_qty,             -- ✅ BOM total qty
          SUM(p.qty) AS product_qty,

          MIN(bi.bom_item_id) AS bom_item_id,
          MIN(bi.bom_id) AS bom_id,
          MIN(bi.bom_progress_id) AS bom_progress_id

      FROM md_bom_item bi

      LEFT JOIN md_product p 
        ON bi.product_id = p.product_id

      LEFT JOIN md_unit u
        ON p.unit_id = u.unit_id

      LEFT JOIN tx_work_progress w
        ON bi.bom_id = w.bom_id
       AND bi.bom_progress_id = w.bom_progress_id

      WHERE w.project_id = ?
        AND w.project_site_id = ?

      GROUP BY  
          bi.product_id,
          p.product_name,
          u.unit_name

      ORDER BY bi.product_id;
    `;

    const rows = await customSelectSqlQuery2(sql, [
      project_id,
      project_site_id,
    ]);

    return res.status(200).json({
      success: true,
      data: rows,
    });

  } catch (error) {
    console.error("FETCH GROUPED BOM ITEMS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch grouped BOM items",
    });
  }
};
//////*************** */


getBomItemsByProjectComparisonData = async (req, res) => {
  try {
    const { project_id, project_site_id } = req.body;

    if (!project_id || !project_site_id) {
      return res.status(400).json({
        success: false,
        message: "project_id and project_site_id are required"
      });
    }

    const sql = `
      SELECT 
        t.project_id,
        p.project_name,
        t.site_id,
        s.project_site_name,

        t.bom_id,
        t.bom_name,
        t.rep_task,

        bp.bom_progress_id,
        bp.bom_progress_name,

        bi.total_qty,

        pr.product_name,
        pr.product_type_id,
        uom.unit_name

      FROM tx_project_details_with_estimation t
      LEFT JOIN md_project p ON t.project_id = p.project_id
      LEFT JOIN md_project_site s ON t.site_id = s.project_site_id

      LEFT JOIN md_bom_progress bp ON t.bom_id = bp.bom_id
      LEFT JOIN md_bom_item bi 
             ON bp.bom_progress_id = bi.bom_progress_id 
            AND t.bom_id = bi.bom_id

      LEFT JOIN md_product pr ON bi.product_id = pr.product_id
      LEFT JOIN md_unit uom ON pr.unit_id = uom.unit_id

      WHERE t.project_id = ?
        AND t.site_id = ?

      ORDER BY t.bom_id, bp.sl_number, bi.bom_item_id
    `;

    const rows = await customSelectSqlQuery2(sql, [
      project_id,
      project_site_id
    ]);

    const map = new Map();

    for (const row of rows) {

      if (!map.has(row.bom_id)) {
        map.set(row.bom_id, {
          project_id: row.project_id,
          project_name: row.project_name,
          site_id: row.site_id,
          site_name: row.project_site_name,
          bom_id: row.bom_id,
          bom_name: row.bom_name,
          rep_task: row.rep_task,
          progresses: new Map()
        });
      }

      const bom = map.get(row.bom_id);

      if (row.bom_progress_id && !bom.progresses.has(row.bom_progress_id)) {
        bom.progresses.set(row.bom_progress_id, {
          bom_progress_id: row.bom_progress_id,
          bom_progress_name: row.bom_progress_name,
          items: []
        });
      }

      if (row.bom_progress_id && row.product_name) {

        const totalQty = Number(row.total_qty || 0);
        const repTask = Number(row.rep_task || 0);

        bom.progresses.get(row.bom_progress_id).items.push({
          total_qty: totalQty,
          product_name: row.product_name,
          unit: row.unit_name,
          product_type_id: row.product_type_id,

          // ✅ THIS IS YOUR REQUIRED VALUE
          calculated_total_qty: totalQty * repTask
        });
      }
    }

    const result = [];
    for (const bom of map.values()) {
      bom.progresses = Array.from(bom.progresses.values());
      result.push(bom);
    }

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch BOM comparison data"
    });
  }
};
/******** */


/////////////////////


getUsedQuantityTillDate = async (req, res) => {
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
        sui.product_id,
        pr.product_name,
        u.unit_name,

        wp.bom_id,
        b.bom_name,

        wp.bom_progress_id,
        bp.bom_progress_name,

        -- Actual Used Qty
        SUM(sui.Act_Qty) AS total_used_qty,

        -- BOM Qty consumed
        SUM(sui.bom_product_qty) AS total_bom_product_qty,

        -- Estimated Qty from Project Estimation
        MAX(
          COALESCE(pde.rep_task, 0) *
          COALESCE(bi.total_qty, 0)
        ) AS total_required_qty,

        COUNT(DISTINCT wp.work_progress_site_id) AS entry_count

      FROM tx_site_used_items sui

      INNER JOIN tx_work_progress wp
        ON sui.work_progress_site_id = wp.work_progress_site_id

      LEFT JOIN md_product pr
        ON sui.product_id = pr.product_id

      LEFT JOIN md_unit u
        ON pr.unit_id = u.unit_id

      LEFT JOIN md_bom_progress bp
        ON wp.bom_progress_id = bp.bom_progress_id

      LEFT JOIN md_bom b
        ON wp.bom_id = b.bom_id

      LEFT JOIN md_bom_item bi
        ON bi.bom_id = wp.bom_id
        AND bi.product_id = sui.product_id
        AND bi.bom_progress_id = wp.bom_progress_id

      LEFT JOIN tx_project_details_with_estimation pde
        ON pde.project_id = wp.project_id
        AND pde.site_id = wp.project_site_id
        AND pde.bom_id = wp.bom_id

      WHERE wp.project_id = ?
        AND wp.project_site_id = ?

      GROUP BY
        sui.product_id,
        pr.product_name,
        u.unit_name,
        wp.bom_id,
        b.bom_name,
        wp.bom_progress_id,
        bp.bom_progress_name

      ORDER BY
        wp.bom_id,
        wp.bom_progress_id,
        sui.product_id
    `;

    const rows = await customSelectSqlQuery2(sql, [
      project_id,
      project_site_id,
    ]);

    const bomMap = new Map();

    for (const row of rows) {
      if (!bomMap.has(row.bom_id)) {
        bomMap.set(row.bom_id, {
          bom_id: row.bom_id,
          bom_name: row.bom_name,
          progresses: new Map(),
        });
      }

      const bom = bomMap.get(row.bom_id);

      if (!bom.progresses.has(row.bom_progress_id)) {
        bom.progresses.set(row.bom_progress_id, {
          bom_progress_id: row.bom_progress_id,
          bom_progress_name: row.bom_progress_name,
          products: [],
        });
      }

      const estimatedQty = Number(row.total_required_qty || 0);
      const usedQty = Number(row.total_used_qty || 0);

      bom.progresses.get(row.bom_progress_id).products.push({
        product_id: row.product_id,
        product_name: row.product_name,
        unit_name: row.unit_name,

        // Estimation Qty
        estimated_qty: estimatedQty,

        // Actual Used Qty
        total_used_qty: usedQty,

        // BOM Qty Used
        total_bom_product_qty: Number(
          row.total_bom_product_qty || 0
        ),

        // Remaining
        remaining_qty: estimatedQty - usedQty,

        // Over Consumption Flag
        is_exceeded: usedQty > estimatedQty,

        over_used_qty:
          usedQty > estimatedQty
            ? usedQty - estimatedQty
            : 0,

        entry_count: Number(row.entry_count || 0),
      });
    }

    const result = [];

    for (const bom of bomMap.values()) {
      bom.progresses = Array.from(bom.progresses.values());
      result.push(bom);
    }

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("GET USED QTY TILL DATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch used quantity till date",
    });
  }
};
/////////


/////////////////////////////////////



// getWorkProgressByProjectAndSite = async (req, res) => { 
//   try {
//     const { project_id, project_site_id } = req.body;

//     if (!project_id || !project_site_id) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id and project_site_id are required",
//       });
//     }
 
//     const sql = `
//       SELECT DISTINCT
//           w.work_progress_site_id,
//           w.project_id,
//           w.project_site_id,
//           w.bom_id,
//           w.bom_progress_id,
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

//       FROM tx_work_progress w
//       LEFT JOIN md_project p ON w.project_id = p.project_id
//       LEFT JOIN md_project_site s ON w.project_site_id = s.project_site_id
//       LEFT JOIN md_bom b ON w.bom_id = b.bom_id
//       LEFT JOIN em_employees e ON w.created_by = e.employee_id

//       -- FIXED JOIN ↓↓↓
//       LEFT JOIN md_bom_item bi 
//              ON bi.bom_id = w.bom_id
//             AND bi.bom_progress_id = w.bom_progress_id  -- IMPORTANT JOIN FIX

//       LEFT JOIN md_bom_progress bp 
//              ON w.bom_progress_id = bp.bom_progress_id 

//       LEFT JOIN md_product pr 
//              ON bi.product_id = pr.product_id

//       WHERE w.project_id = ${project_id}
//         AND w.project_site_id = ${project_site_id}

//       ORDER BY w.bom_id, w.bom_progress_id, bi.bom_item_id;
//     `;

//     const rows = await customSelectSqlQuery(sql);

//     return res.status(200).json({
//       success: true,
//       data: rows,
//     });
//   } catch (err) {
//     console.error("FETCH ERROR:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch work progress",
//     });
//   }
// };



// getWorkProgressByProjectAndSite = async (req, res) => {
//   try {
//     const { project_id, project_site_id } = req.body;

//     if (!project_id || !project_site_id) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id and project_site_id are required",
//       });
//     }

//     const sql = `
//       SELECT DISTINCT
//           w.work_progress_site_id,
//           w.project_id,
//           w.project_site_id,
//           w.bom_id,
//           w.bom_progress_id,
//           w.remarks,
//           w.total_progress,
//           w.rep_task,
//           w.packet_qty,
//           w.total_qty_of_material_used,
//           w.date,
//           w.created_at,
//           w.updated_at,

//           p.project_name,
//           s.project_site_name,
//           b.bom_name,

//           bi.bom_item_id,
//           bi.bom_progress_id AS bom_item_progress_id,
//           bi.product_id AS bom_product_id,
//           bi.qty AS bom_item_qty,
//           bi.total_qty AS bom_item_total_qty,

//           bp.bom_progress_name AS bom_progress_name,
//           pr.product_name,

//           t.project_estimation_id,
//           t.billing_id,
//           t.rep_task AS estimated_rep_task,
//           t.bom_price,
//           t.bom_unit,
//           t.bom_value_unit,

//           pb.project_work_description,
//           pb.unit AS billing_unit,
//           pb.hsn_code

//       FROM tx_work_progress w
//       LEFT JOIN md_project p ON w.project_id = p.project_id
//       LEFT JOIN md_project_site s ON w.project_site_id = s.project_site_id
//       LEFT JOIN md_bom b ON w.bom_id = b.bom_id

//       LEFT JOIN md_bom_item bi 
//              ON bi.bom_id = w.bom_id
//             AND bi.bom_progress_id = w.bom_progress_id

//       LEFT JOIN md_bom_progress bp 
//              ON w.bom_progress_id = bp.bom_progress_id 

//       LEFT JOIN md_product pr 
//              ON bi.product_id = pr.product_id

//       LEFT JOIN tx_project_details_with_estimation t
//              ON t.project_id = w.project_id
//             AND t.bom_id = w.bom_id
//             AND t.site_id = w.project_site_id

//       LEFT JOIN md_project_billing pb
//              ON pb.billing_id = t.billing_id

//       WHERE w.project_id = ?
//         AND w.project_site_id = ?

//       ORDER BY w.bom_id, w.bom_progress_id, w.work_progress_site_id, bi.bom_item_id;
//     `;

//     const rows = await customSelectSqlQuery2(sql, [project_id, project_site_id]);

//     /* ---------------- GROUP ROWS BY work_progress_site_id ---------------- */
//     const workProgressMap = new Map();

//     for (const row of rows) {
//       const key = row.work_progress_site_id;

//       if (!workProgressMap.has(key)) {
//         workProgressMap.set(key, {
//           work_progress_site_id: row.work_progress_site_id,
//           project_id: row.project_id,
//           project_site_id: row.project_site_id,
//           bom_id: row.bom_id,
//           bom_progress_id: row.bom_progress_id,
//           remarks: row.remarks,
//           total_progress: row.total_progress,
//           rep_task: row.rep_task,
//           packet_qty: row.packet_qty,
//           total_qty_of_material_used: row.total_qty_of_material_used,
//           date: row.date,
//           created_at: row.created_at,
//           updated_at: row.updated_at,

//           project_name: row.project_name,
//           project_site_name: row.project_site_name,
//           bom_name: row.bom_name,
//           bom_progress_name: row.bom_progress_name,

//           project_estimation_id: row.project_estimation_id,
//           billing_id: row.billing_id,
//           estimated_rep_task: row.estimated_rep_task,
//           bom_price: row.bom_price,
//           bom_unit: row.bom_unit,
//           bom_value_unit: row.bom_value_unit,

//           project_work_description: row.project_work_description,
//           billing_unit: row.billing_unit,
//           hsn_code: row.hsn_code,

//           bom_items: [],
//         });
//       }

//       const entry = workProgressMap.get(key);

//       if (row.bom_item_id != null) {
//         const alreadyAdded = entry.bom_items.some(
//           (i) => i.bom_item_id === row.bom_item_id
//         );

//         if (!alreadyAdded) {
//           entry.bom_items.push({
//             bom_item_id: row.bom_item_id,
//             bom_item_progress_id: row.bom_item_progress_id,
//             product_id: row.bom_product_id,
//             product_name: row.product_name,
//             qty: row.bom_item_qty,
//             total_qty: row.bom_item_total_qty,
//           });
//         }
//       }
//     }

//     const data = Array.from(workProgressMap.values());

//     return res.status(200).json({
//       success: true,
//       data,
//     });
//   } catch (err) {
//     console.error("FETCH ERROR:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch work progress",
//     });
//   }
// };


// getWorkProgressByProjectAndSite = async (req, res) => {
//   try {
//     const { project_id, project_site_id } = req.body;

//     if (!project_id || !project_site_id) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id and project_site_id are required",
//       });
//     }

//     /* ---------------- BOM STRUCTURE DATA ---------------- */
//     const bomSql = `
//       SELECT
//         t.project_estimation_id,
//         t.project_id,
//         p.project_name,
//         t.site_id,
//         s.project_site_name,
//         t.bom_id,
//         b.bom_name,
//         t.rep_task,
//         t.billing_id,
//         t.bom_price,
//         t.bom_unit,
//         t.bom_value_unit,

//         pb.project_work_description,
//         pb.unit AS billing_unit,

//         bp.bom_progress_id,
//         bp.bom_progress_name,
//         bp.sl_number,

//         bi.bom_item_id,
//         bi.product_id,
//         bi.qty AS per_unit_qty,
//         bi.total_qty,

//         pr.product_name,
//         pr.product_type_id,
//         pr.hsn_code,
//         uom.unit_name AS unit

//       FROM tx_project_details_with_estimation t
//       LEFT JOIN md_project p ON t.project_id = p.project_id
//       LEFT JOIN md_project_site s ON t.site_id = s.project_site_id
//       LEFT JOIN md_bom b ON t.bom_id = b.bom_id
//       LEFT JOIN md_project_billing pb ON t.billing_id = pb.billing_id
//       LEFT JOIN md_bom_progress bp ON t.bom_id = bp.bom_id
//       LEFT JOIN md_bom_item bi 
//         ON bp.bom_progress_id = bi.bom_progress_id
//        AND t.bom_id = bi.bom_id
//       LEFT JOIN md_product pr ON bi.product_id = pr.product_id
//       LEFT JOIN md_unit uom ON pr.unit_id = uom.unit_id

//       WHERE t.project_id = ?
//         AND t.site_id = ?

//       ORDER BY t.billing_id, t.bom_id, bp.sl_number, bi.bom_item_id
//     `;

//     /* ---------------- MATERIAL USED PER WORK-PROGRESS ENTRY ---------------- */
//     const materialSql = `
//       SELECT
//         w.work_progress_site_id,
//         w.bom_id,
//         w.bom_progress_id,
//         si.product_id,
//         SUM(COALESCE(si.Act_Qty, 0)) AS total_material_used
//       FROM tx_work_progress w
//       INNER JOIN tx_site_used_items si
//         ON si.work_progress_site_id = w.work_progress_site_id
//       WHERE w.project_id = ?
//         AND w.project_site_id = ?
//       GROUP BY
//         w.work_progress_site_id,
//         w.bom_id,
//         w.bom_progress_id,
//         si.product_id
//     `;

//     const [bomRows, materialRows] = await Promise.all([
//       customSelectSqlQuery2(bomSql, [project_id, project_site_id]),
//       customSelectSqlQuery2(materialSql, [project_id, project_site_id]),
//     ]);

//     if (!bomRows || bomRows.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: "No work progress data found",
//         data: [],
//       });
//     }

//     /* ---------------- WORK MAP: bom_id_progress_id_product_id -> [{site, used}] ---------------- */
//     const workMap = new Map();

//     for (const row of materialRows || []) {
//       if (!row.bom_id || !row.bom_progress_id || !row.product_id) continue;

//       const key = `${row.bom_id}_${row.bom_progress_id}_${row.product_id}`;

//       if (!workMap.has(key)) {
//         workMap.set(key, []);
//       }

//       workMap.get(key).push({
//         work_progress_site_id: row.work_progress_site_id,
//         used: parseFloat(row.total_material_used || 0),
//       });
//     }

//     // bom_id -> product_id -> { qtyPerUnit, totalUsed }  (used for bom_completed_till_date,
//     // summed across ALL progress steps for that product within the bom)
//     const bomProductTotals = new Map();

//     /* ---------------- BUILD NESTED STRUCTURE ---------------- */
//     const billingMap = new Map();

//     for (const row of bomRows) {
//       if (!billingMap.has(row.billing_id)) {
//         billingMap.set(row.billing_id, {
//           billing_id: row.billing_id,
//           project_id: row.project_id,
//           project_name: row.project_name,
//           site_id: row.site_id,
//           site_name: row.project_site_name,
//           project_work_description: row.project_work_description,
//           billing_unit: row.billing_unit,
//           boms: new Map(),
//         });
//       }
//       const billing = billingMap.get(row.billing_id);

//       if (!billing.boms.has(row.project_estimation_id)) {
//         billing.boms.set(row.project_estimation_id, {
//           project_estimation_id: row.project_estimation_id,
//           bom_id: row.bom_id,
//           bom_name: row.bom_name,
//           rep_task: row.rep_task,
//           bom_price: row.bom_price,
//           bom_unit: row.bom_unit || null,
//           bom_value_unit: row.bom_value_unit,
//           bom_completed_till_date: 0, // filled in after the loop
//           progresses: new Map(),
//         });
//       }
//       const bom = billing.boms.get(row.project_estimation_id);

//       if (row.bom_progress_id && !bom.progresses.has(row.bom_progress_id)) {
//         bom.progresses.set(row.bom_progress_id, {
//           bom_progress_id: row.bom_progress_id,
//           bom_progress_name: row.bom_progress_name,
//           sl_number: row.sl_number,
//           items: [],
//         });
//       }

//       if (!row.bom_item_id || !row.bom_progress_id) continue;

//       const totalQty = parseFloat(row.total_qty || 0);
//       const repTask = parseFloat(row.rep_task || 1);
//       const requiredQty = totalQty * repTask;

//       const key = `${row.bom_id}_${row.bom_progress_id}_${row.product_id}`;
//       const workEntries = workMap.get(key) || [];

//       const totalUsed = workEntries.reduce((sum, w) => sum + w.used, 0);

//       const work_progress_site_ids = workEntries.map((w) => w.work_progress_site_id);

//       const consumption_details = workEntries.map((w) => ({
//         work_progress_site_id: w.work_progress_site_id,
//         used_qty: w.used,
//       }));

//       bom.progresses.get(row.bom_progress_id).items.push({
//         bom_item_id: row.bom_item_id,
//         product_id: row.product_id,
//         qty: row.per_unit_qty,
//         total_qty: row.total_qty,

//         total_Material_required_for_bom_quantity: requiredQty.toFixed(2),
//         total_material_used_in_site: totalUsed.toFixed(2),

//         work_progress_site_ids,
//         consumption_details,

//         product: {
//           product_id: row.product_id,
//           product_name: row.product_name,
//           unit: row.unit || "Pc",
//           product_type_id: row.product_type_id,
//           hsn_code: row.hsn_code,
//         },
//       });

//       // Accumulate per-product totals at the BOM level (across all progress
//       // steps) for the "BOM completed till date" calculation.
//       if (!bomProductTotals.has(row.bom_id)) {
//         bomProductTotals.set(row.bom_id, new Map());
//       }
//       const productTotals = bomProductTotals.get(row.bom_id);

//       if (!productTotals.has(row.product_id)) {
//         productTotals.set(row.product_id, {
//           qtyPerUnit: parseFloat(row.per_unit_qty || 0),
//           totalUsed: 0,
//         });
//       }
//       productTotals.get(row.product_id).totalUsed += totalUsed;
//     }

//     /* ---------------- COMPUTE bom_completed_till_date PER BOM ---------------- */
//     // A BOM is "completed N times" once EVERY product in it has enough
//     // material used for N repetitions -> take the minimum across products.
//     const bomCompletedMap = new Map();

//     for (const [bomId, productTotals] of bomProductTotals.entries()) {
//       let completed = null;

//       for (const { qtyPerUnit, totalUsed } of productTotals.values()) {
//         const timesCompleted = qtyPerUnit > 0 ? Math.floor(totalUsed / qtyPerUnit) : 0;
//         completed = completed === null ? timesCompleted : Math.min(completed, timesCompleted);
//       }

//       bomCompletedMap.set(bomId, completed || 0);
//     }

//     /* ---------------- FINAL FORMAT ---------------- */
//     const result = [];

//     for (const billing of billingMap.values()) {
//       const bomsArray = [];

//       for (const bom of billing.boms.values()) {
//         bom.bom_completed_till_date = bomCompletedMap.get(bom.bom_id) || 0;
//         bom.progresses = Array.from(bom.progresses.values());
//         bomsArray.push(bom);
//       }

//       billing.boms = bomsArray;
//       result.push(billing);
//     }

//     return res.status(200).json({
//       success: true,
//       data: result,
//     });
//   } catch (err) {
//     console.error("FETCH ERROR:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch work progress",
//     });
//   }
// };


// getWorkProgressByProjectAndSite = async (req, res) => {
//   try {
//     const { project_id, project_site_id } = req.body;

//     if (!project_id || !project_site_id) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id and project_site_id are required",
//       });
//     }

//     /* ---------------- BOM STRUCTURE DATA ---------------- */
//     const bomSql = `
//       SELECT
//         t.project_estimation_id,
//         t.project_id,
//         p.project_name,
//         t.site_id,
//         s.project_site_name,
//         t.bom_id,
//         b.bom_name,
//         t.rep_task,
//         t.billing_id,
//         t.bom_price,
//         t.bom_unit,
//         t.bom_value_unit,

//         pb.project_work_description,
//         pb.unit AS billing_unit,

//         bp.bom_progress_id,
//         bp.bom_progress_name,
//         bp.sl_number,

//         bi.bom_item_id,
//         bi.product_id,
//         bi.qty AS per_unit_qty,
//         bi.total_qty,

//         pr.product_name,
//         pr.product_type_id,
//         pr.hsn_code,
//         uom.unit_name AS unit

//       FROM tx_project_details_with_estimation t
//       LEFT JOIN md_project p ON t.project_id = p.project_id
//       LEFT JOIN md_project_site s ON t.site_id = s.project_site_id
//       LEFT JOIN md_bom b ON t.bom_id = b.bom_id
//       LEFT JOIN md_project_billing pb ON t.billing_id = pb.billing_id
//       LEFT JOIN md_bom_progress bp ON t.bom_id = bp.bom_id
//       LEFT JOIN md_bom_item bi 
//         ON bp.bom_progress_id = bi.bom_progress_id
//        AND t.bom_id = bi.bom_id
//       LEFT JOIN md_product pr ON bi.product_id = pr.product_id
//       LEFT JOIN md_unit uom ON pr.unit_id = uom.unit_id

//       WHERE t.project_id = ?
//         AND t.site_id = ?

//       ORDER BY t.billing_id, t.bom_id, bp.sl_number, bi.bom_item_id
//     `;

//     /* ---------------- MATERIAL USED PER WORK-PROGRESS ENTRY ---------------- */
//     // FIX: DATE_FORMAT forces MySQL to return a plain 'YYYY-MM-DD' STRING,
//     // instead of DATE(...) which many drivers (e.g. mysql2 without
//     // `dateStrings: true`) hand back as a JS Date object. Comparing a Date
//     // object to a string with !== always returns true, which is why
//     // bom_completed_today was always coming back as 0 previously.
//     // ⚠️ Replace w.created_at below with your actual date column if different.
//     const materialSql = `
//       SELECT
//         w.work_progress_site_id,
//         w.bom_id,
//         w.bom_progress_id,
//         DATE_FORMAT(w.created_at, '%Y-%m-%d') AS work_date,
//         si.product_id,
//         SUM(COALESCE(si.Act_Qty, 0)) AS total_material_used
//       FROM tx_work_progress w
//       INNER JOIN tx_site_used_items si
//         ON si.work_progress_site_id = w.work_progress_site_id
//       WHERE w.project_id = ?
//         AND w.project_site_id = ?
//       GROUP BY
//         w.work_progress_site_id,
//         w.bom_id,
//         w.bom_progress_id,
//         DATE_FORMAT(w.created_at, '%Y-%m-%d'),
//         si.product_id
//     `;

//     // FIX: derive "today" from the DATABASE's own clock (same source as
//     // created_at), not from Node's `new Date()`. If the app server and DB
//     // server ever run in different timezones, computing "today" locally in
//     // Node can silently put today's rows in the wrong bucket. Also returned
//     // as a plain string via DATE_FORMAT so it's directly comparable.
//     const todaySql = `SELECT DATE_FORMAT(NOW(), '%Y-%m-%d') AS today_date`;

//     const [bomRows, materialRows, todayRows] = await Promise.all([
//       customSelectSqlQuery2(bomSql, [project_id, project_site_id]),
//       customSelectSqlQuery2(materialSql, [project_id, project_site_id]),
//       customSelectSqlQuery2(todaySql, []),
//     ]);

//     if (!bomRows || bomRows.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: "No work progress data found",
//         data: [],
//       });
//     }

//     // Safe fallback: if the todaySql call somehow returns nothing, fall back
//     // to Node's own date rather than crashing.
//     const todayStr =
//       (todayRows && todayRows[0] && todayRows[0].today_date) ||
//       new Date().toISOString().slice(0, 10);

//     // Defensive normalizer: guarantees a 'YYYY-MM-DD' string no matter what
//     // the driver/DB gives back (string, Date object, or null), so this code
//     // stays correct even if the SQL/driver config changes later.
//     const normalizeDateStr = (value) => {
//       if (!value) return null;
//       if (typeof value === "string") return value.slice(0, 10);
//       if (value instanceof Date && !isNaN(value.getTime())) {
//         return value.toISOString().slice(0, 10);
//       }
//       return String(value).slice(0, 10);
//     };

//     // Safe numeric parser used throughout instead of bare parseFloat, so a
//     // null/undefined/garbage value never turns into NaN and poisons a sum.
//     const toNum = (value, fallback = 0) => {
//       const n = parseFloat(value);
//       return Number.isFinite(n) ? n : fallback;
//     };

//     /* ---------------- WORK MAP: bom_id_progress_id_product_id -> [{site, used, date}] ---------------- */
//     const workMap = new Map();

//     for (const row of materialRows || []) {
//       if (!row.bom_id || !row.bom_progress_id || !row.product_id) continue;

//       const key = `${row.bom_id}_${row.bom_progress_id}_${row.product_id}`;

//       if (!workMap.has(key)) {
//         workMap.set(key, []);
//       }

//       workMap.get(key).push({
//         work_progress_site_id: row.work_progress_site_id,
//         used: toNum(row.total_material_used, 0),
//         work_date: normalizeDateStr(row.work_date), // always 'YYYY-MM-DD' or null
//       });
//     }

//     // FIX: "BOM completed N times" means EVERY individual bom_item line, in
//     // EVERY progress step, has enough material used for N repetitions of
//     // that specific line (using that line's own total_qty as the
//     // per-completion requirement). It is the min across ALL bom_item rows —
//     // never merged/summed across progress steps by product, and never
//     // divided by per_unit_qty. Merging by product previously let a
//     // fast-moving step mask a slow bottleneck step, which both inflated
//     // bom_completed_till_date and made bom_completed_today overcount.
//     // bom_id -> minimum "times completed" across all its bom_item lines
//     const bomCompletedTillDateMin = new Map(); // includes today
//     const bomCompletedYesterdayMin = new Map(); // excludes today

//     /* ---------------- BUILD NESTED STRUCTURE ---------------- */
//     const billingMap = new Map();

//     for (const row of bomRows) {
//       if (!billingMap.has(row.billing_id)) {
//         billingMap.set(row.billing_id, {
//           billing_id: row.billing_id,
//           project_id: row.project_id,
//           project_name: row.project_name,
//           site_id: row.site_id,
//           site_name: row.project_site_name,
//           project_work_description: row.project_work_description,
//           billing_unit: row.billing_unit,
//           boms: new Map(),
//         });
//       }
//       const billing = billingMap.get(row.billing_id);

//       if (!billing.boms.has(row.project_estimation_id)) {
//         billing.boms.set(row.project_estimation_id, {
//           project_estimation_id: row.project_estimation_id,
//           bom_id: row.bom_id,
//           bom_name: row.bom_name,
//           rep_task: row.rep_task,
//           bom_price: row.bom_price,
//           bom_unit: row.bom_unit || null,
//           bom_value_unit: row.bom_value_unit,
//           bom_completed_till_date: 0, // filled in after the loop
//           remaining_bom_quantity: 0, // filled in after the loop
//           bom_completed_today: 0, // filled in after the loop
//           progresses: new Map(),
//         });
//       }
//       const bom = billing.boms.get(row.project_estimation_id);

//       if (row.bom_progress_id && !bom.progresses.has(row.bom_progress_id)) {
//         bom.progresses.set(row.bom_progress_id, {
//           bom_progress_id: row.bom_progress_id,
//           bom_progress_name: row.bom_progress_name,
//           sl_number: row.sl_number,
//           items: [],
//         });
//       }

//       if (!row.bom_item_id || !row.bom_progress_id) continue;

//       const totalQty = toNum(row.total_qty, 0);
//       const repTask = toNum(row.rep_task, 1);
//       const requiredQty = totalQty * repTask;

//       const key = `${row.bom_id}_${row.bom_progress_id}_${row.product_id}`;
//       const workEntries = workMap.get(key) || [];

//       const totalUsed = workEntries.reduce((sum, w) => sum + w.used, 0);
//       const totalUsedYesterday = workEntries
//         .filter((w) => w.work_date !== todayStr) // both sides are now plain strings
//         .reduce((sum, w) => sum + w.used, 0);

//       const work_progress_site_ids = workEntries.map((w) => w.work_progress_site_id);

//       const consumption_details = workEntries.map((w) => ({
//         work_progress_site_id: w.work_progress_site_id,
//         used_qty: w.used,
//         work_date: w.work_date,
//       }));

//       bom.progresses.get(row.bom_progress_id).items.push({
//         bom_item_id: row.bom_item_id,
//         product_id: row.product_id,
//         qty: row.per_unit_qty,
//         total_qty: row.total_qty,

//         total_Material_required_for_bom_quantity: requiredQty.toFixed(2),
//         total_material_used_in_site: totalUsed.toFixed(2),

//         work_progress_site_ids,
//         consumption_details,

//         product: {
//           product_id: row.product_id,
//           product_name: row.product_name,
//           unit: row.unit || "Pc",
//           product_type_id: row.product_type_id,
//           hsn_code: row.hsn_code,
//         },
//       });

//       // How many times THIS SPECIFIC line (this product, in this exact
//       // progress step) has been fulfilled — using its own total_qty as the
//       // per-completion requirement. Every bom_item line must independently
//       // clear N repetitions for the whole BOM to count as completed N times.
//       const timesCompletedTillDate = totalQty > 0 ? Math.floor(totalUsed / totalQty) : 0;
//       const timesCompletedYesterday = totalQty > 0 ? Math.floor(totalUsedYesterday / totalQty) : 0;

//       const prevTillDateMin = bomCompletedTillDateMin.has(row.bom_id)
//         ? bomCompletedTillDateMin.get(row.bom_id)
//         : null;
//       bomCompletedTillDateMin.set(
//         row.bom_id,
//         prevTillDateMin === null ? timesCompletedTillDate : Math.min(prevTillDateMin, timesCompletedTillDate)
//       );

//       const prevYesterdayMin = bomCompletedYesterdayMin.has(row.bom_id)
//         ? bomCompletedYesterdayMin.get(row.bom_id)
//         : null;
//       bomCompletedYesterdayMin.set(
//         row.bom_id,
//         prevYesterdayMin === null ? timesCompletedYesterday : Math.min(prevYesterdayMin, timesCompletedYesterday)
//       );
//     }

//     /* ---------------- FINAL FORMAT ---------------- */
//     const result = [];

//     for (const billing of billingMap.values()) {
//       const bomsArray = [];

//       for (const bom of billing.boms.values()) {
//         const completedTillDate = bomCompletedTillDateMin.get(bom.bom_id) || 0;
//         const completedTillYesterday = bomCompletedYesterdayMin.get(bom.bom_id) || 0;
//         const repTaskNum = toNum(bom.rep_task, 0);

//         bom.bom_completed_till_date = completedTillDate;
//         // Clamped at 0 — a BOM can't be "over-completed" in a negative sense
//         // from this metric's point of view (guards against bad/legacy data).
//         bom.remaining_bom_quantity = Math.max(0, repTaskNum - completedTillDate);
//         // Clamped at 0 too — a negative value would only occur if usage
//         // records were edited/deleted after being counted, which shouldn't
//         // be surfaced as "negative progress today".
//         bom.bom_completed_today = Math.max(0, completedTillDate - completedTillYesterday);

//         bom.progresses = Array.from(bom.progresses.values());
//         bomsArray.push(bom);
//       }

//       billing.boms = bomsArray;
//       result.push(billing);
//     }

//     return res.status(200).json({
//       success: true,
//       data: result,
//     });
//   } catch (err) {
//     console.error("FETCH ERROR:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch work progress",
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

    /* ---------------- BOM STRUCTURE DATA ---------------- */
    // const bomSql = `
    //   SELECT
    //     t.project_estimation_id,
    //     t.project_id,
    //     p.project_name,
    //     t.site_id,
    //     s.project_site_name,
    //     t.bom_id,
    //     b.bom_name,
    //     t.rep_task,
    //     t.billing_id,
    //     t.bom_price,
    //     t.bom_unit,
    //     t.bom_value_unit,

    //     pb.project_work_description,
    //     pb.unit AS billing_unit,

    //     bp.bom_progress_id,
    //     bp.bom_progress_name,
    //     bp.sl_number,

    //     bi.bom_item_id,
    //     bi.product_id,
    //     bi.qty AS per_unit_qty,
    //     bi.total_qty,

    //     pr.product_name,
    //     pr.product_type_id,
    //     pr.hsn_code,
    //     uom.unit_name AS unit

    //   FROM tx_project_details_with_estimation t
    //   LEFT JOIN md_project p ON t.project_id = p.project_id
    //   LEFT JOIN md_project_site s ON t.site_id = s.project_site_id
    //   LEFT JOIN md_bom b ON t.bom_id = b.bom_id
    //   LEFT JOIN md_project_billing pb ON t.billing_id = pb.billing_id
    //   LEFT JOIN md_bom_progress bp ON t.bom_id = bp.bom_id
    //   LEFT JOIN md_bom_item bi 
    //     ON bp.bom_progress_id = bi.bom_progress_id
    //    AND t.bom_id = bi.bom_id
    //   LEFT JOIN md_product pr ON bi.product_id = pr.product_id
    //   LEFT JOIN md_unit uom ON pr.unit_id = uom.unit_id

    //   WHERE t.project_id = ?
    //     AND t.site_id = ?

    //   ORDER BY t.billing_id, t.bom_id, bp.sl_number, bi.bom_item_id
    // `;



    const bomSql = `
      SELECT
        t.project_estimation_id,
        t.project_id,
        p.project_name,
        t.site_id,
        s.project_site_name,
        t.bom_id,
        b.bom_name,
        t.rep_task,
        t.billing_id,
        t.bom_price,
        t.bom_unit,
        t.bom_value_unit,

        wd.work_description AS project_work_description,
        pb.unit AS billing_unit,

        bp.bom_progress_id,
        bp.bom_progress_name,
        bp.sl_number,

        bi.bom_item_id,
        bi.product_id,
        bi.qty AS per_unit_qty,
        bi.total_qty,

        pr.product_name,
        pr.product_type_id,
        pr.hsn_code,
        uom.unit_name AS unit

      FROM tx_project_details_with_estimation t
      LEFT JOIN md_project p ON t.project_id = p.project_id
      LEFT JOIN md_project_site s ON t.site_id = s.project_site_id
      LEFT JOIN md_bom b ON t.bom_id = b.bom_id
      LEFT JOIN md_project_billing pb ON t.billing_id = pb.billing_id
      LEFT JOIN md_project_work_description wd
        ON pb.project_work_description_id = wd.project_work_description_id
      LEFT JOIN md_bom_progress bp ON t.bom_id = bp.bom_id
      LEFT JOIN md_bom_item bi 
        ON bp.bom_progress_id = bi.bom_progress_id
       AND t.bom_id = bi.bom_id
      LEFT JOIN md_product pr ON bi.product_id = pr.product_id
      LEFT JOIN md_unit uom ON pr.unit_id = uom.unit_id

      WHERE t.project_id = ?
        AND t.site_id = ?

      ORDER BY t.billing_id, t.bom_id, bp.sl_number, bi.bom_item_id
    `;


    /* ---------------- MATERIAL USED PER WORK-PROGRESS ENTRY ---------------- */
    // FIX: DATE_FORMAT forces MySQL to return a plain 'YYYY-MM-DD' STRING,
    // instead of DATE(...) which many drivers (e.g. mysql2 without
    // `dateStrings: true`) hand back as a JS Date object. Comparing a Date
    // object to a string with !== always returns true, which is why
    // bom_completed_today was always coming back as 0 previously.
    // ⚠️ Replace w.created_at below with your actual date column if different.
    const materialSql = `
      SELECT
        w.work_progress_site_id,
        w.bom_id,
        w.bom_progress_id,
        DATE_FORMAT(w.created_at, '%Y-%m-%d') AS work_date,
        si.product_id,
        SUM(COALESCE(si.Act_Qty, 0)) AS total_material_used
      FROM tx_work_progress w
      INNER JOIN tx_site_used_items si
        ON si.work_progress_site_id = w.work_progress_site_id
      WHERE w.project_id = ?
        AND w.project_site_id = ?
      GROUP BY
        w.work_progress_site_id,
        w.bom_id,
        w.bom_progress_id,
        DATE_FORMAT(w.created_at, '%Y-%m-%d'),
        si.product_id
    `;

    // FIX: derive "today" from the DATABASE's own clock (same source as
    // created_at), not from Node's `new Date()`. If the app server and DB
    // server ever run in different timezones, computing "today" locally in
    // Node can silently put today's rows in the wrong bucket. Also returned
    // as a plain string via DATE_FORMAT so it's directly comparable.
    const todaySql = `SELECT DATE_FORMAT(NOW(), '%Y-%m-%d') AS today_date`;

    const [bomRows, materialRows, todayRows] = await Promise.all([
      customSelectSqlQuery2(bomSql, [project_id, project_site_id]),
      customSelectSqlQuery2(materialSql, [project_id, project_site_id]),
      customSelectSqlQuery2(todaySql, []),
    ]);

    if (!bomRows || bomRows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No work progress data found",
        data: [],
      });
    }

    // Safe fallback: if the todaySql call somehow returns nothing, fall back
    // to Node's own date rather than crashing.
    const todayStr =
      (todayRows && todayRows[0] && todayRows[0].today_date) ||
      new Date().toISOString().slice(0, 10);

    // Start of the current month, e.g. '2026-07-01', derived from the same
    // DB-clock string used for "today" so both boundaries share one
    // timezone source. No extra query needed.
    const monthStartStr = `${todayStr.slice(0, 7)}-01`;

    // Defensive normalizer: guarantees a 'YYYY-MM-DD' string no matter what
    // the driver/DB gives back (string, Date object, or null), so this code
    // stays correct even if the SQL/driver config changes later.
    const normalizeDateStr = (value) => {
      if (!value) return null;
      if (typeof value === "string") return value.slice(0, 10);
      if (value instanceof Date && !isNaN(value.getTime())) {
        return value.toISOString().slice(0, 10);
      }
      return String(value).slice(0, 10);
    };

    // Safe numeric parser used throughout instead of bare parseFloat, so a
    // null/undefined/garbage value never turns into NaN and poisons a sum.
    const toNum = (value, fallback = 0) => {
      const n = parseFloat(value);
      return Number.isFinite(n) ? n : fallback;
    };

    /* ---------------- WORK MAP: bom_id_progress_id_product_id -> [{site, used, date}] ---------------- */
    const workMap = new Map();

    for (const row of materialRows || []) {
      if (!row.bom_id || !row.bom_progress_id || !row.product_id) continue;

      const key = `${row.bom_id}_${row.bom_progress_id}_${row.product_id}`;

      if (!workMap.has(key)) {
        workMap.set(key, []);
      }

      workMap.get(key).push({
        work_progress_site_id: row.work_progress_site_id,
        used: toNum(row.total_material_used, 0),
        work_date: normalizeDateStr(row.work_date), // always 'YYYY-MM-DD' or null
      });
    }

    // FIX: "BOM completed N times" means EVERY individual bom_item line, in
    // EVERY progress step, has enough material used for N repetitions of
    // that specific line (using that line's own total_qty as the
    // per-completion requirement). It is the min across ALL bom_item rows —
    // never merged/summed across progress steps by product, and never
    // divided by per_unit_qty. Merging by product previously let a
    // fast-moving step mask a slow bottleneck step, which both inflated
    // bom_completed_till_date and made bom_completed_today overcount.
    //
    // FIX (composite key): these maps are now keyed by
    // `${project_estimation_id}_${bom_id}` instead of bare `bom_id`. The
    // same bom_id can legitimately appear under more than one
    // project_estimation_id (e.g. the same BOM template reused across
    // different billing lines / estimations). Keying by bom_id alone would
    // let their completion counts bleed into each other through the
    // Math.min merge below. The composite key keeps every BOM instance
    // isolated.
    // composite key -> minimum "times completed" across all its bom_item lines
    const bomCompletedTillDateMin = new Map(); // includes today
    const bomCompletedYesterdayMin = new Map(); // excludes today
    const bomCompletedBeforeThisMonthMin = new Map(); // excludes this month

    /* ---------------- BUILD NESTED STRUCTURE ---------------- */
    const billingMap = new Map();

    for (const row of bomRows) {
      if (!billingMap.has(row.billing_id)) {
        billingMap.set(row.billing_id, {
          billing_id: row.billing_id,
          project_id: row.project_id,
          project_name: row.project_name,
          site_id: row.site_id,
          site_name: row.project_site_name,
          project_work_description: row.project_work_description,
          billing_unit: row.billing_unit,
          boms: new Map(),
        });
      }
      const billing = billingMap.get(row.billing_id);

      if (!billing.boms.has(row.project_estimation_id)) {
        billing.boms.set(row.project_estimation_id, {
          project_estimation_id: row.project_estimation_id,
          bom_id: row.bom_id,
          bom_name: row.bom_name,
          rep_task: row.rep_task,
          bom_price: row.bom_price,
          bom_unit: row.bom_unit || null,
          bom_value_unit: row.bom_value_unit,
          bom_completed_till_date: 0, // filled in after the loop
          remaining_bom_quantity: 0, // filled in after the loop
          bom_completed_today: 0, // filled in after the loop
          bom_completed_this_month: 0, // filled in after the loop
          progresses: new Map(),
        });
      }
      const bom = billing.boms.get(row.project_estimation_id);

      // Composite key for this BOM *instance* (this estimation's use of this bom_id).
      const bomInstanceKey = `${row.project_estimation_id}_${row.bom_id}`;

      if (row.bom_progress_id && !bom.progresses.has(row.bom_progress_id)) {
        bom.progresses.set(row.bom_progress_id, {
          bom_progress_id: row.bom_progress_id,
          bom_progress_name: row.bom_progress_name,
          sl_number: row.sl_number,
          items: [],
        });
      }

      if (!row.bom_item_id || !row.bom_progress_id) continue;

      const totalQty = toNum(row.total_qty, 0);
      const repTask = toNum(row.rep_task, 1);
      const requiredQty = totalQty * repTask;

      const key = `${row.bom_id}_${row.bom_progress_id}_${row.product_id}`;
      const workEntries = workMap.get(key) || [];

      const totalUsed = workEntries.reduce((sum, w) => sum + w.used, 0);
      const totalUsedYesterday = workEntries
        .filter((w) => w.work_date !== todayStr) // both sides are now plain strings
        .reduce((sum, w) => sum + w.used, 0);
      const totalUsedBeforeThisMonth = workEntries
        .filter((w) => w.work_date && w.work_date < monthStartStr)
        .reduce((sum, w) => sum + w.used, 0);

      const work_progress_site_ids = workEntries.map((w) => w.work_progress_site_id);

      const consumption_details = workEntries.map((w) => ({
        work_progress_site_id: w.work_progress_site_id,
        used_qty: w.used,
        work_date: w.work_date,
      }));

      bom.progresses.get(row.bom_progress_id).items.push({
        bom_item_id: row.bom_item_id,
        product_id: row.product_id,
        qty: row.per_unit_qty,
        total_qty: row.total_qty,

        total_Material_required_for_bom_quantity: requiredQty.toFixed(2),
        total_material_used_in_site: totalUsed.toFixed(2),

        work_progress_site_ids,
        consumption_details,

        product: {
          product_id: row.product_id,
          product_name: row.product_name,
          unit: row.unit || "Pc",
          product_type_id: row.product_type_id,
          hsn_code: row.hsn_code,
        },
      });

      // How many times THIS SPECIFIC line (this product, in this exact
      // progress step) has been fulfilled — using its own total_qty as the
      // per-completion requirement. Every bom_item line must independently
      // clear N repetitions for the whole BOM to count as completed N times.
      const timesCompletedTillDate = totalQty > 0 ? Math.floor(totalUsed / totalQty) : 0;
      const timesCompletedYesterday = totalQty > 0 ? Math.floor(totalUsedYesterday / totalQty) : 0;
      const timesCompletedBeforeThisMonth =
        totalQty > 0 ? Math.floor(totalUsedBeforeThisMonth / totalQty) : 0;

      const prevTillDateMin = bomCompletedTillDateMin.has(bomInstanceKey)
        ? bomCompletedTillDateMin.get(bomInstanceKey)
        : null;
      bomCompletedTillDateMin.set(
        bomInstanceKey,
        prevTillDateMin === null ? timesCompletedTillDate : Math.min(prevTillDateMin, timesCompletedTillDate)
      );

      const prevYesterdayMin = bomCompletedYesterdayMin.has(bomInstanceKey)
        ? bomCompletedYesterdayMin.get(bomInstanceKey)
        : null;
      bomCompletedYesterdayMin.set(
        bomInstanceKey,
        prevYesterdayMin === null ? timesCompletedYesterday : Math.min(prevYesterdayMin, timesCompletedYesterday)
      );

      const prevBeforeMonthMin = bomCompletedBeforeThisMonthMin.has(bomInstanceKey)
        ? bomCompletedBeforeThisMonthMin.get(bomInstanceKey)
        : null;
      bomCompletedBeforeThisMonthMin.set(
        bomInstanceKey,
        prevBeforeMonthMin === null
          ? timesCompletedBeforeThisMonth
          : Math.min(prevBeforeMonthMin, timesCompletedBeforeThisMonth)
      );
    }

    /* ---------------- FINAL FORMAT ---------------- */
    const result = [];

    for (const billing of billingMap.values()) {
      const bomsArray = [];

      for (const bom of billing.boms.values()) {
        const bomInstanceKey = `${bom.project_estimation_id}_${bom.bom_id}`;

        const completedTillDate = bomCompletedTillDateMin.get(bomInstanceKey) || 0;
        const completedTillYesterday = bomCompletedYesterdayMin.get(bomInstanceKey) || 0;
        const completedBeforeThisMonth = bomCompletedBeforeThisMonthMin.get(bomInstanceKey) || 0;
        const repTaskNum = toNum(bom.rep_task, 0);

        bom.bom_completed_till_date = completedTillDate;
        // Clamped at 0 — a BOM can't be "over-completed" in a negative sense
        // from this metric's point of view (guards against bad/legacy data).
        bom.remaining_bom_quantity = Math.max(0, repTaskNum - completedTillDate);
        // Clamped at 0 too — a negative value would only occur if usage
        // records were edited/deleted after being counted, which shouldn't
        // be surfaced as "negative progress today".
        bom.bom_completed_today = Math.max(0, completedTillDate - completedTillYesterday);
        // Same clamping rationale as bom_completed_today, but measured
        // against the start of the current month instead of yesterday.
        bom.bom_completed_this_month = Math.max(0, completedTillDate - completedBeforeThisMonth);

        bom.progresses = Array.from(bom.progresses.values());
        bomsArray.push(bom);
      }

      billing.boms = bomsArray;
      result.push(billing);
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("FETCH ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch work progress",
    });
  }
};


//////////////////////////////////////////////////////


getWorkProgressByProjectalltheworkdetails = async (req, res) => {
  try {
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "project_id is required",
      });
    }

    const sql = `
      SELECT 
          w.project_id,
          w.project_site_id,
          w.bom_id,
          w.bom_progress_id,
          w.date,

          SUM(w.packet_qty) AS total_packet_qty,
          SUM(w.total_qty_of_material_used) AS total_material_used,
          SUM(w.total_progress) AS total_progress,

          MAX(w.remarks) AS remarks,
          MAX(w.rep_task) AS rep_task,
          MAX(w.created_at) AS created_at,
          MAX(w.updated_at) AS updated_at,
          MAX(w.created_by) AS created_by,

          CONCAT(e.first_name, ' ', e.last_name) AS created_by_name,
          p.project_name,
          s.project_site_name,
          b.bom_name,
          bp.bom_progress_name,

          bi.product_id,
          pr.product_name

      FROM tx_work_progress w

      LEFT JOIN md_project p 
             ON w.project_id = p.project_id

      LEFT JOIN md_project_site s 
             ON w.project_site_id = s.project_site_id

      LEFT JOIN md_bom b 
             ON w.bom_id = b.bom_id

      LEFT JOIN em_employees e 
             ON w.created_by = e.employee_id

      LEFT JOIN md_bom_item bi 
             ON bi.bom_id = w.bom_id
            AND bi.bom_progress_id = w.bom_progress_id

      LEFT JOIN md_bom_progress bp 
             ON w.bom_progress_id = bp.bom_progress_id 

      LEFT JOIN md_product pr 
             ON bi.product_id = pr.product_id

      WHERE w.project_id = ?

      GROUP BY 
          w.project_id,
          w.project_site_id,
          w.bom_id,
          w.bom_progress_id,
          w.date,
          bi.product_id

      ORDER BY w.date DESC, w.bom_id, w.bom_progress_id;
    `;

    const rows = await customSelectSqlQuery2(sql, [project_id]);

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
      "tx_work_progress",
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
        "tx_work_progress",
        `work_progress_site_id = ${work_progress_site_id}`
      );

      res.status(200).json({ success: true, message: "Work progress deleted" });

    } catch (err) {
      console.error("DELETE ERROR:", err);
      res.status(500).json({ success: false, message: "Unable to delete work progress" });
    }
  };







//   getWorkProgressfulldatafromprojectandsiteId = async (req, res) => {
//   try {
//     const { project_id, project_site_id } = req.body;

//     if (!project_id || !project_site_id) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id and project_site_id are required",
//       });
//     }

//     const sql = `
//       SELECT 
//           w.*,

//           -- Project Name
//           p.project_name,

//           -- Project Site Name
//           ps.project_site_name,

//           -- BOM Name
//           b.bom_name,

//           -- Progress Name
//           bp.bom_progress_name

//       FROM tx_work_progress w

//       LEFT JOIN md_project p 
//         ON p.project_id = w.project_id

//       LEFT JOIN md_project_site ps 
//         ON ps.project_site_id = w.project_site_id

//       LEFT JOIN md_bom b 
//         ON b.bom_id = w.bom_id

//       LEFT JOIN md_bom_progress bp 
//         ON bp.bom_progress_id = w.bom_progress_id

//       WHERE w.project_id = ${project_id}
//         AND w.project_site_id = ${project_site_id}

//       ORDER BY w.work_progress_site_id DESC;
//     `;

//     const rows = await customSelectSqlQuery(sql);

//     return res.status(200).json({
//       success: true,
//       data: rows,
//     });

//   } catch (err) {
//     console.error("FETCH ERROR:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch work progress",
//     });
//   }
// };



///////////////////////////////this perfect//////////////////////////

//  getWorkProgressfulldatafromprojectandsiteId = async (req, res) => {
//   try {
//     const { project_id, project_site_id } = req.body;

//     /* 1. Validation */
//     if (!project_id) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id is required",
//       });
//     }

//     /* 2. Dynamic WHERE condition */
//     let whereCondition = `w.project_id = ${project_id}`;
//     if (project_site_id) {
//       whereCondition += ` AND w.project_site_id = ${project_site_id}`;
//     }

//     /* 3. SQL Query */
//     const sql = `
//       SELECT
//         -- Billing
//         pb.project_work_description,

//         -- Project
//         p.project_name,
//         ps.project_site_name,

//         -- Work Progress
//         w.work_progress_site_id,
//         w.date,
//         w.billing_status,

//         -- BOM
//         b.bom_name,

//         -- BOM Step
//         bp.bom_progress_name,
       
//         -- Product
         
//         prod.product_name,
//         prod.qty AS master_product_qty,   

//         -- Site Used Items
//         sui.bom_product_qty,
//         sui.Atc_total,
//         sui.Act_Qty

//       FROM tx_work_progress w

      

//       /* Billing */
//       LEFT JOIN md_project_billing pb
//         ON pb.project_id = w.project_id

//       /* Project & Site */
//       LEFT JOIN md_project p
//         ON p.project_id = w.project_id

//       LEFT JOIN md_project_site ps
//         ON ps.project_site_id = w.project_site_id

//       /* BOM */
//       LEFT JOIN md_bom b
//         ON b.bom_id = w.bom_id

//       /* BOM Step */
//       LEFT JOIN md_bom_progress bp
//         ON bp.bom_progress_id = w.bom_progress_id

//       /* Site Used Items */
//       LEFT JOIN tx_site_used_items sui
//         ON sui.work_progress_site_id = w.work_progress_site_id

//       /* Product */
//       LEFT JOIN md_product prod
//         ON prod.product_id = sui.product_id

//       WHERE ${whereCondition}

//       ORDER BY w.work_progress_site_id DESC
//     `;

//     /* 4. Execute */
//     const rows = await customSelectSqlQuery(sql);

//     return res.status(200).json({
//       success: true,
//       data: rows,
//     });

//   } catch (error) {
//     console.error("BILLING FETCH ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch billing work progress data",
//     });
//   }
// };

////////////



// getWorkProgressfulldatafromprojectandsiteId = async (req, res) => {
//   try {
//     const { project_id, project_site_id } = req.body;

//     /* 1. Validation */
//     if (!project_id) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id is required",
//       });
//     }

//     /* 2. Dynamic WHERE condition */
//     let whereCondition = `w.project_id = ${project_id}`;
//     if (project_site_id) {
//       whereCondition += ` AND w.project_site_id = ${project_site_id}`;
//     }

//     /* 3. SQL Query */
//     const sql = `
//       SELECT
//         -- Billing
//         pb.project_work_description,

//         -- Project
//         p.project_name,
//         ps.project_site_name,

//         -- Work Progress
//         w.work_progress_site_id,
//         w.date,
//         w.billing_status,

//         -- BOM
//         b.bom_name,

//         -- BOM Step
//         bp.bom_progress_name,
       
//         -- Product
//         prod.product_name,
//         prod.qty AS master_product_qty,   

//         -- Site Used Items
//         sui.expenses_of_project_site_id,
//         sui.bom_product_qty,
//         sui.Atc_total,
//         sui.Act_Qty

//       FROM tx_work_progress w

//       LEFT JOIN md_project_billing pb ON pb.project_id = w.project_id
//       LEFT JOIN md_project p ON p.project_id = w.project_id
//       LEFT JOIN md_project_site ps ON ps.project_site_id = w.project_site_id
//       LEFT JOIN md_bom b ON b.bom_id = w.bom_id
//       LEFT JOIN md_bom_progress bp ON bp.bom_progress_id = w.bom_progress_id
//       LEFT JOIN tx_site_used_items sui ON sui.work_progress_site_id = w.work_progress_site_id
//       LEFT JOIN md_product prod ON prod.product_id = sui.product_id

//       WHERE ${whereCondition}

//       ORDER BY w.work_progress_site_id DESC
//     `;

//     /* 4. Execute */
//     const rows = await customSelectSqlQuery(sql);

//     /* 5. Group duplicate rows */
//     const groupedData = {};

//     rows.forEach(row => {
//       // Create a unique key based on the grouping criteria
//       const groupKey = `${row.work_progress_site_id}_${row.bom_progress_name}_${row.product_name}_${row.master_product_qty}_${row.Atc_total}_${row.Act_Qty}`;

//       if (!groupedData[groupKey]) {
//         // First occurrence - store the row and init descriptions array
//         groupedData[groupKey] = {
//           ...row,
//           project_work_descriptions: [row.project_work_description]
//         };
//       } else {
//         // Duplicate found - add description if it's unique
//         if (!groupedData[groupKey].project_work_descriptions.includes(row.project_work_description)) {
//           groupedData[groupKey].project_work_descriptions.push(row.project_work_description);
//         }
//       }
//     });

//     // Convert grouped data back to array and format
//     const result = Object.values(groupedData).map(item => {
//       // Combine all unique descriptions with a separator
//       const combinedDescriptions = item.project_work_descriptions
//         .filter(desc => desc) // Remove null/undefined
//         .join(' | '); // Use ' | ' or '\n' as separator

//       return {
//         project_work_description: combinedDescriptions,
//         project_name: item.project_name,
//         project_site_name: item.project_site_name,
//         work_progress_site_id: item.work_progress_site_id,
//         date: item.date,
//         billing_status: item.billing_status,
//         bom_name: item.bom_name,
//         bom_progress_name: item.bom_progress_name,
//         product_name: item.product_name,
//         master_product_qty: item.master_product_qty,
//         expenses_of_project_site_id: item.expenses_of_project_site_id,
//         bom_product_qty: item.bom_product_qty,
//         Atc_total: item.Atc_total,
//         Act_Qty: item.Act_Qty
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       data: result,
//     });

//   } catch (error) {
//     console.error("BILLING FETCH ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch billing work progress data",
//     });
//   }
// };



/////////////////////

getWorkProgressfulldatafromprojectandsiteId = async (req, res) => {
  try {
    const { project_id, project_site_id } = req.body;

    /* 1. Validation */
    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "project_id is required",
      });
    }



    let whereCondition = `
  w.project_id = ${project_id}
  AND (w.billing_status IS NULL OR w.billing_status != 'Y')
`;

if (project_site_id) {
  whereCondition += ` AND w.project_site_id = ${project_site_id}`;
}

    /* 3. SQL Query */
    const sql = `
      SELECT
        -- Billing
        pb.project_work_description,

        -- Project
        p.project_name,
        ps.project_site_name,

        -- Work Progress
        w.work_progress_site_id,
        w.date,
        w.billing_status,
        w.rep_task,

        -- BOM
        b.bom_name,

        -- BOM Step
        bp.bom_progress_name,
       
        -- Product
        prod.product_name,
        prod.qty AS master_product_qty,   

        -- Site Used Items
        sui.expenses_of_project_site_id,
        sui.bom_product_qty,
        sui.Atc_total,
        sui.Act_Qty

      FROM tx_work_progress w

      LEFT JOIN md_project_billing pb ON pb.project_id = w.project_id
      LEFT JOIN md_project p ON p.project_id = w.project_id
      LEFT JOIN md_project_site ps ON ps.project_site_id = w.project_site_id
      LEFT JOIN md_bom b ON b.bom_id = w.bom_id
      LEFT JOIN md_bom_progress bp ON bp.bom_progress_id = w.bom_progress_id
      LEFT JOIN tx_site_used_items sui ON sui.work_progress_site_id = w.work_progress_site_id
      LEFT JOIN md_product prod ON prod.product_id = sui.product_id

      WHERE ${whereCondition}

      ORDER BY w.work_progress_site_id DESC
    `;

    /* 4. Execute */
    const rows = await customSelectSqlQuery(sql);

    /* 5. Group duplicate rows */
    const groupedData = {};

    rows.forEach(row => {
      // Create a unique key based on the grouping criteria
      const groupKey = `${row.work_progress_site_id}_${row.bom_progress_name}_${row.product_name}_${row.master_product_qty}_${row.Atc_total}_${row.Act_Qty}`;

      if (!groupedData[groupKey]) {
        // First occurrence - store the row and init descriptions array
        groupedData[groupKey] = {
          ...row,
          project_work_descriptions: [row.project_work_description]
        };
      } else {
        // Duplicate found - add description if it's unique
        if (!groupedData[groupKey].project_work_descriptions.includes(row.project_work_description)) {
          groupedData[groupKey].project_work_descriptions.push(row.project_work_description);
        }
      }
    });

    // Convert grouped data back to array and format
    const result = Object.values(groupedData).map(item => {
      // Combine all unique descriptions with a separator
      const combinedDescriptions = item.project_work_descriptions
        .filter(desc => desc) // Remove null/undefined
        .join(' | '); // Use ' | ' or '\n' as separator

      return {
        project_work_description: combinedDescriptions,
        project_name: item.project_name,
        project_site_name: item.project_site_name,
        work_progress_site_id: item.work_progress_site_id,
        date: item.date,
        billing_status: item.billing_status,
        rep_task: item.rep_task,
        bom_name: item.bom_name,
        bom_progress_name: item.bom_progress_name,
        product_name: item.product_name,
        master_product_qty: item.master_product_qty,
        expenses_of_project_site_id: item.expenses_of_project_site_id,
        bom_product_qty: item.bom_product_qty,
        Atc_total: item.Atc_total,
        Act_Qty: item.Act_Qty
      };
    });

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("BILLING FETCH ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch billing work progress data",
    });
  }
};

///////////////////////////////////////////



getBomFullDetailsWithProgressByProject_Id = async (req, res) => {
  try {
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "project_id is required",
      });
    }

    // ─── Query 1: BOM Estimation Details ──────────────────────────────────
    // const bomSql = `
    //   SELECT 
    //     t.project_estimation_id,
    //     t.project_id,
    //     p.project_name,
    //     t.site_id,
    //     s.project_site_name,
    //     t.bom_id,
    //     t.bom_name,
    //     t.rep_task,
    //     t.billing_id,

    //     billing.project_work_description,
    //     billing.unit         AS billing_unit,
    //     billing.quantity     AS billing_quantity,
    //     billing.rate         AS billing_rate,
    //     billing.amount       AS billing_amount,
    //     billing.remarks      AS billing_remarks,

    //     bp.bom_progress_id,
    //     bp.bom_progress_name,
    //     bp.sl_number,

    //     bi.bom_item_id,
    //     bi.product_id,
    //     bi.qty               AS per_unit_qty,
    //     bi.total_qty,

    //     pr.product_name,
    //     pr.product_type_id,
    //     uom.unit_name        AS unit

    //   FROM tx_project_details_with_estimation t
    //   INNER JOIN md_project p         ON t.project_id   = p.project_id
    //   LEFT  JOIN md_project_site s    ON t.site_id      = s.project_site_id
    //   LEFT  JOIN md_project_billing billing ON t.billing_id = billing.billing_id
    //   LEFT  JOIN md_bom_progress bp   ON t.bom_id       = bp.bom_id
    //   LEFT  JOIN md_bom_item bi       ON bp.bom_progress_id = bi.bom_progress_id
    //                                  AND t.bom_id           = bi.bom_id
    //   LEFT  JOIN md_product pr        ON bi.product_id  = pr.product_id
    //   LEFT  JOIN md_unit uom          ON pr.unit_id     = uom.unit_id
    //   WHERE t.project_id = ?
    //   ORDER BY t.billing_id, t.bom_id, bp.sl_number, bi.bom_item_id
    // `;


    // ─── Query 1: BOM Estimation Details ──────────────────────────────────
    const bomSql = `
      SELECT 
        t.project_estimation_id,
        t.project_id,
        p.project_name,
        t.site_id,
        s.project_site_name,
        t.bom_id,
        t.bom_name,
        t.rep_task,
        t.billing_id,

        wd.work_description AS project_work_description,
        billing.unit         AS billing_unit,
        billing.quantity     AS billing_quantity,
        billing.rate         AS billing_rate,
        billing.amount       AS billing_amount,
        billing.remarks      AS billing_remarks,

        bp.bom_progress_id,
        bp.bom_progress_name,
        bp.sl_number,

        bi.bom_item_id,
        bi.product_id,
        bi.qty               AS per_unit_qty,
        bi.total_qty,

        pr.product_name,
        pr.product_type_id,
        uom.unit_name        AS unit

      FROM tx_project_details_with_estimation t
      INNER JOIN md_project p         ON t.project_id   = p.project_id
      LEFT  JOIN md_project_site s    ON t.site_id      = s.project_site_id
      LEFT  JOIN md_project_billing billing ON t.billing_id = billing.billing_id
      LEFT  JOIN md_project_work_description wd
        ON billing.project_work_description_id = wd.project_work_description_id
      LEFT  JOIN md_bom_progress bp   ON t.bom_id       = bp.bom_id
      LEFT  JOIN md_bom_item bi       ON bp.bom_progress_id = bi.bom_progress_id
                                     AND t.bom_id           = bi.bom_id
      LEFT  JOIN md_product pr        ON bi.product_id  = pr.product_id
      LEFT  JOIN md_unit uom          ON pr.unit_id     = uom.unit_id
      WHERE t.project_id = ?
      ORDER BY t.billing_id, t.bom_id, bp.sl_number, bi.bom_item_id
    `;

    // ─── Query 2: Work Progress + Percentage per BOM Progress ─────────────
    // percentage is computed fully in SQL — no JS loop needed
    const progressSql = `
      SELECT
        w.bom_id,
        w.bom_progress_id,
        w.project_site_id,
        w.date,
        bi.product_id,
        pr.product_name,
        bp.bom_progress_name,
        b.bom_name,
        s.project_site_name,
        MAX(w.created_by)                              AS created_by,
        CONCAT(e.first_name, ' ', e.last_name)         AS created_by_name,
        MAX(w.remarks)                                 AS remarks,
        MAX(w.rep_task)                                AS rep_task,
        MAX(w.created_at)                              AS created_at,
        MAX(w.updated_at)                              AS updated_at,
        SUM(w.packet_qty)                              AS total_packet_qty,
        SUM(w.total_qty_of_material_used)              AS total_material_used,
        SUM(w.total_progress)                          AS total_progress,
        bi.total_qty                                   AS planned_qty,

        --  Percentage calculated in SQL itself--

        ROUND(
          (SUM(w.total_progress) / NULLIF(bi.total_qty, 0)) * 100
        , 2)                                           AS progress_percentage

      FROM tx_work_progress w
      LEFT JOIN md_project_site  s   ON w.project_site_id  = s.project_site_id
      LEFT JOIN md_bom           b   ON w.bom_id            = b.bom_id
      LEFT JOIN md_bom_progress  bp  ON w.bom_progress_id   = bp.bom_progress_id
      LEFT JOIN md_bom_item      bi  ON bi.bom_id           = w.bom_id
                                    AND bi.bom_progress_id  = w.bom_progress_id
      LEFT JOIN md_product       pr  ON bi.product_id       = pr.product_id
      LEFT JOIN em_employees     e   ON w.created_by        = e.employee_id
      WHERE w.project_id = ?
      GROUP BY
        w.bom_id,
        w.bom_progress_id,
        w.project_site_id,
        w.date,
        bi.product_id,
        bi.total_qty,
        bp.bom_progress_name,
        b.bom_name,
        s.project_site_name,
        e.first_name,
        e.last_name,
        pr.product_name
      ORDER BY w.date DESC, w.bom_id, w.bom_progress_id
    `;

    // ─── Run both in parallel — no sequential waiting ──────────────────────
    const [bomRows, progressRows] = await Promise.all([
      customSelectSqlQuery2(bomSql, [project_id]),
      customSelectSqlQuery2(progressSql, [project_id]),
    ]);

    if (!bomRows.length) {
      return res.status(200).json({ success: true, data: [] });
    }

    // ─── Build lookup Map for work progress keyed by "bom_id|bom_progress_id"
    // One reduce — no forEach/for loops
    const progressMap = progressRows.reduce((acc, wp) => {
      const key = `${wp.bom_id}|${wp.bom_progress_id}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push({
        date:                 wp.date,
        project_site_id:      wp.project_site_id,
        project_site_name:    wp.project_site_name,
        product_id:           wp.product_id,
        product_name:         wp.product_name,
        total_packet_qty:     wp.total_packet_qty,
        total_material_used:  wp.total_material_used,
        total_progress:       wp.total_progress,
        planned_qty:          wp.planned_qty,
        progress_percentage:  wp.progress_percentage, // ← from SQL
        remarks:              wp.remarks,
        rep_task:             wp.rep_task,
        created_by:           wp.created_by,
        created_by_name:      wp.created_by_name,
        created_at:           wp.created_at,
        updated_at:           wp.updated_at,
      });
      return acc;
    }, {});

    // ─── Build estimation map using reduce — zero explicit loops ───────────
    const estimationMap = bomRows.reduce((map, row) => {

      // ── Level 1: estimation ───────────────────────────────────────────────
      if (!map[row.project_estimation_id]) {
        map[row.project_estimation_id] = {
          project_estimation_id:    row.project_estimation_id,
          project_id:               row.project_id,
          project_name:             row.project_name,
          site_id:                  row.site_id,
          site_name:                row.project_site_name,
          bom_id:                   row.bom_id,
          bom_name:                 row.bom_name,
          rep_task:                 row.rep_task,
          billing_id:               row.billing_id,
          project_work_description: row.project_work_description,
          billing_unit:             row.billing_unit,
          billing_quantity:         row.billing_quantity,
          billing_rate:             row.billing_rate,
          billing_amount:           row.billing_amount,
          billing_remarks:          row.billing_remarks,
          progresses:               {},
        };
      }

      const est = map[row.project_estimation_id];

      // ── Level 2: progress ─────────────────────────────────────────────────
      if (row.bom_progress_id && !est.progresses[row.bom_progress_id]) {
        const wpKey = `${row.bom_id}|${row.bom_progress_id}`;
        est.progresses[row.bom_progress_id] = {
          bom_progress_id:   row.bom_progress_id,
          bom_progress_name: row.bom_progress_name,
          sl_number:         row.sl_number,
          items:             [],
          work_progress:     progressMap[wpKey] || [], // ← attached here
        };
      }

      // ── Level 3: item ─────────────────────────────────────────────────────
      if (row.bom_item_id && row.bom_progress_id) {
        est.progresses[row.bom_progress_id].items.push({
          bom_item_id: row.bom_item_id,
          product_id:  row.product_id,
          qty:         row.per_unit_qty,
          total_qty:   row.total_qty,
          product: {
            product_id:      row.product_id,
            product_name:    row.product_name,
            unit:            row.unit || "Pc",
            product_type_id: row.product_type_id,
          },
        });
      }

      return map;
    }, {});

    // ─── Convert nested objects → arrays using Object.values only ─────────
    const result = Object.values(estimationMap).map((est) => ({
      ...est,
      progresses: Object.values(est.progresses),
    }));

    return res.status(200).json({ success: true, data: result });

  } catch (err) {
    console.error("FETCH ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch BOM details with work progress",
    });
  }
};













}

module.exports = new WorkProgressAsPerProjectSiteController();
