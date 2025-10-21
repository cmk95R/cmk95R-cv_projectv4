// controllers/cv.controller.js

import User from "../models/User.js";
import Cv from "../models/Cv.js";
import Application from "../models/Application.js"; // <-- CORRECCIÓN: Importación añadida
// <-- CAMBIO 1: Importar nuestro servicio de OneDrive
import { uploadFileToOneDrive } from "../services/oneDrive.service.js";
import { getDownloadUrlForFile, deleteFileFromOneDrive } from "../services/oneDrive.service.js";
// ... (ALLOWED_FIELDS, OPCIONES_AREA, NIVELES no cambian) ...
const ALLOWED_FIELDS = new Set([
  "nombre", "apellido", "nacimiento", "perfil", "telefono",
  "linkedin", "email", "areaInteres", "educacion", "experiencia" // <-- 'direccion' eliminado
  // Eliminados los campos de educación individuales
]);
const OPCIONES_AREA = ["Administracion", "Recursos Humanos", "Sistemas", "Pasantia"];
const NIVELES = [
  "Secundario completo", "Secundario incompleto", "Terciario/Técnico en curso",
  "Terciario/Técnico completo", "Universitario en curso", "Universitario completo",
  "Posgrado en curso", "Posgrado completo",
];

// <-- CAMBIO 2: La función ahora es 'async' y recibe el objeto 'user' completo
async function normalizePayload(body, file, user) {
  const $set = {};
  const $unset = {};

  // --- INICIO: CORRECCIÓN ---
  // Cuando los datos vienen de `multipart/form-data`, los objetos se envían como strings JSON.
  // Necesitamos parsearlos de vuelta a objetos antes de procesarlos.
  const fieldsToParse = ['direccion', 'educacion', 'experiencia'];
  for (const field of fieldsToParse) {
    if (body[field] && typeof body[field] === 'string') {
      try {
        body[field] = JSON.parse(body[field]);
      } catch (e) {
        console.error(`Error al parsear el campo ${field} del CV:`, e);
      }
    }
  }
  // --- FIN: CORRECCIÓN ---

  const put = (k, v) => {
    if (v === "" || v == null) $unset[k] = "";
    else $set[k] = v;
  };

  for (const [k, v0] of Object.entries(body || {})) {
    if (!ALLOWED_FIELDS.has(k)) continue;
    let v = v0;
    if (k === "areaInteres") {
      const val = String(v || "").trim();
      v = OPCIONES_AREA.includes(val) ? val : "";
    }
    if (k === "experiencia") {
      try {
        v = JSON.parse(v);
      } catch (e) {
        // Ignora si no es un JSON válido, puede que venga como objeto
      }
      v = Array.isArray(v) && v.length > 0 ? v : "";
    }
    if (k === "educacion") {
      try {
        v = JSON.parse(v);
      } catch (e) {
        // Ignora si no es un JSON válido, puede que venga como objeto
      }
      v = Array.isArray(v) && v.length > 0 ? v : "";
    }
    put(k, v);
  }
  
  // <-- CAMBIO 3: Lógica de subida de archivo actualizada para OneDrive
  if (file) {
    // 1. Crear un nombre de archivo descriptivo y único
    const safeName = (user.nombre || "usuario").replace(/[^a-zA-Z0-9]/g, '_');
    const safeApellido = (user.apellido || "").replace(/[^a-zA-Z0-9]/g, '_');
    // Usamos un timestamp para evitar colisiones si el usuario sube el mismo CV varias veces
    const timestamp = Date.now();
    const fileName = `CV_${safeName}_${safeApellido}_${timestamp}.pdf`;

    // 2. Subir el archivo a OneDrive usando el servicio
    const uploadResult = await uploadFileToOneDrive(file.buffer, fileName, "CVs");

    // 3. Guardar los datos de OneDrive en el objeto $set
    $set.cvFile = {
      filename: fileName, // Corregido: 'filename' para coincidir con el modelo
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
    const cv = await Cv.findOne({ user: req.user._id })
      .populate("user", " publicId email nombre apellido rol telefono direccion nacimiento")
      .lean();
    return res.json({ cv });
  } catch (err) { next(err); }
};


// POST /cv/me  (upsert)
export const upsertMyCV = async (req, res, next) => {
  try {
    // --- INICIO: Lógica de reemplazo de archivo ---
    let oldFileIdToDelete = null;
    if (req.file) {
      // Si se está subiendo un archivo nuevo, buscamos el CV existente para ver si tenía un archivo anterior.
      const existingCv = await Cv.findOne({ user: req.user._id }).lean();
      if (existingCv?.cvFile?.providerId) {
        oldFileIdToDelete = existingCv.cvFile.providerId;
      }
    }
    // --- FIN: Lógica de reemplazo de archivo ---

    // <-- CAMBIO 4: Ahora esperamos la promesa de normalizePayload y pasamos el objeto 'user' completo
    const update = await normalizePayload(req.body, req.file, req.user);

    const cv = await Cv.findOneAndUpdate(
      { user: req.user._id },
      { ...update, $setOnInsert: { user: req.user._id } },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    ).populate("user", "publicId email nombre apellido rol telefono direccion nacimiento");

    // --- INICIO: Actualizar también el modelo User ---
    const userUpdate = {};
    // Sincronizamos los campos principales del CV al User.
    if (update.$set.nombre) userUpdate.nombre = update.$set.nombre;
    if (update.$set.apellido) userUpdate.apellido = update.$set.apellido;
    if (update.$set.telefono) userUpdate.telefono = update.$set.telefono;
    if (update.$set.nacimiento) userUpdate.nacimiento = update.$set.nacimiento;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdate);
    }
    // --- FIN: Actualizar también el modelo User ---

    // --- INICIO: Eliminar archivo antiguo si corresponde ---
    if (oldFileIdToDelete) {
      // Llamamos a la función para eliminar el archivo de OneDrive. No bloqueamos la respuesta por esto.
      deleteFileFromOneDrive(oldFileIdToDelete);
    }
    // --- FIN: Eliminar archivo antiguo si corresponde ---

    return res.json({ cv, message: "CV actualizado" });
  } catch (err) { next(err); }
};

// ... (listAllCVs y getCV no cambian) ...
export const listAllCVs = async (_req, res, next) => {
  try {
    const cvs = await Cv.find()
      .populate("user", "publicId email nombre apellido rol telefono direccion nacimiento");
    res.json({ cvs });
  } catch (err) { next(err); }
};
export const getCV = async (req, res, next) => {
  try {
    const cv = await Cv.findById(req.params.id)
      .populate("user", "publicId email nombre apellido rol telefono direccion nacimiento createdAt");
    if (!cv) return res.status(404).json({ message: "CV no encontrado" });
    res.json({ cv });
  } catch (err) { next(err); }
};


/**
 * 📄 POSTULANTE: Descarga su propio CV.
 * GET /cv/me/download
 */
export const downloadMyCv = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const cv = await Cv.findOne({ user: userId }).lean();
    if (!cv?.cvFile?.providerId) {
      return res.status(404).json({ message: "No se encontró un archivo de CV adjunto." });
    }

    const downloadUrl = await getDownloadUrlForFile(cv.cvFile.providerId);
    if (!downloadUrl) {
      return res.status(500).json({ message: "No se pudo obtener el enlace de descarga." });
    }

    // --- ¡CAMBIO CLAVE! ---
    // En lugar de redirigir, enviamos la URL en un JSON.
    return res.json({ downloadUrl });

  } catch (e) {
    next(e);
  }
};


/**
 * 🔑 ADMIN: Descarga el CV de cualquier postulación.
 * GET /admin/applications/:id/cv/download
 */
export const downloadCvByApplication = async (req, res, next) => {
    try {
        const applicationId = req.params.id;

        // 1. Busca la postulación para obtener la referencia al CV
        const application = await Application.findById(applicationId).lean();
        if (!application) {
            return res.status(404).json({ message: "Postulación no encontrada." });
        }

        // 2. Usamos la "foto" del CV (snapshot) que se guardó en la postulación
        const oneDriveFileId = application.cvSnapshot?.cvFile?.providerId;
        if (!oneDriveFileId) {
            return res.status(404).json({ message: "Esta postulación no tiene un archivo de CV adjunto." });
        }
        
        // 3. Obtiene la URL de descarga
        const downloadUrl = await getDownloadUrlForFile(oneDriveFileId);
        if (!downloadUrl) {
            return res.status(500).json({ message: "No se pudo obtener el enlace de descarga del archivo." });
        }

        // 4. Devolvemos la URL en un JSON para que el frontend la gestione
        return res.json({ downloadUrl });

    } catch (e) {
        next(e);
    }
};

/**
 * 🔑 ADMIN: Descarga el CV de un usuario por su ID.
 * GET /admin/users/:userId/cv/download
 */
export const downloadCvByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const cv = await Cv.findOne({ user: userId }).lean();
    if (!cv?.cvFile?.providerId) {
      return res.status(404).json({ message: "El usuario no tiene un archivo de CV adjunto." });
    }

    const downloadUrl = await getDownloadUrlForFile(cv.cvFile.providerId);
    if (!downloadUrl) {
      return res.status(500).json({ message: "No se pudo obtener el enlace de descarga del archivo." });
    }

    // Devolvemos la URL en un JSON para que el frontend la gestione
    return res.json({ downloadUrl });

  } catch (e) {
    next(e);
  }
};