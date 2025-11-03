import { Router } from "express";
import {
  getReportStats,
  getRevenueOverTime,
  getTopProducts,
  getTopCustomers,
} from "./report.controller.js";
import { protect } from "../../utils/middlewares/auth.middleware.js";

const router = Router();

router.get("/stats", protect, getReportStats);

router.get("/revenue", protect, getRevenueOverTime);

router.get("/top-products", protect, getTopProducts);

router.get("/top-customers", protect, getTopCustomers);

export default router;
