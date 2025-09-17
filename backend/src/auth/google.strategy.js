import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import { signAuthToken } from "../utils/jwt.js";

export function initGooglePassport() {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BACKEND_URL } = process.env;

    passport.use(
        new GoogleStrategy(
            {
                clientID: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                callbackURL: `${BACKEND_URL}/auth/google/callback`,
            },
            async (_at, _rt, profile, done) => {
                try {
                    const email = profile?.emails?.[0]?.value?.toLowerCase();
                    const googleId = profile?.id;
                    const nombre = profile?.name?.givenName || profile?.displayName || "";
                    const apellido = profile?.name?.familyName || "";

                    let user = await User.findOne({
                        $or: [{ "providers.google.id": googleId }, { email }],
                    });

                    if (!user) {
                        user = await User.create({
                            email,
                            nombre,
                            apellido,
                            rol: "user",
                            providers: { google: { id: googleId, email } },
                        });
                    } else {
                        if (!user.providers) user.providers = {};
                        if (!user.providers.google || !user.providers.google.id) {
                            user.providers.google = { id: googleId, email };
                            await user.save();
                        }
                        }

                        const token = signAuthToken(user);
                        return done(null, { user, token });
                    } catch (err) {
                        return done(err);
                    }
                }
        )
    );
}
