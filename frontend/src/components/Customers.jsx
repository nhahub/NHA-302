import React, { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import Button from "./ui/Button";
import {
  useCustomerByCompany,
  useDeleteCustomer,
} from "../features/customer/useCustomerQuery";
import Loader from "./Loader";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

function Customers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 5;
  const [openItems, setOpenItems] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  
  // Filter & Sort States
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [filters, setFilters] = useState({
    purchasesMin: "",
    purchasesMax: "",
    ordersMin: "",
  });

  const userData = JSON.parse(localStorage.getItem("user"));
  const companyId = userData?.company;

  const { data, isLoading, error } = useCustomerByCompany(companyId);
  const { mutate: deleteCustomer } = useDeleteCustomer();

  // Toggle customer details / modal
  const toggleCustomer = (id) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleModal = (id, value) => {
    setOpenItems((prev) => ({ ...prev, [`modal-${id}`]: value }));
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSortFromModal = (key) => {
    handleSort(key);
    setShowSortModal(false);
  };

  const handleApplyFilters = () => {
    setShowFilterModal(false);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      purchasesMin: "",
      purchasesMax: "",
      ordersMin: "",
    });
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters =
    filters.purchasesMin ||
    filters.purchasesMax ||
    filters.ordersMin;

  // Early returns for loading and error states
  if (isLoading) return <Loader />;
  if (error)
    return (
      <p className="text-red-500 text-center pt-28">
        {t("ErrorFetchingCustomers")}
      </p>
    );

  // Extract customers data
  const customers = Array.isArray(data?.data?.customers)
    ? data.data.customers
    : [];

  // Search filter
  const searchFilteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply filters
  const filteredCustomers = searchFilteredCustomers.filter((customer) => {
    // Purchases filter
    if (
      filters.purchasesMin &&
      parseFloat(customer.purchases || 0) < parseFloat(filters.purchasesMin)
    ) {
      return false;
    }
    if (
      filters.purchasesMax &&
      parseFloat(customer.purchases || 0) > parseFloat(filters.purchasesMax)
    ) {
      return false;
    }

    // Orders filter
    if (filters.ordersMin && (customer.orders || 0) < parseInt(filters.ordersMin)) {
      return false;
    }

    return true;
  });

  // Sorting
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue, bValue;

    switch (sortConfig.key) {
      case "name":
        aValue = a.name?.toLowerCase() || "";
        bValue = b.name?.toLowerCase() || "";
        break;
      case "email":
        aValue = a.email?.toLowerCase() || "";
        bValue = b.email?.toLowerCase() || "";
        break;
      case "purchases":
        aValue = parseFloat(a.purchases) || 0;
        bValue = parseFloat(b.purchases) || 0;
        break;
      case "orders":
        aValue = parseInt(a.orders) || 0;
        bValue = parseInt(b.orders) || 0;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const indexOfLast = currentPage * customersPerPage;
  const indexOfFirst = indexOfLast - customersPerPage;
  const currentCustomers = sortedCustomers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedCustomers.length / customersPerPage);

  return (
    <div className="bg-background dark:bg-background_dark w-full h-full">
      {/* Header */}
      <section className="bg-secondary dark:bg-secondary_dark w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 sm:pb-6 lg:pb-0 px-3 pt-3 lg:pt-0">
        <h1 className="font-robotoCondensed font-extrabold text-2xl sm:text-3xl lg:text-4xl text-primary dark:text-primary_dark">{t("Customers")}</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative w-full lg:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search Customer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 pl-10 pr-4 py-2 w-full rounded-full focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary_dark focus:border-transparent font-quicksand text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          {/* Filter Button */}
          <button
            onClick={() => setShowFilterModal(true)}
            className="relative flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary_dark font-quicksand cursor-pointer text-gray-900 dark:text-white"
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
            className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary_dark font-quicksand cursor-pointer text-gray-900 dark:text-white"
          >
            <span>{t("SortBy")}</span>
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          
          {/* Add Customer Button */}
          <Button 
            className="flex items-center justify-center gap-2 !bg-primary dark:!bg-primary_dark !text-white hover:!bg-accent dark:hover:!bg-accent_dark hover:!text-black dark:hover:!text-white !border-primary dark:!border-primary_dark hover:!border-accent dark:hover:!border-accent_dark before:!bg-accent dark:before:!bg-accent_dark w-48"
            onClick={() => navigate("customer/add")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
            {t("AddCustomer")}
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
                Filter Customers
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
              {/* Purchases Range */}
              <div>
                <label className="block text-sm font-medium mb-2 text-[#1f2e40]">
                  {t("Purchases")} Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.purchasesMin}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        purchasesMin: e.target.value,
                      }))
                    }
                    className="w-full border-2 border-background rounded-xl p-2 bg-secondary focus:outline-none focus:border-primary"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.purchasesMax}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        purchasesMax: e.target.value,
                      }))
                    }
                    className="w-full border-2 border-background rounded-xl p-2 bg-secondary focus:outline-none focus:border-primary"
                    min="0"
                  />
                </div>
              </div>

              {/* Orders Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-[#1f2e40]">
                  Minimum {t("OrdersQTY")}
                </label>
                <input
                  type="number"
                  placeholder="Min orders quantity"
                  value={filters.ordersMin}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      ordersMin: e.target.value,
                    }))
                  }
                  className="w-full border-2 border-background rounded-xl p-2 bg-secondary focus:outline-none focus:border-primary"
                  min="0"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClearFilters}
                className="flex-1 px-4 py-2 bg-secondary text-[#1f2e40] rounded-xl hover:bg-gray-300 font-medium transition-all duration-500"
              >
                {t("Clear")} All
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-secondary hover:text-primary font-medium transition-all duration-500"
              >
                Apply {t("Filter")}s
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
                Sort Customers
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
                onClick={() => handleSortFromModal("name")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                  sortConfig.key === "name"
                    ? "bg-primary text-white"
                    : "bg-accent hover:bg-secondary"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Name</span>
                  {sortConfig.key === "name" && (
                    <span className="text-sm">
                      {sortConfig.direction === "asc" ? "A → Z" : "Z → A"}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleSortFromModal("email")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                  sortConfig.key === "email"
                    ? "bg-primary text-white"
                    : "bg-accent hover:bg-secondary"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Email</span>
                  {sortConfig.key === "email" && (
                    <span className="text-sm">
                      {sortConfig.direction === "asc" ? "A → Z" : "Z → A"}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleSortFromModal("purchases")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                  sortConfig.key === "purchases"
                    ? "bg-primary text-white"
                    : "bg-accent hover:bg-secondary"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t("Purchases")}</span>
                  {sortConfig.key === "purchases" && (
                    <span className="text-sm">
                      {sortConfig.direction === "asc"
                        ? "Low → High"
                        : "High → Low"}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleSortFromModal("orders")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                  sortConfig.key === "orders"
                    ? "bg-primary text-white"
                    : "bg-accent hover:bg-secondary"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t("OrdersQTY")}</span>
                  {sortConfig.key === "orders" && (
                    <span className="text-sm">
                      {sortConfig.direction === "asc"
                        ? "Low → High"
                        : "High → Low"}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb Section */}
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
                {t("Customers")}
              </span>
            </p>
          </div>
        </section>

        {/* Table View */}
        <section className="overflow-x-auto hidden sm:block">
          <div className="w-full">
            <div className="grid grid-cols-6 gap-4 bg-secondary dark:bg-secondary_dark text-black dark:text-white text-sm font-semibold font-quicksand px-6 py-3 rounded-lg mb-3">
              <div>{t("Customer")}</div>
              <div>{t("ContactInfo")}</div>
              <div>{t("Purchases")}</div>
              <div>{t("OrdersQTY")}</div>
              <div>{t("Address")}</div>
              <div>{t("Actions")}</div>
            </div>

            {currentCustomers.length > 0 ? (
              currentCustomers.map((customer) => (
                <div
                  key={customer._id}
                  className="grid grid-cols-6 gap-4 items-center bg-accent dark:bg-accent_dark shadow-sm rounded-2xl px-6 py-4 mb-3 hover:shadow-md transition-all duration-300"
                >
                  <div>
                    <p className="text-xs text-primary dark:text-primary_dark font-quicksand">
                      {t("ID")} {customer._id}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white font-quicksand">
                      {customer.name}
                    </p>
                  </div>
                  <div className="text-gray-900 dark:text-gray-300 text-sm font-quicksand">
                    {customer.email} <br /> {customer.phone}
                  </div>
                  <div className="text-gray-900 dark:text-gray-300 text-sm font-quicksand">
                    $ {customer.purchases || 0}
                  </div>
                  <div className="text-gray-900 dark:text-gray-300 text-sm font-quicksand">
                    {customer.orders || 0}
                  </div>
                  <div className="text-gray-900 dark:text-gray-300 text-sm truncate font-quicksand">
                    {customer.address || "-"}
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      to={`customer/view/${customer._id}`}
                      state={{ Customer: customer }}
                    >
                      <FaEye className="w-5 h-5 inline text-primary dark:text-primary_dark" />
                    </Link>
                    <button
                      onClick={() =>
                        navigate(`customer/edit/${customer._id}`, {
                          state: { Customer: customer },
                        })
                      }
                    >
                      <FaEdit className="w-5 h-5 inline text-primary dark:text-primary_dark" />
                    </button>
                    <button onClick={() => toggleModal(customer._id, true)}>
                      <FaTrash className="w-4 h-4 inline text-primary dark:text-primary_dark" />
                    </button>

                    {/* Desktop Delete Modal */}
                    {openItems[`modal-${customer._id}`] && (
                      <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex justify-center items-center z-50">
                        <div className="bg-background dark:bg-background_dark rounded-2xl shadow-xl w-[90%] sm:w-[400px] p-6 relative transition-all duration-300 border border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => toggleModal(customer._id, false)}
                            className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-all duration-200"
                          >
                            <X
                              size={22}
                              className="rounded-2xl border-red-800 border-2 text-red-800 hover:text-red-900 hover:border-red-900 transition-all duration-300 ease-in-out"
                            />
                          </button>

                          <div className="text-center space-y-4 mt-2">
                            <h3 className="text-lg font-semibold text-black">
                              {t("DeleteCustomer")}
                            </h3>
                            <p className="text-sm text-gray-700">
                              {t("ModalCustomerDelete")} <b>{customer.name}</b>?
                            </p>

                            <div className="flex justify-center gap-4 pt-4">
                              <button
                                onClick={() => toggleModal(customer._id, false)}
                                className="px-4 py-2 bg-secondary text-black rounded-md hover:bg-gray-300 transition"
                              >
                                {t("Cancel")}
                              </button>

                              <button
                                onClick={() => {
                                  deleteCustomer(customer._id, {
                                    onSuccess: () => {
                                      toast.success(
                                        "Customer deleted successfully"
                                      );
                                      toggleModal(customer._id, false);
                                    },
                                    onError: (err) => {
                                      toast.error(
                                        err?.response?.data?.message ||
                                          "Failed to delete customer"
                                      );
                                    },
                                  });
                                }}
                                className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition"
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
            ) : (
              <p className="text-gray-500 text-center">
                {t("NoCustomerFound")}
              </p>
            )}
          </div>
        </section>

        {/* Mobile View */}
        <section className="sm:hidden">
          {currentCustomers.map((customer) => (
            <div
              key={customer._id}
              className="relative w-full border-b border-gray-200 "
            >
              <div className="flex justify-between items-center w-full py-3 px-4">
                <div className="flex gap-3 items-center">
                  <div>
                    <p className="text-xs text-primary">ID {customer._id}</p>
                    <p>{customer.name}</p>
                  </div>
                </div>
                <button onClick={() => toggleCustomer(customer._id)}>
                  <FaChevronDown
                    className={`w-5 h-5 transition-transform ${
                      openItems[customer._id] ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {openItems[customer._id] && (
                <div className="bg-accent w-full rounded-lg p-4 mt-1">
                  <div className="text-gray-900 text-sm mb-2 flex gap-2">
                    <span className="text-gray-500">Contact: </span>
                    <div className="flex flex-col flex-1 break-words">
                      {customer.email} <br /> {customer.phone}
                    </div>
                  </div>
                  <div className="text-gray-900 text-sm mb-2 gap-2">
                    <span className="text-gray-500">Purchases: </span>${" "}
                    {customer.purchases || 0}
                  </div>
                  <div className="text-gray-900 text-sm mb-2 gap-2">
                    <span className="text-gray-500">Orders QTY: </span>
                    {customer.orders || 0}
                  </div>
                  <div className="text-gray-900 text-sm mb-2 flex gap-2">
                    <span className="text-gray-500">Address: </span>
                    <span className="flex flex-col flex-1 break-words">
                      {customer.address || "-"}
                    </span>
                  </div>
                  <div className="flex gap-2 text-gray-900 text-sm mb-2">
                    <span className="text-gray-500">Actions: </span>
                    <div className="flex gap-4">
                      <Link
                        to={`/Users/Customers/view-Customer/${customer._id}`}
                        state={{ Customer: customer }}
                      >
                        <FaEye className="w-5 h-5 inline text-primary" />
                      </Link>
                      <button
                        onClick={() =>
                          navigate(`customer/edit/${customer._id}`, {
                            state: { Customer: customer },
                          })
                        }
                      >
                        <FaEdit className="w-5 h-5 inline text-primary" />
                      </button>
                      <button onClick={() => toggleModal(customer._id, true)}>
                        <FaTrash className="w-4 h-4 inline text-primary" />
                      </button>

                      {/* Mobile Delete Modal */}
                      {openItems[`modal-${customer._id}`] && (
                        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                          <div className="bg-background rounded-2xl shadow-xl w-[90%] sm:w-[400px] p-6 relative transition-all duration-300">
                            <button
                              onClick={() => toggleModal(customer._id, false)}
                              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition-all duration-200"
                            >
                              <X
                                size={22}
                                className="rounded-2xl border-red-800 border-2 text-red-800 hover:text-red-900 hover:border-red-900 transition-all duration-300 ease-in-out"
                              />
                            </button>

                            <div className="text-center space-y-4 mt-2">
                              <h3 className="text-lg font-semibold text-black">
                                {t("DeleteCustomer")}
                              </h3>
                              <p className="text-sm text-gray-700">
                                {t("ModalCustomerDelete")}{" "}
                                <b>{customer.name}</b>?
                              </p>

                              <div className="flex justify-center gap-4 pt-4">
                                <button
                                  onClick={() =>
                                    toggleModal(customer._id, false)
                                  }
                                  className="px-4 py-2 bg-secondary text-black rounded-md hover:bg-gray-300 transition"
                                >
                                  {t("Cancel")}
                                </button>

                                <button
                                  onClick={() => {
                                    deleteCustomer(customer._id, {
                                      onSuccess: () => {
                                        toast.success(
                                          "Customer deleted successfully"
                                        );
                                        toggleModal(customer._id, false);
                                      },
                                      onError: (err) => {
                                        toast.error(
                                          err?.response?.data?.message ||
                                            "Failed to delete customer"
                                        );
                                      },
                                    });
                                  }}
                                  className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition"
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
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            className="px-2 py-2 bg-secondary border-2 border-primary rounded-xl disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <FaChevronLeft className="text-primary" />
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
                hover:before:translate-x-full ${
                  p === currentPage
                    ? "bg-primary text-white border-2 border-primary"
                    : "bg-transparent text-[#1f2e40] border-2 border-primary hover:bg-primary hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            className="px-2 py-2 bg-secondary border-2 border-primary rounded-xl disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <FaChevronRight className="text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Customers;
