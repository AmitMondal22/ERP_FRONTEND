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
  if (!to) return;

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

  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmployeeCredentials };
