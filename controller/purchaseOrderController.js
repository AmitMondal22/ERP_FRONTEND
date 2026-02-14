
const {
  insertData,
  updateData,
  deleteData,
  customSelectSqlQuery,
  selectOneData,
  batchInsertData,
} = require("../models/MasterModel");

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const now = dayjs.utc().format("YYYY-MM-DD HH:mm:ss");

// --------------------------------------------------
// GENERATE PO NUMBER — FORMAT: DD/MM/YYYY/n
// --------------------------------------------------
const generatePoId = async () => {
  const today = dayjs().format("DD/MM/YYYY");

  const sql = `
    SELECT po_no
    FROM td_purchase_order
    WHERE po_no LIKE '${today}%'
    ORDER BY po_no DESC
    LIMIT 1
  `;

  const lastPo = await customSelectSqlQuery(sql, false);

  // First PO of the day
  if (!lastPo) {
    return `${today}/1`;
  }

  const lastPoNo = lastPo.po_no;
  const lastNumber = parseInt(lastPoNo.split("/")[3] || 1, 10);
  const newNumber = lastNumber + 1;

  return `${today}/${newNumber}`;
};

class purchaseOrderController {
  
  // --------------------------------------------------
  // CREATE
  // --------------------------------------------------
  async createPurchaseOrder(req, res) {
    try {
      const {
        vendor_id,
        project_id,
        project_site_id,
        date,
        delivery_date,
        remarks,
        terms_and_condition,  // ✅ Added
        total_amount,
        products = [],
      } = req.body;

      if (!vendor_id) {
        return res.status(400).json({
          success: false,
          message: "vendor_id is required",
        });
      }

      if (!products.length) {
        return res.status(400).json({
          success: false,
          message: "At least one product is required",
        });
      }

      if (!total_amount) {
        return res.status(400).json({
          success: false,
          message: "total_amount is required",
        });
      }

      const created_by = req.user.id;
      const updated_by = req.user.id;
      const now = new Date();

      // 1️⃣ Generate PO Number
      const po_no = await generatePoId();

      // 2️⃣ Insert Purchase Order (Header)
      const purchase_order_id = await insertData("td_purchase_order", {
        po_no,
        vendor_id,
        project_id: project_id || null,
        project_site_id: project_site_id || null,
        date,
        delivery_date,
        remarks,
        terms_and_condition: terms_and_condition || null,  // ✅ Added
        total_amount,
        created_by,
        updated_by,
        created_at: now,
        updated_at: now,
      });

      // 3️⃣ Insert Purchase Order Products
      for (const p of products) {
        await insertData("td_purchase_order_product", {
          purchase_order_id,
          product_id: p.product_id,
          unit_id: p.unit_id || null,
          
          quantity: p.quantity,
          unit_price: p.unit_price,
          
          // Discount fields
          discount_rate: p.discount_rate || 0,
          discount_amount: p.discount_amount || 0,
          
          // GST rates
          sgst_rate: p.sgst_rate || 0,
          cgst_rate: p.cgst_rate || 0,
          igst_rate: p.igst_rate || 0,
          
          // GST amounts
          sgst_amt: p.sgst_amt || 0,
          cgst_amt: p.cgst_amt || 0,
          igst_amt: p.igst_amt || 0,
          
          total_amount: p.total_amount || 0,
          
          created_by,
          created_at: now,
          updated_at: now,
        });
      }

      // 4️⃣ Response
      res.json({
        success: true,
        message: "Purchase order created successfully",
        purchase_order_id,
        po_no,
        total_amount,
      });

    } catch (err) {
      console.error("createPurchaseOrder Error:", err);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  // --------------------------------------------------
  // GET ALL
  // --------------------------------------------------

  async getAllPurchaseOrders(req, res) {
    try {
      const sql = `
        SELECT 
          p.purchase_order_id,
          p.po_no,
          p.vendor_id,
          v.vendor_name,
          p.project_id,
          pr.project_name,
          p.project_site_id,
          ps.project_site_name,
          p.date,
          p.delivery_date,
          p.remarks,
          p.terms_and_condition,
          p.total_amount,
          p.created_at,
          p.updated_at
        FROM td_purchase_order p
        LEFT JOIN md_vendor v ON p.vendor_id = v.vendor_id
        LEFT JOIN md_project pr ON p.project_id = pr.project_id
        LEFT JOIN md_project_site ps ON p.project_site_id = ps.project_site_id
        ORDER BY p.purchase_order_id DESC
      `;

      const rows = await customSelectSqlQuery(sql);

      res.json({
        success: true,
        count: rows.length,
        data: rows,
      });

    } catch (err) {
      console.error("getAllPurchaseOrders Error:", err);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }




// async getPurchaseOrderByIdWithFullProductDetailsPo(req, res) {
//   try {
//     const { purchase_order_id } = req.params;

//     if (!purchase_order_id) {
//       return res.status(400).json({
//         success: false,
//         message: "purchase_order_id is required",
//       });
//     }

//     /* ----------------------------------
//      * 1️⃣ Fetch Purchase Order (Header)
//      * ---------------------------------- */
//     const poSql = `
//       SELECT
//         p.purchase_order_id,
//         p.po_no,
//         p.vendor_id,
//         v.vendor_name,
//         p.project_id,
//         pr.project_name,
//         p.project_site_id,
//         ps.project_site_name,
//         p.date,
//         p.delivery_date,
//         p.remarks,
//         p.terms_and_condition,
//         p.total_amount
//       FROM td_purchase_order p
//       LEFT JOIN md_vendor v ON p.vendor_id = v.vendor_id
//       LEFT JOIN md_project pr ON p.project_id = pr.project_id
//       LEFT JOIN md_project_site ps ON p.project_site_id = ps.project_site_id
//       WHERE p.purchase_order_id = ${purchase_order_id}
//       LIMIT 1
//     `;

//     const poRows = await customSelectSqlQuery(poSql);

//     if (poRows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Purchase order not found",
//       });
//     }

//     const purchaseOrder = poRows[0];

//     /* ----------------------------------
//      * 2️⃣ Fetch Purchase Order Products
//      * ---------------------------------- */
//     const productSql = `
//       SELECT
//         pop.purchase_order_product_id,
//         pop.product_id,
//         prod.product_name,
//         pop.quantity,
//         pop.unit_price,
//         pop.unit_id,
//         u.unit_name,
//         pop.discount_rate,
//         pop.discount_amount,
//         pop.sgst_rate,
//         pop.cgst_rate,
//         pop.igst_rate,
//         pop.sgst_amt,
//         pop.cgst_amt,
//         pop.igst_amt,
//         pop.total_amount
//       FROM td_purchase_order_product pop
//       LEFT JOIN md_product prod ON prod.product_id = pop.product_id
//       LEFT JOIN md_unit u ON u.unit_id = pop.unit_id
//       WHERE pop.purchase_order_id = ${purchase_order_id}
//       ORDER BY pop.purchase_order_product_id ASC
//     `;

//     const products = await customSelectSqlQuery(productSql);

//     /* ----------------------------------
//      * 3️⃣ Final Response
//      * ---------------------------------- */
//     res.status(200).json({
//       success: true,
//       data: {
//         ...purchaseOrder,
//         products,
//       },
//     });

//   } catch (err) {
//     console.error("getPurchaseOrderById Error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// }






  // --------------------------------------------------
  // GET ONE PO BY ID
  // --------------------------------------------------
 
 
 
 
 
 
 
 
  async getPurchaseOrderById(req, res) {
    try {
      const { id } = req.params;//this is purchase_order_id

      // ---------------------------
      // PURCHASE ORDER
      // ---------------------------
      const poSql = `
        SELECT 
          p.purchase_order_id,
          p.po_no,
          p.vendor_id,
          
          -- Vendor details
          v.vendor_name,
          v.vendor_mobile, 
          v.vendor_email,
          v.city_id,
          v.vendor_address,
          v.vendor_gst_in,
          
          p.project_id,
          pr.project_name,
          p.project_site_id,
          ps.project_site_name,
          p.date,
          p.delivery_date,
          p.remarks,
          p.terms_and_condition,
          p.total_amount,
          p.created_at,
          p.updated_at
        FROM td_purchase_order p
        LEFT JOIN md_vendor v ON p.vendor_id = v.vendor_id
        LEFT JOIN md_project pr ON p.project_id = pr.project_id
        LEFT JOIN md_project_site ps ON p.project_site_id = ps.project_site_id
        WHERE p.purchase_order_id = ${id}
      `;

      const po = await customSelectSqlQuery(poSql, false);

      if (!po) {
        return res.status(404).json({
          success: false,
          message: "Purchase order not found",
        });
      }

      // ---------------------------
      // PRODUCTS WITH ALL FIELDS
      // ---------------------------
      const productSql = `
        SELECT
          pp.purchase_order_product_id,
          pp.product_id,
          mp.product_name,
          pt.product_type_id,
          pt.product_type_name,
          
          pp.unit_id,
          u.unit_name,
          mp.qty,
          
          pp.quantity,
          pp.unit_price,
          
          pp.discount_rate,
          pp.discount_amount,
          
          pp.sgst_rate,
          pp.cgst_rate,
          pp.igst_rate,
          
          pp.sgst_amt,
          pp.cgst_amt,
          pp.igst_amt,
          
          pp.total_amount
        FROM td_purchase_order_product pp
        LEFT JOIN md_product mp ON pp.product_id = mp.product_id
        LEFT JOIN md_product_type pt ON mp.product_type_id = pt.product_type_id
        LEFT JOIN md_unit u ON pp.unit_id = u.unit_id
        WHERE pp.purchase_order_id = ${id}
      `;

      const products = await customSelectSqlQuery(productSql);

      // ---------------------------
      // FINAL RESPONSE
      // ---------------------------
      res.json({
        success: true,
        count: 1,
        data: [
          {
            ...po,
            products,
          },
        ],
      });

    } catch (err) {
      console.error("getPurchaseOrderById Error:", err);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }

  // --------------------------------------------------
  // UPDATE
  // --------------------------------------------------
  async updatePurchaseOrder(req, res) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid purchase order ID"
        });
      }

      const {
        vendor_id,
        project_id,
        project_site_id,
        date,
        delivery_date,
        remarks,
        terms_and_condition,  // ✅ Added
        total_amount,
        products = [],
      } = req.body;

      // Validation
      if (!vendor_id) {
        return res.status(400).json({
          success: false,
          message: "vendor_id is required",
        });
      }

      if (!products.length) {
        return res.status(400).json({
          success: false,
          message: "At least one product is required",
        });
      }

      const existing = await selectOneData(
        "td_purchase_order",
        "purchase_order_id",
        `purchase_order_id=${id}`
      );

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Purchase order not found",
        });
      }

      const updated_by = req.user.id;
      const now = new Date();

      // ---------------------------
      // UPDATE PO HEADER
      // ---------------------------
      const updateObj = {
        vendor_id,
        project_id: project_id || null,
        project_site_id: project_site_id || null,
        date,
        delivery_date,
        remarks,
        terms_and_condition: terms_and_condition || null,  // ✅ Added
        total_amount,
        updated_by,
        updated_at: now,
      };

      await updateData(
        "td_purchase_order",
        updateObj,
        `purchase_order_id=${id}`
      );

      // ---------------------------
      // DELETE OLD PRODUCTS
      // ---------------------------
      await deleteData(
        "td_purchase_order_product",
        `purchase_order_id=${id}`
      );

      // ---------------------------
      // INSERT NEW PRODUCTS WITH ALL FIELDS
      // ---------------------------
      if (products.length > 0) {
        const rows = products.map(p => ({
          purchase_order_id: id,
          product_id: p.product_id,
          unit_id: p.unit_id || null,
          
          quantity: p.quantity,
          unit_price: p.unit_price,
          
          // Discount fields
          discount_rate: p.discount_rate || 0,
          discount_amount: p.discount_amount || 0,
          
          // GST rate fields
          sgst_rate: p.sgst_rate || 0,
          cgst_rate: p.cgst_rate || 0,
          igst_rate: p.igst_rate || 0,
          
          // GST amount fields
          sgst_amt: p.sgst_amt || 0,
          cgst_amt: p.cgst_amt || 0,
          igst_amt: p.igst_amt || 0,
          
          // Total amount
          total_amount: p.total_amount || 0,
          
          created_by: updated_by,
          created_at: now,
          updated_at: now,
        }));

        // Updated column list to include discount fields
        await batchInsertData(
          "td_purchase_order_product",
          `purchase_order_id, product_id, unit_id, quantity, unit_price, 
           discount_rate, discount_amount,
           sgst_rate, cgst_rate, igst_rate, 
           sgst_amt, cgst_amt, igst_amt, 
           total_amount, 
           created_by, created_at, updated_at`,
          rows
        );
      }

      res.json({
        success: true,
        message: "Purchase order updated successfully",
      });

    } catch (err) {
      console.error("updatePurchaseOrder Error:", err);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------
  async deletePurchaseOrder(req, res) {
    try {
      const { id } = req.params;

      const existing = await selectOneData(
        "td_purchase_order",
        "*",
        `purchase_order_id=${id}`
      );

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Purchase order not found",
        });
      }

      await deleteData("td_purchase_order_product", `purchase_order_id=${id}`);
      await deleteData("td_purchase_order", `purchase_order_id=${id}`);

      res.json({
        success: true,
        message: "Purchase order deleted successfully",
      });

    } catch (err) {
      console.error("deletePurchaseOrder Error:", err);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }






// --------------------------------------------------
// GET PURCHASE ORDERS BY PROJECT AND SITE
// --------------------------------------------------
async getAllPurchaseOrdersByProjectIdAndSiteId(req, res) {
  try {
    const { project_id, site_id } = req.params;

    // Validation
    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: "project_id is required",
      });
    }

    if (!site_id) {
      return res.status(400).json({
        success: false,
        message: "site_id (project_site_id) is required",
      });
    }

    // SQL Query
    const sql = `
      SELECT 
        p.purchase_order_id,
        p.po_no,
        p.vendor_id,
        v.vendor_name,
        p.project_id,
        pr.project_name,
        p.project_site_id,
        ps.project_site_name,
        p.date,
        p.delivery_date,
        p.remarks,
        p.terms_and_condition,
        p.total_amount,
        p.created_at,
        p.updated_at
      FROM td_purchase_order p
      LEFT JOIN md_vendor v ON p.vendor_id = v.vendor_id
      LEFT JOIN md_project pr ON p.project_id = pr.project_id
      LEFT JOIN md_project_site ps ON p.project_site_id = ps.project_site_id
      WHERE p.project_id = ${project_id} 
        AND p.project_site_id = ${site_id}
      ORDER BY p.purchase_order_id DESC
    `;

    const rows = await customSelectSqlQuery(sql);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No purchase orders found for this project and site",
      });
    }

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });

  } catch (err) {
    console.error("getPurchaseOrdersByProjectAndSite Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error",
      error: err.message 
    });
  }
}


}

module.exports = new purchaseOrderController();
