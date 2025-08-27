import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js"; // lo creamos abajo
import { upsertMyCV, listAllCVs } from "../controllers/cv.controller.js";

const router = Router();

// Usuario común carga/actualiza su propio CV
router.post("/me", requireAuth, upsertMyCV);

// Admin: listar todos los CVs con datos del usuario
router.get("/", requireAuth, requireRole("admin"), listAllCVs);

export default router;
