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
export async function sendWelcomeEmail(
  name: string,
  email: string,
  time: string,
  type: NotificationType
): Promise<void> {
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

// Send login email
export async function sendLoginEmail(
  name: string,
  email: string,
  time: string,
  type: NotificationType
): Promise<void> {
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
    console.error("Login email failed:", getErrorMessage(error));
  }
}

export async function sendAutopayReminderEmail(
  name: string,
  email: string,
  spentOn: string,
  amount: number,
  reoccurance: number,
  time: string
): Promise<void> {
  try {
    const mailOptions = {
      from: `"Spendly" <${process.env.APP_MAIL}>`,
      to: email,
      subject: `Upcoming Autopay Reminder`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color:rgb(46, 151, 204);">Heads Up, ${name}!</h1>
          <p>You have an <strong>autopay transaction</strong> coming up for <strong>${spentOn}</strong>.</p>
          <p><strong>Amount:</strong> ₹${amount}</p>
          <p><strong>Recurring in:</strong> ${reoccurance} days</p>
          <p>Make sure your balance is sufficient to avoid failures.</p>
          <hr/>
          <p style="font-size: 0.9em; color: #888;">Reminder generated on ${time}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send autopay reminder email:", error);
  }
}

// low balance mail
export async function sendLowBalanceEmail(
  name: string,
  email: string,
  time: string,
  type: NotificationType
): Promise<void> {
  try {
    const mailOptions = {
      from: `"Spendly" <${process.env.APP_MAIL}>`,
      to: email,
      subject: `⚠️ Low Monthly Balance Alert`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color:rgb(46, 151, 204);">Heads Up, ${name}!</h2>
          <hr/>
          <p>We've noticed that you're approaching the limit of your monthly budget. To help you stay on track with your financial goals, we recommend being mindful of your upcoming expenses.</p>
          <p><strong>Tip:</strong> Review your recent transactions and prioritize essential spending for the rest of the month.</p>
          <p>Maintaining a healthy budget ensures you're prepared for both expected and unexpected expenses.</p>
          <hr/>
          <p style="font-size: 0.9em; color: #888;">This is an automated reminder from Spendly.</p>
          <p>Notification Type: <strong>${type}</strong> | ${time}</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Low balance email failed:", getErrorMessage(error));
  }
}

// 10% spending mail
export async function sendSignificantTransectionEmail(
  name: string,
  email: string,
  amount: number,
  spentOn: string,
  time: string,
  type: NotificationType
): Promise<void> {
  try {
    const mailOptions = {
      from: `"Spendly" <${process.env.APP_MAIL}>`,
      to: email,
      subject: `Significant Spending Alert!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color:rgb(46, 151, 204);">You've made a Significant Transaction!</h2>
          <hr/>
          <p>Hello ${name},</p>
          <p>We noticed a transaction of ₹${amount} on ${spentOn}. This is over <strong>10%</strong> of your remaining budget in a single transaction.</p>
          <p>We advise you to monitor your budget closely to maintain financial stability.</p>
          <hr/>
          <p>Notification Type: ${type}</p>
          <p>Timestamp: ${time}</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(
      "Significant transaction email failed:",
      getErrorMessage(error)
    );
  }
}

// 15% mail
export async function sendLargeTransectionEmail(
  name: string,
  email: string,
  amount: number,
  spentOn: string,
  time: string,
  type: NotificationType
): Promise<void> {
  try {
    const mailOptions = {
      from: `"Spendly" <${process.env.APP_MAIL}>`,
      to: email,
      subject: `Large Transaction Alert!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color:rgb(255, 165, 0);">Large Expense Alert!</h2>
          <hr/>
          <p>Hello ${name},</p>
          <p>You've just made a transaction of ₹${amount} on ${spentOn}, which is over <strong>15%</strong> of your remaining budget.</p>
          <p>This is a large expense — be sure you're aligned with your financial priorities for the month.</p>
          <hr/>
          <p>Notification Type: ${type}</p>
          <p>Timestamp: ${time}</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Large transaction email failed:", getErrorMessage(error));
  }
}

// >20% mail
export async function sendVeryLargeTransectionEmail(
  name: string,
  email: string,
  amount: number,
  spentOn: string,
  time: string,
  type: NotificationType
): Promise<void> {
  try {
    const mailOptions = {
      from: `"Spendly" <${process.env.APP_MAIL}>`,
      to: email,
      subject: `🚨 Very Large Expenditure Alert!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color:rgb(204, 0, 0);">🚨 Very Large Expenditure!</h2>
          <hr/>
          <p>Hello ${name},</p>
          <p>You've made a transaction of ₹${amount} on ${spentOn}, which is over <strong>20%</strong> of your remaining budget.</p>
          <p>This is a very large expenditure and should be intentional. Please reassess your budget to ensure you're on track financially.</p>
          <hr/>
          <p>Notification Type: ${type}</p>
          <p>Timestamp: ${time}</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(
      "Very large transaction email failed:",
      getErrorMessage(error)
    );
  }
}