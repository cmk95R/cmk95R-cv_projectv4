import api from "./client";

export const listUsersApi = () => api.get("/users");
export const makeAdminApi = (id) => api.patch(`/users/${id}/make-admin`);
export const revokeAdminApi = (id) => api.patch(`/users/${id}/revoke-admin`);

/**
 * 🔑 ADMIN: Obtiene la lista paginada y filtrable de usuarios con datos de CV.
 * @param {object} params - Objeto con los parámetros de paginación y filtro.
 */
export const listUsersWithCvApi = (params) => api.get("/users/admin", { params });

/**
 * 🔑 ADMIN: Obtiene la URL de descarga del CV para un usuario específico.
 * @param {string} userId - El ID del usuario.
 */
export const getUserCvDownloadUrlApi = (userId) => api.get(`/cv/admin/users/${userId}/cv/download`);
