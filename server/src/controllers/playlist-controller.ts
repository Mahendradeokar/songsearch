import type { Request, Response } from "express";
import { PlaylistModel } from "../models/playlist-model";
import { asyncWrapper } from "@src/utils/async-wrapper";
import { httpErrors } from "@src/service/api-error";
import { createResponse } from "@src/utils/create-response";
import { z } from "zod";
import type {
  CreatePlaylistResponse,
  CreateShareTokenResponse,
  GetPlaylistListResponse,
  GetSharedPlaylistResponse,
  Song,
} from "@shared-types";
import {
  addTrackToPlaylistSchema,
  createPlaylistValidationSchema,
  createShareTokenSchema,
  updatePlaylistValidationSchema,
} from "@src/validations/playlist-validation";
import {
  SpotifyApiService,
  SpotifyTracks,
} from "@src/service/spotify-api-service";
import { randomBytes } from "crypto";

export const createPlaylist = asyncWrapper(
  async (req: Request, res: Response) => {
    const parseResult = createPlaylistValidationSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw httpErrors.badRequest(z.prettifyError(parseResult.error));
    }

    const { name, description } = parseResult.data;

    const userId = res.locals.user?.userId;

    const playlist = await PlaylistModel.create({
      name,
      description,
      user: userId,
      spotifyTrackIds: [],
    });

    res.status(200).json(
      createResponse<CreatePlaylistResponse>({
        _id: playlist._id,
        name: playlist.name,
        description: playlist.description,
        user: playlist.user,
        spotifyTrackIds: playlist.spotifyTrackIds,
        createdAt: playlist.createdAt,
        updatedAt: playlist.updatedAt,
        sharedToken: {
          token: playlist.sharedToken?.token ?? null,
          createdAt: playlist.sharedToken?.createdAt ?? null,
        },
      })
    );
  }
);

export const getPlaylists = asyncWrapper(
  async (req: Request, res: Response) => {
    const shopifyAPI = SpotifyApiService.getInstance();

    const userId = res.locals.user?.userId;

    const playlists = await PlaylistModel.find({ user: userId })
      .sort({
        createdAt: -1,
      })
      .lean();

    res.status(200).json(
      createResponse<GetPlaylistListResponse>({
        playlists: playlists.map((playlist) => ({
          _id: playlist._id,
          name: playlist.name,
          description: playlist.description,
          user: playlist.user,
          spotifyTrackIds: playlist.spotifyTrackIds,
          createdAt: playlist.createdAt,
          updatedAt: playlist.updatedAt,
          sharedToken: {
            token: playlist.sharedToken?.token ?? null,
            createdAt: playlist.sharedToken?.createdAt ?? null,
          },
        })),
      })
    );
  }
);

export const updatePlaylist = asyncWrapper(
  async (req: Request, res: Response) => {
    const playlistId = req.params.id;

    const userId = res.locals.user?.userId;

    const parseResult = updatePlaylistValidationSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw httpErrors.badRequest(z.prettifyError(parseResult.error));
    }

    const playlist = await PlaylistModel.findOneAndUpdate(
      { _id: playlistId, user: userId },
      parseResult.data,
      { new: true }
    );

    if (!playlist) {
      throw httpErrors.notFound("Playlist not found");
    }

    res.status(200).json(
      createResponse<CreatePlaylistResponse>({
        _id: playlist._id,
        name: playlist.name,
        description: playlist.description,
        user: playlist.user,
        spotifyTrackIds: playlist.spotifyTrackIds,
        createdAt: playlist.createdAt,
        updatedAt: playlist.updatedAt,
        sharedToken: {
          token: playlist.sharedToken?.token ?? null,
          createdAt: playlist.sharedToken?.createdAt ?? null,
        },
      })
    );
  }
);

export const deletePlaylist = asyncWrapper(
  async (req: Request, res: Response) => {
    const playlistId = req.params.id;

    const userId = res.locals.user?.userId;

    const playlist = await PlaylistModel.findOneAndDelete({
      _id: playlistId,
      user: userId,
    });

    if (!playlist) {
      throw httpErrors.notFound("Playlist not found");
    }

    res.status(204).json(createResponse<string>("Record deleted"));
  }
);

export const addTrackToPlaylist = asyncWrapper(
  async (req: Request, res: Response) => {
    const playlistId = req.params.id;
    const userId = res.locals.user?.userId;

    const parseResult = addTrackToPlaylistSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw httpErrors.badRequest(z.prettifyError(parseResult.error));
    }

    const { trackId } = parseResult.data;

    const playlist = await PlaylistModel.findOneAndUpdate(
      { _id: playlistId, user: userId },
      { $addToSet: { spotifyTrackIds: trackId } },
      { new: true }
    );

    if (!playlist) {
      throw httpErrors.notFound("Playlist not found");
    }

    res.status(200).json(
      createResponse<CreatePlaylistResponse>({
        _id: playlist._id,
        name: playlist.name,
        description: playlist.description,
        user: playlist.user,
        spotifyTrackIds: playlist.spotifyTrackIds,
        createdAt: playlist.createdAt,
        updatedAt: playlist.updatedAt,
        sharedToken: {
          token: playlist.sharedToken?.token ?? null,
          createdAt: playlist.sharedToken?.createdAt ?? null,
        },
      })
    );
  }
);

export const createShareToken = asyncWrapper(
  async (req: Request, res: Response) => {
    const parseResult = createShareTokenSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw httpErrors.badRequest(z.prettifyError(parseResult.error));
    }

    const { playlistId } = parseResult.data;
    const userId = res.locals.user?.userId;

    const playlist = await PlaylistModel.findOne({
      _id: playlistId,
      user: userId,
    });

    if (!playlist) {
      throw httpErrors.notFound("Playlist not found");
    }

    const token = randomBytes(12).toString("base64url");

    playlist.sharedToken = {
      token,
    };
    await playlist.save();

    res.status(200).json(
      createResponse<CreateShareTokenResponse>({
        token,
      })
    );
  }
);

export const getSharedPlaylist = asyncWrapper(
  async (req: Request, res: Response) => {
    const token = req.params.token;

    if (typeof token !== "string") {
      throw httpErrors.badRequest("Invalid token");
    }

    const playlist = await PlaylistModel.findOne({
      "sharedToken.token": token,
    })
      .populate({ path: "user", select: "name -_id" })
      .lean();

    if (!playlist) {
      throw httpErrors.notFound("Shared playlist not found");
    }

    const shopifyAPI = SpotifyApiService.getInstance();

    let spotifyTracksDetails: { tracks: SpotifyTracks[] } = { tracks: [] };
    if (playlist.spotifyTrackIds.length) {
      spotifyTracksDetails = await shopifyAPI.getTracksByIds({
        ids: playlist.spotifyTrackIds,
      });
    }

    res.status(200).json(
      createResponse<GetSharedPlaylistResponse>({
        _id: playlist._id,
        name: playlist.name,
        description: playlist.description,
        user: playlist.user as unknown as GetSharedPlaylistResponse["user"],
        spotifyTracks: spotifyTracksDetails.tracks.map((track) => ({
          id: track.id,
          name: track.name,
          duration_ms: track.duration_ms,
          album_name: track.album.name,
          artist_names: track.artists.map((art) => art.name),
          album_images: track.album.images,
        })),
        createdAt: playlist.createdAt,
        updatedAt: playlist.updatedAt,
      })
    );
  }
);
