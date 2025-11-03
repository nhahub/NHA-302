import React from "react";
import invoiceIcon from "../../assets/invoice-icon.png";
import assistantIcon from "../../assets/assistant-icon.png";
import inventoryIcon from "../../assets/inventory-icon.png";
import { useTranslation } from "react-i18next";

/**
 * @param {object} props
 * @param {string} props.icon
 */

const Card = ({ tip, icon }) => {
  const cardClasses = `
    flex items-center justify-center text-center space-x-4
    bg-primary/80 dark:bg-primary_dark/80
    h-[70px] w-[280px]
    rounded-[10px] text-white
    cursor-pointer
    transition-all duration-400 ease-in-out
    group-hover:blur-[10px] group-hover:scale-90
    hover:!blur-none hover:!scale-110
  `;

  return (
    <div className={`${cardClasses}`}>
      <img src={icon} alt={icon} className="w-[25px]" />
      <p className="text-2xl font-bold font-quicksand">{tip}</p>
    </div>
  );
};

const FocusedCards = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full flex justify-evenly group md:flex-wrap sm:flex-wrap flex-wrap gap-6">
      <Card tip={t("SmartInvoice")} icon={invoiceIcon} />
      <Card tip={t("AISmartAssistant")} icon={assistantIcon} />
      <Card tip={t("Inventory Control")} icon={inventoryIcon} />
    </div>
  );
};
export default FocusedCards;
