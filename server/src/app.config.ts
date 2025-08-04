import dotenv from "dotenv";
import Razorpay from "razorpay";
import { Tier } from "./mongodb/schematics/User";

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay credentials are not defined in environment variables.");
}

export const corsConfig = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    const allowedOrigins = [
      `http://localhost:${process.env.CLIENT_PORT || 5173}`,
      "https://ispendly.netlify.app",
    ];

    // Allow ngrok during dev (any subdomain)
    // if (origin?.includes("ngrok-free.app")) {
    //   return callback(null, true);
    // }

    // Allow from whitelist
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};


export const backupPort = 4000;

export const jwtKey = process.env.JWT_SECRET;

export const generateISTTimestamp = (): string => {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const PlusID = process.env.PLUS_ID as string;
export const PremiumID = process.env.PREMIUM_ID as string;

export function determineTierByAmount(amount: number): Tier {
  switch (amount) {
    case 99:
      return Tier.Plus;
    case 199:
      return Tier.Premium;
    default:
      console.warn(`Unrecognized amount received in payment: ₹${amount}`);
      return Tier.Free;
  }
}

export function calculateExpiryTimestamp(): number {
  const oneMonth = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  return Date.now() + oneMonth;
}
