import React from "react";
import payflowLogo from "../../assets/fullLogo.png";
import linkedinIcon from "../../assets/linkedin-icon.png";
import facebookIcon from "../../assets/facebook-icon.png";
import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-background dark:bg-background_dark pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-7 border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo and tagline */}
        <div className="text-center mb-6 sm:mb-8">
          <img
            src={payflowLogo}
            alt="PayFlow Logo"
            className="w-3/4 sm:w-1/2 md:w-2/5 lg:w-1/3 xl:w-1/4 mx-auto"
          />
          <p className="font-quicksand mt-3 sm:mt-4 font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-300 px-2">
            {t("FooterTagline")}
          </p>
        </div>

        <div className="border-t border-gray-300/50 dark:border-gray-600/50 w-full mx-auto"></div>

        {/* Contact and social */}
        <div className="mx-auto w-full md:w-4/5 lg:w-2/3 flex flex-col md:flex-row justify-between items-center my-6 sm:my-8 gap-6 sm:gap-8">
          <div className="w-full md:w-auto text-center md:text-left">
            <h3 className="font-robotoCondensed text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-black dark:text-white">
              {t("ContactUsTitle")}
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-x-4 lg:gap-x-6 gap-y-2 font-quicksand font-bold text-sm sm:text-base text-gray-700 dark:text-gray-300">
              <span>• {t("SupportEmail")}</span>
              <span>• {t("SupportPhone")}</span>
              <span>• {t("SupportLocation")}</span>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-4 sm:space-x-6">
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-110 transition-transform duration-300"
            >
              <img
                src={linkedinIcon}
                alt="LinkedIn"
                className="w-8 h-8 sm:w-10 sm:h-10 hover:opacity-80 transition-opacity"
              />
            </a>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-110 transition-transform duration-300"
            >
              <img
                src={facebookIcon}
                alt="Facebook"
                className="w-8 h-8 sm:w-10 sm:h-10 hover:opacity-80 transition-opacity"
              />
            </a>
          </div>
        </div>

        <div className="border-t border-gray-300/50 dark:border-gray-600/50 w-full mx-auto"></div>

        {/* Copyright */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="font-quicksand text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-300 px-2">
            © 2025 PayFlow. {t("FooterRights")}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
