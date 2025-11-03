import { useEffect, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import Button from "./ui/Button";
import { useTranslation } from "react-i18next";

export default function ErrorPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsRegistered(!!user);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-background dark:bg-background_dark px-4">
      <AnimatePresence>
        {isMounted && (
          <Motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            <h1 className="text-[clamp(100px,20vw,160px)] font-mono text-black dark:text-white leading-none">
              {isRegistered ? (
                "404"
              ) : (
                <AlertTriangle
                  size={140}
                  className="text-black dark:text-white mb-2"
                />
              )}
            </h1>

            <h2 className="text-[clamp(26px,4vw,40px)] font-light text-black dark:text-white mt-2 bg-[linear-gradient(to_top,_#579BB1_50%,_transparent_50%)] px-3 rounded">
              {isRegistered ? t("PageNotFound") : t("NotRegistered")}
            </h2>

            <p className="mt-2 text-black dark:text-white">
              {isRegistered ? t("PageNotFoundText") : t("NotRegisteredText")}
            </p>
            <Button className="dark:text-white dark:bg-secondary_dark hover:dark:bg-primary_dark ">
              <Link to={isRegistered ? "/dashboard" : "/signup"}>
                {isRegistered ? t("GoToDashboard") : t("GoToSignUp")}
              </Link>
            </Button>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
