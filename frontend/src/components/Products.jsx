import React, { useState } from "react";
import { Search, Filter, ChevronDown, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaSortUp,
  FaSortDown,
  FaTimes,
} from "react-icons/fa";
import Button from "./ui/Button";
import {
  useProductsByCompany,
  useDeleteProduct,
} from "../features/product/useProductQuery";
import Loader from "./Loader";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

function Products() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 4;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [openItems, setOpenItems] = useState({});

  // Filter & Sort States
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    priceMin: "",
    priceMax: "",
    stockMin: "",
    inStock: false,
  });

  // Get company ID from localStorage
  const userData = JSON.parse(localStorage.getItem("user"));
  const companyId = userData?.company;

  // Fetch products from API
  const { data, isLoading, error } = useProductsByCompany(companyId);
  const { mutate: deleteProduct } = useDeleteProduct();

  // Loading state
  if (isLoading) return <Loader />;

  // Error state
  if (error)
    return (
      <p className="text-red-500 text-center pt-28">
        {t("ErrorFetchingProducts")}
      </p>
    );

  // Extract products from API response
  const products = Array.isArray(data?.data?.products)
    ? data.data.products
    : [];

  // Get unique categories for filter
  const categories = [...new Set(products.map((p) => p.category))].filter(
    Boolean
  );

  // Search filter
  const searchFilteredProducts = products.filter(
    (product) =>
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply filters
  const filteredProducts = searchFilteredProducts.filter((product) => {
    // Category filter
    if (filters.category && product.category !== filters.category) {
      return false;
    }

    // Price filter
    if (
      filters.priceMin &&
      parseFloat(product.price) < parseFloat(filters.priceMin)
    ) {
      return false;
    }
    if (
      filters.priceMax &&
      parseFloat(product.price) > parseFloat(filters.priceMax)
    ) {
      return false;
    }

    // Stock filter
    if (filters.stockMin && product.quantity < parseInt(filters.stockMin)) {
      return false;
    }
    if (filters.inStock && product.quantity <= 0) {
      return false;
    }

    return true;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortConfig.key === "price") {
      const priceA = parseFloat(a.price);
      const priceB = parseFloat(b.price);
      return sortConfig.direction === "asc" ? priceA - priceB : priceB - priceA;
    }

    if (sortConfig.key === "quantity") {
      return sortConfig.direction === "asc"
        ? a.quantity - b.quantity
        : b.quantity - a.quantity;
    }

    if (sortConfig.key === "title") {
      return sortConfig.direction === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }

    if (sortConfig.key === "category") {
      return sortConfig.direction === "asc"
        ? a.category.localeCompare(b.category)
        : b.category.localeCompare(a.category);
    }

    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSortFromModal = (key) => {
    handleSort(key);
    setShowSortModal(false);
    toast.success(`Sorted by ${key}`);
  };

  const handleApplyFilters = () => {
    setShowFilterModal(false);
    setCurrentPage(1); // Reset to first page
    toast.success("Filters applied");
  };

  const handleClearFilters = () => {
    setFilters({
      category: "",
      priceMin: "",
      priceMax: "",
      stockMin: "",
      inStock: false,
    });
    toast.success("Filters cleared");
  };

  const toggleModal = (id, value) => {
    setOpenItems((prev) => ({ ...prev, [`modal-${id}`]: value }));
  };

  const toggleProduct = (id) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Check if any filters are active
  const hasActiveFilters =
    filters.category ||
    filters.priceMin ||
    filters.priceMax ||
    filters.stockMin ||
    filters.inStock;

  return (
    <div className="bg-background dark:bg-background_dark w-full h-full">
      {/* Header */}

      <section className="bg-secondary dark:bg-secondary_dark w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 sm:pb-6 lg:pb-0 px-3 pt-3 lg:pt-0">
        <h1 className="font-robotoCondensed font-extrabold text-2xl sm:text-3xl lg:text-4xl text-primary dark:text-primary_dark">
          {t("Products")}
        </h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative w-full lg:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search Product"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 pl-10 pr-4 py-2 w-full rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary_dark/50 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-quicksand"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilterModal(true)}
            className="relative flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary_dark/50 font-quicksand cursor-pointer text-gray-900 dark:text-white"
          >
            <Filter size={16} />
            <span>{t("Filter")}</span>
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                !
              </span>
            )}
          </button>

          {/* Sort Button */}
          <button
            onClick={() => setShowSortModal(true)}
            className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary_dark/50 font-quicksand cursor-pointer text-gray-900 dark:text-white"
          >
            <span>{t("SortBy")}</span>
            <svg
              className="w-4 h-4 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Add Product Button */}
          <Button
            className="flex items-center justify-center gap-2 !bg-primary dark:!bg-primary_dark !text-white hover:!bg-accent dark:hover:!bg-secondary_dark hover:!text-black dark:hover:!text-white !border-primary dark:!border-primary_dark hover:!border-accent dark:hover:!border-secondary_dark before:!bg-accent dark:before:!bg-secondary_dark"
            onClick={() => navigate("product/add")}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t("AddProduct")}
          </Button>
        </div>
      </section>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-background dark:bg-background_dark rounded-2xl shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-primary dark:text-primary_dark font-robotoCondensed">
                {t("Filter")} {t("Products")}
              </h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Filter Options */}
            <div className="space-y-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  {t("Category")}
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl p-2 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white focus:outline-none focus:border-primary dark:focus:border-primary_dark"
                >
                  <option value="">{t("AllCategories")}</option>
                  {categories.map((cat, index) => (
                    <option key={index} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  {t("PriceRange")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceMin}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceMin: e.target.value,
                      }))
                    }
                    className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl p-2 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary dark:focus:border-primary_dark"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceMax}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceMax: e.target.value,
                      }))
                    }
                    className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl p-2 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary dark:focus:border-primary_dark"
                    min="0"
                  />
                </div>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  {t("MinimumStock")}
                </label>
                <input
                  type="number"
                  placeholder="Min stock quantity"
                  value={filters.stockMin}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      stockMin: e.target.value,
                    }))
                  }
                  className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl p-2 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary dark:focus:border-primary_dark"
                  min="0"
                />
              </div>

              {/* In Stock Only */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={filters.inStock}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      inStock: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-primary dark:text-primary_dark border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary_dark"
                />
                <label
                  htmlFor="inStock"
                  className="text-sm text-gray-900 dark:text-white"
                >
                  {t("InStockOnly")}
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClearFilters}
                className="flex-1 px-4 py-2 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 font-medium transition-all duration-500"
              >
                {t("clearAll")}
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-2 bg-primary dark:bg-primary_dark text-white rounded-xl hover:bg-secondary dark:hover:bg-secondary_dark hover:text-primary dark:hover:text-white font-medium transition-all duration-500"
              >
                {t("ApplyFilters")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sort Modal */}
      {showSortModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-background dark:bg-background_dark rounded-2xl shadow-xl w-full max-w-sm p-6 relative border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-primary dark:text-primary_dark font-robotoCondensed">
                {t("SortBy")} {t("Products")}
              </h3>
              <button
                onClick={() => setShowSortModal(false)}
                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <button
                onClick={() => handleSortFromModal("title")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                  sortConfig.key === "title"
                    ? "bg-primary dark:bg-primary_dark text-white"
                    : "bg-accent dark:bg-accent_dark hover:bg-secondary dark:hover:bg-secondary_dark text-gray-900 dark:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t("Name")}</span>
                  {sortConfig.key === "title" && (
                    <span className="text-sm">
                      {sortConfig.direction === "asc" ? "A → Z" : "Z → A"}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleSortFromModal("price")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                  sortConfig.key === "price"
                    ? "bg-primary dark:bg-primary_dark text-white"
                    : "bg-accent dark:bg-accent_dark hover:bg-secondary dark:hover:bg-secondary_dark text-gray-900 dark:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t("Price")}</span>
                  {sortConfig.key === "price" && (
                    <span className="text-sm">
                      {sortConfig.direction === "asc"
                        ? t("LowToHigh")
                        : t("HighToLow")}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleSortFromModal("quantity")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                  sortConfig.key === "quantity"
                    ? "bg-primary dark:bg-primary_dark text-white"
                    : "bg-accent dark:bg-accent_dark hover:bg-secondary dark:hover:bg-secondary_dark text-gray-900 dark:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t("quantity")}</span>
                  {sortConfig.key === "quantity" && (
                    <span className="text-sm">
                      {sortConfig.direction === "asc"
                        ? t("LowToHigh")
                        : t("HighToLow")}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleSortFromModal("category")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                  sortConfig.key === "category"
                    ? "bg-primary dark:bg-primary_dark text-white"
                    : "bg-accent dark:bg-accent_dark hover:bg-secondary dark:hover:bg-secondary_dark text-gray-900 dark:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t("Category")}</span>
                  {sortConfig.key === "category" && (
                    <span className="text-sm">
                      {sortConfig.direction === "asc"
                        ? t("LowToHigh")
                        : t("HighToLow")}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Title */}
      <div className="md:p-5">
        <section className="pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p>
              <Link
                to="/dashboard"
                className="relative text-sm font-quicksand group text-black dark:text-gray-300"
              >
                {t("Home")}
                <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-primary dark:bg-gray-300 transition-all duration-500 group-hover:w-full" />
              </Link>{" "}
              /{" "}
              <span className="text-sm font-quicksand text-primary dark:text-primary_dark">
                {t("Products")}
              </span>
            </p>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-3">
                {filters.category && (
                  <span className="inline-flex items-center gap-1 bg-primary dark:bg-primary_dark text-white text-xs px-3 py-1 rounded-full">
                    {filters.category}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, category: "" }))
                      }
                    >
                      <FaTimes size={10} />
                    </button>
                  </span>
                )}
                {filters.priceMin && (
                  <span className="inline-flex items-center gap-1 bg-primary dark:bg-primary_dark text-white text-xs px-3 py-1 rounded-full">
                    Min: ${filters.priceMin}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, priceMin: "" }))
                      }
                    >
                      <FaTimes size={10} />
                    </button>
                  </span>
                )}
                {filters.priceMax && (
                  <span className="inline-flex items-center gap-1 bg-primary dark:bg-primary_dark text-white text-xs px-3 py-1 rounded-full">
                    {t("Max")}: ${filters.priceMax}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, priceMax: "" }))
                      }
                    >
                      <FaTimes size={10} />
                    </button>
                  </span>
                )}
                {filters.inStock && (
                  <span className="inline-flex items-center gap-1 bg-primary dark:bg-primary_dark text-white text-xs px-3 py-1 rounded-full">
                    {t("InStockOnly")}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, inStock: false }))
                      }
                    >
                      <FaTimes size={10} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t("Showing")} {currentProducts.length} of {sortedProducts.length}{" "}
            products
          </div>
        </section>

        {/* Table - Desktop View */}
        <section className="overflow-x-auto hidden sm:block">
          <div className="w-full">
            {/* Header Row */}
            <div className="grid grid-cols-5 gap-4 text-gray-900 dark:text-white text-sm font-semibold font-quicksand px-6 py-3 rounded-lg mb-3">
              <div>{t("Name")}</div>

              <div
                className="flex items-center gap-1 cursor-pointer select-none"
                onClick={() => handleSort("price")}
              >
                {t("Price")}
                {sortConfig.key === "price" &&
                sortConfig.direction === "asc" ? (
                  <FaSortUp className="text-primary dark:text-primary_dark" />
                ) : (
                  <FaSortDown className="text-primary dark:text-primary_dark" />
                )}
              </div>

              <div
                className="flex items-center gap-1 cursor-pointer select-none"
                onClick={() => handleSort("quantity")}
              >
                {t("Stock")}
                {sortConfig.key === "quantity" &&
                sortConfig.direction === "asc" ? (
                  <FaSortUp className="text-primary dark:text-primary_dark" />
                ) : (
                  <FaSortDown className="text-primary dark:text-primary_dark" />
                )}
              </div>

              <div>{t("Category")}</div>
              <div>{t("Actions")}</div>
            </div>

            {/* Rows */}
            {currentProducts.length === 0 ? (
              <p className="text-center text-primary dark:text-primary_dark py-4">
                {t("NoProductFound")}
              </p>
            ) : (
              currentProducts.map((p) => (
                <div
                  key={p._id}
                  className="grid grid-cols-5 gap-4 items-center bg-accent dark:bg-accent_dark shadow-sm rounded-2xl px-6 py-4 mb-3 hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.imgCover || "https://placehold.co/150x150/png"}
                      alt={p.title}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                    />
                    <div>
                      <p className="text-gray-900 dark:text-white text-sm font-quicksand">
                        {p.title}
                      </p>
                      <p className="text-xs text-primary dark:text-primary_dark font-quicksand">
                        SKU {p.sku}
                      </p>
                    </div>
                  </div>

                  <div className="text-gray-900 dark:text-white text-sm font-quicksand">
                    ${p.price}
                    {p.discount > 0 && (
                      <span className="ml-2 text-xs text-red-500 dark:text-red-400">
                        -{p.discount}%
                      </span>
                    )}
                  </div>
                  <div className="text-gray-900 dark:text-white text-sm font-quicksand">
                    <span
                      className={`${
                        p.quantity <= 5
                          ? "text-red-500 dark:text-red-400 font-semibold"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {p.quantity || 0}
                    </span>
                  </div>
                  <div className="text-gray-900 dark:text-white text-sm font-quicksand">
                    {p.category}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        navigate(`product/view/${p._id}`, {
                          state: { product: p },
                        })
                      }
                    >
                      <FaEye className="w-5 h-5 inline text-primary dark:text-primary_dark" />
                    </button>

                    <button
                      onClick={() =>
                        navigate(`product/edit/${p._id}`, {
                          state: { product: p },
                        })
                      }
                    >
                      <FaEdit className="w-5 h-5 inline text-primary dark:text-primary_dark" />
                    </button>

                    <button onClick={() => toggleModal(p._id, true)}>
                      <FaTrash className="w-4 h-4 inline text-primary dark:text-primary_dark" />
                    </button>

                    {/* Delete Modal */}
                    {openItems[`modal-${p._id}`] && (
                      <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex justify-center items-center z-50">
                        <div className="bg-background dark:bg-background_dark rounded-2xl shadow-xl w-[90%] sm:w-[400px] p-6 relative transition-all duration-300 border border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => toggleModal(p._id, false)}
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
                              {t("AreYouSureYouWantToDelete")} <b>{p.title}</b>?
                            </p>

                            <div className="flex justify-center gap-4 pt-4">
                              <button
                                onClick={() => toggleModal(p._id, false)}
                                className="px-4 py-2 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition"
                              >
                                {t("Cancel")}
                              </button>

                              <button
                                onClick={() => {
                                  deleteProduct(p._id, {
                                    onSuccess: () => {
                                      toast.success(
                                        "Product deleted successfully"
                                      );
                                      toggleModal(p._id, false);
                                    },
                                    onError: (err) => {
                                      toast.error(
                                        err?.response?.data?.message ||
                                          "Failed to delete product"
                                      );
                                    },
                                  });
                                }}
                                className="px-4 py-2 bg-red-800 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition"
                              >
                                {t("ConfirmDelete")}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Mobile View */}
        <section className="sm:hidden">
          {currentProducts.map((p) => (
            <div
              key={p._id}
              className="relative w-full border-b border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-center w-full py-3 px-4 bg-accent dark:bg-accent_dark">
                <div className="flex gap-3 items-center">
                  <img
                    src={p.imgCover || "https://placehold.co/50x50/png"}
                    alt={p.title}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {p.title}
                    </p>
                    <p className="text-xs text-primary dark:text-primary_dark">
                      {p.category}
                    </p>
                  </div>
                </div>
                <button onClick={() => toggleProduct(p._id)}>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-900 dark:text-white transition-transform ${
                      openItems[p._id] ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {openItems[p._id] && (
                <div className="bg-accent dark:bg-accent_dark w-full rounded-lg p-4 mt-1 border border-gray-200 dark:border-gray-700">
                  <div className="text-gray-900 dark:text-white text-sm mb-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      {t("Price")}:{" "}
                    </span>
                    ${p.price}
                  </div>
                  <div className="text-gray-900 dark:text-white text-sm mb-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      {t("Stock")}:{" "}
                    </span>
                    {p.quantity || 0}
                  </div>
                  <div className="text-gray-900 dark:text-white text-sm mb-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      {t("Category")}:{" "}
                    </span>
                    {p.category}
                  </div>
                  <div className="flex gap-2 text-gray-900 dark:text-white text-sm mb-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      {t("Actions")}:{" "}
                    </span>
                    <div className="flex gap-4">
                      <button
                        onClick={() =>
                          navigate(`product/view/${p._id}`, {
                            state: { product: p },
                          })
                        }
                      >
                        <FaEye className="w-5 h-5 inline text-primary dark:text-primary_dark" />
                      </button>
                      <button
                        onClick={() =>
                          navigate(`product/edit/${p._id}`, {
                            state: { product: p },
                          })
                        }
                      >
                        <FaEdit className="w-5 h-5 inline text-primary dark:text-primary_dark" />
                      </button>
                      <button onClick={() => toggleModal(p._id, true)}>
                        <FaTrash className="w-4 h-4 inline text-primary dark:text-primary_dark" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            className="px-2 py-2 bg-secondary dark:bg-secondary_dark border-2 border-primary dark:border-primary_dark rounded-xl disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <FaChevronLeft className="text-primary dark:text-primary_dark" />
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`relative px-3 py-1.5 rounded-xl border-2 text-sm font-medium transition-all overflow-hidden
                before:absolute before:inset-0 before:-translate-x-full
                before:bg-white/30 before:skew-x-[45deg]
                before:transition-transform before:duration-700
                hover:before:translate-x-full
                ${
                  p === currentPage
                    ? "bg-primary dark:bg-primary_dark text-white border-primary dark:border-primary_dark"
                    : "bg-transparent text-gray-900 dark:text-white border-primary dark:border-primary_dark hover:bg-secondary dark:hover:bg-secondary_dark hover:text-primary dark:hover:text-primary_dark"
                }
              `}
              >
                <span className="relative z-10">{p}</span>
              </button>
            ))}
          </div>

          <button
            className="px-2 py-2 bg-secondary dark:bg-secondary_dark border-2 border-primary dark:border-primary_dark rounded-xl disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <FaChevronRight className="text-primary dark:text-primary_dark" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Products;
