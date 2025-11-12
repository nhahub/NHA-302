import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Button from "./ui/Button";
import { useUserContext } from "../features/user/useUserContext";
import logo from "../assets/logo.png";
import { useTranslation } from "react-i18next";
import { getInvoice } from "../api/invoice";
import { getMyCompany } from "../api/company";

function InvoicePreviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: invoiceId } = useParams();
  const { currentUser } = useUserContext();
  const invoiceRef = useRef();

  // Get invoice data from navigation state
  const locationState = location.state || {};
  
  const [invoiceData, setInvoiceData] = useState(locationState.invoiceData || null);
  const [selectedProducts, setSelectedProducts] = useState(locationState.selectedProducts || []);
  const [customers, setCustomers] = useState(locationState.customers || []);
  const [autoPrint] = useState(locationState.autoPrint || false);
  const [loading, setLoading] = useState(false);
  const [fetchingInvoice, setFetchingInvoice] = useState(false);
  const [fetchingCompany, setFetchingCompany] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [message, setMessage] = useState("");

  // Helper function to get properly formatted image URL
  const getImageUrl = useCallback((path) => {
    if (!path) return logo; // Return PayFlow logo as fallback
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    return `${baseUrl}${path}`;
  }, []);

  // Fetch current user's company data only if needed
  useEffect(() => {
    const fetchCompanyData = async () => {
      // Check if company data exists in localStorage
      const storedCompany = localStorage.getItem("company");
      let parsedStoredCompany = null;
      if (storedCompany && storedCompany !== "undefined") {
        try {
          parsedStoredCompany = JSON.parse(storedCompany);
        } catch (e) {
          console.error("Error parsing stored company:", e);
        }
      }

      // If currentUser.company is already a populated object with name and logo, use it directly
      if (currentUser?.company && typeof currentUser.company === 'object' && currentUser.company.name) {
        console.log("✅ Using company from currentUser:", currentUser.company);
        setCompanyData(currentUser.company);
        return;
      }

      // Check if we have stored company data
      if (parsedStoredCompany && parsedStoredCompany.name) {
        console.log("✅ Using company from localStorage:", parsedStoredCompany);
        setCompanyData(parsedStoredCompany);
        return;
      }

      // Only fetch if user has a company ID but it's not populated
      const companyId = currentUser?.company || parsedStoredCompany?._id || parsedStoredCompany?.id;
      
      if (companyId && typeof companyId === 'string') {
        try {
          setFetchingCompany(true);
          console.log("🔄 Fetching company data for ID:", companyId);
          const response = await getMyCompany();
          if (response?.data) {
            console.log("✅ Company data fetched:", {
              name: response.data.name,
              logo: response.data.logo || response.data.companyLogo,
              hasLogo: !!(response.data.logo || response.data.companyLogo)
            });
            setCompanyData(response.data);
            // Save to localStorage for future use
            localStorage.setItem("company", JSON.stringify(response.data));
          } else {
            console.log("⚠️ No company data returned from API");
            setCompanyData(null);
          }
        } catch (error) {
          console.error("❌ Error fetching company:", error);
          // Set companyData to null on error so we show PayFlow logo as fallback
          setCompanyData(null);
        } finally {
          setFetchingCompany(false);
        }
      } else {
        // No company at all - user might not have set up company yet
        console.log("⚠️ No company found for user - using PayFlow branding");
        setCompanyData(null);
      }
    };

    if (currentUser) {
      fetchCompanyData();
    }
  }, [currentUser]);

  // Fetch invoice data if not provided in location state or if ID is in URL
  useEffect(() => {
    const fetchInvoiceData = async () => {
      // If we have invoiceData and it has customer populated, no need to fetch
      if (invoiceData && invoiceData.customer && typeof invoiceData.customer === 'object') {
        return;
      }

      // If we have an ID in URL or in invoiceData, fetch the full invoice
      const idToFetch = invoiceId || invoiceData?._id || invoiceData?.id;
      
      if (idToFetch) {
        setFetchingInvoice(true);
        try {
          const response = await getInvoice(idToFetch);
          if (response?.data) {
            setInvoiceData(response.data);
            // If customer is populated, add it to customers array
            if (response.data.customer && typeof response.data.customer === 'object') {
              setCustomers([response.data.customer]);
            }
            // If products are populated, transform them
            if (response.data.products && response.data.products.length > 0) {
              const transformed = response.data.products.map((item) => {
                const productData = typeof item.product === "object" ? item.product : {};
                return {
                  _id: productData._id || item.product,
                  title: productData.title || productData.name || "Product",
                  name: productData.title || productData.name || "Product",
                  description: productData.description || "",
                  price: productData.priceAfterDiscount || productData.price || 0,
                  priceAfterDiscount: productData.priceAfterDiscount,
                  invoiceQuantity: item.quantity || 1,
                  imgCover: productData.imgCover,
                };
              });
              setSelectedProducts(transformed);
            }
          }
        } catch (error) {
          console.error("Error fetching invoice:", error);
          setMessage("Failed to load invoice data");
          setTimeout(() => setMessage(""), 3000);
        } finally {
          setFetchingInvoice(false);
        }
      }
    };

    fetchInvoiceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  // Transform products from API format to display format
  const transformedProducts = React.useMemo(() => {
    if (selectedProducts && selectedProducts.length > 0) {
      // If selectedProducts is already provided (from AddInvoice), use it directly
      return selectedProducts;
    }

    // Otherwise, transform from invoiceData.products (from API)
    if (invoiceData?.products && invoiceData.products.length > 0) {
      return invoiceData.products.map((item) => {
        // Check if product is populated (object) or just an ID
        const productData =
          typeof item.product === "object" ? item.product : {};
        return {
          _id: productData._id || item.product,
          title: productData.title || productData.name || "Product",
          name: productData.title || productData.name || "Product",
          description: productData.description || "",
          price: productData.priceAfterDiscount || productData.price || 0,
          priceAfterDiscount: productData.priceAfterDiscount,
          invoiceQuantity: item.quantity || 1,
          imgCover: productData.imgCover,
        };
      });
    }

    return [];
  }, [selectedProducts, invoiceData]);

  // Find customer details - handle both formats
  const customer = React.useMemo(() => {
    // If customer is already an object in invoiceData (from API)
    if (invoiceData?.customer && typeof invoiceData.customer === "object") {
      return invoiceData.customer;
    }

    // Otherwise find from customers array (from AddInvoice)
    return customers?.find((c) => c._id === invoiceData?.customer);
  }, [invoiceData, customers]);

  // Handle print via react-to-print, with a safe fallback
  const reactToPrintHandler = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `Invoice-${invoiceData?.invoiceId}`,
    removeAfterPrint: true,
    onAfterPrint: () => {
      setMessage("Invoice printed successfully!");
      setTimeout(() => setMessage(""), 3000);
    },
  });

  // Fallback: open a new window with cloned content and styles then print
  const fallbackPrint = useCallback(async (element) => {
    try {
      const printWindow = window.open("", "_blank", "noopener,noreferrer");
      if (!printWindow) throw new Error("Unable to open print window");

      const doc = printWindow.document;
      doc.open();

      // Collect styles from parent document
      const styles = Array.from(document.querySelectorAll("link[rel=stylesheet], style")).map(
        (node) => node.outerHTML
      ).join("\n");

      const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Invoice-${invoiceData?.invoiceId}</title>${styles}</head><body>${element.innerHTML}</body></html>`;
      doc.write(html);
      doc.close();

      // Wait for images/fonts to load
      await new Promise((resolve) => {
        const onLoad = () => resolve();
        // If content already loaded, resolve shortly
        setTimeout(onLoad, 250);
      });

      printWindow.focus();
      printWindow.print();
      // Optional: close after print dialog (some browsers block close)
      // printWindow.close();
    } catch (err) {
      console.error("Print fallback failed:", err);
      setMessage("Failed to print invoice");
      setTimeout(() => setMessage(""), 3000);
    }
  }, [invoiceData]);

  // Public handler used by buttons and auto-print
  const handlePrint = useCallback(async () => {
    if (!invoiceRef.current) return;
    setMessage("Preparing document for print...");
    try {
      // Primary approach: generate a PDF and open it in a new tab, then call print
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 210; // A4 width mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Create blob and open in new tab
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (!printWindow) {
        // If popup blocked, fallback to react-to-print or inline fallback
        console.warn('Popup blocked when opening PDF, trying react-to-print fallback');
        try {
          await reactToPrintHandler();
        } catch (err) {
          console.warn('react-to-print failed, using DOM fallback', err);
          await fallbackPrint(element);
        }
        setMessage('');
        return;
      }

      // Wait shortly for the PDF to load then invoke print
      const tryPrint = () => {
        try {
          printWindow.focus();
          printWindow.print();
          setMessage('');
        } catch (err) {
          console.error('Print window error:', err);
          setMessage('Failed to open print dialog');
          setTimeout(() => setMessage(''), 3000);
        } finally {
          // Revoke URL after a delay to allow browser to access it
          setTimeout(() => URL.revokeObjectURL(url), 20000);
        }
      };

      // Some browsers need time to load the PDF; poll until window.document is ready
      setTimeout(tryPrint, 700);
    } catch (err) {
      console.warn('PDF generation failed, falling back to react-to-print or DOM fallback', err);
      try {
        await reactToPrintHandler();
      } catch (err2) {
        console.warn('react-to-print failed, using DOM fallback', err2);
        await fallbackPrint(invoiceRef.current);
      }
    } finally {
      // clear message after short while if not cleared
      setTimeout(() => setMessage(''), 3000);
    }
  }, [reactToPrintHandler, fallbackPrint]);

  // Auto-print if flag is set
  useEffect(() => {
    if (autoPrint && invoiceRef.current) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        handlePrint();
      }, 500);
    }
  }, [autoPrint, handlePrint]);

  // Handle PDF download
  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice-${invoiceData?.invoiceId}.pdf`);

      setMessage("PDF downloaded successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setMessage("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  // Handle WhatsApp send (with PDF)
  const handleSendWhatsApp = async () => {
    if (!customer?.phone) {
      setMessage("Customer phone number not available");
      return;
    }

    setLoading(true);
    try {
      // Generate PDF first
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Save PDF for manual attachment
      pdf.save(`Invoice-${invoiceData.invoiceId}.pdf`);

      // Create a message
      const message = `Hello ${customer.name},\n\nYour invoice #${
        invoiceData.invoiceId
      } is ready.\n\nTotal Amount: ${invoiceData.total.toFixed(
        2
      )} {t("Currency")}\nDue Date: ${new Date(
        invoiceData.dueDate
      ).toLocaleDateString()}\n\nThank you for your business!`;

      // Format phone number (remove spaces, dashes, etc.)
      const phoneNumber = customer.phone.replace(/\D/g, "");

      // Open WhatsApp with message (PDF sharing requires WhatsApp Web API or backend)
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        message
      )}`;
      window.open(whatsappUrl, "_blank");

      setMessage(
        "PDF downloaded and WhatsApp opened! Please attach the PDF from your downloads folder."
      );
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      console.error("Error sending WhatsApp:", error);
      setMessage("Failed to send WhatsApp message");
    } finally {
      setLoading(false);
    }
  };

  // Handle Email send
  const handleSendEmail = () => {
    if (!customer?.email) {
      setMessage("Customer email not available");
      return;
    }

    const subject = `Invoice #${invoiceData.invoiceId} from ${
      companyData?.name || "PayFlow"
    }`;
    const body = `Dear ${
      customer.name
    },\n\nPlease find attached your invoice #${
      invoiceData.invoiceId
    }.\n\nTotal Amount: ${invoiceData.total.toFixed(
      2
    )} EGP\nDue Date: ${new Date(
      invoiceData.dueDate
    ).toLocaleDateString()}\n\nThank you for your business!\n\nBest regards,\n${
      currentUser?.name || ""
    }`;

    const mailtoUrl = `mailto:${customer.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    setMessage("Email client opened! Please attach the PDF manually.");
    setTimeout(() => setMessage(""), 5000);
  };

  // Handle Edit
  const handleEdit = () => {
    // Navigate to edit route with invoice ID
    const invoiceId = invoiceData._id || invoiceData.id;
    if (invoiceId) {
      navigate(`/dashboard/invoice/edit/${invoiceId}`, {
        state: {
          invoiceData,
          selectedProducts: transformedProducts,
          customers: customer ? [customer] : customers,
        },
      });
    } else {
      // Fallback: navigate to add page with data
      navigate("/dashboard/invoice/add", {
        state: {
          invoiceData,
          selectedProducts: transformedProducts,
          customers: customer ? [customer] : customers,
          isEditing: true,
        },
      });
    }
  };

  // Show loading state while fetching invoice or company
  if (fetchingInvoice || fetchingCompany) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary_dark mb-4"></div>
        <p className="text-xl font-quicksand">
          {fetchingInvoice ? t("Loading invoice...") : t("Loading company data...")}
        </p>
      </div>
    );
  }

  if (!invoiceData || transformedProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl font-quicksand mb-4">{t("noInvoiceData")}</p>
        <Button onClick={() => navigate("/dashboard/invoice")}>
          {t("backToInvoices")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background_dark py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-0">
      {/* Breadcrumb Section */}
      <div className="md:px-5">
        <section className="pb-4 sm:pb-6 lg:pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-robotoCondensed font-extrabold text-2xl sm:text-3xl lg:text-4xl text-primary dark:text-primary_dark">
              {t("InvoicePreview")}
            </h1>
            <p className="text-sm sm:text-base">
              <Link
                to="/dashboard"
                className="relative text-sm font-quicksand group text-black dark:text-gray-300"
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
                {t("Preview")}
              </span>
            </p>
          </div>
        </section>
      </div>

      {/* Action Buttons */}
      <div className="max-w-5xl mx-auto mb-4 sm:mb-6 bg-accent dark:bg-accent_dark rounded-lg p-3 sm:p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2 justify-center items-center">
          <Button
            onClick={handleEdit}
            className="flex-1 sm:flex-initial min-w-[120px] !bg-primary dark:!bg-primary_dark !text-white hover:!bg-accent dark:hover:!bg-accent_dark hover:!text-black dark:hover:!text-white !border-primary dark:!border-primary_dark hover:!border-accent dark:hover:!border-accent_dark before:!bg-accent dark:before:!bg-accent_dark flex items-center justify-center gap-2 !text-sm sm:!text-base"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            {t("Edit")}
          </Button>

          <Button
            onClick={handleDownloadPDF}
            disabled={loading}
            className="flex-1 sm:flex-initial min-w-[140px] sm:min-w-[180px] !bg-primary dark:!bg-primary_dark !text-white hover:!bg-accent dark:hover:!bg-accent_dark hover:!text-black dark:hover:!text-white !border-primary dark:!border-primary_dark hover:!border-accent dark:hover:!border-accent_dark before:!bg-accent dark:before:!bg-accent_dark flex items-center justify-center gap-2 !text-sm sm:!text-base"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="hidden sm:inline">
              {loading ? t("Generating") : t("GeneratePdf")}
            </span>
            <span className="sm:hidden">{loading ? "..." : "PDF"}</span>
          </Button>

          <Button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial min-w-[120px] !bg-primary dark:!bg-primary_dark !text-white hover:!bg-accent dark:hover:!bg-accent_dark hover:!text-black dark:hover:!text-white !border-primary dark:!border-primary_dark hover:!border-accent dark:hover:!border-accent_dark before:!bg-accent dark:before:!bg-accent_dark flex items-center justify-center gap-2 !text-sm sm:!text-base"
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
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            {t("Print")}
          </Button>

          <Button
            onClick={handleSendWhatsApp}
            disabled={loading || !customer?.phone}
            className="flex-1 sm:flex-initial min-w-[140px] sm:min-w-[180px] !bg-primary dark:!bg-primary_dark !text-white hover:!bg-accent dark:hover:!bg-accent_dark hover:!text-black dark:hover:!text-white !border-primary dark:!border-primary_dark hover:!border-accent dark:hover:!border-accent_dark before:!bg-accent dark:before:!bg-accent_dark flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed !text-sm sm:!text-base"
          >
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="hidden sm:inline">{t("SendWhatsApp")}</span>
            <span className="sm:hidden">{t("WhatsApp")}</span>
          </Button>

          <Button
            onClick={handleSendEmail}
            disabled={!customer?.email}
            className="flex-1 sm:flex-initial min-w-[120px] !bg-primary dark:!bg-primary_dark !text-white hover:!bg-accent dark:hover:!bg-accent_dark hover:!text-black dark:hover:!text-white !border-primary dark:!border-primary_dark hover:!border-accent dark:hover:!border-accent_dark before:!bg-accent dark:before:!bg-accent_dark flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed !text-sm sm:!text-base"
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="hidden sm:inline">{t("SendEmail")}</span>
            <span className="sm:hidden">{t("Email")}</span>
          </Button>

          <Button
            onClick={() => navigate("/dashboard/invoice")}
            className="flex-1 sm:flex-initial min-w-[120px] !bg-secondary dark:!bg-secondary_dark !text-black dark:!text-white hover:!bg-primary dark:hover:!bg-primary_dark !border-accent dark:!border-accent_dark group before:!bg-primary dark:before:!bg-primary_dark flex items-center justify-center gap-2 !text-sm sm:!text-base"
          >
            <p className="group-hover:text-white dark:group-hover:text-white">
              {t("Finish")}
            </p>
          </Button>
        </div>

        {message && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-primary/10 dark:bg-primary_dark/10 border-l-4 border-primary dark:border-primary_dark rounded-lg">
            <p className="text-xs sm:text-sm font-quicksand text-center text-gray-900 dark:text-white">
              {message}
            </p>
          </div>
        )}
      </div>

      {/* Invoice Preview - Printable Area */}
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
        <div
          ref={invoiceRef}
          className="p-6 sm:p-8 lg:p-12 mx-auto"
          style={{ maxWidth: "210mm", minHeight: "297mm" }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 sm:mb-8 border-b-4 border-primary pb-4 sm:pb-6 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-robotoCondensed font-bold text-primary mb-2">
                {t("Invoice")}
              </h1>
              <h3 className="text-2xl font-robotoCondensed font-bold text-primary mb-2">
                {t("by PayFlow")}
              </h3>
              <p className="font-quicksand text-sm sm:text-base text-gray-600">
                #{invoiceData.invoiceId}
              </p>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              {/* Company Logo */}
              <div className="flex justify-start sm:justify-end mb-3">
                {companyData?.logo || companyData?.companyLogo ? (
                  <img
                    src={getImageUrl(companyData?.logo || companyData?.companyLogo)}
                    alt="Company Logo"
                    className="h-12 sm:h-16 w-auto object-contain"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error("Company logo failed to load:", e.target.src);
                      // Fallback to PayFlow logo if company logo fails to load
                      e.target.onerror = null;
                      e.target.src = logo;
                    }}
                  />
                ) : (
                  <img
                    src={logo}
                    alt="PayFlow Logo"
                    className="h-12 sm:h-16 w-auto object-contain"
                  />
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-robotoCondensed font-bold mb-2 text-primary">
                {companyData?.name || "PayFlow"}
              </h2>
              <p className="font-quicksand text-xs sm:text-sm text-gray-600">
                {companyData?.address || ""}
              </p>
              <p className="font-quicksand text-xs sm:text-sm text-gray-600">
                {companyData?.phone || ""}
              </p>
              <p className="font-quicksand text-xs sm:text-sm text-gray-600">
                {companyData?.email || ""}
              </p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Bill To */}
            <div>
              <h3 className="font-robotoCondensed text-base sm:text-lg font-bold mb-2 sm:mb-3 text-primary">
                {t("BillTo")}:
              </h3>
              <p className="font-quicksand font-bold text-base sm:text-lg">
                {customer?.name || "N/A"}
              </p>
              <p className="font-quicksand text-xs sm:text-sm text-gray-600">
                {customer?.address || ""}
              </p>
              <p className="font-quicksand text-xs sm:text-sm text-gray-600">
                {customer?.phone || ""}
              </p>
              <p className="font-quicksand text-xs sm:text-sm text-gray-600">
                {customer?.email || ""}
              </p>
            </div>

            {/* Invoice Info */}
            <div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="font-robotoCondensed font-bold">
                    {t("OrderDate")}:
                  </span>
                  <span className="font-quicksand">
                    {new Date(invoiceData.orderDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="font-robotoCondensed font-bold">
                    {t("DueDate")}:
                  </span>
                  <span className="font-quicksand">
                    {new Date(invoiceData.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="font-robotoCondensed font-bold">
                    {t("Status")}:
                  </span>
                  <span
                    className={`font-quicksand font-bold ${
                      invoiceData.status === "Paid"
                        ? "text-green-600"
                        : invoiceData.status === "Overdue"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {invoiceData.status}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="font-robotoCondensed font-bold">
                    {t("PaymentMethod")}:
                  </span>
                  <span className="font-quicksand">
                    {invoiceData.paymentMethod}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="mb-6 sm:mb-8 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="font-robotoCondensed text-left p-2 sm:p-3 border border-primary text-xs sm:text-sm">
                    {t("Item")}
                  </th>
                  <th className="font-robotoCondensed text-left p-2 sm:p-3 border border-primary text-xs sm:text-sm">
                    {t("Description")}
                  </th>
                  <th className="font-robotoCondensed text-center p-2 sm:p-3 border border-primary text-xs sm:text-sm">
                    {t("Qty")}
                  </th>
                  <th className="font-robotoCondensed text-right p-2 sm:p-3 border border-primary text-xs sm:text-sm">
                    {t("Price")}
                  </th>
                  <th className="font-robotoCondensed text-right p-2 sm:p-3 border border-primary text-xs sm:text-sm">
                    {t("Total")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {transformedProducts.map((product, index) => {
                  const productPrice =
                    product.priceAfterDiscount || product.price || 0;
                  const total = productPrice * product.invoiceQuantity;
                  return (
                    <tr key={product._id || index} className="border-b">
                      <td className="font-quicksand p-2 sm:p-3 border border-gray-300 text-xs sm:text-sm">
                        {index + 1}
                      </td>
                      <td className="font-quicksand p-2 sm:p-3 border border-gray-300 text-xs sm:text-sm">
                        <div>
                          <p className="font-bold">
                            {product.title || product.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {product.description || ""}
                          </p>
                        </div>
                      </td>
                      <td className="font-quicksand text-center p-2 sm:p-3 border border-gray-300 text-xs sm:text-sm">
                        {product.invoiceQuantity}
                      </td>
                      <td className="font-quicksand text-right p-2 sm:p-3 border border-gray-300 text-xs sm:text-sm">
                        {productPrice.toFixed(2)} {t("Currency")}
                      </td>
                      <td className="font-quicksand text-right p-2 sm:p-3 border border-gray-300 text-xs sm:text-sm">
                        {total.toFixed(2)} {t("Currency")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6 sm:mb-8">
            <div className="w-full sm:w-80">
              <div className="flex justify-between py-2 border-b border-gray-300 text-xs sm:text-sm">
                <span className="font-robotoCondensed font-bold">
                  {t("Subtotal")}:
                </span>
                <span className="font-quicksand">
                  {invoiceData.subTotal.toFixed(2)} {t("Currency")}
                </span>
              </div>
              {invoiceData.discount > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-300 text-green-600 text-xs sm:text-sm">
                  <span className="font-robotoCondensed font-bold">
                    {t("Discount")} ({invoiceData.discountPercentage}%):
                  </span>
                  <span className="font-quicksand">
                    -{invoiceData.discount.toFixed(2)} {t("Currency")}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2 sm:py-3 bg-primary/10 px-3 sm:px-4 mt-2 rounded">
                <span className="font-robotoCondensed text-lg sm:text-xl font-bold">
                  {t("Total")}:
                </span>
                <span className="font-quicksand text-lg sm:text-xl font-bold text-primary">
                  {invoiceData.total.toFixed(2)} {t("Currency")}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-300 pt-4 sm:pt-6 mt-6 sm:mt-8">
            <div className="text-center">
              <p className="font-quicksand text-xs sm:text-sm text-gray-600 mb-2">
                {t("InvoiceFooter")}
              </p>
              <p className="font-quicksand text-xs text-gray-500">
                {t("InvoiceFooter2")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicePreviewPage;
