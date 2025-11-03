import PricingBilling from "../../models/pricing_billing.model.js";
import AppError from "../../utils/services/appError.js";
import catchAsync from "../../utils/middlewares/catchAsync.js";
import stripe from "../../config/stripe.js";
import { chargeAllUsers } from "./pricing_billing.service.js";

//UsageTracker TESTING ONLY
export const UsageTracker = catchAsync(async (req, res, next) => {
  const { userId, type } = req.body; // type will be invoice | product | customer
  const billing = await PricingBilling.findOne({ user: userId });
  if (!billing) return next(new AppError("Billing not found", 404));
  billing.usage[type]++;
  if (billing.usage[type] > billing.limits[type]) {
    const unitPrice = billing.pricing[`${type}sUnitPrice`];
    billing.totalDue += unitPrice;
  }
  await billing.save();
  res.status(200).json({ status: "success", data: billing });
});

//show billing summary for user
export const getBillingSummary = catchAsync(async (req, res, next) => {
  console.log(req.user);

  // Query database
  let billing = await PricingBilling.findOne({ user: req.user });

  if (!billing) {
    // Create default billing record (card fields will be undefined/null)
    billing = await PricingBilling.create({
      user: req.user._id,
      usage: { invoices: 0, products: 0, customers: 0 },
      limits: { invoices: 5, products: 3, customers: 5 },
      pricing: {
        invoiceUnitPrice: 3,
        productUnitPrice: 5,
        customerUnitPrice: 0.5,
      },
      totalDue: 0,
      currency: "egp",
    });
  }

  const billingData = billing.toObject();

  return res.status(200).json({
    status: "success",
    data: billingData,
  });
});

//show billing summary for admin [ should be all billing for all users]
export const getAdminBillingSummary = catchAsync(async (req, res, next) => {
  try {
    const billing = await PricingBilling.find().populate(
      "user",
      "username email photo"
    );
    
    // No need to check - .find() returns an array (empty if no results)
    res.status(200).json({
      status: "success",
      results: billing.length,
      data: billing,
    });
  } catch (error) {
    console.error("Error in getAdminBillingSummary:", error);
    // If populate fails, return without population
    const billing = await PricingBilling.find();
    res.status(200).json({
      status: "success",
      results: billing.length,
      data: billing,
    });
  }
});

//charge user manually by admin for testing
export const chargeAllUsersManual = catchAsync(async (req, res, next) => {
  await chargeAllUsers();
  res.status(200).json({
    status: "success",
    message: "All users charged successfully",
  });
});
//attach card (strip API or paymob API)
export const attatchCard = catchAsync(async (req, res, next) => {
  try {
    // TEMPORARY DEBUGGING
    console.log("=== REQUEST BODY DEBUG ===");
    console.log("req.body exists:", !!req.body);
    console.log("req.body type:", typeof req.body);
    console.log("req.body value:", req.body);
    console.log("req.headers:", req.headers["content-type"]);
    console.log("========================");

    // Temporary safe access
    const body = req.body || {};
    const paymentMethodId = body.paymentMethodId;
    const userId = body.userId;

    console.log("Extracted userId:", userId);
    console.log("Extracted paymentMethodId:", paymentMethodId);

    if (!userId || !paymentMethodId) {
      return res.status(400).json({
        status: "error",
        message: `User ID and Payment Method ID are required. Received: ${JSON.stringify(
          body
        )}`,
      });
    }

    let billing = await PricingBilling.findOne({ user: userId });
    let customerId = billing?.stripeCustomerId;

    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
      } catch (err) {
        if (err.code === "resource_missing") {
          console.warn("Invalid Stripe customer found, creating new one...");
          customerId = null;
        } else {
          throw err;
        }
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { userId },
      });
      customerId = customer.id;

      if (!billing) {
        billing = new PricingBilling({
          user: userId,
          stripeCustomerId: customerId,
        });
      } else {
        billing.stripeCustomerId = customerId;
      }
      await billing.save();
    }

    // Continue with your existing Stripe logic...
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });

    const cardInfo = {
      stripePaymentMethodId: paymentMethod.id,
      cardLast4: paymentMethod.card?.last4,
      cardType: paymentMethod.card?.funding,
      cardBrand: paymentMethod.card?.brand
        ? paymentMethod.card.brand.charAt(0).toUpperCase() +
          paymentMethod.card.brand.slice(1)
        : "Unknown",
      cardExpMonth: paymentMethod.card?.exp_month,
      cardExpYear: paymentMethod.card?.exp_year,
      isDefault: billing.cards.length === 0, // make first card default
    };

    // Add new card if not exists already
    const exists = billing.cards.some(
      (c) => c.stripePaymentMethodId === paymentMethod.id
    );
    if (!exists) billing.cards.push(cardInfo);

    await billing.save();

    const freshBilling = await PricingBilling.findOne({ user: userId }).lean();

    return res.status(200).json({
      status: "success",
      data: freshBilling,
    });
  } catch (error) {
    console.error("Stripe attach card error:", error);

    if (error.type === "StripeInvalidRequestError") {
      return res.status(400).json({
        status: "error",
        message: "Invalid payment method",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Failed to attach card",
      error: error.message,
    });
  }
});
// remove attatched card
export const deleteCard = catchAsync(async (req, res, next) => {
  const { userId, paymentMethodId } = req.body;

  const billing = await PricingBilling.findOne({ user: userId });
  if (!billing) return next(new AppError("Billing not found", 404));

  const cardIndex = billing.cards.findIndex(
    (c) => c.stripePaymentMethodId === paymentMethodId
  );
  if (cardIndex === -1) return next(new AppError("Card not found", 404));

  await stripe.paymentMethods.detach(paymentMethodId);

  billing.cards.splice(cardIndex, 1);
  await billing.save();

  res.status(200).json({ status: "success", data: billing });
});
