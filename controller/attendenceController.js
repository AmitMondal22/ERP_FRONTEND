const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone.js");


dayjs.extend(utc);
dayjs.extend(timezone);

const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
  customSelectSqlQuery,
  batchInsertData,
} = require("../models/MasterModel"); 

//  Define table name constant
const table = "em_attendance";
const STANDARD_WORK_HOURS = 8;
const getConnection = require("../DBConfig/db");

class AttendanceController {
  /**
   *  CREATE OR UPDATE attendance (bulk capable)
   * If attendance_id exists → Update
   * Else → Insert
   */
  



createOrUpdateAttendance = async (req, res) => {
  let conn = null;
  try {
    const {
      project_id,
      site_id = null,
      team_id = null,
      records = [],
    } = req.body;

    const created_by = req.user.id;

    // ----- Basic validation -----
    if (!records.length) {
      return res.status(400).json({
        success: false,
        message: "records array is required",
      });
    }

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "project_id is required at the root level",
      });
    }

 const now = dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

    conn = await getConnection();
    await conn.beginTransaction();

    const checkInRecords = [];
    const checkOutUpdates = [];

    for (const r of records) {
      const {
        employee_id,
        work_date,
        in_out_status = "Y",
        status,
        notes = "",
      } = r;

      if (!employee_id || !work_date || !status) {
        throw new Error(
          `Missing required fields: employee_id=${employee_id}, work_date=${work_date}, status=${status}`
        );
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(work_date)) {
        throw new Error(`Invalid work_date format: ${work_date}. Use YYYY-MM-DD`);
      }

      if (in_out_status.toUpperCase() === "Y") {
        // ----- Handle Check-In -----
        const existingCheckIn = await selectOneData(
          table,
          "*",
          `employee_id = '${employee_id}' AND work_date = '${work_date}' AND check_out IS NULL`
        );

        if (!existingCheckIn) {
          checkInRecords.push({
            project_id,
            site_id,
            team_id,
            employee_id,
            work_date,
            check_in: now,
            check_out: null,
            working_hour: 0,
            overtime_hours: 0,
            in_out_status: "Y",
            status,
            notes,
            created_by,
            created_at: now,
          });
        }
      } else if (in_out_status.toUpperCase() === "N") {
        // ----- Handle Check-Out -----
      const existingRecord = await selectOneData(
          table,
          "*",
          `employee_id = '${employee_id}' AND work_date = '${work_date}' AND check_out IS NULL ORDER BY check_in DESC`
        );

        if (!existingRecord) {
          // No prior check-in, insert check-out directly
          checkInRecords.push({
            project_id,
            site_id,
            team_id,
            employee_id,
            work_date,
            check_in: null,
            check_out: now,
            working_hour: 0,
            overtime_hours: 0,
            in_out_status: "N",
            status,
            notes,
            created_by,
            created_at: now,
          });
        } else {
          // Calculate working and overtime hours
          const checkInTime = dayjs.utc(existingRecord.check_in);
          const checkOutTime = dayjs.utc(now);

          let diffMinutes = checkOutTime.diff(checkInTime, "minute");
          let workingHour = diffMinutes / 60;
          let overtimeHour = workingHour - STANDARD_WORK_HOURS;

          workingHour = Math.min(workingHour, STANDARD_WORK_HOURS);
          overtimeHour = overtimeHour > 0 ? overtimeHour : 0;

          workingHour = Math.round(workingHour * 100) / 100;
          overtimeHour = Math.round(overtimeHour * 100) / 100;

          checkOutUpdates.push({
            attendance_id: existingRecord.attendance_id,
            updateData: {
              check_out: now,
              in_out_status: "N",
              working_hour: workingHour,
              overtime_hours: overtimeHour,
              updated_at: now,
            },
          });
        }
      }
    }

    // ----- Batch insert -----
    if (checkInRecords.length > 0) {
      const columns = Object.keys(checkInRecords[0]).join(",");
      await batchInsertData(table, columns, checkInRecords);
    }

    // ----- Batch update -----
    for (const upd of checkOutUpdates) {
      await updateData(
        table,
        upd.updateData,
        `attendance_id = ${conn.escape(upd.attendance_id)}`
      );
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
