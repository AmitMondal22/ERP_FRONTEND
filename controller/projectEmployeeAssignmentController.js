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

class ProjectEmployeeAssignmentController {
    
    createProjectEmployeeAssignment = async (req, res) => {
        try {
            const { project_id, employee_id, active_status } = req.body;

            if (!project_id || !employee_id) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing: project_id, employee_id"
            });
            }

            const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

            const data = {
            project_id,
            employee_id,
            active_status: active_status ?? true,
            created_by: req.user?.id || null,
            created_at
            };

            const assignment_id = await insertData("tx_project_employee_assignment", data);
            if (!assignment_id) throw new Error("Failed to create assignment");

            res.status(201).json({
            success: true,
            message: "Project employee assignment created successfully",
            data: { project_employee_assignment_id: assignment_id, ...data }
            });

        } catch (error) {
            console.error("Error in createProjectEmployeeAssignment:", error.message);
            res.status(500).json({
            success: false,
            message: "Unable to create assignment",
            error: error.message
            });
        }
    };
    

    getAllProjectEmployeeAssignments = async (req, res) => {
        try {
            const table = `
            tx_project_employee_assignment AS a
            JOIN md_project AS p ON a.project_id = p.project_id
            JOIN em_employees AS e ON a.employee_id = e.employee_id
            `;

            const select = `
            a.*,
            p.project_name,    
            e.first_name AS employee_first_name,
            e.last_name AS employee_last_name,
            e.email AS employee_email,
            e.phone AS employee_phone
            `;

            const assignments = await selectData(table, select, null, "a.project_employee_assignment_id ASC");
            res.status(200).json({ success: true, data: assignments });

        } catch (error) {
            console.error("Error in getAllProjectEmployeeAssignments:", error.message);
            res.status(500).json({
            success: false,
            message: "Unable to fetch assignments",
            error: error.message
            });
        }
    };

    getProjectEmployeeAssignmentById = async (req, res) => {
        try {
            const { id } = req.params;

            const table = `
            tx_project_employee_assignment AS a
            JOIN md_project AS p ON a.project_id = p.project_id
            JOIN em_employees AS e ON a.employee_id = e.employee_id
            `;

            const select = `
            a.*,
            p.project_name,
            e.first_name AS employee_first_name,
            e.last_name AS employee_last_name,
            e.email AS employee_email,
            e.phone AS employee_phone
            `;

            const condition = `a.project_employee_assignment_id = ${id}`;
            const assignment = await selectOneData(table, select, condition);

            if (!assignment) {
            return res.status(404).json({ success: false, message: "Project employee assignment not found" });
            }

            res.status(200).json({ success: true, data: assignment });

        } catch (error) {
            console.error("Error in getProjectEmployeeAssignmentById:", error.message);
            res.status(500).json({
            success: false,
            message: "Unable to fetch assignment", 
            error: error.message
            });
        }
    };


getEmployeesByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "projectId is required",
      });
    }

    // JOIN tables
    const table = `
      tx_project_employee_assignment AS a
      JOIN em_employees AS e ON a.employee_id = e.employee_id
      JOIN md_project AS p ON a.project_id = p.project_id
    `;

    // Select employee details
    const select = `
      a.project_employee_assignment_id,
      a.project_id,
      p.project_name,
      e.employee_id,
      e.first_name,
      e.last_name,
      e.email,
      e.phone,
      a.active_status
    `;

    // Filter by project_id
    const condition = `
      a.project_id = ${Number(projectId)}
      AND a.active_status = 1
    `;

    const employees = await selectData(
      table,
      select,
      condition,
      "e.first_name ASC"
    );

    return res.status(200).json({
      success: true,
      data: employees || [],
    });

  } catch (error) {
    console.error("Error in getEmployeesByProjectId:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch employees by project",
      error: error.message,
    });
  }
};


    updateProjectEmployeeAssignment = async (req, res) => {
        try {
            const { id } = req.params;
            const { project_id, employee_id, active_status } = req.body;

            const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

            const updateValues = { updated_at };
            if (project_id) updateValues.project_id = project_id;
            if (employee_id) updateValues.employee_id = employee_id;
            if (active_status !== undefined) updateValues.active_status = active_status;

            if (Object.keys(updateValues).length === 1) {
            return res.status(400).json({ success: false, message: "No valid fields provided to update" });
            }

            const affectedRows = await updateData("tx_project_employee_assignment", updateValues, `project_employee_assignment_id = ${id}`);
            if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Assignment not found or no changes made" });
            }

            res.status(200).json({
            success: true,
            message: "Project employee assignment updated successfully",
            data: updateValues
            });

        } catch (error) {
            console.error("Error in updateProjectEmployeeAssignment:", error.message);
            res.status(500).json({
            success: false,
            message: "Unable to update assignment",
            error: error.message
            });
        }
    };

    deleteProjectEmployeeAssignment = async (req, res) => {
        try {
            const { id } = req.params;

            const deletedRows = await deleteData("tx_project_employee_assignment", `project_employee_assignment_id = ${id}`);
            if (deletedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found or already deleted"
            });
            }

            res.status(200).json({
            success: true,
            message: "Project employee assignment deleted successfully"
            });

        } catch (error) {
            console.error("Error in deleteProjectEmployeeAssignment:", error.message);
            res.status(500).json({
            success: false,
            message: "Unable to delete assignment",
            error: error.message
            });
        }
    };


}

module.exports = new ProjectEmployeeAssignmentController();