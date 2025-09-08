import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { ImageWithFallback } from "~/components/image-fallback";
import { Loading } from "~/components/loading";
import type { GetSharedPlaylistResponse } from "@shared-types";
import { getSharedPlaylist } from "~/lib/request/playlist-requests";
import { toast } from "sonner";
import { Condition } from "~/components/condition";

export default function PlaylistShareView() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState<GetSharedPlaylistResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;

      setLoading(true);
      const { data, error } = await getSharedPlaylist(id);
      setLoading(false);
      if (error) {
        toast.error("Could not fetch the playlist");
        return;
      }
      setPlaylist(data);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex w-full min-h-screen justify-center items-center">
        <Loading />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex w-full min-h-screen justify-center items-center">
        <Card>
          <CardHeader>
            <CardTitle>Playlist Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This shared playlist does not exist or is no longer available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const albumImage = playlist.spotifyTracks[0]?.album_images ?? [];

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <div className="aspect-video -mx-6 -mt-6 rounded-t-xl bg-muted overflow-hidden flex items-center justify-center">
              <ImageWithFallback
                src={albumImage[0]?.url}
                alt={playlist.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <CardTitle className="capitalize text-2xl">
                {playlist.name}
              </CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                Shared by {playlist.user?.name ?? "--"}
              </div>
              <div className="text-sm mt-2">{playlist.description}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Condition>
            <Condition.If condition={playlist.spotifyTracks.length === 0}>
              <div className="text-muted-foreground text-center py-8">
                No tracks in this playlist.
              </div>
            </Condition.If>
            <Condition.Else>
              <ul className="divide-y">
                {playlist.spotifyTracks.map((track) => (
                  <li key={track.id} className="flex items-center gap-4 py-3">
                    <ImageWithFallback
                      src={track.album_images[0].url}
                      alt={track.name}
                      className="w-14 h-14 rounded object-cover bg-muted"
                    />
                    <div>
                      <div className="font-medium">{track.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {track.artist_names.join(", ")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {track.album_name}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Condition.Else>
          </Condition>
        </CardContent>
      </Card>
    </div>
  );
}
