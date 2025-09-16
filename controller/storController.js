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

class StorController {

  // Add 
    createStore = async (req, res) => {
        try {
            const {
            project_id,
            store_name,
            store_address,
            store_man_id
            } = req.body;

            // Validate required fields
            if (!project_id || !store_name || !store_address || !store_man_id) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing: project_id, store_name, store_address, store_man_id"
            });
            }

            const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

            const storeData = {
            project_id,
            store_name,
            store_address,
            store_man_id,
            created_by: req.user?.id || null,  // logged-in user id
            created_at
            };

            const store_id = await insertData("md_store", storeData);
            if (!store_id) throw new Error("Failed to create store");

            res.status(201).json({
            success: true,
            message: "Store created successfully",
            data: {
                store_id,
                ...storeData
            }
            });

        } catch (error) {
            console.error("Error in createStore:", error.message);
            res.status(500).json({
            success: false,
            message: "Unable to create store",
            error: error.message
            });
        }
        };




    // Get all
    getAllStore = async (req, res) => {
        try {
            const table = `
            md_store AS s
            JOIN md_project AS p ON s.project_id = p.project_id
            LEFT JOIN em_employees AS m ON s.store_man_id = m.employee_id
            `;

            const select = `
            s.*,
            p.project_name,
            m.first_name AS manager_first_name,
            m.last_name AS manager_last_name,
            m.email AS manager_email,
            m.phone AS manager_phone
            `;

            const stores = await selectData(table, select, null, "s.store_id ASC");

            if (!stores || stores.length === 0) {
            return res.status(404).json({ success: false, message: "No stores found" });
            }

            res.status(200).json({ success: true, data: stores });

        } catch (error) {
            console.error("Error in getAllStore:", error.message);
            res.status(500).json({
            success: false,
            message: "Unable to fetch stores",
            error: error.message
            });
        }
        };



  // Get  by ID
  getStoreById = async (req, res) => {
    try {
        const { id } = req.params; // store_id

        const table = `
        md_store AS s
        JOIN md_project AS p ON s.project_id = p.project_id
        LEFT JOIN em_employees AS m ON s.store_man_id = m.employee_id
        `;

        const select = `
        s.*,
        p.project_name,
        m.first_name AS manager_first_name,
        m.last_name AS manager_last_name,
        m.email AS manager_email,
        m.phone AS manager_phone
        `;

        const condition = `s.store_id = ${id}`;
        const store = await selectOneData(table, select, condition);

        if (!store) {
        return res.status(404).json({ success: false, message: "Store not found" });
        }

        res.status(200).json({ success: true, data: store });

    } catch (error) {
        console.error("Error in getStoreById:", error.message);
        res.status(500).json({
        success: false,
        message: "Unable to fetch store",
        error: error.message
        });
    }
    };



  // Update 
  updateStore = async (req, res) => {
    try {
        const { id } = req.params; // store_id
        const { project_id, store_name, store_address, store_man_id } = req.body;

        const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

        // Prepare values dynamically
        const updateValues = { updated_at };
        if (project_id) updateValues.project_id = project_id;
        if (store_name) updateValues.store_name = store_name;
        if (store_address) updateValues.store_address = store_address;
        if (store_man_id) updateValues.store_man_id = store_man_id;

        // If nothing to update
        if (Object.keys(updateValues).length === 1) {
        return res.status(400).json({
            success: false,
            message: "No valid fields provided to update"
        });
        }

        const affectedRows = await updateData("md_store", updateValues, `store_id = ${id}`);
        if (affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Store not found or no changes made" });
        }

        res.status(200).json({
        success: true,
        message: "Store updated successfully",
        data: updateValues
        });

    } catch (error) {
        console.error("Error in updateStore:", error.message);
        res.status(500).json({
        success: false,
        message: "Unable to update store",
        error: error.message
        });
    }
    };




  deleteStore = async (req, res) => {
    try {
        const { id } = req.params; // store_id

        // Delete store record
        const deletedRows = await deleteData("md_store", `store_id = ${id}`);
        if (deletedRows === 0) {
        return res.status(404).json({
            success: false,
            message: "Store not found or already deleted"
        });
        }

        res.status(200).json({
        success: true,
        message: "Store deleted successfully"
        });

    } catch (error) {
        console.error("Error in deleteStore:", error.message);
        res.status(500).json({
        success: false,
        message: "Unable to delete store",
        error: error.message
        });
    }
    };





}

module.exports = new StorController();
