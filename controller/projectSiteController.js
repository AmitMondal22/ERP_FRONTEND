

const { insertData,selectData ,selectOneData, selectLastData, deleteData} = require("../models/MasterModel");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);


class projectSiteController{

    createProjectSite = async (req,res) => {
        try {
            const { project_site_name,address, city_id, project_id, from_date, to_date} = req.body;
            const insertValues = {
                project_site_name,
                address,
                city_id,
                project_id,
                from_date,
                to_date,
                create_by: req.user.id,
                created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
            };
            const insertedId = await insertData("md_project_site", insertValues);
            return res.status(200).json({
            success: true,
            message: "Project Site created",
            data: insertedId
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to create project Site",
                error: error.message
            });
        }
        
    }


    getAllProjectsSite = async (req, res) => {
        try {
            const table = "md_project_site as a, lo_cities as b, lo_states as c",
                condition = `a.city_id=b.id AND b.state_id = c.id`,//join 3 table
                select = "a.*,b.name, b.state_id,c.name"
            const projectsSites = await selectData(table,select,condition,'a.project_site_name ASC');
            res.status(200).json({ success: true, data: projectsSites });
        } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to fetch projects" });
        }
    };


    getProjectSite = async (req, res) => {
        try {
            const { id } = req.params;
            const table = "md_project_site as a, lo_cities as b, lo_states as c",
                condition = `a.city_id=b.id AND b.state_id = c.id AND a.project_site_id = ${Number(id)}`,//join 3 table
                select = "a.*,b.name, b.state_id,c.name"
            const projectsSite = await selectLastData(table,select,condition,'a.project_site_name');
            res.status(200).json({ success: true, data: projectsSite });
        } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to fetch projects" });
        }
    };


    updateProjectsSite = async (req, res) => {
        try {
            const { id } = req.params;
            const { project_site_name,address, city_id,  project_id, from_date, to_date } = req.body;

            const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

            const setValues = {};
            if (project_site_name !== undefined) setValues.project_site_name = project_site_name;
            if (address !== undefined) setValues.address = address;
            if (city_id !== undefined) setValues.city_id = city_id;
            if (project_id !== undefined) setValues.project_id = project_id;
            if (from_date !== undefined) setValues.from_date = from_date;
            if (to_date !== undefined) setValues.to_date = to_date;


            setValues.create_by = req.user.id;
            setValues.updated_at = updated_at;

            const condition = `project_site_id = ${Number(id)}`;
            const updatedRows = await updateData("md_project_site", setValues, condition);

            if (!updatedRows) {
                return res.status(404).json({ success: false, message: "Project Site not found or nothing to update" });
            }

            res.status(200).json({ success: true, message: "Project Site updated", data: updatedRows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Unable to update project site" });
        }
    };

    deleteProjectSite = async (req, res) => {
        try {
            const { id } = req.params;
            const condition = `project_site_id = ${Number(id)}`;
            const deletedRows = await deleteData("md_project_site", condition);

            if (!deletedRows) {
                return res.status(404).json({ success: false, message: "Project site not found or already deleted" });
            }

            res.status(200).json({ success: true, message: "Project site deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Unable to delete project site" });
        }
    };


}


module.exports= new projectSiteController()