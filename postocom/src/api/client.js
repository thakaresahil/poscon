import axios from "axios";

export const AUTH_LOGOUT_EVENT = "auth:logout";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:9000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 on a request that carried a token means the session has expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      localStorage.removeItem("token");
      localStorage.removeItem("uid");
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
    }
    return Promise.reject(error);
  }
);

export default api;
