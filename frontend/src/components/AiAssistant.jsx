import WobbleEffect from "./WobbleEffect";
import userIcon from "../assets/user.png";
import userDarkIcon from "../assets/user-dark.png";
import ChatComponent from "./ChatComponent";
import { useUserContext } from "../features/user/useUserContext";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
function AiAssistant() {
  const { t } = useTranslation();
  const { currentUser } = useUserContext();
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  return (
    <section className="my-10">
      <h1 className="flex justify-center gap-2 items-center text-2xl font-robotoCondensed dark:text-white">
        <img src={isDarkMode ? userDarkIcon : userIcon} alt="user" width={20} height={20} />
        {t("WelcomeBack")} {currentUser.username}!
      </h1>
      <WobbleEffect />
      <p className="flex justify-center font-robotoCondensed pt-5 text-center dark:text-white">
        {t("ParagraphWelcomeBack")}
      </p>
      <ChatComponent />
    </section>
  );
}

export default AiAssistant;
