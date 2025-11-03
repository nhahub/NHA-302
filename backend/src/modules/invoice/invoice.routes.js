import { Router } from "express";
import * as invoiceController from "./invoice.controller.js";
import {
  protect,
  restrictTo,
} from "../../utils/middlewares/auth.middleware.js";

const router = Router();

router.route("/stats").get(protect, invoiceController.getInvoiceStats);
router.get("/", protect, invoiceController.getAllInvoices);
router.get("/status/:status", protect, invoiceController.getInvoicesByStatus);
router
  .route("/:id")
  .get(protect, invoiceController.getInvoiceById)
  .patch(protect, invoiceController.updateInvoice)
  .delete(protect, invoiceController.deleteInvoice);
router.post("/", protect, invoiceController.createInvoice);

router.route("/export/:id").get(protect, invoiceController.exportInvoices);
router
  .route("/company/:id")
  .get(protect, invoiceController.getInvoicesByCompany);

export default router;
