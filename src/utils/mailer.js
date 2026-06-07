import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an OTP verification email to the user
 * @param {string} toEmail - Recipient email
 * @param {string} otp - The 6-digit OTP
 * @param {string} subject - Email subject line
 */
export const sendOTPEmail = async (toEmail, otp, subject) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || `"Feedback Portal" <no-reply@feedbackportal.com>`,
      to: toEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #4F46E5; text-align: center;">Feedback Portal Authentication</h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p>Hello,</p>
          <p>You requested a one-time verification code. Please use the following OTP code to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; background: #F3F4F6; padding: 10px 20px; border-radius: 4px; display: inline-block;">${otp}</span>
          </div>
          <p>This code is valid for <strong>5 minutes</strong>. If you did not request this code, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${toEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${toEmail}:`, error.message);
    // Fallback: log the OTP to console so development is not blocked
    console.log(`\n=========================================\n[DEV MODE OTP FALLBACK] OTP for ${toEmail} is: ${otp}\n=========================================\n`);
    return false;
  }
};
