import mongoose from "mongoose";

const roles = ["user", "admin"];

const UserSchema = new mongoose.Schema({
  id:   { type: Number, required: true, unique: true },
  nombre:   { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, trim: true },
  nacimiento: { type: Date, trim: true },
  rol:      { type: String, enum: roles, default: "user" },
  direccion: [
    {
      provincia: { type: String, trim: true },
      ciudad: { type: String, trim: true },
      codigoPostal: { type: Number, trim: true },
  }]
}, { timestamps: true });

UserSchema.index({ email: 1 }, { unique: true });

export default mongoose.model("User", UserSchema);
