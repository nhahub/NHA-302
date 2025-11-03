import api from "../api/axios";

//User
export const createCompany = async (data) => {
  const res = await api.post("/company", data);
  return res.data;
};

export const getMyCompany = async () => {
  const res = await api.get("/company/my-company");
  return res.data;
};

export const getCompany = async (id) => {
  const res = await api.get(`/company/${id}`);
  return res.data;
};

export const updateCompany = async (id, data) => {
  const isFormData = data instanceof FormData;
  const res = await api.patch(`/company/${id}`, data, {
    headers: isFormData
      ? { "Content-Type": "multipart/form-data" }
      : {
          "Content-Type": "application/json",
        },
  });
  return res.data;
};

export const deleteCompany = async (id) => {
  const res = await api.delete(`/company/${id}`);
  return res.data;
};

//Admin
export const getAllCompanies = async () => {
  const res = await api.get("/company");
  return res.data;
};
