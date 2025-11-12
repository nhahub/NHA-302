import { chargeAllUsers } from "../pricing_billing/pricing_billing.service.js";
import catchAsync from "../../utils/middlewares/catchAsync.js";
import AppError from "../../utils/services/appError.js";

/**
 * Handle daily billing charge
 * Protected endpoint that should be called by external cron service
 * 
 * Security: Requires CRON_SECRET token in Authorization header
 * Usage: POST /api/cron/daily-billing
 * Header: Authorization: Bearer YOUR_CRON_SECRET
 */
export const handleDailyBilling = catchAsync(async (req, res, next) => {
  // Verify cron secret for security
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;

  if (!cronSecret) {
    return next(new AppError("Cron secret not configured", 500));
  }

  // Check if authorization header exists
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized: Missing or invalid authorization header", 401));
  }

  // Extract token from "Bearer TOKEN"
  const token = authHeader.split(" ")[1];

  // Verify token matches cron secret
  if (token !== cronSecret) {
    return next(new AppError("Unauthorized: Invalid cron secret", 401));
  }

  // Execute daily billing charge
  console.log("🔄 Starting scheduled batch charge via cron endpoint...");
  const startTime = Date.now();

  try {
    await chargeAllUsers();
    const duration = Date.now() - startTime;
    
    console.log(`✅ Finished scheduled batch charge in ${duration}ms`);
    
    res.status(200).json({
      status: "success",
      message: "Daily billing charge completed successfully",
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Error during daily billing charge:", error);
    return next(new AppError("Failed to complete daily billing charge", 500));
  }
});
