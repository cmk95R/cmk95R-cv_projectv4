import api from "./client";
export const applyToSearchApi = (id, payload) => api.post(`/searches/${id}/apply`, payload);
export const myApplicationsApi = () => api.get("/applications/me");
export const listApplicationsApi = () => api.get("/admin/applications");
export const updateApplicationApi = (id, payload) => api.patch(`/admin/applications/${id}`, payload);