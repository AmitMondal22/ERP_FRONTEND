const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const { insertData, selectData, selectOneData, updateData, deleteData } = require("../models/MasterModel");

//unit_id	unit_name	quantity	created_by	created_at	updated_at	
class unitController {

  // Add a new unit
  // addUnit = async (req, res) => {
  //   try {
  //     const { unit_name, quantity, created_by } = req.body;

  //     // Validate required fields
  //     if (!unit_name || quantity === undefined || !created_by) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "unit_name, quantity and created_by are required",
  //       });
  //     }

  //     const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

  //     const columns = "unit_name, quantity, created_by, created_at";
  //     const values = [unit_name, quantity, created_by, created_at].map(v => v === undefined ? null : v);

  //     const unit_id = await insertData("md_unit", columns, values);

  //     res.status(200).json({
  //       success: true,
  //       message: "Unit added successfully",
  //       data: { unit_id, unit_name, quantity, created_by, created_at },
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ success: false, message: "Unable to add unit" });
  //   }
  // };


 addUnit = async (req, res) => {
  try {
    const { unit_name, quantity } = req.body;
    if (!unit_name || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "unit_name and quantity are required",
      });
    }

    const created_by = req.user.id; // set by auth middleware
    const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

    const unit_id = await insertData("md_unit", {
      unit_name,
      quantity,
      created_by,
      created_at,
    });

    res.status(200).json({
      success: true,
      message: "Unit added successfully",
      data: { unit_id, unit_name, quantity, created_by, created_at },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Unable to add unit" });
  }
};






  // Get all units
  getUnits = async (req, res) => {
    try {
      const units = await selectData("md_unit", "*", null, "unit_id DESC");

      if (!units || units.length === 0) {
        return res.status(404).json({ success: false, message: "No units found" });
      }

      res.status(200).json({ success: true, data: units });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to fetch units" });
    }
  };

  // Get single unit by ID
  getUnitById = async (req, res) => {
    try {
      const { id } = req.params;
      const condition = `unit_id = ${id}`;
      const unit = await selectOneData("md_unit", "*", condition);

      if (!unit) {
        return res.status(404).json({ success: false, message: "Unit not found" });
      }

      res.status(200).json({ success: true, data: unit });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to fetch unit" });
    }
  };

//   // Update unit by ID
//   updateUnit = async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { unit_name, quantity } = req.body;

//       const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

//       const setValues = {};
//       if (unit_name !== undefined) setValues.unit_name = unit_name;
//       if (quantity !== undefined) setValues.quantity = quantity;
//       setValues.updated_at = updated_at;

//       const condition = `unit_id = ${id}`;
//       const updatedRows = await updateData("md_unit", setValues, condition);

//       if (!updatedRows) {
//         return res.status(404).json({ success: false, message: "Unit not found or nothing to update" });
//       }

//       res.status(200).json({ success: true, message: "Unit updated successfully" });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ success: false, message: "Unable to update unit" });
//     }
//   };




  // Update unit by ID

 updateUnit = async (req, res) => {
  try {
    const { id } = req.params; 
    if (!id) return res.status(400).json({ success: false, message: "Unit ID is required" });

    const { unit_name, quantity } = req.body;
    //const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
    const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");



    const setValues = {};
    if (unit_name !== undefined) setValues.unit_name = unit_name;
    if (quantity !== undefined) setValues.quantity = quantity;
    setValues.updated_at = updated_at;

    // Make sure condition is a valid string
    const condition = `unit_id = ${Number(id)}`;

    //const condition= `${id}`

    const updatedRows = await updateData("md_unit", setValues, condition);

    if (!updatedRows) {
      return res.status(404).json({ success: false, message: "Unit not found or nothing to update" });
    }

    // Use your existing selectOneData as-is

    // const updatedUnit = await selectOneData("md_unit", "*", condition);

    res.status(200).json({ 
      success: true, 
      message: "Unit updated successfully",
      data: updatedRows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Unable to update unit" });
  }
};






  // Delete unit by ID
  deleteUnit = async (req, res) => {
    try {
      const { id } = req.params;
      const condition = `unit_id = ${id}`;
      const deletedRows = await deleteData("md_unit", condition);

      if (!deletedRows) {
        return res.status(404).json({ success: false, message: "Unit not found" });
      }

      res.status(200).json({ success: true, message: "Unit deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to delete unit" });
    }
  };
}

module.exports = new unitController();
