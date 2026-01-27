const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const {
  insertData,
  updateData,
  selectOneData,
  selectData,
  deleteData,
  customSelectSqlQuery,
} = require("../models/MasterModel");

class BillingController {

  /* ---------------------------------------------------
     Generate Invoice No → DDMMYYYY/0001
  --------------------------------------------------- */
  async generateInvoiceNo() {
    const today = dayjs().format("DDMMYYYY");

    const sql = `
      SELECT invoice_no
      FROM tx_invoice_item
      WHERE invoice_no LIKE '${today}%'
      ORDER BY invoice_item_id DESC
      LIMIT 1
    `;

    const rows = await customSelectSqlQuery(sql);

    let nextSeq = 1;

    if (rows.length > 0) {
      const lastSeq = parseInt(rows[0].invoice_no.split("/")[1], 10);
      nextSeq = lastSeq + 1;
    }

    return `${today}/${String(nextSeq).padStart(4, "0")}`;
  }

  /* ---------------------------------------------------
     CREATE Invoice
  --------------------------------------------------- */

  // createInvoice = async (req, res) => {
  //   try {
  //     const {
  //       terms_and_condition,
  //       remarks,
  //       bill_to_id,
  //       shift_to_id,
  //       irn,
  //       ack_no,
  //       ack_date,
  //       bill_status = "N",
  //       date,
  //       client_id,
  //       work_progress_id,
  //       create_by,
  //     } = req.body;

  //     // if (!client_id || !work_progress_id) {
  //     //   return res.status(400).json({
  //     //     success: false,
  //     //     message: "client_id and work_progress_id are required",
  //     //   });
  //     // }

  //     const invoice_no = await this.generateInvoiceNo();

  //     const payload = {
  //       invoice_no,
  //       terms_and_condition,
  //       remarks,
  //       bill_to_id,
  //       shift_to_id,
  //       irn,
  //       ack_no,
  //       ack_date,
  //       bill_status,
  //       date: date || dayjs().format("YYYY-MM-DD"),
  //       client_id,
  //       work_progress_id,
  //       create_by,
  //       created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
  //     };

  //     const insertId = await insertData("tx_invoice_item", payload);

  //     res.status(201).json({
  //       success: true,
  //       message: "Invoice created successfully",
  //       data: {
  //         invoice_item_id: insertId,
  //         invoice_no,
  //       },
  //     });

  //   } catch (err) {
  //     console.error("Create Invoice Error:", err);
  //     res.status(500).json({
  //       success: false,
  //       message: "Failed to create invoice",
  //     });
  //   }
  // };




  createInvoice = async (req, res) => {
  try {
    const {
      terms_and_condition,
      remarks,
      bill_to_id,
      shift_to_id,
      irn,
      ack_no,
      ack_date,
      bill_status = "N",
      date,
      client_id,
      work_progress_id,
      create_by,
    } = req.body;

    const invoice_no = await this.generateInvoiceNo();

    const payload = {
      invoice_no,
      terms_and_condition,
      remarks,
      bill_to_id,
      shift_to_id,
      irn,
      ack_no,
      ack_date,
      bill_status,
      date: date || dayjs().format("YYYY-MM-DD"),
      client_id,
      work_progress_id,
      create_by,
      created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
    };

    /* ----------------------------------
     * 1️⃣ Insert invoice (unchanged)
     * ---------------------------------- */
    const insertId = await insertData("tx_invoice_item", payload);

    /* ----------------------------------
     * 2️⃣ Update billing_status in tx_work_progress
     *     (ONLY ADDITION)
     * ---------------------------------- */
    // if (work_progress_id) {
    //   await updateData(
    //     "tx_work_progress",
    //     { billing_status: "Y" },              // ENUM update
    //     "work_progress_site_id = ?",          // WHERE clause
    //     [work_progress_id]
    //   );
    // }



    if (work_progress_id) {
  await updateData(
    "tx_work_progress",
    { billing_status: "Y" },
    `work_progress_site_id = ${Number(work_progress_id)}`
  );
}


    /* ----------------------------------
     * 3️⃣ Response (unchanged)
     * ---------------------------------- */
    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: {
        invoice_item_id: insertId,
        invoice_no,
      },
    });

  } catch (err) {
    console.error("Create Invoice Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create invoice",
    });
  }
};



  /* ---------------------------------------------------
     GET Single Invoice
  --------------------------------------------------- */
  getInvoiceById = async (req, res) => {
    try {
      const { invoice_item_id } = req.params;

      const invoice = await selectOneData(
        "tx_invoice_item",
        "*",
        `invoice_item_id = ${invoice_item_id}`
      );

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found",
        });
      }

      res.json({
        success: true,
        data: invoice,
      });

    } catch (err) {
      console.error("Get Invoice Error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch invoice",
      });
    }
  };

  /* ---------------------------------------------------
     GET All Invoices
  --------------------------------------------------- */
  getAllInvoices = async (req, res) => {
    try {
      const invoices = await selectData(
        "tx_invoice_item",
        "*",
        null,
        "invoice_item_id DESC"
      );

      res.json({
        success: true,
        data: invoices,
      });

    } catch (err) {
      console.error("Get All Invoices Error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch invoices",
      });
    }
  };

  /* ---------------------------------------------------
     UPDATE Invoice
  --------------------------------------------------- */
  updateInvoice = async (req, res) => {
    try {
      const { invoice_item_id } = req.params;

      const payload = {
        ...req.body,
        updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
      };

      const affectedRows = await updateData(
        "tx_invoice_item",
        payload,
        `invoice_item_id = ${invoice_item_id}`
      );

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found",
        });
      }

      res.json({
        success: true,
        message: "Invoice updated successfully",
      });

    } catch (err) {
      console.error("Update Invoice Error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to update invoice",
      });
    }
  };

  /* ---------------------------------------------------
     DELETE Invoice
  --------------------------------------------------- */
  deleteInvoice = async (req, res) => {
    try {
      const { invoice_item_id } = req.params;

      const affectedRows = await deleteData(
        "tx_invoice_item",
        `invoice_item_id = ${invoice_item_id}`
      );

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found",
        });
      }

      res.json({
        success: true,
        message: "Invoice deleted successfully",
      });

    } catch (err) {
      console.error("Delete Invoice Error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to delete invoice",
      });
    }
  };
}

module.exports = new BillingController();
