// src/routes/userRoutes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js"
import { requireRole } from "../middleware/role.middleware.js";
import { listUsers, makeAdmin, revokeAdmin, listUsersWithCv, editUser, adminSetUserStatus, adminSetUserRole } from "../controllers/user.controller.js";
import {getDashboardData} from "../controllers/dashboard.controller.js";

const router = Router();

// --- CORRECCIÓN: Añadimos la ruta para que el usuario edite su propio perfil ---
router.patch("/me", requireAuth, editUser);

router.get("/", requireAuth, requireRole("admin"), listUsers);
// CORRECCIÓN: Se añade la ruta para la grilla avanzada de candidatos/usuarios.
router.get("/admin", requireAuth, requireRole("admin","rrhh") , listUsersWithCv);
router.get("/dashboard", requireAuth, requireRole("admin"), getDashboardData);
router.patch("/:id/make-admin", requireAuth, requireRole("admin"), makeAdmin);
router.patch("/:id/revoke-admin", requireAuth, requireRole("admin"), revokeAdmin);
// Rutas con prefijo /admin/users/
router.patch("/admin/users/:id/status", requireAuth, requireRole("admin"), adminSetUserStatus);
router.patch("/admin/users/:id/role", requireAuth, requireRole("admin"), adminSetUserRole);

export default router;
