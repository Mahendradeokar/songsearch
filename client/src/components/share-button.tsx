import type { GetPlaylistListResponse } from "@shared-types";
import { useState } from "react";
import { toast } from "sonner";
import { useCopyToClipboard } from "~/hook/use-copy-clipboard";
import { createShareToken } from "~/lib/request/playlist-requests";
import { Button } from "./ui/button";
import { Check, Copy } from "lucide-react";

export function ShareButton({
  playlist,
  onTokenCreated,
}: {
  playlist: GetPlaylistListResponse["playlists"][number];
  onTokenCreated: (playlistId: string, token: string) => void;
}) {
  const { copyState, copyToClipboard } = useCopyToClipboard();
  const [loading, setLoading] = useState(false);

  const createSharedLinked = (token: string) => {
    return `${window.location.origin}/shared/playlist/${token}`;
  };

  const handleCopy = async () => {
    if (playlist?.sharedToken?.token) {
      const url = createSharedLinked(playlist.sharedToken.token);
      await copyToClipboard(url);
    } else {
      setLoading(true);
      const { data, error } = await createShareToken({
        playlistId: playlist._id.toString(),
      });
      setLoading(false);
      if (error || !data?.token) {
        toast.error(error?.detail || "Failed to create share token");
        return;
      }
      onTokenCreated(playlist._id.toString(), data.token);
      const url = createSharedLinked(data.token);
      await copyToClipboard(url);
    }
  };

  const hasToken = !!playlist.sharedToken?.token;

  return (
    <Button
      size="sm"
      variant="outline"
      className="mr-2"
      onClick={handleCopy}
      disabled={loading || copyState === "copying"}
    >
      {hasToken ? (
        <>
          {copyState === "copied" ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              Copy Link
            </>
          )}
        </>
      ) : (
        <>
          {copyState === "copied" ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              Create & Copy Link
            </>
          )}
        </>
      )}
    </Button>
  );
}
