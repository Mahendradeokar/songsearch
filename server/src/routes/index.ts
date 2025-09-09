import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import authRouter from "./auth-route";
import playlistRouter from "./playlist-route";
import songRouter from "./song-router";
import { authMiddleware } from "@src/middleware/auth-middleware";
import { getSharedPlaylist } from "@src/controllers/playlist-controller";

const router: ExpressRouter = Router();

router.use("/auth", authRouter);
router.get("/playlist/shared/:token", getSharedPlaylist);
router.use("/playlist", authMiddleware, playlistRouter);
router.use("/song", authMiddleware, songRouter);

export default router;
