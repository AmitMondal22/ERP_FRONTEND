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
      const { name, mobile, email, city_id, address, gst_in, contactPerson } = req.body;
      const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

      const columns = [
        "vendor_name",
        "vendor_mobile",
        "vendor_email",
        "city_id",
        "vendor_address",
        "vendor_gst_in",
        "created_by",
        "created_at",
      ];

      const values = [name, mobile, email, city_id, address, gst_in, 1, created_at]

      // Assuming insertData is a helper like:
      // insertData(tableName, columnsArray, valuesArray)
      const vendor_id = await insertData("md_vendor", columns, values);

        for await (const contact of data.contactPerson) {
          let c_columns = [
              'contact_person_name',
              'contact_person_email',
              'contact_person_mobile_no',
              'contact_person_remarks',
              'fatch_id',
              'type',
              'created_by',
              'created_at'
            ]
          ,c_values =[contact.name, contact.email, contact.mobile, "", vendor_id, 'VN', 1, created_at]
          await insertData("md_contact_person", c_columns, c_values);
        }


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
          created_by:1,
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
        const table = "md_vendor as a, lo_cities as b, lo_states as c";
        const condition = `a.city_id = b.id AND b.state_id = c.id`;
        // Give unique aliases for duplicate column names
        const select = "a.*, b.name AS city_name, b.state_id, c.name AS state_name";

        const vendors = await selectData(table, select, condition,"a.vendor_name ASC");
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
      const table = "md_vendor as a, lo_cities as b, lo_states as c";
      const condition = `a.city_id = b.id AND b.state_id = c.id AND id = ${vendor_id}`;
      // Give unique aliases for duplicate column names
      const select = "a.*, b.name AS city_name, b.state_id, c.name AS state_name";
      const vendor = await selectOneData(table, select, condition);
       if (!vendor) {
        return res.status(404).json({ success: false, message: "Vendor not found" });
      }

      const contact_person = await selectOneData("md_contact_person", "*", `fatch_id = ${vendor_id}`);
      if (!contact_person) {
        return res.status(404).json({ success: false, message: "Contact Person not found" });
      }
      res.status(200).json({ success: true, data: {vendor, contact_person} });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to fetch vendor" });
    }
  };

  // Update vendor
  updateVendor = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, mobile, email, city_id, address, gst_in } = req.body;
      const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
      const updateValues = {
        vendor_name:name,
        vendor_mobile:mobile,
        vendor_email:email,
        city_id,
        vendor_address:address,
        vendor_gst_in:gst_in,
        updated_at,
      };

      const affectedRows = await updateData("md_vendor", updateValues, `vendor_id = ${id}`);
      if (affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Vendor not found or no changes made" });
      }

      
      res.status(200).json({ success: true, message: "Vendor updated successfully", data: affectedRows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to update vendor" });
    }
  };




  updateContactPerson = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, mobile, email } = req.body;
      const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
      const updateValues = {
        contact_person_name:name,
        contact_person_email:email,
        contact_person_mobile_no:mobile,
        contact_person_remarks:"",
        updated_at
      };

      const affectedRows = await updateData("md_contact_person", updateValues, `vendor_id = ${id}`);
      if (affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Contact Person not found or no changes made" });
      }
      res.status(200).json({ success: true, message: "Contact Person updated successfully", data: affectedRows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Contact Person Unable to update vendor" });
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
      const deletedContactPersonRows = await deleteData("md_contact_person", `fatch_id = ${id} AND type = 'VN'`);
      if (deletedContactPersonRows === 0) {
        return res.status(404).json({ success: false, message: "Contact Person not found" });
      }
      res.status(200).json({ success: true, message: "Vendor and Contact Person deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to delete vendor and Contact Person" });
    }
  };


  deleteContactPerson = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedContactPersonRows = await deleteData("md_contact_person", `contact_person_id  = ${id}`);
      if (deletedContactPersonRows === 0) {
        return res.status(404).json({ success: false, message: "Contact Person not found" });
      }
      res.status(200).json({ success: true, message: "Contact Person deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to delete Contact Person" });
    }
  };

}

module.exports = new VendorController();
