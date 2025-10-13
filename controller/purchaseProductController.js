const { insertData, batchInsertData } = require("../models/MasterModel");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

class PurchaseProductController {
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
      invoice_image,
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
        stor_id,
        purchase_order_id,
        invoice_no,
        invoice_date,
        delivery_date,
        invoice_image: invoice_image || null,
        transport_insurance: transport_insurance || null,
        remarks: remarks || null,
        created_by,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Insert into td_purchase
      const purchase_id = await insertData("td_purchase", purchaseData, connection);

      // Prepare data for td_purchase_product using async map
      const productValues = await Promise.all(
        purchase_product.map(async (product) => {
          // Example async operation (replace with actual async logic if needed)
          // For demonstration, assume a simple async validation or transformation
          // const validatedProduct = await someAsyncValidation(product);

          return {
            purchase_id,
            product_id: product.product_id,
            product_qty: product.product_qty,
            invoice_qty: product.invoice_qty,
            unit_rate: product.unit_rate,
            discount_rate: product.discount_rate || null,
            discount_amount: product.discount_amount || null,
            sgst_rate: product.sgst_rate || null,
            cgst_rate: product.cgst_rate || null,
            igst_rate: product.igst_rate || null,
            sgst_amt: product.sgst_amt || null,
            cgst_amt: product.cgst_amt || null,
            igst_amt: product.igst_amt || null,
            total_amount: product.total_amount,
            make_date: product.make_date || null,
            ownership_status: product.ownership_status || null,
            created_by: product.created_by,
            updated_by: product.created_by,
            created_at: new Date(),
            updated_at: new Date(),
          };
        })
      );

      // Define columns for batch insert
      const productColumns = Object.keys(productValues[0]).join(", ");

      // Insert into td_purchase_product
      await batchInsertData("td_purchase_product", productColumns, productValues, connection);
      return res.status(201).json({
        message: "Bulk purchase created successfully",
        purchase_id,
        product_count: purchase_product.length,
      });
    } catch (error) {
      console.error("Error creating bulk purchase:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}

module.exports = new PurchaseProductController();