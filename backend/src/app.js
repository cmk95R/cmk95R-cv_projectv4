// src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import * as XLSX from "xlsx";
// rutas
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cvRoutes from "./routes/cvRoutes.js";
import adminSearchesRoutes from "./routes/adminSearches.routes.js";
import searchesRoutes from "./routes/searches.routes.js";
import applicationsRoutes from "./routes/applications.routes.js";
import passport from "passport";
import { initGooglePassport } from "./auth/google.strategy.js";


dotenv.config();
const app = express();
/* ========== Middlewares ========== */
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS: Vercel prod + previews + localhost
const allowList = new Set([
  "http://localhost:5173",
  "https://cmk95-r-cv-projectv4-9xdl4b08v-cristians-projects-76345bd6.vercel.app",
]);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // healthchecks / curl
      try {
        const { hostname } = new URL(origin);
        const ok = allowList.has(origin) || hostname.endsWith(".vercel.app");
        // log de debug (borralo luego)
        console.log("[CORS] Origin:", origin, "=>", ok ? "OK" : "BLOCK");
        return cb(ok ? null : new Error("CORS not allowed"), ok);
      } catch {
        return cb(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Responder preflight
app.options("*", cors());

// Google OAuth (sin sesiones)
initGooglePassport();
app.use(passport.initialize());

/* ========== Healthcheck ========== */
app.get("/health", (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "dev" });
});

/* ========== Rutas API ========== */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/cv", cvRoutes);
app.use("/", adminSearchesRoutes); // expone /admin/searches
app.use("/", searchesRoutes);    
app.use("/", applicationsRoutes);


app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Error interno del servidor" });
});

/* ========== Mongo Atlas + Server ========== */
const PORT = process.env.PORT || 4000;

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
