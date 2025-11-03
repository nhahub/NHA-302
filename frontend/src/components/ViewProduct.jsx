import React, { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaBox,
  FaDollarSign,
  FaTag,
  FaCalendar,
  FaChartLine,
} from "react-icons/fa";
import { X } from "lucide-react";
import {
  useProductById,
  useDeleteProduct,
} from "../features/product/useProductQuery";
import Loader from "./Loader";
import toast from "react-hot-toast";

import Button from "./ui/Button";
import { useTranslation } from "react-i18next";

function ViewProduct() {
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const productFromState = location.state?.product;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch product if not in state
  const { data: productData, isLoading } = useProductById(id);
  const { mutate: deleteProduct } = useDeleteProduct();

  const product = productFromState || productData?.data?.product;

  if (isLoading) return <Loader />;

  if (!product) {
    return (
      <div className="text-center pt-28">
        <p className="text-red-500">{t("ProductNotFound")}</p>
        <Link
          to="/dashboard/product"
          className="text-primary underline mt-4 inline-block"
        >
          {t("backToProducts")}
        </Link>
      </div>
    );
  }

  const priceAfterDiscount =
    product.priceAfterDiscount ||
    (product.discount
      ? (product.price - (product.price * product.discount) / 100).toFixed(2)
      : product.price);

  const stockStatus =
    product.quantity <= 5
      ? t("stock.low")
      : product.quantity > 0
      ? t("stock.in")
      : t("stock.out");

  const stockColorClass =
    product.quantity <= 5
      ? "text-red-600 bg-red-50"
      : product.quantity > 0
      ? "text-primary bg-accent"
      : "text-gray-500 bg-secondary";
  const handleDelete = () => {
    setShowDeleteModal(true);
  };
  const handleEdit = () => {
    navigate(`product/edit/${p.id}`, {
      state: { product: p },
    });
  };

  const confirmDelete = () => {
    deleteProduct(id, {
      onSuccess: () => {
        toast.success("Product deleted successfully!");
        navigate("/dashboard/product");
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Failed to delete product"
        );
      },
    });
  };

  return (
    <div className="md:p-5 font-quicksand">
      {/* ====== Header ====== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-7">
        <div>
          <h1 className="text-4xl text-primary dark:text-primary_dark font-bold font-robotoCondensed">
            {t("productDetails.title")}
          </h1>
          <p>
            <Link
              to="/dashboard"
              className="relative text-sm group text-black dark:text-gray-300"
            >
              {t("breadcrumbs.home")}
              <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-primary dark:bg-gray-300 transition-all duration-500 group-hover:w-full" />
            </Link>{" "}
            /{" "}
            <Link
              to="/dashboard/product"
              className="relative text-sm group text-black dark:text-gray-300"
            >
              {t("breadcrumbs.products")}
              <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-primary dark:bg-gray-300 transition-all duration-500 group-hover:w-full" />
            </Link>{" "}
            /{" "}
            <span className="text-sm text-primary dark:text-primary_dark">
              {t("breadcrumbs.viewProduct")}
            </span>
          </p>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={() =>
              navigate(`/dashboard/product/product/edit/${id}`, {
                state: { product },
              })
            }
            className="bg-primary dark:bg-primary_dark text-white px-3 py-2 rounded-xl text-sm before:bg-secondary dark:before:bg-secondary_dark hover:text-black dark:hover:text-white transition-all"
          >
            <FaEdit className="inline mr-1" />
            {t("buttons.edit")}
          </Button>

          <Button
            onClick={handleDelete}
            className="bg-white dark:bg-gray-800 text-primary dark:text-primary_dark border-2 border-primary dark:border-primary_dark px-3 py-2 rounded-xl text-sm hover:bg-primary dark:hover:bg-primary_dark hover:text-white transition-all"
          >
            <FaTrash className="inline mr-1" />
            {t("buttons.delete")}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex justify-center items-center z-50">
          <div className="bg-background dark:bg-background_dark rounded-2xl shadow-xl w-[90%] sm:w-[400px] p-6 relative transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition-all duration-200"
            >
              <X
                size={22}
                className="rounded-2xl border-red-800 dark:border-red-700 border-2 text-red-800 dark:text-red-700 hover:text-red-900 dark:hover:text-red-600 hover:border-red-900 dark:hover:border-red-600 transition-all duration-300 ease-in-out"
              />
            </button>

            <div className="text-center space-y-4 mt-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("DeleteProduct")}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t("AreYouSureYouWantToDelete")} <b>{product.title}</b>?
              </p>

              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition"
                >
                  {t("Cancel")}
                </button>

                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-800 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition"
                >
                  {t(" ConfirmDelete")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== Content ====== */}
      <section className="grid lg:grid-cols-3 grid-cols-1 gap-6">
        {/* Product Image */}
        <div className="bg-accent dark:bg-accent_dark rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
          {product.imgCover ? (
            <div className="relative group">
              <img
                src={product.imgCover}
                alt={product.title}
                className="rounded-xl w-full object-cover max-h-96 transition-transform duration-300 group-hover:scale-105"
              />
              {product.discount > 0 && (
                <div className="absolute top-4 right-4 bg-primary dark:bg-primary_dark text-white px-3 py-2 rounded-xl font-bold text-sm shadow-lg">
                  -{product.discount}% {t("Off")}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-64 bg-secondary dark:bg-secondary_dark rounded-xl flex flex-col items-center justify-center border border-gray-200 dark:border-gray-700">
              <FaBox className="text-gray-400 dark:text-gray-500 text-6xl mb-2" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {t("NoImageAvailable")}
              </p>
            </div>
          )}

          {/* Stock Status Badge */}
          <div className="mt-4">
            <div
              className={`${stockColorClass} dark:bg-opacity-80 px-4 py-3 rounded-xl text-center font-semibold transition-all duration-300 border-2 ${
                product.quantity <= 5
                  ? "border-red-200 dark:border-red-700"
                  : "border-primary/20 dark:border-primary_dark/20"
              }`}
            >
              {stockStatus}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-2 bg-accent dark:bg-accent_dark p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          {/* Title & Category */}
          <div className="border-b border-gray-300 dark:border-gray-600 pb-4 mb-6">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-3">
              {product.title}
            </h2>
            <div className="flex items-center gap-2">
              <FaTag className="text-primary dark:text-primary_dark" />
              <span className="bg-secondary dark:bg-secondary_dark text-primary dark:text-primary_dark px-4 py-1.5 rounded-full text-sm font-semibold border border-gray-200 dark:border-gray-700">
                {product.category}
              </span>
            </div>
          </div>

          {/* Info Cards Grid - أصغر */}
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mb-6">
            {/* Price Card */}
            <div className="bg-secondary/40 dark:bg-secondary_dark/40 p-4 rounded-xl border-2 border-primary/20 dark:border-primary_dark/20 hover:border-primary dark:hover:border-primary_dark hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-primary dark:bg-primary_dark p-1.5 rounded-lg">
                  <FaDollarSign className="text-white text-base" />
                </div>
                <p className="text-xs text-gray-900 dark:text-white font-semibold">
                  {t("price")}
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-primary dark:text-primary_dark">
                  ${priceAfterDiscount}
                </p>
                {product.discount > 0 && (
                  <div className="flex flex-col">
                    <p className="text-xs line-through text-gray-400 dark:text-gray-500">
                      ${product.price}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Stock Card */}
            <div className="bg-secondary/40 dark:bg-secondary_dark/40 p-4 rounded-xl border-2 border-primary/20 dark:border-primary_dark/20 hover:border-primary dark:hover:border-primary_dark hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-primary dark:bg-primary_dark p-1.5 rounded-lg">
                  <FaBox className="text-white text-base" />
                </div>
                <p className="text-xs text-gray-900 dark:text-white font-semibold">
                  {t("stockQuantity")}
                </p>
              </div>
              <p className="text-2xl font-bold text-primary dark:text-primary_dark">
                {product.quantity || 0}
                <span className="text-sm text-gray-900 dark:text-white ml-1 font-normal">
                  {t("Units")}
                </span>
              </p>
            </div>

            {/* Sold Card */}
            <div className="bg-secondary/40 dark:bg-secondary_dark/40 p-4 rounded-xl border-2 border-primary/20 dark:border-primary_dark/20 hover:border-primary dark:hover:border-primary_dark hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-primary dark:bg-primary_dark p-1.5 rounded-lg">
                  <FaChartLine className="text-white text-base" />
                </div>
                <p className="text-xs text-gray-900 dark:text-white font-semibold">
                  {t("totalSold")}
                </p>
              </div>
              <p className="text-2xl font-bold text-primary dark:text-primary_dark">
                {product.sold || 0}
                <span className="text-sm text-gray-900 dark:text-white ml-1 font-normal">
                  {t("Units")}
                </span>
              </p>
            </div>

            {/* Created Date Card */}
            <div className="bg-secondary/40 dark:bg-secondary_dark/40 p-4 rounded-xl border-2 border-primary/20 dark:border-primary_dark/20 hover:border-primary dark:hover:border-primary_dark hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-primary dark:bg-primary_dark p-1.5 rounded-lg">
                  <FaCalendar className="text-white text-base" />
                </div>
                <p className="text-xs text-gray-900 dark:text-white font-semibold">
                  {t("createdDate")}
                </p>
              </div>
              <p className="text-base font-semibold text-primary dark:text-primary_dark">
                {new Date(product.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white/20 dark:bg-black/20 p-5 rounded-xl border-2 border-primary/20 dark:border-primary_dark/20 ">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary dark:bg-primary_dark rounded"></span>
              {t("productDescription")}
            </h3>
            <p className="text-base text-gray-900 dark:text-white leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Stats Summary */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {/* Total Revenue */}
            <div
              className="bg-accent dark:bg-accent_dark shadow-md px-6 py-4 rounded-2xl border-2 border-primary/20 dark:border-primary_dark/20 text-center 
      transition-all duration-500 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl 
      hover:bg-gradient-to-br hover:from-primary hover:to-secondary dark:hover:from-primary_dark dark:hover:to-secondary_dark hover:text-white cursor-pointer"
            >
              <p className="text-2xl font-bold text-primary dark:text-primary_dark font-quicksand hover:text-white">
                $
                {(parseFloat(priceAfterDiscount) * (product.sold || 0)).toFixed(
                  2
                )}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-quicksand hover:text-white/90">
                {t("totalRevenue")}
              </p>
            </div>

            {/* Initial Stock */}
            <div
              className="bg-accent dark:bg-accent_dark shadow-md px-6 py-4 rounded-2xl border-2 border-primary/20 dark:border-primary_dark/20 text-center 
      transition-all duration-500 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl 
      hover:bg-gradient-to-br hover:from-primary hover:to-secondary dark:hover:from-primary_dark dark:hover:to-secondary_dark hover:text-white cursor-pointer"
            >
              <p className="text-2xl font-bold text-primary dark:text-primary_dark font-quicksand hover:text-white">
                {product.quantity + (product.sold || 0)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-quicksand hover:text-white/90">
                {t("initialStock")}
              </p>
            </div>

            {/* Sold Rate */}
            <div
              className="bg-accent dark:bg-accent_dark shadow-md px-6 py-4 rounded-2xl border-2 border-primary/20 dark:border-primary_dark/20 text-center 
      transition-all duration-500 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl 
      hover:bg-gradient-to-br hover:from-primary hover:to-secondary dark:hover:from-primary_dark dark:hover:to-secondary_dark hover:text-white cursor-pointer"
            >
              <p className="text-2xl font-bold text-primary dark:text-primary_dark font-quicksand hover:text-white">
                {product.sold > 0
                  ? (
                      (product.sold / (product.quantity + product.sold)) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-quicksand hover:text-white/90">
                {t("soldRate")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ViewProduct;
