import z from "zod";

export const createPlaylistValidationSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

export const updatePlaylistValidationSchema =
  createPlaylistValidationSchema.partial();

export const addTrackToPlaylistSchema = z.object({
  trackId: z.string().trim().min(1),
});

export const createShareTokenSchema = z.object({
  playlistId: z.string().min(1),
});
