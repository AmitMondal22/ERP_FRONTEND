const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
  customSelectSqlQuery,
} = require("../models/MasterModel");

//  Define table name constant
const table = "em_attendance";
const STANDARD_WORK_HOURS = 8;

class AttendanceController {
  /**
   *  CREATE OR UPDATE attendance (bulk capable)
   * If attendance_id exists → Update
   * Else → Insert
   */
  
// createOrUpdateAttendance = async (req, res) => {
//   let conn = null;
//   try {
//     console.log("Incoming Body:", JSON.stringify(req.body, null, 2));

//     if (!req.body || Object.keys(req.body).length === 0) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Empty request body — Content-Type: application/json required",
//       });
//     }

//     const { records = [], created_by, updated_by } = req.body;

//     if (!Array.isArray(records) || records.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No attendance records provided",
//       });
//     }

//     if (!created_by) {
//       return res.status(400).json({
//         success: false,
//         message: "created_by is required",
//       });
//     }

//     const now = dayjs.utc().format("YYYY-MM-DD HH:mm:ss");

//     const getConnection = require("../DBConfig/db");
//     conn = await getConnection();
//     await conn.beginTransaction();

//     for (const r of records) {
//       const {
//         attendance_id,
//         project_id,
//         site_id,
//         team_id,
//         employee_id,
//         work_date,
//         check_in,
//         check_out,
//         working_hour = 0,
//         overtime_hours = 0,
//         in_out_status = "In",
//         status,
//         notes = "",
//       } = r;

//       if (!project_id || !employee_id || !work_date || !status) {
//         throw new Error(
//           `Missing required fields: project_id=${project_id}, employee_id=${employee_id}, work_date=${work_date}, status=${status}`
//         );
//       }

//       if (!/^\d{4}-\d{2}-\d{2}$/.test(work_date)) {
//         throw new Error(
//           `Invalid work_date format: ${work_date}. Use YYYY-MM-DD`
//         );
//       }

//       // Determine auto check_in/check_out based on in_out_status
//       let finalCheckIn = check_in;
//       let finalCheckOut = check_out;

//       if (in_out_status.toUpperCase() === "Y") {
//         finalCheckIn = now; // auto-generated check_in
//       } else if (in_out_status.toUpperCase() === "N") {
//         finalCheckOut = now; // auto-generated check_out
//       }

//       const baseData = {
//         project_id,
//         site_id: site_id || null,
//         team_id: team_id || null,
//         employee_id,
//         work_date,
//         check_in: finalCheckIn || null,
//         check_out: finalCheckOut || null,
//         working_hour: Number(working_hour) || 0,
//         overtime_hours: Number(overtime_hours) || 0,
//         in_out_status,
//         status,
//         notes,
//       };

//       if (attendance_id) {
//         const exists = await selectOneData(
//           table,
//           "attendance_id",
//           `attendance_id = '${attendance_id}'`
//         );

//         if (exists) {
//           await updateData(
//             table,
//             baseData,
//             `attendance_id = ${conn.escape(attendance_id)}`
//           );
//           continue;
//         }
//       }

//       const insertDataObj = { ...baseData, created_by, created_at: now };
//       await insertData(table, insertDataObj);
//     }

//     await conn.commit();

//     return res.json({
//       success: true,
//       message: `${records.length} attendance record(s) processed successfully`,
//     });
//   } catch (err) {
//     if (conn) await conn.rollback();
//     console.error("createOrUpdateAttendance Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to process attendance",
//       error: err.message,
//     });
//   } finally {
//     if (conn) await conn.end();
//   }
// };



createOrUpdateAttendance = async (req, res) => {
  let conn = null;
  try {
    console.log("Incoming Body:", JSON.stringify(req.body, null, 2));

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Empty request body — Content-Type: application/json required",
      });
    }

    const { records = [], created_by } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No attendance records provided",
      });
    }

    if (!created_by) {
      return res.status(400).json({
        success: false,
        message: "created_by is required",
      });
    }

    const now = dayjs.utc().format("YYYY-MM-DD HH:mm:ss");

    const getConnection = require("../DBConfig/db");
    conn = await getConnection();
    await conn.beginTransaction();

    for (const r of records) {
      const {
        attendance_id,
        project_id,
        site_id,
        team_id,
        employee_id,
        work_date,
        in_out_status = "Y",
        status,
        notes = "",
      } = r;

      if (!project_id || !employee_id || !work_date || !status) {
        throw new Error(
          `Missing required fields: project_id=${project_id}, employee_id=${employee_id}, work_date=${work_date}, status=${status}`
        );
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(work_date)) {
        throw new Error(`Invalid work_date format: ${work_date}. Use YYYY-MM-DD`);
      }

      if (in_out_status.toUpperCase() === "Y") {
        // --- Check-in ---
        const baseData = {
          project_id,
          site_id: site_id || null,
          team_id: team_id || null,
          employee_id,
          work_date,
          check_in: now,
          check_out: null,
          working_hour: 0,
          overtime_hours: 0,
          in_out_status: "Y",
          status,
          notes,
        };

        const insertDataObj = { ...baseData, created_by, created_at: now };
        await insertData(table, insertDataObj);
      } else if (in_out_status.toUpperCase() === "N") {
        // --- Check-out ---
        const existingRecord = await selectOneData(
          table,
          "*",
          `employee_id = '${employee_id}' AND work_date = '${work_date}'`
        );

        if (!existingRecord) {
          // No check-in exists, insert check-out only
          const baseData = {
            project_id,
            site_id: site_id || null,
            team_id: team_id || null,
            employee_id,
            work_date,
            check_in: null,
            check_out: now,
            working_hour: 0,
            overtime_hours: 0,
            in_out_status: "N",
            status,
            notes,
          };
          const insertDataObj = { ...baseData, created_by, created_at: now };

          await insertData(table, insertDataObj);
        } else {
          // Calculate working hours
          const checkInTime = existingRecord.check_in
            ? dayjs.utc(existingRecord.check_in)
            : null;
          const checkOutTime = dayjs.utc(now);

          let workingHour = 0;
          let overtimeHour = 0;

          
   if (checkInTime) {
    const diff = checkOutTime.diff(checkInTime, "minute"); // total minutes
  workingHour = diff / 60; // convert to hours
  workingHour = Math.min(workingHour, STANDARD_WORK_HOURS);
  overtimeHour = diff / 60 - STANDARD_WORK_HOURS;
  overtimeHour = overtimeHour > 0 ? overtimeHour : 0;

  // Round to 2 decimals
  workingHour = Math.round(workingHour * 100) / 100;
  overtimeHour = Math.round(overtimeHour * 100) / 100;
}

          await updateData(
            table,
            {
              check_out: now,
              in_out_status: "N",
              working_hour: workingHour,
              overtime_hours: overtimeHour,
              updated_at: now,
            },
            `attendance_id = ${conn.escape(existingRecord.attendance_id)}`
          );
        }
      }
    }

    await conn.commit();

    return res.json({
      success: true,
      message: `${records.length} attendance record(s) processed successfully`,
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("createOrUpdateAttendance Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to process attendance",
      error: err.message,
    });
  } finally {
    if (conn) await conn.end();
  }
};
  /**
   *  READ: Get all attendance
   */
  async getAllAttendance(req, res) {
    try {
      const rows = await selectData(table, "*", null, "attendance_id DESC");

      res.status(200).json({ success: true, data: rows });
    } catch (err) {
      console.error("❌ getAllAttendance Error:", err);
      res.status(500).json({
        success: false,
        message: "Server error while fetching attendance",
        error: err.message,
      });
    }
  }

  /**
   *  READ: Get attendance by ID
   */
  async getAttendanceById(req, res) {
    try {
      const { id } = req.params;
      const row = await selectOneData(table, "*", `attendance_id = '${id}'`);

      if (!row)
        return res
          .status(404)
          .json({ success: false, message: "Attendance not found" });

      res.status(200).json({ success: true, data: row });
    } catch (err) {
      console.error("❌ getAttendanceById Error:", err);
      res.status(500).json({
        success: false,
        message: "Server error while fetching attendance by ID",
        error: err.message,
      });
    }
  }

  /**
   *  DELETE: Delete attendance by ID
   */
  async deleteAttendance(req, res) {
    try {
      const { id } = req.params;
      const affected = await deleteData(table, `attendance_id = '${id}'`);

      if (!affected) {
        return res
          .status(404)
          .json({ success: false, message: "No attendance found to delete" });
      }

      res
        .status(200)
        .json({ success: true, message: "Attendance deleted successfully" });
    } catch (err) {
      console.error("❌ deleteAttendance Error:", err);
      res.status(500).json({
        success: false,
        message: "Server error while deleting attendance",
        error: err.message,
      });
    }
  }
}

module.exports = new AttendanceController();
