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

  // Add 
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



  // Get all 
  getAllemployee = async (req, res) => {
    try {
        const table = "em_employees as a JOIN lo_cities AS b ON a.city_id = b.id JOIN lo_states AS c ON b.state_id = c.id LEFT JOIN em_employees m ON a.manager_id = m.employee_id";
        // Give unique aliases for duplicate column names
        const select = "a.*, b.name AS city_name, b.state_id, c.name AS state_name, m.employee_id AS manager_id,  m.first_name AS manager_first_name, m.last_name AS manager_last_name, m.email AS manager_email";

        const employee = await selectData(table, select, null ,"a.em_id ASC");
        
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
      const table = "em_employees as a JOIN lo_cities AS b ON a.city_id = b.id JOIN lo_states AS c ON b.state_id = c.id LEFT JOIN em_employees m ON a.manager_id = m.employee_id";
      const condition = `a.employee_id = ${employee_id}`;
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

  // Update 
  updateEmployee = async (req, res) => {
    try {
      const { id } = req.params; // employee ID
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

      const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

      // Build full name if any name part is provided
      const full_name = [first_name, middle_name, last_name].filter(Boolean).join(" ");

      // Update users table if email, phone, or role is provided
      const updateUserValues = {};
      if (full_name) updateUserValues.name = full_name;
      if (email) updateUserValues.email = email;
      if (phone) updateUserValues.mobile_no = phone;
      if (role) updateUserValues.role = role;
      updateUserValues.updated_at = updated_at;

      if (Object.keys(updateUserValues).length > 1) {
        await updateData("users", updateUserValues, `id = (SELECT user_id FROM em_employees WHERE employee_id = ${id})`);
      }

      // Update employees table
      const updateEmployeeValues = {
        updated_at,
      };

      if (first_name) updateEmployeeValues.first_name = first_name;
      if (middle_name) updateEmployeeValues.middle_name = middle_name;
      if (last_name) updateEmployeeValues.last_name = last_name;
      if (email) updateEmployeeValues.email = email;
      if (phone) updateEmployeeValues.phone = phone;
      if (hire_date) updateEmployeeValues.hire_date = hire_date;
      if (department) updateEmployeeValues.department = department;
      if (job_title) updateEmployeeValues.job_title = job_title;
      if (manager_id) updateEmployeeValues.manager_id = manager_id;
      if (base_salary) updateEmployeeValues.base_salary = base_salary;
      if (allowance) updateEmployeeValues.allowance = allowance;
      if (status !== undefined) updateEmployeeValues.status = status;
      if (em_id) updateEmployeeValues.em_id = em_id;
      if (employee_dob) updateEmployeeValues.employee_dob = employee_dob;
      if (employee_address) updateEmployeeValues.employee_address = employee_address;
      if (city_id) updateEmployeeValues.city_id = city_id;
      if (employee_designation_id) updateEmployeeValues.employee_designation_id = employee_designation_id;
      if (department_id) updateEmployeeValues.department_id = department_id;
      if (date_of_joining) updateEmployeeValues.date_of_joining = date_of_joining;

      const affectedRows = await updateData("em_employees", updateEmployeeValues, `employee_id = ${id}`);
      if (affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Employee not found or no changes made" });
      }

      res.status(200).json({ success: true, message: "Employee updated successfully", data: affectedRows });

    } catch (error) {
      console.error("Error in updateEmployee:", error.message);
      res.status(500).json({
        success: false,
        message: "Unable to update employee",
        error: error.message,
      });
    }
  };


  deleteEmployee = async (req, res) => {
    try {
      const { id } = req.params; // employee_id

      // Fetch the employee record to get the associated user_id
      const employee = await selectOneData("em_employees",'*', `employee_id = ${id}`);
      if (!employee) {
        return res.status(404).json({ success: false, message: "Employee not found" });
      }
      const user_id = employee.user_id;

      // Delete employee record
      const deletedEmployeeRows = await deleteData("em_employees", `employee_id = ${id}`);
      if (deletedEmployeeRows === 0) {
        return res.status(404).json({ success: false, message: "Employee not found or already deleted" });
      }

      // Delete associated user record
      const deletedUserRows = await deleteData("users", `id = ${user_id}`);
      if (deletedUserRows === 0) {
        console.warn(`User with ID ${user_id} not found while deleting employee`);
      }

      res.status(200).json({ success: true, message: "Employee and user deleted successfully" });
    } catch (error) {
      console.error("Error in deleteEmployee:", error.message);
      res.status(500).json({ success: false, message: "Unable to delete employee and user", error: error.message });
    }
  };



}

module.exports = new EmployeeController();
