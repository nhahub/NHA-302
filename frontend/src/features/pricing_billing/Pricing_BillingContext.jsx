import { createContext } from "react";

const pricing_billingContext = createContext();

function Pricing_BillingProvider({ children }) {
  return <Pricing_BillingProvider>{children}</Pricing_BillingProvider>;
}

export { Pricing_BillingProvider, pricing_billingContext };
