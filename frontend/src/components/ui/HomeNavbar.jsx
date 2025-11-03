import fullLogo from "../../assets/fulllogo.png";
import homeIcon from "../../assets/homen.png";
import featuresIcon from "../../assets/features.png";
import pricingIcon from "../../assets/pricing.png";
import contactIcon from "../../assets/contact.png";

import Button from "./Button";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";


const HomeNavbar = () => {
  const { t } = useTranslation();
  const navLinks = [
    { to: "home", label: t("Home"), icon: homeIcon },
    { to: "features", label: t("Features"), icon: featuresIcon },
    { to: "pricing", label: t("Pricing"), icon: pricingIcon },
    { to: "contact", label: t("Contact"), icon: contactIcon },
  ];

  // Hide on scroll down, show on scroll up
  const [show, setShow] = useState(true);
  const lastScrollY = useRef(window.scrollY);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setShow(false);
      } else {
        setShow(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Motion.nav
      initial={{ y: 0 }}
      animate={{ y: show ? 0 : -100, opacity: show ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-background dark:bg-background_dark sticky top-0 w-full mx-auto py-3 sm:py-4 px-4 sm:px-5 lg:px-6 2xl:px-8 z-50 font-quicksand shadow-md dark:shadow-gray-800/50"
      style={{ willChange: "transform, opacity" }}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">
        {/* Logo */}
        <div className="w-2/3 sm:w-1/2 md:w-2/5 lg:w-1/4 xl:w-1/5">
          <a href="/" className="block">
            <img src={fullLogo} alt="PayFlow Logo" className="w-full" />
          </a>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center justify-center w-full sm:w-auto lg:flex-1 lg:max-w-md xl:max-w-lg">
          <div className="flex items-baseline space-x-2 sm:space-x-3 md:space-x-4 bg-secondary dark:bg-secondary_dark px-3 sm:px-4 py-2 rounded-lg justify-between w-full">
            {navLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => {
                  const section = document.getElementById(link.to + "-section");
                  if (section) {
                    section.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="flex-1 min-w-0 max-w-[90px] sm:max-w-[100px] text-black dark:text-white hover:bg-primary/50 dark:hover:bg-primary_dark/50 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-bold flex flex-col items-center space-y-1 transition-colors duration-300 font-quicksand"
              >
                <img
                  src={link.icon}
                  alt={link.label + " icon"}
                  className="h-4 w-4 sm:h-5 sm:w-5 mb-1"
                />
                <span className="truncate w-full text-center">{link.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-3 sm:space-x-4 w-full sm:w-auto">
          <Button className="w-full sm:w-24 md:w-28 py-2 h-auto text-sm sm:text-base bg-transparent border-transparent">
            <a href="login" className="text-xs sm:text-sm font-bold dark:text-white">
              {t("Login")}
            </a>
          </Button>
          <Button className="w-full sm:w-24 md:w-28 py-2 h-auto text-sm sm:text-base">
            <a href="signup" className="text-xs sm:text-sm font-bold">
              {t("SignUp")}
            </a>
          </Button>
        </div>
      </div>
    </Motion.nav>
  );
};

export default HomeNavbar;
