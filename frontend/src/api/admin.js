import api from "./client";

export const getDashboardDataApi = () => api.get("/users/dashboard"); // ✅ Corrected route