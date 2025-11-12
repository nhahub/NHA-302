import React, { useState, useMemo, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { X } from "lucide-react";
import arrowicon from "../assets/open-arrow-icon.png";
import {
  useInvoicesByCompany,
  useInvoiceStats,
} from "../features/invoice/useInvoiceQuery";
import { useUserContext } from "../features/user/useUserContext";
import { CompanyContext } from "../features/company/CompanyContext";
import Button from "./ui/Button";
import Table from "./ui/Table";
import Loader from "./Loader";
import { useTranslation } from "react-i18next";

function Invoices() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentUser } = useUserContext();
  const { currentCompany } = useContext(CompanyContext) || {};
  const [openLatest, setOpenLatest] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  // Resolve company id: prefer CompanyContext, then currentUser, then stored company
  const storedCompany = JSON.parse(localStorage.getItem("company"));
  const companyId =
    currentCompany?._id || currentUser?.company || storedCompany?._id || storedCompany?.id || null;

  // Fetch invoices by company and stats
  const {
    data: invoicesResponse,
    isLoading: invoicesLoading,
    error: invoicesError,
  } = useInvoicesByCompany(companyId);
  const { data: statsResponse, isLoading: statsLoading } = useInvoiceStats();

  // Extract invoices data from response
  const allInvoices = useMemo(() => {
    if (!invoicesResponse) return [];

    // Handle different response structures
    if (Array.isArray(invoicesResponse)) {
      return invoicesResponse;
    }

    // Check if response has data property
    if (invoicesResponse.data) {
      // Direct array in data
      if (Array.isArray(invoicesResponse.data)) {
        return invoicesResponse.data;
      }
      // Check if data has a json property (nested structure)
      if (
        invoicesResponse.data.json &&
        Array.isArray(invoicesResponse.data.json)
      ) {
        return invoicesResponse.data.json;
      }
      // Check if data has invoices property
      if (
        invoicesResponse.data.invoices &&
        Array.isArray(invoicesResponse.data.invoices)
      ) {
        return invoicesResponse.data.invoices;
      }
    }

    // Check if response itself has json property
    if (invoicesResponse.json && Array.isArray(invoicesResponse.json)) {
      return invoicesResponse.json;
    }

    return [];
  }, [invoicesResponse]);

  // Extract stats from response
  const stats = useMemo(() => {
    const defaultStats = {
      total: 0,
      paid: 0,
      pending: 0,
      overdue: 0,
      count: { total: 0, paid: 0, pending: 0, overdue: 0 },
    };

    if (!statsResponse) return defaultStats;

    if (statsResponse.data) {
      return {
        total: statsResponse.data.total || 0,
        paid: statsResponse.data.paid || 0,
        pending: statsResponse.data.pending || 0,
        overdue: statsResponse.data.overdue || 0,
        count: statsResponse.data.count || {
          total: 0,
          paid: 0,
          pending: 0,
          overdue: 0,
        },
      };
    }

    return defaultStats;
  }, [statsResponse]);

  // Calculate real stats from invoices (as backup or if API doesn't provide counts)
  const calculatedStats = useMemo(() => {
    const calculated = {
      total: 0,
      paid: 0,
      pending: 0,
      overdue: 0,
      count: {
        total: allInvoices.length,
        paid: 0,
        pending: 0,
        overdue: 0,
      },
    };

    allInvoices.forEach((invoice) => {
      const amount = invoice.total || 0;
      calculated.total += amount;

      switch (invoice.status?.toLowerCase()) {
        case "paid":
          calculated.paid += amount;
          calculated.count.paid++;
          break;
        case "pending":
          calculated.pending += amount;
          calculated.count.pending++;
          break;
        case "overdue":
          calculated.overdue += amount;
          calculated.count.overdue++;
          break;
        default:
          calculated.pending += amount;
          calculated.count.pending++;
      }
    });

    return calculated;
  }, [allInvoices]);

  // Use calculated stats if API stats are all zero or not available
  const displayStats = useMemo(() => {
    // Always use calculated stats if we have invoices
    // The API stats might be unreliable or outdated
    if (allInvoices.length > 0) {
      return calculatedStats;
    }

    return stats;
  }, [stats, calculatedStats, allInvoices.length]);

  // Transform invoices to match table format
  const transformedInvoices = useMemo(() => {
    return allInvoices
      .filter((invoice) => invoice && invoice._id) // Filter out null/invalid invoices
      .map((invoice) => {
        // Transform products to include all necessary details
        const transformedProducts =
          invoice.products?.map((p) => {
            // Skip if product is null or undefined
            if (!p || !p.product) {
              return null;
            }
            
            // Check if product is populated (object) or just an ID
            const productData = typeof p.product === "object" ? p.product : {};
            return {
              _id: productData._id || p.product,
              title: productData.title || productData.name || "Product",
              description: productData.description || "",
              price: productData.price || 0,
              priceAfterDiscount: productData.priceAfterDiscount,
              quantity: productData.quantity || 0,
              stockQuantity: productData.quantity || 0,
              invoiceQuantity: p.quantity || 1,
              imgCover: productData.imgCover,
            };
          }).filter(Boolean) || []; // Remove null entries

        return {
          id: invoice.invoiceId || invoice._id,
          _id: invoice._id,
          customer: invoice.customer?.name || "N/A",
          customerId: invoice.customer?._id,
          customerData: invoice.customer,
          date: invoice.orderDate
            ? new Date(invoice.orderDate).toLocaleDateString()
            : "N/A",
          dueDate: invoice.dueDate,
          amount: `${invoice.total?.toFixed(2) || 0} EGP`,
          rawAmount: invoice.total || 0,
          status: invoice.status || "Pending",
          orderDate: invoice.orderDate,
          paymentMethod: invoice.paymentMethod || "Cash",
          subTotal: invoice.subTotal || 0,
          discount: invoice.discount || 0,
          products: transformedProducts,
        };
      });
  }, [allInvoices]);

  // Filter and sort invoices
  const filteredAndSortedInvoices = useMemo(() => {
    let result = [...transformedInvoices];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (invoice) =>
          (invoice.id &&
            invoice.id
              .toString()
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (invoice.customer &&
            invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (invoice) =>
          invoice.status &&
          invoice.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.orderDate || 0) - new Date(a.orderDate || 0);
        case "amount":
          return (b.rawAmount || 0) - (a.rawAmount || 0);
        case "status":
          return (a.status || "").localeCompare(b.status || "");
        case "customer":
          return (a.customer || "").localeCompare(b.customer || "");
        default:
          return 0;
      }
    });

    return result;
  }, [transformedInvoices, searchTerm, sortBy, statusFilter]);

  const toggleLatest = () => {
    setOpenLatest(!openLatest);
  };

  const handleSortFromModal = (sortOption) => {
    setSortBy(sortOption);
    setShowSortModal(false);
  };

  const handleApplyFilters = () => {
    setShowFilterModal(false);
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
  };

  // Check if filters are active
  const hasActiveFilters = statusFilter !== "all";

  return (
    <>
      {/* newtopbar */}
      <section className="bg-secondary dark:bg-secondary_dark w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 sm:pb-6 lg:pb-0 px-3 pt-3 lg:pt-0">
        <h1 className="font-robotoCondensed font-extrabold text-2xl sm:text-3xl lg:text-4xl text-primary dark:text-primary_dark">
          {t("Invoices")}
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
              placeholder={t("search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 pl-10 pr-4 py-2 w-full rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary_dark/50 focus:border-transparent font-quicksand text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilterModal(true)}
            className="relative flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary_dark/50 font-quicksand cursor-pointer text-gray-900 dark:text-white"
          >
            {/* icon */}
            <span>{t("filter")}</span>
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
            <span>{t("sortBy")}</span>
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

          {/* Add Invoice */}
          <Button
            className="flex items-center justify-center gap-2 !bg-primary dark:!bg-primary_dark !text-white hover:!bg-accent dark:hover:!bg-accent_dark hover:!text-black dark:hover:!text-white !border-primary dark:!border-primary_dark hover:!border-accent dark:hover:!border-accent_dark before:!bg-accent dark:before:!bg-accent_dark"
            onClick={() => navigate("/dashboard/invoice/add")}
          >
            {/* icon */}
            {t("addInvoice")}
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
                {t("filterInvoices")}
              </h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Filter Options */}
            <div className="space-y-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  {t("invoiceStatus")}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl p-2 bg-secondary dark:bg-secondary_dark focus:outline-none focus:border-primary dark:focus:border-primary_dark text-gray-900 dark:text-white"
                >
                  <option value="all">{t("allStatus")}</option>
                  <option value="paid">{t("paid")}</option>
                  <option value="pending">{t("pending")}</option>
                  <option value="overdue">{t("overdue")}</option>
                </select>
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
                className="flex-1 px-4 py-2 bg-primary dark:bg-primary_dark text-white rounded-xl hover:bg-secondary dark:hover:bg-secondary_dark hover:text-primary dark:hover:text-primary_dark font-medium transition-all duration-500"
              >
                {t("applyFilters")}
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
                {t("sortInvoices")}
              </h3>
              <button
                onClick={() => setShowSortModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <button
                onClick={() => handleSortFromModal("date")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                  sortBy === "date"
                    ? "bg-primary dark:bg-primary_dark text-white"
                    : "bg-accent dark:bg-accent_dark hover:bg-secondary dark:hover:bg-secondary_dark text-gray-900 dark:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t("date")}</span>
                  {sortBy === "date" && (
                    <span className="text-sm">{t("newestFirst")}</span>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleSortFromModal("amount")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                  sortBy === "amount"
                    ? "bg-primary dark:bg-primary_dark text-white"
                    : "bg-accent dark:bg-accent_dark hover:bg-secondary dark:hover:bg-secondary_dark text-gray-900 dark:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t("amount")}</span>
                  {sortBy === "amount" && (
                    <span className="text-sm">{t("highToLow")}</span>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleSortFromModal("status")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                  sortBy === "status"
                    ? "bg-primary dark:bg-primary_dark text-white"
                    : "bg-accent dark:bg-accent_dark hover:bg-secondary dark:hover:bg-secondary_dark text-gray-900 dark:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t("status")}</span>
                  {sortBy === "status" && (
                    <span className="text-sm">{t("aToZ")}</span>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleSortFromModal("customer")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                  sortBy === "customer"
                    ? "bg-primary dark:bg-primary_dark text-white"
                    : "bg-accent dark:bg-accent_dark hover:bg-secondary dark:hover:bg-secondary_dark text-gray-900 dark:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t("customer")}</span>
                  {sortBy === "customer" && (
                    <span className="text-sm">{t("aToZ")}</span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb Section */}
      <div className="px-3 md:px-5">
        <section className="pb-4 sm:pb-6 lg:pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-sm sm:text-base">
              <Link
                to="/dashboard"
                className="relative text-sm font-quicksand group text-black dark:text-gray-300"
              >
                {t("home")}
                <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-primary dark:bg-gray-300 transition-all duration-500 group-hover:w-full" />
              </Link>{" "}
              /{" "}
              <span className="text-sm font-quicksand text-primary dark:text-primary_dark">
                {t("invoices")}
              </span>
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="w-full mx-auto my-4">
          <div className="bg-accent dark:bg-accent_dark w-full sm:w-5/6 lg:w-4/6 mx-auto p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <h2 className="font-robotoCondensed text-xl sm:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary_dark transition-colors duration-300">
              {t("quickStats")}
            </h2>
            {statsLoading || invoicesLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 pt-4 font-quicksand text-base sm:text-lg lg:text-xl">
                <div className="bg-primary/50 mb-2 rounded-md text-center p-3 sm:p-4 animate-pulse">
                  {t("loading")}
                </div>
                <div className="bg-primary/50 mb-2 rounded-md text-center p-3 sm:p-4 animate-pulse">
                  {t("loading")}
                </div>
                <div className="bg-primary/50 mb-2 rounded-md text-center p-3 sm:p-4 animate-pulse">
                  {t("loading")}
                </div>
                <div className="bg-primary/50 mb-2 rounded-md text-center p-3 sm:p-4 animate-pulse">
                  {t("loading")}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 pt-4 font-quicksand text-sm sm:text-base lg:text-lg">
                <div className="bg-primary/30 dark:bg-primary_dark/30 mb-2 rounded-md text-center p-3 sm:p-4 border-2 border-primary/50 dark:border-primary_dark/50 hover:bg-primary/40 dark:hover:bg-primary_dark/40 transition-colors">
                  <p className="font-robotoCondensed text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-1">
                    {t("totalRevenue")}
                  </p>
                  <p className="font-bold text-base sm:text-lg lg:text-xl text-primary dark:text-primary_dark">
                    {displayStats.total.toFixed(2)} EGP
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {displayStats.count?.total || 0} {t("invoices")}
                  </p>
                </div>
                <div className="bg-primary/30 dark:bg-primary_dark/30 mb-2 rounded-md text-center p-3 sm:p-4 border-2 border-primary/50 dark:border-primary_dark/50 hover:bg-primary/40 dark:hover:bg-primary_dark/40 transition-colors">
                  <p className="font-robotoCondensed text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-1">
                    {t("paid")}
                  </p>
                  <p className="font-bold text-base sm:text-lg lg:text-xl text-green-600 dark:text-green-500">
                    {displayStats.paid.toFixed(2)} EGP
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {displayStats.count?.paid || 0} {t("invoices")}
                  </p>
                </div>
                <div className="bg-primary/30 dark:bg-primary_dark/30 mb-2 rounded-md text-center p-3 sm:p-4 border-2 border-primary/50 dark:border-primary_dark/50 hover:bg-primary/40 dark:hover:bg-primary_dark/40 transition-colors">
                  <p className="font-robotoCondensed text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-1">
                    {t("pending")}
                  </p>
                  <p className="font-bold text-base sm:text-lg lg:text-xl text-yellow-600 dark:text-yellow-500">
                    {displayStats.pending.toFixed(2)} EGP
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {displayStats.count?.pending || 0} {t("invoices")}
                  </p>
                </div>
                <div className="bg-primary/30 dark:bg-primary_dark/30 mb-2 rounded-md text-center p-3 sm:p-4 border-2 border-primary/50 dark:border-primary_dark/50 hover:bg-primary/40 dark:hover:bg-primary_dark/40 transition-colors">
                  <p className="font-robotoCondensed text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-1">
                    {t("overdue")}
                  </p>
                  <p className="font-bold text-base sm:text-lg lg:text-xl text-red-600 dark:text-red-500">
                    {displayStats.overdue.toFixed(2)} EGP
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {displayStats.count?.overdue || 0} {t("invoices")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
        <div className="w-full sm:w-5/6 lg:w-4/6 mx-auto my-4 px-3 sm:px-0">
          <div
            className="bg-gradient-to-r from-accent via-accent to-accent/90 dark:from-accent_dark dark:via-accent_dark dark:to-accent_dark/90 w-full sm:w-auto rounded-xl p-4 text-center flex items-center justify-center sm:justify-start gap-3 cursor-pointer select-none border-2 border-primary/20 dark:border-primary_dark/20 hover:border-primary/40 dark:hover:border-primary_dark/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
            onClick={toggleLatest}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleLatest();
              }
            }}
            aria-expanded={openLatest}
            aria-controls="latest-invoices"
          >
            <div className="relative">
              <img
                src={arrowicon}
                alt={openLatest ? "Close Invoices" : "Open Invoices"}
                className={`w-10 sm:w-12 transition-all duration-500 group-hover:scale-110 ${
                  openLatest ? "rotate-90" : ""
                }`}
              />
              <div className="absolute inset-0 bg-primary/20 dark:bg-primary_dark/20 rounded-full blur-md scale-0 group-hover:scale-150 transition-transform duration-300"></div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <h2 className="font-robotoCondensed text-xl sm:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary_dark transition-colors duration-300">
                {t("latestInvoices")}
              </h2>
              {filteredAndSortedInvoices.length > 0 && (
                <span className="bg-primary dark:bg-primary_dark text-white px-3 py-1 rounded-full text-sm font-quicksand font-bold shadow-md group-hover:scale-110 transition-transform duration-300">
                  {filteredAndSortedInvoices.length}
                </span>
              )}
            </div>
            <svg
              className={`w-5 h-5 ml-auto text-primary dark:text-primary_dark transition-transform duration-300 ${
                openLatest ? "rotate-180" : ""
              }`}
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
          </div>
        </div>

        {openLatest && (
          <>
            {invoicesLoading ? (
              <div className="w-full sm:w-5/6 lg:w-3/4 mx-auto my-4 flex justify-center items-center py-10">
                <Loader />
              </div>
            ) : invoicesError ? (
              <div className="w-full sm:w-5/6 lg:w-3/4 my-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-700 rounded-lg p-4 mx-3 sm:mx-auto">
                <p className="text-sm font-quicksand text-red-700 dark:text-red-400">
                  {t("failedToLoadInvoices")}
                </p>
              </div>
            ) : filteredAndSortedInvoices.length === 0 ? (
              <div className="w-full sm:w-5/6 lg:w-3/4 my-4 bg-accent dark:bg-accent_dark rounded-lg p-6 sm:p-8 text-center border border-gray-200 dark:border-gray-700 mx-3 sm:mx-auto">
                <p className="font-quicksand text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? t("noInvoicesMatch")
                    : t("noInvoices")}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button
                    onClick={() => navigate("/dashboard/invoice/add")}
                    className="w-48 !bg-primary dark:!bg-primary_dark !text-white hover:!bg-accent dark:hover:!bg-accent_dark hover:!text-black dark:hover:!text-white !border-primary dark:!border-primary_dark hover:!border-accent dark:hover:!border-accent_dark before:!bg-accent dark:before:!bg-accent_dark"
                  >
                    {t("createFirstInvoice")}
                  </Button>
                )}
              </div>
            ) : (
              <Table
                invoices={filteredAndSortedInvoices}
                className="w-full px-3 sm:w-5/6 lg:w-3/4 mx-auto my-4"
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Invoices;
