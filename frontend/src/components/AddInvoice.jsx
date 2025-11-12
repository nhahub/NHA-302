import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import arrowicon from "../assets/open-arrow-icon.png";
import Button from "./ui/Button";
import {
  useCreateInvoice,
  useUpdateInvoice,
  useInvoice,
} from "../features/invoice/useInvoiceQuery";
import { useCustomerByCompany } from "../features/customer/useCustomerQuery";
import { getProductsByCompany } from "../api/product";
import { useUserContext } from "../features/user/useUserContext";
import { CompanyContext } from "../features/company/CompanyContext";
import Loader from "./Loader";
// toast intentionally not used in this component
import { useTranslation } from "react-i18next";

function AddInvoice() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useUserContext();
  const { currentCompany } = useContext(CompanyContext) || {};
  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoice();

  // Check if we're in edit mode
  const isEditMode = location.pathname.includes("/edit/");
  const editInvoiceId = isEditMode
    ? location.pathname.split("/edit/")[1]
    : null;

  // Fetch invoice data if in edit mode
  const { data: invoiceResponse, isLoading: invoiceLoading } =
    useInvoice(editInvoiceId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [dataRestored, setDataRestored] = useState(false);

  // Search states
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  // Get company ID (prefer CompanyContext, then currentUser, then stored company)
  const storedCompany = JSON.parse(localStorage.getItem("company"));
  const companyId =
    currentCompany?._id || currentUser?.company || storedCompany?._id || storedCompany?.id || "";

  // Fetch customers using the hook
  const { data: customersData, isLoading: customersLoading } =
    useCustomerByCompany(companyId);

  // Extract customers from the response
  const customers = Array.isArray(customersData?.data?.customers)
    ? customersData.data.customers
    : [];

  // Filter customers based on search
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Filter products based on search
  const filteredProducts = products.filter(
    (product) =>
      product.title?.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.description
        ?.toLowerCase()
        .includes(productSearch.toLowerCase()) ||
      product.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Get quick action data from navigation state
  const quickActionData = location.state?.quickActionData;

  // Initialize form state following the invoice schema
  const [formData, setFormData] = useState({
    invoiceId: "",
    orderDate:
      quickActionData?.orderDate || new Date().toISOString().split("T")[0],
    dueDate: quickActionData?.dueDate || "",
    status: "Pending",
    paymentMethod: quickActionData?.paymentMethod || "Cash",
    subTotal: 0,
    total: 0,
    discount: 0,
    products: [], // Array of { product: productId, quantity: number }
    customer: "", // Customer ID
    company: companyId || "", // Automatically set from CompanyContext/user
  });

  // Selected products with full details for display
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Load invoice data if in edit mode
  useEffect(() => {
    if (isEditMode && invoiceResponse && !invoiceLoading) {
      const invoice =
        invoiceResponse.data?.invoice ||
        invoiceResponse.data ||
        invoiceResponse;

      if (invoice) {
        // Set form data from invoice
        setFormData({
          invoiceId: invoice.invoiceId,
          orderDate: invoice.orderDate
            ? new Date(invoice.orderDate).toISOString().split("T")[0]
            : "",
          dueDate: invoice.dueDate
            ? new Date(invoice.dueDate).toISOString().split("T")[0]
            : "",
          status: invoice.status || "Pending",
          paymentMethod: invoice.paymentMethod || "Cash",
          subTotal: invoice.subTotal || 0,
          total: invoice.total || 0,
          discount: invoice.discount || 0,
          products:
            invoice.products?.map((p) => ({
              product: p.product?._id || p.product,
              quantity: p.quantity,
            })) || [],
          customer: invoice.customer?._id || invoice.customer || "",
          company: companyId || "",
        });

        // Set selected products with full details
        if (invoice.products && invoice.products.length > 0) {
          // Check if products are populated (object) or just IDs (string)
          const firstProduct = invoice.products[0]?.product;
          const isPopulated =
            typeof firstProduct === "object" && firstProduct !== null;

          if (isPopulated) {
            // Products are already populated with details
            const productsWithDetails = invoice.products.map((p) => ({
              _id: p.product._id,
              title: p.product.title || p.product.name || "Product",
              description: p.product.description || "",
              price: p.product.priceAfterDiscount || p.product.price || 0,
              priceAfterDiscount: p.product.priceAfterDiscount,
              quantity: p.product.quantity || 0,
              stockQuantity: p.product.quantity || 0,
              invoiceQuantity: p.quantity || 1,
              imgCover: p.product.imgCover,
            }));
            setSelectedProducts(productsWithDetails);
          } else {
            // Products are just IDs - need to fetch details
            const fetchProductDetails = async () => {
              try {
                const productsData = await getProductsByCompany(companyId);
                const allProducts = productsData?.data?.products || [];

                // Match invoice products with full product details
                const productsWithDetails = invoice.products.map((p) => {
                  const productId =
                    typeof p.product === "string" ? p.product : p.product?._id;
                  const fullProduct = allProducts.find(
                    (prod) => prod._id === productId
                  );

                  if (fullProduct) {
                    return {
                      _id: fullProduct._id,
                      title: fullProduct.title || fullProduct.name || "Product",
                      description: fullProduct.description || "",
                      price:
                        fullProduct.priceAfterDiscount ||
                        fullProduct.price ||
                        0,
                      priceAfterDiscount: fullProduct.priceAfterDiscount,
                      quantity: fullProduct.quantity || 0,
                      stockQuantity: fullProduct.quantity || 0,
                      invoiceQuantity: p.quantity || 1,
                      imgCover: fullProduct.imgCover,
                    };
                  }

                  // Fallback if product not found
                  return {
                    _id: productId,
                    title: "Product",
                    description: "",
                    price: 0,
                    priceAfterDiscount: 0,
                    quantity: 0,
                    stockQuantity: 0,
                    invoiceQuantity: p.quantity || 1,
                    imgCover: "",
                  };
                });

                setSelectedProducts(productsWithDetails);
              } catch (error) {
                console.error("Error fetching product details:", error);
                // Set products with minimal info if fetch fails
                const productsWithDetails = invoice.products.map((p) => ({
                  _id:
                    typeof p.product === "string"
                      ? p.product
                      : p.product?._id || "",
                  title: "Product",
                  description: "",
                  price: 0,
                  priceAfterDiscount: 0,
                  quantity: 0,
                  stockQuantity: 0,
                  invoiceQuantity: p.quantity || 1,
                  imgCover: "",
                }));
                setSelectedProducts(productsWithDetails);
              }
            };

            fetchProductDetails();
          }
        }

        setDataRestored(true);
      }
    }
  }, [isEditMode, invoiceResponse, invoiceLoading, companyId]);

  // Load saved invoice data from sessionStorage on mount (only if not in edit mode)
  useEffect(() => {
    if (isEditMode) return; // Skip if in edit mode

    const savedInvoiceData = sessionStorage.getItem("invoiceData");
    const savedSelectedProducts = sessionStorage.getItem("selectedProducts");

    if (savedInvoiceData) {
      const parsedData = JSON.parse(savedInvoiceData);
      setFormData((prev) => ({
        ...prev,
        ...parsedData,
        company: companyId || "",
      }));
      setDataRestored(true);
    }

    if (savedSelectedProducts) {
      const parsedProducts = JSON.parse(savedSelectedProducts);
      setSelectedProducts(parsedProducts);

      // Rebuild the products array in formData from selectedProducts
      const productsArray = parsedProducts.map((p) => ({
        product: p._id,
        quantity: p.invoiceQuantity || 1,
      }));

      setFormData((prev) => ({
        ...prev,
        products: productsArray,
      }));

      setDataRestored(true);
    }

    // Clear the return flag after restoring
    sessionStorage.removeItem("returnToInvoice");
  }, [companyId, isEditMode]);

  // Save invoice data to sessionStorage whenever it changes
  useEffect(() => {
    if (
      formData.invoiceId ||
      formData.customer ||
      formData.products.length > 0
    ) {
      sessionStorage.setItem("invoiceData", JSON.stringify(formData));
    }
  }, [formData]);

  // Save selected products to sessionStorage whenever they change
  useEffect(() => {
    if (selectedProducts.length > 0) {
      sessionStorage.setItem(
        "selectedProducts",
        JSON.stringify(selectedProducts)
      );
    }
  }, [selectedProducts]);

  // Load products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      if (!companyId) return;

      setLoading(true);
      try {
        const productsData = await getProductsByCompany(companyId);
        console.log("Products Response:", productsData);

        // Extract products from the response
        // The API returns: { status: 'success', results: 2, data: { products: [...] } }
        let extractedProducts = [];

        if (
          productsData?.data?.products &&
          Array.isArray(productsData.data.products)
        ) {
          // Handle response structure: { data: { products: [...] } }
          extractedProducts = productsData.data.products.map((item) => ({
            ...item,
            stockQuantity: item.quantity,
          }));
        } else if (productsData?.data && Array.isArray(productsData.data)) {
          // Handle response structure: { data: [...] }
          extractedProducts = productsData.data.map((item) => {
            if (item.product) {
              return {
                ...item.product,
                _id: item.product._id || item._id,
                stockQuantity: item.product.quantity,
              };
            }
            return {
              ...item,
              stockQuantity: item.quantity,
            };
          });
        } else if (
          productsData?.products &&
          Array.isArray(productsData.products)
        ) {
          // Handle if the response has a 'products' key directly
          extractedProducts = productsData.products.map((item) => ({
            ...item,
            stockQuantity: item.quantity,
          }));
        } else if (Array.isArray(productsData)) {
          // Handle if the response is directly an array
          extractedProducts = productsData.map((item) => ({
            ...item,
            stockQuantity: item.quantity,
          }));
        }

        console.log("Extracted Products:", extractedProducts);
        setProducts(extractedProducts);
      } catch (err) {
        setError("Failed to load products");
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [companyId]);

  // Calculate totals whenever products or discount changes
  useEffect(() => {
    const subTotal = selectedProducts.reduce((sum, item) => {
      const price = item.priceAfterDiscount || item.price || 0;
      return sum + price * item.invoiceQuantity;
    }, 0);

    const total = subTotal - formData.discount;

    setFormData((prev) => ({
      ...prev,
      subTotal: subTotal,
      total: total > 0 ? total : 0,
    }));
  }, [selectedProducts, formData.discount]);

  // Add product to invoice
  const handleAddProduct = (product) => {
    const existingIndex = selectedProducts.findIndex(
      (p) => p._id === product._id
    );

    if (existingIndex >= 0) {
      // Update quantity if product already exists
      const updated = [...selectedProducts];
      updated[existingIndex].invoiceQuantity += 1;
      setSelectedProducts(updated);
    } else {
      // Add new product with proper price field
      setSelectedProducts([
        ...selectedProducts,
        {
          ...product,
          invoiceQuantity: 1, // Quantity for this invoice
          stockQuantity: product.quantity, // Available stock
          price: product.priceAfterDiscount || product.price || 0,
        },
      ]);
    }

    // Update formData.products array
    const productEntry = formData.products.find(
      (p) => p.product === product._id
    );
    if (productEntry) {
      setFormData((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.product === product._id ? { ...p, quantity: p.quantity + 1 } : p
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        products: [...prev.products, { product: product._id, quantity: 1 }],
      }));
    }
  };

  // Update product quantity
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveProduct(productId);
      return;
    }

    setSelectedProducts((prev) =>
      prev.map((p) =>
        p._id === productId ? { ...p, invoiceQuantity: newQuantity } : p
      )
    );

    setFormData((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.product === productId ? { ...p, quantity: newQuantity } : p
      ),
    }));
  };

  // Remove product from invoice
  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p._id !== productId));
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.product !== productId),
    }));
  };

  // Handle form submission (Create or Update)
  const handleCreateInvoice = async () => {
    // Debug logging
    console.log("Form Data:", formData);
    console.log("Selected Products:", selectedProducts);
    console.log("Products Array:", formData.products);
    console.log("Is Edit Mode:", isEditMode);

    // Validation
    if (!formData.invoiceId) {
      setError("Invoice ID is required");
      return;
    }
    if (!formData.orderDate) {
      setError("Order date is required");
      return;
    }
    if (!formData.dueDate) {
      setError("Due date is required");
      return;
    }
    if (!formData.customer) {
      setError("Please select a customer");
      return;
    }
    if (selectedProducts.length === 0 || formData.products.length === 0) {
      setError(
        `Please add at least one product to the invoice. (Selected: ${selectedProducts.length}, In Form: ${formData.products.length})`
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isEditMode && editInvoiceId) {
        // Update existing invoice
        console.log("Updating invoice with ID:", editInvoiceId);
        await updateInvoiceMutation.mutateAsync({
          id: editInvoiceId,
          data: formData,
        });
        alert("Invoice updated successfully!");
      } else {
        // Create new invoice
        console.log("Creating new invoice:", formData);
        await createInvoiceMutation.mutateAsync(formData);
        // Clear saved data after successful creation
        sessionStorage.removeItem("invoiceData");
        sessionStorage.removeItem("selectedProducts");
        alert("Invoice created successfully!");
      }
      navigate("/dashboard/invoice");
    } catch (err) {
      console.error(
        `Invoice ${isEditMode ? "update" : "creation"} error:`,
        err
      );

      // Handle different error types
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError(
          `Failed to ${
            isEditMode ? "update" : "create"
          } invoice. Please try again.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Navigate to add product and save current invoice data
  const handleNavigateToAddProduct = () => {
    sessionStorage.setItem("invoiceData", JSON.stringify(formData));
    sessionStorage.setItem(
      "selectedProducts",
      JSON.stringify(selectedProducts)
    );
    sessionStorage.setItem("returnToInvoice", "true");
    navigate("/dashboard/product/product/add");
  };

  // Navigate to add customer and save current invoice data
  const handleNavigateToAddCustomer = () => {
    sessionStorage.setItem("invoiceData", JSON.stringify(formData));
    sessionStorage.setItem(
      "selectedProducts",
      JSON.stringify(selectedProducts)
    );
    sessionStorage.setItem("returnToInvoice", "true");
    navigate("/dashboard/customer/customer/add");
  };

  // Clear all invoice data
  const handleClearForm = () => {
    if (window.confirm("Are you sure you want to clear all invoice data?")) {
      setFormData({
        invoiceId: "",
        orderDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        status: "Pending",
        paymentMethod: "Cash",
        subTotal: 0,
        total: 0,
        discount: 0,
        products: [],
        customer: "",
          company: companyId || "",
      });
      setSelectedProducts([]);
      sessionStorage.removeItem("invoiceData");
      sessionStorage.removeItem("selectedProducts");
      setError("");
      setDataRestored(false);
    }
  };

  return (
    <>
      {/* Loading state for invoice fetch in edit mode */}
      {isEditMode && invoiceLoading && (
        <div className="w-3/4 mx-auto mt-20 mb-5 flex justify-center items-center py-20">
          <Loader />
        </div>
      )}

      {(!isEditMode || (isEditMode && !invoiceLoading)) && (
        <>
          {/* Breadcrumb Section */}
          <div className="md:p-5 mt-5">
            <section className="pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="font-robotoCondensed font-extrabold text-4xl text-primary">
                  {isEditMode ? "Edit Invoice" : "Add Invoice"}
                </h1>
                <p>
                  <Link
                    to="/dashboard"
                    className="relative text-sm font-quicksand group  text-black dark:text-gray-300"
                  >
                    {t("Home")}
                    <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-primary dark:bg-gray-300 transition-all duration-500 group-hover:w-full" />
                  </Link>{" "}
                  /{" "}
                  <Link
                    to="/dashboard/invoice"
                    className="relative text-sm font-quicksand group text-black dark:text-gray-300"
                  >
                    {t("Invoices")}
                    <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-primary dark:bg-gray-300 transition-all duration-500 group-hover:w-full" />
                  </Link>{" "}
                  /{" "}
                  <span className="text-sm font-quicksand text-primary dark:text-primary_dark">
                    {isEditMode ? t("Edit") : t("Add")}
                  </span>
                </p>
              </div>
            </section>
          </div>

          <section className="bg-accent dark:bg-accent_dark w-full px-4 sm:w-11/12 lg:w-3/4 mx-auto mb-5 rounded-lg sm:px-6 lg:px-10 py-4 sm:py-5 border border-gray-200 dark:border-gray-700">
            {/* Title */}
            <div className="mb-4 sm:mb-6">
              <h1 className="font-robotoCondensed text-2xl sm:text-3xl lg:text-4xl font-bold text-primary dark:text-primary_dark">
                {isEditMode ? t("EditInvoice") : t("CreateInvoice")}
              </h1>
              {isEditMode && (
                <p className="text-xs sm:text-sm font-quicksand text-gray-600 mt-2">
                  {t("InvoiceID")} : {formData.invoiceId}
                </p>
              )}
            </div>

            {quickActionData && (
              <div className="mb-4 sm:mb-5 p-3 bg-secondary dark:bg-secondary_dark border-l-4 border-primary dark:border-primary_dark rounded-lg">
                <p className="text-xs sm:text-sm font-quicksand text-gray-900 dark:text-white">
                  {t("FormPreField")}
                </p>
              </div>
            )}

            {dataRestored && !isEditMode && (
              <div className="mb-4 sm:mb-5 p-3 bg-secondary dark:bg-secondary_dark border-l-4 border-primary dark:border-primary_dark rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <p className="text-xs sm:text-sm font-quicksand text-gray-900 dark:text-white">
                  ✓ {t("dataRestored")}
                </p>
                <button
                  onClick={handleClearForm}
                  className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-bold underline whitespace-nowrap"
                >
                  {t("clearAll")}
                </button>
              </div>
            )}

            {isEditMode && dataRestored && (
              <div className="mb-4 sm:mb-5 p-3 bg-secondary dark:bg-secondary_dark border-l-4 border-primary dark:border-primary_dark rounded-lg">
                <p className="text-xs sm:text-sm font-quicksand text-gray-900 dark:text-white">
                  ✓ {t("dataLoaded")}
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 sm:mb-5 p-3 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-700 rounded-lg">
                <p className="text-xs sm:text-sm font-quicksand text-red-700 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            <div className="flex flex-col lg:flex-row lg:justify-between gap-4 lg:gap-8 mb-10">
              {/* Order Date  */}
              <div className="w-full lg:w-auto">
                <h2 className="font-robotoCondensed text-lg sm:text-xl lg:text-2xl pb-2 lg:pb-3 text-gray-900 dark:text-white">
                  {t("orderDate")}
                </h2>
                <input
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      orderDate: e.target.value,
                    }))
                  }
                  className="w-full p-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white font-quicksand text-sm sm:text-base"
                />
              </div>

              {/* Due Date  */}
              <div className="w-full lg:w-auto">
                <h2 className="font-robotoCondensed text-lg sm:text-xl lg:text-2xl pb-2 lg:pb-3 text-gray-900 dark:text-white">
                  {t("dueDate")}
                </h2>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                  className="w-full p-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white font-quicksand text-sm sm:text-base"
                />
              </div>

              {/* Invoice ID  */}
              <div className="w-full lg:w-auto">
                <h2 className="font-robotoCondensed text-lg sm:text-xl lg:text-2xl pb-2 lg:pb-3 text-gray-900 dark:text-white">
                  {t("invoiceId")}
                </h2>
                <input
                  type="number"
                  value={formData.invoiceId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      invoiceId: e.target.value,
                    }))
                  }
                  placeholder={t("invoiceIdPlaceholder")}
                  disabled={isEditMode}
                  className={`w-full p-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-quicksand text-sm sm:text-base ${
                    isEditMode ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                />
                {isEditMode && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-quicksand">
                    {t("invoiceIdLocked")}
                  </p>
                )}
              </div>
            </div>

            {/* Divider */}
            <hr className="border-t-2 border-secondary my-6" />

            <h2 className="font-robotoCondensed text-2xl pb-2 text-gray-900 dark:text-white">
              {t("CustomerInfo")}
            </h2>
            <div className="mb-10">
              {/* Customer Select */}
              <div className="w-full">
                <h2 className="font-robotoCondensed text-2xl pb-3 text-gray-900 dark:text-white">
                  {t("selectCustomer")}
                </h2>

                {/* Customer Search Input */}
                <div className="relative mb-4">
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
                    placeholder={t("searchCustomers")}
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-quicksand"
                  />
                  {customerSearch && (
                    <button
                      onClick={() => setCustomerSearch("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <svg
                        className="h-5 w-5"
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
                  )}
                </div>

                {/* Customer Cards List */}
                {customersLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader />
                  </div>
                ) : customers.length === 0 ? (
                  <div className="bg-secondary dark:bg-secondary_dark rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <p className="font-quicksand text-lg text-gray-600 dark:text-gray-300 mb-4">
                      {t("noCustomers")}
                    </p>
                    <Button
                      onClick={handleNavigateToAddCustomer}
                      className="!bg-primary dark:!bg-primary_dark !text-white hover:!bg-accent dark:hover:!bg-secondary_dark hover:!text-black dark:hover:!text-white"
                    >
                      {t("AddCustomer")}
                    </Button>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="bg-secondary dark:bg-secondary_dark rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="font-quicksand text-lg text-gray-600 dark:text-gray-300">
                      {t("noCustomersFound")} "{customerSearch}"
                    </p>
                    <p className="font-quicksand text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {t("tryDifferentSearchTerm")}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
                    {filteredCustomers.map((customer) => {
                      const isSelected = formData.customer === customer._id;
                      return (
                        <div
                          key={customer._id}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              customer: customer._id,
                            }))
                          }
                          className={`relative bg-secondary dark:bg-secondary_dark rounded-lg p-4 cursor-pointer transition-all duration-300 border-2 ${
                            isSelected
                              ? "border-primary dark:border-primary_dark shadow-lg scale-105"
                              : "border-transparent hover:border-primary/50 dark:hover:border-primary_dark/50 hover:shadow-md"
                          }`}
                        >
                          {/* Selected Indicator */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-primary dark:bg-primary_dark text-white rounded-full p-1">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="3"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}

                          {/* Customer Info */}
                          <div className="space-y-2">
                            <h3
                              className={`font-robotoCondensed text-lg font-bold ${
                                isSelected
                                  ? "text-primary dark:text-primary_dark"
                                  : "text-gray-800 dark:text-white"
                              }`}
                            >
                              {customer.name}
                            </h3>

                            <div className="flex items-center gap-2 text-sm font-quicksand text-gray-600 dark:text-gray-300">
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
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="truncate">{customer.email}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm font-quicksand text-gray-600 dark:text-gray-300">
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
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              <span>{customer.phone}</span>
                            </div>

                            {customer.address && (
                              <div className="flex items-center gap-2 text-sm font-quicksand text-gray-600 dark:text-gray-300">
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
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <span className="truncate">
                                  {customer.address}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Selected Customer Info */}
                {formData.customer && (
                  <div className="mt-4 bg-primary/10 dark:bg-primary_dark/10 border-l-4 border-primary dark:border-primary_dark rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <p className="font-quicksand text-sm text-gray-900 dark:text-white">
                        <span className="font-bold">Selected Customer:</span>{" "}
                        {
                          customers.find((c) => c._id === formData.customer)
                            ?.name
                        }
                      </p>
                      <button
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, customer: "" }))
                        }
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-quicksand text-sm underline"
                      >
                        {t("ClearSelection")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <hr className="border-t-2 border-secondary my-6" />

            {/* Payment Information */}
            <div className="mb-10">
              <h2 className="font-robotoCondensed text-lg sm:text-xl lg:text-2xl mb-4 text-gray-900 dark:text-white">
                {t("PaymentInformation")}
              </h2>
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <h3 className="font-quicksand text-base sm:text-lg lg:text-xl text-gray-900 dark:text-white">
                    {t("PaymentMethod")}
                  </h3>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentMethod: e.target.value,
                      }))
                    }
                    className="w-full sm:w-auto py-2 px-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white font-quicksand cursor-pointer text-sm sm:text-base"
                  >
                    <option value="Cash">{t("Cash")}</option>
                    <option value="Credit | Debit Card">
                      {t("CreditOrDebitCard")}
                    </option>
                    <option value="Other">{t("Other")}</option>
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <h3 className="font-quicksand text-base sm:text-lg lg:text-xl text-gray-900 dark:text-white">
                    {t("Status")}
                  </h3>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full sm:w-auto py-2 px-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white font-quicksand cursor-pointer text-sm sm:text-base"
                  >
                    <option value="Pending">{t("Pending")}</option>
                    <option value="Paid">{t("Paid")}</option>
                    <option value="Overdue">{t("Overdue")}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-t-2 border-secondary my-6" />

            {/* Discount */}
            <div className="mb-10">
              <h2 className="font-robotoCondensed text-2xl pb-3 text-gray-900 dark:text-white">
                {t("Discount")} ({t("currency")})
              </h2>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    discount: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="0"
                min="0"
                className="w-full p-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-quicksand"
              />
            </div>
          </section>

          {/* Products Section */}
          <div className="w-full px-4 sm:px-6 lg:w-4/6 lg:ms-40 flex justify-center lg:justify-start">
            <div
              className="bg-accent dark:bg-accent_dark w-full sm:w-auto rounded-xl p-3 sm:p-4 text-center flex items-center justify-center gap-2 cursor-pointer select-none border border-gray-200 dark:border-gray-700"
              onClick={() => setShowProductSelector(!showProductSelector)}
              role="button"
              aria-expanded={showProductSelector}
            >
              <img
                src={arrowicon}
                alt={showProductSelector ? "Close Products" : "Open Products"}
                className={`w-8 sm:w-10 transition-transform duration-300 ${
                  showProductSelector ? "rotate-90" : ""
                }`}
              />
              <h2 className="font-robotoCondensed text-lg sm:text-xl text-gray-900 dark:text-white">
                {t("dashboard.quickActions.addProduct")}
              </h2>
            </div>
          </div>

          {/* Product Selector */}
          {showProductSelector && (
            <div className="w-full px-4 sm:w-10/12 md:w-9/12 lg:w-3/4 xl:w-2/3 mx-auto my-4 bg-accent dark:bg-accent_dark rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="mb-4">
                <h3 className="font-robotoCondensed text-xl sm:text-2xl text-gray-900 dark:text-white mb-4">
                  Available Products{" "}
                  {products.length > 0 && `(${products.length})`}
                </h3>

                {/* Product Search Input */}
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500"
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
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary_dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary_dark/20 transition-all duration-200 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-quicksand text-sm sm:text-base"
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <svg
                        className="h-4 w-4 sm:h-5 sm:w-5"
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
                  )}
                </div>
              </div>

              {productSearch && filteredProducts.length === 0 && (
                <div className="text-center py-8 bg-secondary dark:bg-secondary_dark rounded-lg mb-4 border border-gray-200 dark:border-gray-700">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="font-quicksand text-lg text-gray-600 dark:text-gray-300">
                    {t("NoProductFound")} "{productSearch}"
                  </p>
                  <p className="font-quicksand text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {t("TryAnotherSearch")}
                  </p>
                </div>
              )}

              {loading || customersLoading ? (
                <Loader />
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <p className="font-quicksand text-lg mb-4 text-gray-900 dark:text-white">
                    {t("noProductsMessage")}
                  </p>
                  <Button
                    onClick={() => navigate("/dashboard/product")}
                    className="!bg-primary dark:!bg-primary_dark !text-white hover:!bg-accent dark:hover:!bg-secondary_dark hover:!text-black dark:hover:!text-white"
                  >
                    {t("goToProducts")}
                  </Button>
                </div>
              ) : filteredProducts.length === 0 && !productSearch ? (
                <div className="text-center py-8">
                  <p className="font-quicksand text-lg mb-4 text-gray-900 dark:text-white">
                    {t("noProductsMessage")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="bg-secondary dark:bg-secondary_dark rounded-lg p-4 flex flex-col gap-2 border border-gray-200 dark:border-gray-700"
                    >
                      {product.imgCover && (
                        <img
                          src={product.imgCover}
                          alt={product.title}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                      )}
                      <h4 className="font-robotoCondensed text-lg font-bold text-gray-900 dark:text-white">
                        {product.title}
                      </h4>
                      <p className="font-quicksand text-sm text-gray-600 dark:text-gray-300">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-quicksand text-sm font-bold text-gray-900 dark:text-white">
                            {t("price")}:{" "}
                            {product.priceAfterDiscount || product.price}{" "}
                            {t("currency")}
                          </p>
                          {product.discount > 0 && (
                            <p className="font-quicksand text-xs text-gray-500 dark:text-gray-400 line-through">
                              {product.price} {t("currency")}
                            </p>
                          )}
                        </div>
                        <p className="font-quicksand text-xs text-gray-600 dark:text-gray-400">
                          {t("Stock")}: {product.quantity}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleAddProduct(product)}
                        disabled={product.quantity <= 0}
                        className="w-40 mx-auto !bg-primary dark:!bg-primary_dark !text-white hover:!bg-accent dark:hover:!bg-secondary_dark hover:!text-black dark:hover:!text-white !border-primary dark:!border-primary_dark hover:!border-accent dark:hover:!border-secondary_dark before:!bg-accent dark:before:!bg-secondary_dark disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {product.quantity <= 0
                          ? "Out of Stock"
                          : "Add to Invoice"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected Products Table */}
          {selectedProducts.length > 0 && (
            <div className="w-full px-4 sm:w-10/12 md:w-9/12 lg:w-3/4 xl:w-2/3 mx-auto my-4 bg-accent dark:bg-accent_dark rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-robotoCondensed text-xl sm:text-2xl mb-4 text-gray-900 dark:text-white">
                {t("selectedProducts")}
              </h3>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-secondary dark:border-gray-700">
                      <th className="font-robotoCondensed text-left p-2 text-gray-900 dark:text-white">
                        {t("product")}
                      </th>
                      <th className="font-robotoCondensed text-left p-2 text-gray-900 dark:text-white">
                        {t("price")}
                      </th>
                      <th className="font-robotoCondensed text-left p-2 text-gray-900 dark:text-white">
                        {t("quantity")}
                      </th>
                      <th className="font-robotoCondensed text-left p-2 text-gray-900 dark:text-white">
                        {t("total")}
                      </th>
                      <th className="font-robotoCondensed text-left p-2 text-gray-900 dark:text-white">
                        {t("action")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.map((product) => {
                      const productPrice =
                        product.priceAfterDiscount || product.price || 0;
                      return (
                        <tr
                          key={product._id}
                          className="border-b border-secondary dark:border-gray-700"
                        >
                          <td className="font-quicksand p-2 text-gray-900 dark:text-white">
                            {product.title || product.name}
                          </td>
                          <td className="font-quicksand p-2 text-gray-900 dark:text-white">
                            {productPrice} {t("currency")}
                          </td>
                          <td className="font-quicksand p-2">
                            <input
                              type="number"
                              min="1"
                              max={product.stockQuantity}
                              value={product.invoiceQuantity}
                              onChange={(e) =>
                                handleUpdateQuantity(
                                  product._id,
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-20 p-1 rounded border-2 border-gray-300 dark:border-gray-600 bg-secondary dark:bg-secondary_dark text-gray-900 dark:text-white"
                            />
                          </td>
                          <td className="font-quicksand p-2 text-gray-900 dark:text-white">
                            {(productPrice * product.invoiceQuantity).toFixed(
                              2
                            )}{" "}
                            {t("currency")}
                          </td>
                          <td className="font-quicksand p-2">
                            <button
                              onClick={() => handleRemoveProduct(product._id)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-bold"
                            >
                              {t("remove")}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {selectedProducts.map((product) => {
                  const productPrice =
                    product.priceAfterDiscount || product.price || 0;
                  return (
                    <div
                      key={product._id}
                      className="bg-secondary dark:bg-secondary_dark rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-robotoCondensed text-base font-bold text-gray-900 dark:text-white flex-1">
                          {product.title || product.name}
                        </h4>
                        <button
                          onClick={() => handleRemoveProduct(product._id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-bold text-sm ml-2"
                        >
                          {t("remove")}
                        </button>
                      </div>

                      <div className="space-y-2 font-quicksand text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            {t("Price")}:
                          </span>
                          <span className="text-gray-900 dark:text-white font-semibold">
                            {productPrice} {t("currency")}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">
                            {t("quantity")}:
                          </span>
                          <input
                            type="number"
                            min="1"
                            max={product.stockQuantity}
                            value={product.invoiceQuantity}
                            onChange={(e) =>
                              handleUpdateQuantity(
                                product._id,
                                parseInt(e.target.value)
                              )
                            }
                            className="w-20 p-1 rounded border-2 border-gray-300 dark:border-gray-600 bg-secondary dark:bg-background_dark text-gray-900 dark:text-white text-center"
                          />
                        </div>

                        <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                          <span className="text-gray-900 dark:text-white font-bold">
                            {t("total")}:
                          </span>
                          <span className="text-primary dark:text-primary_dark font-bold">
                            {(productPrice * product.invoiceQuantity).toFixed(
                              2
                            )}{" "}
                            {t("currency")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Buttons */}

          <div className="w-full mt-5 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 px-4">
            <Button
              className="flex items-center justify-center gap-2 w-48 sm:w-36 md:w-40 !bg-primary dark:!bg-primary_dark !text-white hover:!bg-accent dark:hover:!bg-secondary_dark hover:!text-black dark:hover:!text-white !border-primary dark:!border-primary_dark hover:!border-accent dark:hover:!border-secondary_dark before:!bg-accent dark:before:!bg-secondary_dark text-sm sm:text-base"
              onClick={handleNavigateToAddProduct}
            >
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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
              {t("addProduct")}
            </Button>
            <Button
              className="flex items-center justify-center gap-2 w-48 sm:w-36 md:w-40 !bg-primary dark:!bg-primary_dark !text-white hover:!bg-accent dark:hover:!bg-secondary_dark hover:!text-black dark:hover:!text-white !border-primary dark:!border-primary_dark hover:!border-accent dark:hover:!border-secondary_dark before:!bg-accent dark:before:!bg-secondary_dark text-sm sm:text-base"
              onClick={handleNavigateToAddCustomer}
            >
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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
              {t("addCustomer")}
            </Button>
            <Button
              className="flex items-center justify-center w-48 sm:w-36 md:w-40 gap-2 !bg-primary dark:!bg-primary_dark !text-white hover:!bg-accent dark:hover:!bg-secondary_dark hover:!text-black dark:hover:!text-white !border-primary dark:!border-primary_dark hover:!border-accent dark:hover:!border-secondary_dark before:!bg-accent dark:before:!bg-secondary_dark text-sm sm:text-base"
              onClick={() => setShowCostBreakdown(true)}
            >
              {t("costBreakdown")}
            </Button>
          </div>

          {/* Cost Breakdown Modal */}
          {showCostBreakdown && (
            <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex justify-center items-center z-50">
              <div className="bg-accent dark:bg-background_dark rounded-2xl shadow-xl w-[500px] p-8 relative border border-gray-200 dark:border-gray-700">
                {/* Close Button */}
                <button
                  onClick={() => setShowCostBreakdown(false)}
                  className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
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

                {/* Content */}
                <div className="space-y-4">
                  <h2 className="font-robotoCondensed text-3xl font-bold mb-6 text-gray-900 dark:text-primary_dark">
                    {t("costBreakdown")}
                  </h2>

                  <div className="space-y-4 font-quicksand">
                    {/* Products Breakdown */}
                    <div className="bg-secondary dark:bg-secondary_dark rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
                        {t("products")}
                      </h3>
                      {selectedProducts.length > 0 ? (
                        selectedProducts.map((product) => {
                          const productPrice =
                            product.priceAfterDiscount || product.price || 0;
                          return (
                            <div
                              key={product._id}
                              className="flex justify-between text-sm mb-2 text-gray-900 dark:text-white"
                            >
                              <span>
                                {product.title} x {product.invoiceQuantity}
                              </span>
                              <span>
                                {(
                                  productPrice * product.invoiceQuantity
                                ).toFixed(2)}{" "}
                                {t("currency")}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("noProducts")}
                        </p>
                      )}
                    </div>

                    {/* Cost Summary */}
                    <div className="space-y-2 text-base text-gray-900 dark:text-white">
                      <div className="flex justify-between">
                        <span>{t("subTotal")}:</span>
                        <span className="font-bold">
                          {formData.subTotal.toFixed(2)} {t("currency")}
                        </span>
                      </div>

                      {formData.discount > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <span>Discount:</span>
                          <span className="font-bold">
                            -{formData.discount.toFixed(2)} {t("currency")}
                          </span>
                        </div>
                      )}

                      <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-2 mt-2">
                        <div className="flex justify-between text-lg font-bold">
                          <span>{t("total")}:</span>
                          <span className="text-primary dark:text-primary_dark">
                            {formData.total.toFixed(2)} {t("currency")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Service Costs */}
                    <div className="bg-secondary dark:bg-secondary_dark rounded-lg p-4 mt-4 border border-gray-200 dark:border-gray-700">
                      <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
                        {t("serviceCosts")}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-900 dark:text-white">
                        <div className="flex justify-between">
                          <span>{t("InvoiceCreation")}:</span>
                          <span>2.00 {t("currency")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("AI Suggestions")} (Optional):</span>
                          <span>1.00 {t("currency")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("WhatsAppSend")}:</span>
                          <span>1.00 {t("currency")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Account Balance */}
                    <div className="bg-primary/10 dark:bg-primary_dark/10 rounded-lg p-4 mt-4 border border-primary/30 dark:border-primary_dark/30">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                          {t("accountBalance")}:
                        </span>
                        <span className="font-bold text-xl text-primary dark:text-primary_dark">
                          127.50 {t("currency")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-accent dark:bg-accent_dark w-full px-4 sm:w-10/12 md:w-8/12 lg:w-7/12 xl:w-1/2 mx-auto mt-5 mb-5 rounded-lg sm:px-5 py-4 sm:py-5 border border-gray-200 dark:border-gray-700">
            <h2 className="font-robotoCondensed text-xl sm:text-2xl pb-3 sm:pb-4 text-gray-900 dark:text-white">
              {t("invoiceSummary")}
            </h2>
            <div className="w-full sm:w-4/5 mx-auto flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 font-quicksand text-base sm:text-lg text-gray-900 dark:text-white">
              <h3 className="w-full sm:w-[calc(50%-0.5rem)]">
                {t("subTotal")}: {formData.subTotal.toFixed(2)} {t("currency")}
              </h3>
              <h3 className="w-full sm:w-[calc(50%-0.5rem)]">
                {t("discount")}: -{formData.discount.toFixed(2)} {t("currency")}
              </h3>
              <h3 className="w-full sm:w-[calc(50%-0.5rem)] font-bold text-lg sm:text-xl">
                {t("total")}: {formData.total.toFixed(2)} {t("currency")}
              </h3>
              <h3 className="w-full sm:w-[calc(50%-0.5rem)]">
                {t("products")}: {selectedProducts.length}
              </h3>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row justify-center items-center mx-auto mt-5 gap-3 sm:gap-4 mb-10 px-4">
            <Button
              className="flex items-center justify-center gap-2 w-48 sm:w-36 md:w-40 !bg-primary dark:!bg-primary_dark !text-white hover:!bg-accent dark:hover:!bg-secondary_dark hover:!text-black dark:hover:!text-white !border-primary dark:!border-primary_dark hover:!border-accent dark:hover:!border-secondary_dark before:!bg-accent dark:before:!bg-secondary_dark text-sm sm:text-base"
              onClick={() => navigate("/dashboard/invoice")}
            >
              {t("cancel")}
            </Button>
            <Button
              className="flex items-center justify-center gap-2 w-48 sm:w-36 md:w-40 !bg-primary dark:!bg-primary_dark !text-white hover:!bg-accent dark:hover:!bg-secondary_dark hover:!text-black dark:hover:!text-white !border-primary dark:!border-primary_dark hover:!border-accent dark:hover:!border-secondary_dark before:!bg-accent dark:before:!bg-secondary_dark text-sm sm:text-base"
              onClick={() =>
                navigate("/dashboard/invoice/preview", {
                  state: {
                    invoiceData: formData,
                    selectedProducts: selectedProducts,
                    customers: customers,
                  },
                })
              }
              disabled={!formData.customer || selectedProducts.length === 0}
            >
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {t("preview")}
            </Button>
            <Button
              className="flex items-center justify-center gap-2 w-48 sm:w-36 md:w-40 !bg-primary dark:!bg-primary_dark !text-white hover:!bg-accent dark:hover:!bg-secondary_dark hover:!text-black dark:hover:!text-white !border-primary dark:!border-primary_dark hover:!border-accent dark:hover:!border-secondary_dark before:!bg-accent dark:before:!bg-secondary_dark text-sm sm:text-base"
              onClick={handleCreateInvoice}
              disabled={loading}
            >
              {loading
                ? isEditMode
                  ? t("updating")
                  : t("creating")
                : isEditMode
                ? t("updateInvoice")
                : t("createInvoice")}
            </Button>
          </div>
        </>
      )}
    </>
  );
}

export default AddInvoice;
