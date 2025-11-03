import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import { updateCustomer } from "../api/customer";
import { useTranslation } from "react-i18next";

function EditCustomer() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const customerData = location.state?.Customer;

  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    email: "",
    phone: "",
    totalPurchases: "",
    totalOrders: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    if (!customerData) {
      navigate("/dashboard/customer");
    } else {
      setFormData(customerData);
    }
  }, [customerData, navigate]);

  // 🟢 لما المستخدم يغير حاجة في الفورم
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🟢 حفظ التعديلات (Update)
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await updateCustomer(formData._id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        totalOrders: Number(formData.totalOrders),
        totalPurchases: Number(formData.totalPurchases),
      });

      setMessage(t("CustomerUpdatedSuccessfully"));
      setMessageType("success");

      // بعد ثانية ونص بيرجع لصفحة الكستومرز
      setTimeout(() => navigate("/dashboard/customer"), 1500);
    } catch (error) {
      console.error("Error updating customer:", error);
      setMessage(t("FaildToUpdateCustomer"));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:p-5">
      <div className="py-7">
        <h1 className="text-4xl text-primary dark:text-primary_dark font-bold font-robotoCondensed">
          {t("Customers")}
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
            {t("EditCustomer")}
          </span>
        </p>
      </div>

      {/* ✅ Success / Error message box */}
      {message && (
        <div
          className={`p-3 mb-4 rounded-lg font-quicksand ${
            messageType === "success"
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700"
              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSave}>
        <section className="flex md:flex-row flex-col justify-center gap-5">
          <div className="md:w-[40%]">
            {/* Personal Informations */}
            <div className="flex flex-col gap-1 bg-accent dark:bg-accent_dark p-6 rounded-2xl mb-5 font-quicksand">
              <h3 className="text-xl font-semibold pb-2 text-gray-900 dark:text-white">
                {t("PersonalInfo")}
              </h3>

              <label htmlFor="_id" className="text-gray-900 dark:text-white">ID</label>
              <input
                type="text"
                name="_id"
                value={formData._id}
                readOnly
                className="p-2 bg-secondary dark:bg-secondary_dark border-2 border-gray-300 dark:border-gray-600 rounded-xl opacity-50 text-gray-900 dark:text-white"
              />

              <label htmlFor="name" className="text-gray-900 dark:text-white">{t("FullName")}</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="p-2 bg-secondary dark:bg-secondary_dark border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary dark:focus:border-primary_dark rounded-xl text-gray-900 dark:text-white"
              />
            </div>

            {/* Orders Details */}
            <div className="flex flex-col gap-1 bg-accent dark:bg-accent_dark p-6 rounded-2xl font-quicksand">
              <h3 className="text-xl font-semibold pb-2 text-gray-900 dark:text-white">
                {t("OrderDetails")}
              </h3>

              <div className="flex md:flex-row flex-col gap-4">
                <div className="flex flex-col md:w-[50%] w-full">
                  <label htmlFor="totalOrders" className="text-gray-900 dark:text-white">{t("OrdersQTY")}</label>
                  <input
                    type="number"
                    name="totalOrders"
                    value={formData.totalOrders}
                    onChange={handleChange}
                    className="p-2 bg-secondary dark:bg-secondary_dark border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary dark:focus:border-primary_dark rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex flex-col md:w-[50%] w-full">
                  <label htmlFor="totalPurchases" className="text-gray-900 dark:text-white">{t("Purchases")}</label>
                  <input
                    type="number"
                    name="totalPurchases"
                    value={formData.totalPurchases}
                    onChange={handleChange}
                    className="p-2 bg-secondary dark:bg-secondary_dark border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary dark:focus:border-primary_dark rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Informations */}
          <div className="md:w-[60%] flex flex-col gap-1 bg-accent dark:bg-accent_dark p-6 rounded-2xl font-quicksand">
            <h3 className="text-xl font-semibold pb-2 text-gray-900 dark:text-white">{t("ContactInfo")}</h3>

            <label htmlFor="email" className="text-gray-900 dark:text-white">{t("Email")}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="p-2 bg-secondary dark:bg-secondary_dark border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary dark:focus:border-primary_dark rounded-xl text-gray-900 dark:text-white"
            />

            <label htmlFor="phone" className="text-gray-900 dark:text-white">{t("Phone")}</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="p-2 bg-secondary dark:bg-secondary_dark border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary dark:focus:border-primary_dark rounded-xl text-gray-900 dark:text-white"
            />

            <label htmlFor="address" className="text-gray-900 dark:text-white">{t("Address")}</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="p-2 bg-secondary dark:bg-secondary_dark border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary dark:focus:border-primary_dark rounded-xl h-[40%] text-gray-900 dark:text-white"
            ></textarea>
          </div>
        </section>

        <div className="pt-5 flex justify-end">
          <button
            type="submit"
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
              t("Saving")
            ) : (
              <>
                <FaCheck /> {t("SaveChanges")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditCustomer;
