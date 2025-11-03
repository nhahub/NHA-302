import { useLanguage } from "./LanguageContext";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

export const usePreferences = () => {
  const { language, changeLanguage } = useLanguage();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const { t } = useTranslation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const savePreferences = () => {
    localStorage.setItem("language", language);
    localStorage.setItem("theme", theme);
    console.log("✅ Preferences saved:", { language, theme });
    toast.success(t("PrefrenceToast") || "Preferences saved successfully");
  };

  return { language, changeLanguage, theme, changeTheme, savePreferences };
};
