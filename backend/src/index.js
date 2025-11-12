import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import globalErrorHandler from "./utils/middlewares/globalErrorHandler.js";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";
import AppError from "./utils/services/appError.js";
import passport from "passport";
import AuthRoutes from "./modules/auth/auth.routes.js";
import ProductRoutes from "./modules/product/product.routes.js";
import PricingBillingRoutes from "./modules/pricing_billing/pricing_billing.routes.js";
import CustomerRoutes from "./modules/customer/customer.routes.js";
import CompanyRoutes from "./modules/company/company.routes.js";
import "./config/passport.js";
import cron from "node-cron";
import { chargeAllUsers } from "./modules/pricing_billing/pricing_billing.service.js";
import InvoiceRoutes from "./modules/invoice/invoice.routes.js";
import ReportRoutes from "./modules/report/report.routes.js";
import AIAssistanceRoutes from "./modules/AiAssistance/aiAssistance.route.js";
import CronRoutes from "./modules/cron/cron.routes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();
const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 60,
  message: "Too many requests, please try again",
});

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL ? 
      [process.env.FRONTEND_URL] : 
      ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);
app.use(limiter);
app.use(morgan("dev"));
app.use(cookieParser());

app.use(passport.initialize());
const uploadsPath = path.join(__dirname, "..", "uploads");

app.use("/uploads", express.static(uploadsPath));

app.use("/api/auth", AuthRoutes);
app.use("/api/product", ProductRoutes);
app.use("/api/pricing_billing", PricingBillingRoutes);
app.use("/api/customer", CustomerRoutes);
app.use("/api/company", CompanyRoutes);
app.use("/api/invoice", InvoiceRoutes);
app.use("/api/reports", ReportRoutes);
app.use("/api/ai", AIAssistanceRoutes);
app.use("/api/cron", CronRoutes);

app.use((req, res, next) =>
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
);
app.use(globalErrorHandler);

//node-cron => is a time-based job scheduler runs automatically at a specific time
if (isProduction || process.env.ENABLE_CRON === 'true') {
  cron.schedule("0 0 * * *", async () => {
    console.log("Starting scheduled batch charge...");
    await chargeAllUsers();
    console.log("Finished scheduled batch charge");
  });
  console.log("✅ Cron job enabled - Daily billing charges scheduled");
} else {
  console.log("⚠️ Cron jobs disabled in development mode");
}

// Traditional server for local development
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${isProduction ? 'Production' : 'Development'}`);
  });
}

// Export for Vercel serverless deployment
export default app;
