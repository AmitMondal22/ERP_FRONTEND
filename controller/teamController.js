const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const bcrypt = require("bcrypt");


const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
} = require("../models/MasterModel");

class TeamController {

  // Add Vendor
    // createTeam = async (req, res) => {
    //     try {
    //         const {
    //         team_name,
    //         date,
    //         project_in_charge_id,
    //         site_in_charge_id,
    //         project_id,
    //         project_site_id,
    //         operator_id
    //         } = req.body;

    //         // Validate required fields
    //         if (!team_name || !date || !project_in_charge_id || !site_in_charge_id || !project_id || !project_site_id || !operator_id) {
    //         return res.status(400).json({
    //             success: false,
    //             message: "Required fields missing: team_name, date, project_in_charge_id, site_in_charge_id, project_id, project_site_id, operator_id"
    //         });
    //         }

    //         const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

    //         const teamData = {
    //         team_name,
    //         date,
    //         project_in_charge_id,
    //         site_in_charge_id,
    //         project_id,
    //         project_site_id,
    //         operator_id, 
    //         create_by: req.user?.id || null, // logged-in user id
    //         created_at
    //         };

    //         const team_id = await insertData("md_team", teamData);
    //         if (!team_id) throw new Error("Failed to create team");

    //         res.status(201).json({
    //         success: true,
    //         message: "Team created successfully",
    //         data: {
    //             team_id,
    //             ...teamData
    //         }
    //         });

    //     } catch (error) {
    //         console.error("Error in createTeam:", error.message);
    //         res.status(500).json({
    //         success: false,
    //         message: "Unable to create team",
    //         error: error.message
    //         });
    //     }
    // };

    createTeam = async (req, res) => {
    try {
        const {
            team_name,
            date,
            project_in_charge_id,
            site_in_charge_id,
            project_id,
            project_site_id,
            operator_id
        } = req.body;

        // FIX: convert empty string to NULL
        const final_operator_id = operator_id === "" ? null : operator_id;

        // Validate required fields (ONLY operator_id logic adjusted)
        if (
            !team_name ||
            !date ||
            !project_in_charge_id ||
            !site_in_charge_id ||
            !project_id ||
            !project_site_id ||
            operator_id === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Required fields missing: team_name, date, project_in_charge_id, site_in_charge_id, project_id, project_site_id, operator_id"
            });
        }

        const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

        const teamData = {
            team_name,
            date,
            project_in_charge_id,
            site_in_charge_id,
            project_id,
            project_site_id,
            operator_id: final_operator_id, // FIX applied here
            create_by: req.user?.id || null,
            created_at
        };

        const team_id = await insertData("md_team", teamData);
        if (!team_id) throw new Error("Failed to create team");

        res.status(201).json({
            success: true,
            message: "Team created successfully",
            data: {
                team_id,
                ...teamData
            }
        });

    } catch (error) {
        console.error("Error in createTeam:", error.message);
        res.status(500).json({
            success: false,
            message: "Unable to create team",
            error: error.message
        });
    }
};

 
    // Get all
    getAllTeam = async (req, res) => {
        try {
            // Join md_team with projects, project sites, and operators
            // const table = `
            //     md_team AS t
            //     JOIN md_project AS p ON t.project_id = p.project_id
            //     JOIN md_project_site AS ps ON t.project_site_id = ps.project_site_id
            //     JOIN em_employees AS o ON t.operator_id = o.employee_id
            //     LEFT JOIN em_employees AS pic ON t.project_in_charge_id = pic.employee_id
            //     LEFT JOIN em_employees AS sic ON t.site_in_charge_id = sic.employee_id
            //     `;

            const table = `
    md_team AS t
    LEFT JOIN md_project AS p ON t.project_id = p.project_id
    LEFT JOIN md_project_site AS ps ON t.project_site_id = ps.project_site_id
    LEFT JOIN em_employees AS o ON t.operator_id = o.employee_id
    LEFT JOIN em_employees AS pic ON t.project_in_charge_id = pic.employee_id
    LEFT JOIN em_employees AS sic ON t.site_in_charge_id = sic.employee_id
`;

            const select = `
                t.*,
                p.project_name,
                ps.project_site_name,
                o.first_name AS operator_first_name,
                o.last_name AS operator_last_name,
                o.email AS operator_email,
                o.phone AS operator_phone,
                pic.first_name AS project_in_charge_first_name,
                pic.last_name AS project_in_charge_last_name,
                pic.email AS project_in_charge_email,
                pic.phone AS project_in_charge_phone,
                sic.first_name AS site_in_charge_first_name,
                sic.last_name AS site_in_charge_last_name,
                sic.email AS site_in_charge_email,
                sic.phone AS site_in_charge_phone
                `;

            const teams = await selectData(table, select, null, "t.team_id ASC");

            if (!teams || teams.length === 0) {
            return res.status(404).json({ success: false, message: "No teams found" });
            }

            res.status(200).json({ success: true, data: teams });

        } catch (error) {
            console.error("Error in getAllTeam:", error.message);
            res.status(500).json({ success: false, message: "Unable to fetch teams", error: error.message });
        }
    };


  // Get  by ID
  getTeamById = async (req, res) => {
    try {
        const { team_id } = req.params;

        // Join md_team with projects, project sites, and employees for operator, project in charge, and site in charge
        const table = `
        md_team AS t
        JOIN md_project AS p ON t.project_id = p.project_id
        JOIN md_project_site AS ps ON t.project_site_id = ps.project_site_id
        JOIN em_employees AS o ON t.operator_id = o.employee_id
        LEFT JOIN em_employees AS pic ON t.project_in_charge_id = pic.employee_id
        LEFT JOIN em_employees AS sic ON t.site_in_charge_id = sic.employee_id
        `; 

        const condition = `t.team_id = ${team_id}`;

        const select = `
        t.*,
        p.project_name,
        ps.project_site_name,
        o.first_name AS operator_first_name,
        o.last_name AS operator_last_name,
        o.email AS operator_email,
        o.phone AS operator_phone,
        pic.first_name AS project_in_charge_first_name,
        pic.last_name AS project_in_charge_last_name,
        pic.email AS project_in_charge_email,
        pic.phone AS project_in_charge_phone,
        sic.first_name AS site_in_charge_first_name,
        sic.last_name AS site_in_charge_last_name,
        sic.email AS site_in_charge_email,
        sic.phone AS site_in_charge_phone
        `;

        const team = await selectOneData(table, select, condition);

        if (!team) {
        return res.status(404).json({ success: false, message: "Team not found" });
        }

        res.status(200).json({ success: true, data: team });

    } catch (error) {
        console.error("Error in getTeamById:", error.message);
        res.status(500).json({ success: false, message: "Unable to fetch team", error: error.message });
    }
    };




  // Update Team
  updateTeam = async (req, res) => {
    try {
        const { id } = req.params; // team_id
        const {
        team_name,
        date,
        project_in_charge_id,
        site_in_charge_id,
        project_id,
        project_site_id,
        operator_id
        } = req.body;

        const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

        // Build update object for md_team
        const updateTeamValues = { updated_at };

        if (team_name) updateTeamValues.team_name = team_name;
        if (date) updateTeamValues.date = date;
        if (project_in_charge_id) updateTeamValues.project_in_charge_id = project_in_charge_id;
        if (site_in_charge_id) updateTeamValues.site_in_charge_id = site_in_charge_id;
        if (project_id) updateTeamValues.project_id = project_id;
        if (project_site_id) updateTeamValues.project_site_id = project_site_id;
        if (operator_id) updateTeamValues.operator_id = operator_id;

        const affectedRows = await updateData("md_team", updateTeamValues, `team_id = ${id}`);

        if (affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Team not found or no changes made" });
        }



        res.status(200).json({
        success: true,
        message: "Team updated successfully",
        data: affectedRows
        });

    } catch (error) {
        console.error("Error in updateTeam:", error.message);
        res.status(500).json({
        success: false,
        message: "Unable to update team",
        error: error.message
        });
    }
    };





  deleteTeam = async (req, res) => {
    try {
        const { id } = req.params; // team_id

        // Validate id
        if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid team ID" });
        }

        // Check if team exists
        const team = await selectOneData("md_team", "*", `team_id = ${id}`);
        if (!team) {
        return res.status(404).json({ success: false, message: "Team not found" });
        }

        // Delete the team record
        const deletedTeamRows = await deleteData("md_team", `team_id = ${id}`);
        if (deletedTeamRows === 0) {
        return res.status(404).json({ success: false, message: "Team not found or already deleted" });
        }

        res.status(200).json({
        success: true,
        message: "Team deleted successfully",
        data: { team_id: id }
        });

    } catch (error) {
        console.error("Error in deleteTeam:", error.message);
        res.status(500).json({
        success: false,
        message: "Unable to delete team",
        error: error.message
        });
    }
    };


    


}

module.exports = new TeamController();
