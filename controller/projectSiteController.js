const { insertData,selectData ,selectOneData, selectLastData, deleteData, updateData,customSelectSqlQuery2} = require("../models/MasterModel");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);



class projectSiteController{

    // createProjectSite = async (req,res) => {
    //     try {
    //         const { project_site_name,address, city_id, project_id,is_time_extended, from_date, to_date} = req.body;
    //         const insertValues = {
    //             project_site_name,
    //             address,
    //             city_id,
    //             project_id,
    //             from_date,
    //             is_time_extended,
    //             to_date,
    //             create_by: req.user.id,
    //             created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
    //         };
    //         const insertedId = await insertData("md_project_site", insertValues);
    //         return res.status(200).json({
    //         success: true,
    //         message: "Project Site created",
    //         data: insertedId
    //         });
    //     } catch (error) {
    //         return res.status(500).json({
    //             success: false,
    //             message: "Failed to create project Site",
    //             error: error.message
    //         });
    //     }
        
    // }


createProjectSite = async (req, res) => {
    try {

        const {
            project_site_name,
            address,
            city_id,
            project_id,
            is_time_extended,
            from_date,
            to_date
        } = req.body;

        //  Convert frontend value to ENUM('Y','N')
        let formattedTimeExtended = null;

        if (
            is_time_extended === true ||
            is_time_extended === "true" ||
            is_time_extended === "Yes" ||
            is_time_extended === "Y"
        ) {
            formattedTimeExtended = "Y";
        } else if (
            is_time_extended === false ||
            is_time_extended === "false" ||
            is_time_extended === "No" ||
            is_time_extended === "N"
        ) {
            formattedTimeExtended = "N";
        }

        const insertValues = {
            project_site_name,
            address,
            city_id,
            project_id,
            from_date,
            is_time_extended: formattedTimeExtended,
            to_date,
            create_by: req.user.id,
            created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
        };

        console.log("INSERT VALUES =>", insertValues);

        const insertedId = await insertData(
            "md_project_site",
            insertValues
        );

        return res.status(200).json({
            success: true,
            message: "Project Site created successfully",
            data: insertedId
        });

    } catch (error) {

        console.error("CREATE PROJECT SITE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create project site",
            error: error.message
        });
    }
};




//  getAllProjectsSite = async (req, res) => {
//   try {
//     const table =
//       "md_project_site as a, lo_cities as b, lo_states as c,md_project as d";
//     const condition = `a.city_id = b.id AND b.state_id = c.id`;
//     // Give unique aliases for duplicate column names
//     const select =
//       "a.*, b.name AS city_name, b.state_id, c.name AS state_name,d.project_name";

//     const rows = await selectData(
//       table,
//       select,
//       condition, 
//       "a.project_site_name ASC"
//     );

//     // Format all date columns to a fixed string (UTC or local as you prefer)
//     const projectsSites = rows.map((row) => ({
//       ...row,
//       from_date: row.from_date
//         ? dayjs.utc(row.from_date).format("YYYY-MM-DD")
//         : null,
//       to_date: row.to_date
//         ? dayjs.utc(row.to_date).format("YYYY-MM-DD")
//         : null,
//       created_at: row.created_at
//         ? dayjs.utc(row.created_at).format("YYYY-MM-DD HH:mm:ss")
//         : null,
//     }));

//     res.status(200).json({ success: true, data: projectsSites });
//   } catch (error) {
//     console.error("getAllProjectsSite error:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Unable to fetch projects" });
//   }
// };




// async getProjectSiteByProjectId(req, res) {
//   try {
//     const { id } = req.params;

//     //const table = "md_project_site as a, lo_cities as b, lo_states as c,md_project as d";
//     const table=  `
//   md_project_site AS a
//   JOIN lo_cities AS b ON a.city_id = b.id
//   JOIN lo_states AS c ON b.state_id = c.id
//   JOIN md_project AS d ON a.project_id = d.project_id
// `;

//     const condition = `a.city_id=b.id 
//                        AND b.state_id = c.id 
//                        AND a.project_id = d.project_id 
//                        AND a.project_site_id = ${Number(id)}`;
                       
//     //const select = "a.*, b.name as city_name, b.state_id, c.name as state_name,d.project_name  ";

//     const select = `
//   a.*, 
//   b.name AS city_name, 
//   b.state_id, 
//   c.name AS state_name, 
//   d.project_name
// `;


//     const projectsSite = await selectLastData(table, select, condition, "a.project_site_name");

//     // Send data as-is, without converting
//     res.status(200).json({ success: true, data: projectsSite });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Unable to fetch project site" });
//   }
// }


// async getProjectSite(req, res) {
//   try {
//     const { id } = req.params;

//     const table = `
//       md_project_site AS a
//       JOIN lo_cities AS b ON a.city_id = b.id
//       JOIN lo_states AS c ON b.state_id = c.id
//       JOIN md_project AS d ON a.project_id = d.project_id
//     `;

//     const select = `
//       a.*, 
//       b.name AS city_name, 
//       b.state_id, 
//       c.name AS state_name, 
//       d.project_name
//     `;

//     const condition = `a.project_site_id = ${Number(id)}`;

//     const query = `
//       SELECT ${select}
//       FROM ${table}
//       WHERE ${condition}
//       ORDER BY a.project_site_name DESC
//       LIMIT 1
//     `;

//     //console.log(" SQL Query:", query); // log it to confirm
//     const conn = await connect();
//     const [rows] = await conn.execute(query);
//     await conn.end();

//     res.status(200).json({
//       success: true,
//       data: rows.length ? rows[0] : null,
//     });
//   } catch (error) {
//     console.error(" Error in getProjectSite:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Unable to fetch project site" });
//   }
// }



 

//////////






// async getProjectSiteByProjectId(req, res) {
//   try {
//     const { id } = req.params;

//     // Build JOIN table (valid for MasterModel)
//     const table = `
//       md_project_site AS a
//       JOIN lo_cities AS b ON a.city_id = b.id
//       JOIN lo_states AS c ON b.state_id = c.id
//       JOIN md_project AS d ON a.project_id = d.project_id
//     `;

//     // Select fields
//     const select = `
//       a.*,
//       b.name AS city_name,
//       b.state_id,
//       c.name AS state_name,
//       d.project_name
//     `;

//     // Condition
//     const condition = `a.project_site_id = ${Number(id)}`;

//     // OrderBy (optional)
//     const orderBy = `a.project_site_name DESC`;

//     // Use MasterModel → selectOneData()
//     const result = await selectOneData(table, select, condition, orderBy);

//     return res.status(200).json({
//       success: true,
//       data: result || null
//     });

//   } catch (error) {
//     console.error("Error in getProjectSite:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch project site"
//     });
//   }
// }


getAllProjectsSite = async (req, res) => {
  try {
    const table = "md_project_site as a, lo_cities as b, lo_states as c";

    const condition = `a.city_id = b.id AND b.state_id = c.id`;

    const select = `
      a.id AS project_site_id,
      a.project_id,
      a.project_site_name,
      a.address,
      a.city_id,
      a.from_date,
      a.to_date,
      a.is_time_extended,
      a.create_by,
      a.created_at,
      a.updated_at,
      b.name AS city_name,
      b.state_id,
      c.name AS state_name,
      (SELECT d.project_name FROM md_project d WHERE d.id = a.project_id LIMIT 1) AS project_name
    `;

    const rows = await selectData(
      table,
      select,
      condition,
      "a.project_site_name ASC"
    );

    const projectsSites = rows.map((row) => ({
      ...row,
      from_date: row.from_date
        ? dayjs.utc(row.from_date).format("YYYY-MM-DD")
        : null,
      to_date: row.to_date
        ? dayjs.utc(row.to_date).format("YYYY-MM-DD")
        : null,
      created_at: row.created_at
        ? dayjs.utc(row.created_at).format("YYYY-MM-DD HH:mm:ss")
        : null,
    }));

    res.status(200).json({ success: true, data: projectsSites });
  } catch (error) {
    console.error("getAllProjectsSite error:", error);
    res
      .status(500)
      .json({ success: false, message: "Unable to fetch projects" });
  }
};



async getProjectSiteByProjectId(req, res) {
  try {
    const { id } = req.params; // project_id

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project id",
      });
    }

    // 🔹 JOIN tables
    const table = `
      md_project_site AS a
      JOIN lo_cities AS b ON a.city_id = b.id
      JOIN lo_states AS c ON b.state_id = c.id
      JOIN md_project AS d ON a.project_id = d.project_id
    `;

    // 🔹 Select fields
    const select = `
      a.project_site_id,
      a.project_site_name,
      a.address,
      a.city_id,
      b.state_id,              -- important for dropdown
      a.project_id,
      a.from_date,
      a.to_date,
      a.is_time_extended,
      b.name AS city_name,
      c.name AS state_name,
      d.project_name
    `;

    // 🔹 Condition (filter by project_id)
    const condition = `a.project_id = ${Number(id)}`;

    // 🔹 Order by
    const orderBy = `a.project_site_name ASC`;

    // 🔹 Fetch multiple rows
    const result = await selectData(table, select, condition, orderBy);

    return res.status(200).json({
      success: true,
      data: result || [],
    });

  } catch (error) {
    console.error("Error in getProjectSiteByProjectId:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch project sites",
    });
  }
}



async getProjectSiteBySiteId(req, res) {
  try {
    const siteId = Number(req.params.id);

    // =========================
    // 1. Validate input
    // =========================
    if (!siteId || !Number.isInteger(siteId) || siteId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid project site id",
      });
    }

    // =========================
    // 2. Query with LEFT JOIN (safe for production)
    // =========================
    const sql = `
  SELECT
    a.project_site_id,
    a.project_site_name,
    a.address,
    a.city_id,
    a.project_id,
    a.from_date,
    a.to_date,
    a.is_time_extended,
    a.create_by,
    a.created_at,
    a.updated_at,

    b.name      AS city_name,
    b.state_id  AS state_id,   -- ← ADD THIS
    c.name      AS state_name

  FROM md_project_site AS a
  LEFT JOIN lo_cities  AS b ON a.city_id   = b.id
  LEFT JOIN lo_states  AS c ON b.state_id  = c.id
  WHERE a.project_site_id = ?
  LIMIT 1
`;

    // =========================
    // 3. Execute safely
    // =========================
    const result = await customSelectSqlQuery2(sql, [siteId], true);

    // =========================
    // 4. Handle empty result
    // =========================
    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project site not found",
      });
    }

    // =========================
    // 5. Success response
    // =========================
   const site = result[0];
site.is_time_extended = site.is_time_extended === 1 ? "Y"
                      : site.is_time_extended === 0 ? "N"
                      : null;

return res.status(200).json({
  success: true,
  data: site,
});

  } catch (error) {
    console.error("getProjectSiteById ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch project site",
    });
  }
}




//////////////////////////



async getProjectSiteById(req, res) {///////
  try {
    const { id } = req.params;

    // ✅ Validate
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project site id",
      });
    }

    // const sql = `
    //   SELECT
    //     a.project_site_id,
    //     a.project_site_name,
    //     a.address,
    //     a.city_id,
    //     a.project_id,
    //     a.from_date,
    //     a.to_date,
    //     a.is_time_extended,
    //     b.name AS city_name,
    //     c.name AS state_name,
    //     d.project_name
    //   FROM md_project_site AS a
    //   JOIN lo_cities AS b ON a.city_id = b.id
    //   JOIN lo_states AS c ON b.state_id = c.id
    //   JOIN md_project AS d ON a.project_id = d.project_id
    //   WHERE a.project_site_id = ?
    //   ORDER BY a.project_site_name ASC
    // `;


    const sql = `
  SELECT
    a.project_site_id,
    a.project_site_name,
    a.address,
    a.city_id,
    b.state_id,      -- ✅ ADD THIS
    a.project_id,
    a.from_date,
    a.to_date,
    a.is_time_extended,
    b.name AS city_name,
    c.name AS state_name,
    d.project_name
  FROM md_project_site AS a
  JOIN lo_cities AS b ON a.city_id = b.id
  JOIN lo_states AS c ON b.state_id = c.id
  JOIN md_project AS d ON a.project_id = d.project_id
  WHERE a.project_site_id = ?
`;
    const result = await customSelectSqlQuery2(sql, [id], true);

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });

  } catch (error) {
    console.error("Error in getProjectSiteById:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch project site",
    });
  }
}






    updateProjectsSite = async (req, res) => {
        try {
            const { id } = req.params;
            const { 
                project_site_name,
                address, 
                city_id,  
                project_id,  
                is_time_extended,
                from_date, 
                to_date 
            } = req.body;
            
                
            const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
            
            const setValues = {};
            if (project_site_name !== undefined) setValues.project_site_name = project_site_name;
            if (address !== undefined) setValues.address = address;
            if (city_id !== undefined) setValues.city_id = city_id;
            if (project_id !== undefined) setValues.project_id = project_id;
            if (from_date !== undefined) setValues.from_date = from_date;
            if (to_date !== undefined) setValues.to_date = to_date;
            if(is_time_extended !== undefined)setValues.is_time_extended=is_time_extended;
            
            console.log('[f date]',setValues)

            setValues.create_by = req.user.id;
            setValues.updated_at = updated_at;

            const condition = `project_site_id = ${Number(id)}`;
            const updatedRows = await updateData("md_project_site", setValues, condition);

            if (!updatedRows) {
                return res.status(404).json({ success: false, message: "Project Site not found or nothing to update" });
            }

            res.status(200).json({ success: true, message: "Project Site updated", data: updatedRows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Unable to update project site" });
        }
    };


    

    deleteProjectSite = async (req, res) => {
        try {
            const { id } = req.params;
            const condition = `project_site_id = ${Number(id)}`;
            const deletedRows = await deleteData("md_project_site", condition);

            if (!deletedRows) {
                return res.status(404).json({ success: false, message: "Project site not found or already deleted" });
            }

            res.status(200).json({ success: true, message: "Project site deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Unable to delete project site" });
        }
    };


}


module.exports= new projectSiteController()