import express from "express";
import * as pricingBillingController from "./pricing_billing.controller.js";
import {
  protect,
  restrictTo,
} from "../../utils/middlewares/auth.middleware.js";

const router = express.Router();

router.post("/add-card", protect, pricingBillingController.attatchCard);
router.post("/track-usage", protect, pricingBillingController.UsageTracker);
router.delete("/remove-card", protect, pricingBillingController.deleteCard);
router.get("/summary", protect, pricingBillingController.getBillingSummary);
router.get(
  "/admin-summary",
  protect,
  restrictTo("admin"),
  pricingBillingController.getAdminBillingSummary
);

//for manual charging (testing)
router.post(
  "/charge-all",
  protect,
  restrictTo("admin"),
  pricingBillingController.chargeAllUsersManual
);

export default router;
