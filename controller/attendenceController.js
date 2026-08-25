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




  // createOrUpdateAttendance = async (req, res) => {
  //   let conn = null;
  //   try {
  //     const {
  //       project_id,
  //       site_id = null,
  //       team_id = null,
  //       records = [],
  //     } = req.body;

  //     const created_by = req.user.id;

  //     // ----- Basic validation -----
  //     if (!records.length) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "records array is required",
  //       });
  //     }

  //     if (!project_id) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "project_id is required at the root level",
  //       });
  //     }

  //  const now = dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

  //     conn = await getConnection();
  //     await conn.beginTransaction();

  //     const checkInRecords = [];
  //     const checkOutUpdates = [];

  //     for (const r of records) {
  //       const {
  //         employee_id,
  //         work_date,
  //         in_out_status = "Y",
  //         status,
  //         notes = "",
  //       } = r;

  //       if (!employee_id || !work_date || !status) {
  //         throw new Error(
  //           `Missing required fields: employee_id=${employee_id}, work_date=${work_date}, status=${status}`
  //         );
  //       }

  //       if (!/^\d{4}-\d{2}-\d{2}$/.test(work_date)) {
  //         throw new Error(`Invalid work_date format: ${work_date}. Use YYYY-MM-DD`);
  //       }

  //       if (in_out_status.toUpperCase() === "Y") {
  //         // ----- Handle Check-In -----
  //         const existingCheckIn = await selectOneData(
  //           table,
  //           "*",
  //           `employee_id = '${employee_id}' AND work_date = '${work_date}' AND check_out IS NULL`
  //         );

  //         if (!existingCheckIn) {
  //           checkInRecords.push({
  //             project_id,
  //             site_id,
  //             team_id,
  //             employee_id,
  //             work_date,
  //             check_in: now,
  //             check_out: null,
  //             working_hour: 0,
  //             overtime_hours: 0,
  //             in_out_status: "Y",
  //             status,
  //             notes,
  //             created_by,
  //             created_at: now,
  //           });
  //         }
  //       } else if (in_out_status.toUpperCase() === "N") {
  //         // ----- Handle Check-Out -----
  //       const existingRecord = await selectOneData(
  //           table,
  //           "*",
  //           `employee_id = '${employee_id}' AND work_date = '${work_date}' AND check_out IS NULL ORDER BY check_in DESC`
  //         );

  //         if (!existingRecord) {
  //           // No prior check-in, insert check-out directly
  //           checkInRecords.push({
  //             project_id,
  //             site_id,
  //             team_id,
  //             employee_id,
  //             work_date,
  //             check_in: null,
  //             check_out: now,
  //             working_hour: 0,
  //             overtime_hours: 0,
  //             in_out_status: "N",
  //             status,
  //             notes,
  //             created_by,
  //             created_at: now,
  //           });
  //         } else {
  //           // Calculate working and overtime hours
  //           const checkInTime = dayjs.utc(existingRecord.check_in);
  //           const checkOutTime = dayjs.utc(now);

  //           let diffMinutes = checkOutTime.diff(checkInTime, "minute");
  //           let workingHour = diffMinutes / 60;
  //           let overtimeHour = workingHour - STANDARD_WORK_HOURS;

  //           workingHour = Math.min(workingHour, STANDARD_WORK_HOURS);
  //           overtimeHour = overtimeHour > 0 ? overtimeHour : 0;

  //           workingHour = Math.round(workingHour * 100) / 100;
  //           overtimeHour = Math.round(overtimeHour * 100) / 100;

  //           checkOutUpdates.push({
  //             attendance_id: existingRecord.attendance_id,
  //             updateData: {
  //               check_out: now,
  //               in_out_status: "N",
  //               working_hour: workingHour,
  //               overtime_hours: overtimeHour,
  //               updated_at: now,
  //             },
  //           });
  //         }
  //       }
  //     }

  //     // ----- Batch insert -----
  //     if (checkInRecords.length > 0) {
  //       const columns = Object.keys(checkInRecords[0]).join(",");
  //       await batchInsertData(table, columns, checkInRecords);
  //     }

  //     // ----- Batch update -----
  //     for (const upd of checkOutUpdates) {
  //       await updateData(
  //         table,
  //         upd.updateData,
  //         `attendance_id = ${conn.escape(upd.attendance_id)}`
  //       );
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



  /////////




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
          throw new Error(
            `Invalid work_date format: ${work_date}. Use YYYY-MM-DD`
          );
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
          } else {
            console.log(
              `Employee ${employee_id} already has an active check-in for ${work_date}`
            );
          }
        } else if (in_out_status.toUpperCase() === "N") {
          // ----- Handle Check-Out -----
          const existingRecord = await customSelectSqlQuery(
            `SELECT * FROM ${table} 
             WHERE employee_id = '${employee_id}' 
             AND work_date = '${work_date}' 
             AND check_out IS NULL 
             ORDER BY check_in DESC 
             LIMIT 1`
          );

          if (!existingRecord || existingRecord.length === 0) {
            // No prior check-in found - cannot checkout without check-in
            throw new Error(
              `No active check-in found for employee ${employee_id} on ${work_date}. Cannot process check-out.`
            );
          } else {
            const record = existingRecord[0];

            // Ensure check_in is not null
            if (!record.check_in) {
              throw new Error(
                `Invalid check-in time for employee ${employee_id} on ${work_date}`
              );
            }

            // Parse check-in time properly
            // If check_in is already a Date object, use it directly
            // Otherwise parse it as a string
            let checkInTime;
            if (record.check_in instanceof Date) {
              checkInTime = dayjs(record.check_in).tz("Asia/Kolkata");
            } else {
              // Parse the datetime string from database
              checkInTime = dayjs.tz(
                `${work_date} ${record.check_in}`,
                "YYYY-MM-DD HH:mm:ss",
                "Asia/Kolkata"
              );
            }

            // Current checkout time
            const checkOutTime = dayjs().tz("Asia/Kolkata");

            console.log("Check-in time:", checkInTime.format("YYYY-MM-DD HH:mm:ss"));
            console.log("Check-out time:", checkOutTime.format("YYYY-MM-DD HH:mm:ss"));

            // Calculate difference in minutes
            const diffMinutes = checkOutTime.diff(checkInTime, "minute");
            console.log("Difference in minutes:", diffMinutes);

            // Convert to hours with decimals
            let totalHours = diffMinutes / 60;
            console.log("Total hours:", totalHours);

            // Ensure totalHours is positive
            if (totalHours < 0) {
              throw new Error(
                `Check-out time cannot be before check-in time for employee ${employee_id}`
              );
            }

            // Calculate working hours (capped at STANDARD_WORK_HOURS)
            let workingHour = Math.min(totalHours, STANDARD_WORK_HOURS);

            // Calculate overtime hours (any hours beyond STANDARD_WORK_HOURS)
            let overtimeHour =
              totalHours > STANDARD_WORK_HOURS
                ? totalHours - STANDARD_WORK_HOURS
                : 0;

            // Round to 2 decimal places
            workingHour = Math.round(workingHour * 100) / 100;
            overtimeHour = Math.round(overtimeHour * 100) / 100;

            console.log("Working hours:", workingHour);
            console.log("Overtime hours:", overtimeHour);

            checkOutUpdates.push({
              attendance_id: record.attendance_id,
              updateData: {
                check_out: now,
                in_out_status: "N",
                working_hour: workingHour,
                overtime_hours: overtimeHour,
                status: status,
                notes: notes,
                updated_at: now,
              },
            });
          }
        } else {
          throw new Error(
            `Invalid in_out_status: ${in_out_status}. Must be 'Y' or 'N'`
          );
        }
      }

      // ----- Batch insert for check-ins -----
      if (checkInRecords.length > 0) {
        const columns = Object.keys(checkInRecords[0]).join(",");
        await batchInsertData(table, columns, checkInRecords);
      }

      // ----- Batch update for check-outs -----
      for (const upd of checkOutUpdates) {
        await updateData(
          table,
          upd.updateData,
          `attendance_id = ${upd.attendance_id}`
        );
      }

      // ----- Insert image & geotag metadata into em_attendance_image -----
      const rootLat = req.body.latitude || null;
      const rootLng = req.body.longitude || null;
      const rootImg = req.body.image_url || (req.files && req.files.length > 0 ? req.files[0].filename : "default_attendance.jpg");

      // Handle newly inserted check-in records
      for (const rec of checkInRecords) {
        const selectRes = await selectOneData(
          table,
          "attendance_id",
          `employee_id = '${rec.employee_id}' AND work_date = '${rec.work_date}' AND check_out IS NULL`
        );

        if (selectRes && selectRes.attendance_id) {
          await insertData("em_attendance_image", {
            attendance_id: Number(selectRes.attendance_id),
            image_url: rootImg,
            image_type: "check_in",
            latitude: rootLat ? parseFloat(rootLat) : null,
            longitude: rootLng ? parseFloat(rootLng) : null,
            uploaded_by: Number(created_by),
            created_at: now,
            updated_at: now,
          });
        }
      }

      // Handle checkout records
      for (const upd of checkOutUpdates) {
        await insertData("em_attendance_image", {
          attendance_id: Number(upd.attendance_id),
          image_url: rootImg,
          image_type: "check_out",
          latitude: rootLat ? parseFloat(rootLat) : null,
          longitude: rootLng ? parseFloat(rootLng) : null,
          uploaded_by: Number(created_by),
          created_at: now,
          updated_at: now,
        });
      }

      await conn.commit();

      return res.json({
        success: true,
        message: `${records.length} attendance record(s) processed successfully`,
        details: {
          checkIns: checkInRecords.length,
          checkOuts: checkOutUpdates.length,
        },
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
  /** */




  // getDailyEmployeeAttendance = async (req, res) => {
  //   try {
  //     const {
  //       project_id,
  //       work_date,
  //       site_id = null,
  //       team_id = null,
  //     } = req.body;

  //     // -------- Validation --------
  //     if (!project_id || !work_date) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "project_id and work_date are required",
  //       });
  //     }

  //     if (!/^\d{4}-\d{2}-\d{2}$/.test(work_date)) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Invalid work_date format. Use YYYY-MM-DD",
  //       });
  //     }

  //     // -------- Dynamic WHERE clause --------
  //     let whereClause = `
  //       a.project_id = ${project_id}
  //       AND a.work_date = '${work_date}'
  //     `;

  //     if (site_id) {
  //       whereClause += ` AND a.site_id = ${site_id}`;
  //     }

  //     if (team_id) {
  //       whereClause += ` AND a.team_id = ${team_id}`;
  //     }

  //     // -------- SQL Query --------
  //     const sql = `
  //       SELECT
  //         a.employee_id,
  //         CONCAT(
  //           e.first_name,
  //           ' ',
  //           IFNULL(e.middle_name, ''),
  //           ' ',
  //           e.last_name
  //         ) AS employee_name,
  //         a.check_in,
  //         a.check_out,
  //         a.working_hour,
  //         a.overtime_hours,
  //         a.notes
  //       FROM em_attendance a
  //       INNER JOIN em_employees e
  //         ON e.employee_id = a.employee_id
  //       WHERE ${whereClause}
  //       ORDER BY e.first_name ASC
  //     `;

  //     const data = await customSelectSqlQuery(sql);

  //     return res.json({
  //       success: true,
  //       count: data.length,
  //       data,
  //     });
  //   } catch (err) {
  //     console.error("getDailyAttendance Error:", err);
  //     return res.status(500).json({
  //       success: false,
  //       message: "Failed to fetch daily attendance",
  //       error: err.message,
  //     });
  //   }
  // };

  getDailyEmployeeAttendance = async (req, res) => {
    try {
      const {
        project_id,
        from_date,
        to_date,
        site_id = null,
        team_id = null,
      } = req.body;

      // -------- Validation --------
      if (!project_id || !from_date || !to_date) {
        return res.status(400).json({
          success: false,
          message: "project_id, from_date and to_date are required",
        });
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      if (!dateRegex.test(from_date) || !dateRegex.test(to_date)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD",
        });
      }

      if (new Date(from_date) > new Date(to_date)) {
        return res.status(400).json({
          success: false,
          message: "from_date cannot be greater than to_date",
        });
      }

      // -------- Dynamic WHERE clause --------
      let whereClause = `
      a.project_id = ${project_id}
      AND a.work_date BETWEEN '${from_date}' AND '${to_date}'
    `;

      if (site_id) {
        whereClause += ` AND a.site_id = ${site_id}`;
      }

      if (team_id) {
        whereClause += ` AND a.team_id = ${team_id}`;
      }

      // -------- SQL Query --------
      const sql = `
      SELECT
        a.employee_id,
        CONCAT(
          e.first_name,
          ' ',
          IFNULL(e.middle_name, ''),
          ' ',
          e.last_name
        ) AS employee_name,
        a.work_date,
        a.check_in,
        a.check_out,
        a.working_hour,
        a.overtime_hours,
        a.notes
      FROM em_attendance a
      INNER JOIN em_employees e
        ON e.employee_id = a.employee_id
      WHERE ${whereClause}
      ORDER BY a.work_date ASC, e.first_name ASC
    `;

      const data = await customSelectSqlQuery(sql);

      return res.json({
        success: true,
        count: data.length,
        data,
      });
    } catch (err) {
      console.error("getDailyEmployeeAttendance Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch daily attendance",
        error: err.message,
      });
    }
  };



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

  /* =========================================================
     MOBILE ATTENDANCE SYSTEM CONTROLLER METHODS
     ========================================================= */

  /**
   * MOBILE API: Record geotagged attendance with photo (Check-In / Check-Out)
   * Stores attendance in em_attendance and photo metadata in em_attendance_image
   */
  recordMobileAttendance = async (req, res) => {
    try {
      const employee_id = req.body.employee_id || req.user?.id;
      const {
        project_id,
        site_id = null,
        team_id = null,
        work_date = dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD"),
        in_out_status = "Y",
        status = "Present",
        notes = "",
        latitude = null,
        longitude = null,
      } = req.body;

      const created_by = req.user?.id || employee_id;

      if (!employee_id) {
        return res.status(400).json({
          success: false,
          message: "employee_id is required",
        });
      }

      if (!project_id) {
        return res.status(400).json({
          success: false,
          message: "project_id is required",
        });
      }

      const now = dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
      const isCheckIn = String(in_out_status).toUpperCase() === "Y";
      const imageType = isCheckIn ? "check_in" : "check_out";
      let attendance_id = null;

      if (isCheckIn) {
        // Check if an active check-in exists for today
        const existingCheckIn = await selectOneData(
          table,
          "*",
          `employee_id = '${employee_id}' AND work_date = '${work_date}' AND check_out IS NULL`
        );

        if (existingCheckIn) {
          attendance_id = existingCheckIn.attendance_id;
        } else {
          // Insert new check-in
          const checkInObj = {
            project_id: Number(project_id),
            site_id: site_id ? Number(site_id) : null,
            team_id: team_id ? Number(team_id) : null,
            employee_id: Number(employee_id),
            work_date,
            check_in: now,
            check_out: null,
            working_hour: 0,
            overtime_hours: 0,
            in_out_status: "Y",
            status: status || "Present",
            notes: notes || "",
            created_by: Number(created_by),
            created_at: now,
          };

          const insertRes = await insertData(table, checkInObj);
          attendance_id = insertRes.insertId;
        }
      } else {
        // Handle Check-Out
        const existingRecord = await selectOneData(
          table,
          "*",
          `employee_id = '${employee_id}' AND work_date = '${work_date}' AND check_out IS NULL ORDER BY check_in DESC`
        );

        if (existingRecord) {
          let checkInTime = dayjs(existingRecord.check_in).tz("Asia/Kolkata");
          let checkOutTime = dayjs(now).tz("Asia/Kolkata");
          let diffMinutes = checkOutTime.diff(checkInTime, "minute");
          let totalHours = Math.max(0, diffMinutes / 60);

          let workingHour = Math.min(totalHours, STANDARD_WORK_HOURS);
          let overtimeHour =
            totalHours > STANDARD_WORK_HOURS
              ? totalHours - STANDARD_WORK_HOURS
              : 0;

          workingHour = Math.round(workingHour * 100) / 100;
          overtimeHour = Math.round(overtimeHour * 100) / 100;

          const updateObj = {
            check_out: now,
            in_out_status: "N",
            working_hour: workingHour,
            overtime_hours: overtimeHour,
            status: status || existingRecord.status || "Present",
            notes: notes || existingRecord.notes || "",
            updated_at: now,
          };

          await updateData(
            table,
            updateObj,
            `attendance_id = ${existingRecord.attendance_id}`
          );
          attendance_id = existingRecord.attendance_id;
        } else {
          // Direct check-out if no active check-in
          const checkOutObj = {
            project_id: Number(project_id),
            site_id: site_id ? Number(site_id) : null,
            team_id: team_id ? Number(team_id) : null,
            employee_id: Number(employee_id),
            work_date,
            check_in: null,
            check_out: now,
            working_hour: 0,
            overtime_hours: 0,
            in_out_status: "N",
            status: status || "Present",
            notes: notes || "",
            created_by: Number(created_by),
            created_at: now,
          };

          const insertRes = await insertData(table, checkOutObj);
          attendance_id = insertRes.insertId;
        }
      }

      // Process uploaded image(s) into em_attendance_image
      const imageRecords = [];
      const imageFiles = req.files || (req.file ? [req.file] : []);

      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles) {
          const imgObj = {
            attendance_id: Number(attendance_id),
            image_url: file.filename,
            image_type: imageType,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            uploaded_by: Number(created_by),
            created_at: now,
            updated_at: now,
          };
          await insertData("em_attendance_image", imgObj);
          imageRecords.push(imgObj);
        }
      } else {
        // Insert entry into em_attendance_image (with provided photo or default placeholder)
        const imgUrl = req.body.image_url || (typeof req.body.images === "string" ? req.body.images : "default_attendance.jpg");
        const imgObj = {
          attendance_id: Number(attendance_id),
          image_url: imgUrl,
          image_type: imageType,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          uploaded_by: Number(created_by),
          created_at: now,
          updated_at: now,
        };
        await insertData("em_attendance_image", imgObj);
        imageRecords.push(imgObj);
      }

      return res.status(200).json({
        success: true,
        message: `${isCheckIn ? "Check-in" : "Check-out"} recorded successfully`,
        data: {
          attendance_id,
          employee_id,
          work_date,
          in_out_status: isCheckIn ? "Y" : "N",
          image_count: imageRecords.length,
          images: imageRecords,
        },
      });
    } catch (err) {
      console.error("recordMobileAttendance Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to record mobile attendance",
        error: err.message,
      });
    }
  };

  /**
   * READ: Get geotagged photos for a specific attendance_id
   */
  getAttendanceImages = async (req, res) => {
    try {
      const { attendance_id } = req.params;
      const images = await selectData(
        "em_attendance_image",
        "*",
        `attendance_id = '${attendance_id}'`,
        "created_at DESC"
      );

      return res.status(200).json({
        success: true,
        count: images.length,
        data: images,
      });
    } catch (err) {
      console.error("getAttendanceImages Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch attendance images",
        error: err.message,
      });
    }
  };

  /**
   * MOBILE READ: Get attendance history with geotagged images for an employee
   */
  getMobileAttendanceHistory = async (req, res) => {
    try {
      const employee_id = req.query.employee_id || req.user?.id;
      const { from_date, to_date } = req.query;

      if (!employee_id) {
        return res.status(400).json({
          success: false,
          message: "employee_id is required",
        });
      }

      let whereClause = `a.employee_id = '${employee_id}'`;
      if (from_date && to_date) {
        whereClause += ` AND a.work_date BETWEEN '${from_date}' AND '${to_date}'`;
      }

      const sql = `
        SELECT 
          a.*,
          p.project_name,
          ps.project_site_name,
          (
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'attendance_image_id', img.attendance_image_id,
                'image_url', img.image_url,
                'image_type', img.image_type,
                'latitude', img.latitude,
                'longitude', img.longitude,
                'created_at', img.created_at
              )
            )
            FROM em_attendance_image img
            WHERE img.attendance_id = a.attendance_id
          ) AS images
        FROM em_attendance a
        LEFT JOIN em_projects p ON p.project_id = a.project_id
        LEFT JOIN em_project_sites ps ON ps.project_site_id = a.site_id
        WHERE ${whereClause}
        ORDER BY a.work_date DESC, a.check_in DESC
      `;

      const records = await customSelectSqlQuery(sql);

      const formattedRecords = records.map((r) => {
        let imgs = r.images;
        if (typeof imgs === "string") {
          try {
            imgs = JSON.parse(imgs);
          } catch (e) {
            imgs = [];
          }
        }
        return {
          ...r,
          images: imgs || [],
        };
      });

      return res.status(200).json({
        success: true,
        count: formattedRecords.length,
        data: formattedRecords,
      });
    } catch (err) {
      console.error("getMobileAttendanceHistory Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch mobile attendance history",
        error: err.message,
      });
    }
  };
}

module.exports = new AttendanceController();
