// import PricingBilling from "../models/pricing_billing.model.js";
// export const trackUsage = async (userId, type) => {
//   const billing = await PricingBilling.findOne({ user: userId });
//   if (!billing) throw new Error("Billing not found");

//   // Increment usage
//   billing.usage[type]++;

//   // Add extra cost if over the limit
//   if (billing.usage[type] > billing.limits[type]) {
//     const unitPrice = billing.pricing[`${type}sUnitPrice`];
//     billing.totalDue += unitPrice;
//   }

//   await billing.save();
//   return billing;
// };

import PricingBilling from "../models/pricing_billing.model.js";

export const trackUsage = async (userId, type) => {
  const billing = await PricingBilling.findOne({ user: userId });
  if (!billing) throw new Error("Billing not found");

  if (!billing.usage || !billing.limits || !billing.pricing) {
    throw new Error("Billing configuration is incomplete");
  }
  const currentUsage = Number(billing.usage[type] || 0);
  const limit = Number(billing.limits[type] || 0);
  const unitPrice = Number(billing.pricing[`${type}sUnitPrice`] || 0);

  if (currentUsage >= limit) {
    billing.totalDue += unitPrice;
  }
  await billing.save();
  return billing;
};
