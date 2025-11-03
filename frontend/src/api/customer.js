import api from "../api/axios";

//User
export const createCustomer = async (data) => {
  const res = await api.post("/customer", data);
  return res.data;
};

export const getCustomer = async (id) => {
  const res = await api.get(`/customer/${id}`);
  return res.data;
};

export const updateCustomer = async (id, data) => {
  const res = await api.patch(`/customer/${id}`, data);
  return res.data;
};

export const deleteCustomer = async (id) => {
  const res = await api.delete(`/customer/${id}`);
  return res.data;
};

export const getCustomerInvoices = async (id) => {
  const res = await api.get(`/customer/${id}/invoices`);
  return res.data;
};

export const getCustomerByCompany = async (id) => {
  const res = await api.get(`/customer/${id}/company`);
  return res.data;
};

//Admin
export const getAllCustomers = async () => {
  const res = await api.get("/customer");
  return res.data;
};

export const getCustomerCountByCompany = async (id) => {
  const res = await api.get(`/customer/${id}/count`);
  return res.data;
};
