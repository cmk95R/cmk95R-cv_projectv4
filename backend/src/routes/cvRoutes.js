// src/routes/cvRoutes.js

import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
// 1. IMPORTA TU MIDDLEWARE DE MULTER
import upload from "../middleware/upload.middleware.js"; 
import {
  upsertMyCV,
  listAllCVs,
  getMyCV,
} from "../controllers/cv.controller.js";
import { downloadMyCv } from "../controllers/cv.controller.js";


const router = Router();

// 2. AÑADE EL MIDDLEWARE DE UPLOAD AQUÍ
// El usuario carga/actualiza su propio CV. `upload.single("cvPdf")`
// procesa el archivo del campo "cvPdf" antes de llegar al controlador.
router.post("/me", requireAuth, upload.single("cvPdf"), upsertMyCV); // <-- ¡Aquí está la magia! 🚀

// Estas rutas no cambian
router.get("/me", requireAuth, getMyCV);
router.get("/", requireAuth, requireRole("admin"), listAllCVs);
// Ruta para que el usuario descargue su propio CV
router.get("/me/download", requireAuth, downloadMyCv);
export default router;