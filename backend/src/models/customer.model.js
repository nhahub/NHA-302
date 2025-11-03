import mongoose from "mongoose";
import validator from "validator";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please enter a username"],
      minLength: [2, "too short customer name"],
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    phone: {
      type: String,
      trim: true,
      validate: [validator.isMobilePhone, "Please enter a valid phone number"],
    },
    address: {
      type: String,
      trim: true,
      maxLength: [100, "too long address"],
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalPurchases: {
      type: Number,
      default: 0,
    },
    invoices: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "invoice",
      },
    ],
    company: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "company",
    },
  },
  { timestamps: true }
);

// totalOrders and totalPurchases are automatically calculated and updated
// via invoice model post-save, post-update, and post-delete hooks

export const customerModel = mongoose.model("customer", customerSchema);
