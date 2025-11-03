import { useTranslation } from "react-i18next";
import Button from "../components/ui/Button";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useUserContext } from "../features/user/useUserContext";
import Theme from "./Theme";
import {
  useUpdatePassword,
  useUpdateUser,
  useDeleteAccount,
} from "../features/user/useUserQuery";
import { usePreferences } from "../utils/usePreferences";
import { useCompanyContext } from "../features/company/useCompanyContext";
import { useUpdateCompany } from "../features/company/useCompanyQuery";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Settings() {
  const { t } = useTranslation();
  const { language, changeLanguage, theme, changeTheme, savePreferences } =
    usePreferences();
  const { currentUser, updateUser } = useUserContext();
  const { currentCompany, updateCompany } = useCompanyContext();
  const navigate = useNavigate();

  const updateUserMutation = useUpdateUser(currentUser?._id);
  const updatePasswordMutation = useUpdatePassword();
  const updateCompanyMutation = useUpdateCompany(currentUser?.company);
  const deleteAccountMutation = useDeleteAccount();

  const [showModal, setShowModal] = useState(false);
  const [dangerModal, setDangerModal] = useState(false);

  const [username, setUsername] = useState(currentUser?.username || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [companyName, setCompanyName] = useState(currentCompany?.name || "");
  const [invoicePrefix, setInvoicePrefix] = useState(
    currentCompany?.invoicePrefix || ""
  );
  const [taxRate, setTaxRate] = useState(currentCompany?.taxRate || "");
  const [currency, setCurrency] = useState(currentCompany?.currency || "");
  const [logoPreview, setLogoPreview] = useState(
    currentCompany?.companyLogo || ""
  );
  const [logoFile, setLogoFile] = useState(null);

  const handleDeleteAccount = async () => {
    try {
      await deleteAccountMutation.mutateAsync();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      setDangerModal(false);
      toast.success(
        t("AccountDeleted") || "Your account has been deleted successfully"
      );
      navigate("/");
    } catch (err) {
      console.error("❌ Failed to delete account:", err);
      toast.error(err?.response?.data?.message || "Failed to delete account.");
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return `${baseUrl}${path}`;
  };
  useEffect(() => {
    if (currentUser?.username) setUsername(currentUser.username);
    if (currentUser?.email) setEmail(currentUser.email);
    if (currentUser?.phone) setPhone(currentUser.phone);
  }, [currentUser]);

  useEffect(() => {
    if (currentCompany?.name) setCompanyName(currentCompany.name);
    if (currentCompany?.invoicePrefix)
      setInvoicePrefix(currentCompany.invoicePrefix);
    if (currentCompany?.taxRate) setTaxRate(currentCompany.taxRate);
    if (currentCompany?.currency) setCurrency(currentCompany.currency);
    if (currentCompany?.companyLogo) {
      setLogoPreview(getImageUrl(currentCompany.companyLogo));
    }
  }, [currentCompany]);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      console.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      console.error("File size must be less than 5MB");
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBusinessSettings = async () => {
    // Check if there are any changes
    const hasChanges =
      logoFile ||
      (companyName && companyName !== currentCompany?.name) ||
      (invoicePrefix && invoicePrefix !== currentCompany?.invoicePrefix) ||
      (taxRate && taxRate !== currentCompany?.taxRate) ||
      (currency && currency !== currentCompany?.currency);

    if (!hasChanges) return;

    let updateData;

    if (logoFile) {
      // Create FormData for file upload
      updateData = new FormData();
      updateData.append("companyLogo", logoFile);

      // Add other fields to FormData
      if (companyName && companyName !== currentCompany?.name)
        updateData.append("name", companyName);
      if (invoicePrefix && invoicePrefix !== currentCompany?.invoicePrefix)
        updateData.append("invoicePrefix", invoicePrefix);
      if (taxRate && taxRate !== currentCompany?.taxRate)
        updateData.append("taxRate", taxRate.toString());
      if (currency && currency !== currentCompany?.currency)
        updateData.append("currency", currency);
    } else {
      // Use regular object for non-file updates
      updateData = {};
      if (companyName && companyName !== currentCompany?.name)
        updateData.name = companyName;
      if (invoicePrefix && invoicePrefix !== currentCompany?.invoicePrefix)
        updateData.invoicePrefix = invoicePrefix;
      if (taxRate && taxRate !== currentCompany?.taxRate)
        updateData.taxRate = taxRate;
      if (currency && currency !== currentCompany?.currency)
        updateData.currency = currency;
    }

    updateCompanyMutation.mutate(updateData, {
      onSuccess: (res) => {
        updateCompany(res.data);

        setLogoFile(null);
        if (res.data?.companyLogo) {
          setLogoPreview(getImageUrl(res.data.companyLogo));
        }

        console.log("✅ Company updated successfully");
        toast.success(
          t("CompanyUpdatedSuccessfully") || "Company updated successfully"
        );
      },
      onError: (err) => {
        console.error("❌ Update failed", err);
        toast.error(
          err?.response?.data?.message || "Failed to update business settings."
        );
      },
    });
  };

  const handleSavePersonalInfo = () => {
    const updates = {};
    if (username && username !== currentUser?.username)
      updates.username = username;
    if (email && email !== currentUser?.email) updates.email = email;
    if (phone && phone !== currentUser?.phone) updates.phone = phone;

    if (Object.keys(updates).length === 0) return;

    updateUserMutation.mutate(updates, {
      onSuccess: () => {
        setShowModal(false);
        updateUser(updates);
        console.log("✅ User updated successfully");
        toast.success(
          t("UserInfoUpdatedSuccessfully") || "User info updated successfully"
        );
      },
      onError: (err) => {
        console.error("❌ Update failed", err);
        toast.error(
          err?.response?.data?.message ||
            "Failed to update personal info. Please try again."
        );
      },
    });
  };

  const handlePasswordUpdate = () => {
    if (!oldPassword || !newPassword || !confirmPassword) return;

    updatePasswordMutation.mutate(
      {
        oldPassword,
        newPassword,
        passwordConfirmation: confirmPassword,
      },
      {
        onSuccess: () => {
          setShowModal(false);
          console.log("✅ Password ugpdated successfully");
          toast.success(
            t("PasswordUpdatedSuccessfully") || "Password updated successfully"
          );
        },
        onError: (err) => {
          console.error("❌ Update failed", err);
          toast.error(
            err?.response?.data?.message ||
              "Failed to update password. Please try again."
          );
        },
      }
    );
  };

  return (
    <div className="m-10 font-quicksand">
      <section className="flex flex-col lg:flex-row justify-around items-start w-full gap-8">
        {/* Personal Info */}
        <section className="w-full lg:w-1/2">
          <h2 className="flex items-center gap-2 text-2xl font-semibold font-robotoCondensed  dark:text-white pb-6  ">
            {t("PersonalInfo")}
          </h2>
          <div className="max-w-lg bg-accent dark:bg-accent_dark p-6 rounded-xl shadow-lg space-y-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-md font-medium text-black dark:text-white col-span-1 text-left">
                {t("Name")}
              </label>
              <input
                type="text"
                value={username}
                placeholder={currentUser?.username}
                onChange={(e) => setUsername(e.target.value)}
                className="col-span-2 py-2 px-3 rounded-md shadow-sm bg-secondary dark:bg-secondary_dark text-center sm:text-md text-primary dark:text-primary_dark focus:ring-2 focus:ring-primary focus:outline-none transition"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-md font-medium text-black dark:text-white col-span-1 text-left">
                {t("Email")}
              </label>
              <input
                type="text"
                value={email}
                placeholder={currentUser?.email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-2 py-2 px-3 rounded-md shadow-sm bg-secondary dark:bg-secondary_dark text-center sm:text-md text-primary dark:text-primary_dark focus:ring-2 focus:ring-primary focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-md font-medium text-black dark:text-white col-span-1 text-left">
                {t("Phone")}
              </label>
              <input
                type="text"
                value={phone}
                placeholder={currentUser?.phone}
                onChange={(e) => setPhone(e.target.value)}
                className="col-span-2 py-2 px-3 rounded-md shadow-sm bg-secondary dark:bg-secondary_dark text-center sm:text-md text-primary dark:text-primary_dark focus:ring-2 focus:ring-primary focus:outline-none transition"
              />
            </div>
            <div className="flex justify-center flex-col items-center">
              <Button
                className="mb-0 bg-primary dark:bg-primary_dark before:bg-secondary text-white dark:hover:text-black"
                onClick={handleSavePersonalInfo}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? t("Saving") : t("SaveChanges")}
              </Button>
              <span
                className="pt-2 text-md font-medium text-primary dark:text-primary_dark cursor-pointer"
                onClick={() => setShowModal(true)}
              >
                {t("ResetPassword")}
              </span>
            </div>
            {showModal && (
              <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                <div className="bg-background dark:bg-background_dark rounded-2xl shadow-xl w-[400px] p-6 relative">
                  <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 text-gray-600"
                  >
                    <X
                      size={22}
                      className="rounded-2xl border-red-500 border-2 text-red-500 hover:text-red-800 hover:border-red-800 transition-all duration-300 ease-in-out"
                    />
                  </button>

                  {/* Password fields */}
                  <div className="space-y-5 pt-10">
                    <div className="flex items-center justify-between gap-4">
                      <label className="w-40 text-md font-medium text-black dark:text-white text-left">
                        {t("OldPassword")}:
                      </label>
                      <input
                        type="password"
                        placeholder={t("EnterOldPassword")}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="flex-1 py-2 px-3 rounded-md shadow-sm bg-secondary dark:bg-secondary_dark text-center sm:text-md text-primary dark:text-primary_dark focus:ring-2 focus:ring-primary focus:outline-none transition"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <label className="w-40 text-md font-medium text-black dark:text-white text-left">
                        {t("NewPassword")}:
                      </label>
                      <input
                        type="password"
                        placeholder={t("EnterNewPassword")}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="flex-1 py-2 px-3 rounded-md shadow-sm bg-secondary dark:bg-secondary_dark text-center sm:text-md text-primary dark:text-primary_dark focus:ring-2 focus:ring-primary focus:outline-none transition"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <label className="w-40 text-md font-medium text-black dark:text-white text-left">
                        {t("ConfirmPassword")}:
                      </label>
                      <input
                        type="password"
                        placeholder={t("ConfirmPassword")}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="flex-1 py-2 px-3 rounded-md shadow-sm bg-secondary dark:bg-secondary_dark text-center sm:text-md text-primary dark:text-primary_dark focus:ring-2 focus:ring-primary focus:outline-none transition"
                      />
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Button
                      className="mb-0 bg-primary dark:bg-primary_dark before:bg-secondary text-white dark:hover:text-black"
                      onClick={handlePasswordUpdate}
                      disabled={updatePasswordMutation.isPending}
                    >
                      {updatePasswordMutation.isPending
                        ? t("Saving")
                        : t("SaveChanges")}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Preferences */}
        <section className="w-full lg:w-1/2 mt-10 lg:mt-0">
          <h2 className="flex items-center gap-2 text-2xl font-semibold font-robotoCondensed  dark:text-white pb-6  ">
            {t("Preferences")}
          </h2>

          <div className="max-w-lg bg-accent dark:bg-accent_dark p-8 rounded-2xl shadow-xl space-y-6 transition-all duration-300">
            {/* Language */}
            <div className="flex items-center justify-between gap-6">
              <label className="w-40 text-md font-medium text-black dark:text-white">
                {t("Language")}:
              </label>
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="flex-1 bg-secondary dark:bg-secondary_dark py-2 px-4 rounded-md shadow-sm text-center sm:text-md text-primary dark:text-primary_dark focus:ring-2 focus:ring-primary focus:outline-none transition"
              >
                <option value="en">{t("English")}</option>
                <option value="ar">{t("Arabic")}</option>
              </select>
            </div>

            {/* Theme */}
            <Theme theme={theme} onThemeChange={changeTheme} />

            {/* Save Button */}
            <div className="flex justify-center pt-4">
              <Button
                className="mb-0 w-[10em] before:w-[210px] bg-primary dark:bg-primary_dark before:bg-secondary text-white dark:hover:text-black"
                onClick={savePreferences}
              >
                {t("SavePreferences")}
              </Button>
            </div>
          </div>
        </section>
      </section>
      <section className="flex flex-col lg:flex-row justify-around items-start w-full gap-8 mt-10">
        {/* Business Settings */}
        <section className="mt-10 w-full lg:w-1/2">
          {/* Section Title */}
          <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-semibold font-robotoCondensed text-black dark:text-white pb-4 sm:pb-6">
            {t("BusinessSettings")}
          </h2>

          <div className="max-w-lg bg-accent dark:bg-accent_dark p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl space-y-4 sm:space-y-6 transition-all duration-300">
            {/* Company Logo */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
              <label className="w-full sm:w-40 text-sm sm:text-md font-medium text-black dark:text-white">
                {t("CompanyLogo")}:
              </label>

              <div className="flex items-center gap-3 sm:gap-4 flex-1">
                {/* Logo Preview */}
                <img
                  src={logoPreview}
                  alt="logo"
                  className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded"
                />

                {/* File Input */}
                <label className="cursor-pointer flex-1">
                  <input
                    type="file"
                    className="hidden"
                    id="company-logo"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                  <div className="flex items-center justify-center py-2 px-3 rounded-md shadow-sm bg-secondary dark:bg-secondary_dark text-center text-xs sm:text-sm text-primary dark:text-primary_dark border border-transparent hover:border-primary dark:hover:border-primary_dark focus:ring-2 focus:ring-primary focus:outline-none transition ">
                    {logoFile ? t("ChangeImage") : t("UploadLogo")}
                  </div>
                </label>
                {logoFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview(
                        getImageUrl(currentCompany?.companyLogo) || ""
                      );
                      // Reset file input
                      const fileInput = document.getElementById("company-logo");
                      if (fileInput) fileInput.value = "";
                    }}
                    className="p-1.5 sm:p-2 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition flex-shrink-0"
                    title="Remove selected image"
                  >
                    <X size={14} className="sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Company Name  */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-6">
              <label className="text-sm sm:text-md font-medium text-black dark:text-white text-left">
                {t("BusinessName")}
              </label>
              <input
                type="text"
                value={companyName}
                placeholder={currentCompany?.name || "Company Name"}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full sm:flex-1 py-2 px-3 rounded-md shadow-sm bg-secondary dark:bg-secondary_dark text-center text-xs sm:text-sm text-primary dark:text-primary_dark focus:ring-2 focus:ring-primary focus:outline-none transition"
              />
            </div>

            {/* Invoice Prefix */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-6">
              <label className="w-full sm:w-40 text-sm sm:text-md font-medium text-black dark:text-white">
                {t("InvoicePrefix")}:
              </label>
              <input
                type="text"
                value={invoicePrefix}
                placeholder={currentCompany?.invoicePrefix || "INV-"}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-full sm:flex-1 py-2 px-3 rounded-md shadow-sm bg-secondary dark:bg-secondary_dark text-center text-xs sm:text-sm text-primary dark:text-primary_dark focus:ring-2 focus:ring-primary focus:outline-none transition"
              />
            </div>

            {/* Tax Rate */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-6">
              <label className="w-full sm:w-40 text-sm sm:text-md font-medium text-black dark:text-white">
                {t("TaxRate")} :
              </label>
              <input
                type="number"
                value={taxRate}
                placeholder={currentCompany?.taxRate || "14"}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full sm:flex-1 py-2 px-3 rounded-md shadow-sm bg-secondary dark:bg-secondary_dark text-center text-xs sm:text-sm text-primary dark:text-primary_dark focus:ring-2 focus:ring-primary focus:outline-none transition "
              />
            </div>

            {/* Currency */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-6">
              <label className="w-full sm:w-40 text-sm sm:text-md font-medium text-black dark:text-white">
                {t("Currency")} :
              </label>
              <select
                className="w-full sm:flex-1 bg-secondary dark:bg-secondary_dark py-2 px-4 rounded-md shadow-sm text-center text-xs sm:text-sm text-primary dark:text-primary_dark focus:ring-2 focus:ring-primary focus:outline-none transition "
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="EGP">{t("EGP")}</option>
                <option value="USD">{t("USD")}</option>
                <option value="EUR">{t("EUR")}</option>
              </select>
            </div>

            {/* Save Button */}
            <div className="flex justify-center pt-4 sm:pt-6">
              <Button
                className="mb-0 w-full sm:w-[16em] before:w-full sm:before:w-[336px] bg-primary dark:bg-primary_dark before:bg-secondary text-white dark:hover:text-black text-sm sm:text-base"
                onClick={handleSaveBusinessSettings}
                disabled={updateCompanyMutation.isPending}
              >
                {updateCompanyMutation.isPending
                  ? t("Saving")
                  : t("SaveBusinessSettings")}
              </Button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="mt-10 w-full lg:w-1/2">
          {/* Section Title */}
          <h2 className="flex items-center gap-2 text-2xl font-semibold font-robotoCondensed text-black dark:text-white pb-6">
            {t("DangerZone")}
          </h2>

          <div className="max-w-lg bg-accent dark:bg-accent_dark p-8 rounded-2xl shadow-xl space-y-6 transition-all duration-300 border border-red-800 dark:border-red-600">
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold dark:text-white text-lg">
                  {t("DeleteAccount")}
                </h3>
                <p className="dark:text-white text-sm">
                  {t("DeleteAccountText")}
                </p>
              </div>
              <button
                className="whitespace-nowrap text-white dark:text-black px-4 py-2 bg-red-800 dark:bg-red-600 rounded-md 
        hover:bg-red-700 dark:hover:bg-red-500 transition-all duration-300 w-full sm:w-auto"
                onClick={() => setDangerModal(true)}
              >
                {t("DeleteAccountButton")}
              </button>
            </div>
          </div>
          {dangerModal && (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
              <div className="bg-background dark:bg-background_dark rounded-2xl shadow-xl w-[90%] sm:w-[400px] p-6 relative transition-all duration-300">
                {/* Close Button */}
                <button
                  onClick={() => setDangerModal(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition-all duration-200"
                >
                  <X
                    size={22}
                    className="rounded-2xl border-red-500 border-2 text-red-500 hover:text-red-800 hover:border-red-800 transition-all duration-300 ease-in-out"
                  />
                </button>

                {/* Modal Content */}
                <div className="text-center space-y-4 mt-2">
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    {t("ModalContentHeading")}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {t("ModalContentText")}
                  </p>

                  <div className="flex justify-center gap-4 pt-4">
                    <button
                      onClick={() => setDangerModal(false)}
                      disabled={deleteAccountMutation.isPending}
                      className="px-4 py-2 bg-secondary dark:bg-secondary_dark text-black dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition"
                    >
                      {t("Cancel")}
                    </button>

                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteAccountMutation.isPending}
                      className="px-4 py-2 bg-red-800 dark:bg-red-600 text-white dark:text-black rounded-md hover:bg-red-700 dark:hover:bg-red-500 transition"
                    >
                      {deleteAccountMutation.isPending
                        ? t("Deleting")
                        : t("ConfirmDelete")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

export default Settings;
