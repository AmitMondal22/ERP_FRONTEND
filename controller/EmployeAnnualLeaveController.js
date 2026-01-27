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

const TABLE = "em_annual_holiday";

/* ================================
   ✅ Allowed fields from request body
   ================================ */
const HOLIDAY_FIELD_ARRAY = [
  "holiday_name",
  "holiday_date",
  "holiday_type",
  "description",
  "created_by"
];

/* ================================
   🔐 Filter + sanitize payload
   ================================ */
function filterHolidayPayload(body) {
  const filtered = {};
  HOLIDAY_FIELD_ARRAY.forEach((field) => {
    if (body[field] !== undefined) {
      filtered[field] = body[field] === "" ? null : body[field];
    }
  });
  return filtered;
}

class EmployeeHolidayController {

  /* ================================
     CREATE HOLIDAY
     ================================ */
  async createHoliday(req, res) {
    try {
      console.log("\n========== CREATE HOLIDAY ==========");
      console.log("Request Body:", JSON.stringify(req.body, null, 2));

      const payload = filterHolidayPayload(req.body);

      // Validate required fields
      if (!payload.holiday_name) {
        return res.status(400).json({
          success: false,
          message: "holiday_name is required"
        });
      }

      if (!payload.holiday_date) {
        return res.status(400).json({
          success: false,
          message: "holiday_date is required"
        });
      }

      // Validate date format
      const holidayDate = dayjs(payload.holiday_date);
      if (!holidayDate.isValid()) {
        return res.status(400).json({
          success: false,
          message: "Invalid holiday_date format. Use YYYY-MM-DD"
        });
      }

      // Set default holiday_type if not provided
      if (!payload.holiday_type) {
        payload.holiday_type = "public"; // default type
      }

      payload.created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

      console.log("Final Payload:", JSON.stringify(payload, null, 2));

      const insertId = await insertData(TABLE, payload);

      console.log(`✅ Holiday created with ID: ${insertId}`);
      console.log("========== END CREATE ==========\n");

      return res.status(201).json({
        success: true,
        message: "Holiday created successfully",
        holiday_id: insertId
      });

    } catch (error) {
      console.error("❌ createHoliday error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create holiday",
        error: error.message
      });
    }
  }

  /* ================================
     GET ALL HOLIDAYS
     ================================ */
  async getAllHolidays(req, res) {
    try {
      const rows = await selectData(
        TABLE,
        "*",
        null,
        "holiday_date ASC"
      );

      return res.status(200).json({
        success: true,
        data: rows
      });

    } catch (error) {
      console.error("getAllHolidays error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch holidays"
      });
    }
  }

  /* ================================
     GET HOLIDAYS BY YEAR
     ================================ */
  async getHolidaysByYear(req, res) {
    try {
      const { year } = req.params;

      if (!year || isNaN(year)) {
        return res.status(400).json({
          success: false,
          message: "Valid year is required"
        });
      }

      const rows = await selectData(
        TABLE,
        "*",
        `YEAR(holiday_date) = ${year}`,
        "holiday_date ASC"
      );

      return res.status(200).json({
        success: true,
        year: parseInt(year),
        count: rows.length,
        data: rows
      });

    } catch (error) {
      console.error("getHolidaysByYear error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch holidays by year"
      });
    }
  }

  /* ================================
     GET HOLIDAYS BY TYPE
     ================================ */
  async getHolidaysByType(req, res) {
    try {
      const { type } = req.params;

      if (!type) {
        return res.status(400).json({
          success: false,
          message: "Holiday type is required"
        });
      }

      const rows = await selectData(
        TABLE,
        "*",
        `holiday_type = '${type}'`,
        "holiday_date ASC"
      );

      return res.status(200).json({
        success: true,
        type: type,
        count: rows.length,
        data: rows
      });

    } catch (error) {
      console.error("getHolidaysByType error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch holidays by type"
      });
    }
  }

  /* ================================
     GET HOLIDAY BY ID
     ================================ */
  async getHolidayById(req, res) {
    try {
      const { holiday_id } = req.params;

      if (!holiday_id) {
        return res.status(400).json({
          success: false,
          message: "holiday_id is required"
        });
      }

      const row = await selectOneData(
        TABLE,
        "*",
        `holiday_id = ${holiday_id}`
      );

      if (!row) {
        return res.status(404).json({
          success: false,
          message: "Holiday not found"
        });
      }

      return res.status(200).json({
        success: true,
        data: row
      });

    } catch (error) {
      console.error("getHolidayById error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch holiday"
      });
    }
  }

  /* ================================
     GET UPCOMING HOLIDAYS
     ================================ */
  async getUpcomingHolidays(req, res) {
    try {
      const today = dayjs().format("YYYY-MM-DD");
      const { limit = 10 } = req.query;

      const query = `
        SELECT * FROM ${TABLE}
        WHERE holiday_date >= '${today}'
        ORDER BY holiday_date ASC
        LIMIT ${parseInt(limit)}
      `;

      const rows = await customSelectSqlQuery(query, true);

      return res.status(200).json({
        success: true,
        count: rows.length,
        data: rows
      });

    } catch (error) {
      console.error("getUpcomingHolidays error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch upcoming holidays"
      });
    }
  }

  /* ================================
     UPDATE HOLIDAY
     ================================ */
  async updateHoliday(req, res) {
    try {
      const { holiday_id } = req.params;

      console.log("\n========== UPDATE HOLIDAY ==========");
      console.log("holiday_id:", holiday_id);
      console.log("Request Body:", JSON.stringify(req.body, null, 2));

      if (!holiday_id) {
        return res.status(400).json({
          success: false,
          message: "holiday_id is required"
        });
      }

      // Check if holiday exists
      const existingHoliday = await selectOneData(
        TABLE,
        "*",
        `holiday_id = ${holiday_id}`
      );

      if (!existingHoliday) {
        return res.status(404).json({
          success: false,
          message: "Holiday not found"
        });
      }

      const payload = filterHolidayPayload(req.body);

      if (Object.keys(payload).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields provided for update"
        });
      }

      // Validate date if provided
      if (payload.holiday_date) {
        const holidayDate = dayjs(payload.holiday_date);
        if (!holidayDate.isValid()) {
          return res.status(400).json({
            success: false,
            message: "Invalid holiday_date format. Use YYYY-MM-DD"
          });
        }
      }

      console.log("Update Payload:", JSON.stringify(payload, null, 2));

      const affectedRows = await updateData(
        TABLE,
        payload,
        `holiday_id = ${holiday_id}`
      );

      console.log("Rows affected:", affectedRows);

      if (affectedRows === 0) {
        return res.status(400).json({
          success: false,
          message: "No changes made to holiday"
        });
      }

      console.log("========== UPDATE SUCCESS ==========\n");

      return res.status(200).json({
        success: true,
        message: "Holiday updated successfully",
        holiday_id: parseInt(holiday_id)
      });

    } catch (error) {
      console.error("❌ updateHoliday error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update holiday",
        error: error.message
      });
    }
  }

  /* ================================
     DELETE HOLIDAY
     ================================ */
  async deleteHoliday(req, res) {
    try {
      const { holiday_id } = req.params;

      console.log("\n========== DELETE HOLIDAY ==========");
      console.log("holiday_id:", holiday_id);

      if (!holiday_id) {
        return res.status(400).json({
          success: false,
          message: "holiday_id is required"
        });
      }

      // Check if holiday exists
      const existingHoliday = await selectOneData(
        TABLE,
        "*",
        `holiday_id = ${holiday_id}`
      );

      if (!existingHoliday) {
        return res.status(404).json({
          success: false,
          message: "Holiday not found"
        });
      }

      const affected = await deleteData(
        TABLE,
        `holiday_id = ${holiday_id}`
      );

      console.log("Rows deleted:", affected);
      console.log("========== DELETE SUCCESS ==========\n");

      return res.status(200).json({
        success: true,
        message: "Holiday deleted successfully"
      });

    } catch (error) {
      console.error("❌ deleteHoliday error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete holiday",
        error: error.message
      });
    }
  }

  /* ================================
     CHECK IF DATE IS HOLIDAY
     ================================ */
  async checkIfHoliday(req, res) {
    try {
      const { date } = req.params;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: "Date is required (format: YYYY-MM-DD)"
        });
      }

      const holidayDate = dayjs(date);
      if (!holidayDate.isValid()) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD"
        });
      }

      const holiday = await selectOneData(
        TABLE,
        "*",
        `holiday_date = '${date}'`
      );

      return res.status(200).json({
        success: true,
        date: date,
        is_holiday: !!holiday,
        holiday: holiday || null
      });

    } catch (error) {
      console.error("checkIfHoliday error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to check holiday"
      });
    }
  }

  /* ================================
     GET HOLIDAY STATISTICS
     ================================ */
  async getHolidayStats(req, res) {
    try {
      const { year } = req.query;
      
      let condition = null;
      if (year) {
        condition = `YEAR(holiday_date) = ${year}`;
      }

      const query = `
        SELECT 
          COUNT(*) as total_holidays,
          COUNT(CASE WHEN holiday_type = 'public' THEN 1 END) as public_holidays,
          COUNT(CASE WHEN holiday_type = 'optional' THEN 1 END) as optional_holidays,
          COUNT(CASE WHEN holiday_type = 'restricted' THEN 1 END) as restricted_holidays,
          MIN(holiday_date) as first_holiday,
          MAX(holiday_date) as last_holiday
        FROM ${TABLE}
        ${condition ? `WHERE ${condition}` : ''}
      `;

      const stats = await customSelectSqlQuery(query, false);

      return res.status(200).json({
        success: true,
        year: year ? parseInt(year) : "all",
        stats: stats
      });

    } catch (error) {
      console.error("getHolidayStats error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch holiday statistics"
      });
    }
  }
}

module.exports = new EmployeeHolidayController();