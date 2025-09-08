import { Router } from "express";
import { searchSongs } from "@src/controllers/songs-controller";
import type { Router as ExpressRouter } from "express";

const router: ExpressRouter = Router();

router.get("/search", searchSongs);

export default router;
