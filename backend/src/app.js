// backend/src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";

import connectDB from "./db/db.js";

// Rutas
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

/* ===== Proxy/HTTPS detrás de Nginx ===== */
app.set("trust proxy", IS_PROD ? 1 : 0);

/* ===== Parsers ===== */
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ===== CORS =====
   - En producción (mismo dominio) NO hace falta CORS.
   - En desarrollo permitimos http://localhost:5173 (Vite) con credenciales.
*/
if (!IS_PROD) {
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin) return cb(null, true);
        if (origin === "http://localhost:5173") return cb(null, true);
        return cb(new Error("CORS not allowed"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.options("*", (req, res) => res.sendStatus(204));
}

/* ===== Sesión (necesaria para el 'state' de OAuth) ===== */
if (!process.env.SESSION_SECRET) {
  console.warn("⚠️ Falta SESSION_SECRET en .env");
}
app.use(
  session({
    secret: process.env.SESSION_SECRET || "cambia-esto-en-.env",
    resave: false,
    saveUninitialized: false, // Cambiado a false, no necesitas guardar sesiones vacías
    cookie: {
      secure: IS_PROD,
      sameSite: "lax",
    },
  })
);

/* ===== Passport ===== */
app.use(passport.initialize());
initGooglePassport();

/* ===== Health ===== */
app.get("/health", (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "dev" });
});

/* ===== Rutas API ===== */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/cv", cvRoutes);
app.use("/", adminSearchesRoutes);
app.use("/", searchesRoutes);
app.use("/", applicationsRoutes);

/* ===== 404 ===== */
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

/* ===== Error handler ===== */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Error interno del servidor" });
});

/* ===== Mongo + Server ===== */
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
