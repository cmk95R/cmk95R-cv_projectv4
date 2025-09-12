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

dotenv.config();
const allowList = new Set([
  "http://localhost:5173",
  "https://cmk95-r-cv-projectv4-9xdl4b08v-cristians-projects-76345bd6.vercel.app", // tu URL en Vercel
]);
const app = express();

/* ========== Middlewares ========== */
app.use(
  cors({
    origin(origin, cb) {
      // Permitir llamadas sin Origin (healthchecks, curl)
      if (!origin) return cb(null, true);
      try {
        const { hostname } = new URL(origin);
        // Permitir tu URL exacta y cualquier subdominio *.vercel.app (previews)
        if (allowList.has(origin) || hostname.endsWith(".vercel.app")) {
          return cb(null, true);
        }
      } catch (_) {}
      return cb(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// (Opcional) responder preflights explícitamente
app.options("*", cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

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

/* ========== 404 & Error handler ========== */
app.use(express.json()); // 👈 importante

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
