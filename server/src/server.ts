import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router } from "./router";
import { connectMongoDB } from "./mongodb/mongodb.config";
import { backupPort, corsConfig } from "./app.config";
import { initializeAutopayJobs } from "./controllers/autopay.controller";
import { initializeMonthlySavingsJobs } from "./controllers/monthly.savings.controller";

dotenv.config();

const app = express();
const PORT = process.env.PORT || backupPort;

app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

connectMongoDB();

// Initialize autopay cron jobs
initializeAutopayJobs();

// Initialize monthly savings cron jobs
initializeMonthlySavingsJobs();

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
