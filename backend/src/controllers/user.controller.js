// controllers/user.controller.js
import User from "../models/User.js";

// PATCH /users/:id  (perfil básico)
export const editUser = async (req, res, next) => {
  try {
    const { nombre, apellido, email, direccion } = req.body;
    const update = {};

    if (typeof nombre === "string")   update.nombre = nombre.trim();
    if (typeof apellido === "string") update.apellido = apellido.trim();
    if (typeof email === "string")    update.email = email.trim().toLowerCase();

    if (direccion !== undefined) {
      if (typeof direccion === "string") {
        update.direccion = { ciudad: direccion.trim() };
      } else if (direccion && typeof direccion === "object") {
        update.direccion = direccion;
      } else {
        update.direccion = undefined;
      }
    }

    const u = await User.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true, context: "query" }
    ).select("_id nombre apellido email rol");

    if (!u) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario actualizado", user: u });
  } catch (e) { next(e); }
};

// GET /users  (si lo usás para admin)
export const listUsers = async (_req, res, next) => {
  try {
    const users = await User.find().select("_id publicId nombre apellido direccion email rol createdAt");
    res.json({ users });
  } catch (e) { next(e); }
};

// PATCH /users/:id/make-admin
export const makeAdmin = async (req, res, next) => {
  try {
    const u = await User.findByIdAndUpdate(
      req.params.id,
      { rol: "admin" },
      { new: true, runValidators: true, context: "query" }
    ).select("_id nombre apellido email rol");
    if (!u) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Rol actualizado a admin", user: u });
  } catch (e) { next(e); }
};

// PATCH /users/:id/revoke-admin
export const revokeAdmin = async (req, res, next) => {
  try {
    const u = await User.findByIdAndUpdate(
      req.params.id,
      { rol: "user" },
      { new: true, runValidators: true, context: "query" }
    ).select("_id nombre apellido email rol");
    if (!u) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Rol revertido a user", user: u });
  } catch (e) { next(e); }
};

// ===================== Admin: Users + CV (para DataGrid) =====================
// GET /admin/users?q=&rol=user|admin&areaInteres=&nivelAcademico=&hasCv=true|false&page=1&limit=20&sortBy=updatedAt&sortDir=desc
const SAFE_SORT = new Set([
  "createdAt","updatedAt","nombre","apellido","email","rol","cvArea","cvNivel"
]);

export const listUsersWithCv = async (req, res, next) => {
  try {
    const {
      q,                 // texto: nombre/apellido/email/publicId
      rol,               // 'user' | 'admin'
      areaInteres,       // filtro por área del CV
      nivelAcademico,    // filtro por nivel académico del CV
      hasCv,             // "true" | "false"
      page = 1,
      limit = 20,
      sortBy = "updatedAt",
      sortDir = "desc",
    } = req.query;

    const _page  = Math.max(1, parseInt(page, 10) || 1);
    const _limit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const _sortBy = SAFE_SORT.has(sortBy) ? sortBy : "updatedAt";
    const _sortDir = String(sortDir).toLowerCase() === "asc" ? 1 : -1;

    // filtros sobre users
    const userMatch = {};
    if (rol) userMatch.rol = rol;
    if (q) {
      const rx = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      userMatch.$or = [
        { nombre: rx },
        { apellido: rx },
        { email: rx },
        { publicId: rx },
      ];
    }

    // filtros sobre CV (después del lookup)
    const cvMatch = {};
    if (areaInteres)     cvMatch["cv.areaInteres"] = areaInteres;
    if (nivelAcademico)  cvMatch["cv.nivelAcademico"] = nivelAcademico;
    if (hasCv === "true")  cvMatch["cv._id"] = { $ne: null };
    if (hasCv === "false") cvMatch["cv._id"] = null;

    // sort
    const sortStage = {};
    if (_sortBy === "cvArea")       sortStage["cv.areaInteres"] = _sortDir;
    else if (_sortBy === "cvNivel") sortStage["cv.nivelAcademico"] = _sortDir;
    else                            sortStage[_sortBy] = _sortDir;

    const pipeline = [
      { $match: userMatch },
      {
        $lookup: {
          from: "cvs", // colección de Cv (Mongoose pluraliza 'Cv' -> 'cvs')
          let: { uid: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$user", "$$uid"] } } },
            {
              $project: {
                _id: 1,
                areaInteres: 1,
                nivelAcademico: 1,
                telefono: 1,
                linkedin: 1,
                habilidades: 1,   // si no existen en tu modelo hoy, vendrán undefined
                competencias: 1,
                updatedAt: 1
              }
            }
          ],
          as: "cv"
        }
      },
      { $unwind: { path: "$cv", preserveNullAndEmptyArrays: true } },
      ...(Object.keys(cvMatch).length ? [{ $match: cvMatch }] : []),
      {
        $project: {
          _id: 1,
          publicId: 1,
          nombre: 1,
          apellido: 1,
          email: 1,
          rol: 1,
          createdAt: 1,
          updatedAt: 1,
          // dirección básica para "Ubicación" en el front
          direccion: {
            ciudad: "$direccion.ciudad",
            provincia: "$direccion.provincia",
            pais: "$direccion.pais"
          },
          // campos del CV
          cvId: "$cv._id",
          cvArea: "$cv.areaInteres",
          cvNivel: "$cv.nivelAcademico",
          cvTelefono: "$cv.telefono",
          cvLinkedin: "$cv.linkedin",
          cvHabilidades: "$cv.habilidades",
          cvCompetencias: "$cv.competencias",
          cvUpdatedAt: "$cv.updatedAt",
          hasCv: { $cond: [{ $ifNull: ["$cv._id", false] }, true, false] }
        }
      },
      { $sort: sortStage },
      {
        $facet: {
          items: [
            { $skip: (_page - 1) * _limit },
            { $limit: _limit }
          ],
          total: [{ $count: "count" }]
        }
      }
    ];

    const [agg] = await User.aggregate(pipeline).allowDiskUse(true);
    const items = agg?.items ?? [];
    const total = agg?.total?.[0]?.count ?? 0;

    res.json({
      items,
      total,
      page: _page,
      pages: Math.ceil(total / _limit)
    });
  } catch (err) {
    next(err);
  }
};
