// src/utils/normalize.js

/**
 * Normaliza el input de "direccion" a un formato consistente,
 * asegurando que solo se guarden los campos `id` y `nombre`.
 */
export function normalizeDireccion(input) {
  if (!input || typeof input !== "object") return undefined;

  const out = {};
  
  // Usamos el operador de encadenamiento opcional (?.) para evitar errores si no existen.
  // --- CORRECCIÓN: Hacemos la función más flexible ---
  // Ahora guardará la provincia si tiene al menos un 'id' o un 'nombre'.
  if (input.provincia && (input.provincia.id || input.provincia.nombre)) {
    out.provincia = { id: input.provincia.id ? String(input.provincia.id) : undefined, nombre: input.provincia.nombre ? String(input.provincia.nombre) : undefined };
  }
  // Hacemos lo mismo para la localidad.
  if (input.localidad && (input.localidad.id || input.localidad.nombre)) {
    out.localidad = { id: input.localidad.id ? String(input.localidad.id) : undefined, nombre: input.localidad.nombre ? String(input.localidad.nombre) : undefined };
  }
  
  // Si no quedó nada, undefined
  if (Object.keys(out).length === 0) return undefined;

  return out;
}
