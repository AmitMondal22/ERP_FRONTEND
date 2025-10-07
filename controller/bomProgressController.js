const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);


const { updateData, selectOneData, insertData, deleteData, selectData, customSelectSqlQuery } = require("../models/MasterModel");


class BomProgressController {

  // Create
 bulkCreateOrUpdate = async (req, res) => {
    try {
      const { bom_progress_list } = req.body;

      if (!Array.isArray(bom_progress_list) || bom_progress_list.length === 0) {
        return res.status(400).json({ success: false, message: "No progress items provided" });
      }

      const timestamp = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
      const results = [];

      const processItem = async (item) => {
        const { bom_progress_id, bom_id, bom_progress_name, sl_number } = item;
        

        if (!bom_id || !bom_progress_name || sl_number === undefined) {
          return { success: false, item, message: "Missing required fields" };
        }

        // Common select function
        const fetchProgress = async (id) =>
          await customSelectSqlQuery(`SELECT * FROM md_bom_progress WHERE bom_progress_id = ${id}`);

        if (bom_progress_id) {
          // UPDATE
          const updatedRows = await updateData(
            "md_bom_progress",
            {
              bom_progress_name,
              sl_number,
              updated_at: timestamp
            },
            `bom_progress_id = ${Number(bom_progress_id)}`
          );

          if (!updatedRows) {
            return { success: false, item, message: "Not found or nothing updated" };
          }

          const updatedProgress = await fetchProgress(bom_progress_id);
          return { success: true, action: "updated", data: updatedProgress };

        } else {
          // CREATE
          const insertedId = await insertData("md_bom_progress", {
            bom_id,
            bom_progress_name,
            sl_number,
            created_by: req.user.id,
            created_at: timestamp,
          });

          const newProgress = await fetchProgress(insertedId);
          return { success: true, action: "created", data: newProgress };
        }
      };

      for (const item of bom_progress_list) {
        const result = await processItem(item);
        results.push(result);
      }

      res.status(200).json({ success: true, results });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to process BOM progress" });
    }
  };

  // Get a single project by ID
  getBomProgress = async (req, res) => {
    try {
      const { id } = req.params;
      const bomProgress = await selectOneData("md_bom_progress", "*", `bom_progress_id = ${Number(id)}`);

    

      res.status(200).json({ success: true, data: bomProgress });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to fetch BOM Progress" });
    }
  };


  // Get all projects
  getAllBomProgress = async (req, res) => {
    try {
      const { bom_id } = req.params;
      let confition = `bom_id = ${Number(bom_id)}`
      let select = `bom_progress_id,
        bom_id,
        bom_progress_name,
        sl_number,
        (SELECT COUNT(*) FROM md_bom_item WHERE bom_progress_id = md_bom_progress.bom_progress_id) AS total_bom_items`
      const bomProgress = await selectData("md_bom_progress",select,confition);
      res.status(200).json({ success: true, data: bomProgress });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to fetch bom progress" });
    }
  };


    // Delete project by ID
  deleteBomProgress = async (req, res) => {
    try {
      const { id } = req.params;
      const condition = `bom_progress_id = ${Number(id)}`;
      const deletedRows = await deleteData("md_bom_progress", condition);
      if (!deletedRows) {
        return res.status(404).json({ success: false, message: "Bom Progress not found or already deleted" });
      }
      res.status(200).json({ success: true, message: "Bom Progress deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to delete Bom Progress" });
    }
  };


}

module.exports = new BomProgressController();
