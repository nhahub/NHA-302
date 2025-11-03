import api from "../api/axios";

//User
export const createProduct = async (data) => {
  const res = await api.post("/product", data);
  return res.data;
};

export const updateProduct = async (id, data) => {
  const res = await api.patch(`/product/${id}`, data);
  return res.data;
};

export const getProductById = async (id) => {
  const res = await api.get(`/product/${id}`);
  return res.data;
};
export const deleteProduct = async (id) => {
  const res = await api.delete(`/product/${id}`);
  return res.data;
};

export const getStockStatus = async (id) => {
  const res = await api.get(`/product/stock/${id}`);
  return res.data;
};

export const exportProducts = async (id) => {
  const res = await api.get(`/product/export/${id}`);
  return res.data;
};
export const getProductsByCompany = async (id) => {
  const res = await api.get(`/product/company/${id}`);
  return res.data;
};
//Admin

export const getAllProducts = async () => {
  const res = await api.get("/product");
  return res.data;
};

export const getProductsOverview = async () => {
  const res = await api.get("/product/overview");
  return res.data;
};
