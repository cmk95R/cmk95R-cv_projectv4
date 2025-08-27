import api from "./client";

// Admin: lista de candidatos (CVs). Ej: GET /cv (devuelve { cvs: [...] })
export const listCandidatesApi = () => api.get("/cv");

// Admin: eliminar un CV. Ej: DELETE /cv/:id
export const deleteCandidateApi = (id) => api.delete(`/cv/${id}`);  