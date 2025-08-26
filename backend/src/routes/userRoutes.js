// src/routes/userRoutes.js
import { Router } from "express";
const router = Router();

// Ejemplo: GET /api/users
router.get("/", (req, res) => {
  res.json([{ id: 1, nombre: "Ejemplo", email: "ejemplo@mail.com" }]);
});

export default router;
