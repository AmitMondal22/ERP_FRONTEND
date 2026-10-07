// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// const sendEmployeeCredentials = async ({ to, employeeId, password }) => {
//   if (!to) return;

//   const mailOptions = {
//     from: `"HR Team" <${process.env.EMAIL_FROM}>`,
//     to,
//     subject: "Your Employee Login Credentials",
//     html: `
//       <h3>Welcome to the Company</h3>
//       <p>Your employee account has been created.</p>

//       <p><b>Employee ID:</b> ${employeeId}</p>
//       <p><b>Password:</b> ${password}</p>

//       <p>If you want you can change your password after first login.</p>
//     `,
//   };

//   await transporter.sendMail(mailOptions);
// };

// module.exports = { sendEmployeeCredentials };




const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const sendEmployeeCredentials = async ({ to, employeeId, password }) => {
  if (!to) {
    console.log("No recipient email found.");
    return;
  }

  // console.log("Preparing to send mail...");
  // console.log("To :", to);

  try {
    //console.log("Verifying SMTP connection...");

    await transporter.verify();

    console.log("SMTP Connection Successful");
  } catch (err) {
    console.error("SMTP Verification Failed");
    console.error(err);
    throw err;
  }

  const mailOptions = {
    from: `"HR Team" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Your Employee Login Credentials",
    html: `
      <h3>Welcome to the Company</h3>
      <p>Your employee account has been created.</p>

      <p><b>Employee ID:</b> ${employeeId}</p>
      <p><b>Password:</b> ${password}</p>

      <p>If you want you can change your password after first login.</p>
    `,
  };

  console.log("Mail Options");
  console.log(mailOptions);

  try {
    const info = await transporter.sendMail(mailOptions);

    console.log("Mail Sent Successfully");
    console.log("Message ID :", info.messageId);
    console.log("Accepted :", info.accepted);
    console.log("Rejected :", info.rejected);
    console.log("Response :", info.response);

    return info;
  } catch (err) {
    console.error("sendMail Failed");
    console.error(err);
    console.error("Error Message :", err.message);
    console.error("Error Code :", err.code);
    console.error("SMTP Response :", err.response);

    throw err;
  }
};

const sendVendorDefectiveItemsEmail = async ({
  to,
  vendorName,
  invoiceNo,
  poNo,
  projectName,
  siteName,
  storeName,
  items = [],
  remarks = "",
}) => {
  if (!to) {
    console.log("[MAILER] No vendor recipient email provided. Skipping email dispatch.");
    return { success: false, message: "No recipient email provided" };
  }

  const itemsHtml = items
    .map(
      (item, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; text-align: center; color: #4a5568;">${idx + 1}</td>
        <td style="padding: 10px 12px; font-weight: 600; color: #2d3748;">${item.product_name || "N/A"}</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #e53e3e;">${item.quantity || item.invoice_qty || 0}</td>
        <td style="padding: 10px 12px; text-align: right; color: #4a5568;">₹${parseFloat(item.unit_rate || 0).toFixed(2)}</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #2d3748;">₹${parseFloat(item.total_amount || 0).toFixed(2)}</td>
        <td style="padding: 10px 12px; text-align: center;">
          <span style="background-color: ${
            item.quality_status === "Quality Damage" ? "#fed7d7" : "#feebc8"
          }; color: ${
        item.quality_status === "Quality Damage" ? "#9b2c2c" : "#7b341e"
      }; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
            ${item.quality_status}
          </span>
        </td>
      </tr>
    `
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Defective Material Quality Notification</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7fafc; margin: 0; padding: 24px;">
      <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 24px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Defective / Damaged Material Notification</h2>
          <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Attention: Material Inspection Quality Team</p>
        </div>

        <!-- Body -->
        <div style="padding: 24px;">
          <p style="font-size: 15px; color: #2d3748; margin-top: 0;">
            Dear <strong>${vendorName || "Vendor"}</strong>,
          </p>
          <p style="font-size: 14px; color: #4a5568; line-height: 1.6;">
            Upon receiving and inspecting the consignment at our store, the following products were found to be <strong>Defective / Damaged / Not Good Quality</strong>. Please review the details below:
          </p>

          <!-- Consignment Details -->
          <div style="background-color: #f8fafc; border-radius: 6px; padding: 16px; margin: 20px 0; border: 1px solid #edf2f7;">
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #718096; width: 35%;"><strong>Invoice No:</strong></td>
                <td style="padding: 4px 0; color: #1a202c; font-weight: 600;">${invoiceNo || "N/A"}</td>
              </tr>
              ${
                poNo
                  ? `<tr>
                <td style="padding: 4px 0; color: #718096;"><strong>PO No:</strong></td>
                <td style="padding: 4px 0; color: #1a202c; font-weight: 600;">${poNo}</td>
              </tr>`
                  : ""
              }
              ${
                projectName
                  ? `<tr>
                <td style="padding: 4px 0; color: #718096;"><strong>Project:</strong></td>
                <td style="padding: 4px 0; color: #1a202c;">${projectName}</td>
              </tr>`
                  : ""
              }
              ${
                siteName
                  ? `<tr>
                <td style="padding: 4px 0; color: #718096;"><strong>Site:</strong></td>
                <td style="padding: 4px 0; color: #1a202c;">${siteName}</td>
              </tr>`
                  : ""
              }
              ${
                storeName
                  ? `<tr>
                <td style="padding: 4px 0; color: #718096;"><strong>Store / Warehouse:</strong></td>
                <td style="padding: 4px 0; color: #1a202c;">${storeName}</td>
              </tr>`
                  : ""
              }
              <tr>
                <td style="padding: 4px 0; color: #718096;"><strong>Inspection Date:</strong></td>
                <td style="padding: 4px 0; color: #1a202c;">${new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}</td>
              </tr>
            </table>
          </div>

          <!-- Items Table -->
          <h4 style="margin: 20px 0 10px 0; color: #2d3748; font-size: 15px;">Defective Items Breakdown:</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #edf2f7; color: #4a5568; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">
                <th style="padding: 10px 12px; text-align: center; border-radius: 4px 0 0 0;">#</th>
                <th style="padding: 10px 12px; text-align: left;">Product</th>
                <th style="padding: 10px 12px; text-align: right;">Defective Qty</th>
                <th style="padding: 10px 12px; text-align: right;">Unit Rate</th>
                <th style="padding: 10px 12px; text-align: right;">Total Amt</th>
                <th style="padding: 10px 12px; text-align: center; border-radius: 0 4px 0 0;">Quality Status</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          ${
            remarks
              ? `<div style="margin: 16px 0; padding: 12px; background-color: #fffaf0; border-left: 4px solid #dd6b20; border-radius: 4px;">
              <strong style="color: #c05621; font-size: 13px;">Inspection Remarks:</strong>
              <p style="margin: 4px 0 0 0; color: #744210; font-size: 13px;">${remarks}</p>
            </div>`
              : ""
          }

          <p style="font-size: 14px; color: #4a5568; line-height: 1.6;">
            Kindly arrange for an immediate replacement, credit note, or repair as per our procurement terms. Please acknowledge receipt of this email with your proposed resolution timeline.
          </p>

          <p style="font-size: 14px; color: #2d3748; margin-bottom: 0;">
            Thank you,<br>
            <strong>Store & Quality Management Team</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f7fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #a0aec0;">
          This is an automated notification generated by the ERP Quality Management System.
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Quality Management" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject: `⚠️ Defective/Damaged Material Report - Invoice: ${invoiceNo}${poNo ? ` | PO: ${poNo}` : ""}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("[MAILER] Defective items notification sent successfully to", to, "MessageId:", info.messageId);
    return { success: true, messageId: info.messageId, info };
  } catch (err) {
    console.error("[MAILER] Failed to send defective items email to vendor:", err);
    return { success: false, error: err.message };
  }
};

module.exports = { sendEmployeeCredentials, sendVendorDefectiveItemsEmail };