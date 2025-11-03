import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    stripePaymentMethodId: { type: String, required: true },
    cardLast4: { type: String, match: [/^\d{4}$/, "Must be 4 digits"] },
    cardType: { type: String, enum: ["credit", "debit", "prepaid"] },
    cardBrand: { type: String },
    cardExpMonth: { type: Number, min: 1, max: 12 },
    cardExpYear: { type: Number, min: 2024 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const pricingBillingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cards: [cardSchema],

    usage: {
      invoices: { type: Number, default: 0 },
      products: { type: Number, default: 0 },
      customers: { type: Number, default: 0 },
    },
    limits: {
      invoices: { type: Number, default: 5 },
      products: { type: Number, default: 3 },
      customers: { type: Number, default: 5 },
    },
    pricing: {
      invoiceUnitPrice: { type: Number, default: 3 },
      productUnitPrice: { type: Number, default: 5 },
      customerUnitPrice: { type: Number, default: 0.5 },
    },
    totalDue: { type: Number, default: 0 },
    lastBilledAt: Date,
    stripeCustomerId: { type: String },
    currency: { type: String, default: "egp" },
  },
  { timestamps: true }
);

export default mongoose.model("PricingBilling", pricingBillingSchema);
