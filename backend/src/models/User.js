// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const roles = ["user", "admin"];

const direccionSchema = new mongoose.Schema({
  pais: { type: String, trim: true, default: "" },
  provincia: { type: String, trim: true, default: "" },
  ciudad: { type: String, trim: true, default: "" },
  codigoPostal: { type: String, trim: true, default: "" },
  linea1: { type: String, trim: true, default: "" },
  linea2: { type: String, trim: true, default: "" },
}, { _id: false });

const userSchema = new mongoose.Schema({
  // ⚠️ SIN unique aquí; lo definimos con índice parcial más abajo
  publicId: { type: String, trim: true, default: () => `USR-${Math.random().toString(36).slice(2,8).toUpperCase()}` },

  nombre:   { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: {
    type: String,
    trim: true,
    select: false,
    required: function () {
      return !this.providers?.google?.id;
    },
  },

  nacimiento: { type: Date },
  rol: { type: String, enum: roles, default: "user" },
  direccion: { type: direccionSchema, default: () => ({}) },

  providers: {
    google:   { id: String, email: String },
    
  },
}, { timestamps: true });


userSchema.index({ publicId: 1 }, {
  unique: true,
  partialFilterExpression: { publicId: { $type: "string" } },
});

// Hash de password
userSchema.pre("save", async function(next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", userSchema);
