import invoiceModel from "../../models/invoice.model.js";
import { productModel } from "../../models/product.model.js";
import {
  updateOne,
  deleteOne,
  getById,
} from "../../utils/handlers/refactor.handler.js";
import catchAsyncError from "../../utils/middlewares/catchAsync.js";
import ApiFeatures from "../../utils/features/apiFeatures.js";
import catchAsync from "../../utils/middlewares/catchAsync.js";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import cron from "node-cron";
import { trackUsage } from "../../utils/trackUsage.js";

//get all invoices
export const getAllInvoices = catchAsync(async (req, res, next) => {
  // Build the query with populate
  const query = invoiceModel
    .find()
    .populate("company")
    .populate("customer")
    .populate({
      path: "products.product",
      select: "title name description price priceAfterDiscount quantity imgCover"
    });
  
  // Apply API features
  const features = new ApiFeatures(query, req.query)
    .filter()
    .sort()
    .search()
    .fields()
    .pagination();
    
  const results = await features.myQuery;
  
  res.status(200).json({
    status: "success",
    results: results.length,
    page: features.page,
    data: results,
  });
});
//get invoice by id
export const getInvoiceById = getById(invoiceModel, "invoice");

//update invoice by id
export const updateInvoice = updateOne(invoiceModel, "invoice");

//delete invoice by id
export const deleteInvoice = deleteOne(invoiceModel, "invoice");

//get invoice  status or not?!
export const getInvoicesByStatus = catchAsyncError(async (req, res, next) => {
  const { status } = req.params;
  const features = new ApiFeatures(invoiceModel.find({ status }), req.query);
  const results = await features.myQuery;
  res.status(200).json({
    message: "success",
    page: features.page,
    data: results,
  });
});

// export invoices by type [pdf or excel or csv]
export const exportInvoices = catchAsync(async (req, res, next) => {
  const type = (req.query.type || "csv").toLowerCase();
  const invoiceId = req.params.id;
  const invoices = await invoiceModel
    .find({ _id: invoiceId })
    .populate("products customers company");

  if (!invoices.length) {
    res
      .status(404)
      .json({ status: "false", essage: "No invoices found", data: null });
  }

  // Flatten invoices for Export
  const data = invoices.map((invoice) => ({
    Company: invoice.company?.name || "",
    InvoiceNumber: invoice.invoiceNumber,
    InvoiceDate: invoice.invoiceDate,
    DueDate: invoice.dueDate,
    Status: invoice.status,
    CustomerName: invoice.customers?.name || "",
    Phone: invoice.customers?.phone || "",
    Address: invoice.customers?.address || "",
    Product: invoice.products?.title || "",
    Quantity: invoice.products?.quantity || "",
    UnitPrice: invoice.products?.price || "",
    TotalPrice: invoice.totalPrice,
  }));

  // CSV Export
  if (type === "csv") {
    const headers = [
      "Company",
      "InvoiceNumber",
      "InvoiceDate",
      "DueDate",
      "Status",
      "CustomerName",
      "Phone",
      "Address",
      "Product",
      "Quantity",
      "UnitPrice",
      "TotalPrice",
    ];

    const json2csv = new Parser({ fields: headers });
    const csv = json2csv.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment("invoices.csv");
    return res.send(csv);
  }
  // Excel Export
  if (type === "excel") {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Invoices");

    sheet.addRow([
      "Company",
      "InvoiceNumber",
      "InvoiceDate",
      "DueDate",
      "Status",
      "CustomerName",
      "Phone",
      "Address",
      "Product",
      "Quantity",
      "UnitPrice",
      "TotalPrice",
    ]);

    data.forEach((invoice) => {
      sheet.addRow([
        invoice.Company,
        invoice.InvoiceNumber,
        invoice.InvoiceDate,
        invoice.DueDate,
        invoice.Status,
        invoice.CustomerName,
        invoice.Phone,
        invoice.Address,
        invoice.Product,
        invoice.Quantity,
        invoice.UnitPrice,
        invoice.TotalPrice,
      ]);
    });

    res.header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.attachment("invoices.xlsx");
    await workbook.xlsx.write(res);
    return res.end();
  }

  // PDF Export
  if (type === "pdf") {
    const doc = new PDFDocument({ margin: 30, size: "A4" });
    res.header("Content-Type", "application/pdf");
    res.attachment("invoices.pdf");
    doc.pipe(res);

    doc.fontSize(18).text("Invoice List", { align: "center" });
    doc.moveDown();

    const headers = [
      "Company",
      "InvoiceNumber",
      "InvoiceDate",
      "DueDate",
      "Status",
      "CustomerName",
      "Phone",
      "Address",
      "Product",
      "Quantity",
      "UnitPrice",
      "TotalPrice",
    ];

    doc.fontSize(12).text(headers.join(" | "));
    doc.moveDown(0.5);

    data.forEach((invoice) => {
      doc
        .fontSize(10)
        .text(
          [
            invoice.Company,
            invoice.InvoiceNumber,
            invoice.InvoiceDate,
            invoice.DueDate,
            invoice.Status,
            invoice.CustomerName,
            invoice.Phone,
            invoice.Address,
            invoice.Product,
            invoice.Quantity,
            invoice.UnitPrice,
            invoice.TotalPrice,
          ].join(" | ")
        );
      doc.moveDown(0.3);
    });

    doc.end();
    return;
  }
  // Invalid  type
  res.status(400).json({
    status: false,
    message: "Invalid type. Supported types: csv, excel, pdf",
    data: null,
  });
});

//create invoice[reduce stock of products and if overdue return back to stock]
export const createInvoice = catchAsync(async (req, res, next) => {
  try {
    const invoice = await invoiceModel.create(req.body);
    
    // Decrement the stock of each product in the invoice
    if (invoice.products && invoice.products.length > 0) {
      for (const item of invoice.products) {
        await productModel.findByIdAndUpdate(item.product, {
          $inc: { quantity: -item.quantity, sold: item.quantity },
        });
      }
    }
    
    await trackUsage(req.user._id, "invoices");
    res.status(201).json({ message: "success", data: invoice });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      return res.status(400).json({
        status: "error",
        message: `An invoice with ${field} "${value}" already exists. Please use a different ${field}.`,
      });
    }
    // Handle other errors
    throw error;
  }
});

//Run every hour to check for overdue invoices and update their status
cron.schedule("0 0 * * *", async () => {
  const now = new Date();
  const overdueInvoices = await invoiceModel
    .find({
      dueDate: { $lt: now },
      status: "Pending",
    })
    .populate("products.product");
  for (const invoice of overdueInvoices) {
    for (const item of invoice.products) {
      await productModel.findByIdAndUpdate(item.product._id, {
        $inc: { quantity: item.quantity, sold: -item.quantity },
      });
    }
    invoice.status = "Overdue";
    await invoice.save();
    console.log(`Invoice ${invoice._id} is now overdue and stock updated.`);
  }
});
//get invoice by company
export const getInvoicesByCompany = catchAsyncError(async (req, res, next) => {
  const companyId = req.params.id;
  
  // Build the query with populate
  const query = invoiceModel
    .find({ company: companyId })
    .populate("company")
    .populate("customer")
    .populate({
      path: "products.product",
      select: "title name description price priceAfterDiscount quantity imgCover"
    });
  
  // Apply API features
  const features = new ApiFeatures(query, req.query);
  const results = await features.myQuery;
  
  res.status(200).json({
    message: "success",
    page: features.page,
    data: results,
  });
});
//get invoice stats for [user-Admin]
export const getInvoiceStats = catchAsyncError(async (req, res, next) => {
  let matchStage = {};
  if (req.user.role !== "admin") {
    matchStage = { company: req.user.company };
  }
  const stats = await invoiceModel.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: "$status",
        total: { $sum: 1 },
      },
    },
  ]);
  const results = {
    Paid: 0,
    Pending: 0,
    Overdue: 0,
    total: 0,
  };
  stats.forEach((stat) => {
    results[stat._id] = stat.total;
    results.total += stat.total;
  });
  res.status(200).json({ message: "success", data: results });
});
