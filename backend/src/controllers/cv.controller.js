// controllers/cv.controller.js
import CV from "../models/Cv.js";

// Solo lo que está en tu Profile (EXCLUYENDO datos personales)
// No aceptamos cvFile por body: solo desde req.file
const ALLOWED_FIELDS = new Set([
  "telefono",
  "linkedin",
  "areaInteres",
  "nivelAcademico",
]);

const OPCIONES_AREA = ["Administracion", "Recursos Humanos", "Sistemas", "Pasantia"];
const NIVELES = [
  "Secundario completo", "Secundario incompleto", "Terciario/Técnico en curso",
  "Terciario/Técnico completo", "Universitario en curso", "Universitario completo",
  "Posgrado en curso", "Posgrado completo",
];

function normalizePayload(body, file) {
  const $set = {};
  const $unset = {};

  const put = (k, v) => {
    if (v === "" || v == null) $unset[k] = "";
    else $set[k] = v;
  };

  for (const [k, v0] of Object.entries(body || {})) {
    if (!ALLOWED_FIELDS.has(k)) continue;

    let v = v0;

    if (k === "areaInteres") {
      const val = String(v || "").trim();
      v = OPCIONES_AREA.includes(val) ? val : ""; // inválido -> unset
    }

    if (k === "nivelAcademico") {
      const val = String(v || "").trim();
      v = NIVELES.includes(val) ? val : ""; // inválido -> unset
    }

    put(k, v);
  }

  // archivo subido (multer / s3 middleware)
  if (file) {
    $set.cvFile = {
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: file.location || `/uploads/${file.filename}`,
    };
  }

  // si no hay nada que setear y solo hay $unset, igual devolver ambos objetos
  return { $set, $unset };
}

// GET /cv/me
export const getMyCV = async (req, res, next) => {
  try {
    const cv = await CV.findOne({ user: req.user._id })
      .populate("user", " publicId email nombre apellido rol")
      .lean();
    return res.json({ cv });
  } catch (err) { next(err); }
};

// POST /cv/me  (upsert)
export const upsertMyCV = async (req, res, next) => {
  try {
    const update = normalizePayload(req.body, req.file);

    const cv = await CV.findOneAndUpdate(
      { user: req.user._id },
      { ...update, $setOnInsert: { user: req.user._id } },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    ).populate("user", "publicId email nombre apellido rol");

    return res.json({ cv, message: "CV actualizado" });
  } catch (err) { next(err); }
};

// GET /cv  (admin)
export const listAllCVs = async (_req, res, next) => {
  try {
    const cvs = await CV.find()
      .populate("user", "publicId email nombre apellido rol");
    res.json({ cvs });
  } catch (err) { next(err); }
};

// GET /cv/:id  (admin)
export const getCV = async (req, res, next) => {
  try {
    const cv = await CV.findById(req.params.id)
      .populate("user", "publicId email nombre apellido rol");
    if (!cv) return res.status(404).json({ message: "CV no encontrado" });
    res.json({ cv });
  } catch (err) { next(err); }
};
