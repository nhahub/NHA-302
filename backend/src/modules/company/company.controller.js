import { companyModel } from "../../models/company.model.js";
import {
  createOne,
  updateOne,
  deleteOne,
  getAll,
  getById,
} from "../../utils/handlers/refactor.handler.js";

const createCompany = createOne(companyModel);

const getAllCompanies = getAll(companyModel, "company");

const getCompanyById = getById(companyModel, "company");

export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("📝 Update Company Request:");
    console.log("Company ID:", id);
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);

    const updateData = { ...req.body };

    // Parse numeric fields (important for FormData)
    if (updateData.taxRate) {
      updateData.taxRate = parseFloat(updateData.taxRate);
    }

    // If a file was uploaded, add the file path to updateData
    if (req.file) {
      updateData.companyLogo = `${req.protocol}://${req.get(
        "host"
      )}/uploads/company-logos/${req.file.filename}`;
      console.log("📷 Logo path set to:", updateData.companyLogo);
    }

    console.log("📦 Final update data:", updateData);

    const updatedCompany = await companyModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({
        status: "fail",
        message: "Company not found",
      });
    }

    console.log("✅ Company updated successfully");

    res.status(200).json({
      status: "success",
      data: updatedCompany,
    });
  } catch (error) {
    console.error("❌ Update Company Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const deleteCompany = deleteOne(companyModel);

// Get company by current user
const getMyCompany = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(401).json({ 
        status: "fail",
        message: "User not authenticated" 
      });
    }

    const company = await companyModel.findOne({ user: userId });
    
    if (!company) {
      return res.status(404).json({ 
        status: "fail",
        message: "No company found for this user" 
      });
    }

    res.status(200).json({
      status: "success",
      data: company,
    });
  } catch (error) {
    console.error("❌ Get My Company Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Admin: Get summary of a company with populated fields
const getCompanySummary = async (req, res, next) => {
  try {
    const companyId = req.params.id;
    if (!companyId) {
      return res
        .status(400)
        .json({ message: "Company ID is required in params." });
    }
    const company = await companyModel
      .findById(companyId)
      .populate({ path: "user", select: "name email" })
      .populate({
        path: "products",
        select: "title price description quantity ",
      })
      .populate({ path: "customers", select: "name" })
      .populate({ path: "invoices", select: "status total" })
      .lean();
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.status(200).json({
      message: "success",
      data: {
        company,
      },
    });
  } catch (err) {
    next(err);
  }
};

export {
  createCompany,
  getAllCompanies,
  getCompanyById,
  getMyCompany,
  // updateCompany,
  deleteCompany,
  getCompanySummary,
};
