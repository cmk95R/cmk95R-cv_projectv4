import { Router } from "express";
import { register, login, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import passport from "passport";
const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/profile", requireAuth, me); 



// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], prompt: "consent" })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=oauth' }),
  (req, res) => {
    
    return res.redirect('/');
  }
);

export default router;
