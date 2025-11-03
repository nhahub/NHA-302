import api from "../api/axios";

export const getReportStats = async () => {
  const res = await api.get("reports/stats");
  return res.data;
};

export const getRevenueOverTime = async (period = 'month') => {
  const res = await api.get(`reports/revenue?period=${period}`);
  return res.data;
};

export const getTopProducts = async () => {
  const res = await api.get("reports/top-products");
  return res.data;
};

export const getTopCustomers = async () => {
  const res = await api.get("reports/top-customers");
  return res.data;
};
