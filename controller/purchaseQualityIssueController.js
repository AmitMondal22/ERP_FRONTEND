const {
  selectData,
  updateData,
  customSelectSqlQuery,
} = require("../models/MasterModel");
const { sendVendorDefectiveItemsEmail } = require("../utils/mailer");

class PurchaseQualityIssueController {
  // 1️⃣ Get all Quality Issues with complete metadata & filtering
  getAllQualityIssues = async (req, res) => {
    try {
      const {
        status, // 'PENDING' | 'RESOLVED' | 'ALL'
        vendor_id,
        project_id,
        site_id,
        quality_status,
        search,
        fromDate,
        toDate,
      } = req.query;

      let whereClauses = ["1=1"];

      if (status && status !== "ALL") {
        whereClauses.push(`qi.resolution_status = '${status}'`);
      }

      if (quality_status) {
        whereClauses.push(`qi.quality_status = '${quality_status}'`);
      }

      if (vendor_id) {
        whereClauses.push(`qi.vendor_id = ${Number(vendor_id)}`);
      }

      if (project_id) {
        whereClauses.push(`qi.project_id = ${Number(project_id)}`);
      }

      if (site_id) {
        whereClauses.push(`qi.site_id = ${Number(site_id)}`);
      }

      if (fromDate && toDate) {
        whereClauses.push(
          `DATE(qi.created_at) BETWEEN '${fromDate}' AND '${toDate}'`
        );
      } else if (fromDate) {
        whereClauses.push(`DATE(qi.created_at) >= '${fromDate}'`);
      } else if (toDate) {
        whereClauses.push(`DATE(qi.created_at) <= '${toDate}'`);
      }

      if (search && search.trim()) {
        const s = search.trim().replace(/'/g, "''");
        whereClauses.push(`(
          qi.invoice_no LIKE '%${s}%' OR
          qi.po_no LIKE '%${s}%' OR
          p.product_name LIKE '%${s}%' OR
          v.vendor_name LIKE '%${s}%' OR
          pr.project_name LIKE '%${s}%' OR
          ps.project_site_name LIKE '%${s}%'
        )`);
      }

      const sql = `
        SELECT
          qi.issue_id,
          qi.purchase_id,
          qi.purchase_product_id,
          qi.project_id,
          qi.site_id,
          qi.store_id,
          qi.vendor_id,
          qi.product_id,
          qi.invoice_no,
          qi.po_no,
          qi.quantity,
          qi.unit_rate,
          qi.total_amount,
          qi.quality_status,
          qi.resolution_status,
          qi.email_sent_status,
          qi.email_sent_at,
          qi.remarks,
          qi.resolution_remarks,
          qi.resolved_by,
          qi.resolved_at,
          qi.created_at,
          qi.updated_at,
          p.product_name,
          COALESCE(u.unit_name, '') AS unit,
          v.vendor_name,
          v.vendor_email,
          v.vendor_mobile,
          pr.project_name,
          ps.project_site_name,
          st.store_name,
          COALESCE(usr.name, CONCAT(COALESCE(emp.first_name, ''), ' ', COALESCE(emp.last_name, '')), 'Admin') AS resolver_name
        FROM td_purchase_quality_issue qi
        LEFT JOIN md_product p ON p.product_id = qi.product_id
        LEFT JOIN md_unit u ON u.unit_id = p.unit_id
        LEFT JOIN md_vendor v ON v.vendor_id = qi.vendor_id
        LEFT JOIN md_project pr ON pr.project_id = qi.project_id
        LEFT JOIN md_project_site ps ON ps.project_site_id = qi.site_id
        LEFT JOIN md_store st ON st.store_id = qi.store_id
        LEFT JOIN users usr ON usr.id = qi.resolved_by
        LEFT JOIN em_employees emp ON emp.employee_id = qi.resolved_by
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY qi.issue_id DESC
      `;

      const results = await customSelectSqlQuery(sql);

      return res.status(200).json({
        success: true,
        count: results.length,
        data: results,
      });
    } catch (error) {
      console.error("Error fetching quality issues:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch purchase quality issues",
        error: error.message,
      });
    }
  };

  // 2️⃣ Resolve a Quality Issue
  resolveQualityIssue = async (req, res) => {
    try {
      const issue_id = Number(req.params.id);
      const { resolution_remarks } = req.body;
      const resolved_by = req.user?.id || req.body.resolved_by || null;

      if (!issue_id) {
        return res.status(400).json({
          success: false,
          message: "Issue ID is required",
        });
      }

      const existing = await selectData(
        "td_purchase_quality_issue",
        "*",
        `issue_id = ${issue_id}`
      );

      if (!existing || existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Quality issue not found",
        });
      }

      await updateData(
        "td_purchase_quality_issue",
        {
          resolution_status: "RESOLVED",
          resolution_remarks: resolution_remarks || "Resolved by Admin",
          resolved_by: resolved_by || 1,
          resolved_at: new Date(),
        },
        `issue_id = ${issue_id}`
      );

      return res.status(200).json({
        success: true,
        message: "Quality issue resolved successfully. Stock is now available for DPR work progress.",
      });
    } catch (error) {
      console.error("Error resolving quality issue:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to resolve quality issue",
        error: error.message,
      });
    }
  };

  // 3️⃣ Resend email to vendor
  resendVendorEmail = async (req, res) => {
    try {
      const issue_id = Number(req.params.id);
      if (!issue_id) {
        return res.status(400).json({
          success: false,
          message: "Issue ID is required",
        });
      }

      const sql = `
        SELECT
          qi.*,
          p.product_name,
          v.vendor_name,
          v.vendor_email,
          pr.project_name,
          ps.project_site_name,
          st.store_name
        FROM td_purchase_quality_issue qi
        LEFT JOIN md_product p ON p.product_id = qi.product_id
        LEFT JOIN md_vendor v ON v.vendor_id = qi.vendor_id
        LEFT JOIN md_project pr ON pr.project_id = qi.project_id
        LEFT JOIN md_project_site ps ON ps.project_site_id = qi.site_id
        LEFT JOIN md_store st ON st.store_id = qi.store_id
        WHERE qi.issue_id = ${issue_id}
      `;

      const rows = await customSelectSqlQuery(sql);
      if (!rows || rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Issue not found",
        });
      }

      const issue = rows[0];
      if (!issue.vendor_email) {
        return res.status(400).json({
          success: false,
          message: `Vendor '${issue.vendor_name}' does not have a registered email address.`,
        });
      }

      const mailResult = await sendVendorDefectiveItemsEmail({
        to: issue.vendor_email,
        vendorName: issue.vendor_name,
        invoiceNo: issue.invoice_no,
        poNo: issue.po_no,
        projectName: issue.project_name,
        siteName: issue.project_site_name,
        storeName: issue.store_name,
        items: [
          {
            product_name: issue.product_name,
            quantity: issue.quantity,
            unit_rate: issue.unit_rate,
            total_amount: issue.total_amount,
            quality_status: issue.quality_status,
          },
        ],
        remarks: issue.remarks,
      });

      const emailStatus = mailResult.success ? "SENT" : "FAILED";
      await updateData(
        "td_purchase_quality_issue",
        {
          email_sent_status: emailStatus,
          email_sent_at: new Date(),
        },
        `issue_id = ${issue_id}`
      );

      if (!mailResult.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to dispatch email",
          error: mailResult.error,
        });
      }

      return res.status(200).json({
        success: true,
        message: `Notification email successfully resent to ${issue.vendor_email}`,
      });
    } catch (error) {
      console.error("Error resending email:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to resend email",
        error: error.message,
      });
    }
  };
}

module.exports = new PurchaseQualityIssueController();
