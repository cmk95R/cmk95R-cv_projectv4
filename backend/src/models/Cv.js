import mongoose from "mongoose";

const AREAS = [
  "Desarrollo",
  "Administrativo",
  "Recursos Humanos",
  "Soporte Técnico",
  "Ciberseguridad",
];

const NIVELES_ACAD = [
  "Secundario completo",
  "Secundario incompleto",
  "Terciario/Técnico en curso",
  "Terciario/Técnico completo",
  "Universitario en curso",
  "Universitario completo",
  "Posgrado en curso",
  "Posgrado completo",
];

const NIVELES_INGLES = [
  "Sin conocimientos",
  "Nivel básico",
  "Nivel intermedio",
  "Nivel avanzado",
];

const AMBITOS = ["Freelancer", "Soy estudiante y trabajo", "Soy estudiante", "Pasante", "Otro"];

const DISPONIBILIDAD = ["Full-time", "Part-time", "Freelance"];

const CVSchema = new mongoose.Schema(
  {
    // Relación con el usuario autenticado
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Datos personales (del form)
    nombre: { type: String, trim: true, required: true },
    nacimiento: { type: Date }, // viene del <input type="date">
    ciudad: { type: String, trim: true },
    provincia: { type: String, trim: true },
    pais: { type: String, trim: true, required: true },

    email: { type: String, trim: true, lowercase: true, required: true },
    telefono: { type: String, trim: true, required: true },

    // Área / rol + habilidades
    areaRol: { type: String, enum: AREAS, required: true }, // viene de rolSeleccionado
    habilidades: {
      type: [String],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 5,
        message: "Podés elegir hasta 5 habilidades técnicas.",
      },
      default: [],
    },
    otraHabilidad: { type: String, trim: true },

    // Habilidades blandas
    competencias: {
      type: [String],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 5,
        message: "Podés elegir hasta 5 habilidades blandas.",
      },
      default: [],
    },

    // Perfil / redes / expectativa
    perfil: { type: String, trim: true },
    salario: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    repositorio: { type: String, trim: true }, // GitHub/GitLab/Otro

    // Educación / idiomas / situación laboral
    nivelAcademico: { type: String, enum: NIVELES_ACAD, required: true },
    carreraIT: { type: String, enum: ["SI", "NO", ""], default: "" },
    nivelIngles: { type: String, enum: NIVELES_INGLES, default: "Sin conocimientos" },
    certIngles: { type: String, enum: ["SI", "NO", ""], default: "" },
    detalleCertIngles: { type: String, trim: true },

    ambitoLaboral: { type: String, enum: AMBITOS, required: true },
    otraSituacion: { type: String, trim: true },

    relacionIT: { type: String, enum: ["SI", "NO", ""], default: "" },
    aniosIT: { type: Number, min: 0, max: 50 },

    disponibilidad: { type: String, enum: DISPONIBILIDAD },

    // Archivo CV (para cuando sumemos multer)
    cvFile: {
      originalName: String,
      fileName: String,     // nombre almacenado en disco/cloud
      url: String,          // si usás S3/Cloudinary, etc.
      mimetype: String,
      size: Number,
      uploadedAt: Date,
    },

    // Estado del proceso (por si luego querés pipeline)
    status: {
      type: String,
      enum: ["submitted", "screening", "rejected", "hired", "draft"],
      default: "submitted",
      index: true,
    },
  },
  { timestamps: true }
);

// Si querés forzar un CV por usuario, activá esta línea:
CVSchema.index({ user: 1 }, { unique: true });

export default mongoose.model("CV", CVSchema);
