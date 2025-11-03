import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
function MonthSelector({ onChange }) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const minYear = 2020;
  const maxYear = 2030;

  const [showMenu, setShowMenu] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("August");
  const [selectedYear, setSelectedYear] = useState(2025);

  const handleNextYear = () => {
    setSelectedYear((prev) => (prev < maxYear ? prev + 1 : prev));
  };

  const handlePrevYear = () => {
    setSelectedYear((prev) => (prev > minYear ? prev - 1 : prev));
  };

  const handleSelectMonth = (month) => {
    setSelectedMonth(month);
    setShowMenu(false);
    if (onChange) onChange(month, selectedYear); // 🔹 نرجع القيم للأب
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu((prev) => !prev)}
        className="p-3 rounded-full border-2 border-background dark:border-background_dark bg-accent dark:bg-accent_dark hover:bg-primary dark:hover:bg-primary_dark hover:text-white dark:hover:text-black transition-all duration-300"
      >
        <FaCalendarAlt className="text-xl" />
      </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute right-0 mt-3 bg-[#cde2ea] border border-[#579bb1] rounded-2xl shadow-lg p-3 z-20 w-44 text-center"
          >
            <div className="flex items-center justify-between mb-2 border-b border-[#579bb1]/40 pb-2">
              <button
                onClick={handlePrevYear}
                disabled={selectedYear <= minYear}
                className="text-[#1f2e40] hover:text-primary dark:hover:text-primary_dark disabled:opacity-30 transition"
              >
                <FaChevronLeft />
              </button>
              <span className="text-primary dark:text-primary_dark font-bold text-lg">
                {selectedYear}
              </span>
              <button
                onClick={handleNextYear}
                disabled={selectedYear >= maxYear}
                className="text-[#1f2e40] hover:text-primary dark:hover:text-primary_dark disabled:opacity-30 transition"
              >
                <FaChevronRight />
              </button>
            </div>

            <div className="overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-[#579bb1]/50 rounded-xl">
              {months.map((month) => (
                <div
                  key={month}
                  onClick={() => handleSelectMonth(month)} // ✅ هنا
                  className={`cursor-pointer py-2 text-[15px] font-semibold rounded-lg transition ${
                    selectedMonth === month
                      ? "text-primary dark:text-primary_dark bg-[#e8f5f9]"
                      : "text-[#1f2e40] hover:bg-[#d5edf4]"
                  }`}
                >
                  {month}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MonthSelector;
