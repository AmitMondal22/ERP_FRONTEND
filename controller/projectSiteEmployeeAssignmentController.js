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

class ProjectSiteEmployeeAssignmentController {

    createProjectSiteEmployeeAssignment = async (req, res) => {
        try {
            const { project_id, site_id, site_in_charge_id, active_status } = req.body;

            if (!project_id || !site_id || !site_in_charge_id) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing: project_id, site_id, site_in_charge_id"
            });
            }

            const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

            const data = {
            project_id,
            site_id,
            site_in_charge_id,
            active_status: active_status ?? true,
            created_by: req.user?.id || null,
            created_at
            };

            const assignment_id = await insertData("tx_project_site_employee_assignment", data);
            if (!assignment_id) throw new Error("Failed to create assignment");

            res.status(201).json({
            success: true,
            message: "Project site employee assignment created successfully",
            data: { project_site_employee_assignment_id: assignment_id, ...data }
            });

        } catch (error) {
            console.error("Error in createProjectSiteEmployeeAssignment:", error.message);
            res.status(500).json({
            success: false,
            message: "Unable to create assignment",
            error: error.message
            });
        }
    };
    

    getAllProjectSiteEmployeeAssignments = async (req, res) => {
        try {
            const table = `
            tx_project_site_employee_assignment AS a
            JOIN md_project AS p ON a.project_id = p.project_id
            JOIN md_project_site AS s ON a.site_id = s.project_site_id
            JOIN em_employees AS e ON a.site_in_charge_id = e.employee_id
            `;

            const select = `
            a.*,
            p.project_name,
            s.project_site_name,
            e.first_name AS site_in_charge_first_name,
            e.last_name AS site_in_charge_last_name,
            e.email AS site_in_charge_email,
            e.phone AS site_in_charge_phone
            `;

            const assignments = await selectData(table, select, null, "a.project_site_employee_assignment_id ASC");

          

            res.status(200).json({ success: true, data: assignments });

        } catch (error) {
            console.error("Error in getAllProjectSiteEmployeeAssignments:", error.message);
            res.status(500).json({
            success: false,
            message: "Unable to fetch assignments",
            error: error.message
            });
        }
    };


    getProjectSiteEmployeeAssignmentById = async (req, res) => {
        try {
            const { id } = req.params;

            const table = `
            tx_project_site_employee_assignment AS a
            JOIN md_project AS p ON a.project_id = p.project_id
            JOIN md_project_site AS s ON a.site_id = s.project_site_id
            JOIN em_employees AS e ON a.site_in_charge_id = e.employee_id
            `;

            const select = `
            a.*,
            p.project_name,
            s.project_site_name,
            e.first_name AS site_in_charge_first_name,
            e.last_name AS site_in_charge_last_name,
            e.email AS site_in_charge_email,
            e.phone AS site_in_charge_phone
            `;

            const condition = `a.project_site_employee_assignment_id = ${id}`;
            const assignment = await selectOneData(table, select, condition);


            res.status(200).json({ success: true, data: assignment });

        } catch (error) {
            console.error("Error in getProjectSiteEmployeeAssignmentById:", error.message);
            res.status(500).json({
            success: false,
            message: "Unable to fetch assignment",
            error: error.message
            });
        }
    };
    updateProjectSiteEmployeeAssignment = async (req, res) => {
        try {
            const { id } = req.params;
            const { project_id, site_id, site_in_charge_id, active_status } = req.body;

            const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

            const updateValues = { updated_at };
            if (project_id) updateValues.project_id = project_id;
            if (site_id) updateValues.site_id = site_id;
            if (site_in_charge_id) updateValues.site_in_charge_id = site_in_charge_id;
            if (active_status !== undefined) updateValues.active_status = active_status;

            if (Object.keys(updateValues).length === 1) {
            return res.status(400).json({ success: false, message: "No valid fields provided to update" });
            }

            const affectedRows = await updateData("tx_project_site_employee_assignment", updateValues, `project_site_employee_assignment_id = ${id}`);
            if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Assignment not found or no changes made" });
            }

            res.status(200).json({
            success: true,
            message: "Project site employee assignment updated successfully",
            data: updateValues
            });

        } catch (error) {
            console.error("Error in updateProjectSiteEmployeeAssignment:", error.message);
            res.status(500).json({
            success: false,
            message: "Unable to update assignment",
            error: error.message
            });
        }
    };
    deleteProjectSiteEmployeeAssignment = async (req, res) => {
        try {
            const { id } = req.params;

            const deletedRows = await deleteData("tx_project_site_employee_assignment", `project_site_employee_assignment_id = ${id}`);
            if (deletedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found or already deleted"
            });
            }

            res.status(200).json({
            success: true,
            message: "Project site employee assignment deleted successfully"
            });

        } catch (error) {
            console.error("Error in deleteProjectSiteEmployeeAssignment:", error.message);
            res.status(500).json({
            success: false,
            message: "Unable to delete assignment",
            error: error.message
            });
        }
    };





}

module.exports = new ProjectSiteEmployeeAssignmentController();