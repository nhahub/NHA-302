import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown, X, Trash2, Save, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";
import { useTranslation } from "react-i18next";

const SystemManagement = ({ 
  usersData = [], 
  productsData = [], 
  customersData = [], 
  companiesData = [],
  isLoading = false 
}) => {
  const [selectedTarget, setSelectedTarget] = useState("Users");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const { t } = useTranslation();
  
  // Pagination and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Get items per page based on selected target
  const getItemsPerPage = () => {
    switch (selectedTarget) {
      case "Products":
        return 5;  // Show only 5 products per page
      default:
        return 10; // 10 items per page for other entities
    }
  };
  
  const itemsPerPage = getItemsPerPage();

  const targets = ["Users", "Products", "Customers", "Companies"];

  // Reset pagination and search when target changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery("");
  }, [selectedTarget]);

  // Determine which data to display based on selected target
  const getDisplayData = () => {
    switch (selectedTarget) {
      case "Users":
        return {
          data: usersData || [],
          isLoading,
          error: null,
        };
      case "Products":
        return {
          data: productsData || [],
          isLoading,
          error: null,
        };
      case "Customers":
        return {
          data: customersData || [],
          isLoading,
          error: null,
        };
      case "Companies":
        return {
          data: companiesData || [],
          isLoading,
          error: null,
        };
      default:
        return { data: [], isLoading: false, error: null };
    }
  };

  const { data, error } = getDisplayData();

  // Debug: Log data when it changes
  useEffect(() => {
    if (data && data.length > 0) {
      console.log(`${selectedTarget} data loaded:`, data.length, 'items');
    }
  }, [data, selectedTarget]);

  // Search and filter logic
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    
    return data.filter((item) => {
      switch (selectedTarget) {
        case "Users":
          return (
            (item.username?.toLowerCase().includes(query)) ||
            (item.email?.toLowerCase().includes(query)) ||
            (item.phone?.toLowerCase().includes(query))
          );
        case "Products":
          return (
            (item.title?.toLowerCase().includes(query)) ||
            (item.description?.toLowerCase().includes(query)) ||
            (item.category?.toLowerCase().includes(query)) ||
            (item.vendor?.toLowerCase().includes(query))
          );
        case "Customers":
          return (
            (item.name?.toLowerCase().includes(query)) ||
            (item.email?.toLowerCase().includes(query)) ||
            (item.phone?.toLowerCase().includes(query)) ||
            (item.address?.toLowerCase().includes(query))
          );
        case "Companies":
          return (
            (item.name?.toLowerCase().includes(query)) ||
            (item.invoicePrefix?.toLowerCase().includes(query)) ||
            (item.currency?.toLowerCase().includes(query))
          );
        default:
          return true;
      }
    });
  }, [data, searchQuery, selectedTarget]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Get display name for each item based on type
  const getItemName = (item) => {
    if (!item) return "N/A";

    switch (selectedTarget) {
      case "Users":
        return item.username || item.email || `User #${item._id}`;
      case "Products":
        return item.title || `Product #${item._id}`;
      case "Customers":
        return item.name || item.customerName || `Customer #${item._id}`;
      case "Companies":
        return item.name || `Company #${item._id}`;
      default:
        return "N/A";
    }
  };

  // Handle view item
  const handleView = (item) => {
    setSelectedItem(item);
    setEditedData(item);
    setEditMode(false);
    setViewModalOpen(true);
  };

  // Handle add new item
  const handleAdd = () => {
    const emptyData = getInitialData();
    setSelectedItem(emptyData);
    setEditedData(emptyData);
    setEditMode(true);
    setAddModalOpen(true);
  };

  // Get initial empty data for new items
  const getInitialData = () => {
    switch (selectedTarget) {
      case "Users":
        return {
          username: "",
          username_ar: "",
          email: "",
          phone: "",
          password: "",
          passwordConfirmation: "",
          role: "user",
          verified: false,
        };
      case "Products":
        return {
          title: "",
          description: "",
          descriptionAr: "",
          price: 0,
          discount: 0,
          quantity: 0,
          category: "",
          categoryAr: "",
          vendor: "",
          company: "",
        };
      case "Customers":
        return {
          name: "",
          email: "",
          phone: "",
          address: "",
          company: "",
        };
      case "Companies":
        return {
          name: "",
          invoicePrefix: "",
          currency: "USD",
          taxRate: 14,
          user: "",
        };
      default:
        return {};
    }
  };

  // Handle edit mode
  const handleEdit = () => {
    setEditMode(true);
  };

  // Handle save
  const handleSave = () => {
    // TODO: Implement save logic with appropriate API calls
    console.log("Saving data:", editedData);
    setEditMode(false);
    // After successful save, close modal
    // setViewModalOpen(false);
  };

  // Handle create new item
  const handleCreate = () => {
    // TODO: Implement create logic with appropriate API calls
    console.log("Creating new item:", editedData);
    setAddModalOpen(false);
    setEditedData({});
    // After successful creation, refresh data and close modal
  };

  // Handle delete
  const handleDelete = () => {
    // TODO: Implement delete logic with appropriate API calls
    console.log("Deleting item:", selectedItem);
    setViewModalOpen(false);
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get fields to display based on type
  const getDisplayFields = (item, isAddMode = false) => {
    if (!item) return [];

    switch (selectedTarget) {
      case "Users": {
        const userFields = [
          { label: "Username", key: "username", type: "text", required: true },
          { label: "Username (Arabic)", key: "username_ar", type: "text" },
          { label: "Email", key: "email", type: "email", required: true },
          { label: "Phone", key: "phone", type: "tel" },
          {
            label: "Role",
            key: "role",
            type: "select",
            options: ["user", "admin"],
          },
          { label: "Verified", key: "verified", type: "checkbox" },
        ];

        if (isAddMode) {
          userFields.push(
            {
              label: "Password",
              key: "password",
              type: "password",
              required: true,
            },
            {
              label: "Confirm Password",
              key: "passwordConfirmation",
              type: "password",
              required: true,
            },
            {
              label: "Company ID",
              key: "company",
              type: "text",
              placeholder: "Optional: Enter company ID",
            }
          );
        } else {
          userFields.push(
            {
              label: "Company ID",
              key: "company",
              type: "text",
              readOnly: true,
            },
            {
              label: "Google ID",
              key: "googleId",
              type: "text",
              readOnly: true,
            },
            {
              label: "Created At",
              key: "createdAt",
              type: "datetime",
              readOnly: true,
            },
            {
              label: "Updated At",
              key: "updatedAt",
              type: "datetime",
              readOnly: true,
            }
          );
        }

        return userFields;
      }
      case "Products": {
        const productFields = [
          { label: "Title", key: "title", type: "text", required: true },
          {
            label: "Description",
            key: "description",
            type: "textarea",
            required: true,
          },
          {
            label: "Description (Arabic)",
            key: "descriptionAr",
            type: "textarea",
          },
          {
            label: "Price",
            key: "price",
            type: "number",
            step: "0.01",
            required: true,
          },
          {
            label: "Discount (%)",
            key: "discount",
            type: "number",
            min: "0",
            max: "100",
          },
          {
            label: "Quantity",
            key: "quantity",
            type: "number",
            required: true,
          },
          { label: "Category", key: "category", type: "text", required: true },
          { label: "Category (Arabic)", key: "categoryAr", type: "text" },
          { label: "Vendor", key: "vendor", type: "text" },
        ];

        if (isAddMode) {
          productFields.push({
            label: "Company ID",
            key: "company",
            type: "text",
            required: true,
            placeholder: "Enter company ID",
          });
        } else {
          productFields.push(
            {
              label: "Price After Discount",
              key: "priceAfterDiscount",
              type: "number",
              readOnly: true,
            },
            { label: "Sold", key: "sold", type: "number", readOnly: true },
            {
              label: "Company ID",
              key: "company",
              type: "text",
              readOnly: true,
            },
            {
              label: "Created At",
              key: "createdAt",
              type: "datetime",
              readOnly: true,
            },
            {
              label: "Updated At",
              key: "updatedAt",
              type: "datetime",
              readOnly: true,
            }
          );
        }

        return productFields;
      }
      case "Customers": {
        const customerFields = [
          { label: "Customer Name", key: "name", type: "text", required: true },
          { label: "Email", key: "email", type: "email", required: true },
          { label: "Phone", key: "phone", type: "tel" },
          { label: "Address", key: "address", type: "text" },
        ];

        if (isAddMode) {
          customerFields.push({
            label: "Company ID",
            key: "company",
            type: "text",
            placeholder: "Optional: Enter company ID",
          });
        } else {
          customerFields.push(
            {
              label: "Total Orders",
              key: "totalOrders",
              type: "number",
              readOnly: true,
            },
            {
              label: "Total Purchases",
              key: "totalPurchases",
              type: "number",
              readOnly: true,
            },
            {
              label: "Company ID",
              key: "company",
              type: "text",
              readOnly: true,
            },
            {
              label: "Created At",
              key: "createdAt",
              type: "datetime",
              readOnly: true,
            },
            {
              label: "Updated At",
              key: "updatedAt",
              type: "datetime",
              readOnly: true,
            }
          );
        }

        return customerFields;
      }
      case "Companies": {
        const companyFields = [
          { label: "Company Name", key: "name", type: "text", required: true },
          {
            label: "Invoice Prefix",
            key: "invoicePrefix",
            type: "text",
            required: true,
          },
          { label: "Currency", key: "currency", type: "text", required: true },
          {
            label: "Tax Rate (%)",
            key: "taxRate",
            type: "number",
            min: "0",
            max: "100",
          },
        ];

        if (isAddMode) {
          companyFields.push({
            label: "User ID",
            key: "user",
            type: "text",
            required: true,
            placeholder: "Enter user ID",
          });
        } else {
          companyFields.push(
            { label: "User ID", key: "user", type: "text", readOnly: true },
            {
              label: "Created At",
              key: "createdAt",
              type: "datetime",
              readOnly: true,
            },
            {
              label: "Updated At",
              key: "updatedAt",
              type: "datetime",
              readOnly: true,
            }
          );
        }

        return companyFields;
      }
      default:
        return [];
    }
  };

  return (
    <div className="bg-accent dark:bg-accent_dark p-6 rounded-2xl shadow-md w-full max-w-4xl font-quicksand">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        {t("SystemManagement")}
      </h2>

      {/* Info Badge - Shows total count */}
      {data && data.length > 0 && (
        <div className="mb-4 inline-flex items-center gap-2 bg-primary/10 dark:bg-primary_dark/10 text-primary dark:text-primary_dark px-3 py-1 rounded-lg text-sm font-medium">
          <span>Total {selectedTarget}: {data.length}</span>
        </div>
      )}

      {/* Dropdown + Add */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative w-full">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex justify-between items-center w-full bg-secondary dark:bg-secondary_dark border border-primary dark:border-primary_dark rounded-lg px-4 py-2 text-gray-700 dark:text-white hover:border-blue-400 focus:outline-none"
          >
            {selectedTarget}
            <ChevronDown
              className={`transition-transform text-gray-700 dark:text-white ${
                dropdownOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {dropdownOpen && (
            <ul className="absolute mt-1 w-full bg-secondary dark:bg-secondary_dark border border-primary dark:border-primary_dark rounded-lg shadow-lg z-10">
              {targets.map((target) => (
                <li
                  key={target}
                  onClick={() => {
                    setSelectedTarget(target);
                    setDropdownOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-accent dark:hover:bg-accent_dark text-gray-700 dark:text-white cursor-pointer"
                >
                  {target}
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button
          onClick={handleAdd}
          className="bg-primary dark:bg-primary_dark before:bg-secondary dark:before:bg-secondary_dark text-white hover:text-black active:before:bg-secondary group"
        >
          {t("Add")}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            placeholder={`${t("Search")} ${selectedTarget.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full pl-10 pr-4 py-2 bg-background dark:bg-background_dark border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary_dark text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-background dark:bg-background_dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            {t("Loading")} {selectedTarget}...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl shadow-sm p-8 text-center">
          <p className="text-red-600 dark:text-red-400">
            {t("ErrorLoading")} {selectedTarget}: {error.message}
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <>
          <div className="bg-background dark:bg-background_dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-secondary dark:bg-secondary_dark border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="py-3 px-4 font-medium text-gray-600 dark:text-white">
                    {selectedTarget.slice(0, -1)} {t("Name")}
                  </th>
                  <th className="py-3 px-4 font-medium text-gray-600 dark:text-white text-center">
                    {t("Actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData && paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr
                      key={item._id || item.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-accent dark:hover:bg-accent_dark transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-800 dark:text-white">
                        {getItemName(item)}
                      </td>
                      <td className="py-3 px-4 flex justify-center gap-2">
                        <button
                          onClick={() => handleView(item)}
                          className="text-primary dark:text-primary_dark hover:underline font-medium"
                        >
                          {t("View")}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="2"
                      className="py-8 px-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      {searchQuery ? `No matching ${selectedTarget.toLowerCase()} found` : `No ${selectedTarget.toLowerCase()} found`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredData.length > 0 && (
            <div className="mt-4 flex items-center justify-between bg-background dark:bg-background_dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} {selectedTarget.toLowerCase()}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === 1
                      ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                      : "text-gray-700 dark:text-gray-300 hover:bg-accent dark:hover:bg-accent_dark"
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? "bg-primary dark:bg-primary_dark text-white"
                              : "text-gray-700 dark:text-gray-300 hover:bg-accent dark:hover:bg-accent_dark"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return (
                        <span key={pageNum} className="px-2 text-gray-400 dark:text-gray-600">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                      : "text-gray-700 dark:text-gray-300 hover:bg-accent dark:hover:bg-accent_dark"
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View/Edit Modal */}
      {viewModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-accent dark:bg-accent_dark rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                {editMode
                  ? `${t("Edit")} ${t(selectedTarget.slice(0, -1))}`
                  : `${t("View")} ${t(selectedTarget.slice(0, -1))}`}
              </h3>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setEditMode(false);
                }}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {getDisplayFields(selectedItem).map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {field.label}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={editedData[field.key] || ""}
                        onChange={(e) =>
                          handleInputChange(field.key, e.target.value)
                        }
                        disabled={!editMode || field.readOnly}
                        rows={3}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-black dark:text-white ${
                          editMode && !field.readOnly
                            ? "bg-background dark:bg-background_dark  border-gray-300"
                            : "bg-secondary dark:bg-secondary_dark border-gray-200 cursor-not-allowed"
                        }`}
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={editedData[field.key] || ""}
                        onChange={(e) =>
                          handleInputChange(field.key, e.target.value)
                        }
                        disabled={!editMode || field.readOnly}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-black dark:text-white ${
                          editMode && !field.readOnly
                            ? "bg-background dark:bg-background_dark border-gray-300"
                            : "bg-secondary dark:bg-secondary_dark border-gray-200 cursor-not-allowed"
                        }`}
                      >
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "checkbox" ? (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editedData[field.key] || false}
                          onChange={(e) =>
                            handleInputChange(field.key, e.target.checked)
                          }
                          disabled={!editMode || field.readOnly}
                          className="w-5 h-5 text-primary dark:text-primary_dark border-gray-300 rounded focus:ring-2 focus:ring-primary dark:focus:ring-primary_dark"
                        />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                          {editedData[field.key] ? "Yes" : "No"}
                        </span>
                      </div>
                    ) : field.type === "datetime" ? (
                      <input
                        type="text"
                        value={
                          editedData[field.key]
                            ? new Date(editedData[field.key]).toLocaleString()
                            : ""
                        }
                        disabled={true}
                        className="w-full px-4 py-2 border rounded-lg bg-secondary dark:bg-secondary_dark border-gray-200 cursor-not-allowed text-black dark:text-white"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={editedData[field.key] || ""}
                        onChange={(e) =>
                          handleInputChange(field.key, e.target.value)
                        }
                        disabled={!editMode || field.readOnly}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-black dark:text-white ${
                          editMode && !field.readOnly
                            ? "bg-background dark:bg-background_dark border-gray-300"
                            : "bg-secondary dark:bg-secondary_dark border-gray-200 cursor-not-allowed"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-secondary dark:bg-secondary_dark">
              <Button
                onClick={handleDelete}
                className="bg-red-500 before:bg-red-700 text-white hover:text-white w-auto px-6"
              >
                <Trash2 size={18} className="inline mr-2" />
                {t("Delete")}
              </Button>
              <div className="flex gap-3">
                {!editMode ? (
                  <Button
                    onClick={handleEdit}
                    className="bg-primary dark:bg-primary_dark before:bg-accent dark:before:bg-accent_dark text-white hover:text-black active:before:bg-secondary group"
                  >
                    <p className="group-hover:text-black">Edit</p>
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        setEditMode(false);
                        setEditedData(selectedItem);
                      }}
                      className="bg-transparent before:bg-accent text-white active:before:bg-secondary group"
                    >
                      <p className="text-black dark:text-white">Cancel</p>
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-primary dark:bg-primary_dark before:bg-accent dark:before:bg-accent_dark text-white hover:text-black active:before:bg-secondary group"
                    >
                      <Save size={18} className="inline mr-2" />
                      <p className="group-hover:text-black dark:group-hover:text-white">
                        Save
                      </p>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {addModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-accent dark:bg-accent_dark rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                {t("AddNew")} {selectedTarget.slice(0, -1)}
              </h3>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setEditedData({});
                }}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {getDisplayFields(selectedItem, true).map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={editedData[field.key] || ""}
                        onChange={(e) =>
                          handleInputChange(field.key, e.target.value)
                        }
                        required={field.required}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 bg-background dark:bg-background_dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-black dark:text-white"
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={editedData[field.key] || ""}
                        onChange={(e) =>
                          handleInputChange(field.key, e.target.value)
                        }
                        required={field.required}
                        className="w-full px-4 py-2 border border-gray-300 bg-background dark:bg-background_dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-black dark:text-white"
                      >
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "checkbox" ? (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editedData[field.key] || false}
                          onChange={(e) =>
                            handleInputChange(field.key, e.target.checked)
                          }
                          className="w-5 h-5 dark:text-white text-primary  border-gray-300 rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-gray-600 dark:text-white">
                          {editedData[field.key] ? "Yes" : "No"}
                        </span>
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        value={editedData[field.key] || ""}
                        onChange={(e) =>
                          handleInputChange(field.key, e.target.value)
                        }
                        required={field.required}
                        placeholder={field.placeholder}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        className="w-full px-4 py-2 border border-gray-300 bg-background dark:bg-background_dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary_dark transition-all text-black dark:text-white"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-secondary dark:bg-secondary_dark">
              <Button
                onClick={() => {
                  setAddModalOpen(false);
                  setEditedData({});
                }}
                className="bg-transparent before:bg-accent dark:before:bg-accent_dark  dark:text-white hover:text-black dark:hover:text-white text-white active:before:bg-secondary group"
              >
                <p className="text-black dark:text-white">{t("Cancel")}</p>
              </Button>
              <Button
                onClick={handleCreate}
                className="bg-primary dark:bg-primary_dark before:bg-accent dark:before:bg-accent_dark text-white hover:text-black active:before:bg-secondary dark:active:before:bg-secondary_dark group"
              >
                <Save size={18} className="inline mr-2" />
                <p className="group-hover:text-black dark:group-hover:text-white">
                  {t("Create")}
                </p>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemManagement;
