// controllers/cv.controller.js

import CV from "../models/Cv.js";
// <-- CAMBIO 1: Importar nuestro servicio de OneDrive
import { uploadFileToOneDrive } from "../services/oneDrive.service.js";

// ... (ALLOWED_FIELDS, OPCIONES_AREA, NIVELES no cambian) ...
const ALLOWED_FIELDS = new Set([
  "nombre", "apellido", "nacimiento", "perfil", "telefono",
  "linkedin", "email", "areaInteres", "nivelAcademico",
  "institucion", "periodoEduDesde", "periodoEduHasta", "experiencia",
]);
const OPCIONES_AREA = ["Administracion", "Recursos Humanos", "Sistemas", "Pasantia"];
const NIVELES = [
  "Secundario completo", "Secundario incompleto", "Terciario/Técnico en curso",
  "Terciario/Técnico completo", "Universitario en curso", "Universitario completo",
  "Posgrado en curso", "Posgrado completo",
];

// <-- CAMBIO 2: La función ahora es 'async' y recibe 'userId' para crear un nombre único
async function normalizePayload(body, file, userId) {
  const $set = {};
  const $unset = {};

  const put = (k, v) => {
    if (v === "" || v == null) $unset[k] = "";
    else $set[k] = v;
  };

  for (const [k, v0] of Object.entries(body || {})) {
    // ... (toda tu lógica de validación de campos de texto no cambia)
    if (!ALLOWED_FIELDS.has(k)) continue;
    let v = v0;
    if (k === "areaInteres") {
      const val = String(v || "").trim();
      v = OPCIONES_AREA.includes(val) ? val : "";
    }
    if (k === "nivelAcademico") {
      const val = String(v || "").trim();
      v = NIVELES.includes(val) ? val : "";
    }
    if (k === "experiencia") {
      v = Array.isArray(v) && v.length > 0 ? v : "";
    }
    put(k, v);
  }

  // <-- CAMBIO 3: Lógica de subida de archivo actualizada para OneDrive
  if (file) {
    // 1. Crear un nombre de archivo único
    const originalName = file.originalname.split('.').slice(0, -1).join('.');
    const fileName = `${originalName}-${userId}-${Date.now()}.pdf`;

    // 2. Subir el archivo a OneDrive usando el servicio
    const uploadResult = await uploadFileToOneDrive(file.buffer, fileName, "CVs");

    // 3. Guardar los datos de OneDrive en el objeto $set
    $set.cvFile = {
      fileName: fileName, // Guardamos el nombre único que generamos
      mimetype: file.mimetype,
      size: file.size,
      url: uploadResult.webUrl, // La URL de OneDrive
      provider: "onedrive", // Buena práctica para saber dónde está el archivo
      providerId: uploadResult.id, // ID del archivo en OneDrive
    };
  }

  return { $set, $unset };
}

// ... (getMyCV no cambia) ...
export const getMyCV = async (req, res, next) => {
  try {
    const cv = await CV.findOne({ user: req.user._id })
      .populate("user", " publicId email nombre apellido rol telefono direccion nacimiento")
      .lean();
    return res.json({ cv });
  } catch (err) { next(err); }
};


// POST /cv/me  (upsert)
export const upsertMyCV = async (req, res, next) => {
  try {
    // <-- CAMBIO 4: Ahora esperamos la promesa de normalizePayload y pasamos el userId
    const update = await normalizePayload(req.body, req.file, req.user._id);

    const cv = await CV.findOneAndUpdate(
      { user: req.user._id },
      { ...update, $setOnInsert: { user: req.user._id } },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    ).populate("user", "publicId email nombre apellido rol telefono direccion nacimiento");

    return res.json({ cv, message: "CV actualizado" });
  } catch (err) { next(err); }
};

// ... (listAllCVs y getCV no cambian) ...
export const listAllCVs = async (_req, res, next) => {
  try {
    const cvs = await CV.find()
      .populate("user", "publicId email nombre apellido rol telefono direccion nacimiento");
    res.json({ cvs });
  } catch (err) { next(err); }
};
export const getCV = async (req, res, next) => {
  try {
    const cv = await CV.findById(req.params.id)
      .populate("user", "publicId email nombre apellido rol telefono direccion nacimiento createdAt");
    if (!cv) return res.status(404).json({ message: "CV no encontrado" });
    res.json({ cv });
  } catch (err) { next(err); }
};