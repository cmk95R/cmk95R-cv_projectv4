import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  listSearches,
  createSearch,
  updateSearch,
  deleteSearch,
} from "../controllers/search.controller.js";

const router = Router();

router.get("/admin/searches", requireAuth, requireRole("admin"), listSearches);
router.post("/admin/searches", requireAuth, requireRole("admin"), createSearch);
router.patch("/admin/searches/:id", requireAuth, requireRole("admin"), updateSearch);
router.delete("/admin/searches/:id", requireAuth, requireRole("admin"), deleteSearch);

export default router;
