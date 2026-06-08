import { Router } from "express";
import { googleAuth, login, register } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { GoogleAuthSchema, LoginSchema, RegisterSchema } from "../types/user.js";

const router = Router();

router.post("/google", validate(GoogleAuthSchema), googleAuth);
router.post("/register", validate(RegisterSchema), register);
router.post("/login", validate(LoginSchema), login);

export default router;
