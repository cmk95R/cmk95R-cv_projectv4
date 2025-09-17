import api from "./client";

export const applyToSearchApi = (id, payload) =>
  api.post(`/searches/${id}/apply`, payload);

export const myApplicationsApi = () =>
  api.get("/applications/me");

// ⬇️ Aceptar params de filtro para admin
export const listApplicationsApi = (params = {}) =>
  api.get("/admin/applications", { params });

export const updateApplicationApi = (id, payload) =>
  api.patch(`/admin/applications/${id}`, payload);
