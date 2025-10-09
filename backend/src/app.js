// src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";

import connectDB from "./db/db.js";
import * as XLSX from "xlsx";

// rutas
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cvRoutes from "./routes/cvRoutes.js";
import adminSearchesRoutes from "./routes/adminSearches.routes.js";
import searchesRoutes from "./routes/searches.routes.js";
import applicationsRoutes from "./routes/applications.routes.js";

// Passport (Google)
import { initGooglePassport } from "./auth/google.strategy.js";

dotenv.config();

const app = express();
const IS_PROD = process.env.NODE_ENV === "production";

// ***** PROXY/HTTPS detrás de Nginx *****
app.set("trust proxy", IS_PROD ? 1 : 0);

/* ========== Middlewares ========== */
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// ***** CORS: permitir tu dominio en prod y localhost en dev *****
const ALLOWLIST = new Set([
  "https://rrhh.asytec.ar", 
  "http://localhost:5173",  

]);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); 
      try {

        const allowVercelWildcard =
          /\.vercel\.app$/i.test(new URL(origin).hostname);

        const ok = ALLOWLIST.has(origin) || allowVercelWildcard;
        if (ok) return cb(null, true);

        console.log("[CORS] Origin bloqueado:", origin);
        return cb(new Error("CORS not allowed"));
      } catch {
        return cb(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Preflight
app.options("*", cors());

/* ===== Sesión (necesaria para Google OAuth/`state`) ===== */
if (!process.env.SESSION_SECRET) {
  console.warn("⚠️ Falta SESSION_SECRET en .env");
}
app.use(
  session({
    secret: process.env.SESSION_SECRET || "cambia-esto-en-.env",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: IS_PROD, 
      sameSite: "lax",
    },
  })
);

/* ===== Passport ===== */
initGooglePassport();
app.use(passport.initialize());
app.use(passport.session());

/* ========== Healthcheck ========== */
app.get("/health", (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "dev" });
});

/* ========== Rutas API ========== */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/cv", cvRoutes);
app.use("/", adminSearchesRoutes); 
app.use("/", searchesRoutes);
app.use("/", applicationsRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Error interno del servidor" });
});

/* ========== Mongo + Server ========== */
const PORT = process.env.PORT || (IS_PROD ? 4000 : 3000);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ API lista en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error conectando a MongoDB:", err?.message || err);
    process.exit(1);
  });

export default app;
