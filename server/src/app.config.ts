import dotenv from "dotenv";

dotenv.config();

export const corsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      `http://localhost:${process.env.CLIENT_PORT}`
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

export const backupPort = 4000;

export const jwtKey =
  process.env.JWT_SECRET ||
  "dev_fallback_71c2b94e8a1045d28c8a3d2c905fa7b34bde1e6c5f0f4993b02174c9f9e16a3f";


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