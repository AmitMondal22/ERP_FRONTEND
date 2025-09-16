const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
} = require("../models/MasterModel");

class EmployeeController {


  generateRandomPassword = (length = 8) => {
    return crypto.randomInt(Math.pow(10, length - 1), Math.pow(10, length)).toString();
  };

  // Add Vendor
  addEmployee = async (req, res) => {
    try {
      const {
        first_name,
        middle_name,
        last_name,
        email,
        phone,
        hire_date,
        department,
        job_title,
        manager_id,
        base_salary,
        allowance,
        status,
        em_id,
        employee_dob,
        employee_address,
        city_id,
        employee_designation_id,
        department_id,
        date_of_joining,
        role,
      } = req.body;

      if (!first_name || !last_name || !email || !phone) {
        return res.status(400).json({
          success: false,
          message: "Required fields missing: first_name, last_name, email, phone",
        });
      }

      const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

      // Full name
      const full_name = [first_name, middle_name, last_name].filter(Boolean).join(" ");

      // Generate and hash password
      const plainPassword = this.generateRandomPassword(8);
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // Insert into users table
      const userData = {
        name: full_name,
        email,
        mobile_no: phone,
        password: hashedPassword,
        otp_status: false,
        user_status: role == "wk" ? false : true, // activate by default?
        role,
        create_by: req.user?.id || null,
        created_at,
      };

      const user_id = await insertData("users", userData);
      if (!user_id) throw new Error("Failed to create user record");

      // Insert into employees table
      const employeeData = {
        user_id,
        first_name,
        middle_name,
        last_name,
        email,
        phone,
        hire_date,
        department,
        job_title,
        manager_id,
        base_salary,
        allowance,
        em_id,
        employee_dob,
        employee_address,
        city_id,
        employee_designation_id,
        department_id,
        date_of_joining,
        status,
        created_at,
      };

      const employee_id = await insertData("em_employees", employeeData);
      if (!employee_id) throw new Error("Failed to create employee record");

      res.status(201).json({
        success: true,
        message: "Employee created successfully",
        data: {
          employee_id,
          user_id,
          full_name,
          email,
          phone,
          department,
          job_title,
          created_at,
        }
      });
    } catch (error) {
      console.error("Error in addEmployee:", error.message);
      res.status(500).json({
        success: false,
        message: "Unable to add employee",
        error: error.message,
      });
    }
  };



  // Get all vendors
  getAllemployee = async (req, res) => {
    try {
        const table = "em_employees as a, lo_cities as b, lo_states as c LEFT JOIN em_employees m ON a.manager_id = m.employee_id";
        const condition = `a.city_id = b.id AND b.state_id = c.id`;
        // Give unique aliases for duplicate column names
        const select = "a.*, b.name AS city_name, b.state_id, c.name AS state_name, m.employee_id AS manager_id,  m.first_name AS manager_first_name, m.last_name AS manager_last_name, m.email AS manager_email";

        const employee = await selectData(table, select, condition,"a.em_id ASC");
        if (!employee || employee.length === 0) {
          return res.status(404).json({ success: false, message: "No employee found" });
        }
        res.status(200).json({ success: true, data: employee });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to fetch employee" });
    }
  };

  // Get vendor by ID
  getEmployeeById = async (req, res) => {
    try {
      const { employee_id} = req.params;
      const table = "em_employees as a, lo_cities as b, lo_states as c LEFT JOIN em_employees m ON a.manager_id = m.employee_id";
      const condition = `a.city_id = b.id AND b.state_id = c.id AND a.employee_id = ${employee_id}`;
      // Give unique aliases for duplicate column names
      const select = "a.*, b.name AS city_name, b.state_id, c.name AS state_name, m.employee_id AS manager_id,  m.first_name AS manager_first_name, m.last_name AS manager_last_name, m.email AS manager_email";
      const employee = await selectOneData(table, select, condition);
       if (!employee) {
        return res.status(404).json({ success: false, message: "employee not found" });
      }
      res.status(200).json({ success: true, data: employee });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to fetch employee" });
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

module.exports = new EmployeeController();
