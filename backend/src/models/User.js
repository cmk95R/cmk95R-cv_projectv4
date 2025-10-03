// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;
const roles = ["user", "admin"];

// Helper para normalizar string u objeto {id,nombre} => {id?, nombre?}
function normalizeIdNombre(value) {
  if (!value) return undefined;
  if (typeof value === "string") {
    const nombre = value.trim();
    if (!nombre) return undefined;
    return { nombre };
  }
  if (typeof value === "object") {
    const id = value.id != null ? String(value.id).trim() : undefined;
    const nombre =
      value.nombre != null ? String(value.nombre).trim() : undefined;
    if (!id && !nombre) return undefined;
    return { id, nombre };
  }
  return undefined;
}

const direccionSchema = new Schema(
  {
    // Por defecto asumimos Argentina; cambialo si necesitás internacionalizar
    pais: { type: String, trim: true, default: "Argentina" },

    // Usamos Mixed para admitir legacy string o {id,nombre}
    provincia: { type: Schema.Types.Mixed, default: "" },
    municipio: { type: Schema.Types.Mixed, default: "" }, // opcional si lo usás
    localidad: { type: Schema.Types.Mixed, default: "" },

    // Extras opcionales
    calle: { type: String, trim: true },
    numero: { type: String, trim: true },
    cp: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    publicId: {
      type: String,
      trim: true,
      default: () => `USR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    },

    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    telefono: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    password: {
      type: String,
      trim: true,
      select: false,
      required: function () {
        return !this.providers?.google?.id;
      },
    },

    nacimiento: { type: Date, trim: true },
    rol: { type: String, enum: roles, default: "user" },

    // AHORA direccion soporta:
    // - legacy: provincia: "Buenos Aires", ciudad: "La Matanza" (=> guardalo en 'localidad')
    // - nuevo: provincia/localidad {id,nombre}
    direccion: { type: direccionSchema, default: () => ({}) },

    providers: {
      google: { id: String, email: String },
    },
  },
  { timestamps: true }
);

// Índice de publicId
userSchema.index(
  { publicId: 1 },
  {
    unique: true,
    partialFilterExpression: { publicId: { $type: "string" } },
  }
);

// Hash de password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Devuelve SIEMPRE direccion normalizada { provincia:{}, municipio?, localidad:{} }
userSchema.methods.getDireccionNormalizada = function () {
  const d = this.direccion || {};
  // Soporte legacy: si tuvieras 'ciudad' antigua en algún documento:
  const localidad =
    d.localidad != null ? d.localidad : d.ciudad != null ? d.ciudad : undefined;

  return {
    pais: d.pais || "Argentina",
    provincia: normalizeIdNombre(d.provincia),
    municipio: normalizeIdNombre(d.municipio),
    localidad: normalizeIdNombre(localidad),
    calle: d.calle || undefined,
    numero: d.numero || undefined,
    cp: d.cp || undefined,
  };
};

// Ocultar password al serializar
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", userSchema);
