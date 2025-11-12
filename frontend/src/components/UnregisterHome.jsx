import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import Button from "./ui/Button";
import StepCard from "./ui/StepCard";
import FocusedCards from "./ui/FocusedCards";
import HomeNavbar from "./ui/HomeNavbar";
import dashboardImg from "../assets/dashboard.png";
import playIcon from "../assets/play-icon.png";
import playIconW from "../assets/play-icon-w.png";
import dashboardIcon from "../assets/dashboard-icon.png";
import FeatureCard from "./ui/FeatureCard";
import aiIcon from "../assets/ai-icon.png";
import reportsIcon from "../assets/reports-icon.png";
import productsIcon from "../assets/products-icon.png";
import databaseIcon from "../assets/database-icon.png";
import invoiceIcon from "../assets/invoice-icon-b.png";
import addProductIcon from "../assets/add-product-icon.png";
import orderIcon from "../assets/order-icon.png";
import TestimonialSlider from "./ui/TestimonialSlider";
import Footer from "./ui/Footer";
import FloatingWhatsApp from "./ui/FloatingWhatsApp";
import { useTranslation } from "react-i18next";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeInDown = {
  hidden: { opacity: 0, y: -60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.8 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const floatingAnimation = {
  y: [0, -20, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

function UnregisterHome() {
  const { t } = useTranslation();
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show button after user scrolls down 300px
      setShowTopBtn(window.pageYOffset > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // run once in case page is already scrolled
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <>
      <HomeNavbar />
      <FloatingWhatsApp />

  <header id="home-section" className="bg-background dark:bg-background_dark min-h-screen flex flex-col items-center justify-center space-y-4 sm:space-y-6 text-center px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20 relative overflow-hidden">
        {/* Animated background gradient circles */}
        <div className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-primary/10 dark:bg-primary_dark/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-accent/10 dark:bg-accent_dark/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <Motion.h1 
          className="font-robotoCondensed text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold max-w-4xl text-black dark:text-white relative z-10 px-2"
          initial="hidden"
          animate="visible"
          variants={fadeInDown}
        >
          {t("HeaderH1")}
        </Motion.h1>
        <Motion.p 
          className="font-quicksand font-bold text-sm sm:text-base lg:text-lg text-gray-800 dark:text-gray-300 relative z-10 px-2"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
        >
          {t("HeaderParg")}
        </Motion.p>
        <Motion.div
          className="relative z-10 w-full px-2"
          initial="hidden"
          animate="visible"
          variants={scaleIn}
          transition={{ delay: 0.4 }}
        >
          <FocusedCards />
        </Motion.div>

        <Motion.div 
          className="flex flex-col lg:flex-row items-center justify-center bg-accent dark:bg-accent_dark rounded-2xl sm:rounded-3xl px-4 sm:px-6 lg:px-12 py-8 sm:py-12 w-full max-w-6xl mx-auto gap-6 sm:gap-8 relative z-10 border-2 border-transparent hover:border-primary/30 dark:hover:border-primary_dark/30 transition-all duration-500 shadow-xl dark:shadow-gray-800/50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          <Motion.div 
            className="w-full lg:w-1/2 flex items-center justify-center"
            variants={slideInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Motion.img
              src={dashboardImg}
              alt="Dashboard preview"
              className="w-full h-auto rounded-lg shadow-2xl dark:shadow-gray-900/50 border-2 border-primary/10 dark:border-primary_dark/10"
              animate={floatingAnimation}
            />
          </Motion.div>
          <Motion.div 
            className="w-full lg:w-1/2 flex items-center justify-center"
            variants={slideInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="bg-background dark:bg-background_dark rounded-xl px-4 sm:px-6 lg:px-10 py-6 sm:py-8 shadow-2xl dark:shadow-gray-800 text-center w-full border-2 border-primary/20 dark:border-primary_dark/20 hover:border-primary/40 dark:hover:border-primary_dark/40 transition-all duration-500">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8 font-robotoCondensed text-black dark:text-white">
                {t("BusinessOwner")}
              </h3>
              <p className="text-sm sm:text-base lg:text-lg font-quicksand font-bold text-gray-800 dark:text-gray-300">
                "{t("BusinessOwnerTestimonial")}"
              </p>
            </div>
          </Motion.div>
        </Motion.div>

        <Motion.div 
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-2 w-full sm:w-auto px-4"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <Motion.div 
            variants={fadeInUp}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="w-full sm:w-auto"
          >
            <Button className="shadow-lg hover:shadow-2xl transition-shadow duration-300 ">
              <a href="/signup" className="font-quicksand font-bold">
                {t("StartNow")}
              </a>
            </Button>
          </Motion.div>
          <Motion.div 
            variants={fadeInUp}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="w-full sm:w-auto"
          >
            <Button className="bg-transparent border-transparent dark:bg-transparent dark:border-transparent group relative overflow-hidden w-full ">
              <a
                href="/"
                className="text-primary dark:text-primary_dark flex items-center justify-center gap-2 font-quicksand font-bold group-hover:text-white transition-colors duration-300 relative"
              >
                <span className="relative w-[25px] h-[25px] inline-block">
                  <img
                    src={playIcon}
                    alt="Play now"
                    className="absolute inset-0 w-full h-full opacity-100 group-hover:opacity-0 transition-transform duration-1000 group-hover:scale-125"
                  />
                  <img
                    src={playIconW}
                    alt="Play now white"
                    className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  />
                </span>
                {t("StartDemo")}
              </a>
            </Button>
          </Motion.div>
        </Motion.div>
      </header>
      <main className="bg-background dark:bg-background_dark pt-6 sm:pt-10 lg:pt-20 px-4 sm:px-6 lg:px-10">
        <Motion.section 
          id="features-section"
          className="py-6 sm:py-10 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeIn}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-primary/5 dark:bg-primary_dark/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-56 h-56 sm:w-80 sm:h-80 bg-accent/5 dark:bg-accent_dark/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-2 sm:px-4 relative z-10">
            <Motion.h2 
              className="font-robotoCondensed text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4 lg:mb-6 text-center text-black dark:text-white"
              variants={fadeInDown}
            >
              PayFlow {t("Features")}
            </Motion.h2>
            <Motion.p 
              className="text-center font-quicksand mb-3 sm:mb-4 font-bold text-sm sm:text-base text-gray-800 dark:text-gray-300 px-2"
              variants={fadeInUp}
            >
              {t("FeaturesParg")}
            </Motion.p>
            <Motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mt-6 sm:mt-8 justify-items-center"
              variants={staggerContainer}
            >
              <Motion.div 
                variants={scaleIn} 
                whileHover={{ scale: 1.05, rotate: 1 }} 
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <FeatureCard
                  icon={dashboardIcon}
                  title={t("SmartDashboardTitle")}
                  features={[
                    t("SmartDashboardFeature1"),
                    t("SmartDashboardFeature2"),
                    t("SmartDashboardFeature3"),
                  ]}
                />
              </Motion.div>
              <Motion.div 
                variants={scaleIn} 
                whileHover={{ scale: 1.05, rotate: -1 }} 
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <FeatureCard
                  icon={invoiceIcon}
                  title={t("AIInvoiceTitle")}
                  features={[
                    t("AIInvoiceFeature1"),
                    t("AIInvoiceFeature2"),
                    t("AIInvoiceFeature3"),
                  ]}
                />
              </Motion.div>
              <Motion.div 
                variants={scaleIn} 
                whileHover={{ scale: 1.05, rotate: 1 }} 
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <FeatureCard
                  icon={productsIcon}
                  title={t("StockManagementTitle")}
                  features={[
                    t("StockManagementFeature1"),
                    t("StockManagementFeature2"),
                    t("StockManagementFeature3"),
                  ]}
                />
              </Motion.div>
              <Motion.div 
                variants={scaleIn} 
                whileHover={{ scale: 1.05, rotate: -1 }} 
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <FeatureCard
                  icon={databaseIcon}
                  title={t("CustomerDatabaseTitle")}
                  features={[
                    t("CustomerDatabaseFeature1"),
                    t("CustomerDatabaseFeature2"),
                    t("CustomerDatabaseFeature3"),
                  ]}
                />
              </Motion.div>
              <Motion.div 
                variants={scaleIn} 
                whileHover={{ scale: 1.05, rotate: 1 }} 
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <FeatureCard
                  icon={aiIcon}
                  title={t("AIAssistantTitle")}
                  features={[
                    t("AIAssistantFeature1"),
                    t("AIAssistantFeature2"),
                    t("AIAssistantFeature3"),
                  ]}
                />
              </Motion.div>
              <Motion.div 
                variants={scaleIn} 
                whileHover={{ scale: 1.05, rotate: -1 }} 
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <FeatureCard
                  icon={reportsIcon}
                  title={t("BusinessReportsTitle")}
                  features={[
                    t("BusinessReportsFeature1"),
                    t("BusinessReportsFeature2"),
                    t("BusinessReportsFeature3"),
                  ]}
                />
              </Motion.div>
            </Motion.div>
          </div>
        </Motion.section>
        <Motion.section 
          
          className="py-12 sm:py-16 lg:py-20 mt-6 sm:mt-10 bg-background dark:bg-transparent relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeIn}
        >
          {/* Decorative animated circles */}
          <div className="absolute top-10 right-10 w-32 h-32 sm:w-40 sm:h-40 bg-primary/5 dark:bg-primary_dark/5 rounded-full blur-2xl animate-pulse pointer-events-none"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 sm:w-56 sm:h-56 bg-accent/5 dark:bg-accent_dark/5 rounded-full blur-2xl animate-pulse delay-700 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-4 bg-secondary dark:bg-secondary_dark rounded-2xl sm:rounded-3xl py-8 sm:py-12 shadow-xl dark:shadow-gray-800 text-center relative z-10 border-2 border-primary/10 dark:border-primary_dark/10">
            <Motion.h2 
              className="font-robotoCondensed text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4 lg:mb-6 text-center text-black dark:text-white px-2"
              variants={fadeInDown}
            >
              {t("HowToStartTitle")}
            </Motion.h2>
            <Motion.p 
              className="text-center font-quicksand mb-3 sm:mb-4 font-bold text-sm sm:text-base text-gray-800 dark:text-gray-300 px-2"
              variants={fadeInUp}
            >
              {t("HowToStartSubtitle")}
            </Motion.p>
            <Motion.p 
              className="font-quicksand mt-3 mb-4 text-xs sm:text-sm text-primary dark:text-primary_dark md:hidden"
              variants={fadeInUp}
            >
              ← Swipe to see all steps →
            </Motion.p>
            <Motion.div 
              className="flex flex-col gap-2 justify-center md:flex-row lg:px-12 xl:px-20 sm:p-4 md:p-8 overflow-x-auto snap-x snap-mandatory horizontal-scroll"
              variants={staggerContainer}
            >
              <Motion.div 
                className="flex-shrink-0 w-full px-2 md:w-[calc(33.333%-1.35rem)] snap-center"
                variants={slideInLeft} 
                whileHover={{ scale: 1.08, y: -10, rotate: 2 }} 
                transition={{ type: "spring", stiffness: 400, damping: 12 }}
              >
                <StepCard
                  step={1}
                  icon={addProductIcon}
                  title={t("Step1Title")}
                  description={t("Step1Desc")}
                  iconSize={8}
                />
              </Motion.div>
              <Motion.div 
                className="flex-shrink-0 w-full px-2 md:w-[calc(33.333%-1.35rem)] snap-center"
                variants={scaleIn} 
                whileHover={{ scale: 1.08, y: -10 }} 
                transition={{ type: "spring", stiffness: 400, damping: 12 }}
              >
                <StepCard
                  step={2}
                  icon={orderIcon}
                  title={t("Step2Title")}
                  description={t("Step2Desc")}
                  iconSize={8}
                />
              </Motion.div>
              <Motion.div 
                className="flex-shrink-0 w-full px-2 md:w-[calc(33.333%-1.35rem)] snap-center"
                variants={slideInRight} 
                whileHover={{ scale: 1.08, y: -10, rotate: -2 }} 
                transition={{ type: "spring", stiffness: 400, damping: 12 }}
              >
                <StepCard
                  step={3}
                  icon={invoiceIcon}
                  title={t("Step3Title")}
                  description={t("Step3Desc")}
                  iconSize={6}
                />
              </Motion.div>
            </Motion.div>
            <Motion.div 
              className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
            >
              <Motion.img 
                src={aiIcon} 
                alt="AI Insights" 
                className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-lg"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
              >
              </Motion.img>
              <h3 className="font-quicksand text-lg sm:text-xl lg:text-3xl font-bold text-black dark:text-white">
                {t("AIInsights")}
              </h3>
            </Motion.div>
          </div>
        </Motion.section>

        <Motion.section 
          id="pricing-section"
          className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-background via-transparent to-background dark:from-background_dark dark:via-transparent dark:to-background_dark mt-6 sm:mt-10 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeIn}
        >
          {/* Animated background elements */}
          <div className="absolute top-20 left-5 w-64 h-64 sm:w-96 sm:h-96 bg-primary/5 dark:bg-primary_dark/5 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
          <div className="absolute bottom-20 right-5 w-56 h-56 sm:w-80 sm:h-80 bg-accent/5 dark:bg-accent_dark/5 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-6 sm:mb-10">
              <Motion.h2 
                className="font-robotoCondensed text-3xl sm:text-4xl lg:text-5xl font-extrabold text-black dark:text-white"
                variants={fadeInDown}
              >
                {t("PricingTitle")}
              </Motion.h2>
              <Motion.p 
                className="font-quicksand mt-2 font-bold text-base sm:text-lg text-gray-800 dark:text-gray-300 px-2"
                variants={fadeInUp}
              >
                {t("PricingSubtitle")}
              </Motion.p>
              <Motion.p 
                className="font-quicksand mt-3 text-xs sm:text-sm text-primary dark:text-primary_dark md:hidden"
                variants={fadeInUp}
              >
                ← Swipe to see more →
              </Motion.p>
            </div>

            <Motion.div 
              className="flex flex-col md:flex-row gap-8 sm:gap-10 lg:gap-14 items-stretch py-6 sm:py-10 mt-8 sm:mt-12 lg:mt-20 overflow-x-auto pb-4 px-4 sm:px-8 md:px-16 lg:px-32 snap-x snap-mandatory horizontal-scroll"
              variants={staggerContainer}
            >
              <Motion.div 
                className="flex-shrink-0 w-full md:w-[calc(50%-1.75rem)] bg-background dark:bg-background_dark rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl dark:shadow-gray-800 border-2 border-accent dark:border-accent_dark transform hover:bg-accent dark:hover:bg-accent_dark hover:-translate-y-2 hover:shadow-3xl transition-all duration-700 md:scale-105 snap-center relative overflow-hidden"
                variants={slideInLeft}
                whileHover={{ 
                  scale: 1.08, 
                  y: -15,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 relative z-10 gap-3">
                  <div className="flex items-center gap-3 mb-0">
                    <img src={dashboardIcon} alt="starter" className="w-8 sm:w-10" />
                    <div>
                      <h3 className="text-xl sm:text-2xl font-quicksand font-extrabold text-black dark:text-white">
                        {t("FreeStarterTitle")}
                      </h3>
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-3xl sm:text-4xl font-quicksand font-extrabold text-black dark:text-white">
                      0 <span className="text-xs sm:text-sm font-quicksand">EGP</span>
                    </div>
                    <div className="text-xs font-quicksand text-gray-400 dark:text-gray-500">
                      {t("Forever")}
                    </div>
                  </div>
                </div>

                <ul className="mb-4 sm:mb-6 space-y-2 grow">
                  <li className="flex items-center gap-3 text-base sm:text-lg font-quicksand font-bold text-start text-gray-800 dark:text-gray-300">
                    <span className="text-primary dark:text-primary_dark">•</span>{" "}
                    {t("FreeStarterFeature1")}
                  </li>
                  <li className="flex items-center gap-3 text-base sm:text-lg font-quicksand font-bold text-start text-gray-800 dark:text-gray-300">
                    <span className="text-primary dark:text-primary_dark">•</span>{" "}
                    {t("FreeStarterFeature2")}
                  </li>
                  <li className="flex items-center gap-3 text-base sm:text-lg font-quicksand font-bold text-start text-gray-800 dark:text-gray-300">
                    <span className="text-primary dark:text-primary_dark">•</span>{" "}
                    {t("FreeStarterFeature3")}
                  </li>
                </ul>

                <div className="flex flex-col items-center">
                  <Button className="w-48">
                    <a href="/signup" className="font-quicksand font-bold">
                      {t("StartFree")}
                    </a>
                  </Button>
                  <p className="text-xs text-center text-gray-400 dark:text-gray-500 font-quicksand mt-2">
                    {t("NoCardRequired")}
                  </p>
                </div>
              </Motion.div>

              <Motion.div 
                className="flex-shrink-0 w-full md:w-[calc(50%-1.75rem)] bg-background dark:bg-background_dark rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl dark:shadow-gray-800 border-2 border-accent dark:border-accent_dark transform hover:bg-accent dark:hover:bg-accent_dark hover:-translate-y-2 hover:shadow-3xl transition-all duration-700 md:scale-105 snap-center relative overflow-hidden"
                variants={slideInRight}
                whileHover={{ 
                  scale: 1.08, 
                  y: -15,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 relative z-10 gap-3">
                  <div className="flex items-center gap-3 mb-0">
                    <img src={invoiceIcon} alt="payg" className="w-7 sm:w-8" />
                    <div>
                      <h3 className="text-xl sm:text-2xl font-quicksand font-extrabold text-black dark:text-white">
                        {t("PayAsYouGoTitle")}
                      </h3>
                      <p className="text-xs sm:text-sm font-quicksand font-medium text-gray-400 dark:text-gray-500">
                        {t("PayAsYouGoSubtitle")}
                      </p>
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-3xl sm:text-4xl font-quicksand font-extrabold text-black dark:text-white">
                      2 <span className="text-xs sm:text-sm font-quicksand">EGP</span>
                    </div>
                    <div className="text-xs font-quicksand text-gray-400 dark:text-gray-500">
                      {t("PerInvoice")}
                    </div>
                  </div>
                </div>

                <ul className="mb-4 sm:mb-6 space-y-2">
                  <li className="flex items-center gap-3 text-base sm:text-lg font-quicksand font-bold text-start text-gray-800 dark:text-gray-300">
                    <span className="text-primary dark:text-primary_dark">•</span>{" "}
                    {t("PayAsYouGoFeature1")}
                  </li>
                  <li className="flex items-center gap-3 text-base sm:text-lg font-quicksand font-bold text-start text-gray-800 dark:text-gray-300">
                    <span className="text-primary dark:text-primary_dark">•</span>{" "}
                    {t("PayAsYouGoFeature2")}
                  </li>
                  <li className="flex items-center gap-3 text-base sm:text-lg font-quicksand font-bold text-start text-gray-800 dark:text-gray-300">
                    <span className="text-primary dark:text-primary_dark">•</span>{" "}
                    {t("PayAsYouGoFeature3")}
                  </li>
                  <li className="flex items-center gap-3 text-base sm:text-lg font-quicksand font-bold text-start text-gray-800 dark:text-gray-300">
                    <span className="text-primary dark:text-primary_dark">•</span>{" "}
                    {t("PayAsYouGoFeature4")}
                  </li>
                </ul>

                <div className="flex flex-col items-center">
                  <Button className="bg-primary dark:bg-primary_dark before:bg-secondary dark:before:bg-secondary_dark group w-48 ">
                    <a
                      href="/pricing"
                      className="font-quicksand font-bold text-white transition-all duration-1000 group-hover:text-black dark:group-hover:text-white"
                    >
                      {t("AddCredit")}
                    </a>
                  </Button>
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center font-quicksand mt-2">
                    {t("PerfectFor")}
                  </p>
                </div>
              </Motion.div>
            </Motion.div>
          </div>
        </Motion.section>

        <Motion.section 
          className="py-12 sm:py-16 bg-gradient-to-b from-background via-transparent to-background dark:from-background_dark dark:via-transparent dark:to-background_dark mt-6 sm:mt-10 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeIn}
        >
          {/* Decorative floating elements */}
          <div className="absolute top-10 left-10 sm:left-20 w-48 h-48 sm:w-64 sm:h-64 bg-primary/5 dark:bg-primary_dark/5 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 sm:right-20 w-56 h-56 sm:w-72 sm:h-72 bg-accent/5 dark:bg-accent_dark/5 rounded-full blur-3xl animate-pulse delay-500 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-6 sm:mb-10">
              <Motion.h2 
                className="font-robotoCondensed text-3xl sm:text-4xl lg:text-5xl font-extrabold text-black dark:text-white"
                variants={fadeInDown}
              >
                {t("TestimonialsTitle")}
              </Motion.h2>
              <Motion.p 
                className="font-quicksand mt-2 font-bold text-base sm:text-lg text-gray-800 dark:text-gray-300 px-2"
                variants={fadeInUp}
              >
                {t("TestimonialsSubtitle")}
              </Motion.p>
            </div>
            <Motion.div 
              className="bg-secondary dark:bg-secondary_dark rounded-2xl sm:rounded-3xl shadow-2xl dark:shadow-gray-800 w-full md:w-4/5 flex items-center justify-center mx-auto p-3 sm:p-4 border-2 border-primary/10 dark:border-primary_dark/10 hover:border-primary/20 dark:hover:border-primary_dark/20 transition-all duration-500"
              variants={scaleIn}
              whileHover={{ scale: 1.02 }}
            >
              <TestimonialSlider />
            </Motion.div>
          </div>
        </Motion.section>

        <Motion.div
          id="contact-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeInUp}
        >
          <Footer />
        </Motion.div>
          {/* Back to top floating button */}
          <AnimatePresence>
            {showTopBtn && (
              <Motion.button
                key="back-to-top"
                aria-label={t ? t("BackToTop") : "Back to top"}
                title={t ? t("BackToTop") : "Back to top"}
                onClick={scrollToTop}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="fixed left-6 bottom-6 z-50 bg-primary dark:bg-primary_dark text-white p-3 rounded-full shadow-lg hover:shadow-2xl transition-transform duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  {/* Chevron up */}
                  <path fillRule="evenodd" d="M3.293 11.293a1 1 0 011.414 0L10 5.586l5.293 5.707a1 1 0 001.414-1.414l-6-6a1 1 0 00-1.414 0l-6 6a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </Motion.button>
            )}
          </AnimatePresence>
      </main>
    </>
  );
}

export default UnregisterHome;
