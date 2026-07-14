const {
   insertData,
   batchInsertData,
   customSelectSqlQuery,
   customSelectSqlQuery2,
   updateData, 
   deleteData,selectOneData,selectData} = require("../models/MasterModel");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const now = dayjs.utc().format("YYYY-MM-DD HH:mm:ss");
const connect = require("../DBConfig/db");
const date = new Date();


class PurchaseProductController {

  // createPurchase = async (req, res) => {
  //   const {
  //     project_id,
  //     site_id,
  //     vendor_id,
  //     stor_id,
  //     purchase_order_id,
  //     invoice_no,
  //     invoice_date,
  //     delivery_date,
  //     due_date,
  //     invoice_image_path,
  //     transport_insurance,
  //     remarks,
  //     created_by,
  //     purchase_product,
  //   } = req.body;

  //   let connection;
  //   try {
  //     // Prepare data for td_purchase
  //     const purchaseData = {
  //       project_id,
  //       site_id,
  //       vendor_id,
  //       stor_id: stor_id , 
  //       purchase_order_id: purchase_order_id ,
  //       invoice_no,
  //       invoice_date,
  //       delivery_date,
  //       due_date,
  //       invoice_image: invoice_image_path || null,  // Now receives the path
  //       transport_insurance: transport_insurance || null,
  //       remarks: remarks || null,
  //       created_by,
  //       created_at: new Date(),
  //       updated_at: new Date(),
  //     };

  //     // Insert into td_purchase
  //     const purchase_id = await insertData(
  //       "td_purchase",
  //       purchaseData,
  //       connection
  //     );

  //     // Prepare data for td_purchase_product using async map
  //     const productValues = await Promise.all(
  //       purchase_product.map(async (product) => {
  //         return {
  //           purchase_id,
  //           product_id: product.product_id,
  //           product_qty: product.product_qty,
  //           invoice_qty: product.invoice_qty,
  //           unit_rate: product.unit_rate,
  //            return_id: product.return_id || null,
  //           discount_rate: product.discount_rate ?? 0,
  //           discount_amount: product.discount_amount ?? 0,
  //           sgst_rate: product.sgst_rate ?? 0,
  //           cgst_rate: product.cgst_rate ?? 0,
  //           igst_rate: product.igst_rate ?? 0,
  //           sgst_amt: product.sgst_amt ?? 0,
  //           cgst_amt: product.cgst_amt ?? 0,
  //           igst_amt: product.igst_amt ?? 0,
  //           total_amount: product.total_amount,
  //           make_date: product.make_date || null,
  //           ownership_status: product.ownership_status || null,
  //           created_by: product.created_by,

  //           updated_by: product.created_by,
  //           created_at: new Date(),  //  FIX: Changed from 'now' to new Date()
  //           updated_at: new Date(),  //  FIX: Changed from 'now' to new Date()
  //         };
  //       })
  //     );

  //     // Define columns for batch insert
  //     const productColumns = Object.keys(productValues[0]).join(", ");

  //     // Insert into td_purchase_product
  //     await batchInsertData(
  //       "td_purchase_product",
  //       productColumns,
  //       productValues,
  //       connection
  //     );

  //     //  FIX: Add 'success: true' to match frontend expectations
  //     return res.status(201).json({
  //       success: true, 
  //       message: "Bulk purchase created successfully",
  //       data: {         
  //         purchase_id,
  //         product_count: purchase_product.length,
  //       }
  //     });
  //   } catch (error) {
  //     console.error("Error creating bulk purchase:", error);
  //     //  FIX: Also update error response for consistency
  //     return res.status(500).json({ 
  //       success: false,  //ADD THIS
  //       message: "Internal server error",
  //       error: error.message 
  //     });
  //   }
  // };


////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////

createPurchase = async (req, res) => {
  const {
    project_id,
    site_id,
    vendor_id,
    stor_id,
    purchase_order_id,
    invoice_no,
    invoice_date,
    delivery_date,
    due_date,
    invoice_image_path,
    transport_insurance,
    remarks,
    created_by,
    purchase_product,
  } = req.body;

  let connection;

  try {
    /* ---------- BASIC VALIDATION ---------- */
    if (
      !project_id ||
      !site_id ||
      !vendor_id ||
      !invoice_no ||
      !Array.isArray(purchase_product) ||
      !purchase_product.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    connection = await connect();
    await connection.beginTransaction();

    /* ---------- td_purchase ---------- */
    const purchase_id = await insertData("td_purchase", {
      project_id,
      site_id,
      vendor_id,
      stor_id,
      purchase_order_id,
      invoice_no,
      invoice_date,
      delivery_date,
      due_date,
      invoice_image: invoice_image_path || null,
     // transport_insurance: transport_insurance || null,
     transport_insurance:
    transport_insurance === "Yes" ? "Y" : "N",

      remarks: remarks || null,
      created_by,
      update_by: created_by,
      created_at: new Date(),
      updated_at: new Date(),
    });
 
    /* ---------- td_purchase_product ---------- */
    const productRows = purchase_product.map(p => ({
      purchase_id,
      product_id: p.product_id,
      product_qty: p.product_qty,
      invoice_qty: p.invoice_qty,
      unit_rate: p.unit_rate,
      discount_rate: p.discount_rate || 0,
      discount_amount: p.discount_amount || 0,
      sgst_rate: p.sgst_rate || 0, 
      cgst_rate: p.cgst_rate || 0,
      igst_rate: p.igst_rate || 0,
      sgst_amt: p.sgst_amt || 0,
      cgst_amt: p.cgst_amt || 0,
      igst_amt: p.igst_amt || 0,
      total_amount: p.total_amount,
      return_id: p.return_id || null,
      make_date: p.make_date || null,
      ownership_status: p.ownership_status || null,
      created_by,
      updated_by: created_by,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await batchInsertData(
      "td_purchase_product",
      Object.keys(productRows[0]).join(", "),
      productRows
    );

    /* ---------- tx_current_stock (UPSERT) ---------- */
    for (const p of purchase_product) {
      await connection.execute(
        `INSERT INTO tx_current_stock
         (project_id, site_id, product_id, store_id, invoice_qty, created_by, updated_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE
           invoice_qty = invoice_qty + VALUES(invoice_qty),
           updated_by = VALUES(updated_by),
           updated_at = NOW()`,
        [
          project_id,
          site_id,
          p.product_id,
          stor_id,
          p.invoice_qty,
          created_by,
          created_by,
        ]
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Purchase created and stock updated successfully",
      data: { purchase_id },
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("createPurchase error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Error",
      error: error.message,
    });
  } finally {
    if (connection) await connection.end();
  }
};




/////////////////


  allPurchase = async (req, res) => {
    try {
      let { search, fromDate, toDate } = req.query;

      // Escape and quote function for values (basic), replace with a proper SQL escape in your environment
      function escapeValue(val) {
        if (!val) return "NULL";
        return `'${val.replace(/'/g, "''")}'`; // basic single quote escape for SQL
      }

      let sql = `
      SELECT
        p.purchase_id,
        p.project_id,
        pr.project_name,
        ps.project_site_name,
        p.site_id,
        
        p.vendor_id,
        v.vendor_name,
        p.stor_id,
        s.store_name,
        p.purchase_order_id,
       po.po_no,
      
        p.invoice_no,
        p.invoice_date,
        p.delivery_date,
        p.invoice_image,
        p.transport_insurance,
        p.remarks,
        p.created_by,
        p.update_by,
        p.created_at,
        p.updated_at
      FROM td_purchase AS p
      JOIN md_project AS pr ON p.project_id = pr.project_id
      JOIN md_project_site AS ps ON p.site_id = ps.project_site_id
      JOIN md_vendor AS v ON p.vendor_id = v.vendor_id
      LEFT JOIN md_store AS s ON p.stor_id = s.store_id
      LEFT JOIN td_purchase_order AS po ON p.purchase_order_id = po.purchase_order_id
    `;

      const whereClauses = [];

      if (search) {
        const escapedSearch = `%${search.replace(/'/g, "''")}%`;
        whereClauses.push(`(
        pr.project_name LIKE '${escapedSearch}' OR
        ps.project_site_name LIKE '${escapedSearch}' OR
        v.vendor_name LIKE '${escapedSearch}' OR
        s.store_name LIKE '${escapedSearch}' OR
        po.po_no LIKE '${escapedSearch}' OR
        p.invoice_no LIKE '${escapedSearch}'
      )`);
      }

      if (fromDate && toDate) {
        whereClauses.push(
          `p.invoice_date BETWEEN '${fromDate}' AND '${toDate}'`
        );
      }

      if (whereClauses.length > 0) {
        sql += ` WHERE ${whereClauses.join(" AND ")}`;
      }

      sql += " ORDER BY p.purchase_id DESC";
      //console.log(sql)
      const results = await customSelectSqlQuery(sql);

      res.status(200).json({
        status: "success",
        data: results,
        total: results.length,
      });
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  };

//////////////////////////////////////////////////////////////////
  allProductPurchase = async (req, res) => {
    try {
      let { search, fromDate, toDate } = req.query;

      function escapeValue(val) {
        if (!val) return "NULL";
        return `'${val.replace(/'/g, "''")}'`;
      }

      let sql = `
      SELECT
        p.purchase_id,
        p.project_id,
        pr.project_name,
        ps.project_site_name,
        p.site_id,
        
        p.vendor_id,
        v.vendor_name,
        p.stor_id,
        s.store_name,
        p.purchase_order_id,
        po.po_no,
        p.invoice_no,
        p.invoice_date,
        p.delivery_date,
        p.invoice_image,
        p.transport_insurance,
        p.remarks,
        p.created_by,
        p.update_by,
        p.created_at,
        p.updated_at
      FROM td_purchase AS p
      JOIN md_project AS pr ON p.project_id = pr.project_id
      JOIN md_project_site AS ps ON p.site_id = ps.project_site_id
      JOIN md_vendor AS v ON p.vendor_id = v.vendor_id
      LEFT JOIN md_store AS s ON p.stor_id = s.store_id
      LEFT JOIN td_purchase_order AS po ON p.purchase_order_id = po.purchase_order_id
    `;

      const whereClauses = [];

      if (search) {
        const escapedSearch = `%${search.replace(/'/g, "''")}%`;
        whereClauses.push(`(
        pr.project_name LIKE '${escapedSearch}' OR
        ps.project_site_name LIKE '${escapedSearch}' OR
        v.vendor_name LIKE '${escapedSearch}' OR
        s.store_name LIKE '${escapedSearch}' OR
        po.po_no LIKE '${escapedSearch}' OR
        p.invoice_no LIKE '${escapedSearch}'
      )`);
      }

      if (fromDate && toDate) {
        whereClauses.push(
          `p.invoice_date BETWEEN '${fromDate}' AND '${toDate}'`
        );
      }

      if (whereClauses.length > 0) {
        sql += ` WHERE ${whereClauses.join(" AND ")}`;
      }

      sql += " ORDER BY p.purchase_id DESC";

      const purchases = await customSelectSqlQuery(sql);

      // If no purchases found, respond immediately
      if (!purchases.length) {
        return res.status(200).json({
          status: "success",
          data: [],
          total: 0,
        });
      } 

      // Get purchase_ids from result
      const purchaseIds = purchases.map((p) => p.purchase_id);

      // Build query to get purchase products for all purchase_ids
      const purchaseProductSql = `
      SELECT
        purchase_product_id,
        purchase_id,
        product_id,
        product_qty,
        invoice_qty,
        unit_rate,
         return_id: product.return_id || null,  // ⭐ ADDED RETURN_ID
        discount_rate,
        discount_amount,
        sgst_rate,
        cgst_rate,
        igst_rate,
        sgst_amt,
        cgst_amt,
        igst_amt,
        total_amount,
        make_date,
        ownership_status,
        created_by,
        updated_by,
        created_at,
        updated_at
      FROM td_purchase_product
      WHERE purchase_id IN (${purchaseIds.join(",")})
    `;

      const purchaseProducts = await customSelectSqlQuery(purchaseProductSql);

      // Nest purchaseProducts inside each purchase by purchase_id
      const purchaseProductsByPurchaseId = purchaseProducts.reduce(
        (acc, prod) => {
          if (!acc[prod.purchase_id]) acc[prod.purchase_id] = [];
          acc[prod.purchase_id].push(prod);
          return acc;
        },
        {}
      );

      // Attach nested purchaseProducts array to corresponding purchase objects
      const purchasesWithProducts = purchases.map((purchase) => ({
        ...purchase,
        purchase_products:
          purchaseProductsByPurchaseId[purchase.purchase_id] || [],
      }));

      res.status(200).json({
        status: "success",
        data: purchasesWithProducts,
        total: purchasesWithProducts.length,
      });
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  };



getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "purchase_id is required",
      });
    }

    const sql = `
      SELECT
        p.purchase_id,
        p.project_id,
        pr.project_name,
        ps.project_site_name,
        p.site_id,
        p.vendor_id,
        v.vendor_name,
        p.stor_id,
        s.store_name,
        p.purchase_order_id,
        po.po_no,       
        p.invoice_no,
        p.invoice_date,
        p.delivery_date,
        p.due_date,
        p.invoice_image,
        p.transport_insurance,
        p.remarks,
        p.created_by,
        p.update_by,
        p.created_at,
        p.updated_at,

        -- Product details
        pp.purchase_product_id,
        pp.product_id,
        pn.product_name,
        pn.hsn_code,           
        pn.product_type_id,
        pt.product_type_name,
        pn.unit_id,
        mu.unit_name,         
        pp.product_qty,
        pp.invoice_qty,
        pp.unit_rate,
        pp.return_id,
        pp.discount_rate,
        pp.discount_amount,
        pp.sgst_rate,
        pp.cgst_rate,
        pp.igst_rate,
        pp.sgst_amt,
        pp.cgst_amt,
        pp.igst_amt,
        pp.total_amount

      FROM td_purchase AS p
      JOIN td_purchase_product AS pp ON p.purchase_id = pp.purchase_id
      LEFT JOIN md_project AS pr ON p.project_id = pr.project_id
      LEFT JOIN md_project_site AS ps ON p.site_id = ps.project_site_id
      JOIN md_vendor AS v ON p.vendor_id = v.vendor_id
      JOIN md_product AS pn ON pp.product_id = pn.product_id
      JOIN md_product_type AS pt ON pn.product_type_id = pt.product_type_id
      LEFT JOIN md_unit AS mu ON pn.unit_id = mu.unit_id   
      LEFT JOIN md_store AS s ON p.stor_id = s.store_id
      LEFT JOIN td_purchase_order AS po ON p.purchase_order_id = po.purchase_order_id

      WHERE p.purchase_id = ${id}
    `;





    const result = await customSelectSqlQuery(sql);

    if (result.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Purchase not found or missing linked data",
      });
    }

    return res.status(200).json({
      status: "success",
      data: result, // 🔥 SAME FORMAT AS BEFORE
    });

  } catch (error) {
    console.error("Error fetching purchase by ID:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};





/////////////////

  // updatePurchase = async (req, res) => {
  //   const purchase_id = req.params.id;

  //   const {
  //     project_id,
  //     site_id,
  //     vendor_id,
  //     stor_id,
  //     purchase_order_id,
  //     invoice_no,
  //     invoice_date,
  //     delivery_date,
  //     invoice_image_path,
  //     transport_insurance,
  //     remarks,
  //     purchase_product,
  //   } = req.body;

  //   let connection;

  //   try {
  //     // Update td_purchase
  //     const purchaseData = {
  //       project_id,
  //       site_id,
  //       vendor_id,
  //       stor_id: stor_id ?? null,
  //       purchase_order_id: purchase_order_id ?? null,
  //       invoice_no,
  //       invoice_date,
  //       delivery_date,
  //       invoice_image: invoice_image_path || null,
  //       transport_insurance: transport_insurance || null,
  //       remarks: remarks || null, 
  //       // updated_by,
  //       // updated_at: new Date(),
  //     };
  //     console.log(purchaseData)
  //     await updateData("td_purchase", purchaseData, `purchase_id = ${purchase_id}`);

  //     // Update td_purchase_product
  //     // You may choose to delete old entries first if complete replacement
  //     await deleteData("td_purchase_product", `purchase_id = ${purchase_id}`);

  //     const productValues = await Promise.all(
  //       purchase_product.map(async (product) => {
  //         return {
  //           purchase_id,
  //           product_id: product.product_id,
  //           product_qty: product.product_qty,
  //           invoice_qty: product.invoice_qty,
  //           unit_rate: product.unit_rate,
  //            return_id: product.return_id || null,  
  //           discount_rate: product.discount_rate ?? 0,
  //           discount_amount: product.discount_amount ?? 0,
  //           sgst_rate: product.sgst_rate ?? 0,
  //           cgst_rate: product.cgst_rate ?? 0,
  //           igst_rate: product.igst_rate ?? 0,
  //           sgst_amt: product.sgst_amt ?? 0,
  //           cgst_amt: product.cgst_amt ?? 0,
  //           igst_amt: product.igst_amt ?? 0,
  //           total_amount: product.total_amount,
  //           make_date: product.make_date || null,
  //           ownership_status: product.ownership_status || null,
  //           // updated_by: updated_by,
  //           // created_at: new Date(),
  //           // updated_at: new Date(),
  //         };
  //       })
  //     );

  //     // Batch insert new products
  //     const productColumns = Object.keys(productValues[0]).join(", ");
  //     await batchInsertData("td_purchase_product", productColumns, productValues, connection);

  //     return res.status(200).json({
  //       success: true,
  //       message: "Purchase and products updated successfully",
  //       data: {
  //         purchase_id,
  //         product_count: purchase_product.length,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Error updating purchase:", error);
  //     return res.status(500).json({
  //       success: false,
  //       message: "Internal server error",
  //       error: error.message,
  //     });
  //   }
  // };
//////////


updatePurchase = async (req, res) => {
  const purchase_id = Number(req.params.id);

  const {
    project_id,
    site_id,
    vendor_id,
    stor_id,
    purchase_order_id,
    invoice_no,
    invoice_date,
    delivery_date,
    invoice_image_path,
    transport_insurance,
    remarks,
    purchase_product,
  } = req.body;

  /* ---------------- USER FROM AUTH MIDDLEWARE ---------------- */
  const userId = req.user?.id;   //  MUST come from middleware

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user",
    });
  }

  if (!purchase_id || !Array.isArray(purchase_product)) {
    return res.status(400).json({
      success: false,
      message: "Invalid input data",
    });
  }

  try {
    /* ---------------- SAFE VALUES ---------------- */
    const safeProjectId = project_id ?? null;
    const safeSiteId = site_id ?? null;
    const safeStoreId = stor_id ?? null;

    /* ------------------------------------------------
       1️⃣ GET OLD PURCHASE PRODUCTS
    ------------------------------------------------ */
    const oldProducts = await selectData(
      "td_purchase_product",
      "product_id, invoice_qty",
      `purchase_id = ${purchase_id}`
    );

    /* ------------------------------------------------
       2️⃣ REVERSE OLD STOCK
    ------------------------------------------------ */
    for (const old of oldProducts) {
      await customSelectSqlQuery(`
        UPDATE tx_current_stock
        SET invoice_qty = invoice_qty - ${old.invoice_qty ?? 0},
            updated_by = ${userId},
            updated_at = NOW()
        WHERE project_id = ${safeProjectId}
          AND site_id = ${safeSiteId}
          AND product_id = ${old.product_id}
          AND store_id = ${safeStoreId}
      `);
    }

    /* ------------------------------------------------
       3️⃣ UPDATE td_purchase
    ------------------------------------------------ */
    await updateData(
      "td_purchase",
      {
        project_id: safeProjectId,
        site_id: safeSiteId,
        vendor_id: vendor_id ?? null,
        stor_id: safeStoreId,
        purchase_order_id: purchase_order_id ?? null,
        invoice_no,
        invoice_date,
        delivery_date,
        invoice_image: invoice_image_path ?? null,
        transport_insurance: transport_insurance ?? null,
        remarks: remarks ?? null,
        update_by: userId,
        updated_at: new Date(),
      },
      `purchase_id = ${purchase_id}`
    );

    /* ------------------------------------------------
       4️⃣ DELETE OLD PRODUCTS
    ------------------------------------------------ */
    await deleteData("td_purchase_product", `purchase_id = ${purchase_id}`);

    /* ------------------------------------------------
       5️⃣ INSERT NEW PRODUCTS
    ------------------------------------------------ */
    const productRows = purchase_product.map(p => ({
      purchase_id,
      product_id: p.product_id,
      product_qty: p.product_qty,
      invoice_qty: p.invoice_qty,
      unit_rate: p.unit_rate,
      return_id: p.return_id ?? null,
      discount_rate: p.discount_rate ?? 0,
      discount_amount: p.discount_amount ?? 0,
      sgst_rate: p.sgst_rate ?? 0,
      cgst_rate: p.cgst_rate ?? 0,
      igst_rate: p.igst_rate ?? 0,
      sgst_amt: p.sgst_amt ?? 0,
      cgst_amt: p.cgst_amt ?? 0,
      igst_amt: p.igst_amt ?? 0,
      total_amount: p.total_amount,
      make_date: p.make_date ?? null,
      ownership_status: p.ownership_status ?? null,
      created_by: userId,
      updated_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const productColumns = Object.keys(productRows[0]).join(", ");
    await batchInsertData("td_purchase_product", productColumns, productRows);

    /* ------------------------------------------------
       6️⃣ APPLY NEW STOCK
    ------------------------------------------------ */
    for (const p of purchase_product) {
      await customSelectSqlQuery(`
        INSERT INTO tx_current_stock
          (project_id, site_id, product_id, store_id, invoice_qty, created_by, updated_by, created_at, updated_at)
        VALUES
          (${safeProjectId}, ${safeSiteId}, ${p.product_id}, ${safeStoreId},
           ${p.invoice_qty ?? 0}, ${userId}, ${userId}, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          invoice_qty = invoice_qty + ${p.invoice_qty ?? 0},
          updated_by = ${userId},
          updated_at = NOW()
      `);
    }

    return res.status(200).json({
      success: true,
      message: "Purchase updated and stock adjusted successfully",
      data: {
        purchase_id,
        product_count: purchase_product.length,
      },
    });

  } catch (error) {
    console.error("Error updating purchase:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};



///////////

//////////////

// getPurchaseByProductAndDate = async (req, res) => {
//   try {
//     const { id: product_id } = req.params;
//     const { fromDate, toDate } = req.body;

//     if (!product_id || !fromDate || !toDate) {
//       return res.status(400).json({
//         success: false,
//         message: "product_id, fromDate and toDate are required",
//       });
//     }

//     const sql = `
//   SELECT
//     p.purchase_id,
//     p.invoice_no,
//     DATE(p.invoice_date) AS invoice_date,
//     DATE(p.delivery_date) AS delivery_date,
//     p.invoice_image,
//     p.transport_insurance,
//     p.remarks,

//     p.project_id,
//     pr.project_name,

//     p.site_id,
//     ps.project_site_name,

//     p.vendor_id,
//     v.vendor_name,

//     p.stor_id,
//     s.store_name,

//     p.purchase_order_id,
//     po.po_no,
//     po.total_amount,

//     pop.purchase_order_product_id,
//     pop.product_id,
//     prod.product_name,
//     prod.product_type_id,

//     pop.quantity,
//     pop.unit_price,

//     DATE(pop.created_at) AS purchase_date,
//     pop.created_at,
//     pop.updated_at

//   FROM td_purchase p

//   INNER JOIN td_purchase_order po
//     ON p.purchase_order_id = po.purchase_order_id

//   INNER JOIN td_purchase_order_product pop
//     ON po.purchase_order_id = pop.purchase_order_id

//   INNER JOIN md_product prod
//     ON pop.product_id = prod.product_id

//   LEFT JOIN md_project pr
//     ON p.project_id = pr.project_id

//   LEFT JOIN md_project_site ps
//     ON p.site_id = ps.project_site_id

//   LEFT JOIN md_vendor v
//     ON p.vendor_id = v.vendor_id

//   LEFT JOIN md_store s
//     ON p.stor_id = s.store_id

//   WHERE
//     pop.product_id = ${Number(product_id)}
//     AND DATE(pop.created_at)
//       BETWEEN '${fromDate}' AND '${toDate}'

//   ORDER BY pop.created_at DESC
// `;


//     const results = await customSelectSqlQuery(sql);

//     return res.status(200).json({
//       success: true,
//       total: results.length,
//       data: results,
//     });

//   } catch (error) {
//     console.error("Error fetching product purchase history:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
///////////


getPurchaseByProductAndDate = async (req, res) => {
  try {
    const { id: product_id } = req.params;
    const { fromDate, toDate } = req.body;

    if (!product_id || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "product_id, fromDate and toDate are required",
      });
    }

    const sql = `
      SELECT
        p.purchase_id,
        p.invoice_no,
        DATE(p.invoice_date) AS invoice_date,
        DATE(p.delivery_date) AS delivery_date,
        p.invoice_image,
        p.transport_insurance,
        p.remarks,

        p.project_id,
        pr.project_name,

        p.site_id,
        ps.project_site_name,

        p.vendor_id,
        v.vendor_name,

        p.stor_id,
        s.store_name,

        p.purchase_order_id,
        po.po_no,
        po.total_amount AS po_total_amount,

        pp.purchase_product_id,
        pp.product_id,
        prod.product_name,
        prod.product_type_id,

        pp.product_qty,
        pp.invoice_qty,
        pp.unit_rate,
        pp.discount_rate,
        pp.discount_amount,
        pp.sgst_rate,
        pp.cgst_rate,
        pp.igst_rate,
        pp.sgst_amt,
        pp.cgst_amt,
        pp.igst_amt,
        pp.total_amount,
        pp.make_date,
        pp.ownership_status,

        DATE(pp.created_at) AS purchase_date,
        pp.created_at,
        pp.updated_at

      FROM td_purchase_product pp

      INNER JOIN td_purchase p
        ON pp.purchase_id = p.purchase_id

      INNER JOIN md_product prod
        ON pp.product_id = prod.product_id

      LEFT JOIN md_project pr
        ON p.project_id = pr.project_id

      LEFT JOIN md_project_site ps
        ON p.site_id = ps.project_site_id

      LEFT JOIN md_vendor v
        ON p.vendor_id = v.vendor_id

      LEFT JOIN md_store s
        ON p.stor_id = s.store_id

      LEFT JOIN td_purchase_order po
        ON p.purchase_order_id = po.purchase_order_id

      WHERE
        pp.product_id = ${Number(product_id)}
        AND DATE(pp.created_at)
          BETWEEN '${fromDate}' AND '${toDate}'

      ORDER BY pp.created_at DESC
    `;

    const results = await customSelectSqlQuery(sql);

    return res.status(200).json({
      success: true,
      total: results.length,
      data: results,
    });

  } catch (error) {
    console.error("Error fetching product purchase history:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};



//////


getAllThePurchaseData = async (req, res) => {
  try {
    const sql = `
      SELECT
        p.purchase_id,
        p.project_id,              
        pr.project_name,
        ps.project_site_name,
        p.site_id,
        p.vendor_id,
        v.vendor_name,
        p.stor_id,
        s.store_name,
        p.purchase_order_id,
        po.po_no,
       
        p.invoice_no,
        p.invoice_date,
        p.delivery_date,
        p.invoice_image,
        p.transport_insurance,
        p.remarks,
        p.created_by,
        p.update_by,
        p.created_at,
        pp.purchase_product_id,
        pp.product_id,
        pn.product_name,
        pn.product_type_id,
        pt.product_type_name,
        pp.product_qty,
        pp.invoice_qty,
        pp.unit_rate,
        pp.discount_rate,
        pp.discount_amount,
        pp.sgst_rate,
        pp.cgst_rate,
        pp.igst_rate,
        pp.sgst_amt,
        pp.cgst_amt,
        pp.igst_amt,
        pp.total_amount,
        p.updated_at
      FROM td_purchase AS p
        JOIN td_purchase_product AS pp ON p.purchase_id = pp.purchase_id
        LEFT JOIN md_project AS pr ON p.project_id = pr.project_id
        LEFT JOIN md_project_site AS ps ON p.site_id = ps.project_site_id
        JOIN md_vendor AS v ON p.vendor_id = v.vendor_id
        JOIN md_product AS pn ON pp.product_id = pn.product_id
        JOIN md_product_type AS pt ON pn.product_type_id = pt.product_type_id
        LEFT JOIN md_store AS s ON p.stor_id = s.store_id
        LEFT JOIN td_purchase_order AS po ON p.purchase_order_id = po.purchase_order_id
      ORDER BY p.purchase_id DESC
    `;

    const result = await customSelectSqlQuery(sql);

    if (!result || result.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No purchase records found",
      });
    }

    res.status(200).json({
      status: "success",
      data: result,
    });

  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};



deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "purchase_id is required",
      });
    }

    // ----- CHECK IF PURCHASE EXISTS -----
    const checkSql = `SELECT purchase_id FROM td_purchase WHERE purchase_id = ${id}`;
    const exists = await customSelectSqlQuery(checkSql);

    if (exists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    // ----- DELETE PRODUCTS FIRST -----
    await deleteData("td_purchase_product", `purchase_id = ${id}`);

    // ----- DELETE THE MAIN PURCHASE -----
    await deleteData("td_purchase", `purchase_id = ${id}`);

    return res.status(200).json({
      success: true,
      message: "Purchase deleted successfully",
      deleted_id: id,
    });

  } catch (error) {
    console.error("Error deleting purchase:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

////////////////////////////


// getStockMonthwise = async (req, res) => {
//     try {
//       const { project_id, site_id, store_id, product_type_id, fromDate, toDate } = req.body;

//       // Validation
//       if (!project_id || !fromDate || !toDate) {
//         return res.status(400).json({
//           success: false,
//           message: "project_id, fromDate, and toDate are required",
//         });
//       }

//       // Build WHERE clause dynamically
//       let whereConditions = [`p.project_id = ${project_id}`];
      
//       if (site_id) {
//         whereConditions.push(`p.site_id = ${site_id}`);
//       }
      
//       if (store_id) {
//         whereConditions.push(`p.stor_id = ${store_id}`);
//       }
      
//       if (product_type_id) {
//         whereConditions.push(`prod.product_type_id = ${product_type_id}`);
//       }
      
//       whereConditions.push(`DATE(pp.created_at) BETWEEN '${fromDate}' AND '${toDate}'`);

//       const whereClause = whereConditions.join(' AND ');

//       // Main query with complete product details from md_product (WITHOUT md_uom)
//       const sql = `
//         SELECT
//           DATE_FORMAT(pp.created_at, '%Y-%m') AS month_year,
//           YEAR(pp.created_at) AS year,
//           MONTH(pp.created_at) AS month,
//           MONTHNAME(pp.created_at) AS month_name,
          
//           -- Project Details
//           p.project_id,
//           pr.project_name,
          
//           -- Site Details (optional)
//           ${site_id ? 'p.site_id,' : 'NULL AS site_id,'}
//           ${site_id ? 'ps.project_site_name,' : 'NULL AS project_site_name,'}
          
//           -- Store Details (optional)
//           ${store_id ? 'p.stor_id AS store_id,' : 'NULL AS store_id,'}
//           ${store_id ? 'st.store_name,' : 'NULL AS store_name,'}
          
//           -- Product Type Details
//           pt.product_type_id,
//           pt.product_type_name,
          
//           -- Complete Product Details from md_product
//           prod.product_id,
//           prod.product_name,
//           prod.model_no,
//           prod.unit_id,
//           prod.hsn_code,
//           prod.qty AS product_master_qty,
//           prod.manufacturer_name,
//           prod.product_image,
          
//           -- Unit Details
//           u.unit_name,
          
//           -- Purchase Aggregations
//           COUNT(DISTINCT pp.purchase_id) AS total_purchases,
//           SUM(pp.product_qty) AS total_product_qty,
//           SUM(pp.invoice_qty) AS total_invoice_qty,
//           MAX(pp.invoice_qty) AS max_stock_qty,
//           MIN(pp.invoice_qty) AS min_stock_qty,
          
//           -- Pricing Metrics
//           AVG(pp.unit_rate) AS avg_unit_rate,
//           MIN(pp.unit_rate) AS min_unit_rate,
//           MAX(pp.unit_rate) AS max_unit_rate,
          
//           -- Financial Aggregations
//           SUM(pp.discount_amount) AS total_discount,
//           SUM(pp.sgst_amt) AS total_sgst,
//           SUM(pp.cgst_amt) AS total_cgst,
//           SUM(pp.igst_amt) AS total_igst,
//           SUM(pp.total_amount) AS total_amount,
          
//           -- Date Information
//           MIN(pp.created_at) AS first_purchase_date,
//           MAX(pp.created_at) AS last_purchase_date
          
//         FROM td_purchase_product pp
        
//         INNER JOIN td_purchase p 
//           ON pp.purchase_id = p.purchase_id
          
//         INNER JOIN md_product prod 
//           ON pp.product_id = prod.product_id
          
//         INNER JOIN md_product_type pt 
//           ON prod.product_type_id = pt.product_type_id
          
//         INNER JOIN md_project pr 
//           ON p.project_id = pr.project_id
          
//         LEFT JOIN md_unit u
//           ON prod.unit_id = u.unit_id
          
//         ${site_id ? 'INNER JOIN md_project_site ps ON p.site_id = ps.project_site_id' : ''}
        
//         ${store_id ? 'INNER JOIN md_store st ON p.stor_id = st.store_id' : ''}
        
//         WHERE ${whereClause}
        
//         GROUP BY 
//           YEAR(pp.created_at),
//           MONTH(pp.created_at),
//           pt.product_type_id,
//           prod.product_id,
//           p.project_id
//           ${site_id ? ', p.site_id' : ''}
//           ${store_id ? ', p.stor_id' : ''}
          
//         ORDER BY 
//           year DESC,
//           month DESC,
//           pt.product_type_name ASC,
//           prod.product_name ASC
//       `;

//       const results = await customSelectSqlQuery(sql);

//       // Structure response by month and material type
//       const structuredData = this.structureMonthwiseData(results);

//       return res.status(200).json({
//         success: true,
//         message: "Month-wise stock data fetched successfully",
//         filters: {
//           project_id,
//           site_id: site_id || "All Sites",
//           store_id: store_id || "All Stores",
//           product_type_id: product_type_id || "All Product Types",
//           fromDate,
//           toDate,
//         },
//         total_records: results.length,
//         total_months: structuredData.length,
//         data: structuredData,
//       });

//     } catch (error) {
//       console.error("Error fetching month-wise stock:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: error.message,
//       });
//     }
//   };


//   /**
//    * Helper function to structure data by month and material type
//    */
//   structureMonthwiseData(results) {
//     const monthlyData = {};

//     results.forEach(row => {
//       const monthKey = row.month_year;
      
//       // Initialize month if not exists
//       if (!monthlyData[monthKey]) {
//         monthlyData[monthKey] = {
//           month_year: row.month_year,
//           year: row.year,
//           month: row.month,
//           month_name: row.month_name,
//           project_id: row.project_id,
//           project_name: row.project_name,
//           site_id: row.site_id,
//           project_site_name: row.project_site_name,
//           store_id: row.store_id,
//           store_name: row.store_name,
//           material_types: {},
//           month_summary: {
//             total_amount: 0,
//             total_qty: 0,
//             total_purchases: 0,
//             unique_products: 0,
//           }
//         };
//       }

//       const materialTypeKey = row.product_type_id;
      
//       // Initialize material type if not exists
//       if (!monthlyData[monthKey].material_types[materialTypeKey]) {
//         monthlyData[monthKey].material_types[materialTypeKey] = {
//           product_type_id: row.product_type_id,
//           product_type_name: row.product_type_name,
//           products: [],
//           material_summary: {
//             total_amount: 0,
//             total_qty: 0,
//             max_stock: 0,
//             product_count: 0,
//           }
//         };
//       }

//       // Build product data with all details from md_product (without uom)
//       const productData = {
//         // Product Master Details
//         product_id: row.product_id,
//         product_name: row.product_name,
//         model_no: row.model_no,
//         hsn_code: row.hsn_code,
//         manufacturer_name: row.manufacturer_name,
//         product_image: row.product_image,
//         product_master_qty: row.product_master_qty,
        
//         // Unit Details
//         unit_id: row.unit_id,
//         unit_name: row.unit_name,
        
//         // Purchase Statistics
//         total_purchases: row.total_purchases,
//         total_product_qty: row.total_product_qty,
//         total_invoice_qty: row.total_invoice_qty,
//         max_stock_qty: row.max_stock_qty,
//         min_stock_qty: row.min_stock_qty,
        
//         // Pricing
//         avg_unit_rate: parseFloat(row.avg_unit_rate || 0).toFixed(2),
//         min_unit_rate: parseFloat(row.min_unit_rate || 0).toFixed(2),
//         max_unit_rate: parseFloat(row.max_unit_rate || 0).toFixed(2),
        
//         // Financial Details
//         total_discount: parseFloat(row.total_discount || 0).toFixed(2),
//         total_sgst: parseFloat(row.total_sgst || 0).toFixed(2),
//         total_cgst: parseFloat(row.total_cgst || 0).toFixed(2),
//         total_igst: parseFloat(row.total_igst || 0).toFixed(2),
//         total_amount: parseFloat(row.total_amount || 0).toFixed(2),
        
//         // Date Range
//         first_purchase_date: row.first_purchase_date,
//         last_purchase_date: row.last_purchase_date,
//       };

//       // Add product to material type
//       monthlyData[monthKey].material_types[materialTypeKey].products.push(productData);
      
//       // Update material type summary
//       const materialSummary = monthlyData[monthKey].material_types[materialTypeKey].material_summary;
//       materialSummary.total_amount += parseFloat(row.total_amount || 0);
//       materialSummary.total_qty += parseInt(row.total_invoice_qty || 0);
//       materialSummary.max_stock = Math.max(materialSummary.max_stock, parseInt(row.max_stock_qty || 0));
//       materialSummary.product_count += 1;
      
//       // Update month summary
//       const monthSummary = monthlyData[monthKey].month_summary;
//       monthSummary.total_amount += parseFloat(row.total_amount || 0);
//       monthSummary.total_qty += parseInt(row.total_invoice_qty || 0);
//       monthSummary.total_purchases += parseInt(row.total_purchases || 0);
//       monthSummary.unique_products += 1;
//     });

//     // Convert to array and format
//     return Object.values(monthlyData).map(month => ({
//       ...month,
//       material_types: Object.values(month.material_types).map(mt => ({
//         ...mt,
//         material_summary: {
//           ...mt.material_summary,
//           total_amount: parseFloat(mt.material_summary.total_amount).toFixed(2),
//         }
//       })),
//       month_summary: {
//         ...month.month_summary,
//         total_amount: parseFloat(month.month_summary.total_amount).toFixed(2),
//       }
//     }));
//   }


/////////////////////////////////////////////////






   


// getStockMonthwise = async (req, res) => {
//   try {
//     const { project_id, site_id, store_id, product_type_id, fromDate, toDate } = req.body;

//     if (!project_id || !fromDate || !toDate) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id, fromDate, and toDate are required",
//       });
//     }

//     const conditions = ['p.project_id = ?'];
//     const params = [project_id];

//     if (site_id) {
//       conditions.push('p.site_id = ?');
//       params.push(site_id);
//     }

//     if (store_id) {
//       conditions.push('p.stor_id = ?');
//       params.push(store_id);
//     }

//     if (product_type_id) {
//       conditions.push('prod.product_type_id = ?');
//       params.push(product_type_id);
//     }

//     conditions.push('DATE(pp.created_at) BETWEEN ? AND ?');
//     params.push(fromDate, toDate);

//     const whereClause = conditions.join(' AND ');

//     // NOTE: Every non-aggregated column in SELECT is now either part of
//     // GROUP BY or wrapped in ANY_VALUE(). This avoids ER_WRONG_FIELD_WITH_GROUP
//     // errors on servers running with ONLY_FULL_GROUP_BY enabled (default on
//     // MySQL 5.7.5+ and most managed/production DB instances).
//     const sql = `
//       SELECT
//         DATE_FORMAT(pp.created_at, '%d/%m/%Y') AS purchase_date,

//         p.project_id,
//         ANY_VALUE(pr.project_name) AS project_name,
//         p.site_id,
//         ANY_VALUE(ps.project_site_name) AS project_site_name,
//         p.stor_id AS store_id,
//         ANY_VALUE(st.store_name) AS store_name,

//         pt.product_type_id,
//         ANY_VALUE(pt.product_type_name) AS product_type_name,

//         prod.product_id,
//         ANY_VALUE(prod.product_name) AS product_name,
//         ANY_VALUE(prod.model_no) AS model_no,
//         ANY_VALUE(prod.unit_id) AS unit_id,
//         ANY_VALUE(prod.hsn_code) AS hsn_code,
//         ANY_VALUE(prod.manufacturer_name) AS manufacturer_name,
//         ANY_VALUE(prod.product_image) AS product_image,

//         ANY_VALUE(u.unit_name) AS unit_name,

//         SUM(pp.invoice_qty) AS total_qty,
//         SUM(pp.total_amount) AS total_amount

//       FROM td_purchase_product pp
//       INNER JOIN td_purchase p ON pp.purchase_id = p.purchase_id
//       INNER JOIN md_product prod ON pp.product_id = prod.product_id
//       INNER JOIN md_product_type pt ON prod.product_type_id = pt.product_type_id
//       INNER JOIN md_project pr ON p.project_id = pr.project_id
//       LEFT JOIN md_unit u ON prod.unit_id = u.unit_id
//       LEFT JOIN md_project_site ps ON p.site_id = ps.project_site_id
//       LEFT JOIN md_store st ON p.stor_id = st.store_id

//       WHERE ${whereClause}

//       GROUP BY
//         pt.product_type_id, prod.product_id,
//         p.project_id, p.site_id, p.stor_id, DATE(pp.created_at)

//       ORDER BY pp.created_at DESC, pt.product_type_name ASC, prod.product_name ASC
//     `;

//     const results = await customSelectSqlQuery2(sql, params);

//     return res.status(200).json({
//       success: true,
//       message: "Stock data fetched successfully",
//       report_period: `${fromDate} to ${toDate}`,
//       total_records: results.length,
//       data: results.map(row => ({
//         purchase_date: row.purchase_date,
//         project_id: row.project_id,
//         project_name: row.project_name,
//         site_id: row.site_id,
//         site_name: row.project_site_name,
//         store_id: row.store_id,
//         store_name: row.store_name,
//         product_id: row.product_id,
//         product_name: row.product_name,
//         product_type: row.product_type_name,
//         model_no: row.model_no,
//         hsn_code: row.hsn_code,
//         manufacturer: row.manufacturer_name,
//         image: row.product_image,
//         unit: row.unit_name,
//         qty: parseFloat(row.total_qty || 0),
//         amount: parseFloat(row.total_amount || 0).toFixed(2)
//       }))
//     });

//   } catch (error) {
//     // Log full DB-level error detail server-side so prod failures are
//     // actually diagnosable (mysql2 attaches sqlMessage/code/sql to the error).
//     console.error("Stock data fetch error:", {
//       message: error.message,
//       code: error.code,
//       sqlMessage: error.sqlMessage,
//       sql: error.sql,
//       stack: error.stack,
//     });

//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch stock data. Please try again later.",
//       // Only exposed outside production so you can debug quickly without
//       // leaking DB internals to end users in prod.
//       ...(process.env.NODE_ENV !== 'production' && {
//         debug: error.sqlMessage || error.message,
//       }),
//     });
//   }
// };




getStockMonthwise = async (req, res) => {
  try {
    const { project_id, site_id, store_id, product_type_id, fromDate, toDate } = req.body;

    if (!project_id || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "project_id, fromDate, and toDate are required",
      });
    }

    const conditions = ['p.project_id = ?'];
    const params = [project_id];

    if (site_id) {
      conditions.push('p.site_id = ?');
      params.push(site_id);
    }

    if (store_id) {
      conditions.push('p.stor_id = ?');
      params.push(store_id);
    }

    if (product_type_id) {
      conditions.push('prod.product_type_id = ?');
      params.push(product_type_id);
    }

    conditions.push('DATE(pp.created_at) BETWEEN ? AND ?');
    params.push(fromDate, toDate);

    const whereClause = conditions.join(' AND ');

    // Using MAX() instead of ANY_VALUE() intentionally:
    // - Prod (MySQL 8.0.44) runs with ONLY_FULL_GROUP_BY enabled, so every
    //   non-aggregated SELECT column must be wrapped in an aggregate function.
    // - Local (MariaDB 10.4.28) does not reliably support ANY_VALUE().
    // MAX() is supported identically on both and is safe here because each
    // of these columns is functionally dependent on the GROUP BY keys
    // (one true value per group — project_id, site_id, stor_id, product_id, date).

    const sql = `
      SELECT

        MAX(DATE_FORMAT(pp.created_at, '%d/%m/%Y')) AS purchase_date,

        p.project_id,
        MAX(pr.project_name) AS project_name,
        p.site_id,
        MAX(ps.project_site_name) AS project_site_name,
        p.stor_id AS store_id,
        MAX(st.store_name) AS store_name,

        pt.product_type_id,
        MAX(pt.product_type_name) AS product_type_name,

        prod.product_id,
        MAX(prod.product_name) AS product_name,
        MAX(prod.model_no) AS model_no,
        MAX(prod.unit_id) AS unit_id,
        MAX(prod.hsn_code) AS hsn_code,
        MAX(prod.manufacturer_name) AS manufacturer_name,
        MAX(prod.product_image) AS product_image,

        MAX(u.unit_name) AS unit_name,

        SUM(pp.invoice_qty) AS total_qty,
        SUM(pp.total_amount) AS total_amount

      FROM td_purchase_product pp
      INNER JOIN td_purchase p ON pp.purchase_id = p.purchase_id
      INNER JOIN md_product prod ON pp.product_id = prod.product_id
      INNER JOIN md_product_type pt ON prod.product_type_id = pt.product_type_id
      INNER JOIN md_project pr ON p.project_id = pr.project_id
      LEFT JOIN md_unit u ON prod.unit_id = u.unit_id
      LEFT JOIN md_project_site ps ON p.site_id = ps.project_site_id
      LEFT JOIN md_store st ON p.stor_id = st.store_id

       WHERE ${whereClause}

        GROUP BY
        pt.product_type_id, prod.product_id,
        p.project_id, p.site_id, p.stor_id, DATE(pp.created_at)

        ORDER BY DATE(pp.created_at) DESC, pt.product_type_name ASC, prod.product_name ASC
       `;

    const results = await customSelectSqlQuery2(sql, params);

    return res.status(200).json({
      success: true,
      message: "Stock data fetched successfully",
      report_period: `${fromDate} to ${toDate}`,
      total_records: results.length,
      data: results.map(row => ({
        purchase_date: row.purchase_date,
        project_id: row.project_id,
        project_name: row.project_name,
        site_id: row.site_id,
        site_name: row.project_site_name,
        store_id: row.store_id,
        store_name: row.store_name,
        product_id: row.product_id,
        product_name: row.product_name,
        product_type: row.product_type_name,
        model_no: row.model_no,
        hsn_code: row.hsn_code,
        manufacturer: row.manufacturer_name,
        image: row.product_image,
        unit: row.unit_name,
        qty: parseFloat(row.total_qty || 0),
        amount: parseFloat(row.total_amount || 0).toFixed(2)
      }))
    });

  } catch (error) {
    console.error("Stock data fetch error:", {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sql: error.sql,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Unable to fetch stock data. Please try again later.",
      ...(process.env.NODE_ENV !== 'production' && {
        debug: error.sqlMessage || error.message,
      }),
    });
  }
};





 
// /**
//  * Get Purchase Details Month-wise - Complete Financial Analysis with Date Range
//  * Shows all purchase details including taxes, discounts, rates, etc.
//  */
// getPurchaseDetailsMonthwise = async (req, res) => {
//   try {
//     const { project_id, site_id, store_id, product_type_id, fromDate, toDate } = req.body;

//     if (!project_id || !fromDate || !toDate) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id, fromDate, and toDate are required",
//       });
//     }

//     const conditions = ['p.project_id = ?'];
//     const params = [project_id];
    
//     if (site_id) {
//       conditions.push('p.site_id = ?');
//       params.push(site_id);
//     }
    
//     if (store_id) {
//       conditions.push('p.stor_id = ?');
//       params.push(store_id);
//     }
    
//     if (product_type_id) {
//       conditions.push('prod.product_type_id = ?');
//       params.push(product_type_id);
//     }
    
//     conditions.push('DATE(pp.created_at) BETWEEN ? AND ?');
//     params.push(fromDate, toDate);

//     const whereClause = conditions.join(' AND ');

//     const sql = `
//       SELECT
//         DATE_FORMAT(pp.created_at, '%Y-%m') AS month_year,
//         YEAR(pp.created_at) AS year,
//         MONTH(pp.created_at) AS month,
//         MONTHNAME(pp.created_at) AS month_name,
        
//         p.project_id,
//         pr.project_name,
//         p.site_id,
//         ps.project_site_name,
//         p.stor_id AS store_id,
//         st.store_name,
        
//         pt.product_type_id,
//         pt.product_type_name,
        
//         prod.product_id,
//         prod.product_name,
//         prod.model_no,
//         prod.unit_id,
//         prod.hsn_code,
//         prod.manufacturer_name,
//         prod.product_image,
        
//         u.unit_name,
        
//         -- Purchase Statistics
//         COUNT(DISTINCT pp.purchase_id) AS total_purchases,
//         SUM(pp.product_qty) AS total_product_qty,
//         SUM(pp.invoice_qty) AS total_invoice_qty,
        
//         -- Pricing Details
//         AVG(pp.unit_rate) AS avg_unit_rate,
//         MIN(pp.unit_rate) AS min_unit_rate,
//         MAX(pp.unit_rate) AS max_unit_rate,
        
//         -- Financial Breakdown
//         SUM(pp.discount_amount) AS total_discount,
//         SUM(pp.sgst_amt) AS total_sgst,
//         SUM(pp.cgst_amt) AS total_cgst,
//         SUM(pp.igst_amt) AS total_igst,
//         SUM(pp.total_amount) AS total_amount,
        
//         -- Date Range
//         MIN(pp.created_at) AS first_purchase_date,
//         MAX(pp.created_at) AS last_purchase_date,
//         MIN(DATE(pp.created_at)) AS month_first_date,
//         MAX(DATE(pp.created_at)) AS month_last_date
        
//       FROM td_purchase_product pp
//       INNER JOIN td_purchase p ON pp.purchase_id = p.purchase_id
//       INNER JOIN md_product prod ON pp.product_id = prod.product_id
//       INNER JOIN md_product_type pt ON prod.product_type_id = pt.product_type_id
//       INNER JOIN md_project pr ON p.project_id = pr.project_id
//       LEFT JOIN md_unit u ON prod.unit_id = u.unit_id
//       LEFT JOIN md_project_site ps ON p.site_id = ps.project_site_id
//       LEFT JOIN md_store st ON p.stor_id = st.store_id
      
//       WHERE ${whereClause}
      
//       GROUP BY 
//         year, month, pt.product_type_id, prod.product_id, 
//         p.project_id, p.site_id, p.stor_id
        
//       ORDER BY year DESC, month DESC, pt.product_type_name ASC, prod.product_name ASC
//     `;

//     const results = await customSelectSqlQuery2(sql, params);
//     const structuredData = this.structureDetailedPurchaseData(results, fromDate, toDate);

//     // Calculate total days in report
//     const from = new Date(fromDate);
//     const to = new Date(toDate);
//     const totalDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

//     return res.status(200).json({
//       success: true,
//       message: "Detailed purchase data fetched successfully",
//       report_info: {
//         report_type: "Monthly Purchase Details Report",
//         report_period: `${fromDate} to ${toDate}`,
//         date_range: {
//           from: fromDate,
//           to: toDate
//         },
//         generated_at: new Date().toISOString(),
//         total_days: totalDays
//       },
//       filters: {
//         project_id,
//         site_id: site_id || null,
//         store_id: store_id || null,
//         product_type_id: product_type_id || null,
//         fromDate,
//         toDate,
//       },
//       total_records: results.length,
//       total_months: structuredData.length,
//       data: structuredData,
//     });

//   } catch (error) {
//     console.error("Purchase details monthwise error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch purchase details. Please try again later.",
//     });
//   }
// };

// /**
//  * Structure detailed purchase data with all financial information and date ranges
//  */
// structureDetailedPurchaseData(results, fromDate, toDate) {
//   const grouped = results.reduce((acc, row) => {
//     const monthKey = row.month_year;
    
//     if (!acc[monthKey]) {
//       // Calculate if this is a partial month
//       const monthFirstDay = `${row.year}-${String(row.month).padStart(2, '0')}-01`;
//       const monthLastDay = new Date(row.year, row.month, 0).toISOString().split('T')[0];
      
//       const effectiveFrom = new Date(fromDate) > new Date(monthFirstDay) ? fromDate : monthFirstDay;
//       const effectiveTo = new Date(toDate) < new Date(monthLastDay) ? toDate : monthLastDay;
      
//       const isPartialMonth = effectiveFrom !== monthFirstDay || effectiveTo !== monthLastDay;
      
//       acc[monthKey] = {
//         month_year: row.month_year,
//         year: row.year,
//         month: row.month,
//         month_name: row.month_name,
//         date_range_in_month: {
//           from: effectiveFrom,
//           to: effectiveTo
//         },
//         is_partial_month: isPartialMonth,
//         project_id: row.project_id,
//         project_name: row.project_name,
//         site_id: row.site_id,
//         project_site_name: row.project_site_name,
//         store_id: row.store_id,
//         store_name: row.store_name,
//         material_types: {},
//         month_summary: {
//           total_amount: 0,
//           total_qty: 0,
//           total_purchases: 0,
//           total_discount: 0,
//           total_sgst: 0,
//           total_cgst: 0,
//           total_igst: 0
//         }
//       };
//     }

//     const materialKey = row.product_type_id;
    
//     if (!acc[monthKey].material_types[materialKey]) {
//       acc[monthKey].material_types[materialKey] = {
//         product_type_id: row.product_type_id,
//         product_type_name: row.product_type_name,
//         products: [],
//         material_summary: {
//           total_amount: 0,
//           total_qty: 0,
//           total_purchases: 0,
//           total_discount: 0,
//           total_taxes: 0
//         }
//       };
//     }

//     // Complete product purchase details
//     const productData = {
//       product_id: row.product_id,
//       product_name: row.product_name,
//       model_no: row.model_no,
//       hsn_code: row.hsn_code,
//       manufacturer_name: row.manufacturer_name,
//       product_image: row.product_image,
//       unit_id: row.unit_id,
//       unit_name: row.unit_name,
      
//       // Purchase Statistics
//       total_purchases: row.total_purchases,
//       total_product_qty: parseFloat(row.total_product_qty || 0),
//       total_invoice_qty: parseFloat(row.total_invoice_qty || 0),
      
//       // Pricing Analysis
//       avg_unit_rate: parseFloat(row.avg_unit_rate || 0).toFixed(2),
//       min_unit_rate: parseFloat(row.min_unit_rate || 0).toFixed(2),
//       max_unit_rate: parseFloat(row.max_unit_rate || 0).toFixed(2),
      
//       // Financial Breakdown
//       total_discount: parseFloat(row.total_discount || 0).toFixed(2),
//       total_sgst: parseFloat(row.total_sgst || 0).toFixed(2),
//       total_cgst: parseFloat(row.total_cgst || 0).toFixed(2),
//       total_igst: parseFloat(row.total_igst || 0).toFixed(2),
//       total_amount: parseFloat(row.total_amount || 0).toFixed(2),
      
//       // Date Range
//       first_purchase_date: row.first_purchase_date,
//       last_purchase_date: row.last_purchase_date
//     };

//     acc[monthKey].material_types[materialKey].products.push(productData);
    
//     // Update material summary
//     const amount = parseFloat(row.total_amount || 0);
//     const qty = parseFloat(row.total_invoice_qty || 0);
//     const discount = parseFloat(row.total_discount || 0);
//     const taxes = parseFloat(row.total_sgst || 0) + parseFloat(row.total_cgst || 0) + parseFloat(row.total_igst || 0);
    
//     acc[monthKey].material_types[materialKey].material_summary.total_amount += amount;
//     acc[monthKey].material_types[materialKey].material_summary.total_qty += qty;
//     acc[monthKey].material_types[materialKey].material_summary.total_purchases += parseInt(row.total_purchases || 0);
//     acc[monthKey].material_types[materialKey].material_summary.total_discount += discount;
//     acc[monthKey].material_types[materialKey].material_summary.total_taxes += taxes;
    
//     // Update month summary
//     acc[monthKey].month_summary.total_amount += amount;
//     acc[monthKey].month_summary.total_qty += qty;
//     acc[monthKey].month_summary.total_purchases += parseInt(row.total_purchases || 0);
//     acc[monthKey].month_summary.total_discount += discount;
//     acc[monthKey].month_summary.total_sgst += parseFloat(row.total_sgst || 0);
//     acc[monthKey].month_summary.total_cgst += parseFloat(row.total_cgst || 0);
//     acc[monthKey].month_summary.total_igst += parseFloat(row.total_igst || 0);

//     return acc;
//   }, {});

//   return Object.values(grouped).map(month => ({
//     ...month,
//     material_types: Object.values(month.material_types).map(mt => ({
//       ...mt,
//       material_summary: {
//         total_amount: parseFloat(mt.material_summary.total_amount).toFixed(2),
//         total_qty: parseFloat(mt.material_summary.total_qty).toFixed(2),
//         total_purchases: mt.material_summary.total_purchases,
//         total_discount: parseFloat(mt.material_summary.total_discount).toFixed(2),
//         total_taxes: parseFloat(mt.material_summary.total_taxes).toFixed(2)
//       }
//     })),
//     month_summary: {
//       total_amount: parseFloat(month.month_summary.total_amount).toFixed(2),
//       total_qty: parseFloat(month.month_summary.total_qty).toFixed(2),
//       total_purchases: month.month_summary.total_purchases,
//       total_discount: parseFloat(month.month_summary.total_discount).toFixed(2),
//       total_sgst: parseFloat(month.month_summary.total_sgst).toFixed(2),
//       total_cgst: parseFloat(month.month_summary.total_cgst).toFixed(2),
//       total_igst: parseFloat(month.month_summary.total_igst).toFixed(2)
//     }
//   }));
// }




/**
 * Get Purchase Details Month-wise - Complete Financial Analysis with Date Range
 * Shows all purchase details including taxes, discounts, rates, etc.
//  */
// getPurchaseDetailsMonthwise = async (req, res) => {
//   try {
//     const { project_id, site_id, store_id, product_type_id, fromDate, toDate } = req.body;

//     if (!project_id || !fromDate || !toDate) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id, fromDate, and toDate are required",
//       });
//     }

//     const conditions = ['p.project_id = ?'];
//     const params = [project_id];
    
//     if (site_id) {
//       conditions.push('p.site_id = ?');
//       params.push(site_id);
//     }
    
//     if (store_id) {
//       conditions.push('p.stor_id = ?');
//       params.push(store_id);
//     }
    
//     if (product_type_id) {
//       conditions.push('prod.product_type_id = ?');
//       params.push(product_type_id);
//     }
    
//     conditions.push('DATE(pp.created_at) BETWEEN ? AND ?');
//     params.push(fromDate, toDate);

//     const whereClause = conditions.join(' AND ');

//     const sql = `
//       SELECT
//         DATE_FORMAT(pp.created_at, '%d/%m/%Y') AS purchase_date,
        
//         p.project_id,
//         pr.project_name,
//         p.site_id,
//         ps.project_site_name,
//         p.stor_id AS store_id,
//         st.store_name,
        
//         pt.product_type_id,
//         pt.product_type_name,
        
//         prod.product_id,
//         prod.product_name,
//         prod.model_no,
//         prod.unit_id,
//         prod.hsn_code,
//         prod.manufacturer_name,
//         prod.product_image,
        
//         u.unit_name,
        
//         -- Purchase Statistics
//         COUNT(DISTINCT pp.purchase_id) AS total_purchases,
//         SUM(pp.product_qty) AS total_product_qty,
//         SUM(pp.invoice_qty) AS total_invoice_qty,
        
//         -- Pricing Details
//         AVG(pp.unit_rate) AS avg_unit_rate,
//         MIN(pp.unit_rate) AS min_unit_rate,
//         MAX(pp.unit_rate) AS max_unit_rate,
        
//         -- Financial Breakdown
//         SUM(pp.discount_amount) AS total_discount,
//         SUM(pp.sgst_amt) AS total_sgst,
//         SUM(pp.cgst_amt) AS total_cgst,
//         SUM(pp.igst_amt) AS total_igst,
//         SUM(pp.total_amount) AS total_amount,
        
//         -- Date Range
//         MIN(pp.created_at) AS first_purchase_date,
//         MAX(pp.created_at) AS last_purchase_date
        
//       FROM td_purchase_product pp
//       INNER JOIN td_purchase p ON pp.purchase_id = p.purchase_id
//       INNER JOIN md_product prod ON pp.product_id = prod.product_id
//       INNER JOIN md_product_type pt ON prod.product_type_id = pt.product_type_id
//       INNER JOIN md_project pr ON p.project_id = pr.project_id
//       LEFT JOIN md_unit u ON prod.unit_id = u.unit_id
//       LEFT JOIN md_project_site ps ON p.site_id = ps.project_site_id
//       LEFT JOIN md_store st ON p.stor_id = st.store_id
      
//       WHERE ${whereClause}
      
//       GROUP BY 
//         pt.product_type_id, prod.product_id, 
//         p.project_id, p.site_id, p.stor_id, DATE(pp.created_at)
        
//       ORDER BY pp.created_at DESC, pt.product_type_name ASC, prod.product_name ASC
//     `;

//     const results = await customSelectSqlQuery2(sql, params);

//     // Calculate total days in report
//     const from = new Date(fromDate);
//     const to = new Date(toDate);
//     const totalDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

//     return res.status(200).json({
//       success: true,
//       message: "Detailed purchase data fetched successfully",
//       report_info: {
//         report_type: "Monthly Purchase Details Report",
//         report_period: `${fromDate} to ${toDate}`,
//         date_range: {
//           from: fromDate,
//           to: toDate
//         },
//         generated_at: new Date().toISOString(),
//         total_days: totalDays
//       },
//       filters: {
//         project_id,
//         site_id: site_id || null,
//         store_id: store_id || null,
//         product_type_id: product_type_id || null,
//         fromDate,
//         toDate,
//       },
//       total_records: results.length,
//       data: results.map(row => ({
//         purchase_date: row.purchase_date,
        
//         project_id: row.project_id,
//         project_name: row.project_name,
//         site_id: row.site_id,
//         project_site_name: row.project_site_name,
//         store_id: row.store_id,
//         store_name: row.store_name,
        
//         product_type_id: row.product_type_id,
//         product_type_name: row.product_type_name,
        
//         product_id: row.product_id,
//         product_name: row.product_name,
//         model_no: row.model_no,
//         unit_id: row.unit_id,
//         hsn_code: row.hsn_code,
//         manufacturer_name: row.manufacturer_name,
//         product_image: row.product_image,
//         unit_name: row.unit_name,
        
//         // Purchase Statistics
//         total_purchases: row.total_purchases,
//         total_product_qty: parseFloat(row.total_product_qty || 0),
//         total_invoice_qty: parseFloat(row.total_invoice_qty || 0),
        
//         // Pricing Details
//         avg_unit_rate: parseFloat(row.avg_unit_rate || 0).toFixed(2),
//         min_unit_rate: parseFloat(row.min_unit_rate || 0).toFixed(2),
//         max_unit_rate: parseFloat(row.max_unit_rate || 0).toFixed(2),
        
//         // Financial Breakdown
//         total_discount: parseFloat(row.total_discount || 0).toFixed(2),
//         total_sgst: parseFloat(row.total_sgst || 0).toFixed(2),
//         total_cgst: parseFloat(row.total_cgst || 0).toFixed(2),
//         total_igst: parseFloat(row.total_igst || 0).toFixed(2),
//         total_amount: parseFloat(row.total_amount || 0).toFixed(2),
        
//         // Date Range
//         first_purchase_date: row.first_purchase_date,
//         last_purchase_date: row.last_purchase_date
//       })),
//     });

//   } catch (error) {
//     console.error("Purchase details monthwise error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch purchase details. Please try again later.",
//     });
//   }
// };




// --------------------------------------------------
// GET PURCHASES BY PROJECT, SITE, AND PRODUCT
// --------------------------------------------------



getPurchaseDetailsMonthwise = async (req, res) => {
  try {
    const { project_id, site_id, store_id, product_type_id, fromDate, toDate } = req.body;

    if (!project_id || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "project_id, fromDate, and toDate are required",
      });
    }

    const conditions = ['p.project_id = ?'];
    const params = [project_id];

    if (site_id) {
      conditions.push('p.site_id = ?');
      params.push(site_id);
    }

    if (store_id) {
      conditions.push('p.stor_id = ?');
      params.push(store_id);
    }

    if (product_type_id) {
      conditions.push('prod.product_type_id = ?');
      params.push(product_type_id);
    }

    conditions.push('DATE(pp.created_at) BETWEEN ? AND ?');
    params.push(fromDate, toDate);

    const whereClause = conditions.join(' AND ');

    // Every non-aggregated / non-GROUP-BY-key column below is wrapped in
    // MAX() (not ANY_VALUE()) for two reasons:
    // 1. Prod (MySQL 8.0.44) runs with ONLY_FULL_GROUP_BY enabled, so any
    //    SELECT column that isn't a GROUP BY key or wrapped in an aggregate
    //    throws ER_WRONG_FIELD_WITH_GROUP.
    // 2. Local (MariaDB 10.4.28) doesn't reliably support ANY_VALUE().
    // MAX() works identically on both. Note: pp.created_at itself is also
    // wrapped (not just DATE(pp.created_at)) because DATE_FORMAT(pp.created_at, ...)
    // is a different expression than the GROUP BY key DATE(pp.created_at) and
    // is NOT recognized as functionally dependent under ONLY_FULL_GROUP_BY.
    const sql = `
       SELECT
        DATE_FORMAT(MAX(pp.created_at), '%d/%m/%Y') AS purchase_date,

        p.project_id,
        MAX(pr.project_name) AS project_name,
        p.site_id,
        MAX(ps.project_site_name) AS project_site_name,
        p.stor_id AS store_id,
        MAX(st.store_name) AS store_name,

        pt.product_type_id,
        MAX(pt.product_type_name) AS product_type_name,

        prod.product_id,
        MAX(prod.product_name) AS product_name,
        MAX(prod.model_no) AS model_no,
        MAX(prod.unit_id) AS unit_id,
        MAX(prod.hsn_code) AS hsn_code,
        MAX(prod.manufacturer_name) AS manufacturer_name,
        MAX(prod.product_image) AS product_image,

        MAX(u.unit_name) AS unit_name,

        -- Purchase Statistics
        COUNT(DISTINCT pp.purchase_id) AS total_purchases,
        SUM(pp.product_qty) AS total_product_qty,
        SUM(pp.invoice_qty) AS total_invoice_qty,

        -- Pricing Details
        AVG(pp.unit_rate) AS avg_unit_rate,
        MIN(pp.unit_rate) AS min_unit_rate,
        MAX(pp.unit_rate) AS max_unit_rate,

        -- Financial Breakdown
        SUM(pp.discount_amount) AS total_discount,
        SUM(pp.sgst_amt) AS total_sgst,
        SUM(pp.cgst_amt) AS total_cgst,
        SUM(pp.igst_amt) AS total_igst,
        SUM(pp.total_amount) AS total_amount,

        -- Date Range
        MIN(pp.created_at) AS first_purchase_date,
        MAX(pp.created_at) AS last_purchase_date

      FROM td_purchase_product pp
      INNER JOIN td_purchase p ON pp.purchase_id = p.purchase_id
      INNER JOIN md_product prod ON pp.product_id = prod.product_id
      INNER JOIN md_product_type pt ON prod.product_type_id = pt.product_type_id
      INNER JOIN md_project pr ON p.project_id = pr.project_id
      LEFT JOIN md_unit u ON prod.unit_id = u.unit_id
      LEFT JOIN md_project_site ps ON p.site_id = ps.project_site_id
      LEFT JOIN md_store st ON p.stor_id = st.store_id

      WHERE ${whereClause}

      GROUP BY
        pt.product_type_id, prod.product_id,
        p.project_id, p.site_id, p.stor_id, DATE(pp.created_at)

ORDER BY DATE(pp.created_at) DESC, pt.product_type_name ASC, prod.product_name ASC    `;

    const results = await customSelectSqlQuery2(sql, params);

    // Calculate total days in report
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const totalDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

    return res.status(200).json({
      success: true,
      message: "Detailed purchase data fetched successfully",
      report_info: {
        report_type: "Monthly Purchase Details Report",
        report_period: `${fromDate} to ${toDate}`,
        date_range: {
          from: fromDate,
          to: toDate
        },
        generated_at: new Date().toISOString(),
        total_days: totalDays
      },
      filters: {
        project_id,
        site_id: site_id || null,
        store_id: store_id || null,
        product_type_id: product_type_id || null,
        fromDate,
        toDate,
      },
      total_records: results.length,
      data: results.map(row => ({
        purchase_date: row.purchase_date,

        project_id: row.project_id,
        project_name: row.project_name,
        site_id: row.site_id,
        project_site_name: row.project_site_name,
        store_id: row.store_id,
        store_name: row.store_name,

        product_type_id: row.product_type_id,
        product_type_name: row.product_type_name,

        product_id: row.product_id,
        product_name: row.product_name,
        model_no: row.model_no,
        unit_id: row.unit_id,
        hsn_code: row.hsn_code,
        manufacturer_name: row.manufacturer_name,
        product_image: row.product_image,
        unit_name: row.unit_name,

        // Purchase Statistics
        total_purchases: row.total_purchases,
        total_product_qty: parseFloat(row.total_product_qty || 0),
        total_invoice_qty: parseFloat(row.total_invoice_qty || 0),

        // Pricing Details
        avg_unit_rate: parseFloat(row.avg_unit_rate || 0).toFixed(2),
        min_unit_rate: parseFloat(row.min_unit_rate || 0).toFixed(2),
        max_unit_rate: parseFloat(row.max_unit_rate || 0).toFixed(2),

        // Financial Breakdown
        total_discount: parseFloat(row.total_discount || 0).toFixed(2),
        total_sgst: parseFloat(row.total_sgst || 0).toFixed(2),
        total_cgst: parseFloat(row.total_cgst || 0).toFixed(2),
        total_igst: parseFloat(row.total_igst || 0).toFixed(2),
        total_amount: parseFloat(row.total_amount || 0).toFixed(2),

        // Date Range
        first_purchase_date: row.first_purchase_date,
        last_purchase_date: row.last_purchase_date
      })),
    });

  } catch (error) {
    console.error("Purchase details monthwise error:", {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sql: error.sql,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Unable to fetch purchase details. Please try again later.",
      ...(process.env.NODE_ENV !== 'production' && {
        debug: error.sqlMessage || error.message,
      }),
    });
  }
};




//////////////////////////


getPurchasesByProjectSiteAndProductwithAlldetails = async (req, res) => {
  try {
    const { project_id, site_id, product_id } = req.body;

    console.log("iam beeing called")
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

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: "product_id is required",
      });
    }

    const sql = `
      SELECT
        p.purchase_id,
        p.project_id,
        pr.project_name,
        ps.project_site_name,
        p.site_id,
        p.vendor_id,
        v.vendor_name,
        p.stor_id,
        s.store_name,
        p.purchase_order_id,
        po.po_no,       
        p.invoice_no,
        p.invoice_date,
        p.delivery_date,
        p.due_date,
        p.invoice_image,
        p.transport_insurance,
        p.remarks,
        p.created_by,
        p.update_by,
        p.created_at,
        p.updated_at,

        -- Product details
        pp.purchase_product_id,
        pp.product_id,
        pn.product_name,
        pn.model_no,
        pn.hsn_code,
        pn.manufacturer_name,
        pn.product_image,
        pn.product_type_id,
        pt.product_type_name,
        
        -- Unit details
        pn.unit_id,
        u.unit_name,
        
        -- Purchase product details
        pp.product_qty,
        pp.invoice_qty,
        pp.unit_rate,
        pp.return_id,
        pp.discount_rate,
        pp.discount_amount,
        pp.sgst_rate,
        pp.cgst_rate,
        pp.igst_rate,
        pp.sgst_amt,
        pp.cgst_amt,
        pp.igst_amt,
        pp.total_amount,
        pp.make_date,
        pp.ownership_status

      FROM td_purchase AS p
      JOIN td_purchase_product AS pp ON p.purchase_id = pp.purchase_id
      LEFT JOIN md_project AS pr ON p.project_id = pr.project_id
      LEFT JOIN md_project_site AS ps ON p.site_id = ps.project_site_id
      JOIN md_vendor AS v ON p.vendor_id = v.vendor_id
      JOIN md_product AS pn ON pp.product_id = pn.product_id
      JOIN md_product_type AS pt ON pn.product_type_id = pt.product_type_id
      LEFT JOIN md_unit AS u ON pn.unit_id = u.unit_id
      LEFT JOIN md_store AS s ON p.stor_id = s.store_id
      LEFT JOIN td_purchase_order AS po ON p.purchase_order_id = po.purchase_order_id

      WHERE p.project_id = ${project_id}
        AND p.site_id = ${site_id}
        AND pp.product_id = ${product_id}
      
      ORDER BY p.created_at DESC, p.purchase_id DESC
    `;

    const result = await customSelectSqlQuery(sql);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No purchases found for this project, site, and product combination",
      });
    }

    return res.status(200).json({
      success: true,
      count: result.length,
      message: "Purchases fetched successfully",
      data: result,
    });

  } catch (error) {
    console.error("Error fetching purchases by project, site, and product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};



/* */

// getAllTypeOfPurchaseForAllTypeOfProducts = async (req, res) => {
//   try {
//     const { product_type_id } = req.query; // optional filter

//     let sql = `
//       SELECT
//         p.purchase_id,
//         p.project_id,
//         pr.project_name,
//         ps.project_site_name,
//         p.site_id,
//         p.vendor_id,
//         v.vendor_name,
//         p.stor_id,
//         s.store_name,
//         p.purchase_order_id,
//         po.po_no,
//         p.invoice_no,
//         p.invoice_date,
//         p.delivery_date,
//         p.due_date,
//         p.invoice_image,
//         p.transport_insurance,
//         p.remarks,
//         p.created_by,
//         p.update_by,
//         p.created_at,
//         p.updated_at,

//         -- Product details
//         pp.purchase_product_id,
//         pp.product_id,
//         pn.product_name,
//         pn.product_type_id,
//         pt.product_type_name,
//         pp.product_qty,
//         pp.invoice_qty,
//         pp.unit_rate,
//         pp.return_id,
//         pp.discount_rate,
//         pp.discount_amount,
//         pp.sgst_rate,
//         pp.cgst_rate,
//         pp.igst_rate,
//         pp.sgst_amt,
//         pp.cgst_amt,
//         pp.igst_amt,
//         pp.total_amount

//       FROM td_purchase AS p
//       JOIN td_purchase_product AS pp ON p.purchase_id = pp.purchase_id
//       LEFT JOIN md_project AS pr ON p.project_id = pr.project_id
//       LEFT JOIN md_project_site AS ps ON p.site_id = ps.project_site_id
//       JOIN md_vendor AS v ON p.vendor_id = v.vendor_id
//       JOIN md_product AS pn ON pp.product_id = pn.product_id
//       JOIN md_product_type AS pt ON pn.product_type_id = pt.product_type_id
//       LEFT JOIN md_store AS s ON p.stor_id = s.store_id
//       LEFT JOIN td_purchase_order AS po ON p.purchase_order_id = po.purchase_order_id
//       WHERE 1 = 1
//     `;

//     // ✅ Apply filter only if product_type_id is sent
//     if (product_type_id) {
//       sql += ` AND pn.product_type_id = ${product_type_id}`;
//     }

//     const result = await customSelectSqlQuery(sql);

//     return res.status(200).json({
//       status: "success",
//       data: result,
//     });

//   } catch (error) {
//     console.error("Error fetching purchase list:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//     });
//   }
// };


// getAllTypeOfPurchaseForAllTypeOfProducts = async (req, res) => {
//   try {
//     const { product_type_id } = req.query;

//     let sql = `
//       SELECT
//         p.purchase_id,
//         p.project_id,
//         pr.project_name,
//         ps.project_site_name,
//         p.site_id,
//         p.vendor_id,
//         v.vendor_name,
//         p.stor_id,
//         s.store_name,
//         p.purchase_order_id,
//         po.po_no,
//         p.invoice_no,
//         p.invoice_date,
//         p.delivery_date,
//         p.due_date,
//         p.invoice_image,
//         p.transport_insurance,
//         p.remarks,
//         p.created_by,
//         p.update_by,
//         p.created_at,
//         p.updated_at,

//         -- Product details
//         pp.purchase_product_id,
//         pp.product_id,
//         pn.product_name,
//         pn.product_type_id,
//         pt.product_type_name,
//         pp.product_qty,
//         pp.invoice_qty,
//         pp.unit_rate,
//         pp.return_id,
//         pp.discount_rate,
//         pp.discount_amount,
//         pp.sgst_rate,
//         pp.cgst_rate,
//         pp.igst_rate,
//         pp.sgst_amt,
//         pp.cgst_amt,
//         pp.igst_amt,
//         pp.total_amount

//       FROM td_purchase AS p
//       JOIN td_purchase_product AS pp ON p.purchase_id = pp.purchase_id
//       LEFT JOIN md_project AS pr ON p.project_id = pr.project_id
//       LEFT JOIN md_project_site AS ps ON p.site_id = ps.project_site_id
//       JOIN md_vendor AS v ON p.vendor_id = v.vendor_id
//       JOIN md_product AS pn ON pp.product_id = pn.product_id
//       JOIN md_product_type AS pt ON pn.product_type_id = pt.product_type_id
//       LEFT JOIN md_store AS s ON p.stor_id = s.store_id
//       LEFT JOIN td_purchase_order AS po ON p.purchase_order_id = po.purchase_order_id

//       WHERE po.po_no IS NOT NULL
//       AND po.po_no <> ''
//       AND p.project_id IS NOT NULL
//     `;

//     // ✅ Optional filter
//     if (product_type_id) {
//       sql += ` AND pn.product_type_id = ${product_type_id}`;
//     }

//     const result = await customSelectSqlQuery(sql);

//     return res.status(200).json({
//       status: "success",
//       data: result,
//     });

//   } catch (error) {
//     console.error("Error fetching purchase list:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//     });
//   }
// };





// getAllTypeOfPurchaseForAllTypeOfProducts = async (req, res) => {
//   try {
//     const { product_type_id } = req.query;

//     let sql = `
//       SELECT
//         p.purchase_id,
//         p.project_id,
//         pr.project_name,
//         ps.project_site_name,
//         p.site_id,
//         p.vendor_id,
//         v.vendor_name,
//         p.stor_id,
//         s.store_name,
//         p.purchase_order_id,
//         po.po_no,
//         p.invoice_no,
//         p.invoice_date,
//         p.delivery_date,
//         p.due_date,
//         p.invoice_image,
//         p.transport_insurance,
//         p.remarks,
//         p.created_by,
//         p.update_by,
//         p.created_at,
//         p.updated_at,

//         -- Product details
//         pp.purchase_product_id,
//         pp.product_id,
//         pn.product_name,
//         pn.product_type_id,
//         pt.product_type_name,
//         pp.product_qty,
//         pp.invoice_qty,
//         pp.unit_rate,
//         pp.return_id,
//         pp.discount_rate,
//         pp.discount_amount,
//         pp.sgst_rate,
//         pp.cgst_rate,
//         pp.igst_rate,
//         pp.sgst_amt,
//         pp.cgst_amt,
//         pp.igst_amt,
//         pp.total_amount

//       FROM td_purchase AS p
//       JOIN td_purchase_product AS pp ON p.purchase_id = pp.purchase_id
//       LEFT JOIN md_project AS pr ON p.project_id = pr.project_id
//       LEFT JOIN md_project_site AS ps ON p.site_id = ps.project_site_id
//       JOIN md_vendor AS v ON p.vendor_id = v.vendor_id
//       JOIN md_product AS pn ON pp.product_id = pn.product_id
//       JOIN md_product_type AS pt ON pn.product_type_id = pt.product_type_id
//       LEFT JOIN md_store AS s ON p.stor_id = s.store_id
//       LEFT JOIN td_purchase_order AS po ON p.purchase_order_id = po.purchase_order_id

//       WHERE po.po_no IS NOT NULL
//       AND po.po_no <> ''
//       AND pr.project_name IS NOT NULL
//       AND pr.project_name <> ''
//     `;

//     //  Optional Product Type Filter
//     if (product_type_id) {
//       sql += ` AND pn.product_type_id = ${product_type_id}`;
//     }

//     const result = await customSelectSqlQuery(sql);

//     return res.status(200).json({
//       status: "success",
//       data: result,
//     });

//   } catch (error) {
//     console.error("Error fetching purchase list:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//     });
//   }
// };


getAllTypeOfPurchaseForAllTypeOfProducts = async (req, res) => {
  console.log("=".repeat(60));
  console.log("[PURCHASE] Controller hit");
  console.log("[PURCHASE] Query params:", req.query);

  try {
    const { product_type_id } = req.query;
    console.log("[PURCHASE] product_type_id:", product_type_id ?? "NOT PROVIDED");

    const params = [];

    let sql = `
      SELECT
        p.purchase_id,
        p.project_id,
        pr.project_name,
        ps.project_site_name,
        p.site_id,
        p.vendor_id,
        v.vendor_name,
        p.stor_id,
        s.store_name,
        p.purchase_order_id,
        po.po_no,
        p.invoice_no,
        p.invoice_date,
        p.delivery_date,
        p.due_date,
        p.invoice_image,
        p.transport_insurance,
        p.remarks,
        p.created_by,
        p.update_by,
        p.created_at,
        p.updated_at,

        -- Product details
        pp.purchase_product_id,
        pp.product_id,
        pn.product_name,
        pn.product_type_id,
        pt.product_type_name,
        pp.product_qty,
        pp.invoice_qty,
        pp.unit_rate,
        pp.return_id,
        pp.discount_rate,
        pp.discount_amount,
        pp.sgst_rate,
        pp.cgst_rate,
        pp.igst_rate,
        pp.sgst_amt,
        pp.cgst_amt,
        pp.igst_amt,
        pp.total_amount

      FROM td_purchase AS p
      JOIN td_purchase_product AS pp ON p.purchase_id = pp.purchase_id
      LEFT JOIN md_project AS pr ON p.project_id = pr.project_id
      LEFT JOIN md_project_site AS ps ON p.site_id = ps.project_site_id
      LEFT JOIN md_vendor AS v ON p.vendor_id = v.vendor_id
      LEFT JOIN md_product AS pn ON pp.product_id = pn.product_id
      LEFT JOIN md_product_type AS pt ON pn.product_type_id = pt.product_type_id
      LEFT JOIN md_store AS s ON p.stor_id = s.store_id
      LEFT JOIN td_purchase_order AS po ON p.purchase_order_id = po.purchase_order_id
    `;

    // WHERE clause — only filter by product_type_id if provided
    if (product_type_id) {
      sql += ` WHERE pn.product_type_id = ?`;
      params.push(product_type_id);
      console.log("[PURCHASE] Filter applied — product_type_id:", product_type_id);
    } else {
      console.log("[PURCHASE] No filter — fetching all records");
    }

    console.log("[PURCHASE] Final SQL:\n", sql);
    console.log("[PURCHASE] Params:", params);

    const result = await customSelectSqlQuery2(sql, params);

    console.log("[PURCHASE] Query executed successfully");
    console.log("[PURCHASE] Row count:", result?.length ?? 0);

    return res.status(200).json({
      status: "success",
      data: result,
    });

  } catch (error) {
    console.error("[PURCHASE] ❌ Error:", error.message);
    console.error("[PURCHASE] SQL State:", error.sqlState ?? "N/A");
    console.error("[PURCHASE] Error Code:", error.code ?? "N/A");

    res.status(500).json({
      status: "error",
      message: error.message,
      sqlState: error.sqlState ?? null,
      code: error.code ?? null,
    });
  }
};

}

module.exports = new PurchaseProductController();
