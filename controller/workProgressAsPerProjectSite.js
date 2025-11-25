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
      const body = req.body;

      const data = {
        project_id: body.project_id,
        project_site_id: body.project_site_id,  // UPDATED
        bom_id: body.bom_id,
        remarks: body.remarks || null,
        total_progress: body.total_progress || 0,
        rep_task: body.rep_task || null,
        date: body.date || dayjs().format("YYYY-MM-DD"),
        created_by: body.created_by || null,
        created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
        updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
      };

      const insertId = await insertData("tx_work_progress_as_per_project_site", data);

      res.status(201).json({
        success: true,
        message: "Work progress added",
        id: insertId
      });

    } catch (err) {
      console.error("CREATE ERROR:", err);
      res.status(500).json({ success: false, message: "Unable to create work progress" });
    }
  };


  // ------------------------------------------------------------
  // READ (GROUPED)
  // ------------------------------------------------------------
  getWorkProgressByProjectAndSite = async (req, res) => {
    try {
      const { project_id, project_site_id } = req.body;  // UPDATED

      if (!project_id || !project_site_id) {
        return res.status(400).json({
          success: false,
          message: "project_id and project_site_id are required"
        });
      }

      const sql = `
        SELECT 
          w.*, 
          p.project_name, 
          s.project_site_name, 
          b.bom_name
        FROM tx_work_progress_as_per_project_site w
        LEFT JOIN md_project p ON w.project_id = p.project_id
        LEFT JOIN md_project_site s ON w.project_site_id = s.project_site_id
        LEFT JOIN md_bom b ON w.bom_id = b.bom_id
        WHERE w.project_id = ${project_id} 
        AND w.project_site_id = ${project_site_id}
        ORDER BY w.bom_id, w.work_progress_site_id
      `;

      const rows = await customSelectSqlQuery(sql);

      const grouped = {};

      rows.forEach(r => {
        if (!grouped[r.bom_id]) {
          grouped[r.bom_id] = {
            bom_id: r.bom_id,
            bom_name: r.bom_name,
            rep_task: r.rep_task,
            project_id: r.project_id,
            project_name: r.project_name,
            project_site_id: r.project_site_id,  // UPDATED
            project_site_name: r.project_site_name,
            work_entries: []
          };
        }

        grouped[r.bom_id].work_entries.push({
          work_progress_site_id: r.work_progress_site_id,
          remarks: r.remarks,
          total_progress: r.total_progress,
          rep_task: r.rep_task,
          date: r.date,
          created_at: r.created_at,
          updated_at: r.updated_at,
          created_by: r.created_by
        });
      });

      res.status(200).json({
        success: true,
        data: Object.values(grouped)
      });

    } catch (err) {
      console.error("FETCH ERROR:", err);
      res.status(500).json({ success: false, message: "Unable to fetch work progress" });
    }
  };


  // ------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------
  updateWorkProgress = async (req, res) => {
    try {
      const { work_progress_site_id, ...fields } = req.body;

      if (!work_progress_site_id) {
        return res.status(400).json({
          success: false,
          message: "work_progress_site_id is required"
        });
      }

      const updateObj = {
        ...fields,
        updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
      };

      await updateData(
        "tx_work_progress_as_per_project_site",
        updateObj,
        `work_progress_site_id = ${work_progress_site_id}`
      );

      res.status(200).json({ success: true, message: "Work progress updated" });

    } catch (err) {
      console.error("UPDATE ERROR:", err);
      res.status(500).json({ success: false, message: "Unable to update work progress" });
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
