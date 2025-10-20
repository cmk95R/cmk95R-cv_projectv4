import { Router } from "express";
import { register, login, me, logout } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import passport from "passport";

// --- INICIO: VALIDACIÓN ---
import { body } from "express-validator";

const registerValidations = [
  body("nombre")
    .trim()
    .notEmpty().withMessage("El nombre es requerido.")
    .isLength({ min: 2 }).withMessage("El nombre debe tener al menos 2 caracteres.")
    .matches(/^[a-zA-ZÀ-ÿ\s']+$/).withMessage("El nombre solo puede contener letras y espacios."),
  body("apellido")
    .trim()
    .notEmpty().withMessage("El apellido es requerido.")
    .isLength({ min: 2 }).withMessage("El apellido debe tener al menos 2 caracteres.")
    .matches(/^[a-zA-ZÀ-ÿ\s']+$/).withMessage("El apellido solo puede contener letras y espacios."),
  body("email", "El email no es válido").isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,])/)
    .withMessage("La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&.,)."),
];

const loginValidations = [
  body("email", "El email no es válido").isEmail().normalizeEmail(),
  body("password", "La contraseña es requerida").notEmpty(),
];
// --- FIN: VALIDACIÓN ---


const router = Router();
router.post("/register", registerValidations, register);
router.post("/login", loginValidations, login);
router.get("/profile", requireAuth, me); 
router.post("/logout", logout);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], prompt: "consent" })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google`,
  }),
  (req, res) => {
    const token = req.user?.token; // viene del strategy
    const url = new URL(`${process.env.FRONTEND_URL}/login/sso`);
    url.searchParams.set("token", token);
    return res.redirect(url.toString());
  }
);

export default router;
