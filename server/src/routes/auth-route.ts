import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { signup, login, getUser } from "@src/controllers/auth-controller";
import { authMiddleware } from "@src/middleware/auth-middleware";

const router: ExpressRouter = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/user", authMiddleware, getUser);

export default router;
