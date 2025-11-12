import express from "express";
import { handleDailyBilling } from "./cron.controller.js";

const router = express.Router();

// Protected endpoint for daily billing cron job
// This will be triggered by external cron service (cron-job.org or similar)
router.post("/daily-billing", handleDailyBilling);

export default router;
