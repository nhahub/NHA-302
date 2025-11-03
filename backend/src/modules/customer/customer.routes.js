import express from "express";
import * as customerController from "./customer.controller.js";
import { protect, restrictTo } from "../../utils/middlewares/auth.middleware.js";

const customerRouter = express.Router();

customerRouter.route("/")
    .post(protect, customerController.createCustomer)
    .get(protect, restrictTo("admin"), customerController.getAllCustomers);

customerRouter.route("/:id")
    .get(protect, customerController.getCustomerById)
    .patch(protect, customerController.updateCustomer)
    .delete(protect, customerController.deleteCustomer);

customerRouter.route("/:id/invoices")
    .get(protect, restrictTo("user"), customerController.getCustomerInvoices);

customerRouter.route("/:id/company")
    .get(protect, restrictTo("user"), customerController.getCustomerByCompany);

customerRouter.route("/:id/count")
    .get(protect, restrictTo("admin"),customerController.getCustomerCountByCompany);

export default customerRouter;
