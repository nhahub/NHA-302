import express from "express";
import * as companyController from "./company.controller.js";
import {
  protect,
  restrictTo,
} from "../../utils/middlewares/auth.middleware.js";
import { uploadCompanyLogo } from "../../utils/middlewares/upload.middleware.js";

const companyRouter = express.Router();

companyRouter
  .route("/")
  .post(protect, companyController.createCompany)
  .get(protect, restrictTo("admin"), companyController.getAllCompanies);

companyRouter
  .route("/summary/:id")
  .get(protect, restrictTo("admin"), companyController.getCompanySummary);

companyRouter
  .route("/:id")
  .get(protect, restrictTo("user"), companyController.getCompanyById)
  .patch(protect, uploadCompanyLogo, companyController.updateCompany)
  .delete(protect, companyController.deleteCompany);

export default companyRouter;
