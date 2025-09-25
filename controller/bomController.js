const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);


const { updateData, selectOneData, insertData, deleteData, selectData } = require("../models/MasterModel");


class BomController {

  // CreateORupdate
  createOrUpdateBom = async (req, res) => {
    try {
      const { bom_id, bom_name } = req.body;

      if (!bom_name) {
        return res.status(400).json({ success: false, message: "BOM name is required" });
      }

      const timestamp = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

      if (bom_id) {
        // UPDATE existing BOM
        const setValues = {
          bom_name,
          updated_at: timestamp,
          updated_by: req.user.id,
        };

        const condition = `bom_id = ${Number(bom_id)}`;
        const updatedRows = await updateData("md_bom", setValues, condition);

        if (!updatedRows) {
          return res.status(404).json({ success: false, message: "BOM not found or nothing to update" });
        }
        return res.status(200).json({ success: true, message: "BOM updated", data: updatedRows });

      } else {
        // CREATE new BOM
        const insertValues = {
          bom_name,
          create_by: req.user.id,
          created_at: timestamp,
        };

        const insertedId = await insertData("md_bom", insertValues);
        return res.status(201).json({ success: true, message: "BOM created", data: insertedId });
      }

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to create or update BOM" });
    }
  };

  
  

  // Get a single project by ID
  getBom = async (req, res) => {
    try {
      const { id } = req.params;
      const bom = await selectOneData("md_bom", "*", `bom_id = ${Number(id)}`);

      if (!bom) return res.status(404).json({ success: false, message: "bom not found" });

      res.status(200).json({ success: true, data: bom });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to fetch project" });
    }
  };

  // Get all projects
  getAllBom = async (req, res) => {
    try {
      const bom = await selectData("md_bom");
      res.status(200).json({ success: true, data: bom });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to fetch bom" });
    }
  };

  

  // Delete project by ID
  deleteBom = async (req, res) => {
    try {
      const { id } = req.params;
      const condition = `bom_id = ${Number(id)}`;
      const deletedRows = await deleteData("md_bom", condition);
      if (!deletedRows) {
        return res.status(404).json({ success: false, message: "Bom not found or already deleted" });
      }
      res.status(200).json({ success: true, message: "Bom deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to delete Bom" });
    }
  };
}

module.exports = new BomController();
