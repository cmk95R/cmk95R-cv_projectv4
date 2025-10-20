import { Router } from "express";
import { register, login, me, logout } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import passport from "passport";


const router = Router();
router.post("/register", register);
router.post("/login", login);
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
