import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    pricing_billing: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "pricing_billing",
      required: [true, "Pricing billing is required"],
    },
    company: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "company",
      required: [true, "Company is required"],
    },
    product: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "product",
      required: [true, "Product is required"],
    },
    invoice: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "invoice",
      required: [true, "Invoice is required"],
    },
    customer: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "customer",
      required: [true, "Customer is required"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("report", reportSchema);
