// controllers/geo.controller.js

const BASE_URL = "https://apis.datos.gob.ar/georef/api";

// Un caché simple en memoria para no llamar a la API externa todo el tiempo.
const cache = {
    provincias: null,
    localidades: new Map(), // Map<provinciaId, localidades[]>
};

/**
 * Obtiene la lista de provincias desde la API externa o desde el caché.
 */
export const getProvincias = async (req, res, next) => {
    try {
        if (cache.provincias) {
            return res.json({ provincias: cache.provincias });
        }

        const response = await fetch(`${BASE_URL}/provincias?campos=id,nombre&orden=nombre`);
        if (!response.ok) throw new Error("Error al obtener provincias");

        const data = await response.json();
        const provincias = data.provincias || [];

        // Guardar en caché para futuras peticiones
        cache.provincias = provincias;

        res.json({ provincias });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtiene las localidades para una provincia dada, usando caché.
 */
export const getLocalidades = async (req, res, next) => {
    const { provinciaId } = req.query;

    if (!provinciaId) {
        return res.status(400).json({ message: "El ID de la provincia es requerido." });
    }

    try {
        if (cache.localidades.has(provinciaId)) {
            return res.json({ localidades: cache.localidades.get(provinciaId) });
        }

        const url = `${BASE_URL}/localidades?provincia=${encodeURIComponent(
            provinciaId
        )}&campos=id,nombre&orden=nombre&max=5000`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al obtener localidades");

        const data = await response.json();
        const localidades = data.localidades || [];

        // Guardar en caché
        cache.localidades.set(provinciaId, localidades);

        res.json({ localidades });
    } catch (error) {
        next(error);
    }
};