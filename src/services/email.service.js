import nodemailer from "nodemailer";
import config from "../config/config.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: config.GOOGLE_USER_EMAIL,
    clientId: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    refreshToken: config.GOOGLE_REFRESH_TOKEN,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("Error setting up email transporter:", error);
  } else {
    console.log("Email transporter is ready to send emails.");
  }
});

// Function to send email
export const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"SBI Bhubaneswar" <${config.GOOGLE_USER_EMAIL}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

async function sendRegisterEmail(userEmail,name) {
  const subject = "Welcome to SBI Bhubaneswar!";
  const html = `<p>Dear ${name},</p>
    <p>Thank you for registering with SBI Bhubaneswar. We are excited to have you on board!</p>
    <p>If you have any questions or need assistance, please feel free to contact our support team.</p>
    <p>Best regards,<br/>SBI Bhubaneswar Team</p>`;
  await sendEmail(userEmail, subject, html);
}

export default sendRegisterEmail;



