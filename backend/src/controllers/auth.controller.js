// controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), sub: user._id.toString(), rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

// POST /auth/register
export const register = async (req, res, next) => {
  try {
    let { nombre, apellido, email, password, direccion, rol } = req.body;

    // Normalización mínima
    nombre = String(nombre || "").trim();
    apellido = String(apellido || "").trim();
    email = String(email || "").trim().toLowerCase();
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    // Evitar duplicados
    const exists = await User.exists({ email });
    if (exists) return res.status(409).json({ message: "El email ya está registrado" });

    // Seguridad: no permitir admin desde registro público
    const safeRole = rol === "admin" ? "user" : (rol || "user");

    // Construir payload (el hash lo hace el pre('save') del modelo)
    const payload = { nombre, apellido, email, password, rol: safeRole };

    // "direccion" del form es una cadena (localidad) o un objeto
    if (typeof direccion === "string" && direccion.trim()) {
      payload.direccion = { ciudad: direccion.trim() };
    } else if (direccion && typeof direccion === "object") {
      payload.direccion = direccion;
    }

    const user = await User.create(payload);

    const token = signToken(user);
    return res.status(201).json({
      user: {
        id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
      },
      token,
    });
  } catch (err) {
    if (err?.code === 11000 && err?.keyPattern?.email) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }
    next(err);
  }
};

// POST /auth/login
export const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    email = String(email || "").trim().toLowerCase();

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

    const token = signToken(user);
    return res.json({
      user: {
        id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

// GET /auth/me
export const me = async (req, res) => {
  const { _id, nombre, apellido, email, rol } = req.user;
  res.json({ user: { id: _id, nombre, apellido, email, rol } });
};

// POST /auth/logout (opcional)
export const logout = (_req, res) => res.status(204).end();
