// src/auth/google.strategy.js

// 1. AÑADE ESTA IMPORTACIÓN
import jwt from "jsonwebtoken";

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

export function initGooglePassport() {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BASE_URL } = process.env;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !BASE_URL) {
        console.warn("🔸 Google OAuth deshabilitado (faltan envs)");
        return;
    }

    passport.use(
        new GoogleStrategy(
            {
                clientID: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                callbackURL: `${BASE_URL.replace(/\/+$/, "")}/auth/google/callback`,
            },
            async (_at, _rt, profile, done) => {
                try {
                    const email = profile?.emails?.[0]?.value?.toLowerCase() || null;
                    const googleId = profile?.id;
                    // ... (resto de la extracción de datos del perfil)

                    let user =
                        (await User.findOne({ "providers.google.id": googleId })) ||
                        (email && (await User.findOne({ email })));

                    if (!user) {
                        user = await User.create({ /* ... tus datos de usuario ... */ });
                    } else if (!user.providers?.google?.id) {
                        user.providers = user.providers || {};
                        user.providers.google = { id: googleId, email };
                        await user.save();
                    }

                    // --- 2. CAMBIO CLAVE AQUÍ ---
                    // Crea el payload del token
                    const payload = { id: user._id.toString(), rol: user.rol };

                    // Firma el token
                    const token = jwt.sign(payload, process.env.JWT_SECRET, {
                        expiresIn: "1d", // O tu tiempo de expiración preferido
                    });

                    // Pasa el token en el objeto user a la función done()
                    return done(null, { token });

                } catch (err) {
                    return done(err);
                }
            }
        )
    );
}