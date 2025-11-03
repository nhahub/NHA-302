import PricingBilling from "../../models/pricing_billing.model.js";
import stripe from "../../config/stripe.js";

export const chargeAllUsers = async () => {
  const billings = await PricingBilling.find({
    totalDue: { $gt: 0 },
    stripeCustomerId: { $exists: true },
    stripePaymentMethodId: { $exists: true },
  });

  for (const billing of billings) {
    try {
      const charge = await stripe.paymentIntents.create({
        amount: Math.round(billing.totalDue * 100),
        currency: billing.currency,
        customer: billing.stripeCustomerId,
        payment_method: billing.stripePaymentMethodId,
        off_session: true,
        confirm: true,
        description: `Auto-charge for extra usage(${billing.currency}) ${billing.totalDue}`,
      });

      billing.totalDue = 0;
      billing.lastBilledAt = Date.now();
      await billing.save();

      console.log(`Charged user ${billing.user} successfully`);
    } catch (err) {
      console.error(`Failed to charge user ${billing.user}:`, err.message);
    }
  }
};
