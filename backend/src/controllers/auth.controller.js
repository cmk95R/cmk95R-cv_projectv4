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

/** Normaliza "direccion" al formato esperado:
 * {
 *   provincia?: { id?: string, nombre?: string },
 *   localidad?: { id?: string, nombre?: string },
 *   calle?: string, numero?: string, cp?: string
 * }
 * Acepta:
 * - string (legacy): "Flores"
 * - objeto legacy: { ciudad: "Flores" }
 * - objeto oficial: { provincia:{id,nombre}, localidad:{id,nombre} }
 */
function normalizeDireccion(input) {
  if (!input) return undefined;

  if (typeof input === "string") {
    const nombre = input.trim();
    if (!nombre) return undefined;
    return { localidad: { nombre } };
  }

  if (typeof input === "object") {
    const out = {};

    // legacy { ciudad: "Flores" }
    if (typeof input.ciudad === "string" && input.ciudad.trim()) {
      out.localidad = { nombre: input.ciudad.trim() };
    }

    // oficial provincia/localidad (puede venir string u objeto)
    if (input.provincia) {
      if (typeof input.provincia === "string") {
        out.provincia = { nombre: input.provincia.trim() };
      } else if (typeof input.provincia === "object") {
        out.provincia = {
          id: input.provincia.id ? String(input.provincia.id).trim() : undefined,
          nombre: input.provincia.nombre ? String(input.provincia.nombre).trim() : undefined,
        };
      }
    }
    if (input.localidad) {
      if (typeof input.localidad === "string") {
        out.localidad = { nombre: input.localidad.trim() };
      } else if (typeof input.localidad === "object") {
        out.localidad = {
          id: input.localidad.id ? String(input.localidad.id).trim() : undefined,
          nombre: input.localidad.nombre ? String(input.localidad.nombre).trim() : undefined,
        };
      }
    }

    // extras opcionales
    ["calle", "numero", "cp"].forEach((k) => {
      if (input[k]) out[k] = String(input[k]).trim();
    });

    // si quedó vacío, retorná undefined
    if (!out.provincia && !out.localidad && !out.calle && !out.numero && !out.cp) {
      return undefined;
    }
    return out;
  }

  return undefined;
}

// POST /auth/register
export const register = async (req, res, next) => {
  try {
    let { nombre, apellido, email, password, direccion, rol, nacimiento } = req.body;

    // Normalización mínima
    nombre = String(nombre || "").trim();
    apellido = String(apellido || "").trim();
    email = String(email || "").trim().toLowerCase();
    password = String(password || "");
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    // Evitar duplicados
    const exists = await User.exists({ email });
    if (exists) return res.status(409).json({ message: "El email ya está registrado" });

    // Seguridad: no permitir admin desde registro público
    const safeRole = rol === "admin" ? "user" : (rol || "user");

    // Normalizar dirección al formato esperado
    const direccionNorm = normalizeDireccion(direccion);

    // Construir payload (el hash lo hace el pre('save') del modelo si lo tenés)
    const payload = {
      nombre,
      apellido,
      email,
      password,
      rol: safeRole,  // ✅ corregido
      nacimiento,     // ✅ ahora nacimiento es nacimiento
    };
    if (direccionNorm) payload.direccion = direccionNorm;

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
  // req.user es el documento completo de Mongoose, lo convertimos a objeto plano
  const userObj = req.user.toObject();

  res.json({
    user: {
      id: userObj._id,
      nombre: userObj.nombre,
      apellido: userObj.apellido,
      email: userObj.email,
      rol: userObj.rol,
      direccion: userObj.direccion, // Devolvemos el objeto de dirección completo
      nacimiento: userObj.nacimiento, // Y la fecha de nacimiento
    },
  });
};

// POST /auth/logout (opcional)
export const logout = (_req, res) => res.status(204).end();
