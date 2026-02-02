const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);



const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
  customSelectSqlQuery ,
  customSelectSqlQuery2
} = require("../models/MasterModel");





class EmployeeTeamController {




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
  
  
  
  
//   getAllEmployeeByTeamId = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validation
//     if (!id) {
//       return res
//         .status(400)
//         .json({ success: false, message: "team_id is required" });
//     }

//     // SQL join query — only employees with status = 'Y'
//     const sql = `
//       SELECT 
//        t.employee_team_id,      
//         t.employee_id,
//         e.first_name,
//         e.last_name,
//         e.email,
//         e.phone
//       FROM md_em_employee_team AS t
//       INNER JOIN em_employees AS e
//         ON t.employee_id = e.employee_id
//       WHERE t.team_id = ${id}
//         AND t.status = 'Y'
//       ORDER BY e.first_name ASC
//     `;

//     const employees = await customSelectSqlQuery(sql);

//     if (!employees || employees.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: `No active (status='Y') employees found for team_id: ${id}`,
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




getAllEmployeeByTeamId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "team_id is required",
      });
    }


    const sql = `
    SELECT 
  t.employee_team_id,
  t.employee_id,
  e.first_name,
  e.last_name,
  e.email,
  e.phone,
  a.in_out_status AS db_in_out_status,
  CASE
    WHEN a.check_in IS NOT NULL AND a.check_out IS NULL THEN 'IN'
    WHEN a.check_out IS NOT NULL THEN 'OUT'
    ELSE 'ABSENT'
  END AS in_out_status
FROM md_em_employee_team t
JOIN em_employees e
  ON e.employee_id = t.employee_id
LEFT JOIN em_attendance a
  ON a.employee_id = t.employee_id
 AND a.work_date = ?
WHERE t.team_id = ?
  AND t.status = 'Y'
ORDER BY e.first_name ASC;`;

    
    const employees = await customSelectSqlQuery(sql);

    if (!employees || employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No active employees found for team_id: ${id}`,
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



/////


getAllEmployeeByTeamIdOnlyForAddingEmployeeToTeam = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team_id",
      });
    }

    // Get all employees who ARE in this team (status = 'Y')
    const sql = `
      SELECT 
        e.employee_id,
        e.first_name,
        e.last_name,
        e.email,
        e.phone,
        CASE
          WHEN a.check_in IS NOT NULL AND a.check_out IS NULL THEN 'IN'
          WHEN a.check_out IS NOT NULL THEN 'OUT'
          ELSE 'ABSENT'
        END AS in_out_status
      FROM em_employees e
      INNER JOIN md_em_employee_team t
        ON t.employee_id = e.employee_id
      LEFT JOIN em_attendance a
        ON a.employee_id = e.employee_id
        AND a.work_date = CURDATE()
      WHERE t.team_id = ${Number(id)}
        AND t.status = 'Y'
      GROUP BY e.employee_id, e.first_name, e.last_name, e.email, e.phone, a.check_in, a.check_out
      ORDER BY e.first_name ASC;
    `;

    const employees = await customSelectSqlQuery(sql);
    
    console.log("getAllEmployeeByTeamIdOnlyForAddingEmployeeToTeam called");

    if (!employees || employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No active employees found for team_id: ${id}`,
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






// getAllEmployeeByTeamIdFromBody = async (req, res) => {
//   try {
//     //console.log("🔥🔥🔥 getAllEmployeeByTeamIdFromBody IS BEING CALLED 🔥🔥🔥");
    
//     const { id } = req.body;
//     console.log('Team ID from body:', id);

//     // Validation
//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "team_id is required"
//       });
//     }

//     // Get today's date in YYYY-MM-DD format
//     const today = new Date().toISOString().split('T')[0];
//     console.log('Today date:', today);

//     // SQL join query — only employees with status = 'Y'
//     const sql = `
//       SELECT 
//         t.employee_team_id,      
//         t.employee_id,
//         e.first_name,
//         e.last_name,
//         e.email,
//         e.phone,
//         CASE
//           WHEN a.check_in IS NOT NULL AND a.check_out IS NULL THEN 'IN'
//           WHEN a.check_out IS NOT NULL THEN 'OUT'
//           ELSE 'ABSENT'
//         END AS in_out_status
//       FROM md_em_employee_team AS t
//       INNER JOIN em_employees AS e
//         ON t.employee_id = e.employee_id
//       LEFT JOIN em_attendance a
//         ON a.employee_id = t.employee_id
//         AND a.work_date = ?
//       WHERE t.team_id = ?
//         AND t.status = 'Y'
//       ORDER BY e.first_name ASC
//     `;

//     //console.log('📝 About to execute SQL with customSelectSqlQuery2');
//     const employees = await customSelectSqlQuery2(sql, [today, id]);
//     //console.log('✅ Query executed. Result:', employees);

//     if (!employees || employees.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: `No active (status='Y') employees found for team_id: ${id}`,
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
  
//   getAllEmployeeByTeamIdFromBody = async (req, res) => {
//   try {
//     const { team_id, in_out_status } = req.body;

//     if (!team_id || !in_out_status) {
//       return res.status(400).json({
//         success: false,
//         message: "team_id and in_out_status are required",
//       });
//     }

//     const today = new Date().toISOString().split("T")[0];
//     const fetchStatus = in_out_status === "N" ? "Y" : "N";

//     const sql = `
//       SELECT 
//         t.employee_team_id,
//         t.employee_id,
//         e.first_name,
//         e.last_name,
//         e.email,
//         e.phone,
//         a.in_out_status
//       FROM md_em_employee_team AS t
//       INNER JOIN em_employees AS e
//         ON t.employee_id = e.employee_id
//       LEFT JOIN (
//         SELECT 
//           employee_id,
//           in_out_status,
//           work_date,
//           ROW_NUMBER() OVER (
//             PARTITION BY employee_id 
//             ORDER BY attendance_id DESC
//           ) AS rn
//         FROM em_attendance
//         WHERE work_date = ?
//       ) AS a
//         ON a.employee_id = t.employee_id AND a.rn = 1
//       WHERE t.team_id = ?
//         AND t.status = 'Y'
//         AND (
//           a.in_out_status = ?
//           OR a.in_out_status IS NULL
//         )
//       ORDER BY e.first_name ASC
//     `;

//     const employees = await customSelectSqlQuery2(sql, [
//       today,
//       team_id,
//       fetchStatus,
//     ]);

//     return res.status(200).json({
//       success: true,
//       count: employees.length,
//       data: employees,
//     });

//   } catch (error) {
//     console.error("Get All Employees By TeamId Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };


////////////


//   getAllEmployeeByTeamIdFromBody = async (req, res) => {
//   try {
//     const { team_id, in_out_status, project_id, site_id } = req.body;

//     // Validate all required fields
//     if (!team_id || !in_out_status || !project_id || !site_id) {
//       return res.status(400).json({
//         success: false,
//         message: "team_id, in_out_status, project_id, and site_id are required",
//       });
//     }

//     const today = new Date().toISOString().split("T")[0];
//     const fetchStatus = in_out_status === "N" ? "Y" : "N";

//     const sql = `
//       SELECT 
//         t.employee_team_id,
//         t.employee_id,
//         t.status AS team_status,
//         e.first_name,
//         e.last_name,
//         e.email,
//         e.phone,
//         a.in_out_status
//       FROM md_em_employee_team AS t
//       INNER JOIN em_employees AS e
//         ON t.employee_id = e.employee_id
//       LEFT JOIN (
//         SELECT 
//           employee_id,
//           in_out_status,
//           work_date,
//           ROW_NUMBER() OVER (
//             PARTITION BY employee_id 
//             ORDER BY attendance_id DESC
//           ) AS rn
//         FROM em_attendance
//         WHERE work_date = ?
//       ) AS a
//         ON a.employee_id = t.employee_id AND a.rn = 1
//       WHERE t.team_id = ?
//         AND t.project_id = ?
//         AND t.site_id = ?
//         AND t.status = 'Y'
//         AND (
//           a.in_out_status = ?
//           OR a.in_out_status IS NULL
//         )
//       ORDER BY e.first_name ASC
//     `;

//     const employees = await customSelectSqlQuery2(sql, [
//       today,
//       team_id,
//       project_id,
//       site_id,
//       fetchStatus,
//     ]);

//     return res.status(200).json({
//       success: true,
//       count: employees.length,
//       data: employees,
//     });

//   } catch (error) {
//     console.error("Get All Employees By TeamId Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };
  


getAllEmployeeByTeamIdFromBody = async (req, res) => {
  try {
    const { team_id, in_out_status, project_id, site_id } = req.body;

    // Validate all required fields
    if (!team_id || !in_out_status || !project_id || !site_id) {
      return res.status(400).json({
        success: false,
        message: "team_id, in_out_status, project_id, and site_id are required",
      });
    }
 
    const today = new Date().toISOString().split("T")[0];
    
    // If frontend sends "Y" (wants to mark IN), fetch employees with "N" or NULL
    // If frontend sends "N" (wants to mark OUT), fetch employees with "Y"
    const fetchStatus = in_out_status === "Y" ? "N" : "Y";

    let sql;
    let params;

    if (in_out_status === "Y") {
      // When marking IN, get employees who are OUT (N) or have no attendance yet (NULL)
      sql = `
        SELECT 
          t.employee_team_id,
          t.employee_id,
          t.status AS team_status,
          e.first_name,
          e.last_name,
          e.email,
          e.phone,
          a.in_out_status
        FROM md_em_employee_team AS t
        INNER JOIN em_employees AS e
          ON t.employee_id = e.employee_id
        LEFT JOIN (
          SELECT 
            employee_id,
            in_out_status,
            work_date,
            ROW_NUMBER() OVER (
              PARTITION BY employee_id 
              ORDER BY attendance_id DESC
            ) AS rn
          FROM em_attendance
          WHERE work_date = ?
        ) AS a
          ON a.employee_id = t.employee_id AND a.rn = 1
        WHERE t.team_id = ?
          AND t.project_id = ?
          AND t.site_id = ?
          AND t.status = 'Y'
          AND (
            a.in_out_status = 'N'
            OR a.in_out_status IS NULL
          )
        ORDER BY e.first_name ASC
      `;
      params = [today, team_id, project_id, site_id];
    } else {
      // When marking OUT, get employees who are currently IN (Y)
      sql = `
        SELECT 
          t.employee_team_id,
          t.employee_id,
          t.status AS team_status,
          e.first_name,
          e.last_name,
          e.email,
          e.phone,
          a.in_out_status
        FROM md_em_employee_team AS t
        INNER JOIN em_employees AS e
          ON t.employee_id = e.employee_id
        LEFT JOIN (
          SELECT 
            employee_id,
            in_out_status,
            work_date,
            ROW_NUMBER() OVER (
              PARTITION BY employee_id 
              ORDER BY attendance_id DESC
            ) AS rn
          FROM em_attendance
          WHERE work_date = ?
        ) AS a
          ON a.employee_id = t.employee_id AND a.rn = 1
        WHERE t.team_id = ?
          AND t.project_id = ?
          AND t.site_id = ?
          AND t.status = 'Y'
          AND a.in_out_status = 'Y'
        ORDER BY e.first_name ASC
      `;
      params = [today, team_id, project_id, site_id];
    }

    const employees = await customSelectSqlQuery2(sql, params);

    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });

  } catch (error) {
    console.error("Get All Employees By TeamId Error:", error);
    return res.status(500).json({
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
