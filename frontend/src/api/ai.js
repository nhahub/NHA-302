import api from "./axios";

export const askAI = async (question) => {
  const res = await api.post("/ai/ask", { question });
  return res.data;
};
