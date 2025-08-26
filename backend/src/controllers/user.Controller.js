import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

export const register = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "El email ya está registrado" });

    const hash = await bcrypt.hash(password, 10);

    // seguridad: impedir crear admin desde endpoint público
    const safeRole = rol === "admin" ? "user" : (rol || "user");

    const user = await User.create({ nombre, email, password: hash, rol: safeRole });
    const token = signToken({ id: user._id, rol: user.rol });

    res.status(201).json({
      user: { id: user._id, nombre: user.nombre, email: user.email, rol: user.rol },
      token,
    });
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

    const token = signToken({ id: user._id, rol: user.rol });

    res.json({ user: { id: user._id, nombre: user.nombre, email: user.email, rol: user.rol }, token });
  } catch (err) { next(err); }
};

export const me = async (req, res) => {
  const { _id, nombre, email, rol } = req.user;
  res.json({ user: { id: _id, nombre, email, rol } });
};

export const logout = (req, res) => {
  res.status(204).json({ ok: true });
};

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("_id nombre apellido email rol createdAt");
    res.json({ users });
  } catch (e) { next(e); }
};

export const makeAdmin = async (req, res, next) => {
  try {
    const u = await User.findByIdAndUpdate(req.params.id, { rol: "admin" }, { new: true })
      .select("_id nombre apellido email rol");
    if (!u) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Rol actualizado a admin", user: u });
  } catch (e) { next(e); }
};

export const revokeAdmin = async (req, res, next) => {
  try {
    const u = await User.findByIdAndUpdate(req.params.id, { rol: "user" }, { new: true })
      .select("_id nombre apellido email rol");
    if (!u) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Rol revertido a user", user: u });
  } catch (e) { next(e); }
};