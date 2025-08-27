import api from "./client";




export const getMyCvApi = () => api.get("/cv/me");
// Enviar/actualizar el CV del usuario logueado
export const upsertMyCv = (formData) => {
  // formData es una instancia de FormData (multipart)
  return api.post("/cv/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Obtener el CV del usuario logueado
export const upsertMyCvJson = (payload) => api.post("/cv/me", payload);

