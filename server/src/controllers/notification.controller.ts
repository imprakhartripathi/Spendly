import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { NotificationType } from "../mongodb/schematics/Notifications";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_MAIL,
    pass: process.env.MAIL_PASS, 
  },
});

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// Send welcome email
export async function sendWelcomeEmail(name: string, email: string, time: string, type: NotificationType): Promise<void> {
  try {
    const mailOptions = {
      from: `"Spendly" <${process.env.APP_MAIL}>`,
      to: email,
      subject: `Welcome to Spendly`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color:rgb(46, 151, 204);">Welcome to Spendly, ${name}!</h1>
          <p>You just signed up on a device at - <strong>${time}</strong>.</p>
          <p>We're thrilled to have you on board and excited to be part of your financial uprising journey.</p>
          <hr/>
          <p style="font-size: 0.9em; color: #888;">If you have any questions, feel free to reach out to our support team.</p>
          <p>Type: ${type}.</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Welcome email failed:", getErrorMessage(error));
  }
}


// Send welcome email
export async function sendLoginEmail(name: string, email: string, time: string, type: NotificationType): Promise<void> {
  try {
    const mailOptions = {
      from: `"Spendly" <${process.env.APP_MAIL}>`,
      to: email,
      subject: `Welcome to Spendly`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color:rgb(46, 151, 204);">New Login Instance Generated on Spendly!</h1>
          <hr/>
          <h1>Hello ${name}!</h1>
          <p>You just Logged In on a device at - <strong>${time}</strong>.</p>
          <hr/>
          <p style="font-size: 0.9em; color: #888;">If you have any questions, feel free to reach out to our support team.</p>
          <p>Type: ${type}.</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Welcome email failed:", getErrorMessage(error));
  }
}
