import api from "../api/axios";
export const trackUsage = async () => {
  const res = await api.get("/pricing_billing/track-usage");
  return res.data;
};
export const attatchCard = async (data) => {
  const res = await api.post("/pricing_billing/add-card", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data;
};

export const getBillingSummary = async () => {
  const res = await api.get("/pricing_billing/summary");
  return res.data;
};

export const deleteCard = async ({ userId, paymentMethodId }) => {
  const res = await api.delete("/pricing_billing/remove-card", {
    data: {
      userId,
      paymentMethodId,
    },
  });
  return res.data;
};

//Admin

export const getAdminBillingSummary = async () => {
  const res = await api.get("/pricing_billing/admin-summary");
  return res.data;
};

//Manual Testing
export const chargeAllUsers = async () => {
  const res = await api.get("/pricing_billing/charge-all");
  return res.data;
};
