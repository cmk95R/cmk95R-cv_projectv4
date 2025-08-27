import api from "./client";

export const registerApi = (payload) => api.post("/auth/register", payload);
export const loginApi    = (payload) => api.post("/auth/login", payload);
// Nuevo endpoint
export const profileApi = () => api.get("/auth/profile");

// Alias para no romper otros imports
export const meApi = profileApi;