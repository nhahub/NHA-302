import invoiceModel from "../../models/invoice.model.js";
import catchAsyncError from "../../utils/middlewares/catchAsync.js";

//Get Stats [Total Invoices, Total Revenue, Top Product, Top Customer]
export const getReportStats = catchAsyncError(async (req, res, next) => {
  let matchStage = { company: req.user.company };
  const stats = await invoiceModel.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: null,
        totalInvoices: { $sum: 1 },
        totalRevenue: { $sum: "$total" },
      },
    },
  ]);
  const topProduct = await invoiceModel.aggregate([
    { $match: matchStage },
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products.product",
        totalSold: { $sum: "$products.quantity" },
        totalRevenue: {
          $sum: { $multiply: ["$products.quantity", "$products.price"] },
        },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
  ]);
  const topCustomer = await invoiceModel.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$customer",
        totalInvoices: { $sum: 1 },
        totalSpent: { $sum: "$total" },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: "customers",
        localField: "_id",
        foreignField: "_id",
        as: "customer",
      },
    },
    { $unwind: "$customer" },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats: stats[0] || { totalInvoices: 0, totalRevenue: 0 },
      topProduct: topProduct[0] || null,
      topCustomer: topCustomer[0] || null,
    },
  });
});

//graph revenue over time [day, week, month, year]

export const getRevenueOverTime = catchAsyncError(async (req, res, next) => {
  let matchStage = { company: req.user.company };

  const { period = "month" } = req.query;
  let groupId;
  switch (period) {
    case "day":
      groupId = {
        year: { $year: "$orderDate" },
        month: { $month: "$orderDate" },
        day: { $dayOfMonth: "$orderDate" },
      };
      break;
    case "week":
      groupId = {
        year: { $year: "$orderDate" },
        week: { $week: "$orderDate" },
      };
      break;
    case "year":
      groupId = { year: { $year: "$orderDate" } };
      break;
    default:
      groupId = {
        year: { $year: "$orderDate" },
        month: { $month: "$orderDate" },
      };
  }
  const revenue = await invoiceModel.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: groupId,
        totalRevenue: { $sum: "$total" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  res.status(200).json({
    status: "success",
    period,
    data: revenue,
  });
});

//top products sold
export const getTopProducts = catchAsyncError(async (req, res, next) => {
  let matchStage = { company: req.user.company };

  const topProducts = await invoiceModel.aggregate([
    { $match: matchStage },
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products.product",
        totalSold: { $sum: "$products.quantity" },
        totalRevenue: {
          $sum: { $multiply: ["$products.quantity", "$products.price"] },
        },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
  ]);

  res.status(200).json({
    status: "success",
    data: topProducts,
  });
});

// top customers

export const getTopCustomers = catchAsyncError(async (req, res, next) => {
  let matchStage = { company: req.user.company };

  const topCustomers = await invoiceModel.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$customer",
        totalInvoices: { $sum: 1 },
        totalSpent: { $sum: "$total" },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "customers",
        localField: "_id",
        foreignField: "_id",
        as: "customer",
      },
    },
    { $unwind: "$customer" },
  ]);

  res.status(200).json({
    status: "success",
    data: topCustomers,
  });
});
