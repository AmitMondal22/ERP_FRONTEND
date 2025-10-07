const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);


const { updateData, selectOneData, insertData, deleteData, selectData } = require("../models/MasterModel");

 
class BomController {

  // CreateORupdate
//   createOrUpdateBom = async (req, res) => {
//     try {
//       const { bom_id, bom_name } = req.body;

//       if (!bom_name) {
//         return res.status(400).json({ success: false, message: "BOM name is required" });
//       }

//       const timestamp = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

//       if (bom_id) {
//         // UPDATE existing BOM
//         const setValues = {
//           bom_name,
//           updated_at: timestamp,
//           create_by: req.user.id,
//         };

//         const condition = `bom_id = ${Number(bom_id)}`;
//         const updatedRows = await updateData("md_bom", setValues, condition);

//         if (!updatedRows) {
//           return res.status(404).json({ success: false, message: "BOM not found or nothing to update" });
//         }
//         return res.status(200).json({ success: true, message: "BOM updated", data: updatedRows });

//       } else {
//         // CREATE new BOM
//         const insertValues = {
//           bom_name,
//           create_by: req.user.id,
//           created_at: timestamp,
//         };

//         // const insertedId = await insertData("md_bom", insertValues);
//         // return res.status(201).json({ success: true, message: "BOM created", data: insertedId });
//         const insertedId = await insertData("md_bom", insertValues);
// return res.status(201).json({
//   success: true,
//   message: "BOM created",
//   data: { bom_id: insertedId }
// });
//       }

//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ success: false, message: "Unable to create or update BOM" });
//     }
//   };


createOrUpdateBom = async (req, res) => {
  try {
    const { bom_id, bom_name } = req.body;

    if (!bom_name) {
      return res.status(400).json({ success: false, message: "BOM name is required" });
    }

    const timestamp = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

    if (bom_id) {
      // ✅ UPDATE existing BOM
      const setValues = { 
        bom_name,
        updated_at: timestamp,
        // updated_by: req.user.id   // use this if you add column "updated_by"
      };

      const condition = `bom_id = ${Number(bom_id)}`;
      const updatedRows = await updateData("md_bom", setValues, condition);

      if (!updatedRows) {
        return res.status(404).json({
          success: false,
          message: "BOM not found or nothing to update"
        });
      }

      // ✅ Always return same shape
      return res.status(200).json({
        success: true,
        message: "BOM updated",
        data: { bom_id: Number(bom_id) }
      });

    } else {
      // ✅ CREATE new BOM
      const insertValues = {
        bom_name,
        create_by: req.user.id,
        created_at: timestamp,
      };

      const insertedId = await insertData("md_bom", insertValues);

      return res.status(201).json({
        success: true,
        message: "BOM created",
        data: { bom_id: insertedId }
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Unable to create or update BOM"
    });
  }
};

  
  

  // Get a single project by ID
  getBom = async (req, res) => {
    try {
      const { id } = req.params;
     
      const table=`md_bom b
      LEFT JOIN md_bom_progress p ON b.bom_id = p.bom_id
      LEFT JOIN md_bom_item i ON p.bom_progress_id = i.bom_progress_id AND p.bom_id = i.bom_id
      LEFT JOIN md_product pr ON i.product_id = pr.product_id
      LEFT JOIN md_unit u ON pr.unit_id = u.unit_id
      LEFT JOIN md_product_type pt ON pr.product_type_id = pt.product_type_id`

      const condition = `b.bom_id = ${Number(id)}`

      const bom = await selectData(table, select, condition);



      const bomData = {
        bom_id: null,
        bom_name: null,
        progresses: []
      };

      const progressMap = new Map();
      for (const row of bom) {
        // Populate BOM data (once)
        if (!bomData.bom_id) {
          bomData.bom_id = row.bom_id;
          bomData.bom_name = row.bom_name;
        }
        // Process progress data
        if (row.bom_progress_id && !progressMap.has(row.bom_progress_id)) {
          progressMap.set(row.bom_progress_id, {
            bom_progress_id: row.bom_progress_id,
            bom_progress_name: row.bom_progress_name,
            sl_number: row.sl_number,
            items: []
          });
        }
        // Process item data with product, unit, and product type
        if (row.bom_item_id) {
          const progress = progressMap.get(row.bom_progress_id);
          progress.items.push({
            bom_item_id: row.bom_item_id,
            product_id: row.product_id,
            qty: row.qty,
            total_qty: row.total_qty,
            created_by: row.item_created_by,
            created_at: row.item_created_at,
            updated_at: row.item_updated_at,
            product: {
              product_id: row.product_id,
              product_name: row.product_name,
              hsn_code: row.hsn_code,
              manufacturer_name: row.manufacturer_name,
              qty: row.product_qty,
              
              unit_id: row.unit_id,
              unit_name: row.unit_name,
              quantity: row.unit_quantity,

              product_type_id: row.product_type_id,
              product_type_name: row.product_type_name
              
            }
          });
        }
      }

      bomData.progresses = Array.from(progressMap.values());

      res.status(200).json({ success: true, data: bomData });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to fetch project" });
    }
  };

  // Get all projects
  getAllBom = async (req, res) => {
    try {

      const select= `b.bom_id,
        b.bom_name,
        b.create_by,
        b.created_at,
        b.updated_at,
        COUNT(p.bom_progress_id) AS total_bom_progress,
        COUNT(i.bom_item_id) AS total_bom_items`

      const table=`md_bom b
        LEFT JOIN 
            md_bom_progress p ON p.bom_id = b.bom_id
        LEFT JOIN 
            md_bom_item i ON i.bom_id = b.bom_id
        GROUP BY 
            b.bom_id, b.bom_name, b.create_by, b.created_at, b.updated_at`




      const bom = await selectData(table,select);
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
