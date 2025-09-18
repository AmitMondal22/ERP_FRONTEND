const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
  batchInsertData,
} = require("../models/MasterModel");

class VendorController {

//  addVendor = async (req, res) => {

//   try {
//     const {name,mobile,email,city_id,address,gst_in, contactPerson = [], } = req.body;


//     // Basic validation
//     if (!name || !mobile || !city_id) {
//       return res.status(400).json({
//         success: false,
//         message: "name, mobile, and city_id are required",
//       });
//     };


//     const created_by = req.user.id; // from auth middleware
//     const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

//     // Insert into md_vendor
//     const vendorValues = {
//       vendor_name: name,
//       vendor_mobile: mobile,
//       vendor_email: email || null,
//       city_id,
//       vendor_address: address || null,
//       vendor_gst_in: gst_in || null,
//       created_by,
//       created_at,
//     };

//     const vendor_id = await insertData("md_vendor", vendorValues);

// //////////////////////////////////////
//     // Insert each contact person if provided
//     if (Array.isArray(contactPerson) && contactPerson.length > 0) {
//       for (const contact of contactPerson) {
//         const contactValues = {
//           contact_person_name: contact.name || null,
//           contact_person_email: contact.email || null,
//           contact_person_mobile_no: contact.mobile || null,
//           contact_person_remarks: contact.remarks || null,
//           fatch_id: vendor_id,
//           type: "VN",
//           created_by,
//           created_at,
//         };
//         await insertData("md_contact_person", contactValues);
//       }
//     }

//     // Optionally fetch the full inserted vendor record
//     const newVendor = await selectOneData(
//       "md_vendor",
//       "*",
//       `vendor_id = ${vendor_id}`
//     );

//     res.status(201).json({
//       success: true,
//       message: "Vendor created successfully",
//       data: {
//         ...newVendor,
//         contact_persons: contactPerson,
//       },
//     });
//   } catch (error) {
//     console.error("Add vendor error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Unable to add vendor",
//     });
//   }
// };



 addVendor = async (req, res) => {
  try {
    const {name,mobile,email,city_id,address,gst_in,contactPerson = [], } = req.body;

    // ---------- basic validation ----------
    if (!name || !mobile || !city_id) {
      return res.status(400).json({
        success: false,
        message: "name, mobile, and city_id are required",
      });
    }

    const created_by = req.user.id;           // set by auth middleware
    const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

    // ---------- insert vendor ----------
    const vendorValues = {
      vendor_name: name,
      vendor_mobile: mobile,
      vendor_email: email || null,
      city_id,
      vendor_address: address || null,
      vendor_gst_in: gst_in || null,
      created_by,
      created_at,
    };

    const vendor_id = await insertData("md_vendor", vendorValues);

    // ---------- batch insert contacts ----------
    if (Array.isArray(contactPerson) && contactPerson.length > 0) {
      const columns = [
        "contact_person_name",
        "contact_person_email",
        "contact_person_mobile_no",
        "contact_person_remarks",
        "fatch_id",        
        "type",
        "created_by",
        "created_at",
      ];

      const rows = contactPerson.map(c => ({
        contact_person_name: c.name || null,
        contact_person_email: c.email || null,
        contact_person_mobile_no: c.mobile || null,
        contact_person_remarks: c.remarks || null,
        fatch_id: vendor_id,
        type: "VN",
        created_by,
        created_at,
      }));

      await batchInsertData("md_contact_person", columns.join(","), rows);
    }

    // ---------- fetch and return full vendor ----------
    const newVendor = await selectOneData(
      "md_vendor",
      "*",
      `vendor_id = ${vendor_id}`
    );

    res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      data: {
        ...newVendor,
        contact_persons: contactPerson,
      },
    });
  } catch (error) {
    console.error("Add vendor error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to add vendor",
    });
  }
};



//////


   addContactPerson = async (req, res) => {
  try {
    const { name, mobile, email, id, type } = req.body;

    // Basic validation
    if (!name || !mobile || !id || !type) {
      return res.status(400).json({
        success: false,
        message: "name, mobile, id, and type are required",
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    /////

    const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

    const c_columns = {
      contact_person_name: name,
      contact_person_email: email || null,
      contact_person_mobile_no: mobile,
      contact_person_remarks: null,
      fatch_id: id,           // or vendor_id if you rename the column
      type,
      created_by: req.user.id,
      created_at,
    };

    const newId = await insertData("md_contact_person", c_columns);

    res.status(201).json({
      success: true,
      message: "Contact person created successfully",
      data: {
        id: newId,
        name,
        mobile,
        email,
        created_by: req.user.id,
        created_at,
      },
    });
  } catch (error) {
    console.error("Error in addContactPerson:", error);
    res.status(500).json({
      success: false,
      message: "Unable to add contact person",
    });
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
    const { vendor_id } = req.params;
    const table = "md_vendor as a, lo_cities as b, lo_states as c";
    const condition = `a.city_id = b.id AND b.state_id = c.id AND a.vendor_id = ${vendor_id}`;
    const select = "a.*, b.name AS city_name, b.state_id, c.name AS state_name";

    // Fetch vendor
    const vendor = await selectOneData(table, select, condition);
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    
    const contact_persons = await selectData(
      "md_contact_person",
      "*",
      `fatch_id = ${vendor_id}`
    );

    // If none found, return empty array instead of error (optional)
    if (!contact_persons || contact_persons.length === 0) {
      return res.status(200).json({
        success: true,
        data: { vendor, contact_persons: [] },
      });
    }

    res.status(200).json({
      success: true,
      data: { vendor, contact_persons },
    });
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

    
    const updateValues = { updated_at };

    // Add only the fields that exist in req.body
    if (name !== undefined)    updateValues.vendor_name = name;
    if (mobile !== undefined)  updateValues.vendor_mobile = mobile;
    if (email !== undefined)   updateValues.vendor_email = email;
    if (city_id !== undefined) updateValues.city_id = city_id;
    if (address !== undefined) updateValues.vendor_address = address;
    if (gst_in !== undefined)  updateValues.vendor_gst_in = gst_in;

    // If nothing to update besides updated_at
    if (Object.keys(updateValues).length === 1) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    const affectedRows = await updateData(
      "md_vendor",
      updateValues,
      `vendor_id = ${id}`
    );

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found or no changes made",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      data: affectedRows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Unable to update vendor" });
  }
};

  


///////
  updateContactPerson = async (req, res) => {
  try {
    const { id } = req.params;                 // contact_person_id (or whatever PK you use)
    const { name, mobile, email, remarks } = req.body;

    const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

    // Build the object dynamically so we only update what the client provided
    const updateValues = { updated_at };

    if (name   !== undefined) updateValues.contact_person_name       = name;
    if (email  !== undefined) updateValues.contact_person_email      = email;
    if (mobile !== undefined) updateValues.contact_person_mobile_no  = mobile;
    if (remarks!== undefined) updateValues.contact_person_remarks    = remarks;

    // If the request body had no updatable fields
    if (Object.keys(updateValues).length === 1) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

  
    const affectedRows = await updateData(
      "md_contact_person",
      updateValues,
      `contact_person_id = ${id}`
    );

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Contact person not found or no changes made",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact person updated successfully",
      data: affectedRows,
    });
  } catch (error) {
    console.error("Error updating contact person:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update contact person",
    });
  }
};




  // Delete vendor
  deleteVendor = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedRows = await deleteData("md_vendor", `vendor_id = ${id}`);

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
