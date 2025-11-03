import { useContext } from "react";
import { pricing_billingContext } from "./Pricing_BillingContext";

export function usePricing_BillingContext() {
  const context = useContext(pricing_billingContext);
  if (!context)
    throw new Error(
      "usePricing_Billing must be used inside Pricing_BillingProvider"
    );
  return context;
}
