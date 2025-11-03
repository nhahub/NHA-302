/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import user from "../assets/customer.png";
import eye from "../assets/eye-scan-svgrepo-com (1).png";
import money from "../assets/money-receive-svgrepo-com.png";
import cart from "../assets/cart-large-svgrepo-com.png";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";
import SystemManagement from "./ui/SystemManagement";
import { Globe, Sun, Moon, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "../utils/usePreferences";
import logoIcon from "../assets/logo.png";
import sideBarIcon from "../assets/sidebar.png";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { getAllUsers } from "../api/users";
import { getAllCompanies } from "../api/company";
import { getAdminBillingSummary } from "../api/pricing_billing";
import { getRevenueOverTime } from "../api/report";
import { getAllCustomers } from "../api/customer";
import { getAllProducts } from "../api/product";
import { getAllInvoices } from "../api/invoice";
import Loader from "./Loader";

export default function AdminDashboard() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 640;
    }
    return true;
  });
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { language, changeLanguage, theme, changeTheme } = usePreferences();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    pageViewsPerMin: 0,
    earningThisYear: 0,
    users: 0,
    totalCompanies: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalProductsSold: 0,
    totalBillingUsers: 0,
    usersWithCards: 0,
    monthlyIncome: 0,
    companiesProfit: 0,
    potentialRevenue: 0,
    totalRevenue: 0,
    totalInvoices: 0,
    totalUsageInvoices: 0,
    totalUsageProducts: 0,
    totalUsageCustomers: 0,
  });

  const [visitsData, setVisitsData] = useState([]);
  const [ageSalesData, setAgeSalesData] = useState([]);
  
  // Store fetched data to pass to SystemManagement
  const [dashboardData, setDashboardData] = useState({
    users: [],
    companies: [],
    customers: [],
    products: [],
  });

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [
          usersRes,
          companiesRes,
          billingRes,
          customersRes,
          productsRes,
          invoicesRes,
          revenueRes,
        ] = await Promise.all([
          getAllUsers().catch(() => ({ data: [] })),
          getAllCompanies().catch(() => ({ data: [] })),
          getAdminBillingSummary().catch(() => ({ data: [] })),
          getAllCustomers().catch(() => ({ data: [] })),
          getAllProducts().catch(() => ({ data: [] })),
          getAllInvoices().catch(() => ({ data: [] })),
          getRevenueOverTime("month").catch(() => ({ data: [] })),
        ]);

        // Store data for SystemManagement component
        const usersArray = usersRes.data || [];
        const companiesArray = companiesRes.data || [];
        const customersArray = customersRes.data || [];
        const productsArray = productsRes.data?.data || productsRes.data || [];

        setDashboardData({
          users: usersArray,
          companies: companiesArray,
          customers: customersArray,
          products: productsArray,
        });

        // Process users data
        const totalUsers = usersArray.length || 0;
        const activeUsers = usersArray.filter(
          (user) => user.role === "user" && user.verified
        ).length || 0;

        // Process companies data
        const totalCompanies = companiesArray.length || 0;

        // Process customers data
        const totalCustomers = customersArray.length || 0;

        // Process products data
        const totalProducts = productsArray.length || 0;
        const totalProductsSold = productsArray.reduce(
          (sum, product) => sum + (product.sold || 0),
          0
        );

        // Process invoices data
        const invoicesData = invoicesRes.data?.data || invoicesRes.data || [];
        const totalInvoices = invoicesData.length || 0;
        
        // Calculate total revenue from invoices
        const totalRevenue = invoicesData.reduce(
          (sum, invoice) => sum + (invoice.total || 0),
          0
        );

        // Calculate total from customers' purchases
        const customersTotalPurchases = customersArray.reduce(
          (sum, customer) => sum + (customer.totalPurchases || 0),
          0
        ) || 0;

        // Use the higher value between invoice totals and customer purchases
        const actualRevenue = Math.max(totalRevenue, customersTotalPurchases);

        console.log("📊 Dashboard Metrics Debug:", {
          totalUsers,
          activeUsers,
          totalCompanies,
          totalCustomers,
          totalProducts,
          totalProductsSold,
          totalInvoices,
          totalRevenue,
          customersTotalPurchases,
          actualRevenue,
          invoicesCount: invoicesData.length,
          customersCount: customersArray.length,
          productsCount: productsArray.length,
        });

        // Process billing data with detailed calculations
        const billingData = billingRes.data || [];
        
        // Calculate total billing metrics
        const totalBillingUsers = billingData.length;
        const totalDue = billingData.reduce(
          (sum, bill) => sum + (bill.totalDue || 0),
          0
        );
        
        // Calculate total usage across all users
        const totalUsage = billingData.reduce(
          (acc, bill) => ({
            invoices: acc.invoices + (bill.usage?.invoices || 0),
            products: acc.products + (bill.usage?.products || 0),
            customers: acc.customers + (bill.usage?.customers || 0),
          }),
          { invoices: 0, products: 0, customers: 0 }
        );

        // Calculate potential revenue from overages
        let potentialRevenue = 0;
        billingData.forEach((bill) => {
          const usage = bill.usage || {};
          const limits = bill.limits || {};
          const pricing = bill.pricing || {};
          
          // Calculate overages
          const invoiceOverage = Math.max(0, usage.invoices - limits.invoices);
          const productOverage = Math.max(0, usage.products - limits.products);
          const customerOverage = Math.max(0, usage.customers - limits.customers);
          
          potentialRevenue += 
            (invoiceOverage * (pricing.invoiceUnitPrice || 3)) +
            (productOverage * (pricing.productUnitPrice || 5)) +
            (customerOverage * (pricing.customerUnitPrice || 0.5));
        });

        // Count users with cards attached
        const usersWithCards = billingData.filter(
          (bill) => bill.cards && bill.cards.length > 0
        ).length;

        // Monthly income estimation (actual due + potential from overages)
        const estimatedMonthlyIncome = (totalDue + potentialRevenue) / 12;
        
        console.log("💳 Billing Metrics Debug:", {
          totalBillingUsers,
          totalDue,
          potentialRevenue,
          usersWithCards,
          totalUsage,
          estimatedMonthlyIncome,
        });

        // Calculate page views (mock based on users and activity)
        const pageViewsPerMin = Math.floor(activeUsers / 2) || 1;

        // Process revenue over time for chart
        let revenueChartData = [];
        if (revenueRes.data && revenueRes.data.length > 0) {
          revenueChartData = revenueRes.data.map((item) => ({
            name: item._id?.month 
              ? `${getMonthName(item._id.month)}-${item._id.year}` 
              : `${item._id.year}`,
            value: item.totalRevenue || 0,
          }));
        } else {
          // Create mock data from invoices by month if API doesn't return data
          const monthlyData = {};
          invoicesData.forEach((invoice) => {
            if (invoice.orderDate) {
              const date = new Date(invoice.orderDate);
              const monthKey = `${date.getMonth() + 1}-${date.getFullYear()}`;
              const monthName = `${getMonthName(date.getMonth() + 1)}-${date.getFullYear()}`;
              if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { name: monthName, value: 0 };
              }
              monthlyData[monthKey].value += invoice.total || 0;
            }
          });
          revenueChartData = Object.values(monthlyData);
        }

        // Update metrics
        setMetrics({
          activeUsers,
          pageViewsPerMin,
          earningThisYear: (actualRevenue / 1000).toFixed(1),
          users: totalUsers,
          totalCompanies,
          totalCustomers,
          totalProducts,
          totalProductsSold,
          totalBillingUsers,
          usersWithCards,
          monthlyIncome: estimatedMonthlyIncome.toFixed(2),
          companiesProfit: totalDue.toFixed(2),
          potentialRevenue: potentialRevenue.toFixed(2),
          totalRevenue: actualRevenue.toFixed(2),
          totalInvoices,
          totalUsageInvoices: totalUsage.invoices,
          totalUsageProducts: totalUsage.products,
          totalUsageCustomers: totalUsage.customers,
        });

        // Update chart data
        if (revenueChartData.length > 0) {
          setVisitsData(revenueChartData);
        } else {
          // Fallback to sample data if no revenue data
          setVisitsData([
            { name: "Jan", value: 0 },
            { name: "Feb", value: 0 },
            { name: "Mar", value: 0 },
            { name: "Apr", value: 0 },
            { name: "May", value: 0 },
            { name: "Jun", value: 0 },
          ]);
        }

        // Generate sales by age data based on customer demographics
        // Since we don't have age data, we'll distribute based on total revenue
        if (actualRevenue > 0) {
          setAgeSalesData([
            { name: "10-20", sales: Math.floor(actualRevenue * 0.05) },
            { name: "21-30", sales: Math.floor(actualRevenue * 0.35) },
            { name: "31-40", sales: Math.floor(actualRevenue * 0.30) },
            { name: "41-50", sales: Math.floor(actualRevenue * 0.20) },
            { name: "51+", sales: Math.floor(actualRevenue * 0.10) },
          ]);
        } else {
          setAgeSalesData([
            { name: "10-20", sales: 0 },
            { name: "21-30", sales: 0 },
            { name: "31-40", sales: 0 },
            { name: "41-50", sales: 0 },
            { name: "51+", sales: 0 },
          ]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error(t("ErrorFetchingData") || "Error fetching dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  // Helper function to get month name
  const getMonthName = (month) => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return months[month - 1] || "Unknown";
  };

  const [impressionData, setImpressionData] = useState([
    { name: "Mon", val: 40 },
    { name: "Tue", val: 70 },
    { name: "Wed", val: 60 },
    { name: "Thu", val: 90 },
  ]);

  const stats = [
    {
      title: t("ActiveUsers") || "Active Users",
      value: metrics.activeUsers,
      subtitle: t("RegisteredUsers") || "Registered users",
      icon: user,
      progress: metrics.users > 0 ? (metrics.activeUsers / metrics.users) * 100 : 0,
    },
    {
      title: t("PageViewsPerMin") || "Page Views / Min",
      value: metrics.pageViewsPerMin,
      subtitle: t("LiveTraffic") || "Live traffic",
      icon: eye,
      progress: 50,
    },
    {
      title: t("EarningsThisYear") || "Earnings This Year",
      value: `$${metrics.earningThisYear}k`,
      subtitle: t("TotalRevenue") || "Total revenue",
      icon: money,
      progress: 90,
    },
    {
      title: t("TotalInvoices") || "Total Invoices",
      value: metrics.totalInvoices,
      subtitle: t("CompletedOrders") || "Completed orders",
      icon: cart,
      progress: 65,
    },
  ];
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    toast.success(t("LogoutToast"));
    navigate("/");
  };

  function StatCard({ title, value, subtitle, icon, progress }) {
    return (
      <div className="bg-secondary dark:bg-secondary_dark backdrop-blur-sm rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-white font-quicksand">
          {icon && <img src={icon} alt="icon" className="w-5 h-5" />}
          <span>{title}</span>
        </div>

        <div className="text-2xl font-semibold mt-1 font-quicksand dark:text-white">
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-gray-600 mt-2 font-quicksand">
            {subtitle}
          </div>
        )}

        {/* شريط التقدم */}
        <div className="w-full bg-gray-200 rounded-full h-1 mt-2 overflow-hidden">
          <div
            className="h-1 rounded-full transition-all duration-700 bg-primary dark:bg-primary_dark"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background  dark:bg-background_dark transition-colors duration-500 flex">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background bg-opacity-40">
          <Loader />
        </div>
      )}
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "w-64" : "w-20"
        } bg-secondary dark:text-white dark:bg-secondary_dark  p-5 space-y-3 transition-all duration-300`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <img
            src={logoIcon}
            alt="Logo"
            className={`
            transition-all duration-300
            w-10 h-10
            block                                  
            sm:${isOpen ? "block" : "hidden"}       
            `}
            title="Logo"
          />

          <img
            src={sideBarIcon}
            alt="Toggle Sidebar"
            className={`
      cursor-pointer transition-transform duration-300
      hidden sm:block                        
      ${isOpen ? "w-6 h-6" : "w-8 h-8 mx-auto"}
    `}
            onClick={() => setIsOpen(!isOpen)}
            title="Toggle Sidebar"
          />
        </div>
        {/* Navigation links */}
        <ul className="space-y-2">
          {/* Language Switch */}
          <li>
            <button
              onClick={() => {
                changeLanguage(language === "en" ? "ar" : "en");
              }}
              className="flex items-center gap-3 p-2 w-full rounded hover:bg-accent hover:dark:bg-accent_dark transition-colors duration-200"
            >
              <Globe className="w-5 h-5 text-gray-800 dark:text-white" />
              {isOpen && <span>{t("Language")}</span>}
            </button>
          </li>

          {/* Theme Toggle */}
          <li>
            <button
              onClick={() => {
                changeTheme(theme === "dark" ? "light" : "dark");
              }}
              className="flex items-center gap-3 p-2 w-full rounded hover:bg-accent hover:dark:bg-accent_dark transition-colors duration-200"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-gray-800 dark:text-white" />
              ) : (
                <Moon className="w-5 h-5 text-gray-800 dark:text-white" />
              )}
              {isOpen && <span>{t("Theme")}</span>}
            </button>
          </li>

          {/* Logout */}
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-2 w-full rounded hover:bg-accent hover:dark:bg-accent_dark transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 text-gray-800 dark:text-white" />
              {isOpen && <span>{t("Logout")}</span>}
            </button>
          </li>
        </ul>
      </aside>
      <div className="flex-1 px-2 py-1 md:px-20 md:py-10 bg-background dark:bg-background_dark">
        <header className="mb-6">
          <h1 className="font-robotoCondensed text-5xl font-extrabold text-primary dark:text-primary_dark">
            {t("AdminDashboard")}
          </h1>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            {/* Card 1 */}
            <div className="bg-accent dark:bg-accent_dark rounded-xl p-6 shadow-sm dark:shadow-md dark:border dark:border-secondary_dark">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 w-[20%]">
                  <div className="text-sm text-gray-600 dark:text-gray-300 font-quicksand">
                    {t("ActiveUsersNow")}
                  </div>
                  <div className="text-5xl font-bold text-primary dark:text-primary_dark">
                    {metrics.activeUsers}
                  </div>
                  <div className="text-lg text-gray-600 dark:text-gray-300 mt-2 font-quicksand">
                    {t("PageViewsPerMinute")}
                  </div>
                </div>

                <div className="w-[80%] h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={visitsData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="2" stroke="#6b7280" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip 
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                          border: '1px solid #6b7280',
                          borderRadius: '8px'
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#579BB1"
                        strokeWidth={2}
                        dot={{ fill: "#579BB1", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {stats.map((stat, index) => (
                  <StatCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    subtitle={stat.subtitle}
                    icon={stat.icon}
                    progress={stat.progress}
                  />
                ))}
              </div>
            </div>

            {/* Sales Card */}
            <div className="bg-accent dark:bg-accent_dark rounded-xl p-6 shadow-sm dark:border dark:border-secondary_dark">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-quicksand text-gray-900 dark:text-gray-200">
                  {t("SalesByAge")}
                </h2>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary dark:text-primary_dark font-quicksand">
                  <span className="w-2 h-2 bg-primary dark:bg-primary_dark rounded-full"></span>
                  <span>{t("Sales")}</span>
                </div>
              </div>

              <div className="mt-6 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ageSalesData}>
                    <defs>
                      <linearGradient
                        id="colorSales"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#579BB1"
                          stopOpacity={0.6}
                        />
                        <stop
                          offset="95%"
                          stopColor="#579BB1"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                        border: '1px solid #6b7280',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#579BB1"
                      fillOpacity={1}
                      fill="url(#colorSales)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 gap-4 font-quicksand">
              {/* First Card - Companies & Billing */}
              <div className="bg-accent dark:bg-accent_dark rounded-xl p-6 shadow-sm dark:border dark:border-secondary_dark">
                <div className="text-sm text-gray-800 dark:text-gray-200">
                  {t("TotalCompanies")}
                </div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {metrics.totalCompanies}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-300">
                  <div>
                    <div className="text-gray-800 dark:text-gray-200">
                      {t("BillingUsers") || "Billing Users"}
                    </div>
                    <div className="font-medium text-primary dark:text-primary_dark">
                      {metrics.totalBillingUsers}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-800 dark:text-gray-200">
                      {t("WithCards") || "With Cards"}
                    </div>
                    <div className="font-medium text-green-600 dark:text-green-400">
                      {metrics.usersWithCards}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {t("PotentialRevenue") || "Potential Revenue"}
                  </div>
                  <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                    ${metrics.potentialRevenue}
                  </div>
                </div>
              </div>

              {/* Second Card - Revenue & Usage */}
              <div className="bg-accent dark:bg-accent_dark rounded-xl p-6 shadow-sm dark:border dark:border-secondary_dark">
                <div className="text-sm text-gray-800 dark:text-gray-200">
                  {t("MonthlyIncome")}
                </div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  ${metrics.monthlyIncome}
                </div>

                <div className="mt-6">
                  <div className="text-sm text-gray-800 dark:text-gray-200">
                    {t("TotalRevenue")}
                  </div>
                  <div className="text-lg font-medium text-primary dark:text-primary_dark mt-2">
                    ${metrics.totalRevenue}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {t("FromAllCompanies") || "From all companies"}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {t("Invoices") || "Invoices"}
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {metrics.totalUsageInvoices}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {t("Products") || "Products"}
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {metrics.totalUsageProducts}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {t("Customers") || "Customers"}
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {metrics.totalUsageCustomers}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <SystemManagement 
              usersData={dashboardData.users}
              productsData={dashboardData.products}
              customersData={dashboardData.customers}
              companiesData={dashboardData.companies}
              isLoading={loading}
            />
          </section>
        </main>

        <footer className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
          {t("FooterRights")}
        </footer>
      </div>
    </div>
  );
}
