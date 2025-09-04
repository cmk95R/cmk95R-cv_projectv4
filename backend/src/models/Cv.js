// models/Cv.js
import mongoose from "mongoose";

const OPCIONES_AREA = ["Administracion", "Recursos Humanos", "Sistemas", "Pasantia"];
const NIVELES = [
  "Secundario completo", "Secundario incompleto", "Terciario/Técnico en curso",
  "Terciario/Técnico completo", "Universitario en curso", "Universitario completo",
  "Posgrado en curso", "Posgrado completo",
];

// Convierte "" o null a undefined → no dispara enum si no es required
const sanitizeEmpty = v => (v === "" || v == null ? undefined : v);

const cvSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },

  telefono: { type: String, trim: true, default: "" },
  linkedin: { type: String, trim: true, default: "" },

  nacimiento: { type: Date, set: sanitizeEmpty },

  // ❗ Sin default; permite undefined. Si llega "", lo convierte a undefined.
  areaInteres: {
    type: String,
    enum: OPCIONES_AREA,
    required: false,
    default: undefined,
    set: sanitizeEmpty
  },

  nivelAcademico: {
    type: String,
    enum: NIVELES,
    required: false,
    default: undefined,
    set: sanitizeEmpty
  },

  cvFile: {
    filename: String,
    mimetype: String,
    size: Number,
    url: String,
  },
}, { timestamps: true });

cvSchema.index({ areaInteres: 1, updatedAt: -1 });

export default mongoose.model("Cv", cvSchema);
