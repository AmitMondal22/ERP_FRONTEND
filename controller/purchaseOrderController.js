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
 

//   async createPurchaseOrder(req, res) {
//   try {
//     const {
//       vendor_id,
//       project_id,
//       project_site_id,
//       date,
//       delivery_date,
//       remarks,
//       total_amount,
//       products = [],
//     } = req.body;

//     if (!vendor_id) {
//       return res.status(400).json({
//         success: false,
//         message: "vendor_id is required",
//       });
//     }
// //purchase-order/edit/6
//    const created_by = req.user.id;
// const updated_by = req.user.id;


//     const po_no = await generatePoId();

//     const poData = {
//       po_no,
//       vendor_id,
//       project_id: project_id || null,
//       project_site_id: project_site_id || null,
//       date,
//       delivery_date,
//       remarks,
//       total_amount,
//       created_by,
//       updated_by,
//       created_at: now,
//       updated_at: now,
//     };

//     const purchase_order_id = await insertData(
//       "td_purchase_order",
//       poData
//     );

//     // Products
//     for (const p of products) {
//       await insertData("td_purchase_order_product", {
//         purchase_order_id,
//         product_id: p.product_id,
//         quantity: p.quantity,
//         unit_price: p.unit_price,
//         created_by,
//         created_at: now,
//         updated_at: now,
//       });
//     }

//     res.json({
//       success: true,
//       message: "Purchase order created successfully",
//       purchase_order_id,
//       po_no,
//     });

//   } catch (err) {
//     console.error("createPurchaseOrder Error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// }

async createPurchaseOrder(req, res) {
  try {
    const {
      vendor_id,
      project_id,
      project_site_id,
      date,
      delivery_date,
      remarks,
      total_amount,      // ✅ COMING FROM UI
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

    // 2️⃣ Insert into td_purchase_order
    const purchase_order_id = await insertData("td_purchase_order", {
      po_no,
      vendor_id,
      project_id: project_id || null,
      project_site_id: project_site_id || null,
      date,
      delivery_date,
      remarks,
      total_amount,   // ✅ STORED AS RECEIVED
      created_by,
      updated_by,
      created_at: now,
      updated_at: now,
    });

    // 3️⃣ Insert Products
    for (const p of products) {
      await insertData("td_purchase_order_product", {
        purchase_order_id,
        product_id: p.product_id,
        gst_rate: p.gst_rate || 18,
        quantity: p.quantity,
        unit_price: p.unit_price,
        unit_id: p.unit_id || null,
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
      total_amount,   // echoed back
    });

  } catch (err) {
    console.error("createPurchaseOrder Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}



/////////////////////////////////////////////////////////

// async getAllPurchaseOrders(req, res) {
//   try {
//     const sql = `
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
//         p.total_amount,
//         p.created_at,
//         p.updated_at,

//         pp.purchase_order_product_id,
//         pp.product_id,
//         pp.quantity,
//         pp.unit_price,

//         mp.product_name,
//         pt.product_type_name

//       FROM td_purchase_order p
//       LEFT JOIN md_vendor v ON p.vendor_id = v.vendor_id
//       LEFT JOIN md_project pr ON p.project_id = pr.project_id
//       LEFT JOIN md_project_site ps ON p.project_site_id = ps.project_site_id
//       LEFT JOIN td_purchase_order_product pp ON p.purchase_order_id = pp.purchase_order_id
//       LEFT JOIN md_product mp ON pp.product_id = mp.product_id
//       LEFT JOIN md_product_type pt ON mp.product_type_id = pt.product_type_id
//       ORDER BY p.purchase_order_id DESC
//     `;

//     const rows = await customSelectSqlQuery(sql);

//     // -----------------------------
//     // GROUPING IN NODE.JS
//     // -----------------------------
//     const grouped = {};

//     for (let row of rows) {
//       if (!grouped[row.purchase_order_id]) {
//         grouped[row.purchase_order_id] = {
//           purchase_order_id: row.purchase_order_id,
//           po_no: row.po_no,
//           vendor_id: row.vendor_id,
//           vendor_name: row.vendor_name,

//           project_id: row.project_id,
//           project_name: row.project_name,

//           project_site_id: row.project_site_id,
//           project_site_name: row.project_site_name,

//           date: row.date,
//           delivery_date: row.delivery_date,
//           remarks: row.remarks,
//           total_amount: row.total_amount,
//           created_at: row.created_at,
//           updated_at: row.updated_at,

//           products: [],
//         };
//       }

//       if (row.purchase_order_product_id) {
//         grouped[row.purchase_order_id].products.push({
//           purchase_order_product_id: row.purchase_order_product_id,
//           product_id: row.product_id,
//           product_name: row.product_name,
//           product_type_name: row.product_type_name,
//           quantity: row.quantity,
//           unit_price: row.unit_price,
//         });
//       }
//     }

//     res.json({
//       success: true,
//       count: Object.keys(grouped).length,
//       data: Object.values(grouped),
//     });

//   } catch (err) {
//     console.error("getAllPurchaseOrders Error:", err);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// }


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






// --------------------------------------------------
// GET ONE PO BY ID
// --------------------------------------------------


async getPurchaseOrderById(req, res) {
  try {
    const { id } = req.params;

    // ---------------------------
    // PURCHASE ORDER
    // ---------------------------
    // const poSql = `
    //   SELECT 
    //     p.purchase_order_id,
    //     p.po_no,
    //     p.vendor_id,
    //     v.vendor_name,
    //     p.project_id,
    //     pr.project_name,
    //     p.project_site_id,
    //     ps.project_site_name,
    //     p.date,
    //     p.delivery_date,
    //     p.remarks,
    //     p.total_amount,
    //     p.created_at,
    //     p.updated_at
    //   FROM td_purchase_order p
    //   LEFT JOIN md_vendor v ON p.vendor_id = v.vendor_id
    //   LEFT JOIN md_project pr ON p.project_id = pr.project_id
    //   LEFT JOIN md_project_site ps ON p.project_site_id = ps.project_site_id
    //   WHERE p.purchase_order_id = ${id}
    // `;

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
    // PRODUCTS
    // ---------------------------
    // const productSql = `
    //   SELECT
    //     pp.purchase_order_product_id,
    //     pp.product_id,
    //     mp.product_name,
    //     pt.product_type_id,
    //     pt.product_type_name,
    //     pp.quantity,
    //     pp.unit_price
    //   FROM td_purchase_order_product pp
    //   LEFT JOIN md_product mp ON pp.product_id = mp.product_id
    //   LEFT JOIN md_product_type pt ON mp.product_type_id = pt.product_type_id
    //   WHERE pp.purchase_order_id = ${id}
    // `;


    const productSql = `
  SELECT
    pp.purchase_order_product_id,
    pp.product_id,
    mp.product_name,
    pt.product_type_id,
    pt.product_type_name,
    pp.quantity,
    pp.unit_price,
    pp.gst_rate        -- ✅ added
  FROM td_purchase_order_product pp
  LEFT JOIN md_product mp ON pp.product_id = mp.product_id
  LEFT JOIN md_product_type pt ON mp.product_type_id = pt.product_type_id
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
  
  // async updatePurchaseOrder(req, res) {
  //   try {
  //     const { id } = req.params;

  //     const {
  //       vendor_id,
  //       date,
  //       delivery_date,
  //       remarks,
  //       total_amount,
  //       updated_by,
  //       products,
  //     } = req.body;

  //     const existing = await selectOneData(
  //       "td_purchase_order",
  //       "*",
  //       `purchase_order_id=${id}`
  //     );

  //     if (!existing) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "Purchase order not found",
  //       });
  //     }

  //     const updateObj = {
  //       vendor_id,
  //       date,
  //       delivery_date,
  //       remarks,
  //       total_amount,
  //       updated_by,
  //       updated_at: now,
  //     };

  //     await updateData("td_purchase_order", updateObj, `purchase_order_id=${id}`);

  //     // Delete old products
  //     await deleteData("td_purchase_order_product", `purchase_order_id=${id}`);

  //     // Insert updated products
  //     if (products && products.length > 0) {
  //       for (let p of products) {
  //         await insertData("td_purchase_order_product", {
  //           purchase_order_id: id,
  //           product_id: p.product_id,
  //           quantity: p.quantity,
  //           unit_price: p.unit_price,
  //           created_by: updated_by,
  //           created_at: now,
  //           updated_at: now,
  //         });
  //       }
  //     }

  //     res.json({
  //       success: true,
  //       message: "Purchase order updated successfully",
  //     });

  //   } catch (err) {
  //     console.error("updatePurchaseOrder Error:", err);
  //     res.status(500).json({ success: false, message: "Internal Server Error" });
  //   }
  // }



  async updatePurchaseOrder(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false });
    }

    const {
      vendor_id,
      project_id,
      project_site_id,
      date,
      delivery_date,
      remarks,
      total_amount,
      products = [],
    } = req.body;

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
    // ---------------------------
    // UPDATE PO
    // ---------------------------
    const updateObj = {
      vendor_id,
      project_id: project_id || null,
      project_site_id: project_site_id || null,
      date,
      delivery_date,
      remarks,
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
    // REPLACE PRODUCTS
    // ---------------------------
    await deleteData(
      "td_purchase_order_product",
      `purchase_order_id=${id}`
    );

    if (products.length > 0) {
      const rows = products.map(p => ({
        purchase_order_id: id,
        product_id: p.product_id,
        quantity: p.quantity,
        unit_price: p.unit_price,
        created_by: updated_by,
        created_at: now,
        updated_at: now,
      }));

      await batchInsertData(
        "td_purchase_order_product",
        "purchase_order_id, product_id, quantity, unit_price, created_by, created_at, updated_at",
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
}

module.exports = new purchaseOrderController();
