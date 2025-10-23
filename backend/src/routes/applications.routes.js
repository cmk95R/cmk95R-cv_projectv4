// src/routes/applications.routes.js

import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  applyToSearch,
  withdrawApplication,
  myApplications,
  listApplications,
  updateApplication,
} from "../controllers/application.controller.js";
import { downloadCvByApplication } from "../controllers/cv.controller.js";

const router = Router();

// User: postularse y ver sus postulaciones
router.post("/searches/:id/apply", requireAuth, applyToSearch);
router.get("/applications/me", requireAuth, myApplications);
router.delete("/applications/:id", requireAuth, withdrawApplication);
// Admin: ver/gestionar todas
router.get("/admin/applications", requireAuth, requireRole("admin", "rrhh"), listApplications);
router.patch("/admin/applications/:id", requireAuth, requireRole("admin", "rrhh"), updateApplication);
// Ruta para que un admin descargue el CV de una postulación
router.get("/admin/applications/:id/cv/download", requireAuth, requireRole("admin", "rrhh"), downloadCvByApplication);
export default router;
