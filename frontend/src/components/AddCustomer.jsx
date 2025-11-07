import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import Button from "./ui/Button";
import { createCustomer } from "../api/customer";
import { useTranslation } from "react-i18next";
import { CompanyContext } from "../features/company/CompanyContext";
function AddCustomer() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const quickActionData = location.state?.quickActionData;

  const [formData, setFormData] = useState({
    id: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    ordersQty: "",
    purchases: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' | 'error'
  const [fieldErrors, setFieldErrors] = useState({});
  const { currentCompany } = useContext(CompanyContext) || {};

  useEffect(() => {
    if (quickActionData) {
      setFormData((prev) => ({
        ...prev,
        fullName: quickActionData.customerName || "",
        email: quickActionData.email || "",
        phone: quickActionData.phone || "",
        address: quickActionData.address || "",
      }));
    }
  }, [quickActionData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // clear field-level error when user edits the field
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      // clear previous errors
      setMessage("");
      setMessageType("");
      setFieldErrors({});
      // prefer company from context, then localStorage user, then stored company
      const storedCompany = JSON.parse(localStorage.getItem("company"));
      const companyId = currentCompany?._id || user?.company || storedCompany?._id || storedCompany?.id;
      const newCustomer = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        purchases: Number(formData.purchases) || 0,
        orders: Number(formData.ordersQty) || 0,
      };

      // Attach company id when available (backend expects company field)
      if (companyId) newCustomer.company = companyId;

      const res = await createCustomer(newCustomer);

  setMessage(t("CustomerCreatedSuccessfully"));
  setMessageType("success");
  setFieldErrors({});
      console.log("✅ Customer Created:", res);

      setTimeout(() => navigate("/dashboard/customer"), 1200);
    } catch (error) {
      console.error("❌ Error creating customer:", error);
      // Parse common backend error shapes (Mongoose duplicate key, validation errors)
      const resp = error?.response?.data || {};
      let userMessage = t("FaildToAddCustomer");

      // Duplicate key (unique constraint)
      const isDuplicate = resp?.code === 11000 || resp?.error?.code === 11000 || /duplicate key|E11000|duplicate/i.test(resp?.message || "");
      if (isDuplicate) {
        const keyValue = resp.keyValue || resp.error?.keyValue;
        if (keyValue && typeof keyValue === "object") {
          const fields = Object.keys(keyValue).map((k) => `${k}`);
          userMessage = `${fields.join(", ")} must be unique. A record with the same ${fields.join(", ")} already exists.`;
          // set field-level errors using form field keys mapping
          const mapField = (f) => (f === "name" ? "fullName" : f);
          const fieldErrs = {};
          fields.forEach((f) => {
            fieldErrs[mapField(f)] = `${f} must be unique.`;
          });
          setFieldErrors(fieldErrs);
        } else if (resp.message) {
          // try to parse message like: dup key: { email: "value" }
          const dupMatch = (resp.message || "").match(/dup key:\s*\{\s*([^:\s]+)\s*:\s*"?([^"}]+)"?\s*\}/i);
          if (dupMatch) {
            const field = dupMatch[1].trim();
            const value = dupMatch[2].trim();
            userMessage = `${field} must be unique. The value "${value}" is already used.`;
            const formKey = field === "name" ? "fullName" : field;
            setFieldErrors({ [formKey]: `The value "${value}" is already used for ${field}.` });
          } else {
            // fallback generic duplicate message
            userMessage = "A record with a duplicate unique field already exists. Please use unique values.";
          }
        } else {
          userMessage = "A record with a duplicate unique field already exists. Please use unique values.";
        }
      } else if (resp?.errors && typeof resp.errors === "object") {
        // Mongoose validation errors
        const messages = Object.values(resp.errors).map((e) => e.message).filter(Boolean);
        if (messages.length) userMessage = messages.join(" ");
        // map validation errors to fieldErrors when possible
        try {
          const fieldErrs = {};
          Object.entries(resp.errors).forEach(([k, v]) => {
            const formKey = k === "name" ? "fullName" : k;
            fieldErrs[formKey] = v.message || String(v);
          });
          setFieldErrors(fieldErrs);
        } catch (err) {
          void err;
        }
      } else if (resp?.message) {
        userMessage = resp.message;
      } else if (error?.message) {
        userMessage = error.message;
      }

      setMessage(userMessage);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:p-5">
      <div className="py-7">
        <h1 className="text-4xl text-primary dark:text-primary_dark font-bold font-robotoCondensed">
          {t("Customer")}
        </h1>
        <p>
          <Link
            to="/"
            className="relative text-sm group text-black  dark:text-gray-300 font-quicksand"
          >
            {t("Home")}
            <span className="absolute left-0 bottom-0 h-[1px] w-0  bg-primary dark:bg-gray-300 transition-all duration-500 group-hover:w-full" />
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

        {quickActionData && (
          <div className="mt-3 p-3 bg-accent dark:bg-accent_dark border-l-4 border-primary dark:border-primary_dark rounded-lg">
            <p className="text-sm font-quicksand text-gray-900 dark:text-white">{t("QuickActions")}</p>
          </div>
        )}
      </div>

      {message && (
        <div
          className={`p-3 mb-4 rounded-lg font-quicksand transition-colors duration-200 ${
            messageType === "success"
              ? "bg-primary/20 text-primary dark:bg-primary_dark/20 dark:text-primary_dark"
              : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
          }`}
        >
          {message}
        </div>
      )}

      <section className="flex md:flex-row flex-col justify-center gap-5">
        <div className="md:w-[40%]">
          <div className="flex flex-col gap-1 bg-accent dark:bg-accent_dark p-6 rounded-2xl mb-5 font-quicksand">
            <h3 className="text-xl font-semibold pb-2 text-gray-900 dark:text-white">{t("PersonalInfo")}</h3>

            <label htmlFor="ID" className="text-gray-900 dark:text-white">{t("ID")}</label>
            <input
              type="text"
              id="ID"
              value={formData.id}
              onChange={(e) => handleChange("id", e.target.value)}
              className="p-2 bg-secondary dark:bg-secondary_dark border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary dark:focus:border-primary_dark rounded-xl text-gray-900 dark:text-white"
            />

            <label htmlFor="Name" className="text-gray-900 dark:text-white">{t("FullName")}</label>
            <input
              type="text"
              id="Name"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className="p-2 bg-secondary dark:bg-secondary_dark border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary dark:focus:border-primary_dark rounded-xl text-gray-900 dark:text-white"
            />
            {fieldErrors.fullName && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.fullName}</p>
            )}
          </div>

          <div className="flex flex-col gap-1 bg-accent dark:bg-accent_dark p-6 rounded-2xl font-quicksand">
            <h3 className="text-xl font-semibold pb-2 text-gray-900 dark:text-white">{t("OrderDetails")}</h3>

            <div className="flex md:flex-row flex-col gap-4">
              <div className="flex flex-col md:w-[50%] w-full">
                <label htmlFor="ordersQty" className="text-gray-900 dark:text-white">{t("OrdersQTY")}</label>
                <input
                  type="text"
                  id="ordersQty"
                  value={formData.ordersQty}
                  onChange={(e) => handleChange("ordersQty", e.target.value)}
                  className="p-2 bg-secondary dark:bg-secondary_dark border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary dark:focus:border-primary_dark rounded-xl text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex flex-col md:w-[50%] w-full">
                <label htmlFor="purchases" className="text-gray-900 dark:text-white">{t("Purchases")}</label>
                <input
                  type="text"
                  id="purchases"
                  value={formData.purchases}
                  onChange={(e) => handleChange("purchases", e.target.value)}
                  className="p-2 bg-secondary dark:bg-secondary_dark border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary dark:focus:border-primary_dark rounded-xl text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-[60%] flex flex-col gap-1 bg-accent dark:bg-accent_dark p-6 rounded-2xl font-quicksand">
          <h3 className="text-xl font-semibold pb-2 text-gray-900 dark:text-white">{t("ContactInfo")}</h3>

          <label htmlFor="email" className="text-gray-900 dark:text-white">{t("Email")}</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="p-2 bg-secondary dark:bg-secondary_dark border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary dark:focus:border-primary_dark rounded-xl text-gray-900 dark:text-white"
          />
          {fieldErrors.email && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
          )}

          <label htmlFor="phone" className="text-gray-900 dark:text-white">{t("Phone")}</label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="p-2 bg-secondary dark:bg-secondary_dark border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary dark:focus:border-primary_dark rounded-xl text-gray-900 dark:text-white"
          />
          {fieldErrors.phone && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.phone}</p>
          )}

          <label htmlFor="address" className="text-gray-900 dark:text-white">{t("Address")}</label>
          <textarea
            name="address"
            id="address"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="p-2 bg-secondary dark:bg-secondary_dark border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary dark:focus:border-primary_dark rounded-xl h-[40%] text-gray-900 dark:text-white"
          ></textarea>
          {fieldErrors.address && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.address}</p>
          )}
        </div>
      </section>

      <div className="pt-5 flex justify-end">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="
          flex items-center gap-2 relative px-4 py-2 rounded-xl
          bg-primary dark:bg-primary_dark text-white hover:text-primary dark:hover:text-primary_dark font-medium overflow-hidden font-quicksand
          transition-all duration-500 ease-in-out
          hover:bg-secondary dark:hover:bg-secondary_dark
          before:absolute before:inset-0 before:-translate-x-full
          before:bg-white/30 before:skew-x-[45deg]
          before:transition-transform before:duration-700
          hover:before:translate-x-full
        "
        >
          {loading ? (
            t("AddCardIsLoading")
          ) : (
            <>
              <FaCheck /> {t("AddCustomer")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default AddCustomer;
