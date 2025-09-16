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

class TeamEmployeeAssignmentController {

    createTeamEmployeeAssignment = async (req, res) => {
        try {
            const { team_id, worker_id, active_status } = req.body;

            if (!team_id || !worker_id) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing: team_id, worker_id"
            });
            }

            const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

            const data = {
            team_id,
            worker_id,
            active_status: active_status,
            create_by: req.user?.id || null,
            created_at
            };

            const assignment_id = await insertData("tx_team_employee_assignment", data);
            if (!assignment_id) throw new Error("Failed to create assignment");

            res.status(201).json({
            success: true,
            message: "Team employee assignment created successfully",
            data: { team_worker_assignment_id: assignment_id, ...data }
            });

        } catch (error) {
            console.error("Error in createTeamEmployeeAssignment:", error.message);
            res.status(500).json({ success: false, message: "Unable to create assignment", error: error.message });
        }
    };
    getAllTeamEmployeeAssignments = async (req, res) => {
        try {
            const table = `
            tx_team_employee_assignment AS a
            JOIN md_team AS t ON a.team_id = t.team_id
            JOIN em_employees AS e ON a.worker_id = e.employee_id
            `;

            const select = `
            a.*,
            t.team_name,
            e.first_name AS worker_first_name,
            e.last_name AS worker_last_name,
            e.email AS worker_email,
            e.phone AS worker_phone
            `;

            const assignments = await selectData(table, select, null, "a.team_worker_assignment_id ASC");

            if (!assignments || assignments.length === 0) {
            return res.status(404).json({ success: false, message: "No team employee assignments found" });
            }

            res.status(200).json({ success: true, data: assignments });

        } catch (error) {
            console.error("Error in getAllTeamEmployeeAssignments:", error.message);
            res.status(500).json({ success: false, message: "Unable to fetch assignments", error: error.message });
        }
    };


    getTeamEmployeeAssignmentById = async (req, res) => {
        try {
            const { id } = req.params;

            const table = `
            tx_team_employee_assignment AS a
            JOIN md_team AS t ON a.team_id = t.team_id
            JOIN em_employees AS e ON a.worker_id = e.employee_id
            `;

            const select = `
            a.*,
            t.team_name,
            e.first_name AS worker_first_name,
            e.last_name AS worker_last_name,
            e.email AS worker_email,
            e.phone AS worker_phone
            `;

            const condition = `a.team_worker_assignment_id = ${id}`;
            const assignment = await selectOneData(table, select, condition);

            if (!assignment) {
            return res.status(404).json({ success: false, message: "Team employee assignment not found" });
            }

            res.status(200).json({ success: true, data: assignment });

        } catch (error) {
            console.error("Error in getTeamEmployeeAssignmentById:", error.message);
            res.status(500).json({ success: false, message: "Unable to fetch assignment", error: error.message });
        }
    };

    updateTeamEmployeeAssignment = async (req, res) => {
        try {
            const { id } = req.params;
            const { team_id, worker_id, active_status } = req.body;

            const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

            const updateValues = { updated_at };
            if (team_id) updateValues.team_id = team_id;
            if (worker_id) updateValues.worker_id = worker_id;
            if (active_status !== undefined) updateValues.active_status = active_status;

            if (Object.keys(updateValues).length === 1) {
            return res.status(400).json({ success: false, message: "No valid fields provided to update" });
            }

            const affectedRows = await updateData("tx_team_employee_assignment", updateValues, `team_worker_assignment_id = ${id}`);
            if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Assignment not found or no changes made" });
            }

            res.status(200).json({ success: true, message: "Assignment updated successfully", data: updateValues });

        } catch (error) {
            console.error("Error in updateTeamEmployeeAssignment:", error.message);
            res.status(500).json({ success: false, message: "Unable to update assignment", error: error.message });
        }
    };


    deleteTeamEmployeeAssignment = async (req, res) => {
        try {
            const { id } = req.params;

            const deletedRows = await deleteData("tx_team_employee_assignment", `team_worker_assignment_id = ${id}`);
            if (deletedRows === 0) {
            return res.status(404).json({ success: false, message: "Assignment not found or already deleted" });
            }

            res.status(200).json({ success: true, message: "Assignment deleted successfully" });

        } catch (error) {
            console.error("Error in deleteTeamEmployeeAssignment:", error.message);
            res.status(500).json({ success: false, message: "Unable to delete assignment", error: error.message });
        }
    };





}

module.exports = new TeamEmployeeAssignmentController();
