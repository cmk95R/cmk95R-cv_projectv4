import { Router } from "express";
import { listPublicSearches, getPublicSearch } from "../controllers/search.controller.js";

const router = Router();

// PÚBLICO (sin auth)
router.get("/searches", listPublicSearches);
router.get("/searches/:id", getPublicSearch);

export default router;
