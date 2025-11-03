import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { navItems } from "../utils/constants";
// icons

import logoIcon from "../assets/logo.png";
import sideBarIcon from "../assets/sidebar.png";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

function UserComponent() {
  const [isOpen, setIsOpen] = useState(() => {
    // Check screen size on initial load
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 640; // Open only on sm and larger screens
    }
    return true;
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Handle window resize to close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    toast.success(t("LogoutToast"));
    navigate("/");
  };

  return (
    <main className="flex h-screen  ">
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "w-64" : "w-20"
        } bg-secondary dark:text-white dark:bg-secondary_dark  p-5 space-y-3 transition-all duration-300`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <img
            src={logoIcon}
            alt="Logo"
            className={`
            transition-all duration-300
            w-10 h-10
            block                                  
            sm:${isOpen ? "block" : "hidden"}       
            `}
            title="Logo"
          />

          <img
            src={sideBarIcon}
            alt="Toggle Sidebar"
            className={`
      cursor-pointer transition-transform duration-300
      hidden sm:block                         /* Only show on large screens */
      ${isOpen ? "w-6 h-6" : "w-8 h-8 mx-auto"}
    `}
            onClick={() => setIsOpen(!isOpen)}
            title="Toggle Sidebar"
          />
        </div>

        {/* Navigation links */}
        <ul className="space-y-2 ">
          {navItems.map(({ to, icon, activeIcon, darkIcon, label }) => (
            <li key={to}>
              {label === "Logout" ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-2 w-full rounded hover:bg-accent hover:dark:bg-accent_dark transition-colors duration-200 "
                >
                  <img 
                    src={isDarkMode ? darkIcon : icon} 
                    alt={label} 
                    className="w-5 h-5" 
                  />
                  {isOpen && <span className="text-gray-800 dark:text-white">{t(label)}</span>}
                </button>
              ) : (
                <NavLink
                  to={to}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-2 rounded transition-colors duration-200 
             ${
               isActive
                 ? "bg-accent dark:bg-accent_dark text-white "
                 : "hover:bg-accent hover:dark:bg-accent_dark"
             }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <img
                        src={isActive && activeIcon ? activeIcon : (isDarkMode ? darkIcon : icon)}
                        alt={label}
                        className="w-5 h-5"
                      />
                      {isOpen && (
                        <span
                          className={`${
                            isActive
                              ? "text-primary dark:text-primary_dark font-medium"
                              : "text-gray-800 dark:text-white"
                          }`}
                        >
                          {t(label)}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content area */}
      <section className="flex-1 bg-background dark:bg-background_dark overflow-y-auto">
        <Outlet />
      </section>
    </main>
  );
}

export default UserComponent;
