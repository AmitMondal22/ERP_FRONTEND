const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
  customSelectSqlQuery,
} = require("../models/MasterModel");

const table = "em_leave_requests";
const {
  sendLeaveRequestMail,
  sendLeaveStatusMail,
} = require("../utils/leavemailer.js");

const getDatesBetween = (start, end) => {
  const dates = [];
  let current = new Date(start);

  while (current <= new Date(end)) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const LEAVE_TYPE_MAP = {
  1: "privilege_leave",
  2: "casual_leave",
  3: "earned_leave",
  4: "maternity_leave",
  5: "sick_leave",
};

class employeeLeaveRequestController {

  //  Create new leave request
  // async createLeaveRequest(req, res) {
  //   try {
  //   const { employee_id,leave_type_id, start_date,end_date, status = "pending", reason = "",} = req.body;

  //     // --- Validation ---
  //     if (!employee_id || !leave_type_id || !start_date || !end_date) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "employee_id, leave_type_id, start_date, and end_date are required.",
  //       });
  //     }

  //     const data = {
  //       employee_id,
  //       leave_type_id,
  //       start_date,
  //       end_date,
  //       status,
  //       reason,
  //       request_date: new Date(),
  //     };

  //     const insertId = await insertData(table, data);

  //     res.status(201).json({
  //       success: true,
  //       message: "Leave request created successfully.",
  //       leave_id: insertId,
  //     });
  //   } catch (err) {
  //     console.error("createLeaveRequest Error:", err);
  //     res.status(500).json({ success: false, message: err.message });
  //   }
  // }

  async createLeaveRequest(req, res) {
    try {
      const {
        employee_id,
        leave_type_id,
        start_date,
        end_date,
        reason = "",
        status = "pending",
        manager_email,
        manager_name,
        employee_name,
      } = req.body;

      // --- Validation ---
      if (!employee_id || !leave_type_id || !start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message:
            "employee_id, leave_type_id, start_date, and end_date are required.",
        });
      }

      const data = {
        employee_id,
        leave_type_id,
        start_date,
        end_date, 
        status,
        reason,
        request_date: new Date(),
      };

      //  Insert leave request
      const insertId = await insertData(table, data);
      //  Final response
      res.status(201).json({
        success: true,
        message: "Leave request created successfully.",
        leave_id: insertId,
      });

      //  Send mail to manager (non-blocking)
      try {

       setImmediate(()=>{
          sendLeaveRequestMail({
          to: manager_email,
          managerName: manager_name,
          employeeName: employee_name,
          startDate: start_date,
          endDate: end_date,
          reason,
        });
       })

       
      } catch (mailErr) {
        console.error("Leave mail failed:", mailErr.message);
        //  Do NOT return error – DB insert already done
      }

      
    } catch (err) {
      console.error("createLeaveRequest Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }


async getApprovedLeavesByDateRange(req, res) {
  try {
    const { fromdate, todate } = req.body;

    if (!fromdate || !todate) {
      return res.status(400).json({
        success: false,
        message: "fromdate and todate are required",
      });
    }

    const sql = `
      SELECT 
        lr.leave_id,
        lr.employee_id,
        lr.leave_type_id,
        lr.start_date,
        lr.end_date,
        lr.status,
        lr.request_date,
        lr.reason,

        emp.first_name,
        emp.last_name,
        emp.email,
        emp.phone,
        emp.department,
        emp.job_title,
        emp.hire_date

      FROM em_leave_requests lr
      LEFT JOIN em_employees emp 
        ON lr.employee_id = emp.employee_id
      WHERE lr.status = 'approved'
        AND DATE(lr.start_date) >= '${fromdate}'
        AND DATE(lr.end_date) <= '${todate}'
      ORDER BY lr.start_date ASC
    `;

    const data = await customSelectSqlQuery(sql);

    res.json({
      success: true,
      data,
    });

  } catch (err) {
    console.error("getApprovedLeavesByDateRange Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch approved leaves",
      error: err.message,
    });
  }
}




  async getAllLeaveRequestsWithDetails(req, res) {
    try {
      const sql = `
      SELECT 
        lr.leave_id,
        CONCAT(emp.first_name, ' ', emp.last_name) AS employee_name,
        emp.email AS employee_email,
        lt.type_name AS leave_type,
        lr.start_date AS from_date,
        lr.end_date AS to_date,
        lr.reason,
        lr.status,
        lr.request_date
      FROM em_leave_requests lr
      LEFT JOIN em_employees emp ON lr.employee_id = emp.employee_id
      LEFT JOIN em_leave_types lt ON lr.leave_type_id = lt.leave_type_id
      ORDER BY lr.leave_id DESC
    `;

      const result = await customSelectSqlQuery(sql);

      const formattedResult = result.map((record) => ({
        ...record,
        from_date: record.from_date
          ? record.from_date.toISOString().split("T")[0]
          : null,
        to_date: record.to_date
          ? record.to_date.toISOString().split("T")[0]
          : null,
      }));

      res.json({
        success: true,
        data: formattedResult,
      });
    } catch (err) {
      console.error("getAllLeaveRequestsWithDetails Error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch detailed leave requests",
        error: err.message,
      });
    }
  }

  //  Get all leave requests
  async getAllLeaveRequests(req, res) {
    try {
      const rows = await selectData(table, "*", null, "leave_id DESC");
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error("getAllLeaveRequests Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  //  Get single leave request by ID
  async getLeaveRequestById(req, res) {
    try {
      const { id } = req.params;
      const row = await selectOneData(table, "*", `leave_id = ${id}`);
      if (!row) {
        return res
          .status(404)
          .json({ success: false, message: "Leave request not found" });
      }
      res.json({ success: true, data: row });
    } catch (err) {
      console.error("getLeaveRequestById Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  //  Update leave request
  async updateLeaveRequest(req, res) {
    try {
      const { id } = req.params;
      const {
        employee_id,
        leave_type_id,
        start_date,
        end_date,
        status,
        reason,
      } = req.body;

      const existing = await selectOneData(table, "*", `leave_id = ${id}`);
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, message: "Leave request not found" });
      }

      const updateFields = {};
      if (employee_id) updateFields.employee_id = employee_id;
      if (leave_type_id) updateFields.leave_type_id = leave_type_id;
      if (start_date) updateFields.start_date = start_date;
      if (end_date) updateFields.end_date = end_date;
      if (status) updateFields.status = status;
      if (reason !== undefined) updateFields.reason = reason;

      const affected = await updateData(
        table,
        updateFields,
        `leave_id = ${id}`,
      );

      res.json({
        success: true,
        message: "Leave request updated successfully",
        affected,
      });
    } catch (err) {
      console.error("updateLeaveRequest Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  //  Delete leave request
  async deleteLeaveRequest(req, res) {
    try {
      const { id } = req.params;

      const existing = await selectOneData(table, "*", `leave_id = ${id}`);
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, message: "Leave request not found" });
      }

      await deleteData(table, `leave_id = ${id}`);

      res.json({
        success: true,
        message: "Leave request deleted successfully",
      });
    } catch (err) {
      console.error("deleteLeaveRequest Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }



async updateLeaveStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("Leave ID:", id);
    console.log("Requested Status:", status);

    if (!status || !["approved", "rejected"].includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    //  FETCH LEAVE REQUEST
    const leave = await selectOneData(
      "em_leave_requests",
      "*",
      `leave_id = ${id}`
    );

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Leave already ${leave.status}`,
      });
    }

    //  FETCH EMPLOYEE (ONCE)
    const employee = await selectOneData(
      "em_employees",
      "first_name, last_name, email",
      `employee_id = ${leave.employee_id}`
    );

    //  REJECT FLOW
    if (status === "rejected") {
      await updateData(
        "em_leave_requests",
        { status: "rejected" },
        `leave_id = ${id}`
      );

      //  Send response immediately
      res.json({
        success: true,
        message: "Leave rejected successfully",
      });

      //  Background mail
      setImmediate(() => {
        sendLeaveStatusMail({
          to: employee.email,
          employeeName: `${employee.first_name} ${employee.last_name}`,
          status: "rejected",
          startDate: leave.start_date,
          endDate: leave.end_date,
        }).catch(err =>
          console.error("Reject mail failed:", err.message)
        );
      });

      return;
    }

    // 🔥 APPROVAL FLOW 🔥

    //  FETCH LATEST LEAVE BALANCE
    const balanceRows = await customSelectSqlQuery(`
      SELECT *
      FROM em_leave_assigned
      WHERE employee_id = ${leave.employee_id}
      ORDER BY leave_assigned_id DESC
      LIMIT 1
    `);

    if (!balanceRows.length) {
      return res.status(400).json({
        success: false,
        message: "Leave balance not assigned by HR",
      });
    }

    const currentBalance = balanceRows[0];

    // 5️⃣ FETCH HOLIDAYS
    const startDateStr = leave.start_date.toISOString().split("T")[0];
    const endDateStr = leave.end_date.toISOString().split("T")[0];

    const holidays = await customSelectSqlQuery(`
      SELECT DATE(holiday_date) AS holiday_date
      FROM em_annual_holiday
      WHERE DATE(holiday_date) BETWEEN '${startDateStr}' AND '${endDateStr}'
    `);

    const holidayDates = holidays.map(h =>
      new Date(h.holiday_date).toISOString().split("T")[0]
    );

    // 6️⃣ CALCULATE PAYABLE DAYS
    const allDates = getDatesBetween(leave.start_date, leave.end_date);

    const payableLeaveDays = allDates.filter(dateStr => {
      if (holidayDates.includes(dateStr)) return false;
      const date = new Date(dateStr + "T00:00:00");
      return date.getDay() !== 0;
    });

    const totalDeductDays = payableLeaveDays.length;

    if (totalDeductDays <= 0) {
      return res.status(400).json({
        success: false,
        message: "All selected days are holidays or Sundays",
      });
    }

    //  DETERMINE LEAVE COLUMN
    const leaveColumn = LEAVE_TYPE_MAP[leave.leave_type_id];

    if (!leaveColumn) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave type mapping",
      });
    }

    if (currentBalance[leaveColumn] < totalDeductDays) {
      return res.status(400).json({
        success: false,
        message: "Insufficient leave balance",
      });
    }

    // 8️⃣ INSERT NEW BALANCE
    const newBalanceRow = {
      employee_id: leave.employee_id,
      privilege_leave: currentBalance.privilege_leave,
      casual_leave: currentBalance.casual_leave,
      earned_leave: currentBalance.earned_leave,
      maternity_leave: currentBalance.maternity_leave,
      sick_leave: currentBalance.sick_leave,
      created_by: req.user?.id || leave.employee_id,
      created_at: new Date(),
    };

    newBalanceRow[leaveColumn] =
      currentBalance[leaveColumn] - totalDeductDays;

    await insertData("em_leave_assigned", newBalanceRow);

    // 9️⃣ UPDATE LEAVE STATUS
    await updateData(
      "em_leave_requests",
      { status: "approved" },
      `leave_id = ${id}`
    );

    //  Send response immediately
    res.json({
      success: true,
      message: "Leave approved and balance updated",
      deducted_days: totalDeductDays,
    });

    //  Background mail
    setImmediate(() => {
      sendLeaveStatusMail({
        to: employee.email,
        employeeName: `${employee.first_name} ${employee.last_name}`,
        status: "approved",
        startDate: leave.start_date,
        endDate: leave.end_date,
      }).catch(err =>
        console.error("Approve mail failed:", err.message)
      );
    });

  } catch (err) {
    console.error("updateLeaveStatus ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update leave status",
      error: err.message,
    });
  }
}




}

module.exports = new employeeLeaveRequestController();
