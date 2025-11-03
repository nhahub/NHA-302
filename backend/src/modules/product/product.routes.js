import express from "express";
import * as productController from "./product.controller.js";
import {
  protect,
  restrictTo,
} from "../../utils/middlewares/auth.middleware.js";

const productRouter = express.Router();

productRouter
  .route("/")
  .get(protect, restrictTo("admin"), productController.getAllProducts)
  .post(protect, productController.createProduct);

productRouter
  .route("/overview")
  .get(protect, restrictTo("admin"), productController.getProductsOverview);

productRouter
  .route("/:id")
  .get(protect, productController.getProductById)
  .patch(protect, productController.updateProduct)
  .delete(protect, productController.deleteProductById);

productRouter
  .route("/stock/:id")
  .get(protect, restrictTo("user"), productController.getStockStatus);

productRouter
  .route("/export/:id")
  .get(protect, restrictTo("user"), productController.exportProducts);

productRouter
  .route("/company/:id")
  .get(protect, restrictTo("user"), productController.getProductsByCompany);

export default productRouter;
