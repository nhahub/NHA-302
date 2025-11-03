import { useTranslation } from "react-i18next";

export default function Theme({ theme, onThemeChange }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-6">
      <label className="w-40 text-md font-medium text-black dark:text-white">
        {t("Theme")}:
      </label>
      <select
        value={theme}
        onChange={(e) => onThemeChange(e.target.value)}
        className="flex-1 bg-secondary dark:bg-secondary_dark py-2 px-4 rounded-md shadow-sm text-center sm:text-md text-primary dark:text-primary_dark focus:ring-2 focus:ring-primary focus:outline-none transition"
      >
        <option value="light">{t("Light")}</option>
        <option value="dark">{t("Dark")}</option>
      </select>
    </div>
  );
}
