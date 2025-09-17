// src/routes/applications.routes.js

import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  applyToSearch,
  myApplications,
  listApplications,
  updateApplication,
} from "../controllers/application.controller.js";

const router = Router();

// User: postularse y ver sus postulaciones
router.post("/searches/:id/apply", requireAuth, applyToSearch);
router.get("/applications/me", requireAuth, myApplications);

// Admin: ver/gestionar todas
router.get("/admin/applications", requireAuth, requireRole("admin"), listApplications);
router.patch("/admin/applications/:id", requireAuth, requireRole("admin"), updateApplication);

export default router;
