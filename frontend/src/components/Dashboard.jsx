import React, { useState } from "react";
import logo from "../assets/fulllogo.png";
import plusIcon from "../assets/add-icon-b.png";
import invoiceIcon from "../assets/invoice-icon.png";
import productIcon from "../assets/product.png";
import customerIcon from "../assets/customer.png";
import moneyIcon from "../assets/money-receive-svgrepo-com.png";
import cartIcon from "../assets/cart-large-svgrepo-com.png";
import Button from "./ui/Button";
import { Link, useNavigate } from "react-router-dom";
import {
  useReportStats,
  useRevenueOverTime,
  useTopProducts,
  useTopCustomers,
} from "../features/report/useReportQuery";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTranslation } from "react-i18next";

function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Period state for revenue chart
  const [revenuePeriod, setRevenuePeriod] = useState("month");

  // Fetch report data
  const { data: statsData, isLoading: statsLoading } = useReportStats();
  const { data: revenueData, isLoading: revenueLoading } =
    useRevenueOverTime(revenuePeriod);
  const { data: topProductsData, isLoading: productsLoading } =
    useTopProducts();
  const { data: topCustomersData, isLoading: customersLoading } =
    useTopCustomers();

  const [invoiceData, setInvoiceData] = useState({
    customerName: "",
    orderDate: "",
    dueDate: "",
    phone: "",
    address: "",
    paymentMethod: "cash",
  });

  const [productData, setProductData] = useState({
    productName: "",
    price: "",
    category: "",
    stock: "",
  });

  const [customerData, setCustomerData] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleInvoiceChange = (field, value) => {
    setInvoiceData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProductChange = (field, value) => {
    setProductData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCustomerChange = (field, value) => {
    setCustomerData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateInvoice = () => {
    navigate("/dashboard/invoice/add", {
      state: {
        quickActionData: invoiceData,
      },
    });
  };

  const handleCreateProduct = () => {
    navigate("/dashboard/product/product/add", {
      state: {
        quickActionData: productData,
      },
    });
  };

  const handleCreateCustomer = () => {
    navigate("/dashboard/customer/customer/add", {
      state: {
        quickActionData: customerData,
      },
    });
  };
  console.log(topProductsData);

  return (
    <>
      <div className="min-h-screen bg-background dark:bg-background_dark font-quicksand">
        {/* Header */}
        <header className="bg-secondary dark:bg-secondary_dark p-2 sm:p-3 lg:p-1 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0">
            <img src={logo} alt="PayFlow Logo" className="w-2/3 sm:w-1/2 md:w-1/3 lg:w-1/4" />
            <h1 className="text-xl sm:text-2xl font-bold self-end text-primary dark:text-primary_dark font-robotoCondensed">
              {t("dashboard.title")}
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Statistics Card */}
            <div className="bg-gradient-to-br from-secondary to-accent dark:from-secondary_dark dark:to-accent_dark p-4 sm:p-5 lg:p-6 rounded-2xl shadow-lg relative border-2 border-secondary dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary_dark/30 transition-all duration-300">
              <h2 className="text-xl sm:text-2xl font-bold font-quicksand mb-3 sm:mb-4 text-primary dark:text-primary_dark">
                {t("dashboard.statistics.title")}
              </h2>
              {statsLoading ? (
                <div className="flex items-center justify-center h-36 sm:h-44">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary dark:border-primary_dark"></div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                  {/* Total Revenue */}
                  <div className="flex-1 p-4 sm:p-5 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary_dark/10 dark:to-primary_dark/5 rounded-xl h-auto sm:h-44 sm:hover:h-96 transition-all duration-1000 ease-in-out overflow-visible sm:overflow-hidden border-2 border-primary/20 dark:border-primary_dark/20 hover:border-primary/40 dark:hover:border-primary_dark/40 hover:shadow-xl group/revenue">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <h3 className="font-bold font-quicksand text-base sm:text-lg text-black dark:text-white">
                        {t("dashboard.statistics.totalRevenue")}
                      </h3>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 dark:bg-primary_dark/20 rounded-full flex items-center justify-center group-hover/revenue:scale-110 transition-transform duration-300">
                        <img
                          src={moneyIcon}
                          alt={t("dashboard.statistics.totalRevenue")}
                          className="w-5 h-5 sm:w-6 sm:h-6"
                        />
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold font-quicksand text-primary dark:text-primary_dark mb-1 sm:mb-2">
                      {statsData?.data?.stats?.totalRevenue?.toFixed(2) || "0"}{" "}
                      EG
                    </p>
                    <p className="text-xs sm:text-sm pt-1 font-quicksand text-gray-700 dark:text-gray-300">
                      {t("dashboard.statistics.totalInvoices")}:{" "}
                      <span className="font-bold text-primary dark:text-primary_dark">
                        {statsData?.data?.stats?.totalInvoices || 0}
                      </span>
                    </p>

                    {/* Additional info on hover */}
                    <div className="mt-3 sm:mt-4 opacity-100 sm:opacity-0 sm:group-hover/revenue:opacity-100 transition-opacity duration-500">
                      <div className="border-t-2 border-primary/20 dark:border-primary_dark/20 pt-3 sm:pt-4 space-y-2 sm:space-y-3">
                        <div className="bg-background/60 dark:bg-background_dark/60 p-2 sm:p-3 rounded-lg backdrop-blur-sm">
                          <div className="flex items-center gap-2 mb-1 sm:mb-2">
                            <img
                              src={productIcon}
                              alt={t("dashboard.statistics.topProduct")}
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                            <p className="text-xs sm:text-sm font-semibold font-quicksand text-primary dark:text-primary_dark">
                              {t("dashboard.statistics.topProduct")}
                            </p>
                          </div>
                          <p className="text-sm sm:text-base font-bold font-quicksand text-primary dark:text-primary_dark">
                            {statsData?.data?.topProduct?.product?.title ||
                              "N/A"}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:justify-between mt-2 gap-1 sm:gap-0 text-xs text-gray-600 dark:text-gray-400 font-quicksand">
                            <span>
                              {t("dashboard.statistics.revenue")}{" "}
                              <strong className="text-primary dark:text-primary_dark">
                                {(() => {
                                  const topProduct = statsData?.data?.topProduct;
                                  const revenue = topProduct?.totalRevenue > 0
                                    ? topProduct.totalRevenue
                                    : (topProduct?.totalSold * (topProduct?.product?.priceAfterDiscount || topProduct?.product?.price || 0));
                                  return revenue?.toFixed(2) || "0";
                                })()}{" "}
                                EG
                              </strong>
                            </span>
                            <span>
                              {t("dashboard.statistics.sold")}{" "}
                              <strong className="text-primary dark:text-primary_dark">
                                {statsData?.data?.topProduct?.totalSold || "0"}{" "}
                                {t("dashboard.statistics.units")}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3 sm:space-y-4 w-full sm:w-2/5">
                    {/* Invoices */}
                    <div className="flex flex-col w-full p-3 sm:p-4 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary_dark/10 dark:to-primary_dark/5 rounded-xl h-auto sm:h-32 sm:hover:h-80 overflow-visible sm:overflow-hidden transition-all duration-1000 ease-in-out border-2 border-primary/20 dark:border-primary_dark/20 hover:border-primary/40 dark:hover:border-primary_dark/40 hover:shadow-xl group/invoices">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <h3 className="font-bold text-sm sm:text-base font-quicksand text-black dark:text-white">
                          {t("dashboard.statistics.invoices")}
                        </h3>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/20 dark:bg-primary_dark/20 rounded-full flex items-center justify-center group-hover/invoices:scale-110 transition-transform duration-300">
                          <img
                            src={invoiceIcon}
                            alt={t("dashboard.statistics.invoices")}
                            className="w-4 h-4 sm:w-5 sm:h-5"
                          />
                        </div>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold font-quicksand text-primary dark:text-primary_dark">
                        {statsData?.data?.stats?.totalInvoices || 0}
                      </p>
                      <p className="text-xs font-quicksand text-gray-600 dark:text-gray-400">
                        {t("dashboard.statistics.totalProcessed")}
                      </p>

                      {/* Top Customer info on hover */}
                      <div className="mt-2 w-full opacity-100 sm:opacity-0 sm:group-hover/invoices:opacity-100 transition-opacity duration-500">
                        <div className="border-t-2 border-primary/20 dark:border-primary_dark/20 pt-2 sm:pt-3">
                          <div className="bg-background/60 dark:bg-background_dark/60 p-2 sm:p-3 rounded-lg backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-1 sm:mb-2">
                              <img
                                src={customerIcon}
                                alt={t("dashboard.statistics.topCustomer")}
                                className="w-4 h-4 sm:w-5 sm:h-5"
                              />
                              <p className="text-xs sm:text-sm font-semibold font-quicksand text-primary dark:text-primary_dark">
                                {t("dashboard.statistics.topCustomer")}
                              </p>
                            </div>
                            <p className="text-xs sm:text-sm font-bold font-quicksand text-primary dark:text-primary_dark mb-1">
                              {statsData?.data?.topCustomer?.customer?.name ||
                                "N/A"}
                            </p>
                            <div className="text-xs text-gray-600 dark:text-gray-400 font-quicksand space-y-1">
                              <p>
                                {statsData?.data?.topCustomer?.totalInvoices ||
                                  0}{" "}
                                {t("dashboard.statistics.invoicesCount")}
                              </p>
                              <p>
                                {t("dashboard.statistics.spent")}{" "}
                                <strong className="text-primary dark:text-primary_dark">
                                  {statsData?.data?.topCustomer?.totalSpent?.toFixed(
                                    2
                                  ) || "0"}{" "}
                                  EG
                                </strong>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Products */}
                    <div className="flex flex-col w-full p-3 sm:p-4 bg-gradient-to-br from-accent to-secondary dark:from-accent_dark dark:to-secondary_dark rounded-xl h-auto sm:h-32 sm:hover:h-72 overflow-visible sm:overflow-hidden transition-all duration-1000 ease-in-out border-2 border-secondary dark:border-gray-700 hover:border-primary/40 dark:hover:border-primary_dark/40 hover:shadow-xl group/products">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <h3 className="font-semibold text-sm sm:text-base font-quicksand text-black dark:text-white">
                          {t("dashboard.statistics.products")}
                        </h3>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/20 dark:bg-primary_dark/20 rounded-full flex items-center justify-center group-hover/products:scale-110 transition-transform duration-300">
                          <img
                            src={cartIcon}
                            alt={t("dashboard.statistics.products")}
                            className="w-4 h-4 sm:w-5 sm:h-5"
                          />
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm font-quicksand text-gray-700 dark:text-gray-300 mb-1">
                        {t("dashboard.statistics.topSelling")}
                      </p>
                      <p className="text-sm sm:text-base font-bold font-quicksand text-primary dark:text-primary_dark">
                        {statsData?.data?.topProduct?.product?.title || "N/A"}
                      </p>
                      <p className="text-xs font-quicksand text-gray-600 dark:text-gray-400 mt-1">
                        {t("dashboard.statistics.unitsSold")}{" "}
                        <span className="font-bold text-primary dark:text-primary_dark">
                          {statsData?.data?.topProduct?.totalSold || 0}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-3 text-center hidden sm:block">
                <p className="text-xs font-quicksand text-gray-600 dark:text-gray-400">
                  {t("dashboard.statistics.hoverToExpand")}
                </p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-accent to-secondary dark:from-accent_dark dark:to-secondary_dark p-4 sm:p-5 lg:p-6 rounded-2xl shadow-lg relative border-2 border-secondary dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary_dark/30 transition-all duration-300">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 font-quicksand text-primary dark:text-primary_dark">
                {t("dashboard.quickActions.title")}
              </h2>
              <div className="space-y-4 sm:space-y-5">
                {/* New Invoice Section */}
                <div className="bg-gradient-to-r from-secondary to-accent dark:from-secondary_dark dark:to-accent_dark px-3 sm:px-4 py-2 sm:py-3 rounded-xl overflow-visible sm:overflow-hidden h-auto sm:h-16 sm:hover:h-96 transition-all duration-500 ease-in-out group border-2 border-secondary dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary_dark/30 hover:shadow-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 h-auto sm:h-10">
                    <div className="flex items-center gap-2 w-full sm:w-1/3">
                      <img
                        src={invoiceIcon}
                        alt={t("dashboard.quickActions.newInvoice")}
                        className="w-4 h-4 sm:w-5 sm:h-5"
                      />
                      <label className="font-semibold text-sm sm:text-base font-quicksand text-black dark:text-white">
                        {t("dashboard.quickActions.newInvoice")}
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder={t("dashboard.quickActions.customerName")}
                      value={invoiceData.customerName}
                      onChange={(e) =>
                        handleInvoiceChange("customerName", e.target.value)
                      }
                      className="hidden sm:block flex-grow p-2 rounded-lg border-2 border-secondary dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-background dark:bg-background_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-quicksand text-sm"
                    />
                    <Button
                      onClick={handleCreateInvoice}
                      className="hidden sm:block bg-primary dark:bg-primary_dark hover:bg-primary/80 dark:hover:bg-primary_dark/80 text-white rounded-lg before:bg-accent dark:before:bg-accent_dark w-auto px-3 border-primary dark:border-primary_dark transition-all duration-300"
                    >
                      <div className="w-8 sm:w-10 h-full flex items-center justify-center">
                        <img
                          src={plusIcon}
                          alt="Plus Icon"
                          className="h-3 w-3"
                        />
                      </div>
                    </Button>
                  </div>

                  <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="w-full sm:w-1/3 font-semibold font-quicksand text-xs sm:text-sm text-black dark:text-white">
                        {t("dashboard.quickActions.customerName")}
                      </label>
                      <input
                        type="text"
                        placeholder={t("dashboard.quickActions.customerName")}
                        value={invoiceData.customerName}
                        onChange={(e) =>
                          handleInvoiceChange("customerName", e.target.value)
                        }
                        className="sm:hidden flex-grow p-2 rounded-lg border-2 border-secondary dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-background dark:bg-background_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-quicksand text-sm"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="w-full sm:w-1/3 font-semibold font-quicksand text-xs sm:text-sm text-black dark:text-white">
                        {t("dashboard.quickActions.orderDate")}
                      </label>
                      <input
                        type="date"
                        value={invoiceData.orderDate}
                        onChange={(e) =>
                          handleInvoiceChange("orderDate", e.target.value)
                        }
                        className="flex-grow p-2 rounded-lg border-2 border-secondary dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-background dark:bg-background_dark text-gray-900 dark:text-white font-quicksand text-sm"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="w-full sm:w-1/3 font-semibold font-quicksand text-xs sm:text-sm text-black dark:text-white">
                        {t("dashboard.quickActions.dueDate")}
                      </label>
                      <input
                        type="date"
                        value={invoiceData.dueDate}
                        onChange={(e) =>
                          handleInvoiceChange("dueDate", e.target.value)
                        }
                        className="flex-grow p-2 rounded-lg border-2 border-secondary dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-background dark:bg-background_dark text-gray-900 dark:text-white font-quicksand text-sm"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="w-full sm:w-1/3 font-semibold font-quicksand text-xs sm:text-sm text-black dark:text-white">
                        {t("dashboard.quickActions.phone")}
                      </label>
                      <input
                        type="tel"
                        placeholder={t("dashboard.quickActions.customerPhone")}
                        value={invoiceData.phone}
                        onChange={(e) =>
                          handleInvoiceChange("phone", e.target.value)
                        }
                        className="flex-grow p-2 rounded-lg border-2 border-secondary dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-background dark:bg-background_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-quicksand text-sm"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="w-full sm:w-1/3 font-semibold font-quicksand text-xs sm:text-sm text-black dark:text-white">
                        {t("dashboard.quickActions.address")}
                      </label>
                      <input
                        type="text"
                        placeholder={t(
                          "dashboard.quickActions.customerAddress"
                        )}
                        value={invoiceData.address}
                        onChange={(e) =>
                          handleInvoiceChange("address", e.target.value)
                        }
                        className="flex-grow p-2 rounded-lg border-2 border-secondary dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-background dark:bg-background_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-quicksand text-sm"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="w-full sm:w-1/3 font-semibold font-quicksand text-xs sm:text-sm text-black dark:text-white">
                        {t("dashboard.quickActions.paymentMethod")}
                      </label>
                      <select
                        value={invoiceData.paymentMethod}
                        onChange={(e) =>
                          handleInvoiceChange("paymentMethod", e.target.value)
                        }
                        className="flex-grow p-2 rounded-lg border-2 border-secondary dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-background dark:bg-background_dark text-gray-900 dark:text-white font-quicksand text-sm cursor-pointer"
                      >
                        <option value="cash">
                          {t("dashboard.quickActions.paymentMethods.cash")}
                        </option>
                        <option value="credit-card">
                          {t(
                            "dashboard.quickActions.paymentMethods.creditCard"
                          )}
                        </option>
                        <option value="debit-card">
                          {t("dashboard.quickActions.paymentMethods.debitCard")}
                        </option>
                        <option value="bank-transfer">
                          {t(
                            "dashboard.quickActions.paymentMethods.bankTransfer"
                          )}
                        </option>
                        <option value="other">
                          {t("dashboard.quickActions.paymentMethods.other")}
                        </option>
                      </select>
                    </div>
                    <Button
                      onClick={handleCreateInvoice}
                      className="sm:hidden w-full mx-auto bg-primary dark:bg-primary_dark hover:bg-primary/80 dark:hover:bg-primary_dark/80 text-white rounded-lg before:bg-accent dark:before:bg-accent_dark border-primary dark:border-primary_dark transition-all duration-300"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <img
                          src={plusIcon}
                          alt="Plus Icon"
                          className="h-3 w-3"
                        />
                        <span className="text-sm">{t("dashboard.quickActions.newInvoice")}</span>
                      </div>
                    </Button>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center font-quicksand bg-primary/5 dark:bg-primary_dark/5 p-2 rounded-lg">
                      {t("dashboard.quickActions.fillDetailsInvoice")}
                    </p>
                  </div>
                </div>

                {/* Add Product Section */}
                <div className="bg-gradient-to-r from-secondary to-accent dark:from-secondary_dark dark:to-accent_dark px-3 sm:px-4 py-2 sm:py-3 rounded-xl overflow-visible sm:overflow-hidden h-auto sm:h-16 sm:hover:h-72 transition-all duration-500 ease-in-out group border-2 border-secondary dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary_dark/30 hover:shadow-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 h-auto sm:h-10">
                    <div className="flex items-center gap-2 w-full sm:w-1/3">
                      <img
                        src={productIcon}
                        alt={t("dashboard.quickActions.addProduct")}
                        className="w-4 h-4 sm:w-5 sm:h-5"
                      />
                      <label className="font-semibold text-sm sm:text-base font-quicksand text-black dark:text-white">
                        {t("dashboard.quickActions.addProduct")}
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder={t("dashboard.quickActions.productName")}
                      value={productData.productName}
                      onChange={(e) =>
                        handleProductChange("productName", e.target.value)
                      }
                      className="hidden sm:block flex-grow p-2 rounded-lg border-2 border-secondary dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-background dark:bg-background_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-quicksand text-sm"
                    />
                    <Button
                      onClick={handleCreateProduct}
                      className="hidden sm:block bg-primary dark:bg-primary_dark hover:bg-primary/80 dark:hover:bg-primary_dark/80 text-white rounded-lg before:bg-accent dark:before:bg-accent_dark w-auto px-3 border-primary dark:border-primary_dark transition-all duration-300"
                    >
                      <div className="w-8 sm:w-10 h-full flex items-center justify-center">
                        <img
                          src={plusIcon}
                          alt="Plus Icon"
                          className="h-3 w-3"
                        />
                      </div>
                    </Button>
                  </div>

                  <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="w-full sm:w-1/3 font-semibold font-quicksand text-xs sm:text-sm text-black dark:text-white">
                        {t("dashboard.quickActions.productName")}
                      </label>
                      <input
                        type="text"
                        placeholder={t("dashboard.quickActions.productName")}
                        value={productData.productName}
                        onChange={(e) =>
                          handleProductChange("productName", e.target.value)
                        }
                        className="sm:hidden flex-grow p-2 rounded-lg border-2 border-secondary dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-background dark:bg-background_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-quicksand text-sm"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="w-full sm:w-1/3 font-semibold font-quicksand text-xs sm:text-sm text-black dark:text-white">
                        {t("dashboard.quickActions.price")}
                      </label>
                      <input
                        type="number"
                        placeholder={t("dashboard.quickActions.productPrice")}
                        value={productData.price}
                        onChange={(e) =>
                          handleProductChange("price", e.target.value)
                        }
                        className="flex-grow p-2 rounded-lg border-2 border-secondary dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-background dark:bg-background_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-quicksand text-sm"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="w-full sm:w-1/3 font-semibold font-quicksand text-xs sm:text-sm text-black dark:text-white">
                        {t("dashboard.quickActions.category")}
                      </label>
                      <select
                        value={productData.category}
                        onChange={(e) =>
                          handleProductChange("category", e.target.value)
                        }
                        className="flex-grow p-2 rounded-lg border-2 border-secondary dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-background dark:bg-background_dark text-gray-900 dark:text-white font-quicksand text-sm cursor-pointer"
                      >
                        <option value="">
                          {t("dashboard.quickActions.chooseCategory")}
                        </option>
                        <option value="Electronics">
                          {t("dashboard.quickActions.categories.electronics")}
                        </option>
                        <option value="Clothing">
                          {t("dashboard.quickActions.categories.clothing")}
                        </option>
                        <option value="Home">
                          {t("dashboard.quickActions.categories.home")}
                        </option>
                      </select>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="w-full sm:w-1/3 font-semibold font-quicksand text-xs sm:text-sm text-black dark:text-white">
                        {t("dashboard.quickActions.stockQuantity")}
                      </label>
                      <input
                        type="number"
                        placeholder={t("dashboard.quickActions.stockQuantity")}
                        value={productData.stock}
                        onChange={(e) =>
                          handleProductChange("stock", e.target.value)
                        }
                        className="flex-grow p-2 rounded-lg border-2 border-secondary dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-background dark:bg-background_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-quicksand text-sm"
                      />
                    </div>
                    <Button
                      onClick={handleCreateProduct}
                      className="sm:hidden w-full mx-auto bg-primary dark:bg-primary_dark hover:bg-primary/80 dark:hover:bg-primary_dark/80 text-white rounded-lg before:bg-accent dark:before:bg-accent_dark border-primary dark:border-primary_dark transition-all duration-300"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <img
                          src={plusIcon}
                          alt="Plus Icon"
                          className="h-3 w-3"
                        />
                        <span className="text-sm">{t("dashboard.quickActions.addProduct")}</span>
                      </div>
                    </Button>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center font-quicksand bg-primary/5 dark:bg-primary_dark/5 p-2 rounded-lg">
                      {t("dashboard.quickActions.fillDetailsProduct")}
                    </p>
                  </div>
                </div>

                {/* Add Customer Section */}
                <div className="bg-gradient-to-r from-secondary to-accent dark:from-secondary_dark dark:to-accent_dark px-3 sm:px-4 py-2 sm:py-3 rounded-xl overflow-visible sm:overflow-hidden h-auto sm:h-16 sm:hover:h-72 transition-all duration-500 ease-in-out group border-2 border-secondary dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary_dark/30 hover:shadow-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 h-auto sm:h-10">
                    <div className="flex items-center gap-2 w-full sm:w-1/3">
                      <img
                        src={customerIcon}
                        alt={t("dashboard.quickActions.addCustomer")}
                        className="w-4 h-4 sm:w-5 sm:h-5"
                      />
                      <label className="font-semibold text-sm sm:text-base font-quicksand text-black dark:text-white">
                        {t("dashboard.quickActions.addCustomer")}
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder={t("dashboard.quickActions.customerName")}
                      value={customerData.customerName}
                      onChange={(e) =>
                        handleCustomerChange("customerName", e.target.value)
                      }
                      className="hidden sm:block flex-grow p-2 rounded-lg border-2 border-secondary dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-background dark:bg-background_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-quicksand text-sm"
                    />
                    <Button
                      onClick={handleCreateCustomer}
                      className="hidden sm:block bg-primary dark:bg-primary_dark hover:bg-primary/80 dark:hover:bg-primary_dark/80 text-white rounded-lg before:bg-accent dark:before:bg-accent_dark w-auto px-3 border-primary dark:border-primary_dark transition-all duration-300"
                    >
                      <div className="w-8 sm:w-10 h-full flex items-center justify-center">
                        <img
                          src={plusIcon}
                          alt="Plus Icon"
                          className="h-3 w-3"
                        />
                      </div>
                    </Button>
                  </div>

                  {/* Additional fields that appear on hover */}
                  <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="w-full sm:w-1/3 font-semibold font-quicksand text-xs sm:text-sm text-black dark:text-white">
                        {t("dashboard.quickActions.customerName")}
                      </label>
                      <input
                        type="text"
                        placeholder={t("dashboard.quickActions.customerName")}
                        value={customerData.customerName}
                        onChange={(e) =>
                          handleCustomerChange("customerName", e.target.value)
                        }
                        className="sm:hidden flex-grow p-2 rounded-lg border-2 border-secondary dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-background dark:bg-background_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-quicksand text-sm"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="w-full sm:w-1/3 font-semibold font-quicksand text-xs sm:text-sm text-black dark:text-white">
                        {t("dashboard.quickActions.email")}
                      </label>
                      <input
                        type="email"
                        placeholder={t("dashboard.quickActions.customerEmail")}
                        value={customerData.email}
                        onChange={(e) =>
                          handleCustomerChange("email", e.target.value)
                        }
                        className="flex-grow p-2 rounded-lg border-2 border-secondary dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-background dark:bg-background_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-quicksand text-sm"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="w-full sm:w-1/3 font-semibold font-quicksand text-xs sm:text-sm text-black dark:text-white">
                        {t("dashboard.quickActions.phone")}
                      </label>
                      <input
                        type="tel"
                        placeholder={t("dashboard.quickActions.customerPhone")}
                        value={customerData.phone}
                        onChange={(e) =>
                          handleCustomerChange("phone", e.target.value)
                        }
                        className="flex-grow p-2 rounded-lg border-2 border-secondary dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-background dark:bg-background_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-quicksand text-sm"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="w-full sm:w-1/3 font-semibold font-quicksand text-xs sm:text-sm text-black dark:text-white">
                        {t("dashboard.quickActions.address")}
                      </label>
                      <input
                        type="text"
                        placeholder={t(
                          "dashboard.quickActions.customerAddress"
                        )}
                        value={customerData.address}
                        onChange={(e) =>
                          handleCustomerChange("address", e.target.value)
                        }
                        className="flex-grow p-2 rounded-lg border-2 border-secondary dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-background dark:bg-background_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-quicksand text-sm"
                      />
                    </div>
                    <Button
                      onClick={handleCreateCustomer}
                      className="sm:hidden w-full mx-auto bg-primary dark:bg-primary_dark hover:bg-primary/80 dark:hover:bg-primary_dark/80 text-white rounded-lg before:bg-accent dark:before:bg-accent_dark border-primary dark:border-primary_dark transition-all duration-300"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <img
                          src={plusIcon}
                          alt="Plus Icon"
                          className="h-3 w-3"
                        />
                        <span className="text-sm">{t("dashboard.quickActions.addCustomer")}</span>
                      </div>
                    </Button>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center font-quicksand bg-primary/5 dark:bg-primary_dark/5 p-2 rounded-lg">
                      {t("dashboard.quickActions.fillDetailsCustomer")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-2 sm:mt-3 text-center hidden sm:block">
                <p className="text-xs font-quicksand text-gray-600 dark:text-gray-400">
                  {t("dashboard.quickActions.hoverToExpand")}
                </p>
              </div>
            </div>

            {/* Activity Chart Card */}
            <div className="bg-gradient-to-br from-accent to-secondary dark:from-accent_dark dark:to-secondary_dark p-4 sm:p-5 lg:p-6 rounded-2xl shadow-lg relative overflow-visible sm:overflow-hidden group h-auto sm:h-[450px] sm:hover:h-[600px] transition-all duration-1000 ease-in-out border-2 border-secondary dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold font-quicksand text-primary dark:text-primary_dark">
                  {t("dashboard.revenueChart.title")}
                </h2>
                {/* Period Selector */}
                <div className="flex gap-1 bg-background dark:bg-background_dark rounded-lg p-1 shadow-inner w-full sm:w-auto">
                  {/* Dynamic translation mapping for button labels */}
                  {["day", "week", "month", "year"].map((period) => (
                    <button
                      key={period}
                      onClick={() => setRevenuePeriod(period)}
                      className={`px-2 sm:px-3 py-1 text-xs font-bold font-quicksand rounded transition-all duration-300 flex-1 sm:flex-initial ${
                        revenuePeriod === period
                          ? "bg-primary dark:bg-primary_dark text-white shadow-md scale-105"
                          : "text-primary dark:text-primary_dark hover:bg-secondary dark:hover:bg-secondary_dark hover:scale-105"
                      }`}
                    >
                      {t(`dashboard.revenueChart.${period}`)}
                    </button>
                  ))}
                </div>
              </div>

              {revenueLoading ? (
                <div className="flex items-center justify-center h-48 sm:h-64">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary dark:border-primary_dark"></div>
                </div>
              ) : revenueData?.data && revenueData.data.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart
                      data={revenueData.data}
                      margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E1D7C6"
                        opacity={0.6}
                      />
                      <XAxis
                        dataKey={(entry) => {
                          if (entry._id.day)
                            return `${entry._id.month}/${entry._id.day}`;
                          if (entry._id.week) return entry._id.week;
                          if (entry._id.month) return entry._id.month;
                          return entry._id.year;
                        }}
                        stroke="#579BB1"
                        tick={{
                          fill: "#579BB1",
                          fontSize: 11,
                          fontFamily: "Quicksand",
                          fontWeight: 600,
                        }}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#579BB1"
                        tick={{
                          fill: "#579BB1",
                          fontSize: 11,
                          fontFamily: "Quicksand",
                        }}
                        width={70}
                        label={{
                          value: t("dashboard.revenueChart.revenueLabel"),
                          angle: -90,
                          position: "insideLeft",
                          style: {
                            fontSize: 12,
                            fill: "#579BB1",
                            fontFamily: "Quicksand",
                            fontWeight: 600,
                          },
                        }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#579BB1"
                        tick={{
                          fill: "#579BB1",
                          fontSize: 11,
                          fontFamily: "Quicksand",
                        }}
                        width={50}
                        label={{
                          value: t("dashboard.revenueChart.invoicesLabel"),
                          angle: 90,
                          position: "insideRight",
                          style: {
                            fontSize: 12,
                            fill: "#579BB1",
                            fontFamily: "Quicksand",
                            fontWeight: 600,
                          },
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#F8F4EA",
                          border: "3px solid #579BB1",
                          borderRadius: "12px",
                          fontFamily: "Quicksand",
                          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
                          padding: "12px 16px",
                        }}
                        formatter={(value, name) => {
                          if (name === "Revenue")
                            return [
                              `${value.toFixed(2)} EG`,
                              t("dashboard.statistics.revenue"),
                            ];
                          if (name === "Invoice Count")
                            return [
                              `${value} ${t(
                                "dashboard.statistics.invoicesCount"
                              )}`,
                              t("dashboard.statistics.invoices"),
                            ];
                          return [value, name];
                        }}
                        labelFormatter={(label) => {
                          const period = revenuePeriod;

                          if (period === "day")
                            return `${t(
                              "dashboard.revenueChart.date"
                            )}: ${label}`;
                          if (period === "week")
                            return `${t(
                              "dashboard.revenueChart.weekLabel"
                            )} ${label}`;
                          if (period === "month")
                            return `${t(
                              "dashboard.revenueChart.month"
                            )} ${label}`;
                          if (period === "year")
                            return `${t(
                              "dashboard.revenueChart.year"
                            )} ${label}`;
                          return label;
                        }}
                        labelStyle={{
                          fontWeight: "bold",
                          color: "#579BB1",
                          marginBottom: "8px",
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          fontFamily: "Quicksand",
                          fontWeight: 600,
                          paddingTop: "10px",
                        }}
                        iconType="line"
                        iconSize={18}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="totalRevenue"
                        stroke="#579BB1"
                        strokeWidth={3}
                        dot={{
                          fill: "#579BB1",
                          r: 5,
                          strokeWidth: 2,
                          stroke: "#fff",
                        }}
                        activeDot={{
                          r: 8,
                          fill: "#579BB1",
                          stroke: "#fff",
                          strokeWidth: 2,
                        }}
                        name={t("dashboard.statistics.revenue")}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="count"
                        stroke="gray"
                        strokeWidth={2.5}
                        dot={{
                          fill: "gray",
                          r: 4,
                          strokeWidth: 2,
                          stroke: "#fff",
                        }}
                        activeDot={{
                          r: 7,
                          fill: "gray",
                          stroke: "#fff",
                          strokeWidth: 2,
                        }}
                        name={t("dashboard.statistics.totalInvoices")}
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  {/* Summary Stats - Appears on Hover */}
                  <div className="mt-3 sm:mt-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                      <div className="bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary_dark/20 dark:to-primary_dark/5 p-3 sm:p-4 rounded-xl text-center border-2 border-primary/30 dark:border-primary_dark/30 hover:border-primary/50 dark:hover:border-primary_dark/50 hover:shadow-lg transition-all duration-300 group/stat">
                        <img
                          src={moneyIcon}
                          alt={t("dashboard.revenueChart.totalRevenue")}
                          className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 group-hover/stat:scale-110 transition-transform duration-300"
                        />
                        <p className="text-xs text-primary dark:text-primary_dark font-bold font-quicksand mb-1">
                          {t("dashboard.revenueChart.totalRevenue")}
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-primary dark:text-primary_dark font-quicksand">
                          {revenueData.data
                            .reduce((sum, item) => sum + item.totalRevenue, 0)
                            .toFixed(2)}{" "}
                          EG
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-secondary/20 to-accent/20 dark:from-secondary_dark/20 dark:to-accent_dark/20 p-3 sm:p-4 rounded-xl text-center border-2 border-secondary dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary_dark/50 hover:shadow-lg transition-all duration-300 group/stat">
                        <img
                          src={invoiceIcon}
                          alt={t("dashboard.revenueChart.totalInvoices")}
                          className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 group-hover/stat:scale-110 transition-transform duration-300"
                        />
                        <p className="text-xs text-primary dark:text-primary_dark font-bold font-quicksand mb-1">
                          {t("dashboard.revenueChart.totalInvoices")}
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-primary dark:text-primary_dark font-quicksand">
                          {revenueData.data.reduce(
                            (sum, item) => sum + item.count,
                            0
                          )}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-accent to-secondary dark:from-accent_dark dark:to-secondary_dark p-3 sm:p-4 rounded-xl text-center border-2 border-secondary dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary_dark/50 hover:shadow-lg transition-all duration-300 group/stat">
                        <img
                          src={cartIcon}
                          alt={t("dashboard.revenueChart.avgPerInvoice")}
                          className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 group-hover/stat:scale-110 transition-transform duration-300"
                        />
                        <p className="text-xs text-primary dark:text-primary_dark font-bold font-quicksand mb-1">
                          {t("dashboard.revenueChart.avgPerInvoice")}
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-primary dark:text-primary_dark font-quicksand">
                          {(
                            revenueData.data.reduce(
                              (sum, item) => sum + item.totalRevenue,
                              0
                            ) /
                            revenueData.data.reduce(
                              (sum, item) => sum + item.count,
                              0
                            )
                          ).toFixed(2)}{" "}
                          EG
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-48 sm:h-64">
                  <p className="text-gray-500 dark:text-gray-400 font-quicksand text-sm sm:text-base">
                    {t("dashboard.revenueChart.noData")}
                  </p>
                </div>
              )}

              <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 hidden sm:flex items-center justify-center">
                <div className="bg-primary/20 dark:bg-primary_dark/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-2 group-hover:bg-primary/30 dark:group-hover:bg-primary_dark/30 transition-all duration-300">
                  <span className="text-xs font-normal font-quicksand text-black dark:text-white">
                    {t("dashboard.revenueChart.hoverToExpand")}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Reports Card - Top Products */}
            <div className="bg-gradient-to-br from-secondary to-accent dark:from-secondary_dark dark:to-accent_dark p-4 sm:p-5 lg:p-6 rounded-2xl shadow-lg relative h-auto sm:h-[450px] sm:hover:h-[750px] transition-all duration-1000 ease-in-out overflow-visible sm:overflow-hidden group">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold font-quicksand text-primary dark:text-primary_dark">
                  {t("dashboard.topProducts.title")}
                </h2>
                <div className="bg-primary/10 dark:bg-primary_dark/10 px-2 sm:px-3 py-1 rounded-full">
                  <span className="text-xs font-bold font-quicksand text-primary dark:text-primary_dark">
                    {t("dashboard.topProducts.bestSellers")}
                  </span>
                </div>
              </div>

              {productsLoading ? (
                <div className="flex items-center justify-center h-48 sm:h-64">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary dark:border-primary_dark"></div>
                </div>
              ) : topProductsData?.data && topProductsData.data.length > 0 ? (
                <>
                  {/* Pie Chart and Product Cards Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[280px]">
                    {/* Pie Chart with Stats */}
                    <div className="flex flex-col items-center justify-center bg-white/50 dark:bg-black/20 rounded-xl p-4 backdrop-blur-sm">
                      {(() => {
                        // Calculate actual revenue for each product
                        const productsWithRevenue = topProductsData.data.map(p => ({
                          ...p,
                          actualRevenue: p.totalRevenue > 0 
                            ? p.totalRevenue 
                            : (p.totalSold * (p.product?.priceAfterDiscount || p.product?.price || 0))
                        }));
                        
                        const totalRevenueSum = productsWithRevenue.reduce(
                          (sum, p) => sum + p.actualRevenue,
                          0
                        );
                        
                        if (totalRevenueSum > 0) {
                          return (
                            <ResponsiveContainer width="100%" height={200}>
                              <PieChart>
                                <Pie
                                  data={productsWithRevenue}
                                  dataKey="actualRevenue"
                                  nameKey="product.name"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={65}
                                  paddingAngle={3}
                                  label={(entry) =>
                                    `${(entry.percent * 100).toFixed(0)}%`
                                  }
                                  labelLine={{
                                    stroke: "#579BB1",
                                    strokeWidth: 2,
                                  }}
                                >
                                  {productsWithRevenue.map((entry, index) => {
                                    const colors = [
                                      "#579BB1",
                                      "#2E535E",
                                      "#E1D7C6",
                                      "#ECE8DD",
                                      "#579BB1",
                                    ];
                                    return (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={colors[index % colors.length]}
                                        stroke="#fff"
                                        strokeWidth={2}
                                      />
                                    );
                                  })}
                                </Pie>
                                <Tooltip
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      return (
                                        <div
                                          style={{
                                            backgroundColor: "#F8F4EA",
                                            border: "3px solid #579BB1",
                                            borderRadius: "12px",
                                            padding: "12px 16px",
                                            fontFamily: "Quicksand",
                                            boxShadow:
                                              "0 8px 16px rgba(0, 0, 0, 0.15)",
                                          }}
                                        >
                                          <p
                                            style={{
                                              fontWeight: "bold",
                                              marginBottom: "8px",
                                              color: "#2E535E",
                                              fontSize: "14px",
                                            }}
                                          >
                                            {data?.product?.title}
                                          </p>
                                          <div
                                            style={{
                                              display: "flex",
                                              flexDirection: "column",
                                              gap: "4px",
                                            }}
                                          >
                                            <p
                                              style={{
                                                fontSize: "13px",
                                                color: "#333",
                                              }}
                                            >
                                              {t(
                                                "dashboard.statistics.revenue"
                                              )}
                                              :{" "}
                                              <strong
                                                style={{ color: "#579BB1" }}
                                              >
                                                {data.actualRevenue?.toFixed(2)}{" "}
                                                EG
                                              </strong>
                                            </p>
                                            <p
                                              style={{
                                                fontSize: "13px",
                                                color: "#333",
                                              }}
                                            >
                                              {t("dashboard.topProducts.sold")}:{" "}
                                              <strong
                                                style={{ color: "#2E535E" }}
                                              >
                                                {data.totalSold}{" "}
                                                {t(
                                                  "dashboard.statistics.units"
                                                )}
                                              </strong>
                                            </p>
                                            <p
                                              style={{
                                                fontSize: "12px",
                                                color: "#666",
                                                marginTop: "4px",
                                                paddingTop: "4px",
                                                borderTop: "1px solid #E1D7C6",
                                              }}
                                            >
                                              Share:{" "}
                                              <strong>
                                                {(
                                                  (data.actualRevenue /
                                                    totalRevenueSum) *
                                                  100
                                                ).toFixed(1)}
                                                %
                                              </strong>
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          );
                        } else {
                          return (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-gray-500 dark:text-gray-400 font-quicksand">
                                {t("dashboard.topProducts.noData")}
                              </p>
                            </div>
                          );
                        }
                      })()}
                      <div className="mt-2 text-center">
                        <p className="text-xs font-bold text-primary dark:text-primary_dark font-quicksand">
                          {t("dashboard.topProducts.revenueDistribution")}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-quicksand mt-1">
                          {t("dashboard.topProducts.total")}{" "}
                          {topProductsData.data
                            .reduce((sum, p) => {
                              const revenue = p.totalRevenue > 0 
                                ? p.totalRevenue 
                                : (p.totalSold * (p.product?.priceAfterDiscount || p.product?.price || 0));
                              return sum + revenue;
                            }, 0)
                            .toFixed(2)}{" "}
                          EG
                        </p>
                      </div>
                    </div>

                    {/* Product Cards with Enhanced Design */}
                    <div className="space-y-2 overflow-y-auto w-50 pr-2 custom-scrollbar">
                      {topProductsData.data.map((product, index) => {
                        const color = "#579BB1";
                        const bgColors = [
                          "bg-primary/10 dark:bg-primary_dark/10",
                          "bg-secondary/10 dark:bg-secondary_dark/10",
                          "bg-primary/15 dark:bg-primary_dark/15",
                          "bg-secondary/15 dark:bg-secondary_dark/15",
                          "bg-primary/20 dark:bg-primary_dark/20",
                        ];
                        const bgColor = bgColors[index % bgColors.length];
                        
                        // Calculate actual revenue if API returns 0
                        const actualRevenue = product.totalRevenue > 0 
                          ? product.totalRevenue 
                          : (product.totalSold * (product.product?.priceAfterDiscount || product.product?.price || 0));
                        
                        // Calculate total revenue for percentage
                        const totalRevenue = topProductsData.data.reduce((sum, p) => {
                          const rev = p.totalRevenue > 0 
                            ? p.totalRevenue 
                            : (p.totalSold * (p.product?.priceAfterDiscount || p.product?.price || 0));
                          return sum + rev;
                        }, 0);

                        return (
                          <div
                            key={product._id}
                            className={`${bgColor} p-6 hover:p-3 rounded-xl hover:shadow-xl h-32 hover:h-40 transition-all duration-300 border-l-4 border-primary/30 dark:border-primary_dark/30 hover:border-primary/50 dark:hover:border-primary_dark/50 relative overflow-hidden group/card backdrop-blur-sm`}
                          >
                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/30 dark:via-accent_dark/30 to-secondary/40 dark:to-secondary_dark/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>

                            <div className="flex flex-wrap justify-center items-center relative z-10">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                                    style={{ backgroundColor: color }}
                                  >
                                    {index + 1}
                                  </div>
                                  <h4 className="font-bold font-quicksand text-sm text-gray-800 dark:text-white group-hover/card:text-primary dark:group-hover/card:text-primary_dark transition-colors">
                                    {product.product?.title}
                                  </h4>
                                </div>
                                <div className="flex gap-3 items-center">
                                  <div className="flex items-center gap-1">
                                    <img
                                      src={cartIcon}
                                      alt={t("dashboard.topProducts.sold")}
                                      className="w-4 h-4"
                                    />
                                    <span className="text-xs font-quicksand text-gray-700 dark:text-gray-300">
                                      <strong
                                        className="text-sm text-primary dark:text-primary_dark"
                                      >
                                        {product.totalSold}
                                      </strong>{" "}
                                      {t("dashboard.topProducts.sold")}
                                    </span>
                                  </div>
                                  <div className="h-3 w-px bg-gray-300 dark:bg-gray-600"></div>
                                  <div className="flex items-center gap-1">
                                    <img
                                      src={moneyIcon}
                                      alt={t("dashboard.quickActions.price")}
                                      className="w-4 h-4"
                                    />
                                    <span className="text-xs font-quicksand text-gray-700 dark:text-gray-300">
                                      <strong className="text-sm">
                                        {product.product?.price?.toFixed(2)}
                                      </strong>{" "}
                                      {t("dashboard.topProducts.perUnit")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p
                                  className="text-base font-bold font-quicksand text-primary dark:text-primary_dark"
                                >
                                  {actualRevenue.toFixed(2)} EG
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-quicksand">
                                  {t("dashboard.topProducts.totalRevenue")}
                                </p>
                                <div className="mt-1 bg-white/60 dark:bg-background_dark/60 px-2 py-0.5 rounded-full">
                                  <p className="text-xs font-bold font-quicksand text-gray-700 dark:text-gray-300">
                                    {totalRevenue > 0 ? ((actualRevenue / totalRevenue) * 100).toFixed(1) : '0.0'}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Customers Section - Appears on Hover */}
                  <div className="mt-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 max-h-none sm:max-h-0 sm:group-hover:max-h-[500px] overflow-visible sm:overflow-hidden transition-all duration-700">
                    <div className="border-t-2 border-primary/20 dark:border-primary_dark/20 pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={customerIcon}
                            alt={t("dashboard.topCustomers.title")}
                            className="w-6 h-6"
                          />
                          <h3 className="text-xl font-bold font-quicksand text-primary dark:text-primary_dark">
                            {t("dashboard.topCustomers.title")}
                          </h3>
                        </div>
                        <div className="bg-primary/10 dark:bg-primary_dark/10 px-3 py-1 rounded-full">
                          <span className="text-xs font-bold font-quicksand text-primary dark:text-primary_dark">
                            {t("dashboard.topCustomers.vipClients")}
                          </span>
                        </div>
                      </div>
                      {customersLoading ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-primary_dark"></div>
                        </div>
                      ) : topCustomersData?.data &&
                        topCustomersData.data.length > 0 ? (
                        <div className="space-y-3">
                          {topCustomersData.data.map((customer, index) => {
                            const bgColors = [
                              "bg-accent dark:bg-accent_dark",
                              "bg-secondary dark:bg-secondary_dark",
                              "bg-accent/80 dark:bg-accent_dark/80",
                              "bg-secondary/80 dark:bg-secondary_dark/80",
                              "bg-accent/60 dark:bg-accent_dark/60",
                            ];
                            const rankNumbers = ["1", "2", "3", "4", "5"];

                            return (
                              <div
                                key={customer._id}
                                className={`${bgColors[index]} p-4 rounded-xl hover:shadow-xl hover:scale-102 transition-all duration-300 border-2 border-transparent hover:border-primary/40 dark:hover:border-primary_dark/40 relative overflow-hidden group/customer backdrop-blur-sm`}
                              >
                                {/* Shine effect on hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/40 dark:via-secondary_dark/40 to-transparent -translate-x-full group-hover/customer:translate-x-full transition-transform duration-1000"></div>

                                <div className="flex items-center justify-between relative z-10">
                                  <div className="flex items-center gap-4 flex-1">
                                    <div
                                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg text-white"
                                      style={{ backgroundColor: "#579BB1" }}
                                    >
                                      {rankNumbers[index]}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-bold font-quicksand text-base text-gray-800 dark:text-white group-hover/customer:text-primary dark:group-hover/customer:text-primary_dark transition-colors">
                                        {customer.customer?.name ||
                                          t(
                                            "dashboard.topCustomers.unknownCustomer"
                                          )}
                                      </p>
                                      <div className="flex items-center gap-3 mt-1">
                                        <div className="flex items-center gap-1">
                                          <span className="text-xs font-quicksand text-gray-700 dark:text-gray-300">
                                            <strong className="text-primary dark:text-primary_dark">
                                              {customer.totalInvoices}
                                            </strong>{" "}
                                            {t(
                                              "dashboard.statistics.invoicesCount"
                                            )}
                                          </span>
                                        </div>
                                        <div className="h-3 w-px bg-gray-300 dark:bg-gray-600"></div>
                                        <div className="flex items-center gap-1">
                                          <span className="text-xs font-quicksand text-gray-700 dark:text-gray-300">
                                            {t(
                                              "dashboard.topCustomers.avgSpent"
                                            )}{" "}
                                            <strong>
                                              {(
                                                customer.totalSpent /
                                                customer.totalInvoices
                                              ).toFixed(2)}
                                            </strong>{" "}
                                            EG
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="bg-white/80 dark:bg-background_dark/80 px-3 py-2 rounded-lg shadow-sm">
                                      <p
                                        className="text-lg font-bold font-quicksand dark:text-primary_dark"
                                        style={{ color: "#579BB1" }}
                                      >
                                        {customer.totalSpent?.toFixed(2)} EG
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 font-quicksand">
                                        {t("dashboard.topCustomers.totalSpent")}
                                      </p>
                                    </div>
                                    {index === 0 && (
                                      <div className="mt-2 bg-primary dark:bg-primary_dark text-white px-2 py-1 rounded-full text-xs font-bold font-quicksand text-center">
                                        {t(
                                          "dashboard.topCustomers.bestCustomer"
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-quicksand text-center py-4 bg-white/50 dark:bg-background_dark/50 rounded-lg">
                          {t("dashboard.topCustomers.noData")}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-48 sm:h-64">
                  <p className="text-gray-500 dark:text-gray-400 font-quicksand text-sm sm:text-base">
                    {t("dashboard.topProducts.noData")}
                  </p>
                </div>
              )}

              {/* Enhanced hover indicator */}
              <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 hidden sm:flex items-center justify-center">
                <div className="bg-primary/20 dark:bg-primary_dark/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-2 group-hover:bg-primary/30 dark:group-hover:bg-primary_dark/30 transition-all duration-300">
                  <span className="text-xs font-normal font-quicksand text-black dark:text-white">
                    {t("dashboard.topCustomers.hoverToExpand")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default Dashboard;
