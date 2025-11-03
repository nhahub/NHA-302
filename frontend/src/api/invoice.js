import api from "../api/axios";

//User

export const getInvoiceStats = async () => {
  const res = await api.get("/invoice/stats");
  return res.data;
};

export const getAllInvoices = async () => {
  const res = await api.get("/invoice");
  return res.data;
};

export const getInvoicesByStatus = async (status) => {
  const res = await api.get(`/invoice/status/${status}`);
  return res.data;
};

export const getInvoice = async (id) => {
  const res = await api.get(`/invoice/${id}`);
  return res.data;
};

export const createInvoice = async (data) => {
  const res = await api.post("/invoice", data);
  return res.data;
};

export const updateInvoice = async (id, data) => {
  const res = await api.patch(`/invoice/${id}`, data);
  return res.data;
};

export const deleteInvoice = async (id) => {
  const res = await api.delete(`/invoice/${id}`);
  return res.data;
};

export const exportInvoice = async (id) => {
  const res = await api.get(`/invoice/export/${id}`);
  return res.data;
};

//Admin
export const getInvoicesByCompany = async (id) => {
  const res = await api.get(`/invoice/company/${id}`);
  return res.data;
};
