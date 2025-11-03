import { productModel } from "../../models/product.model.js";
import {
  createOne,
  updateOne,
  deleteOne,
  getAll,
  getById,
} from "../../utils/handlers/refactor.handler.js";
import catchAsyncError from "../../utils/middlewares/catchAsync.js";
import ApiFeatures from "../../utils/features/apiFeatures.js";
import { Parser } from "json2csv";
import { trackUsage } from "../../utils/trackUsage.js";

 //const createProduct = createOne(productModel, "Product")
const createProduct = catchAsyncError(async (req, res, next) => {
  await trackUsage(req.user._id, "products");
  let added = await productModel.create(req.body);
  res.status(201).json({ message: "success", data: added });
});


const getAllProducts = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(productModel.find(), req.query)
    .pagination()
    .filter()
    .sort()
    .search()
    .fields();
  let results = await apiFeature.myQuery;
  res
    .status(200)
    .json({ message: "success", page: apiFeature.page, data: results });
});

const getProductById = getById(productModel, "Product");

const getProductsByCompany = catchAsyncError(async (req, res, next) => {
  const companyId = req.params.id;
  const products = await productModel.find({ company: companyId });
  res
    .status(200)
    .json({ status: "success", results: products.length, data: { products } });
});

const updateProduct = updateOne(productModel, "Product");

const deleteProductById = deleteOne(productModel, "Product");

const getStockStatus = catchAsyncError(async (req, res, next) => {
  const threshold = Number(req.query.threshold) || 10;

  const companyId = req.params.id;
  if (!companyId) {
    return res
      .status(400)
      .json({ message: "Company ID is required in params." });
  }
  let apiFeature = new ApiFeatures(
    productModel.find({ company: companyId, quantity: { $lte: threshold } }),
    req.query
  )
    .pagination()
    .sort();
  let results = await apiFeature.myQuery;
  res
    .status(200)
    .json({ message: "success", page: apiFeature.page, data: results });
});

const exportProducts = catchAsyncError(async (req, res, next) => {
  const companyId = req.params.id;
  const products = await productModel
    .find({ company: companyId })
    .sort("category")
    .lean();

  if (!products.length) {
    return res.status(404).json({ message: "No products found" });
  }

  const fields = [
    { label: "Category", value: "category" },
    { label: "Title", value: "title" },
    { label: "Price", value: "price" },
    { label: "Price After Discount", value: "priceAfterDiscount" },
    { label: "Description", value: "description" },
    { label: "Quantity", value: "quantity" },
    { label: "Sold", value: "sold" },
    { label: "Vendor", value: "vendor" },
    { label: "Image Cover", value: "imgCover" },
    { label: "Images", value: "images" },
    { label: "Created At", value: "createdAt" },
    { label: "Updated At", value: "updatedAt" },
  ];

  const transformedProducts = products.map((product) => ({
    ...product,
    images: product.images ? product.images.join(", ") : "",
    createdAt: product.createdAt ? product.createdAt.toISOString() : "",
    updatedAt: product.updatedAt ? product.updatedAt.toISOString() : "",
  }));

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(transformedProducts);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=products_by_category_export.csv"
  );
  res.status(200).send(csv);
});

// Admin overview controller: summary of all products
const getProductsOverview = catchAsyncError(async (req, res, next) => {
  const totalProducts = await productModel.countDocuments();
  const stats = await productModel.aggregate([
    {
      $group: {
        _id: null,
        totalStock: { $sum: "$quantity" },
        totalSold: { $sum: "$sold" },
        avgPrice: { $avg: "$price" },
      },
    },
  ]);
  const overview = {
    totalProducts,
    totalStock: stats[0]?.totalStock || 0,
    totalSold: stats[0]?.totalSold || 0,
    avgPrice: stats[0]?.avgPrice || 0,
  };
  res.status(200).json({ message: "success", data: overview });
});

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProductById,
  getStockStatus,
  exportProducts,
  getProductsByCompany,
  getProductsOverview,
};
