import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

export function initGooglePassport() {
    const {
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        BASE_URL, // 👈 usamos BASE_URL (no BACKEND_URL)
    } = process.env;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !BASE_URL) {
        throw new Error("Google OAuth envs missing (GOOGLE_CLIENT_ID/SECRET, BASE_URL)");
    }

    passport.use(
        new GoogleStrategy(
            {
                clientID: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                callbackURL: `${BASE_URL.replace(/\/+$/, "")}/auth/google/callback`,
            },
            // verify
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    const email = profile?.emails?.[0]?.value?.toLowerCase() || null;
                    const googleId = profile?.id;
                    const nombre = profile?.name?.givenName || profile?.displayName || "";
                    const apellido = profile?.name?.familyName || "";
                    const avatar = profile?.photos?.[0]?.value || null;

                    let user =
                        (await User.findOne({ "providers.google.id": googleId })) ||
                        (email && (await User.findOne({ email })));

                    if (!user) {
                        user = await User.create({
                            email,
                            nombre,
                            apellido,
                            rol: "user",
                            avatar,
                            providers: { google: { id: googleId, email } },
                        });
                    } else {
                        if (!user.providers) user.providers = {};
                        if (!user.providers.google || !user.providers.google.id) {
                            user.providers.google = { id: googleId, email };
                            await user.save();
                        }
                    }

                    // ✅ devolver algo SERIALIZABLE y mínimo (solo id)
                    return done(null, { id: user._id.toString() });
                } catch (err) {
                    return done(err);
                }
            }
        )
    );

    // ✅ guardar SOLO el id en la sesión
    passport.serializeUser((user, done) => {
        try {
            if (!user?.id) return done(new Error("serializeUser: user.id missing"));
            done(null, user.id);
        } catch (e) {
            done(e);
        }
    });

    // ✅ reconstruir el usuario en cada request (si lo necesitás)
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id).lean();
            if (!user) return done(new Error("deserializeUser: user not found"));
            done(null, user);
        } catch (e) {
            done(e);
        }
    });
}
