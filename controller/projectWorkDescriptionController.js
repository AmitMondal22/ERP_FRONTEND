const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
} = require("../models/MasterModel");

class ProjectWorkDescription {

  // ================= CREATE =================
addProjectWorkDescription = async (req, res) => {
  try {
    const { work_description } = req.body;

    // Get logged-in user id from middleware
    const created_by = req.user.id;

    if (!work_description || work_description.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Work Description is required.",
      });
    }

    // Check duplicate
    const existing = await selectOneData(
      "md_project_work_description",
      "*",
      `work_description='${work_description.trim()}'`
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Work Description already exists.",
      });
    }

    const id = await insertData("md_project_work_description", {
      work_description: work_description.trim(),
      created_by,
      created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
      updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
    });

    return res.status(200).json({
      success: true,
      message: "Project Work Description added successfully.",
      project_work_description_id: id,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


  // ================= GET ALL =================
  getProjectWorkDescriptions = async (req, res) => {
    try {

      const data = await selectData(
        "md_project_work_description",
        "*",
        null,
        "project_work_description_id DESC"
      );

      return res.status(200).json({
        success: true,
        message: "Project Work Description List",
        data,
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error"
      });
    }
  };


  // ================= GET SINGLE =================
  getProjectWorkDescription = async (req, res) => {
    try {

      const { id } = req.params;

      const data = await selectOneData(
        "md_project_work_description",
        "*",
        `project_work_description_id=${id}`
      );

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Project Work Description not found."
        });
      }

      return res.status(200).json({
        success: true,
        data,
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error"
      });
    }
  };


  // ================= UPDATE =================
  updateProjectWorkDescription = async (req, res) => {
    try {

      const { id } = req.params;
      const { work_description } = req.body;

      if (!work_description) {
        return res.status(400).json({
          success: false,
          message: "Work Description is required."
        });
      }

      const duplicate = await selectOneData(
        "md_project_work_description",
        "*",
        `work_description='${work_description.trim()}' AND project_work_description_id!=${id}`
      );

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Work Description already exists."
        });
      }

      const updated = await updateData(
        "md_project_work_description",
        {
          work_description: work_description.trim(),
          updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
        },
        `project_work_description_id=${id}`
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Project Work Description not found."
        });
      }

      return res.status(200).json({
        success: true,
        message: "Project Work Description updated successfully."
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error"
      });
    }
  };


  // ================= DELETE =================
  deleteProjectWorkDescription = async (req, res) => {
    try {

      const { id } = req.params;

      const deleted = await deleteData(
        "md_project_work_description",
        `project_work_description_id=${id}`
      );

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Project Work Description not found."
        });
      }

      return res.status(200).json({
        success: true,
        message: "Project Work Description deleted successfully."
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error"
      });
    }
  };

}

module.exports = new ProjectWorkDescription();