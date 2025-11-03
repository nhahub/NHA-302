import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FaCheck, FaUpload } from "react-icons/fa";
import {
  useUpdateProduct,
  useProductById,
} from "../features/product/useProductQuery";
import toast from "react-hot-toast";
import Loader from "./Loader";
import { useTranslation } from "react-i18next";

function EditProduct() {
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const productFromState = location.state?.product;

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  // Get company ID from localStorage
  const userData = JSON.parse(localStorage.getItem("user"));
  const companyId = userData?.company;

  // Fetch product if not in state
  const { data: productData, isLoading } = useProductById(id);
  const { mutate: updateProduct } = useUpdateProduct();

  const product = productFromState || productData?.data?.product;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "",
    discount: "",
    category: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        price: product.price || "",
        quantity: product.quantity || "",
        discount: product.discount || "",
        category: product.category || "",
      });

      if (product.imgCover) {
        setPreview(product.imgCover);
      }
    }
  }, [product]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
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
    }
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
    if (!customCategory.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    if (customCategory.length < 3 || customCategory.length > 30) {
      toast.error("Category must be between 3 and 30 characters");
      return;
    }

    setFormData((prev) => ({ ...prev, category: customCategory.trim() }));
    toast.success("Custom category saved!");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
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
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeImage = () => {
    setImage(null);
    setPreview(product?.imgCover || null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error(t("errTitleRequired"));
      return false;
    }
    if (formData.title.length < 2) {
      toast.error(t("errTitleShort"));
      return false;
    }
    if (!formData.description.trim()) {
      toast.error(t("errDescriptionRequired"));
      return false;
    }
    if (formData.description.length < 5) {
      toast.error(t("errDescriptionShort"));
      return false;
    }
    if (formData.description.length > 500) {
      toast.error(t("errDescriptionLong"));
      return false;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      toast.error(t("errPriceRequired"));
      return false;
    }
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      toast.error(t("errQuantityRequired"));
      return false;
    }
    if (!formData.category.trim()) {
      toast.error(t("errCategoryRequired"));
      return false;
    }
    if (formData.category.length < 3 || formData.category.length > 30) {
      toast.error(t("errCategoryLength"));
      return false;
    }
    if (
      formData.discount &&
      (parseFloat(formData.discount) < 0 || parseFloat(formData.discount) > 100)
    ) {
      toast.error(t("errDiscountRange"));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        category: formData.category.trim(),
        company: companyId,
      };

      if (formData.discount) {
        productData.discount = parseFloat(formData.discount);
      }

      // ✅ تأكدي إنك بتبعتي { id, data } صح
      updateProduct(
        { id, data: productData },
        {
          onSuccess: () => {
            toast.success("Product updated successfully!");
            navigate("/dashboard/product");
          },
          onError: (error) => {
            console.error("Error updating product:", error);

            // ✅ طباعة الـ error بالتفصيل
            console.log("Full error:", error);
            console.log("Error response:", error?.response);
            console.log("Error data:", error?.response?.data);

            const errorMessage =
              error?.response?.data?.message ||
              error?.response?.data?.error ||
              "Failed to update product. Please try again.";
            toast.error(errorMessage);
          },
          onSettled: () => {
            setIsSubmitting(false);
          },
        }
      );
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loader />;

  if (!product) {
    return (
      <div className="text-center pt-28">
        <p className="text-red-500 dark:text-red-400">{t("productNotFound")}</p>
        <Link
          to="/dashboard/product"
          className="text-primary dark:text-primary_dark underline mt-4 inline-block"
        >
          {t("backToProducts")}
        </Link>
      </div>
    );
  }

  return (
    <div className="md:p-5 font-quicksand">
      {/* ====== Header ====== */}
      <div className="flex justify-between items-center py-7">
        <div>
          <h1 className="text-4xl text-primary dark:text-primary_dark font-bold font-robotoCondensed">
            {t("editProduct")}
          </h1>

          <p>
            <Link
              to="/dashboard"
              className="relative text-sm group text-black dark:text-gray-300"
            >
              {t("home")}
              <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-primary dark:bg-gray-300 transition-all duration-500 group-hover:w-full" />
            </Link>{" "}
            /{" "}
            <Link
              to="/dashboard/product"
              className="relative text-sm group text-black dark:text-gray-300"
            >
              {t("products")}
              <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-primary dark:bg-gray-300 transition-all duration-500 group-hover:w-full" />
            </Link>{" "}
            /{" "}
            <span className="text-sm text-primary dark:text-primary_dark">
              {t("editProduct")}
            </span>
          </p>
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
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t("updating")}
            </>
          ) : (
            <>
              <FaCheck /> {t("updateProduct")}
            </>
          )}
        </button>
      </div>

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
                  {t("dragOrClickMax")}
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
              {/* Product Title */}
              <div className="md:col-span-2">
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
                  placeholder={t("enterProductTitle")}
                  required
                  minLength={2}
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
                  placeholder={t("enterProductDescription")}
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
    Pricing & Stock
  </h3>

  <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
        Price <span className="text-red-500 dark:text-red-400">*</span>
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
        Quantity <span className="text-red-500 dark:text-red-400">*</span>
      </label>
      <input
        type="number"
        min="0"
        value={formData.quantity}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, quantity: e.target.value }))
        }
        className="w-full border-2 border-background dark:border-gray-600 rounded-xl p-2 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[3px] focus:border-primary dark:focus:border-primary_dark"
        placeholder="0"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
        Discount (%)
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        max="100"
        value={formData.discount}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, discount: e.target.value }))
        }
        className="w-full border-2 border-background dark:border-gray-600 rounded-xl p-2 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[3px] focus:border-primary dark:focus:border-primary_dark"
        placeholder="0-100"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
        Final Price
      </label>
      <input
        type="text"
        value={
          formData.price && formData.discount
            ? (
                parseFloat(formData.price) -
                (parseFloat(formData.price) * parseFloat(formData.discount)) / 100
              ).toFixed(2)
            : formData.price || "0.00"
        }
        className="w-full border-2 border-background dark:border-gray-600 rounded-xl p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
        disabled
        readOnly
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Calculated automatically
      </p>
    </div>
  </div>
</div>

          {/* Category */}
          <div className="bg-accent dark:bg-accent_dark p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold pb-3 text-gray-900 dark:text-white">
              {t("category")}
            </h3>

            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              {t("label")}{" "}
              <span className="text-red-500 dark:text-red-400">*</span>
            </label>

            <select
              value={showCustomCategory ? "Other" : formData.category}
              onChange={handleCategoryChange}
              className="w-full border-2 border-background dark:border-gray-600 rounded-xl p-2 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white mb-4 focus:outline-none focus:border-[3px] focus:border-primary dark:focus:border-primary_dark"
              required={!showCustomCategory}
            >
              <option value="">{t("select")}</option>
              <option value="Electronics">{t("electronics")}</option>
              <option value="Clothing">{t("clothing")}</option>
              <option value="Home">{t("home")}</option>
              <option value="Stationary">{t("stationary")}</option>
              <option value="Sports">{t("sports")}</option>
              <option value="Beauty">{t("beauty")}</option>
              <option value="Food & Beverages">{t("food")}</option>
              <option value="Books">{t("books")}</option>
              <option value="Other">{t("other")}</option>
            </select>

            {showCustomCategory && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                    {t("enterCustom")}{" "}
                    <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full border-2 border-background dark:border-gray-600 rounded-xl p-2 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[3px] focus:border-primary dark:focus:border-primary_dark"
                    placeholder={t("customPlaceholder")}
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
                  {t("saveButton")}
                </button>

                {formData.category && (
                  <div className="p-3 bg-secondary dark:bg-secondary_dark rounded-lg border-2 border-primary dark:border-primary_dark">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("selectedLabel")}
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

export default EditProduct;
