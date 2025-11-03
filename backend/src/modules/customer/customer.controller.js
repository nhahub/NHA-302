import { customerModel } from "../../models/customer.model.js";
import {
  createOne,
  updateOne,
  deleteOne,
  getAll,
  getById,
} from "../../utils/handlers/refactor.handler.js";
import catchAsyncError from "../../utils/middlewares/catchAsync.js";
import { trackUsage } from "../../utils/trackUsage.js";

// const createCustomer = createOne(customerModel, "customer")
const createCustomer = catchAsyncError(async (req, res, next) => {
  let added = await customerModel.create(req.body);
  await trackUsage(req.user._id, "customers");
  res.status(201).json({ message: "success", data: added });
});

const getAllCustomers = getAll(customerModel, "customer");

// Get customer by ID with populated invoices
const getCustomerById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  
  const customer = await customerModel
    .findById(id)
    .populate({
      path: "invoices",
      populate: {
        path: "products.product",
        select: "title price priceAfterDiscount imgCover",
      },
    })
    .lean();

  if (!customer) {
    return res.status(404).json({ 
      status: "fail", 
      message: "Customer not found" 
    });
  }

  // Calculate orders and purchases from invoices
  const invoices = customer.invoices || [];
  const orders = invoices.length;
  const purchases = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);

  res.status(200).json({ 
    status: "success", 
    data: {
      ...customer,
      orders,
      purchases,
    }
  });
});

const updateCustomer = updateOne(customerModel, "customer");

const deleteCustomer = deleteOne(customerModel);

const getCustomerInvoices = catchAsyncError(async (req, res, next) => {
  const customerId = req.params.id;

  const customer = await customerModel
    .findById(customerId)
    .populate("invoices");

  if (!customer) {
    return res
      .status(404)
      .json({ status: "fail", message: "Customer not found" });
  }

  res.status(200).json({
    status: "success",
    results: customer.invoices.length,
    data: { invoices: customer.invoices },
  });
});

const getCustomerByCompany = catchAsyncError(async (req, res, next) => {
  const companyId = req.params.id;
  
  // Populate customers with their invoices and invoice products
  const customers = await customerModel
    .find({ company: companyId })
    .populate({
      path: "invoices",
      populate: {
        path: "products.product",
        select: "title price priceAfterDiscount imgCover",
      },
    })
    .lean();

  // Calculate orders and purchases for each customer based on their invoices
  const customersWithStats = customers.map((customer) => {
    const invoices = customer.invoices || [];
    
    return {
      ...customer,
      orders: invoices.length,
      purchases: invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0),
    };
  });

  res.status(200).json({
    status: "success",
    results: customersWithStats.length,
    data: { customers: customersWithStats },
  });
});

// Admin: Get number of customers for a company
const getCustomerCountByCompany = catchAsyncError(async (req, res, next) => {
  const companyId = req.params.id;
  if (!companyId) {
    return res
      .status(400)
      .json({ status: "fail", message: "Company ID is required in params." });
  }
  const count = await customerModel.countDocuments({ company: companyId });
  res.status(200).json({
    status: "success",
    data: {
      companyId,
      customerCount: count,
    },
  });
});

export {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerInvoices,
  getCustomerByCompany,
  getCustomerCountByCompany,
};
