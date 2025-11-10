const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);



const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
  customSelectSqlQuery 
} = require("../models/MasterModel");

class EmployeeTeamController {


// resetActiveEmployeesAPI = async (req, res) => {
//   try {
//     const { id } = req.body; // employee_team_id from route

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "employee_team_id is required",
//       });
//     }

//     const updateObj = {
//       status: "N",
//       out_date: dayjs.utc().format("YYYY-MM-DD"),
//       updated_at: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
//     };

//     const result = await updateData(
//       "md_em_employee_team",
//       updateObj,
//       `employee_team_id = ${id} AND status = 'Y'`
//     );

//     if (result === 0) {
//       return res.status(404).json({
//         success: false,
//         message: `No active employee found with employee_team_id = ${id}`,
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: `Employee team ID ${id} reset to 'N' successfully`,
//     });
//   } catch (error) {
//     console.error("[EmployeeTeamController] resetActiveEmployeesAPI Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to reset employee status",
//     });
//   }
// };



resetActiveEmployeesAPI = async (req, res) => {
  try {
    const { id } = req.body; // expects employee_team_id from frontend

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "employee_team_id is required",
      });
    }

    const updateObj = {
      status: "N",
      out_date: dayjs.utc().format("YYYY-MM-DD"),
      updated_at: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
    };

    const result = await updateData(
      "md_em_employee_team",
      updateObj,
      `employee_team_id = ${id} AND status = 'Y'`
    );

    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: `No active employee found with employee_team_id = ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Employee team ID ${id} reset to 'N' successfully`,
    });
  } catch (error) {
    console.error("[EmployeeTeamController] resetActiveEmployeesAPI Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset employee status",
    });
  }
};

  




//  CREATE (Add Employee to Team)
  addEmployee = async (req, res) => {
    try {
      const {
        project_id,
        site_id,
        team_id,
        employee_id,
        in_date,
        out_date,
        created_by,
      } = req.body;

      if (!project_id || !site_id || !team_id || !employee_id) {
        return res
          .status(400)
          .json({ success: false, message: "Required fields are missing." });
      }


      // let employeeData= await selectOneData("md_em_employee_team","*",`employee_id = ${employee_id} AND status  = 'Y'`)
      // console.log("[employee Team present]",employeeData)
      let updateObj =  {
                out_date:dayjs.utc().format("YYYY-MM-DD"),
                status:'N'
              }

      const updateEmployee = await updateData('md_em_employee_team',updateObj,`employee_id = ${employee_id} AND status  = 'Y'`);
      console.log(updateEmployee)
      const insertObj = {
        project_id,
        site_id,
        team_id,
        employee_id,
        status: 'Y',
        in_date: dayjs.utc().format("YYYY-MM-DD"),
        out_date:  dayjs.utc().format("YYYY-MM-DD"),
        created_by: created_by || null,
        created_at: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
        updated_at: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
      };

      //  Direct table name usage
      const insertId = await insertData("md_em_employee_team", insertObj);

      res.status(201).json({
        success: true,
        message: "Employee added to team successfully",
        employee_team_id: insertId,
      });
    } catch (error) {
      console.error("Add EmployeeTeam Error:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };

  //  READ ALL
  getAllEmployees = async (req, res) => {
    try {
      const data = await selectData("md_em_employee_team", "*", null, "employee_team_id DESC");
      res.status(200).json({
        success: true,
        count: data.length,
        data,
      });
    } catch (error) {
      console.error("Get All EmployeeTeam Error:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };
//


  //  READ ONE
  getEmployeeById = async (req, res) => {
    try {
      const { id } = req.params;
      if (!id)
        return res.status(400).json({ success: false, message: "Employee team ID required" });

      const row = await selectOneData("md_em_employee_team", "*", `employee_team_id = ${id}`);
      if (!row)
        return res.status(404).json({ success: false, message: "Employee team record not found" });

      res.status(200).json({ success: true, data: row });
    } catch (error) {
      console.error("Get EmployeeTeam By ID Error:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };



//  getAllEmployeeByTeamId = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validation
//     if (!id) {
//       return res
//         .status(400)
//         .json({ success: false, message: "team_id is required" });
//     }

//     // SQL join query (fixed table name)
//     const sql = `
//       SELECT 
//         t.employee_team_id,
//         t.team_id,
//         t.project_id,
//         t.site_id,
//         t.employee_id,
//         e.first_name,
//         e.last_name,
//         e.email,
//         e.phone
//       FROM md_em_employee_team AS t
//       INNER JOIN em_employees AS e
//         ON t.employee_id = e.employee_id
//       WHERE t.team_id = ${id}
//       ORDER BY t.employee_team_id DESC
//     `;

//     const employees = await customSelectSqlQuery(sql);

//     if (!employees || employees.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: `No employees found for team_id: ${id}`,
//       });
//     }

//     res.status(200).json({
//       success: true,
//       count: employees.length,
//       data: employees,
//     });
//   } catch (error) {
//     console.error("Get All Employees By TeamId Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };









  //  UPDATE
  
  
  
  
  getAllEmployeeByTeamId = async (req, res) => {
  try {
    const { id } = req.params;

    // Validation
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "team_id is required" });
    }

    // SQL join query — only employees with status = 'Y'
    const sql = `
      SELECT 
       t.employee_team_id,      
        t.employee_id,
        e.first_name,
        e.last_name,
        e.email,
        e.phone
      FROM md_em_employee_team AS t
      INNER JOIN em_employees AS e
        ON t.employee_id = e.employee_id
      WHERE t.team_id = ${id}
        AND t.status = 'Y'
      ORDER BY e.first_name ASC
    `;

    const employees = await customSelectSqlQuery(sql);

    if (!employees || employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No active (status='Y') employees found for team_id: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error("Get All Employees By TeamId Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};






 getAllEmployeeByTeamIdFromBody = async (req, res) => {
  try {
    const { id } = req.body;

    // Validation
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "team_id is required" });
    }

    // SQL join query — only employees with status = 'Y'
    const sql = `
      SELECT 
       t.employee_team_id,      
        t.employee_id,
        e.first_name,
        e.last_name,
        e.email,
        e.phone
      FROM md_em_employee_team AS t
      INNER JOIN em_employees AS e
        ON t.employee_id = e.employee_id
      WHERE t.team_id = ${id}
        AND t.status = 'Y'
      ORDER BY e.first_name ASC
    `;

    const employees = await customSelectSqlQuery(sql);

    if (!employees || employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No active (status='Y') employees found for team_id: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error("Get All Employees By TeamId Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
  
  
  
  
  
  
  
  updateEmployee = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        project_id,
        site_id,
        team_id,
        employee_id,
        status,
        in_date,
        out_date,
      } = req.body;

      if (!id)
        return res.status(400).json({ success: false, message: "Employee team ID required" });

      const updateObj = {
        ...(project_id && { project_id }),
        ...(site_id && { site_id }),
        ...(team_id && { team_id }),
        ...(employee_id && { employee_id }),
        ...(status && { status }),
        ...(in_date && { in_date: dayjs.utc(in_date).format("YYYY-MM-DD") }),
        ...(out_date && { out_date: dayjs.utc(out_date).format("YYYY-MM-DD") }),
        updated_at: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
      };

      const updated = await updateData("md_em_employee_team", updateObj, `employee_team_id = ${id}`);

      if (updated === 0)
        return res.status(404).json({ success: false, message: "Record not found or no changes made" });

      res.status(200).json({ success: true, message: "Employee team record updated successfully" });
    } catch (error) {
      console.error("Update EmployeeTeam Error:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };

  //  DELETE
  deleteEmployee = async (req, res) => {
    try {
      const { id } = req.params;
      if (!id)
        return res.status(400).json({ success: false, message: "Employee team ID required" });

      const deleted = await deleteData("md_em_employee_team", `employee_team_id = ${id}`);
      if (deleted === 0)
        return res.status(404).json({ success: false, message: "Record not found" });

      res.status(200).json({ success: true, message: "Employee team record deleted successfully" });
    } catch (error) {
      console.error("Delete EmployeeTeam Error:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };
}

module.exports = new EmployeeTeamController();
