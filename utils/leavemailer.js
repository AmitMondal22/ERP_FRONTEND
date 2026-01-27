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

/**
 * 📩 Mail to MANAGER when employee applies for leave
 */
const sendLeaveRequestMail = async ({
  to,
  managerName,
  employeeName,
  startDate,
  endDate,
  reason,
}) => {
  if (!to) return;

  const mailOptions = {
    from: `"HR Team" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "New Leave Request Approval Needed",
    html: `
      <h3>Hello ${managerName || "Manager"},</h3>

      <p>A new leave request has been submitted.</p>

      <p><b>Employee:</b> ${employeeName}</p>
      <p><b>From:</b> ${startDate}</p>
      <p><b>To:</b> ${endDate}</p>
      <p><b>Reason:</b> ${reason || "Not mentioned"}</p>

      <br />
      <p>Please login to the system to approve or reject this request.</p>

      <p>Regards,<br/>HR Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * 📩 Mail to EMPLOYEE when leave is APPROVED or REJECTED
 */
const sendLeaveStatusMail = async ({
  to,
  employeeName,
  status,
  startDate,
  endDate,
}) => {
  if (!to) return;

  const isApproved = status === "approved";

  const mailOptions = {
    from: `"HR Team" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `Your Leave Request Has Been ${status.toUpperCase()}`,
    html: `
      <h3>Hello ${employeeName},</h3>

      <p>Your leave request has been <b style="color:${
        isApproved ? "green" : "red"
      };">${status.toUpperCase()}</b>.</p>

      <p><b>From:</b> ${startDate}</p>
      <p><b>To:</b> ${endDate}</p>

      <br />

      ${
        isApproved
          ? `<p>Enjoy your leave 😊</p>`
          : `<p>If you have questions, please contact your manager or HR.</p>`
      }

      <br />
      <p>Regards,<br/>HR Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendLeaveRequestMail,
  sendLeaveStatusMail,
};
