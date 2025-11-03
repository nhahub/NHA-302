import api from "../api/axios";

// 🔹 Auth-related
export const signup = async (data) => {
  const res = await api.post("/auth/signup", data);
  return res.data;
};

export const login = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await api.patch(`/auth/update/${id}`, data);
  return res.data;
};

export const googlecallback = async () => {
  const res = await api.get("/auth/google/callback");
  return res.data;
};

export const logout = async () => {
  const res = await api.get("/auth/logout");
  return res.data;
};

// 🔹 User-related
export const getCurrentUser = async (id) => {
  const res = await api.get(`/auth/users/${id}`);
  return res.data;
};

export const updatePassword = async (data) => {
  const res = await api.patch(`/auth/updatePassword/`, data);
  return res.data;
};

export const deleteAccount = async () => {
  const res = await api.delete("/auth/delete-account");
  return res.data;
};

// 🔹 Admin-related
export const getAllUsers = async () => {
  const res = await api.get("/auth/users");
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/auth/users/${id}`);
  return res.data;
};

export const createAdmin = async (data) => {
  const res = await api.post("/auth/admin", data);
  return res.data;
};

export const getAdmin = async (id) => {
  const res = await api.get(`/auth/admin/${id}`);
  return res.data;
};

export const getAllAdmins = async () => {
  const res = await api.get("/auth/admin");
  return res.data;
};

export const updateAdmin = async (id, data) => {
  const res = await api.patch(`/auth/admin/${id}`, data);
  return res.data;
};

export const deleteAdmin = async (id) => {
  const res = await api.delete(`/auth/admin/${id}`);
  return res.data;
};
