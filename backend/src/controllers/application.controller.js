import Application from "../models/Application.js";
import Search from "../models/Search.js";
import Cv from "../models/Cv.js";
import { APP_STATES } from "../models/Application.js";

// POST /searches/:id/apply (user)
export const applyToSearch = async (req, res, next) => {
  try {
    const searchId = req.params.id;
    const userId = req.user._id;
    const message = (req.body?.message || "").trim();

    const search = await Search.findById(searchId).lean();
    if (!search) return res.status(404).json({ message: "Búsqueda no encontrada" });
    if (search.estado !== "Activa") {
      return res.status(400).json({ message: "La búsqueda no está activa" });
    }

    const existing = await Application.findOne({ search: searchId, user: userId }).lean();
    if (existing) return res.status(409).json({ message: "Ya estás postulado a esta búsqueda" });

    const cv = await Cv.findOne({ user: userId }).lean();

    const app = await Application.create({
      search: searchId,
      user: userId,
      message,
      cvRef: cv?._id,
      cvSnapshot: cv
        ? {
            nombre: cv.nombre ?? req.user.nombre,
            apellido: cv.apellido ?? req.user.apellido,
            email: cv.email ?? req.user.email,
            telefono: cv.telefono ?? "",
            linkedin: cv.linkedin ?? "",
            areaInteres: cv.areaInteres ?? "",
            nivelAcademico: cv.nivelAcademico ?? "",
          }
        : {
            nombre: req.user.nombre,
            apellido: req.user.apellido,
            email: req.user.email,
          },
    });

    res.status(201).json({ application: app });
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ message: "Ya estás postulado a esta búsqueda" });
    }
    next(e);
  }
};

// GET /applications/me (user)
export const myApplications = async (req, res, next) => {
  try {
    const items = await Application.find({ user: req.user._id })
      .populate("search", "titulo area estado ubicacion")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ items });
  } catch (e) { next(e); }
};

// --- Admin ---

// GET /admin/applications
export const listApplications = async (req, res, next) => {
  try {
    const { state, search, q } = req.query;
    const filter = {};
    if (state && APP_STATES.includes(state)) filter.state = state;
    if (search) filter.search = search;
    if (q && q.trim()) {
      const rx = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { "cvSnapshot.nombre": rx },
        { "cvSnapshot.apellido": rx },
        { "cvSnapshot.email": rx },
        { message: rx },
      ];
    }

    const items = await Application.find(filter)
      .populate("user", "publicId nombre apellido email rol")
      .populate("search", "titulo area estado ubicacion")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ items });
  } catch (e) { next(e); }
};

// PATCH /admin/applications/:id  { state }
export const updateApplication = async (req, res, next) => {
  try {
    const state = req.body?.state;
    if (!APP_STATES.includes(state)) {
      return res.status(400).json({ message: "Estado inválido" });
    }
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { state },
      { new: true, runValidators: true }
    );
    if (!app) return res.status(404).json({ message: "Postulación no encontrada" });
    res.json({ application: app });
  } catch (e) { next(e); }
};
