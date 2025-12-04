const {insertData, batchInsertData, customSelectSqlQuery, updateData, deleteData} = require("../models/MasterModel");
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
  //       stor_id: stor_id ?? null, 
  //       purchase_order_id: purchase_order_id ?? null,
  //       invoice_no,
  //       invoice_date,
  //       delivery_date,
  //       invoice_image: invoice_image_path || null,
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
  //         // Example async operation (replace with actual async logic if needed)

  //         return {
  //           purchase_id,
  //           product_id: product.product_id,
  //           product_qty: product.product_qty,
  //           invoice_qty: product.invoice_qty,
  //           unit_rate: product.unit_rate,

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
  //           created_at: now,
  //           updated_at: now,
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

  //     return res.status(201).json({
  //       message: "Bulk purchase created successfully",
  //       purchase_id,
  //       product_count: purchase_product.length,
  //     });
  //   } catch (error) {
  //     console.error("Error creating bulk purchase:", error);
  //     return res.status(500).json({ error: "Internal server error" });
  //   }
  // };



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
      invoice_image_path,
      transport_insurance,
      remarks,
      created_by,
      purchase_product,
    } = req.body;

    let connection;
    try {
      // Prepare data for td_purchase
      const purchaseData = {
        project_id,
        site_id,
        vendor_id,
        stor_id: stor_id ?? null, 
        purchase_order_id: purchase_order_id ?? null,
        invoice_no,
        invoice_date,
        delivery_date,
        invoice_image: invoice_image_path || null,  // Now receives the path
        transport_insurance: transport_insurance || null,
        remarks: remarks || null,
        created_by,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Insert into td_purchase
      const purchase_id = await insertData(
        "td_purchase",
        purchaseData,
        connection
      );

      // Prepare data for td_purchase_product using async map
      const productValues = await Promise.all(
        purchase_product.map(async (product) => {
          return {
            purchase_id,
            product_id: product.product_id,
            product_qty: product.product_qty,
            invoice_qty: product.invoice_qty,
            unit_rate: product.unit_rate,
            discount_rate: product.discount_rate ?? 0,
            discount_amount: product.discount_amount ?? 0,
            sgst_rate: product.sgst_rate ?? 0,
            cgst_rate: product.cgst_rate ?? 0,
            igst_rate: product.igst_rate ?? 0,
            sgst_amt: product.sgst_amt ?? 0,
            cgst_amt: product.cgst_amt ?? 0,
            igst_amt: product.igst_amt ?? 0,
            total_amount: product.total_amount,
            make_date: product.make_date || null,
            ownership_status: product.ownership_status || null,
            created_by: product.created_by,
            updated_by: product.created_by,
            created_at: new Date(),  //  FIX: Changed from 'now' to new Date()
            updated_at: new Date(),  //  FIX: Changed from 'now' to new Date()
          };
        })
      );

      // Define columns for batch insert
      const productColumns = Object.keys(productValues[0]).join(", ");

      // Insert into td_purchase_product
      await batchInsertData(
        "td_purchase_product",
        productColumns,
        productValues,
        connection
      );

      //  FIX: Add 'success: true' to match frontend expectations
      return res.status(201).json({
        success: true, 
        message: "Bulk purchase created successfully",
        data: {         
          purchase_id,
          product_count: purchase_product.length,
        }
      });
    } catch (error) {
      console.error("Error creating bulk purchase:", error);
      //  FIX: Also update error response for consistency
      return res.status(500).json({ 
        success: false,  //ADD THIS
        message: "Internal server error",
        error: error.message 
      });
    }
  };



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
        po.voucher_no,
        po.reference_no_and_date,
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
        po.voucher_no LIKE '${escapedSearch}' OR
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
        po.voucher_no,
        po.reference_no_and_date,
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
        po.voucher_no LIKE '${escapedSearch}' OR
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

    // if (!id) {
    //   return res.status(400).json({ message: "purchase_id is required" });
    // }

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
              po.voucher_no,
              po.reference_no_and_date,
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
              
            WHERE p.purchase_id = ${id}
          `;

  const result = await customSelectSqlQuery(sql);


      if (result.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Purchase not found or missing linked data",
        });
      }

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      console.error("Error fetching purchase by ID:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  };



  updatePurchase = async (req, res) => {
    const purchase_id = req.params.id;

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

    let connection;

    try {
      // Update td_purchase
      const purchaseData = {
        project_id,
        site_id,
        vendor_id,
        stor_id: stor_id ?? null,
        purchase_order_id: purchase_order_id ?? null,
        invoice_no,
        invoice_date,
        delivery_date,
        invoice_image: invoice_image_path || null,
        transport_insurance: transport_insurance || null,
        remarks: remarks || null, 
        // updated_by,
        // updated_at: new Date(),
      };
      console.log(purchaseData)
      await updateData("td_purchase", purchaseData, `purchase_id = ${purchase_id}`);

      // Update td_purchase_product
      // You may choose to delete old entries first if complete replacement
      await deleteData("td_purchase_product", `purchase_id = ${purchase_id}`);

      const productValues = await Promise.all(
        purchase_product.map(async (product) => {
          return {
            purchase_id,
            product_id: product.product_id,
            product_qty: product.product_qty,
            invoice_qty: product.invoice_qty,
            unit_rate: product.unit_rate,
            discount_rate: product.discount_rate ?? 0,
            discount_amount: product.discount_amount ?? 0,
            sgst_rate: product.sgst_rate ?? 0,
            cgst_rate: product.cgst_rate ?? 0,
            igst_rate: product.igst_rate ?? 0,
            sgst_amt: product.sgst_amt ?? 0,
            cgst_amt: product.cgst_amt ?? 0,
            igst_amt: product.igst_amt ?? 0,
            total_amount: product.total_amount,
            make_date: product.make_date || null,
            ownership_status: product.ownership_status || null,
            // updated_by: updated_by,
            // created_at: new Date(),
            // updated_at: new Date(),
          };
        })
      );

      // Batch insert new products
      const productColumns = Object.keys(productValues[0]).join(", ");
      await batchInsertData("td_purchase_product", productColumns, productValues, connection);

      return res.status(200).json({
        success: true,
        message: "Purchase and products updated successfully",
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
//

 getPurchaseByProductAndDate = async (req, res) => {
  try {
    const { id: product_id } = req.params;   
    const { fromDate, toDate } = req.body;   

    console.log(product_id, fromDate, toDate);

    if (!fromDate || !toDate || !product_id) {
      return res.status(400).json({
        success: false,
        message: "fromDate, toDate and product_id are required",
      });
    }

    // FINAL SQL — NO PLACEHOLDERS — VALUES INSERTED DIRECTLY
    const sql = `
      SELECT
        p.purchase_id,
        p.invoice_no,
        p.invoice_date,
        p.delivery_date,
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
        po.voucher_no,
        po.reference_no_and_date,

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
        pp.make_date,
        pp.ownership_status,

        DATE(pp.created_at) AS purchase_date,
        pp.created_at,
        pp.updated_at

      FROM td_purchase_product AS pp
      JOIN td_purchase AS p ON pp.purchase_id = p.purchase_id
      JOIN md_product AS pn ON pp.product_id = pn.product_id
      JOIN md_product_type AS pt ON pn.product_type_id = pt.product_type_id
      LEFT JOIN md_project AS pr ON p.project_id = pr.project_id
      LEFT JOIN md_project_site AS ps ON p.site_id = ps.project_site_id
      JOIN md_vendor AS v ON p.vendor_id = v.vendor_id
      LEFT JOIN md_store AS s ON p.stor_id = s.store_id
      LEFT JOIN td_purchase_order AS po ON p.purchase_order_id = po.purchase_order_id

      WHERE 
        pp.product_id = ${product_id}
        AND DATE(pp.created_at) BETWEEN '${fromDate}' AND '${toDate}'

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
        po.voucher_no,
        po.reference_no_and_date,
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


}

module.exports = new PurchaseProductController();
