import nodemailer from "nodemailer";
import config from "../config/config.js";
import { generateOTP } from "../utils/otp.util.js";

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

export const sendWelcomeEmail = async (userEmail, name) => {
  const subject = "Welcome to SBI Bhubaneswar!";
  const html = `<div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; padding: 40px 20px; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-top: 5px solid #2874F0;">
    
    <div style="padding: 40px 30px;">
      <h2 style="margin-top: 0; color: #2874F0; font-size: 22px;">Welcome Aboard! 🚀</h2>
      
      <p style="font-size: 16px; line-height: 1.6; color: #444;">Dear <strong>${name}</strong>,</p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #555;">
        Thank you for registering with <strong>SBI Bhubaneswar</strong>. Your profile is successfully set up and you're ready to get started. We are thrilled to have you with us!
      </p>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="#" style="background-color: #2874F0; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 5px; font-weight: 600; font-size: 16px; display: inline-block;">
          Go to Dashboard
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
      
      <p style="font-size: 14px; color: #888; margin-bottom: 5px;">Best regards,</p>
      <p style="font-size: 16px; font-weight: bold; color: #2874F0; margin-top: 0;">SBI Bhubaneswar Team</p>
    </div>
    
  </div>
</div>`;
  await sendEmail(userEmail, subject, html); // ← call the generic sender
};
export const sendTransactionEmail = async (
  userEmail,
  name,
  amount,
  toAccount,
) => {
  const subject = "Transaction Receipt: Transfer Successful ✅";

  // Clean fallback for plain-text email clients
  const text = `Hello ${name},\n\nYour transaction was successful.\n\nAmount: $${amount}\nTransferred To: ${toAccount}\nStatus: Completed\n\nThank you for using our services.\n\nBest regards,\nThe Backend Ledger Team`;

  // Sleek, modern FinTech receipt for HTML email clients
  const html = `
    <div style="font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px; color: #1f2937;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
        
        <!-- Header -->
        <div style="background-color: #10b981; padding: 20px; text-align: center;">
          <h2 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">Transfer Successful</h2>
        </div>
        
        <!-- Body -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #4b5563; margin-top: 0;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 15px; color: #6b7280; line-height: 1.6;">Your recent transaction has been processed successfully. Here are the details of your transfer:</p>
          
          <!-- Receipt Box -->
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.05em;">Amount Sent</p>
            <p style="font-size: 32px; font-weight: 700; color: #10b981; margin: 0;">$${amount}</p>
          </div>
          
          <!-- Transaction Details -->
          <table style="width: 100%; font-size: 14px; color: #4b5563; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">To Account</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-family: monospace; font-weight: 600;">${toAccount}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Status</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #10b981;">Completed</td>
            </tr>
          </table>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; line-height: 1.5;">If you did not authorize this transaction, please contact our support team immediately.</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 13px; color: #9ca3af; margin: 0;">&copy; The Backend Ledger Team</p>
        </div>
        
      </div>
    </div>
  `;

  await sendEmail(userEmail, subject, text, html);
};

export const sendTransactionFailureEmail = async (
  userEmail,
  name,
  amount,
  toAccount,
) => {
  const subject = "Transaction Alert: Transfer Failed ⚠️";

  // Clean fallback for plain-text email clients
  const text = `Hello ${name},\n\nWe regret to inform you that your recent transaction could not be completed.\n\nAttempted Amount: $${amount}\nTo Account: ${toAccount}\nStatus: Failed\n\nPlease note that no funds have been deducted from your account. Please check your balance or try again later.\n\nBest regards,\nThe Backend Ledger Team`;

  // Sleek, modern FinTech alert for HTML email clients
  const html = `
    <div style="font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px; color: #1f2937;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
        
        <!-- Header -->
        <div style="background-color: #ef4444; padding: 20px; text-align: center;">
          <h2 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">Transfer Failed</h2>
        </div>
        
        <!-- Body -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #4b5563; margin-top: 0;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 15px; color: #6b7280; line-height: 1.6;">We regret to inform you that your recent transaction could not be processed. <strong>No funds have been deducted from your account.</strong></p>
          
          <!-- Failed Transaction Box -->
          <div style="background-color: #fef2f2; border-radius: 8px; border: 1px solid #fca5a5; padding: 20px; margin: 25px 0; text-align: center;">
            <p style="font-size: 14px; color: #b91c1c; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.05em;">Attempted Transfer</p>
            <p style="font-size: 32px; font-weight: 700; color: #ef4444; margin: 0; text-decoration: line-through;">$${amount}</p>
          </div>
          
          <!-- Transaction Details -->
          <table style="width: 100%; font-size: 14px; color: #4b5563; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">To Account</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-family: monospace; font-weight: 600;">${toAccount}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Status</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #ef4444;">Failed</td>
            </tr>
          </table>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; line-height: 1.5;">Please verify your account details or check your current balance before trying again. If you need assistance, contact our support team.</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 13px; color: #9ca3af; margin: 0;">&copy; The Backend Ledger Team</p>
        </div>
        
      </div>
    </div>
  `;

  await sendEmail(userEmail, subject, text, html);
};

const getOTPHtml = (name, email, otp) => {
  const digits = otp.toString().split("");

  const digitBoxes = digits
    .map(
      (d) => `
    <span style="display:inline-block;width:44px;height:52px;background:#fff;
      border:0.5px solid #AFA9EC;border-radius:8px;font-size:24px;font-weight:500;
      color:#3C3489;line-height:52px;text-align:center;">${d}</span>
  `,
    )
    .join("");

  return `
  <div style="font-family:sans-serif;max-width:520px;margin:0 auto;
    border:0.5px solid #e5e5e5;border-radius:12px;overflow:hidden;">

    <div style="background:#1a1a2e;padding:2rem 2.5rem 1.5rem;text-align:center;">
      <h1 style="color:#fff;font-size:22px;font-weight:500;margin:0 0 4px;">
        Verify your email
      </h1>
      <p style="color:#AFA9EC;font-size:14px;margin:0;">
        One-time password to confirm your identity
      </p>
    </div>

    <div style="padding:2rem 2.5rem;background:#fff;">
      <p style="color:#888;font-size:14px;margin:0 0 4px;">Hello,</p>
      <p style="color:#111;font-size:15px;font-weight:500;margin:0 0 1.5rem;">
        ${name}
      </p>
      <p style="color:#666;font-size:14px;line-height:1.7;margin:0 0 1.5rem;">
        We received a request to verify the email address
        <strong style="color:#111;">${email}</strong>
        associated with your account. Use the code below to complete verification.
      </p>

      <div style="background:#EEEDFE;border-radius:12px;padding:1.5rem;
        text-align:center;margin:0 0 1.5rem;">
        <p style="color:#7F77DD;font-size:12px;font-weight:500;
          letter-spacing:1.5px;text-transform:uppercase;margin:0 0 8px;">
          Your OTP
        </p>
        <div style="display:flex;justify-content:center;gap:10px;">
          ${digitBoxes}
        </div>
        <p style="color:#7F77DD;font-size:12px;margin:12px 0 0;">
          ⏱ Expires in 10 minutes
        </p>
      </div>

      <div style="background:#f5f5f5;border-left:3px solid #7F77DD;
        border-radius:0 8px 8px 0;padding:12px 16px;margin:0 0 1.5rem;">
        <p style="color:#666;font-size:13px;margin:0;line-height:1.6;">
          If you didn't request this, you can safely ignore this email.
          Your account remains secure.
        </p>
      </div>

      <p style="color:#666;font-size:13px;margin:0;">
        Best regards,<br/>
        <strong style="color:#111;">SBI Bhubaneswar Team</strong>
      </p>
    </div>

    <div style="border-top:0.5px solid #e5e5e5;padding:1rem 2.5rem;
      background:#fff;display:flex;justify-content:space-between;">
      <p style="color:#aaa;font-size:12px;margin:0;">© 2026 SBI Bhubaneswar</p>
      <p style="color:#aaa;font-size:12px;margin:0;">Do not reply to this email</p>
    </div>
  </div>`;
}

export const sendOTPEmail = async (userEmail, name, otp) => {
  const otpHtml = getOTPHtml(name, userEmail, otp);
  await sendEmail(userEmail, "Verify your email", otpHtml);
};
