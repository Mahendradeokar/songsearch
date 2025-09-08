import type {
  CreatePlaylistResponse,
  GetPlaylistListResponse,
  CreateShareTokenResponse,
  GetSharedPlaylistResponse,
} from "@shared-types";
import { API } from "../api-client";

export async function createPlaylist(payload: {
  name: string;
  description: string;
}) {
  return API.makeRequest<CreatePlaylistResponse>({
    method: "post",
    url: "playlist",
    payload,
  });
}

export async function getPlaylists() {
  return API.makeRequest<GetPlaylistListResponse>({
    method: "get",
    url: "playlist",
  });
}

export async function updatePlaylist(
  id: string,
  payload: { name: string; description: string }
) {
  return API.makeRequest<CreatePlaylistResponse>({
    method: "put",
    url: `playlist/${id}`,
    payload,
  });
}

export async function deletePlaylist(id: string) {
  return API.makeRequest<string>({
    method: "delete",
    url: `playlist/${id}`,
  });
}

export async function addTrackToPlaylist(
  id: string,
  payload: { trackId: string }
) {
  return API.makeRequest<CreatePlaylistResponse>({
    method: "put",
    url: `playlist/${id}/spotify-track`,
    payload,
  });
}

export async function createShareToken(payload: { playlistId: string }) {
  return API.makeRequest<CreateShareTokenResponse>({
    method: "post",
    url: "playlist/share-token",
    payload,
  });
}

export async function getSharedPlaylist(token: string) {
  return API.makeRequest<GetSharedPlaylistResponse>({
    method: "get",
    url: `playlist/shared/${token}`,
  });
}
