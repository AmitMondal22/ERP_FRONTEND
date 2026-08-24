const {
    customSelectSqlQuery2,
} = require("../models/MasterModel");

class PurchaseOrderVsActualController {

    // --------------------------------------------------
    // GET PO vs ACTUAL PURCHASE REPORT
    // Input : project_id (required), site_id (optional), fromDate, toDate
    // Output: for every PO in range -> ordered products vs actual (invoiced)
    //         products, with qty/amount variance and tax breakup.
    // --------------------------------------------------
    getPurchaseOrderVsActualPurchaseReport = async (req, res) => {
        try {
            const { project_id, site_id, fromDate, toDate } = req.body;

            if (!project_id || !fromDate || !toDate) {
                return res.status(400).json({
                    success: false,
                    message: "project_id, fromDate, and toDate are required",
                });
            }

            // ---------------------------
            // 1. Fetch Purchase Orders in range
            // ---------------------------
            const conditions = ["p.project_id = ?"];
            const params = [project_id];

            if (site_id) {
                conditions.push("p.project_site_id = ?");
                params.push(site_id);
            }

            conditions.push("DATE(p.date) BETWEEN ? AND ?");
            params.push(fromDate, toDate);

            const whereClause = conditions.join(" AND ");

            const poSql = `
        SELECT
          p.purchase_order_id,
          p.po_no,
          p.vendor_id,
          v.vendor_name,
          p.project_id,
          pr.project_name,
          p.project_site_id,
          ps.project_site_name,
          p.date AS po_date,
          p.delivery_date,
          p.total_amount AS po_total_amount
        FROM td_purchase_order p
        LEFT JOIN md_vendor v ON p.vendor_id = v.vendor_id
        LEFT JOIN md_project pr ON p.project_id = pr.project_id
        LEFT JOIN md_project_site ps ON p.project_site_id = ps.project_site_id
        WHERE ${whereClause}
        ORDER BY p.purchase_order_id DESC
      `;

            const purchaseOrders = await customSelectSqlQuery2(poSql, params);

            if (!purchaseOrders.length) {
                return res.status(200).json({
                    success: true,
                    message: "No purchase orders found for the given filters",
                    report_period: `${fromDate} to ${toDate}`,
                    project_id,
                    site_id: site_id || null,
                    total_pos: 0,
                    data: [],
                });
            }

            const poIds = purchaseOrders.map(po => po.purchase_order_id);
            const poIdPlaceholders = poIds.map(() => "?").join(",");

            // ---------------------------
            // 2. Fetch PO products (ordered)
            // ---------------------------
            const poProductSql = `
        SELECT
          pop.purchase_order_product_id,
          pop.purchase_order_id,
          pop.product_id,
          mp.product_name,
          pop.unit_id,
          u.unit_name,
          pop.quantity,
          pop.unit_price,
          pop.discount_rate,
          pop.discount_amount,
          pop.sgst_rate, pop.cgst_rate, pop.igst_rate,
          pop.sgst_amt, pop.cgst_amt, pop.igst_amt,
          pop.total_amount
        FROM td_purchase_order_product pop
        LEFT JOIN md_product mp ON pop.product_id = mp.product_id
        LEFT JOIN md_unit u ON pop.unit_id = u.unit_id
        WHERE pop.purchase_order_id IN (${poIdPlaceholders})
      `;

            const poProducts = await customSelectSqlQuery2(poProductSql, poIds);

            // ---------------------------
            // 3. Fetch actual (invoiced) purchases linked to these POs
            // ---------------------------
            const actualSql = `
        SELECT
          pp.purchase_product_id,
          pp.purchase_id,
          p.purchase_order_id,
          p.invoice_no,
          p.invoice_date,
          pp.product_id,
          pp.product_qty,
          pp.invoice_qty,
          pp.unit_rate,
          pp.discount_rate,
          pp.discount_amount,
          pp.sgst_rate, pp.cgst_rate, pp.igst_rate,
          pp.sgst_amt, pp.cgst_amt, pp.igst_amt,
          pp.total_amount,
          pp.return_id,
          pp.make_date,
          pp.ownership_status
        FROM td_purchase_product pp
        INNER JOIN td_purchase p ON pp.purchase_id = p.purchase_id
        WHERE p.purchase_order_id IN (${poIdPlaceholders})
      `;

            const actualPurchases = await customSelectSqlQuery2(actualSql, poIds);

            // ---------------------------
            // 4. Aggregate actuals by purchase_order_id + product_id
            //    (a PO product can be spread across multiple invoices)
            // ---------------------------
            const actualMap = {};
            for (const row of actualPurchases) {
                const key = `${row.purchase_order_id}_${row.product_id}`;
                if (!actualMap[key]) {
                    actualMap[key] = {
                        product_qty: 0,
                        invoice_qty: 0,
                        discount_amount: 0,
                        sgst_amt: 0,
                        cgst_amt: 0,
                        igst_amt: 0,
                        total_amount: 0,
                        qty_x_rate: 0, // used to derive a qty-weighted average unit_rate
                        discount_rate: Number(row.discount_rate || 0),
                        sgst_rate: Number(row.sgst_rate || 0),
                        cgst_rate: Number(row.cgst_rate || 0),
                        igst_rate: Number(row.igst_rate || 0),
                        invoices: [],
                    };
                }
                const bucket = actualMap[key];
                const invoiceQty = Number(row.invoice_qty || 0);
                const unitRate = Number(row.unit_rate || 0);

                bucket.product_qty += Number(row.product_qty || 0);
                bucket.invoice_qty += invoiceQty;
                bucket.discount_amount += Number(row.discount_amount || 0);
                bucket.sgst_amt += Number(row.sgst_amt || 0);
                bucket.cgst_amt += Number(row.cgst_amt || 0);
                bucket.igst_amt += Number(row.igst_amt || 0);
                bucket.total_amount += Number(row.total_amount || 0);
                bucket.qty_x_rate += invoiceQty * unitRate;
                bucket.invoices.push({
                    purchase_product_id: row.purchase_product_id,
                    purchase_id: row.purchase_id,
                    invoice_no: row.invoice_no,
                    invoice_date: row.invoice_date,
                    product_qty: Number(row.product_qty || 0),
                    invoice_qty: invoiceQty,
                    unit_rate: unitRate,
                    discount_rate: Number(row.discount_rate || 0),
                    discount_amount: Number(row.discount_amount || 0),
                    sgst_rate: Number(row.sgst_rate || 0),
                    cgst_rate: Number(row.cgst_rate || 0),
                    igst_rate: Number(row.igst_rate || 0),
                    sgst_amt: Number(row.sgst_amt || 0),
                    cgst_amt: Number(row.cgst_amt || 0),
                    igst_amt: Number(row.igst_amt || 0),
                    total_amount: Number(row.total_amount || 0),
                    return_id: row.return_id,
                    make_date: row.make_date,
                    ownership_status: row.ownership_status,
                });
            }

            // ---------------------------
            // 5. Group PO products by purchase_order_id
            // ---------------------------
            const poProductsMap = {};
            for (const row of poProducts) {
                if (!poProductsMap[row.purchase_order_id]) poProductsMap[row.purchase_order_id] = [];
                poProductsMap[row.purchase_order_id].push(row);
            }

            // ---------------------------
            // 6. Build final per-PO response
            // ---------------------------
            const PRICE_TOLERANCE = 0.01; // guards against floating-point noise, not a real price gap

            const data = purchaseOrders.map(po => {
                const products = (poProductsMap[po.purchase_order_id] || []).map(pop => {
                    const key = `${po.purchase_order_id}_${pop.product_id}`;
                    const purchased = actualMap[key] || {
                        product_qty: 0,
                        invoice_qty: 0,
                        qty_x_rate: 0,
                        discount_rate: 0,
                        discount_amount: 0,
                        sgst_rate: 0, cgst_rate: 0, igst_rate: 0,
                        sgst_amt: 0, cgst_amt: 0, igst_amt: 0,
                        total_amount: 0,
                        invoices: [],
                    };

                    const poUnitPrice = Number(pop.unit_price || 0);
                    // qty-weighted average rate across all invoices for this product on this PO
                    const purchasedUnitPrice = purchased.invoice_qty > 0
                        ? Number((purchased.qty_x_rate / purchased.invoice_qty).toFixed(2))
                        : 0;

                    const hasBeenPurchased = purchased.invoices.length > 0;
                    const priceDifference = Number((purchasedUnitPrice - poUnitPrice).toFixed(2));
                    const priceMatched = !hasBeenPurchased ? null : Math.abs(priceDifference) <= PRICE_TOLERANCE;

                    return {
                        product_id: pop.product_id,
                        product_name: pop.product_name,
                        unit_name: pop.unit_name,

                        // ---- the price comparison you asked for ----
                        po_unit_price: poUnitPrice,
                        purchased_unit_price: purchasedUnitPrice,
                        price_difference: priceDifference,
                        price_status: !hasBeenPurchased
                            ? "Not Purchased Yet"
                            : priceMatched
                                ? "Price Matched"
                                : "Price Different",

                        // ---- full PO-side fields (td_purchase_order_product) ----
                        po: {
                            purchase_order_product_id: pop.purchase_order_product_id,
                            quantity: Number(pop.quantity || 0),
                            unit_price: poUnitPrice,
                            discount_rate: Number(pop.discount_rate || 0),
                            discount_amount: Number(pop.discount_amount || 0),
                            sgst_rate: Number(pop.sgst_rate || 0),
                            cgst_rate: Number(pop.cgst_rate || 0),
                            igst_rate: Number(pop.igst_rate || 0),
                            sgst_amt: Number(pop.sgst_amt || 0),
                            cgst_amt: Number(pop.cgst_amt || 0),
                            igst_amt: Number(pop.igst_amt || 0),
                            total_amount: Number(pop.total_amount || 0),
                        },

                        // ---- full Purchase-side fields (td_purchase_product), summed across invoices ----
                        purchased: {
                            product_qty: purchased.product_qty,
                            invoice_qty: purchased.invoice_qty,
                            unit_price: purchasedUnitPrice, // qty-weighted average; see invoices[] for per-invoice rate
                            discount_rate: purchased.discount_rate,
                            discount_amount: purchased.discount_amount,
                            sgst_rate: purchased.sgst_rate,
                            cgst_rate: purchased.cgst_rate,
                            igst_rate: purchased.igst_rate,
                            sgst_amt: purchased.sgst_amt,
                            cgst_amt: purchased.cgst_amt,
                            igst_amt: purchased.igst_amt,
                            total_amount: purchased.total_amount,
                            invoices: purchased.invoices,
                        },

                        // ---- other variances (qty / total amount, on top of price) ----
                        comparison: {
                            qty_variance: purchased.invoice_qty - Number(pop.quantity || 0),
                            total_amount_variance: Number((purchased.total_amount - Number(pop.total_amount || 0)).toFixed(2)),
                        },
                    };
                });

                const totals = products.reduce((acc, item) => {
                    acc.po_total_amount += item.po.total_amount;
                    acc.purchased_total_amount += item.purchased.total_amount;
                    acc.po_discount_amount += item.po.discount_amount;
                    acc.purchased_discount_amount += item.purchased.discount_amount;
                    acc.po_sgst_amt += item.po.sgst_amt;
                    acc.purchased_sgst_amt += item.purchased.sgst_amt;
                    acc.po_cgst_amt += item.po.cgst_amt;
                    acc.purchased_cgst_amt += item.purchased.cgst_amt;
                    acc.po_igst_amt += item.po.igst_amt;
                    acc.purchased_igst_amt += item.purchased.igst_amt;
                    return acc;
                }, {
                    po_total_amount: 0, purchased_total_amount: 0,
                    po_discount_amount: 0, purchased_discount_amount: 0,
                    po_sgst_amt: 0, purchased_sgst_amt: 0,
                    po_cgst_amt: 0, purchased_cgst_amt: 0,
                    po_igst_amt: 0, purchased_igst_amt: 0,
                });

                const price_mismatch_count = products.filter(p => p.price_status === "Price Different").length;

                return {
                    purchase_order_id: po.purchase_order_id,
                    po_no: po.po_no,
                    vendor_id: po.vendor_id,
                    vendor_name: po.vendor_name,
                    project_id: po.project_id,
                    project_name: po.project_name,
                    project_site_id: po.project_site_id,
                    project_site_name: po.project_site_name,
                    date: po.po_date,
                    delivery_date: po.delivery_date,
                    total_amount: Number(po.po_total_amount || 0),
                    totals,
                    price_mismatch_count,
                    price_status: price_mismatch_count > 0 ? "Price Different" : "Price Matched",
                    products,
                };
            });

            return res.status(200).json({
                success: true,
                report_period: `${fromDate} to ${toDate}`,
                project_id,
                site_id: site_id || null,
                total_pos: data.length,
                data,
            });

        } catch (error) {
            console.error("getPurchaseOrderVsActualPurchaseReport Error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message,
            });
        }
    };
}

module.exports = new PurchaseOrderVsActualController();