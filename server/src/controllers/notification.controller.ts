import nodemailer from "nodemailer";
import dotenv from "dotenv";

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
export async function sendWelcomeEmail(name: string, email: string): Promise<void> {
  try {
    const mailOptions = {
      from: `"Spendly" <${process.env.APP_MAIL}>`,
      to: email,
      subject: `Welcome to Spendly`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color:rgb(46, 151, 204);">Welcome to Spendly, ${name}!</h1>
          <p>We're thrilled to have you on board and excited to be part of your financial uprising journey.</p>
          <hr/>
          <p style="font-size: 0.9em; color: #888;">If you have any questions, feel free to reach out to our support team.</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Welcome email failed:", getErrorMessage(error));
  }
}
