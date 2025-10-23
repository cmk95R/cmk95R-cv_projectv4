import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;
const roles = ["user", "admin", "rrhh"];

const direccionSchema = new Schema({
    pais: { type: String, trim: true, default: "Argentina" },
    provincia: { type: Schema.Types.Mixed, default: "" },
    municipio: { type: Schema.Types.Mixed, default: "" },
    localidad: { type: Schema.Types.Mixed, default: "" },
    calle: { type: String, trim: true },
    numero: { type: String, trim: true },
    cp: { type: String, trim: true },
}, { _id: false });

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
        direccion: { type: direccionSchema, default: () => ({}) },
        providers: {
            google: { id: String, email: String },
        },
    },
    { timestamps: true }
);

userSchema.index({ publicId: 1 }, { unique: true, partialFilterExpression: { publicId: { $type: "string" } } });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = function (plainPassword) {
    if (!this.password) return false;
    return bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

export default mongoose.model("User", userSchema);