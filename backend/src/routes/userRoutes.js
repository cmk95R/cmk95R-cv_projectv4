// src/routes/userRoutes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js"
import { requireRole } from "../middleware/role.middleware.js";
import { listUsers, makeAdmin, revokeAdmin } from "../controllers/user.controller.js";
import {getDashboardData} from "../controllers/dashboard.controller.js";

const router = Router();
router.get("/", requireAuth, requireRole("admin"), listUsers);
router.get("/dashboard", requireAuth, requireRole("admin"), getDashboardData);
router.patch("/:id/make-admin", requireAuth, requireRole("admin"), makeAdmin);
router.patch("/:id/revoke-admin", requireAuth, requireRole("admin"), revokeAdmin);


export default router;
