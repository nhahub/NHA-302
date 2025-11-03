import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      unique: [true, "Product title is must be unique"],
      trim: true,
      required: [true, "Product title is required"],
      minLength: [2, "too short product name"],
    },
    sku: {
      type: String,
      unique: [true, "Product sku is must be unique"],
      trim: true,
      required: [true, "Product title is required"],
      minLength: [2, "too short product name"],
    },
    titleAr: {
     type: String,
      unique: [true, "Product titlear is must be unique"],
     trim: true,
    minLength: [2, "too short product name"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    priceAfterDiscount: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      minLength: [5, "too short product description"],
      maxLength: [500, "too long product description"],
      required: [true, "product description is required"],
      trim: true,
    },
    descriptionAr: {
      type: String,
      minLength: [5, "too short product description"],
      maxLength: [500, "too long product description"],
      trim: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
      required: [true, "product quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
      min: 0,
    },
    imgCover: String,
    images: [String],
    category: {
      type: String,
      minLength: [3, "too short product category"],
      maxLength: [30, "too long product category"],
      required: [true, "product category is required"],
    },
    categoryAr: {
      type: String,
      minLength: [3, "too short product category"],
      maxLength: [30, "too long product category"],
    },
    vendor: {
      type: String,
      minLength: [3, "too short product category"],
      maxLength: [30, "too long product category"],
    },
    company: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "company",
      //required: [true, "product company is required"],
    },
  },
  { timestamps: true }
);

// Automatically calculate priceAfterDiscount before saving
productSchema.pre("save", function (next) {
  if (this.price != null && this.discount != null) {
    this.priceAfterDiscount = this.price - (this.price * this.discount) / 100;
  }
  next();
});

export const productModel = mongoose.model("product", productSchema);
