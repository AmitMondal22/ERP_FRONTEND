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



const sendEmployeeCredentials = async ({ to, employeeId, password }) => {
  if (!to) {
    console.log("No recipient email found.");
    return;
  }

  console.log("Preparing to send mail...");
  console.log("To :", to);

  try {
    console.log("Verifying SMTP connection...");

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

module.exports = { sendEmployeeCredentials };