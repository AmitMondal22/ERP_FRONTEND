const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);


const { updateData, selectOneData, insertData, deleteData, selectData,customSelectSqlQuery } = require("../models/MasterModel");


class ProjectController {

  // Create Project
  createProject = async (req, res) => {
    try {
      const { project_name, city_id } = req.body; 
      if (!project_name || !city_id) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

      // Use user ID from token
      const insertValues = {
        project_name,
        city_id,
        create_by: req.user.id,
        created_at,
      };

      const insertedId = await insertData("md_project", insertValues);
      const newProject = await selectOneData("md_project", "*", `project_id = ${insertedId}`);

      res.status(201).json({ success: true, message: "Project created", data: newProject });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to create project" });
    }
  };

  // Get a single project by ID
  getProject = async (req, res) => {
    try {
      const { id } = req.params;
      const project = await selectOneData("md_project", "*", `project_id = ${Number(id)}`);

      if (!project) return res.status(404).json({ success: false, message: "Project not found" });

      res.status(200).json({ success: true, data: project });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to fetch project" });
    }
  };

  // Get all projects

 getAllProjects = async (req, res) => {
  try {
    // fetch all projects
    const select = 'a.*, b.name AS city_name, b.state_id, c.name AS state_name, d.name as created_by_name'
    const table = `md_project AS a JOIN lo_cities AS b ON a.city_id = b.id JOIN lo_states AS c ON b.state_id = c.id JOIN users AS d ON a.create_by = d.id`;
    const projects = await selectData(table,select);
    res.json({ success: true, data: projects });
  } catch (err) {
    console.error("Error in getAllProjects:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


  // Update project by ID
  updateProject = async (req, res) => {
    try {
      const { id } = req.params;
      const { project_name, city_id } = req.body;

      const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

      const setValues = {};
      if (project_name !== undefined) setValues.project_name = project_name;
      if (city_id !== undefined) setValues.city_id = city_id;

      // Use token to set the updater (optional, if you track who updates)
      setValues.create_by = req.user.id;
      setValues.updated_at = updated_at;

      const condition = `project_id = ${Number(id)}`;
      const updatedRows = await updateData("md_project", setValues, condition);

      if (!updatedRows) {
        return res.status(404).json({ success: false, message: "Project not found or nothing to update" });
      }

      const updatedProject = await selectOneData("md_project", "*", condition);
      res.status(200).json({ success: true, message: "Project updated", data: updatedProject });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to update project" });
    }
  };

  // Delete project by ID
  deleteProject = async (req, res) => {
    try {
      const { id } = req.params;
      const condition = `project_id = ${Number(id)}`;
      const deletedRows = await deleteData("md_project", condition);

      if (!deletedRows) {
        return res.status(404).json({ success: false, message: "Project not found or already deleted" });
      }

      res.status(200).json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to delete project" });
    }
  };


//////////////////////


  getPurchaseByProjectSiteAndDate = async (req, res) => {
  try {
    const { project_id, site_id, fromDate, toDate } = req.body;

    if (!project_id || !site_id || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "project_id, site_id, fromDate and toDate are required",
      });
    }
const sql = `
  SELECT
    p.purchase_id,
    p.invoice_no,
    DATE(p.invoice_date) AS invoice_date,
    DATE(p.delivery_date) AS delivery_date,
    p.invoice_image,
    p.transport_insurance,
    p.remarks,

    p.project_id,
    pr.project_name,
    p.site_id,
    ps.project_site_name,

    p.vendor_id,
    v.vendor_name,

    p.stor_id,
    s.store_name,

    p.purchase_order_id,
    po.po_no,
    po.total_amount,          -- ✅ ADDED HERE

    pop.purchase_order_product_id,
    pop.product_id,
    prod.product_name,
    prod.product_type_id,

    pop.quantity,
    pop.unit_price,

    DATE(pop.created_at) AS purchase_date,
    pop.created_at,
    pop.updated_at

  FROM td_purchase p
  LEFT JOIN td_purchase_order po
    ON p.purchase_order_id = po.purchase_order_id

  LEFT JOIN td_purchase_order_product pop
    ON po.purchase_order_id = pop.purchase_order_id

  LEFT JOIN md_product prod
    ON pop.product_id = prod.product_id

  LEFT JOIN md_project pr
    ON p.project_id = pr.project_id

  LEFT JOIN md_project_site ps
    ON p.site_id = ps.project_site_id

  LEFT JOIN md_vendor v
    ON p.vendor_id = v.vendor_id

  LEFT JOIN md_store s
    ON p.stor_id = s.store_id

  WHERE
    p.project_id = ${Number(project_id)}
    AND p.site_id = ${Number(site_id)}
    AND DATE(p.invoice_date)
      BETWEEN '${fromDate}' AND '${toDate}'

  ORDER BY p.invoice_date DESC
`;



    const params = [project_id, site_id, fromDate, toDate];
    const results = await customSelectSqlQuery(sql, params);

    return res.status(200).json({
      success: true,
      total: results.length,
      data: results,
    });

  } catch (error) {
    console.error("Error fetching project-site purchase history:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};



}

module.exports = new ProjectController();
