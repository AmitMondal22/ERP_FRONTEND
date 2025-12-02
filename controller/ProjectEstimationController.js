const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const { 
  insertData, 
  updateData, 
  deleteData, 
  selectData, 
  selectOneData,
  customSelectSqlQuery 
} = require("../models/MasterModel");

class ProjectEstimationController {

  // ====================================================== 
  // CREATE or UPDATE project_estimation
  // ======================================================
 createOrUpdateProjectEstimation = async (req, res) => {
  try {
    const {
      project_id,
      site_id,
      bom_id,
      bom_name,
      rep_task
    } = req.body;

    if (!project_id || !site_id || !bom_id || !rep_task) {
      return res.status(400).json({
        success: false,
        message: "project_id, site_id, bom_id & rep_task are required"
      });
    }

    const timestamp = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

    // Check if record already exists
    const checkSql = `
      SELECT *
      FROM tx_project_details_with_estimation
      WHERE project_id = ${project_id}
      AND site_id = ${site_id}
      AND bom_id = ${bom_id}
    `;

    const existing = await customSelectSqlQuery(checkSql, false);

    // -------------------------------------------
    // UPDATE CASE
    // -------------------------------------------
    if (existing) {
      const setValues = {
        bom_name,
        rep_task,
        updated_at: timestamp
      };

      const condition = `
        project_id = ${project_id}
        AND site_id = ${site_id}
        AND bom_id = ${bom_id}
      `;

      await updateData("tx_project_details_with_estimation", setValues, condition);

      return res.status(200).json({
        success: true,
        message: "Estimation updated successfully"
      });
    }

    // -------------------------------------------
    // CREATE CASE
    // -------------------------------------------
    const insertValues = {
      project_id,
      site_id,
      bom_id,
      bom_name,
      rep_task,
      created_by: req.user.id,
      created_at: timestamp
    };

    await insertData("tx_project_details_with_estimation", insertValues);

    return res.status(201).json({
      success: true,
      message: "Estimation created successfully"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Unable to create/update estimation"
    });
  }
};


  // ======================================================
  // GET ONE by ID
  // ======================================================
  getProjectEstimation = async (req, res) => {
    try {
      const { id } = req.params;

      const condition = `project_estimation_id = ${Number(id)}`;
      const data = await selectOneData("tx_project_details_with_estimation", "*", condition);

      return res.status(200).json({ success: true, data });

    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Unable to fetch estimation"
      });
    }
  };

  // ======================================================
  // GET ALL
  // ======================================================
  getAllProjectEstimations = async (req, res) => {
    try {
      const sql = `
        SELECT t.*,
          p.project_name,
          s.site_name,
          b.bom_name AS original_bom_name
        FROM tx_project_details_with_estimation t
        LEFT JOIN md_project p ON t.project_id = p.project_id
        LEFT JOIN md_project_site s ON t.site_id = s.site_id
        LEFT JOIN md_bom b ON t.bom_id = b.bom_id
        ORDER BY t.project_estimation_id DESC
      `;

      const rows = await customSelectSqlQuery(sql);

      return res.status(200).json({ success: true, data: rows });

    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Unable to fetch estimation list"
      });
    }
  };

  // ======================================================
  // DELETE
  // ======================================================
  deleteProjectEstimation = async (req, res) => {
    try {
      const { id } = req.params;

      const condition = `project_estimation_id = ${Number(id)}`;
      const deleted = await deleteData("tx_project_details_with_estimation", condition);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Estimation not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Estimation deleted successfully"
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Unable to delete estimation"
      });
    }
  };

  // ======================================================
  // FULL DETAILS WITH AGGREGATION (project/site/bom/progress/items)
  // ======================================================
  getAllBomFullDetails = async (req, res) => {
    try {
      const sql = `
        SELECT 
          t.project_estimation_id,
          t.project_id,
          p.project_name,
          t.site_id,
          s.project_site_name,
          
          t.bom_id,
          t.bom_name,
          t.rep_task,

          bp.bom_progress_id,
          bp.bom_progress_name,

          bi.bom_item_id,
          bi.product_id,
          bi.qty AS per_unit_qty,
          bi.total_qty,

          pr.product_name,
          pr.product_type_id

        FROM tx_project_details_with_estimation t
        LEFT JOIN md_project p ON t.project_id = p.project_id
        LEFT JOIN md_project_site s ON t.site_id = s.project_site_id

        LEFT JOIN md_bom_progress bp ON t.bom_id = bp.bom_id
        LEFT JOIN md_bom_item bi ON bp.bom_progress_id = bi.bom_progress_id 
                                  AND t.bom_id = bi.bom_id
        LEFT JOIN md_product pr ON bi.product_id = pr.product_id

        ORDER BY t.project_estimation_id, bp.bom_progress_id, bi.bom_item_id
      `;

      const rows = await customSelectSqlQuery(sql);

      const map = new Map();

      for (const row of rows) {
        // Root layer
        if (!map.has(row.project_estimation_id)) {
          map.set(row.project_estimation_id, {
            project_estimation_id: row.project_estimation_id,
            project_id: row.project_id,
            project_name: row.project_name,
            site_id: row.site_id,
            site_name: row.site_name,
            bom_id: row.bom_id,
            bom_name: row.bom_name,
            rep_task: row.rep_task,
            progresses: new Map()
          });
        }

        const est = map.get(row.project_estimation_id);

        // Progress layer
        if (row.bom_progress_id && !est.progresses.has(row.bom_progress_id)) {
          est.progresses.set(row.bom_progress_id, {
            bom_progress_id: row.bom_progress_id,
            bom_progress_name: row.bom_progress_name,
            items: []
          });
        }

        // Items layer
        if (row.bom_item_id) {
          est.progresses.get(row.bom_progress_id).items.push({
            bom_item_id: row.bom_item_id,
            product_id: row.product_id,
            qty: row.per_unit_qty,
            total_qty: row.total_qty,
            product: {
              product_id: row.product_id,
              product_name: row.product_name,
              product_type_id: row.product_type_id
            }
          });
        }
      }

      // Convert maps into arrays
      const result = [];
      for (const est of map.values()) {
        est.progresses = Array.from(est.progresses.values());
        result.push(est);
      }

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Unable to fetch full BOM estimation details"
      });
    }
  };

/////////////////////////////////////////////////////

  getBomFullDetailsByProjectAndSite = async (req, res) => {
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
        t.project_estimation_id,
        t.project_id,
        p.project_name,
        t.site_id,
        s.project_site_name,
        
        t.bom_id,
        t.bom_name,
        t.rep_task,

        bp.bom_progress_id,
        bp.bom_progress_name,

        bi.bom_item_id,
        bi.product_id,
        bi.qty AS per_unit_qty,
        bi.total_qty,

        pr.product_name,
        pr.product_type_id

      FROM tx_project_details_with_estimation t
      LEFT JOIN md_project p ON t.project_id = p.project_id
      LEFT JOIN md_project_site s ON t.site_id = s.project_site_id

      LEFT JOIN md_bom_progress bp ON t.bom_id = bp.bom_id
      LEFT JOIN md_bom_item bi ON bp.bom_progress_id = bi.bom_progress_id 
                                AND t.bom_id = bi.bom_id
      LEFT JOIN md_product pr ON bi.product_id = pr.product_id

      WHERE t.project_id = ${project_id}
        AND t.site_id = ${project_site_id}

      ORDER BY t.project_estimation_id, bp.bom_progress_id, bi.bom_item_id
    `;

    const rows = await customSelectSqlQuery(sql);

    const map = new Map();

    for (const row of rows) {
      if (!map.has(row.project_estimation_id)) {
        map.set(row.project_estimation_id, {
          project_estimation_id: row.project_estimation_id,
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

      const est = map.get(row.project_estimation_id);

      if (row.bom_progress_id && !est.progresses.has(row.bom_progress_id)) {
        est.progresses.set(row.bom_progress_id, {
          bom_progress_id: row.bom_progress_id,
          bom_progress_name: row.bom_progress_name,
          items: []
        });
      }

      if (row.bom_item_id) {
        est.progresses.get(row.bom_progress_id).items.push({
          bom_item_id: row.bom_item_id,
          product_id: row.product_id,
          qty: row.per_unit_qty,
          total_qty: row.total_qty,
          product: {
            product_id: row.product_id,
            product_name: row.product_name,
            product_type_id: row.product_type_id
          }
        });
      }
    }

    const result = [];
    for (const est of map.values()) {
      est.progresses = Array.from(est.progresses.values());
      result.push(est);
    }

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch BOM estimation details"
    });
  }
};


}

module.exports = new ProjectEstimationController();
