const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
  customSelectSqlQuery
} = require("../models/MasterModel");

class WorkProgressAsPerProjectSiteController {

  // ------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------


createWorkProgress = async (req, res) => {
  try {
    // Extract values from body
const{
  project_id,
  project_site_id,
  bom_id,bom_progress_id,remarks,total_progress,rep_task,packet_qty,total_qty_of_material_used,date,created_by} = req.body;

    // Validate required fields
    if (!project_id || !project_site_id || !bom_id) {
      return res.status(400).json({
        success: false,
        message: "project_id, project_site_id and bom_id are required"
      });
    }

    // Prepare data for insert
    const data = {
      project_id: project_id || null,
      project_site_id: project_site_id || null,
      bom_id: bom_id || null,
      bom_progress_id:bom_progress_id ||null,
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

    // Convert undefined → null (safety)
    Object.keys(data).forEach(key => {
      if (data[key] === undefined) data[key] = null;
    });

    const insertId = await insertData("tx_work_progress_as_per_project_site", data);

    return res.status(201).json({
      success: true,
      message: "Work progress added successfully",
      id: insertId
    });

  } catch (err) {
    console.error("CREATE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to create work progress"
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
        message: "project_id and project_site_id are required"
      });
    }

    // const sql = `
    //   SELECT DISTINCT
    //     -- Work Progress main table
    //     w.work_progress_site_id,
    //     w.project_id,
    //     w.project_site_id,
    //     w.bom_id,
    //     w.bom_progress_id,
    //     w.remarks,
    //     w.total_progress,
    //     w.rep_task,
    //     w.packet_qty,
    //     w.total_qty_of_material_used,
    //     w.date,
    //     w.created_at,
    //     w.updated_at,
    //     w.created_by,

    //     -- Employee
    //     CONCAT(e.first_name, ' ', e.last_name) AS created_by_name,

    //     -- Project / Site / BOM
    //     p.project_name,
    //     s.project_site_name,
    //     b.bom_name,

    //     -- BOM ITEMS (md_bom_item)
    //     bi.bom_item_id,
    //     bi.bom_progress_id,
    //     bi.product_id AS bom_product_id,
    //     bi.qty AS bom_item_qty,
    //     bi.total_qty AS bom_item_total_qty,
    //     bi.created_by AS bom_item_created_by,
    //     bi.created_at AS bom_item_created_at,
    //     bi.updated_at AS bom_item_updated_at,

    //     -- BOM Progress table (md_bom_progress)
    //     bp.bom_progress_id AS bom_progress_id,
    //     bp.bom_progress_name AS bom_progress_name,

    //     -- PRODUCT TABLE (md_product)
    //     pr.product_name

    //   FROM tx_work_progress_as_per_project_site w
    //   LEFT JOIN md_project p ON w.project_id = p.project_id
    //   LEFT JOIN md_project_site s ON w.project_site_id = s.project_site_id
    //   LEFT JOIN md_bom b ON w.bom_id = b.bom_id
    //   LEFT JOIN em_employees e ON w.created_by = e.employee_id

    //   -- Join BOM Items
    //   LEFT JOIN md_bom_item bi ON w.bom_id = bi.bom_id

    //   -- Join BOM Progress for each item
    //   LEFT JOIN md_bom_progress bp ON bi.bom_progress_id = bp.bom_progress_id

    //   -- Join Product
    //   LEFT JOIN md_product pr ON bi.product_id = pr.product_id

    //   WHERE w.project_id = ${project_id}
    //     AND w.project_site_id = ${project_site_id}

    //   ORDER BY w.bom_id, w.work_progress_site_id, bi.bom_item_id;
    // `;



    const sql = `
        SELECT DISTINCT
          w.work_progress_site_id,
          w.project_id,
          w.project_site_id,
          w.bom_id,
          w.bom_progress_id,        -- ADDED HERE
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

        LEFT JOIN md_bom_item bi ON w.bom_id = bi.bom_id
        LEFT JOIN md_bom_progress bp ON w.bom_progress_id = bp.bom_progress_id   -- UPDATED JOIN
        LEFT JOIN md_product pr ON bi.product_id = pr.product_id

        WHERE w.project_id = ${project_id}
        AND w.project_site_id = ${project_site_id}

        ORDER BY w.bom_id, w.work_progress_site_id, bi.bom_item_id;
      `;

    const rows = await customSelectSqlQuery(sql);

    return res.status(200).json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error("FETCH ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch work progress"
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

}

module.exports = new WorkProgressAsPerProjectSiteController();
