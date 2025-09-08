import type { Song } from "./songs-response";

export type Playlist = {
  _id: string | object;
  name: string;
  description: string;
  user: string | object;
  spotifyTrackIds: string[];
  createdAt: Date;
  updatedAt: Date;
  sharedToken: {
    token: string | null;
    createdAt: Date | null;
  } | null;
};

export type CreatePlaylistResponse = Playlist;

export type GetPlaylistListResponse = {
  playlists: Playlist[];
};

export type GetSharedPlaylistResponse = Omit<
  Playlist,
  "spotifyTrackIds" | "sharedToken"
> & {
  spotifyTracks: Song[];
  user: {
    name: string;
  };
};

export type CreateShareTokenResponse = { token: string };
