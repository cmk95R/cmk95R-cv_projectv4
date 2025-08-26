import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

export const register = async (req, res, next) => {
  try {
    let { nombre, apellido, email, password, dni, nacimiento, rol } = req.body;

    // normalización básica
    email = String(email).trim().toLowerCase();
    if (nacimiento) {
      // permitir string "YYYY-MM-DD" y guardarlo como Date
      nacimiento = new Date(nacimiento);
      if (Number.isNaN(nacimiento.getTime())) nacimiento = undefined;
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "El email ya está registrado" });

    const hash = await bcrypt.hash(password, 10);

    // Seguridad: impedir crear admin desde endpoint público
    const safeRole = rol === "admin" ? "user" : (rol || "user");

    const user = await User.create({
      nombre,
      apellido,
      email,
      password: hash,
      dni,
      nacimiento,
      rol: safeRole,
    });

    const token = signToken({ id: user._id, rol: user.rol });

    res.status(201).json({
      user: {
        id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        dni: user.dni,
        nacimiento: user.nacimiento,
        rol: user.rol,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    email = String(email).trim().toLowerCase();

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

    const token = signToken({ id: user._id, rol: user.rol });

    res.json({
      user: {
        id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        dni: user.dni,
        nacimiento: user.nacimiento,
        rol: user.rol,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res) => {
  const { _id, nombre, apellido, email, rol, dni, nacimiento } = req.user;
  res.json({
    user: { id: _id, nombre, apellido, email, dni, nacimiento, rol },
  });
};
