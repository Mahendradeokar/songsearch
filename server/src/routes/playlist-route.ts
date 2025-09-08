import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  createPlaylist,
  getPlaylists,
  updatePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  createShareToken,
  getSharedPlaylist,
} from "@src/controllers/playlist-controller";
import { authMiddleware } from "@src/middleware/auth-middleware";

const router: ExpressRouter = Router();

router.use(authMiddleware);

router.post("/", createPlaylist);
router.get("/", getPlaylists);
router.put("/:id", updatePlaylist);
router.delete("/:id", deletePlaylist);
router.put("/:id/spotify-track", addTrackToPlaylist);
router.post("/share-token", createShareToken);

export default router;
