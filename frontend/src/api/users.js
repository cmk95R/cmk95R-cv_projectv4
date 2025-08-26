import api from "./client";

export const listUsersApi = () => api.get("/users");
export const makeAdminApi = (id) => api.patch(`/users/${id}/make-admin`);
export const revokeAdminApi = (id) => api.patch(`/users/${id}/revoke-admin`);
