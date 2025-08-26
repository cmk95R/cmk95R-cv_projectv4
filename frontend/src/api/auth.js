import api from "./client";

export const registerApi = (payload) => api.post("/auth/register", payload);
export const loginApi    = (payload) => api.post("/auth/login", payload);
export const meApi       = () => api.get("/auth/me");
