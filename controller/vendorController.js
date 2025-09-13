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

class VendorController {

  // Add Vendor
  addVendor = async (req, res) => {
    try {
      const { name, mobile, email, city_id, address, gst_in } = req.body;
      const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

      const columns = [
        "vendor_name",
        "vendor_mobile",
        "vendor_email",
        "vendor_city_id",
        "vendor_address",
        "vendor_gst_in",
        "created_by",
        "created_at",
      ];

      const values = [name, mobile, email, city_id, address, gst_in, 1, created_at]

      // Assuming insertData is a helper like:
      // insertData(tableName, columnsArray, valuesArray)
      const vendor_id = await insertData("md_vendor", columns, values);

      res.status(201).json({
        success: true,
        message: "Vendor created successfully",
        data: {
          id: vendor_id,
          name,
          mobile,
          email,
          city_id,
          address,
          gst_in,
          created_by,
          created_at,
        },
      });
    } catch (error) {
      console.error("Error in addVendor:", error);
      res.status(500).json({ success: false, message: "Unable to add vendor" });
    }
  };

  // Get all vendors
  getAllVendors = async (req, res) => {
    try {
      const vendors = await selectData("md_vendor", "*");
      if (!vendors || vendors.length === 0) {
        return res.status(404).json({ success: false, message: "No vendors found" });
      }
      res.status(200).json({ success: true, data: vendors });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to fetch vendors" });
    }
  };

  // Get vendor by ID
  getVendorById = async (req, res) => {
    try {
      const { vendor_id} = req.params;
      const vendor = await selectOneData("md_vendor", "*", `id = ${vendor_id}`);
      if (!vendor) {
        return res.status(404).json({ success: false, message: "Vendor not found" });
      }
      res.status(200).json({ success: true, data: vendor });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to fetch vendor" });
    }
  };

  // Update vendor
  updateVendor = async (req, res) => {
    try {
      const { id } = req.params;
      const updateFields = req.body;
      console.log(">>>>>>>>>>>>")

      const affectedRows = await updateData("md_vendor", updateFields, `id = ${id}`);
      if (affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Vendor not found or no changes made" });
      }

      const updatedVendor = await selectOneData("md_vendor", "*", `id = ${id}`);
      res.status(200).json({ success: true, message: "Vendor updated successfully", data: updatedVendor });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to update vendor" });
    }
  };

  // Delete vendor
  deleteVendor = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedRows = await deleteData("md_vendor", `id = ${id}`);
      if (deletedRows === 0) {
        return res.status(404).json({ success: false, message: "Vendor not found" });
      }
      res.status(200).json({ success: true, message: "Vendor deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to delete vendor" });
    }
  };
}

module.exports = new VendorController();
