import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "react-day-picker/dist/style.css";
import MonthSelector from "../components/MonthSelector";
import Loader from "./Loader";
import { useTranslation } from "react-i18next";

import {
  FaFileInvoiceDollar,
  FaBox,
  FaUser,
  FaMoneyBill,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  useReportStats,
  useRevenueOverTime,
  useTopProducts,
  useTopCustomers,
} from "../features/report/useReportQuery";

function Reports() {
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState("August");
  const [selectedYear, setSelectedYear] = useState(2025);
  const [activeRange, setActiveRange] = useState("month");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");

  // Get company ID
  const userData = JSON.parse(localStorage.getItem("user"));
  const companyId = userData?.company;

  // Fetch data with company ID
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useReportStats(companyId);
  const {
    data: revenueData,
    isLoading: revenueLoading,
    error: revenueError,
  } = useRevenueOverTime(activeRange, companyId);
  const {
    data: topProductsData,
    isLoading: productsLoading,
    error: productsError,
  } = useTopProducts(companyId);
  const {
    data: topCustomersData,
    isLoading: customersLoading,
    error: customersError,
  } = useTopCustomers(companyId);

  const stats = {
    totalInvoices: statsData?.data?.stats?.totalInvoices || 0,
    totalRevenue: statsData?.data?.stats?.totalRevenue || 0,
    topProduct: statsData?.data?.topProduct?.product?.title || "N/A",
    topCustomer: statsData?.data?.topCustomer?.customer?.name || "N/A",
  };

  const revenueChartData =
    revenueData?.data?.map((item) => ({
      month: `${item._id?.year}-${String((item._id?.month || 0) + 1).padStart(
        2,
        "0"
      )}`,
      revenue: item.totalRevenue || 0,
    })) || [];

  const topProducts = topProductsData?.data || [];

  const topCustomers = topCustomersData?.data || [];

  // Debugging
  console.log("Stats:", stats);
  console.log("Revenue Data:", revenueChartData);
  console.log("Top Products:", topProducts);
  console.log("Top Customers:", topCustomers);

  // Loading state
  if (statsLoading || revenueLoading || productsLoading || customersLoading) {
    return <Loader />;
  }

  // Error state
  if (statsError || revenueError || productsError || customersError) {
    return (
      <div className="text-center pt-28">
        <p className="text-red-500">{t("ErrorShowingReport")}</p>
      </div>
    );
  }

  return (
    <div className="md:p-5 font-quicksand">
      {/* ====== Header ====== */}
      <div className="flex justify-between items-center py-7 relative">
        <div>
          <h1 className="text-4xl text-primary dark:text-primary_dark font-bold font-robotoCondensed flex items-center gap-3">
            {t("BusinessReportTitle")} - {selectedMonth} {selectedYear}
          </h1>
          <p>
            <Link
              to="/dashboard"
              className="relative text-sm group text-[#1f2e40] dark:text-primary_dark"
            >
              {t("Home")}
              <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-black transition-all duration-500 group-hover:w-full" />
            </Link>{" "}
            /{" "}
            <span className="text-sm text-primary dark:text-primary_dark">
              {t("BusinessReportTitle")}
            </span>
          </p>
        </div>

        {/* ===== Calendar Icon ===== */}
        <div>
          <MonthSelector
            onChange={(month, year) => {
              setSelectedMonth(month);
              setSelectedYear(year);
            }}
          />
        </div>
      </div>

      {/* ====== Summary Cards ====== */}
      <motion.div
        className="grid md:grid-cols-4 grid-cols-2 gap-4 mb-8"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.2 },
          },
        }}
      >
        {[
          {
            icon: (
              <FaFileInvoiceDollar className="text-primary dark:text-primary_dark text-2xl mb-2" />
            ),
            title: t("TotalInvoices"),
            value: String(stats.totalInvoices || 0),
          },
          {
            icon: (
              <FaMoneyBill className="text-primary dark:text-primary_dark text-2xl mb-2" />
            ),
            title: t("TotalRevenue"),
            value: `EGP ${(stats.totalRevenue || 0).toLocaleString()}`,
          },
          {
            icon: (
              <FaBox className="text-primary dark:text-primary_dark text-2xl mb-2" />
            ),
            title: t("TopProduct"),
            value: stats.topProduct,
          },
          {
            icon: (
              <FaUser className="text-primary dark:text-primary_dark text-2xl mb-2" />
            ),
            title: t("TopCustomer"),
            value: stats.topCustomer,
          },
        ].map((card, index) => (
          <motion.div
            key={index}
            className="bg-accent dark:bg-accent_dark border-2 border-background dark:border-background_dark p-4 rounded-2xl flex flex-col items-center text-center shadow-sm"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
              transition: { duration: 0.3 },
            }}
            whileTap={{ scale: 0.98 }}
          >
            {card.icon}
            <p className="text-sm font-semibold text-[#1f2e40] dark:text-white">
              {card.title}
            </p>
            <p className="text-lg font-bold dark:text-white">{card.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ====== Revenue Chart ====== */}
      <div className="bg-accent dark:bg-accent_dark border-2 border-background dark:border-background_dark rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-semibold pb-3 text-[#1f2e40] dark:text-white">
          {t("RevenueOverTime")}
        </h3>

        {/* ====== Filter Buttons ====== */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex gap-3">
            <button
              onClick={() => setActiveRange("7days")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform 
          ${
            activeRange === "7days"
              ? "bg-primary dark:bg-primary_dark text-white shadow-md scale-105"
              : "border-2 border-background dark:border-background_dark text-[#1f2e40] dark:text-white hover:bg-primary hover:dark:bg-primary_dark hover:text-white hover:scale-105"
          }`}
            >
              {t("Last7Days")}
            </button>

            <button
              onClick={() => setActiveRange("month")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform 
          ${
            activeRange === "month"
              ? "bg-primary text-white shadow-md scale-105"
              : "border-2 border-background dark:border-background_dark text-[#1f2e40] dark:text-white hover:bg-primary hover:dark:bg-primary_dark hover:text-white hover:scale-105"
          }`}
            >
              {t("ThisMonth")}
            </button>

            <button
              onClick={() => setActiveRange("custom")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform 
          ${
            activeRange === "custom"
              ? "bg-primary text-white shadow-md scale-105"
              : "border-2 border-background dark:border-background_dark text-[#1f2e40] dark:text-white hover:bg-primary hover:dark:bg-primary_dark hover:text-white hover:scale-105"
          }`}
            >
              {t("CustomRange")}
            </button>
          </div>

          {activeRange === "custom" && (
            <div className="flex gap-3 items-center">
              <input
                type="date"
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
                className="bg-secondary dark:bg-secondary_dark border-2 border-background dark:border-background_dark rounded-xl px-3 py-2 text-sm text-[#1f2e40] dark:text-white focus:outline-none focus:border-primary dark:focus:border-primary_dark transition-all duration-300 cursor-pointer"
              />

              <span className="dark:text-white">{t("To")}</span>

              <input
                type="date"
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
                className="bg-secondary dark:bg-secondary_dark border-2 border-background dark:border-background_dark rounded-xl px-3 py-2 text-sm text-[#1f2e40] dark:text-white focus:outline-none focus:border-primary dark:focus:border-primary_dark transition-all duration-300 cursor-pointer"
              />

              <button
                onClick={() => {
                  if (customDateFrom && customDateTo) {
                    console.log(
                      "Custom range:",
                      customDateFrom,
                      "to",
                      customDateTo
                    );
                  }
                }}
                className="bg-primary dark:bg-primary_dark text-white px-3 py-1 rounded-lg text-sm hover:opacity-90 transition"
              >
                {t("Apply")}
              </button>
            </div>
          )}
        </div>

        <div className="h-64 w-full">
          {revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="month" stroke="#1f2e40" />
                <YAxis stroke="#1f2e40" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fefefe",
                    borderRadius: "10px",
                    border: "1px solid #ccc",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4C8BF5"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">{t("NoRevenueData")}</p>
            </div>
          )}
        </div>
      </div>

      {/* ====== Tables Section ====== */}
      <motion.div
        className="grid md:grid-cols-2 grid-cols-1 gap-6 mb-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Top Products Sold */}
        <motion.div
          className="bg-accent dark:bg-accent_dark border-2 border-background dark:border-background_dark p-6 rounded-2xl shadow-sm"
          whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-semibold pb-3 text-primary dark:text-primary_dark">
            {t("TopProductsSold")}
          </h3>

          <table className="w-full text-sm border-collapse overflow-hidden rounded-xl">
            <thead className="bg-primary dark:bg-primary_dark text-white">
              <tr>
                <th className="p-2 text-left">{t("ProductName")}</th>
                <th className="p-2 text-left">{t("Units")}</th>
                <th className="p-2 text-left">{t("Revenue")}</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length > 0 ? (
                topProducts.map((item, index) => {
                  const calculatedRevenue =
                    (item.totalSold || 0) * (item.product?.price || 0);

                  return (
                    <motion.tr
                      key={index}
                      className="border-b border-gray-200 dark:border-gray-600 hover:bg-primary/10 dark:hover:bg-primary_dark/10 cursor-pointer"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td className="p-2 text-gray-800 dark:text-white">
                        {item.product?.title || t("NA")}
                      </td>
                      <td className="p-2 text-gray-800 dark:text-white">
                        {item.totalSold || 0}
                      </td>
                      <td className="p-2 text-gray-800 dark:text-white">
                        EGP {calculatedRevenue.toLocaleString()}
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-gray-500">
                    {t("NoProductsData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>

        {/* Top Customers */}
        <motion.div
          className="bg-accent dark:bg-accent_dark border-2 border-background dark:border-background_dark p-6 rounded-2xl shadow-sm"
          whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-semibold pb-3 text-primary dark:text-primary_dark">
            {t("TopCustomers")}
          </h3>

          <table className="w-full text-sm border-collapse overflow-hidden rounded-xl">
            <thead className="bg-primary dark:bg-primary_dark text-white">
              <tr>
                <th className="p-2 text-left">{t("CustomerName")}</th>
                <th className="p-2 text-left">{t("Orders")}</th>
                <th className="p-2 text-left">{t("Total")}</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.length > 0 ? (
                topCustomers.map((item, index) => (
                  <motion.tr
                    key={index}
                    className="border-b border-background dark:border-background_dark hover:bg-primary/10 dark:hover:bg-primary_dark/10 cursor-pointer"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td className="p-2 text-gray-800 dark:text-white">
                      {item.customer?.name || t("NA")}
                    </td>
                    <td className="p-2 text-gray-800 dark:text-white">
                      {item.totalInvoices || 0}
                    </td>
                    <td className="p-2 text-gray-800 dark:text-white">
                      EGP {item.totalSpent?.toLocaleString() || 0}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-gray-500">
                    {t("NoCustomersData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </motion.div>

      {/* ====== Business Insights ====== */}
      <div className="bg-accent dark:bg-accent_dark border-2 border-background dark:border-background_dark rounded-2xl p-6">
        <h3 className="text-xl font-semibold pb-3 text-primary dark:text-primary_dark">
          {t("BusinessInsightsTitle")}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="text-center p-3 bg-primary/5 dark:bg-primary_dark/10 rounded-lg border border-primary/20 dark:border-primary_dark/30">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t("AvgOrder")}
            </p>
            <p className="text-lg font-bold text-primary dark:text-primary_dark">
              EGP{" "}
              {stats.totalInvoices
                ? Math.round(stats.totalRevenue / stats.totalInvoices)
                : 0}
            </p>
          </div>

          <div className="text-center p-3 bg-primary/5 dark:bg-primary_dark/10 rounded-lg border border-primary/20 dark:border-primary_dark/30">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t("TotalSold")}
            </p>
            <p className="text-lg font-bold text-primary dark:text-primary_dark">
              {topProducts.reduce(
                (sum, item) => sum + (item.totalSold || 0),
                0
              )}
            </p>
          </div>

          <div className="text-center p-3 bg-primary/5 dark:bg-primary_dark/10 rounded-lg border border-primary/20 dark:border-primary_dark/30">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t("ActiveCustomers")}
            </p>
            <p className="text-lg font-bold text-primary dark:text-primary_dark">
              {topCustomers.length}
            </p>
          </div>

          <div className="text-center p-3 bg-primary/5 dark:bg-primary_dark/10 rounded-lg border border-primary/20 dark:border-primary_dark/30">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t("Products")}
            </p>
            <p className="text-lg font-bold text-primary dark:text-primary_dark">
              {topProducts.length}
            </p>
          </div>
        </div>

        {/* Insights */}
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>
            {t("InsightTotalRevenue")}{" "}
            <strong>EGP {stats.totalRevenue?.toLocaleString()}</strong>{" "}
            {t("InsightFrom")} <strong>{stats.totalInvoices}</strong>{" "}
            {t("InsightInvoices")}
          </li>

          <li>
            <strong>{stats.topProduct}</strong> {t("InsightTopProduct")}
          </li>

          <li>
            <strong>{stats.topCustomer}</strong> {t("InsightTopCustomer")}
          </li>

          <li>
            {t("InsightAvgOrderValue")}{" "}
            <strong>
              EGP{" "}
              {stats.totalInvoices
                ? Math.round(stats.totalRevenue / stats.totalInvoices)
                : 0}
            </strong>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Reports;
