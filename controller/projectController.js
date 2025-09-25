const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);


const { updateData, selectOneData, insertData, deleteData, selectData } = require("../models/MasterModel");


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
}

module.exports = new ProjectController();
