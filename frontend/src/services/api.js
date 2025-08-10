import axios from "axios";
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api"
});


API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const submitCode = async ({ code, language, problemId }) => {
  // Basic input validation to catch issues early
  if (!code || !language || !problemId) {
    console.error("❌ submitCode missing required fields:", { code, language, problemId });
    throw new Error("Missing code, language, or problemId");
  }

  try {
    console.log("🚀 Sending code submission:", { language, problemId, codeSnippet: code.slice(0, 30) + "..." });

    const response = await API.post("/code/submit", {
      code,
      language,
      problemId,
    });

    console.log("✅ Submission response:", response.data);

    return response.data;
  } catch (err) {
    console.error("❌ Frontend Submit Error:", err.response?.data || err.message);
    throw err;
  }
};

export default API;
