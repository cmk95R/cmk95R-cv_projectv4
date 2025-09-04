import Search, { AREAS, ESTADOS } from "../models/Search.js";

// GET /admin/searches
export const listSearches = async (req, res, next) => {
  try {
    const { q, area, estado } = req.query;
    const filter = {};

    if (q && q.trim()) {
      // usa el text index si existe, y además un OR básico
      const rx = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ titulo: rx }, { descripcion: rx }, { ubicacion: rx }];
    }
    if (area && AREAS.includes(area)) filter.area = area;
    if (estado && ESTADOS.includes(estado)) filter.estado = estado;

    const items = await Search.find(filter).sort({ updatedAt: -1 }).lean();
    res.json({ items });
  } catch (e) { next(e); }
};

// POST /admin/searches
export const createSearch = async (req, res, next) => {
  try {
    const payload = {
      titulo:     (req.body.titulo || "").trim(),
      area:       req.body.area,
      estado:     req.body.estado || "Activa",
      ubicacion:  (req.body.ubicacion || "").trim(),
      descripcion:(req.body.descripcion || "").trim(),
      createdBy:  req.user?._id,
    };

    if (!payload.titulo || !payload.area) {
      return res.status(400).json({ message: "Faltan campos requeridos (título y área)." });
    }

    const search = await Search.create(payload);
    res.status(201).json({ search });
  } catch (e) { next(e); }
};

// PATCH /admin/searches/:id
export const updateSearch = async (req, res, next) => {
  try {
    const allowed = ["titulo", "area", "estado", "ubicacion", "descripcion"];
    const update = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) {
        update[k] = typeof req.body[k] === "string" ? req.body[k].trim() : req.body[k];
      }
    }

    const search = await Search.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true, context: "query" }
    );

    if (!search) return res.status(404).json({ message: "Búsqueda no encontrada" });
    res.json({ search });
  } catch (e) { next(e); }
};

// DELETE /admin/searches/:id
export const deleteSearch = async (req, res, next) => {
  try {
    const s = await Search.findByIdAndDelete(req.params.id);
    if (!s) return res.status(404).json({ message: "Búsqueda no encontrada" });
    res.status(204).end();
  } catch (e) { next(e); }
};
