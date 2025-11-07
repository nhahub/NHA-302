import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ViewIcon from "../../assets/view-icon.png";
import DetailsIcon from "../../assets/details-icon.png";
import PrintIcon from "../../assets/print-icon.png";
import { Trash2 } from "lucide-react";
import { useDeleteInvoice } from "../../features/invoice/useInvoiceQuery";
import { useTranslation } from "react-i18next";

// This is a reusable UI component for displaying invoices.
// It takes 'invoices' data and a 'className' for custom styling as props.

const Table = ({ invoices, className }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const deleteMutation = useDeleteInvoice();

  // Reset to page 1 when invoices change (filtering, sorting, etc.)
  useEffect(() => {
    setCurrentPage(1);
  }, [invoices.length]);

  // Calculate pagination
  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = invoices.slice(startIndex, endIndex);

  // Helper function to determine the styling for the status badge
  const getStatusBadge = (status) => {
    const baseClasses =
      "px-4 py-2 rounded-full text-sm font-bold w-28 text-center inline-block transition-all duration-300 shadow-md";
    switch (status.toLowerCase()) {
      case "paid":
        return `${baseClasses} bg-gradient-to-r from-[#57A7B3] to-[#4a959f] text-transparent bg-clip-text hover:shadow-lg hover:shadow-[#57A7B3]/30`;
      case "pending":
        return `${baseClasses} bg-gradient-to-r from-yellow-400 to-yellow-500 text-transparent bg-clip-text hover:shadow-lg hover:shadow-yellow-400/30`;
      case "overdue":
        return `${baseClasses} bg-gradient-to-r from-red-500 to-red-600 text-transparent bg-clip-text hover:shadow-lg hover:shadow-red-500/30`;
      default:
        return `${baseClasses} bg-gradient-to-r from-gray-300 to-gray-400 text-transparent bg-clip-text hover:shadow-lg hover:shadow-gray-300/30`;
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Handle view invoice
  const handleView = (invoice) => {
    navigate(`/dashboard/invoice/preview`, {
      state: {
        invoiceData: {
          invoiceId: invoice.id,
          orderDate: invoice.orderDate,
          dueDate: invoice.dueDate,
          status: invoice.status,
          paymentMethod: invoice.paymentMethod || "Cash",
          subTotal: invoice.subTotal || invoice.rawAmount,
          total: invoice.rawAmount,
          discount: invoice.discount || 0,
          products: invoice.products || [],
          customer: invoice.customerId,
          _id: invoice._id,
        },
        selectedProducts: invoice.products || [],
        customers: invoice.customerData ? [invoice.customerData] : [],
      },
    });
  };

  // Handle edit invoice
  const handleEdit = (invoice) => {
    navigate(`/dashboard/invoice/edit/${invoice._id}`, {
      state: {
        invoice,
        invoiceData: {
          invoiceId: invoice.id,
          orderDate: invoice.orderDate,
          dueDate: invoice.dueDate,
          status: invoice.status,
          paymentMethod: invoice.paymentMethod || "Cash",
          subTotal: invoice.subTotal || invoice.rawAmount,
          total: invoice.rawAmount,
          discount: invoice.discount || 0,
          products: invoice.products || [],
          customer: invoice.customerId,
          _id: invoice._id,
        },
        selectedProducts: invoice.products || [],
        customers: invoice.customerData ? [invoice.customerData] : [],
      },
    });
  };

  // Handle print invoice
  const handlePrint = (invoice) => {
    // Navigate to preview with print flag
    navigate(`/dashboard/invoice/preview`, {
      state: {
        invoiceData: {
          invoiceId: invoice.id,
          orderDate: invoice.orderDate,
          dueDate: invoice.dueDate,
          status: invoice.status,
          paymentMethod: invoice.paymentMethod || "Cash",
          subTotal: invoice.subTotal || invoice.rawAmount,
          total: invoice.rawAmount,
          discount: invoice.discount || 0,
          products: invoice.products || [],
          customer: invoice.customerId,
          _id: invoice._id,
        },
        selectedProducts: invoice.products || [],
        customers: invoice.customerData ? [invoice.customerData] : [],
        autoPrint: true, // Flag to trigger print on load
      },
    });
  };

  // The default class names for the component's container
  const defaultClasses =
    "bg-secondary dark:bg-secondary_dark p-3 sm:p-4 lg:p-6 rounded-2xl shadow-lg dark:shadow-gray-800/50 transition-all duration-1000 ease-in-out border border-gray-200/50 dark:border-gray-700/50";

  return (
    <section
      id="latest-invoices"
      className={`${defaultClasses} ${className || ""}`}
    >
      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="min-w-full">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-accent via-accent to-accent/90 dark:from-accent_dark dark:via-accent_dark dark:to-accent_dark/90 p-5 grid grid-cols-6 gap-4 text-left pb-4 rounded-xl font-quicksand text-lg font-bold text-black dark:text-white shadow-md border-b-2 border-primary/20 dark:border-primary_dark/20">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-primary dark:text-primary_dark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {t("invoices")}
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-primary dark:text-primary_dark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {t("customer")}
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-primary dark:text-primary_dark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {t("date")}
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-primary dark:text-primary_dark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t("amount")}
            </div>
            <div className="text-center flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4 text-primary dark:text-primary_dark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t("status")}
            </div>
            <div className="text-center flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4 text-primary dark:text-primary_dark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
              {t("Actions")}
            </div>
          </div>

          {/* Table Body - Data Rows */}
          <div className="mt-2 p-5 font-quicksand text-lg">
            {currentInvoices.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-lg">{t("NoInvoices")}</p>
              </div>
            ) : (
              currentInvoices.map((invoice, index) => (
                <div
                  key={invoice.id}
                  className="grid grid-cols-6 gap-4 items-center py-4 px-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 text-gray-700 dark:text-white hover:bg-accent/30 dark:hover:bg-accent_dark/30 transition-all duration-300 rounded-lg group hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary dark:bg-primary_dark opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    #{invoice.id}
                  </div>
                  <div className="font-medium">{invoice.customer}</div>
                  <div className="text-gray-600 dark:text-gray-300">
                    {invoice.date}
                  </div>
                  <div className="font-bold text-primary dark:text-primary_dark">
                    {invoice.amount}
                  </div>
                  <div className="text-center">
                    <span
                      className={`${getStatusBadge(
                        invoice.status
                      )} transition-all duration-300 hover:scale-105 hover:shadow-lg border-none`}
                    >
                      ({invoice.status})
                    </span>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <div
                      className="relative group/icon cursor-pointer"
                      onClick={() => handleView(invoice)}
                    >
                      <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 rounded-full scale-0 group-hover/icon:scale-150 transition-transform duration-300"></div>
                      <img
                        src={ViewIcon}
                        alt="View"
                        className="w-6 h-6 relative z-10 hover:scale-125 transition-all duration-300 hover:rotate-12 drop-shadow-md"
                        title="Preview Invoice"
                      />
                    </div>
                    <div
                      className="relative group/icon cursor-pointer"
                      onClick={() => handleEdit(invoice)}
                    >
                      <div className="absolute inset-0 bg-green-500/20 dark:bg-green-400/20 rounded-full scale-0 group-hover/icon:scale-150 transition-transform duration-300"></div>
                      <img
                        src={DetailsIcon}
                        alt="Edit"
                        className="w-6 h-6 relative z-10 hover:scale-125 transition-all duration-300 hover:rotate-12 drop-shadow-md"
                        title="Edit Invoice"
                      />
                    </div>
                    <div
                      className="relative group/icon cursor-pointer"
                      onClick={() => handlePrint(invoice)}
                    >
                      <div className="absolute inset-0 bg-purple-500/20 dark:bg-purple-400/20 rounded-full scale-0 group-hover/icon:scale-150 transition-transform duration-300"></div>
                      <img
                        src={PrintIcon}
                        alt="Print"
                        className="w-6 h-6 relative z-10 hover:scale-125 transition-all duration-300 hover:rotate-12 drop-shadow-md"
                        title="Print Invoice"
                      />
                    </div>

                    {/* Delete action */}
                    <div
                      className="relative group/icon cursor-pointer"
                      onClick={() => {
                        setInvoiceToDelete(invoice);
                        setShowDeleteModal(true);
                      }}
                    >
                      <div className="absolute inset-0 bg-red-500/20 dark:bg-red-400/20 rounded-full scale-0 group-hover/icon:scale-150 transition-transform duration-300"></div>
                      <div className="w-6 h-6 relative z-10 flex items-center justify-center text-red-600 dark:text-red-400 hover:scale-125 transition-all duration-300" title="Delete Invoice">
                        <Trash2 size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile Card View - Visible only on mobile and tablet */}
      <div className="lg:hidden space-y-3">
        {currentInvoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 font-quicksand">
            {t("NoInvoices")}
          </div>
        ) : (
          currentInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-accent dark:bg-accent_dark rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
            >
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-quicksand mb-1">
                    {t("Invoice")}
                  </div>
                  <div className="font-bold text-gray-800 dark:text-white font-quicksand text-base">
                    {invoice.id}
                  </div>
                </div>
                <span className={getStatusBadge(invoice.status)}>
                  {invoice.status}
                </span>
              </div>

              {/* Invoice Details */}
              <div className="space-y-2 mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-quicksand">
                    {t("Customer")}:
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white font-quicksand">
                    {invoice.customer}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-quicksand">
                    {t("Date")}:
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white font-quicksand">
                    {invoice.date}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-quicksand">
                    Amount:
                  </span>
                  <span className="text-base font-bold text-primary dark:text-primary_dark font-quicksand">
                    {invoice.amount}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => handleView(invoice)}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary/10 dark:bg-primary_dark/10 hover:bg-primary/20 dark:hover:bg-primary_dark/20 text-primary dark:text-primary_dark rounded-lg py-2 px-3 transition-colors font-quicksand text-sm font-medium"
                >
                  <img src={ViewIcon} alt="View" className="w-4 h-4" />
                  {t("View")}
                </button>
                <button
                  onClick={() => handleEdit(invoice)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg py-2 px-3 transition-colors font-quicksand text-sm font-medium"
                >
                  <img src={DetailsIcon} alt="Edit" className="w-4 h-4" />
                  {t("Edit")}
                </button>
                <button
                  onClick={() => handlePrint(invoice)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg py-2 px-3 transition-colors font-quicksand text-sm font-medium"
                >
                  <img src={PrintIcon} alt="Print" className="w-4 h-4" />
                  {t("Print")}
                </button>
                <button
                  onClick={() => {
                    setInvoiceToDelete(invoice);
                    setShowDeleteModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg py-2 px-3 transition-colors font-quicksand text-sm font-medium"
                >
                  <Trash2 size={16} />
                  {t("Delete")}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-background dark:bg-background_dark rounded-2xl shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-primary dark:text-primary_dark font-robotoCondensed">
                {t("confirmDelete")}
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setInvoiceToDelete(null);
                }}
                className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-all"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
              {t("deleteInvoiceConfirmationText")}
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setInvoiceToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 font-medium transition-all duration-500"
              >
                {t("cancel")}
              </button>

              <button
                onClick={async () => {
                  if (!invoiceToDelete) return;
                  try {
                    await deleteMutation.mutateAsync(invoiceToDelete._id || invoiceToDelete.id);
                    // Close modal
                    setShowDeleteModal(false);
                    setInvoiceToDelete(null);
                  } catch (err) {
                    // keep modal open and optionally show an error - for now close and log
                    console.error("Failed to delete invoice:", err);
                    setShowDeleteModal(false);
                    setInvoiceToDelete(null);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-all duration-500"
              >
                {deleteMutation.isLoading ? t("deleting") : t("confirmDelete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination - Always visible */}
      {invoices.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 gap-3">
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 sm:px-4 py-2 bg-accent rounded-lg text-xs sm:text-sm font-quicksand font-medium transition-all duration-300 flex items-center gap-2 ${
                currentPage === 1
                  ? "text-gray-400 bg-accent dark:text-gray-600 cursor-not-allowed dark:bg-gray-800"
                  : "text-gray-700 bg-accent dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-primary_dark/10 hover:text-primary dark:hover:text-primary_dark hover:scale-105 hover:shadow-md"
              }`}
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="hidden sm:inline">{t("Previous")}</span>
              <span className="sm:hidden">{t("Prev")}</span>
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm px-2 font-bold"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-quicksand font-bold transition-all duration-300 min-w-[36px] sm:min-w-[40px] hover:scale-110 ${
                    currentPage === page
                      ? "bg-gradient-to-r from-[#57A7B3] to-[#4a959f] dark:from-primary_dark dark:to-primary_dark/80 text-white shadow-lg scale-105"
                      : "text-gray-600 dark:text-gray-300 hover:bg-accent/50 dark:hover:bg-accent_dark/50 hover:text-primary dark:hover:text-primary_dark hover:shadow-md"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 sm:px-4 py-2 bg-accent rounded-lg text-xs sm:text-sm font-quicksand font-medium transition-all duration-300 flex items-center gap-2 ${
                currentPage === totalPages
                  ? "text-gray-400 bg-accent dark:text-gray-600 cursor-not-allowed dark:bg-gray-800"
                  : "text-gray-700 bg-accent dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-primary_dark/10 hover:text-primary dark:hover:text-primary_dark hover:scale-105 hover:shadow-md"
              }`}
            >
              <span className="hidden sm:inline">{t("Next")}</span>
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-quicksand font-medium text-center sm:text-right bg-accent/30 dark:bg-accent_dark/30 px-4 py-2 rounded-lg">
            <span className="hidden sm:inline">
              Showing {startIndex + 1}-{Math.min(endIndex, invoices.length)} of{" "}
              {invoices.length} invoices
            </span>
            <span className="sm:hidden">
              {startIndex + 1}-{Math.min(endIndex, invoices.length)} of{" "}
              {invoices.length}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

export default Table;
