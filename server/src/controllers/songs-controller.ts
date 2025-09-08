import type { Request, Response } from "express";
import { asyncWrapper } from "@src/utils/async-wrapper";
import { httpErrors } from "@src/service/api-error";
import { createResponse } from "@src/utils/create-response";
import { z } from "zod";
import type { SearchSongsResponse } from "@shared-types";
import { tryCatch } from "@src/utils/try-catch";
import { SpotifyApiService } from "@src/service/spotify-api-service";

const searchSongsValidationSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(50).default(10),
  page: z.number().min(1).default(1),
});

export const searchSongs = asyncWrapper(async (req: Request, res: Response) => {
  console.log("DD");
  const shopifyAPI = SpotifyApiService.getInstance();
  const parseResult = searchSongsValidationSchema.safeParse({
    ...req.query,
    page: Number(req.query?.page ?? 0),
    limit: Number(req.query?.limit ?? 0),
  });

  if (!parseResult.success) {
    throw httpErrors.badRequest(z.prettifyError(parseResult.error));
  }

  const { query, limit, page } = parseResult.data;
  const offset = (page - 1) * limit;

  console.log("Rewached");
  const { data, error } = await tryCatch(
    shopifyAPI.searchTracks({
      query,
      limit,
      offset,
    })
  );
  console.log("Data", data, error);

  if (error) {
    throw httpErrors.badRequest(error.message);
  }

  res.status(200).json(
    createResponse<SearchSongsResponse>({
      tracks: data.tracks.items.map((item) => {
        return {
          album_images: item.album.images,
          album_name: item.album.name,
          artist_names: item.artists.map((art) => art.name),
          duration_ms: item.duration_ms,
          id: item.id,
          name: item.name,
        };
      }),
      total: data.tracks.total,
    })
  );
});
