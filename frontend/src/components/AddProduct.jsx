import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaCheck, FaUpload } from "react-icons/fa";
import toast from "react-hot-toast";
import { createProduct } from "../api/product";
import Loader from "./Loader";
import { useTranslation } from "react-i18next";

function AddProduct() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const quickActionData = location.state?.quickActionData;

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "",
    discount: "",
    category: "",
    sku: "",
  });

  const userData = JSON.parse(localStorage.getItem("user"));
  const companyId = userData?.company;

  useEffect(() => {
    if (quickActionData) {
      setFormData((prev) => ({
        ...prev,
        title: quickActionData.productName || "",
        price: quickActionData.price || "",
        category: quickActionData.category || "",
        quantity: quickActionData.stock || "",
      }));
    }
  }, [quickActionData]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return toast.error("Please upload an image file");
    if (file.size > 5 * 1024 * 1024)
      return toast.error("Image size should be less than 5MB");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;

    if (value === "Other") {
      setShowCustomCategory(true);
      setFormData((prev) => ({ ...prev, category: "" }));
    } else {
      setShowCustomCategory(false);
      setCustomCategory("");
      setFormData((prev) => ({ ...prev, category: value }));
    }
  };

  const handleSaveCustomCategory = () => {
    if (!customCategory.trim())
      return toast.error("Please enter a category name");
    if (customCategory.length < 3)
      return toast.error("Category must be at least 3 characters");
    if (customCategory.length > 30)
      return toast.error("Category must be less than 30 characters");

    setFormData((prev) => ({ ...prev, category: customCategory.trim() }));
    toast.success("Custom category saved!");
  };

  const validateForm = () => {
    if (!formData.title.trim()) return toast.error("Product title is required");
    if (!formData.description.trim())
      return toast.error("Product description is required");
    if (!formData.price || parseFloat(formData.price) < 0)
      return toast.error("Valid price is required");
    if (!formData.quantity || parseInt(formData.quantity) < 0)
      return toast.error("Valid quantity is required");
    if (!formData.category.trim()) return toast.error("Category is required");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      const productData = {
        title: formData.title.trim(),
        sku: formData.sku.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        category: formData.category.trim(),
        company: companyId,
      };

      if (formData.discount) {
        productData.discount = parseFloat(formData.discount);
      }

      const res = await createProduct(productData);
      console.log("✅ Product Created:", res);

      toast.success("Product added successfully!");
      setMessage("Product added successfully!");

      setTimeout(() => navigate("/dashboard/product"), 1200);
    } catch (error) {
      console.error("❌ Error creating product:", error);

      if (error.response) {
        console.error("🧠 Backend Error Message:", error.response.data);
        console.error("📦 Status Code:", error.response.status);
      }

      const backendMsg =
        error.response?.data?.message ||
        "Failed to add product. Please try again.";
      toast.error(backendMsg);
      setMessage(backendMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) return <Loader />;

  return (
    <div className="md:p-5 font-quicksand">
      <div className="flex justify-between items-center py-7">
        <div>
          <h1 className="text-4xl text-primary dark:text-primary_dark font-bold font-robotoCondensed">
            {t("AddProduct")}
          </h1>
          <p>
            <Link
              to="/dashboard"
              className="relative text-sm group text-black dark:text-gray-300"
            >
              {t("Home")}
              <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-primary dark:bg-gray-300 transition-all duration-500 group-hover:w-full" />
            </Link>{" "}
            /{" "}
            <Link
              to="/dashboard/product"
              className="relative text-sm group text-black dark:text-gray-300"
            >
              {t("Products")}
              <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-primary dark:bg-gray-300 transition-all duration-500 group-hover:w-full" />
            </Link>{" "}
            /{" "}
            <span className="text-sm text-primary dark:text-primary_dark">
              {t("AddProduct")}
            </span>
          </p>

          {quickActionData && (
            <div className="mt-3 p-3 bg-accent dark:bg-accent_dark border-l-4 border-primary dark:border-primary_dark rounded-lg">
              <p className="text-sm font-quicksand text-gray-900 dark:text-white">
                {t("QuickActions")}
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 relative px-4 py-2 rounded-xl
          bg-primary dark:bg-primary_dark text-white hover:text-primary dark:hover:text-primary_dark font-medium overflow-hidden
          transition-all duration-500 ease-in-out
          hover:bg-secondary dark:hover:bg-secondary_dark
          disabled:opacity-50 disabled:cursor-not-allowed
          before:absolute before:inset-0 before:-translate-x-full
          before:bg-white/30 before:skew-x-[45deg]
          before:transition-transform before:duration-700
          hover:before:translate-x-full"
        >
          {isSubmitting ? (
            "Adding..."
          ) : (
            <>
              <FaCheck /> {t("AddProduct")}
            </>
          )}
        </button>
      </div>

      {message && (
        <div
          className={`p-3 mb-4 rounded-lg ${
            message.includes("success")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* ====== Content ====== */}
      <form onSubmit={handleSubmit}>
        <section className="grid md:grid-cols-3 grid-cols-1 gap-6">
          {/* Upload Image */}
          <div
            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-200 ${
              isDragging
                ? "border-primary dark:border-primary_dark bg-secondary/40 dark:bg-secondary_dark/40"
                : "border-background dark:border-gray-600 bg-accent dark:bg-accent_dark"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {!preview ? (
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <FaUpload className="text-primary dark:text-primary_dark text-4xl mb-2" />
                <p className="font-semibold text-gray-700 dark:text-white">
                  {t("uploadImage")}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("dragOrClick")}
                </p>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            ) : (
              <div className="relative w-full">
                <img
                  src={preview}
                  alt="Preview"
                  className="rounded-xl w-full object-cover h-48"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-primary dark:bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-600 dark:hover:bg-red-700 transition"
                >
                  {t("remove")}
                </button>
              </div>
            )}
          </div>
          {/* General Info */}
          <div className="md:col-span-2 bg-accent dark:bg-accent_dark p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold pb-3 text-gray-900 dark:text-white">
              {t("generalInformation")}
            </h3>

            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  {t("productTitle")}{" "}
                  <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full border-2 border-background dark:border-gray-600 rounded-xl p-2 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[3px] focus:border-primary dark:focus:border-primary_dark"
                  required
                  minLength={2}
                />
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  {t("sku")}{" "}
                  <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sku: e.target.value }))
                  }
                  className="w-full border-2 border-background dark:border-gray-600 rounded-xl p-2 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[3px] focus:border-primary dark:focus:border-primary_dark"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  {t("description")}{" "}
                  <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full border-2 border-background dark:border-gray-600 rounded-xl p-2 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[3px] focus:border-primary dark:focus:border-primary_dark"
                  required
                  minLength={5}
                  maxLength={500}
                ></textarea>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.description.length}/500 {t("characters")}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="md:col-span-2 bg-accent dark:bg-accent_dark p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold pb-3 text-gray-900 dark:text-white">
              {t("pricingStock")}
            </h3>
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  {t("price")}{" "}
                  <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                  className="w-full border-2 border-background dark:border-gray-600 rounded-xl p-2 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[3px] focus:border-primary dark:focus:border-primary_dark"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  {t("quantity")}{" "}
                  <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                  className="w-full border-2 border-background dark:border-gray-600 rounded-xl p-2 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[3px] focus:border-primary dark:focus:border-primary_dark"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  {t("discount")} (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discount: e.target.value,
                    }))
                  }
                  className="w-full border-2 border-background dark:border-gray-600 rounded-xl p-2 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[3px] focus:border-primary dark:focus:border-primary_dark"
                  placeholder="0-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  {t("priceAfterDiscount")}
                </label>
                <input
                  type="text"
                  value={
                    formData.price && formData.discount
                      ? (
                          parseFloat(formData.price) -
                          (parseFloat(formData.price) *
                            parseFloat(formData.discount)) /
                            100
                        ).toFixed(2)
                      : formData.price || "0.00"
                  }
                  className="w-full border-2 border-background dark:border-gray-600 rounded-xl p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-accent dark:bg-accent_dark p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold pb-3 text-gray-900 dark:text-white">
              {t("category")}
            </h3>

            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              {t("productCategory")}{" "}
              <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <select
              value={showCustomCategory ? "Other" : formData.category}
              onChange={handleCategoryChange}
              className="w-full border-2 border-background dark:border-gray-600 rounded-xl p-2 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white mb-4 focus:outline-none focus:border-[3px] focus:border-primary dark:focus:border-primary_dark"
              required={!showCustomCategory}
            >
              <option value="">{t("chooseCategory")}</option>
              <option value="Electronics">{t("electronics")}</option>
              <option value="Clothing">{t("clothing")}</option>
              <option value="Home">{t("home")}</option>
              <option value="Stationary">{t("stationary")}</option>
              <option value="Sports">{t("sports")}</option>
              <option value="Beauty">{t("beauty")}</option>
              <option value="Food & Beverages">{t("foodBeverages")}</option>
              <option value="Books">{t("books")}</option>
              <option value="Other">{t("other")}</option>
            </select>

            {/* Custom Category Input - يظهر فقط لما يختار Other */}
            {showCustomCategory && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                    {t("enterCustomCategory")}{" "}
                    <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full border-2 border-background dark:border-gray-600 rounded-xl p-2 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[3px] focus:border-primary dark:focus:border-primary_dark"
                    minLength={3}
                    maxLength={30}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {customCategory.length}/30 {t("characters")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveCustomCategory}
                  className="bg-primary dark:bg-primary_dark text-white w-full py-2 rounded-xl hover:bg-secondary dark:hover:bg-secondary_dark hover:text-primary dark:hover:text-primary_dark font-medium transition-all duration-500 flex items-center justify-center gap-2"
                >
                  <FaCheck />
                  {t("saveCategory")}
                </button>

                {formData.category && (
                  <div className="p-3 bg-secondary dark:bg-secondary_dark rounded-lg border-2 border-primary dark:border-primary_dark">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("selectedCategory")}:
                    </p>
                    <p className="text-base font-semibold text-primary dark:text-primary_dark">
                      {formData.category}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </form>
    </div>
  );
}

export default AddProduct;
