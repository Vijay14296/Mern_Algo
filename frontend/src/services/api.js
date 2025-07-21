// services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// ✅ Add this function here
export const submitCode = async ({ code, language, input }) => {
  try {
    const response = await API.post("/code/submit", {
      code,
      language,
      input,
    });
    return response.data;
  } catch (err) {
    console.error("❌ Frontend Submit Error:", err.response?.data || err.message);
    throw err;
  }
};

export default API;
