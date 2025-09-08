import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import {
  getPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "~/lib/request/playlist-requests";
import type { GetPlaylistListResponse, Playlist } from "@shared-types";
import { Loading } from "~/components/loading";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "~/components/ui/card";
import { ShareButton } from "~/components/share-button";
import { PlaylistFormModal } from "~/components/playlist-form-model";

export default function PlaylistPage() {
  const [playlists, setPlaylists] = useState<
    GetPlaylistListResponse["playlists"]
  >([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [editPlaylistId, setEditPlaylistId] = useState<string | null>(null);

  const handleTokenCreated = (playlistId: string, token: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p._id === playlistId
          ? ({
              ...p,
              sharedToken: { token, createdAt: new Date() },
            } as unknown as Playlist)
          : p
      )
    );
  };

  const fetchPlaylists = async () => {
    setLoading(true);
    const { data, error } = await getPlaylists();
    setLoading(false);

    if (error) {
      toast.error(error.detail || "Failed to fetch playlists");
      setPlaylists([]);
      return;
    }

    setPlaylists(data?.playlists ?? []);
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleCreate = async (values: {
    name: string;
    description: string;
  }) => {
    const { error } = await createPlaylist(values);
    if (error) {
      toast.error(error.detail || "Failed to create playlist");
      return;
    }
    toast("Playlist created");
    await fetchPlaylists();
  };

  const handleEdit = async (values: { name: string; description: string }) => {
    if (!editPlaylistId) return;
    const { error } = await updatePlaylist(editPlaylistId, values);
    if (error) {
      toast.error(error.detail || "Failed to update playlist");
      return;
    }
    toast("Playlist updated");
    setEditPlaylistId(null);
    await fetchPlaylists();
  };

  const handleDelete = async (id: string) => {
    const { error } = await deletePlaylist(id);
    if (error) {
      toast.error(error.detail || "Failed to delete playlist");
      return;
    }
    toast("Playlist deleted");
    await fetchPlaylists();
  };

  const editingPlaylist =
    editPlaylistId &&
    playlists.find((playlist) => playlist._id === editPlaylistId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Playlists</h1>
      <div className="w-full max-w-2xl flex flex-col gap-4">
        {!playlists.length ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">No playlists yet</h2>
              <p className="text-muted-foreground mb-4">
                You haven't created any playlists. Start by creating your first
                playlist to organize your favorite tracks.
              </p>
            </div>
            <Button onClick={() => setShowCreate(true)}>Create Playlist</Button>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowCreate(true)}>
                Create Playlist
              </Button>
            </div>
            {playlists.map((playlist) => (
              <Card key={playlist._id.toString()}>
                <CardHeader>
                  <CardTitle>{playlist.name}</CardTitle>
                  <div className="text-sm text-muted-foreground mb-1">
                    {playlist.spotifyTrackIds?.length ?? 0} track
                    {playlist.spotifyTrackIds &&
                    playlist.spotifyTrackIds.length === 1
                      ? ""
                      : "s"}
                  </div>
                  <CardAction>
                    <ShareButton
                      playlist={playlist}
                      onTokenCreated={handleTokenCreated}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2"
                      onClick={() => setEditPlaylistId(playlist._id.toString())}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(playlist._id.toString())}
                    >
                      Delete
                    </Button>
                  </CardAction>
                  <CardDescription>{playlist.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </>
        )}
      </div>
      <PlaylistFormModal
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={handleCreate}
        title="Create Playlist"
      />
      <PlaylistFormModal
        open={!!editPlaylistId}
        onOpenChange={(open) => {
          if (!open) setEditPlaylistId(null);
        }}
        onSubmit={handleEdit}
        defaultValues={
          editingPlaylist
            ? {
                name: editingPlaylist.name,
                description: editingPlaylist.description,
              }
            : undefined
        }
        title="Edit Playlist"
      />
    </div>
  );
}
