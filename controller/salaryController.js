// const dayjs = require("dayjs");
// const utc = require("dayjs/plugin/utc");
// dayjs.extend(utc);

// const {
//   insertData,
//   selectData,
//   selectOneData,
//   updateData,
//   deleteData
// } = require("../models/MasterModel");

// const TABLE = "em_salary";

// /* ================================
//    ✅ Allowed fields from request body
//    ================================ */
// const SALARY_FIELD_ARRAY = [
//   "employee_id",

//   "basic_salary","basic_pay","basic_wages","dearness_allowance",
//   "house_rent_allowance","conveyance_allowance","medical_allowance",
//   "special_allowance","city_compensatory_allowance","education_allowance",
//   "uniform_allowance","telephone_mobile_allowance","internet_allowance",
//   "fuel_allowance","books_periodicals_allowance","child_education_allowance",
//   "hostel_allowance","food_allowance","other_allowance",

//   "performance_bonus","annual_bonus","incentive","sales_commission",
//   "productivity_bonus","profit_linked_bonus",

//   "attendance_allowance","shift_allowance","night_shift_allowance",
//   "weekend_allowance","on_call_allowance",

//   "project_allowance","site_allowance","location_allowance",
//   "hazard_allowance","hardship_allowance",

//   "medical_reimbursement","travel_reimbursement","lta_ltc",
//   "mobile_bill_reimbursement","internet_reimbursement",
//   "fuel_reimbursement","office_expenses_reimbursement",

//   "epf_employee_contribution","esi_employee_contribution",
//   "professional_tax","labour_welfare_fund","income_tax_tds",

//   "loan_deduction","advance_salary_recovery","meal_deduction",
//   "insurance_premium_employee","late_coming_lop",
//   "notice_period_recovery","damage_penalty_deduction",

//   "epf_employer_contribution","esi_employer_contribution",
//   "gratuity_contribution","superannuation_fund",
//   "group_medical_insurance","group_personal_accident_insurance",

//   "leave_encashment","loss_of_pay","paid_leave_adjustment",
//   "unpaid_leave_adjustment","comp_off_adjustment",

//   "gratuity","notice_pay","leave_encashment_fnf",
//   "severance_pay","settlement_adjustment",

//   "hra_exempt","lta_ltc_exempt","meal_coupons",
//   "uniform_allowance_exempt",
//   "telephone_internet_reimbursement_exempt",
//  "last_salary_status",
 
//   "created_by"
// ];

// /* ================================
//    🔐 Filter + sanitize payload
//    ================================ */
// function filterSalaryPayload(body) {
//   const filtered = {};
//   SALARY_FIELD_ARRAY.forEach((field) => {
//     if (body[field] !== undefined) {
//       filtered[field] = body[field] === "" ? null : body[field];
//     }
//   });
//   return filtered;
// }


// function removeNullFields(obj) {
//   const cleaned = {};
//   Object.keys(obj).forEach((key) => {
//     if (obj[key] !== null && obj[key] !== undefined) {
//       cleaned[key] = obj[key];
//     }
//   });
//   return cleaned;
// }


// class SalaryController {

//   /* ================================
//      CREATE SALARY
//      ================================ */
//   async createSalary(req, res) {
//     try {
//       const payload = filterSalaryPayload(req.body);

//       if (!payload.employee_id) {
//         return res.status(400).json({
//           success: false,
//           message: "employee_id is required"
//         });
//       }

//       payload.created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
//       payload.updated_at = payload.created_at;

//       const insertId = await insertData(TABLE, payload);

//       return res.status(201).json({
//         success: true,
//         message: "Salary record created successfully",
//         em_salary_id: insertId
//       });

//     } catch (error) {
//       console.error("createSalary error:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to create salary record",
//         error: error.message
//       });
//     }
//   }

//   /* ================================
//      GET ALL SALARIES
//      ================================ */
//   async getAllSalaries(req, res) {
//     try {
//       const rows = await selectData(
//         TABLE,
//         "*",
//         null,
//         "em_salary_id DESC"
//       );

//       return res.status(200).json({
//         success: true,
//         data: rows
//       });

//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to fetch salary records"
//       });
//     }
//   }

//   /* ================================
//      GET SALARY BY ID
//      ================================ */
//   async getSalaryById(req, res) {
//     try {
//       const { em_salary_id } = req.params;

//       const row = await selectOneData(
//         TABLE,
//         "*",
//         `em_salary_id = ${em_salary_id}`
//       );

//       if (!row) {
//         return res.status(404).json({
//           success: false,
//           message: "Salary record not found"
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         data: row
//       });

//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to fetch salary record"
//       });
//     }
//   }


// /** */
// /* ================================
//    GET SALARY BY EMPLOYEE ID
//    ================================ */
// async getSalaryByEmployeeId(req, res) {
//   try {
//     const { employee_id } = req.params;

//     if (!employee_id) {
//       return res.status(400).json({
//         success: false,
//         message: "employee_id is required"
//       });
//     }

//     const row = await selectOneData(
//       TABLE,
//       "*",
//       `employee_id = ${employee_id}`,
//       "em_salary_id DESC"
//     );

//     if (!row) {
//       return res.status(404).json({
//         success: false,
//         message: "Salary record not found for this employee"
//       });
//     }

//     // ✅ remove null fields before returning
//     const sanitizedRow = removeNullFields(row);

//     return res.status(200).json({
//       success: true,
//       data: sanitizedRow
//     });

//   } catch (error) {
//     console.error("getSalaryByEmployeeId error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch salary details",
//       error: error.message
//     });
//   }
// }





//   /* ================================
//      UPDATE SALARY
//      ================================ */
// //   async updateSalary(req, res) {
// //     try {
// //       const { em_salary_id } = req.params;

// //       const payload = filterSalaryPayload(req.body);
// //       payload.updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

// //       if (Object.keys(payload).length === 1) {
// //         return res.status(400).json({
// //           success: false,
// //           message: "No valid salary fields provided"
// //         });
// //       }

// //       const affected = await updateData(
// //         TABLE,
// //         payload,
// //         `em_salary_id = ${em_salary_id}`
// //       );

// //       if (affected === 0) {
// //         return res.status(404).json({
// //           success: false,
// //           message: "Salary record not found or no changes made"
// //         });
// //       }

// //       return res.status(200).json({
// //         success: true,
// //         message: "Salary record updated successfully"
// //       });

// //     } catch (error) {
// //       console.error(error);
// //       return res.status(500).json({
// //         success: false,
// //         message: "Failed to update salary record"
// //       });
// //     }
// //   }


// /* ================================
//    UPDATE SALARY (VERSIONED INSERT)
//    ================================ */
// /* ================================
//    UPDATE SALARY BY EMPLOYEE ID
//    (VERSIONED INSERT)
//    ================================ */
// // async updateSalary(req, res) {
// //   try {
// //     const { employee_id } = req.params;

// //     if (!employee_id) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "employee_id is required"
// //       });
// //     }

// //     // 1️⃣ Fetch current active salary for employee
// //     const activeSalary = await selectOneData(
// //       TABLE,
// //       "*",
// //       `employee_id = ${employee_id} AND last_salary_status = 'Y'`
// //     );

// //     if (!activeSalary) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Active salary record not found for this employee"
// //       });
// //     }

// //     //  Mark current salary as inactive
// //     // await updateData(
// //     //   TABLE,
// //     //   {
// //     //     last_salary_status: "N",
// //     //     updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
// //     //   },
// //     //   `employee_id = ${employee_id} AND last_salary_status = 'Y'`
// //     // );



// //     await updateData(
// //   TABLE,
// //   {
// //     last_salary_status: "N",
// //     updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
// //   },
// //   `em_salary_id = ${activeSalary.em_salary_id}`
// // );


// //     // 3️⃣ Prepare new salary payload
// //     const payload = filterSalaryPayload(req.body);

// //     if (Object.keys(payload).length === 0) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "No valid salary fields provided"
// //       });
// //     }

// //     payload.employee_id = employee_id;
// //     payload.last_salary_status = "Y";
// //     payload.created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
// //     payload.updated_at = payload.created_at;

// //     // 4️⃣ Insert new salary version
// //     const newSalaryId = await insertData(TABLE, payload);

// //     return res.status(200).json({
// //       success: true,
// //       message: "Salary updated successfully (new salary version created)",
// //       em_salary_id: newSalaryId
// //     });

// //   } catch (error) {
// //     console.error("updateSalary error:", error);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Failed to update salary",
// //       error: error.message
// //     });
// //   }
// // }


// /* ================================
//      UPDATE SALARY (VERSIONED INSERT)
//      ================================ */
//   async updateSalary(req, res) {
//     try {
//       const { employee_id } = req.params;

//       // 1️⃣ Validate employee_id
//       if (!employee_id) {
//         return res.status(400).json({
//           success: false,
//           message: "employee_id is required"
//         });
//       }

//       const employeeIdNum = Number(employee_id);

//       // 2️⃣ Fetch current ACTIVE salary for this employee
//       const activeSalary = await selectOneData(
//         TABLE,
//         "*",
//         `employee_id = ${employeeIdNum} AND last_salary_status = 'Y'`
//       );

//       console.log("📌 Active salary found:", activeSalary);

//       if (!activeSalary) {
//         return res.status(404).json({
//           success: false,
//           message: "Active salary record not found for this employee"
//         });
//       }

//       // 3️⃣ Prepare new salary payload
//       const payload = filterSalaryPayload(req.body);

//       if (Object.keys(payload).length === 0) {
//         return res.status(400).json({
//           success: false,
//           message: "No valid salary fields provided"
//         });
//       }

//       // 4️⃣ Deactivate the PREVIOUS salary (set last_salary_status = 'N')
//       console.log(`🔄 Deactivating salary ID: ${activeSalary.em_salary_id}`);
      
//       const affectedRows = await updateData(
//         TABLE,
//         {
//           last_salary_status: "N",
//           updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
//         },
//         `em_salary_id = ${Number(activeSalary.em_salary_id)}`
//       );

//       console.log(`✅ Rows affected by deactivation: ${affectedRows}`);

//       if (affectedRows === 0) {
//         return res.status(500).json({
//           success: false,
//           message: "Failed to deactivate previous salary record"
//         });
//       }

//       // 5️⃣ Insert NEW salary version with last_salary_status = 'Y'
//       payload.employee_id = employeeIdNum;
//       payload.last_salary_status = "Y";  // ✅ New record is ACTIVE
//       payload.created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
//       payload.updated_at = payload.created_at;

//       console.log("📝 Inserting new salary version:", payload);

//       const newSalaryId = await insertData(TABLE, payload);

//       console.log(`✅ New salary created with ID: ${newSalaryId}`);

//       return res.status(200).json({
//         success: true,
//         message: "Salary updated successfully (new version created)",
//         data: {
//           new_em_salary_id: newSalaryId,
//           previous_em_salary_id: activeSalary.em_salary_id,
//           employee_id: employeeIdNum
//         }
//       });

//     } catch (error) {
//       console.error("❌ updateSalary error:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to update salary",
//         error: error.message
//       });
//     }
//   }






//   /* ================================
//      DELETE SALARY
//      ================================ */
//   async deleteSalary(req, res) {
//     try {
//       const { em_salary_id } = req.params;

//       const affected = await deleteData(
//         TABLE,
//         `em_salary_id = ${em_salary_id}`
//       );

//       if (affected === 0) {
//         return res.status(404).json({
//           success: false,
//           message: "Salary record not found"
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Salary record deleted successfully"
//       });

//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to delete salary record"
//       });
//     }
//   }
// }

// module.exports = new SalaryController();




const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData
} = require("../models/MasterModel");

const TABLE = "em_salary";

/* ================================
   ✅ Allowed fields from request body
   ================================ */
const SALARY_FIELD_ARRAY = [
  "employee_id",

  "basic_salary","basic_pay","basic_wages","dearness_allowance",
  "house_rent_allowance","conveyance_allowance","medical_allowance",
  "special_allowance","city_compensatory_allowance","education_allowance",
  "uniform_allowance","telephone_mobile_allowance","internet_allowance",
  "fuel_allowance","books_periodicals_allowance","child_education_allowance",
  "hostel_allowance","food_allowance","other_allowance",

  "performance_bonus","annual_bonus","incentive","sales_commission",
  "productivity_bonus","profit_linked_bonus",

  "attendance_allowance","shift_allowance","night_shift_allowance",
  "weekend_allowance","on_call_allowance",

  "project_allowance","site_allowance","location_allowance",
  "hazard_allowance","hardship_allowance",

  "medical_reimbursement","travel_reimbursement","lta_ltc",
  "mobile_bill_reimbursement","internet_reimbursement",
  "fuel_reimbursement","office_expenses_reimbursement",

  "epf_employee_contribution","esi_employee_contribution",
  "professional_tax","labour_welfare_fund","income_tax_tds",

  "loan_deduction","advance_salary_recovery","meal_deduction",
  "insurance_premium_employee","late_coming_lop",
  "notice_period_recovery","damage_penalty_deduction",

  "epf_employer_contribution","esi_employer_contribution",
  "gratuity_contribution","superannuation_fund",
  "group_medical_insurance","group_personal_accident_insurance",

  "leave_encashment","loss_of_pay","paid_leave_adjustment",
  "unpaid_leave_adjustment","comp_off_adjustment",

  "gratuity","notice_pay","leave_encashment_fnf",
  "severance_pay","settlement_adjustment",

  "hra_exempt","lta_ltc_exempt","meal_coupons",
  "uniform_allowance_exempt",
  "telephone_internet_reimbursement_exempt",

  "created_by"
];

/* ================================
   🔐 Filter + sanitize payload
   ================================ */
function filterSalaryPayload(body) {
  const filtered = {};
  SALARY_FIELD_ARRAY.forEach((field) => {
    if (body[field] !== undefined) {
      filtered[field] = body[field] === "" ? null : body[field];
    }
  });
  return filtered;
}

function removeNullFields(obj) {
  const cleaned = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== null && obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
}

class SalaryController {

  /* ================================
     CREATE SALARY
     ================================ */
  async createSalary(req, res) {
    try {
      console.log("\n========== CREATE SALARY ==========");
      console.log("Request Body:", JSON.stringify(req.body, null, 2));

      const payload = filterSalaryPayload(req.body);

      if (!payload.employee_id) {
        return res.status(400).json({
          success: false,
          message: "employee_id is required"
        });
      }

      // ✅ FORCE last_salary_status to 'Y'
      payload.last_salary_status = "Y";
      payload.created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
      payload.updated_at = payload.created_at;

      console.log("Final Payload:", JSON.stringify(payload, null, 2));

      const insertId = await insertData(TABLE, payload);

      console.log(`✅ Salary created with ID: ${insertId}`);
      console.log("========== END CREATE ==========\n");

      return res.status(201).json({
        success: true,
        message: "Salary record created successfully",
        em_salary_id: insertId
      });

    } catch (error) {
      console.error("❌ createSalary error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create salary record",
        error: error.message
      });
    }
  }

  /* ================================
     GET ALL SALARIES
     ================================ */
  async getAllSalaries(req, res) {
    try {
      const rows = await selectData(
        TABLE,
        "*",
        null,
        "em_salary_id DESC"
      );

      return res.status(200).json({
        success: true,
        data: rows
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch salary records"
      });
    }
  }

  /* ================================
     GET SALARY BY ID
     ================================ */
  async getSalaryById(req, res) {
    try {
      const { em_salary_id } = req.params;

      const row = await selectOneData(
        TABLE,
        "*",
        `em_salary_id = ${em_salary_id}`
      );

      if (!row) {
        return res.status(404).json({
          success: false,
          message: "Salary record not found"
        });
      }

      return res.status(200).json({
        success: true,
        data: row
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch salary record"
      });
    }
  }

  /* ================================
     GET SALARY BY EMPLOYEE ID (ACTIVE ONLY)
     ================================ */
  async getSalaryByEmployeeId(req, res) {
    try {
      const { employee_id } = req.params;

      if (!employee_id) {
        return res.status(400).json({
          success: false,
          message: "employee_id is required"
        });
      }

      const row = await selectOneData(
        TABLE,
        "*",
        `employee_id = ${employee_id} AND last_salary_status = 'Y'`
      );

      if (!row) {
        return res.status(404).json({
          success: false,
          message: "Active salary record not found for this employee"
        });
      }

      const sanitizedRow = removeNullFields(row);

      return res.status(200).json({
        success: true,
        data: sanitizedRow
      });

    } catch (error) {
      console.error("getSalaryByEmployeeId error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch salary details",
        error: error.message
      });
    }
  }

  /* ================================
     UPDATE SALARY (VERSIONED INSERT)
     ================================ */
  // async updateSalary(req, res) {
  //   console.log("\n========== UPDATE SALARY START ==========");
    
  //   try {
  //     const { employee_id } = req.params;

  //     console.log("employee_id from params:", employee_id);
  //     console.log("Request Body:", JSON.stringify(req.body, null, 2));

  //     if (!employee_id) {
  //       console.log("❌ employee_id is missing");
  //       return res.status(400).json({
  //         success: false,
  //         message: "employee_id is required"
  //       });
  //     }

  //     const employeeIdNum = Number(employee_id);
  //     console.log("employee_id converted to number:", employeeIdNum);

  //     // Search for active salary
  //     console.log(`\n🔍 Searching: employee_id = ${employeeIdNum} AND last_salary_status = 'Y'`);
      
  //     const activeSalary = await selectOneData(
  //       TABLE,
  //       "*",
  //       `employee_id = ${employeeIdNum} AND last_salary_status = 'Y'`
  //     );

  //     console.log("Active salary found:", activeSalary ? "YES" : "NO");
  //     if (activeSalary) {
  //       console.log("Active salary details:", {
  //         em_salary_id: activeSalary.em_salary_id,
  //         employee_id: activeSalary.employee_id,
  //         last_salary_status: activeSalary.last_salary_status
  //       });
  //     }

  //     if (!activeSalary) {
  //       console.log("❌ No active salary found");
  //       return res.status(404).json({
  //         success: false,
  //         message: "Active salary record not found for this employee"
  //       });
  //     }

  //     // Prepare payload
  //     const payload = filterSalaryPayload(req.body);
  //     console.log("Filtered payload:", JSON.stringify(payload, null, 2));

  //     if (Object.keys(payload).length === 0) {
  //       console.log("❌ No valid fields in payload");
  //       return res.status(400).json({
  //         success: false,
  //         message: "No valid salary fields provided"
  //       });
  //     }

  //     // DEACTIVATE PREVIOUS SALARY
  //     console.log("\n🔄 Deactivating previous salary...");
  //     console.log("   em_salary_id to deactivate:", activeSalary.em_salary_id);
      
  //     const affectedRows = await updateData(
  //       TABLE,
  //       {
  //         last_salary_status: "N",
  //         updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
  //       },
  //       `em_salary_id = ${Number(activeSalary.em_salary_id)}`
  //     );

  //     console.log("   Rows affected:", affectedRows);

  //     if (affectedRows === 0) {
  //       console.error("❌ UPDATE FAILED - No rows affected");
  //       return res.status(500).json({
  //         success: false,
  //         message: "Failed to deactivate previous salary record"
  //       });
  //     }

  //     // INSERT NEW SALARY
  //     console.log("\n📝 Creating new salary version...");
  //     payload.employee_id = employeeIdNum;
  //     payload.last_salary_status = "Y";
  //     payload.created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
  //     payload.updated_at = payload.created_at;

  //     console.log("New salary payload:", JSON.stringify(payload, null, 2));

  //     const newSalaryId = await insertData(TABLE, payload);

  //     console.log(`✅ New salary created with ID: ${newSalaryId}`);
  //     console.log("========== UPDATE SALARY SUCCESS ==========\n");

  //     return res.status(200).json({
  //       success: true,
  //       message: "Salary updated successfully (new version created)",
  //       data: {
  //         new_em_salary_id: newSalaryId,
  //         previous_em_salary_id: activeSalary.em_salary_id,
  //         employee_id: employeeIdNum
  //       }
  //     });

  //   } catch (error) {
  //     console.error("❌ updateSalary error:", error);
  //     console.error("Stack:", error.stack);
  //     console.log("========== UPDATE SALARY FAILED ==========\n");
      
  //     return res.status(500).json({
  //       success: false,
  //       message: "Failed to update salary",
  //       error: error.message
  //     });
  //   }
  // }

  async updateSalary(req, res) {
  //console.log("\n========== UPDATE SALARY START ==========");

  try {
    const { employee_id } = req.params;

    // console.log("employee_id from params:", employee_id);
    // console.log("Request Body:", JSON.stringify(req.body, null, 2));

    if (!employee_id) {
      //console.log("❌ employee_id is missing");
      return res.status(400).json({
        success: false,
        message: "employee_id is required"
      });
    }

    const employeeIdNum = Number(employee_id);
    //console.log("employee_id converted to number:", employeeIdNum);

    // 🔍 Search for active salary
    // console.log(
    //   `\n🔍 Searching: employee_id = ${employeeIdNum} AND last_salary_status = 'Y'`
    // );

    const activeSalary = await selectOneData(
      TABLE,
      "*",
      `employee_id = ${employeeIdNum} AND last_salary_status = 'Y'`
    );

    //console.log("Active salary found:", activeSalary ? "YES" : "NO");

    // Prepare payload
    const payload = filterSalaryPayload(req.body);
    //console.log("Filtered payload:", JSON.stringify(payload, null, 2));

    if (Object.keys(payload).length === 0) {
      //console.log("❌ No valid fields in payload");
      return res.status(400).json({
        success: false,
        message: "No valid salary fields provided"
      });
    }

    // Common fields
    payload.employee_id = employeeIdNum;
    payload.last_salary_status = "Y";
    payload.created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
    payload.updated_at = payload.created_at;

    //  CASE 1: First salary (NO active salary)
    if (!activeSalary) {

     // console.log(" No existing salary → Creating first salary");

      const newSalaryId = await insertData(TABLE, payload);

      //console.log(` First salary created with ID: ${newSalaryId}`);
      //console.log("========== UPDATE SALARY SUCCESS ==========\n");

      return res.status(201).json({
        success: true,
        message: "Salary created successfully (first salary)",
        data: {
          em_salary_id: newSalaryId,
          employee_id: employeeIdNum
        }
      });
    }

    // 🟡 CASE 2: Update salary (Versioning)
    console.log("🔄 Existing salary found → Updating salary");
    console.log("   Deactivating em_salary_id:", activeSalary.em_salary_id);

    const affectedRows = await updateData(
      TABLE,
      {
        last_salary_status: "N",
        updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss")
      },
      `em_salary_id = ${activeSalary.em_salary_id}`
    );

    if (affectedRows === 0) {
      console.error("❌ Failed to deactivate previous salary");
      return res.status(500).json({
        success: false,
        message: "Failed to deactivate previous salary"
      });
    }

    const newSalaryId = await insertData(TABLE, payload);

    // console.log(`✅ New salary created with ID: ${newSalaryId}`);
    // console.log("========== UPDATE SALARY SUCCESS ==========\n");

    return res.status(200).json({
      success: true,
      message: "Salary updated successfully (new version created)",
      data: {
        new_em_salary_id: newSalaryId,
        previous_em_salary_id: activeSalary.em_salary_id,
        employee_id: employeeIdNum
      }
    });

  } catch (error) {
    console.error(" updateSalary error:", error);
    console.error("Stack:", error.stack);
    console.log("========== UPDATE SALARY FAILED ==========\n");

    return res.status(500).json({
      success: false,
      message: "Failed to update salary",
      error: error.message
    });
  }
}


  /* ================================
     DELETE SALARY
     ================================ */
  async deleteSalary(req, res) {
    try {
      const { em_salary_id } = req.params;

      const affected = await deleteData(
        TABLE,
        `em_salary_id = ${em_salary_id}`
      );

      if (affected === 0) {
        return res.status(404).json({
          success: false,
          message: "Salary record not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Salary record deleted successfully"
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete salary record"
      });
    }
  }
}

module.exports = new SalaryController();