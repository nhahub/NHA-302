import { createContext, useContext, useEffect, useState } from "react";
import i18n from "../lib/i18n";

const LanguageContext = createContext();
export const LangaugeProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Load from localStorage or default to i18n.language or 'en'
    return localStorage.getItem("language") || i18n.language || "en";
  });
  useEffect(() => {
    // Apply saved language on first render
    i18n.changeLanguage(language);
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
    localStorage.setItem("language", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
