// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    // 1) Header Bearer
    let token = null;
    const h = req.headers.authorization || "";
    if (h.startsWith("Bearer ")) token = h.slice(7);

    // 2) Cookie 'token'
    if (!token && req.cookies?.token) token = req.cookies.token;

    if (!token) return res.status(401).json({ message: "Token requerido" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Aceptá ambos formatos: { id: ... } o { sub: ... }
    const userId = payload.id || payload.sub;
    if (!userId) return res.status(401).json({ message: "Token inválido (sin id)" });

    const user = await User
      .findById(userId)
      .select("_id nombre apellido email rol dni nacimiento direccion");
    if (!user) return res.status(401).json({ message: "Usuario no encontrado" });

    req.user = user;
    return next();
  } catch (e) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
