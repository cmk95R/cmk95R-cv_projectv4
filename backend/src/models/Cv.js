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

const experienciaSchema = new mongoose.Schema({
  puesto: { type: String, trim: true },
  empresa: { type: String, trim: true },
  desde: { type: Date },
  hasta: { type: Date },
}, { _id: false });


const cvSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },

  telefono: { type: String, trim: true, default: "" },
  linkedin: { type: String, trim: true, default: "" },

  nacimiento: { type: Date, trim: true },
  perfil: { type: String, trim: true, default: "" }, // Resumen profesional
  direccion: {
    localidad: { type: String, trim: true, default: "" },
    provincia: { type: String, trim: true, default: "" },
    pais: { type: String, trim: true, default: "" },
  },
  
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

  // Nuevos campos de Educación
  institucion: { type: String, trim: true, default: "" },
  periodoEduDesde: { type: Date },
  periodoEduHasta: { type: Date },

  experiencia: [experienciaSchema],
  cvFile: {
    filename: String,
    mimetype: String,
    size: Number,
    url: String,
  },
}, { timestamps: true });

cvSchema.index({ areaInteres: 1, updatedAt: -1 });

export default mongoose.model("Cv", cvSchema);
