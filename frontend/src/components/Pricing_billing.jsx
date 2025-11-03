import PricingIcon from "../assets/pricing_section.png";
import BillingIcon from "../assets/billing.png";
import visaIcon from "../assets/visa.png";
import DarkPricingIcon from "../assets/pricing_section -dark.png";
import DarkBillingIcon from "../assets/billing -dark.png";
import DarkvisaIcon from "../assets/visa - dark.png";
import Button from "./ui/Button";
import AddNewCard from "../assets/add_visa.png";
import DarkAddNewCard from "../assets/add-icon.png";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import UsageOverviwIcon from "../assets/usage_overview.png";
import DarkUsageOverviwIcon from "../assets/usage_overview-dark.png";
import ProgressBar from "./ui/ProgressBar";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useUserContext } from "../features/user/useUserContext";
import {
  useBilling,
  useAttachCard,
  useRemoveCard,
} from "../features/pricing_billing/usePricing_BillingQuery";
import { useTranslation } from "react-i18next";
import Loader from "./Loader";
import toast from "react-hot-toast";

function Pricing_billing() {
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
  const { t } = useTranslation();
  const { currentUser } = useUserContext();
  const [showModal, setShowModal] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const [loadingCard, setLoadingCard] = useState(false);
  const { data, isLoading, error } = useBilling();
  const attachCardMutation = useAttachCard();
  const { mutate: removeCardMutation } = useRemoveCard();
  const [removingCardId, setRemovingCardId] = useState(null);

  const billing = data?.data;
  console.log(billing);
  console.log("This is CURRENT ID", currentUser._id);
  console.log("Cards", billing?.cards);

  const handleRemoveCard = async (paymentMethodId) => {
    const userId = currentUser._id;
    setRemovingCardId(paymentMethodId);
    removeCardMutation(
      { userId, paymentMethodId },
      {
        onSuccess: () => {
          toast.success("Card removed successfully");
          console.log("Card removed successfully");
        },
        onError: (err) => {
          console.error("Failed to remove card:", err);
          const message =
            err?.response?.data?.message ||
            "Failed to remove card. Please try again.";
          toast.error(message);
        },
        onSettled: () => {
          setRemovingCardId(null);
        },
      }
    );
  };

  const handleAddCard = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe is not initialized");
      return;
    }

    setLoadingCard(true);
    try {
      const cardElement = elements.getElement(CardElement);
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        console.error(error.message);
        toast.error(error.message);
        return;
      }

      const userId = currentUser?._id;
      await attachCardMutation.mutateAsync({
        userId,
        paymentMethodId: paymentMethod.id,
      });

      toast.success("Card added successfully");
      setShowModal(false);
    } catch (err) {
      console.error("Error adding card:", err);
      toast.error("Failed to add card. Please try again.");
    } finally {
      setLoadingCard(false);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <p className="text-red-500">Error loading billing info</p>;

  return (
    <main className="my-10 flex flex-col lg:flex-row flex-wrap justify-center items-start gap-5 font-quicksand px-4 sm:px-6 lg:px-0">
      {/* Pricing Section */}
      <section className="w-full max-w-lg self-start">
        <h2 className="flex gap-3 justify-start pb-5 font-robotoCondensed dark:text-white text-lg sm:text-xl">
          <img src={isDarkMode ? DarkPricingIcon : PricingIcon} alt="Pricing" className="w-5 h-5 sm:w-6 sm:h-6" />
          {t("PricingPayAsYouGo")}
        </h2>
        <div className="w-full min-h-50 bg-accent dark:bg-accent_dark p-4 sm:p-6 rounded-xl">
          <ul className="pt-3 sm:pt-5 list-disc ps-4 space-y-2">
            <li className="dark:text-white">
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
                <span className="font-medium">{t("Invoice")}</span>
                <span className="text-sm sm:text-base">
                  <span className="text-primary dark:text-primary_dark font-semibold">
                    3 {t("EGP")}
                  </span>
                  {" "}{t("invoicePrice")}
                </span>
              </div>
            </li>
            <li className="dark:text-white">
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
                <span className="font-medium">{t("Product")}</span>
                <span className="text-sm sm:text-base">
                  <span className="text-primary dark:text-primary_dark font-semibold">
                    5 {t("EGP")}{" "}
                  </span>{" "}
                  {t("productPrice")}
                </span>
              </div>
            </li>
            <li className="dark:text-white">
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
                <span className="font-medium">{t("Customer")}</span>
                <span className="text-sm sm:text-base">
                  <span className="text-primary dark:text-primary_dark font-semibold">
                    0.5 {t("EGP")}
                  </span>
                  {" "}{t("customerPrice")}
                </span>
              </div>
            </li>
          </ul>
          <div>
            <p className="text-center pt-5 dark:text-white text-sm sm:text-base">
              {t("Free tier")}{" "}
              <span className="text-primary dark:text-primary_dark font-semibold">
                {" "}
                {billing?.limits["invoices"]}{" "}
              </span>
              {t("Invoice")},
              <span className="text-primary dark:text-primary_dark font-semibold">
                {" "}
                {billing?.limits["products"]}{" "}
              </span>
              {t("Product")},
              <span className="text-primary dark:text-primary_dark font-semibold">
                {" "}
                {billing?.limits["customers"]} {""}
              </span>
              {t("Customer")}
            </p>
          </div>
        </div>
      </section>
      {/* Billing Section */}
      <section className="w-full max-w-lg self-start">
        <h2 className="flex items-center gap-3 pb-5 text-lg sm:text-xl font-robotoCondensed dark:text-white">
          <img src={isDarkMode ? DarkBillingIcon : BillingIcon} alt="Billing" className="w-5 h-5 sm:w-6 sm:h-6" />
          {t("Billing")}
        </h2>

        <div className="w-full bg-accent dark:bg-accent_dark p-4 sm:p-6 rounded-2xl border">
          <h3 className="text-base sm:text-lg font-medium mb-4 dark:text-white">{t("PaymentMethods")}</h3>

          {/* Existing card info (if any) */}
          {billing?.cards?.length > 0 ? (
            billing.cards.map((card, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row justify-between items-start gap-3 rounded-xl p-3 sm:p-4 mb-4 bg-background/50 dark:bg-background_dark/50"
              >
                <div className="flex items-center gap-3 w-full w-auto">
                  <img
                    src={isDarkMode ? DarkvisaIcon : visaIcon}
                    alt={card.cardBrand}
                    className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0"
                  />
                  <p className="text-xs sm:text-sm dark:text-white">
                    <span className="font-semibold">{card.cardBrand}</span>{" "}
                    {t("EndingIn")}
                    <span className="ml-1 font-mono tracking-wider">
                      {card.cardLast4}
                    </span>
                  </p>
                </div>
                <Button
                  onClick={() => handleRemoveCard(card.stripePaymentMethodId)}
                  variant="destructive"
                  className="w-full sm:w-auto px-4 py-2 h-auto text-xs sm:text-sm rounded-lg hover:opacity-80 flex-shrink-0"
                >
                  {removingCardId === card.stripePaymentMethodId
                    ? t("RemoveIsPending")
                    : t("Remove")}
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-white text-sm sm:text-base">{t("NoCardsFound")}</p>
          )}

          {/* Always show Add Card option */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-3 pl-3 sm:pl-5 py-2 border-t pt-4 hover:opacity-80 transition-opacity"
          >
            <img src={isDarkMode ? DarkAddNewCard : AddNewCard} alt="Add new card" className="w-5 h-5" />
            <p className="text-xs sm:text-sm font-medium dark:text-white">{t("AddNewCard")}</p>
          </button>

          {/* Add Card Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
              <div className="bg-background dark:bg-background_dark rounded-2xl shadow-xl w-full max-w-[400px] p-4 sm:p-6 relative">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-600 dark:text-white"
                >
                  <X
                    size={20}
                    className="sm:w-6 sm:h-6 rounded-2xl border-red-500 border-2 text-red-500 hover:text-red-800 hover:border-red-800 transition-all duration-300 ease-in-out"
                  />
                </button>

                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 dark:text-white pr-8">
                  {t("AddCreditOrDebitCard")}
                </h3>

                <form onSubmit={handleAddCard} className="flex flex-col gap-4">
                  <div className="p-3 border rounded-md bg-secondary dark:bg-secondary_dark">
                    <CardElement />
                  </div>
                  <button
                    type="submit"
                    disabled={!stripe || loadingCard}
                    className="w-full py-2.5 sm:py-3 rounded-lg bg-primary dark:bg-primary_dark text-white hover:bg-secondary hover:dark:bg-secondary_dark transition-all text-sm sm:text-base disabled:opacity-50"
                  >
                    {loadingCard ? t("AddCardIsLoading") : t("AddCard")}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Usage Overview */}
      <section className="w-full max-w-lg px-4 sm:px-0 self-start">
        <h2 className="flex items-center gap-3 pb-5 text-lg sm:text-xl font-robotoCondensed dark:text-white">
          <img
            src={isDarkMode ? DarkUsageOverviwIcon : UsageOverviwIcon}
            alt="Usage Overview"
            className="w-5 h-5 sm:w-6 sm:h-6"
          />
          {t("UsageOverview")}
        </h2>

        <div className="w-full bg-accent dark:bg-accent_dark p-4 sm:p-6 rounded-xl">
          <ul className="space-y-4 sm:space-y-6">
            {billing?.usage &&
              Object.keys(billing.usage).map((type) => (
                <li key={type} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5">
                  <span className="w-full sm:w-28 font-medium capitalize dark:text-white text-sm sm:text-base">{t(type)}</span>
                  <div className="flex-1 w-full sm:w-64">
                    <ProgressBar
                      current={billing.usage[type]}
                      total={billing.limits[type]}
                    />
                  </div>
                  <span className="w-full sm:w-16 text-left sm:text-right font-semibold dark:text-white text-sm sm:text-base">
                    {billing.usage[type]}/{billing.limits[type]}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

export default Pricing_billing;
