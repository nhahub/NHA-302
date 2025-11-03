import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please enter a company name"],
      minLength: [2, "too short company name"],
    },
    companyLogo: {
      type: String,
      trim: true,
    },
    invoicePrefix: {
      type: String,
      trim: true,
      required: [true, "Please enter an invoice prefix"],
    },
    currency: {
      type: String,
      trim: true,
      required: [true, "Please enter a currency"],
    },
    taxRate: {
      type: Number,
      default: 14,
      min: [0, "Tax rate must be positive"],
      max: [100, "Tax rate must be less than or equal to 100"],
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "user",
      unique: true,
      required: true,
    },
    products: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "product",
      },
    ],
    customers: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "customer",
      },
    ],
    invoices: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "invoice",
      },
    ],
    // reports: [{
    //     type: mongoose.SchemaTypes.ObjectId,
    //     ref: 'report'
    // }]
  },
  { timestamps: true }
);

export const companyModel = mongoose.model("company", companySchema);
