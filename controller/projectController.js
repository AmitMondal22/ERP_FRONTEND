const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const { updateData, selectOneData, insertData, deleteData, selectAllData } = require("../models/MasterModel");

class ProjectController {

  // Create a new project
  createProject = async (req, res) => {
    try {
      const { project_name, city_id, created_by } = req.body;

      if (!project_name || !city_id || !created_by) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

      const insertValues = { project_name, city_id, created_by, created_at };

      const insertedId = await insertData("projects", insertValues);

      const newProject = await selectOneData("projects", "*", `project_id = ${insertedId}`);

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
      const project = await selectOneData("projects", "*", `project_id = ${Number(id)}`);

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
      const projects = await selectAllData("projects");
      res.status(200).json({ success: true, data: projects });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to fetch projects" });
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
      setValues.updated_at = updated_at;

      const condition = `project_id = ${Number(id)}`;
      const updatedRows = await updateData("projects", setValues, condition);

      if (!updatedRows) {
        return res.status(404).json({ success: false, message: "Project not found or nothing to update" });
      }

      const updatedProject = await selectOneData("projects", "*", condition);

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
      const deletedRows = await deleteData("projects", condition);

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
