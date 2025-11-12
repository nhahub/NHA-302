import React from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaUserCircle,
  FaShoppingBag,
} from "react-icons/fa";
import Button from "./ui/Button";
import { useTranslation } from "react-i18next";
import { useCustomer } from "../features/customer/useCustomerQuery";
import Loader from "./Loader";

function ViewCustomer() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Try to get customer from location state first, otherwise fetch from API
  const customerFromState = location.state?.Customer;
  const customerId = id || customerFromState?._id;
  
  const { data: customerData, isLoading, error } = useCustomer(customerId);
  
  // Use customer from API if available, otherwise use from state
  const customer = customerData?.data || customerFromState;

  if (isLoading) {
    return <Loader />;
  }

  if (error || !customer) {
    return (
      <div className="flex justify-center items-center h-screen text-primary text-lg">
        {t("NoCustomerFound")}
      </div>
    );
  }

  // Extract invoices from customer data
  const invoices = customer.invoices || [];
  const totalOrders = customer.orders || customer.totalOrders || invoices.length;
  const totalPurchases = customer.purchases || customer.totalPurchases || 0;

  const handleEdit = () => {
    navigate(`/dashboard/customer/customer/edit/${customer._id}`, {
      state: { Customer: customer },
    });
  };

  const handleDelete = () => {
    console.log("Delete customer:", customer);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "overdue":
        return "text-red-500";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-background dark:bg-background_dark min-h-screen w-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-secondary dark:bg-secondary_dark px-6 py-3 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="font-robotoCondensed text-2xl text-primary dark:text-primary_dark font-semibold">
            {t("CustomerDetails")}
          </h1>
          <p>
            <Link
              to="/"
              className="relative text-sm group text-black dark:text-gray-300 font-quicksand"
            >
              {t("Home")}
              <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-primary dark:bg-gray-300 transition-all duration-500 group-hover:w-full" />
            </Link>{" "}
            /{" "}
            <Link
              to="/dashboard/customer"
              className="relative text-sm group text-black dark:text-gray-300 font-quicksand"
            >
              {t("Customers")}
              <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-primary dark:bg-gray-300 transition-all duration-500 group-hover:w-full" />
            </Link>{" "}
            /{" "}
            <span className="text-sm text-primary dark:text-primary_dark font-quicksand">
              {" "}
              {t("AddCustomer")}
            </span>
          </p>
        </div>

        
      </div>

      {/* Customer Info Section */}
      <div className="px-8 py-10">
        {/* Top Info */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-8 mb-10">
          <div className="flex items-center gap-6">
            <FaUserCircle className="text-primary dark:text-primary_dark bg-white dark:bg-gray-800 rounded-full text-[100px] p-1 border-4 border-white dark:border-gray-700 shadow-md" />
            <div>
              <h2 className="text-3xl font-robotoCondensed font-semibold text-gray-900 dark:text-white">
                {customer.name}
              </h2>
              <div className="mt-2 text-gray-900 dark:text-white font-quicksand text-sm leading-6">
                <p>
                  <span className="text-gray-500 dark:text-gray-400">{t("Email")}:</span>{" "}
                  {customer.email}
                </p>
                <p>
                  <span className="text-gray-500 dark:text-gray-400">{t("Phone")}:</span>{" "}
                  {customer.phone}
                </p>
                <p>
                  <span className="text-gray-500 dark:text-gray-400">{t("Address")}:</span>{" "}
                  {customer.address}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-8 md:mt-0">
            {/* Purchases */}
            <div
              className="bg-accent dark:bg-accent_dark shadow-md px-6 py-4 rounded-2xl text-center 
                transition-all duration-500 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl 
                hover:bg-gradient-to-br hover:from-primary hover:to-secondary hover:text-white cursor-pointer"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 font-quicksand hover:text-white/90">
                {t("Purchases")}
              </p>
              <p className="text-primary dark:text-primary_dark text-xl font-bold font-quicksand hover:text-white">
                ${totalPurchases.toFixed(2)}
              </p>
            </div>

            {/* Orders */}
            <div
              className="bg-accent dark:bg-accent_dark shadow-md px-6 py-4 rounded-2xl text-center 
                transition-all duration-500 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl 
                hover:bg-gradient-to-br hover:from-secondary hover:to-primary hover:text-white cursor-pointer"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 font-quicksand hover:text-white/90">
                {t("Orders")}
              </p>
              <p className="text-primary dark:text-primary_dark text-xl font-bold font-quicksand hover:text-white">
                {totalOrders}
              </p>
            </div>
          </div>
        </div>

        {/* Invoices Section */}
        <div className="w-full">
          <h3 className="font-robotoCondensed text-2xl text-gray-900 dark:text-white font-semibold flex items-center gap-2 mb-6">
            <FaShoppingBag className="text-primary dark:text-primary_dark" /> {t("Invoices")}
          </h3>

          {invoices.length === 0 ? (
            <p className="text-primary dark:text-primary_dark text-center py-6 font-quicksand">
              {t("NoInvoicesFound")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-accent dark:bg-accent_dark rounded-2xl overflow-hidden shadow-sm">
                <thead className="bg-secondary dark:bg-secondary_dark text-black dark:text-white font-quicksand text-sm uppercase tracking-wide">
                  <tr>
                    <th className="px-6 py-3 text-left">{t("InvoiceId")}</th>
                    <th className="px-6 py-3 text-left">{t("OrderDate")}</th>
                    <th className="px-6 py-3 text-left">{t("DueDate")}</th>
                    <th className="px-6 py-3 text-left">{t("Products")}</th>
                    <th className="px-6 py-3 text-left">{t("Total")}</th>
                    <th className="px-6 py-3 text-left">{t("Status")}</th>
                    <th className="px-6 py-3 text-center">{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice._id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all"
                    >
                      <td className="px-6 py-4 font-quicksand text-sm text-gray-900 dark:text-white">
                        #{invoice.invoiceId}
                      </td>
                      <td className="px-6 py-4 text-sm font-quicksand text-gray-700 dark:text-gray-300">
                        {formatDate(invoice.orderDate)}
                      </td>
                      <td className="px-6 py-4 text-sm font-quicksand text-gray-700 dark:text-gray-300">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="px-6 py-4 text-sm font-quicksand text-gray-700 dark:text-gray-300">
                        {invoice.products?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-sm font-quicksand text-primary dark:text-primary_dark font-semibold">
                        ${invoice.total?.toFixed(2) || "0.00"}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-quicksand font-semibold ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          className="text-primary dark:text-primary_dark hover:underline font-quicksand text-sm"
                          onClick={() =>
                            navigate(`/dashboard/invoice/preview/${invoice._id}`, {
                              state: { invoice },
                            })
                          }
                        >
                          {t("View")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="pt-6 flex justify-end gap-3">
          <Button
            onClick={handleEdit}
            className="bg-primary dark:bg-primary_dark text-white px-3 py-2 rounded-xl text-sm before:bg-secondary dark:before:bg-secondary_dark hover:text-black dark:hover:text-white transition-all"
          >
            <FaEdit className="inline mr-1" />
            {t("Edit")}
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-white dark:bg-gray-800 text-primary dark:text-primary_dark border-2 border-primary dark:border-primary_dark px-3 py-2 rounded-xl text-sm hover:bg-primary dark:hover:bg-primary_dark hover:text-white dark:hover:text-white transition-all"
          >
            <FaTrash className="inline mr-1" />
            {t("Delete")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ViewCustomer;
