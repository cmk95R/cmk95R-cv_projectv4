import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Token requerido" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("_id nombre apellido email rol dni nacimiento");
    if (!user) return res.status(401).json({ message: "Usuario no encontrado" });

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
