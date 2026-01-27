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
      created_by,
      consumed_products = []
    } = req.body;

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

  // ✅ quantity_of_product REMOVED
  // ✅ Atc_total is the total consumed qty (replacement)

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
      message: "Unable to create work progress"
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

      FROM tx_work_progress w
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

    /* 2. Dynamic WHERE condition */
    // let whereCondition = `w.project_id = ${project_id}`;
    // if (project_site_id) {
    //   whereCondition += ` AND w.project_site_id = ${project_site_id}`;
    // }


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



}

module.exports = new WorkProgressAsPerProjectSiteController();
