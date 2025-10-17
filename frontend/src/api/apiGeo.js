import api from "../api/client"; // Importamos nuestro cliente de API

// --- Funciones de API locales ---
export const fetchProvinciasApi = () => api.get("/geo/provincias");
export const fetchLocalidadesApi = (provinciaId) => api.get(`/geo/localidades?provinciaId=${provinciaId}`);
 