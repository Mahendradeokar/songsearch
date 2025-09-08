import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Condition } from "~/components/condition";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Label } from "~/components/ui/label";
import { ImageWithFallback } from "~/components/image-fallback";
import type { GetPlaylistListResponse, Song } from "@shared-types";
import { searchSongs } from "~/lib/request/songs-requests";
import { Loading } from "~/components/loading";
import { cn, debounce } from "~/lib/utils";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "~/components/ui/pagination";
import {
  addTrackToPlaylist,
  getPlaylists,
} from "~/lib/request/playlist-requests";
import { Link } from "react-router";

const songSearchSchema = z.object({
  query: z.string().trim().min(1, { message: "Please enter a search term" }),
});

const AddToPlaylistDropdown = ({
  userPlaylist,
  onSelect,
  song,
}: {
  userPlaylist: GetPlaylistListResponse["playlists"];
  onSelect: (id: string) => void;
  song: Song;
}) => {
  if (!userPlaylist.length) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link to="/playlist">
          <Label asChild>
            <span>Create playlist</span>
          </Label>
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Label asChild>
            <span>Add to playlist</span>
          </Label>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Select Playlist</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userPlaylist.map((playlist) => (
          <DropdownMenuItem
            key={playlist._id.toString()}
            onSelect={() => onSelect(playlist._id.toString())}
            className="capitalize"
            disabled={playlist.spotifyTrackIds.some((trackId) => {
              return trackId === song.id;
            })}
          >
            {playlist.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const defaultTracksState = {
  tracks: [],
  total: 0,
  page: 1,
  limit: 10,
};

type PaginationControlsProps = {
  page: number;
  total: number;
  onPageChange: (page: number) => void;
};

const PaginationControls = ({
  page,
  total,
  onPageChange,
}: PaginationControlsProps) => {
  return (
    <div className="flex max-w-lg justify-center mt-6">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className={cn(page === 1 && "cursor-not-allowed")}
              onClick={(e) => {
                e.preventDefault();
                if (page === 1) return;
                onPageChange(Math.max(1, page - 1));
              }}
              href="#"
            />
          </PaginationItem>

          {page - 1 !== 0 && (
            // first
            <PaginationItem>
              <PaginationLink
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(Math.min(total, page - 1));
                }}
                href="#"
              >
                {page - 1}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            {/* middle */}
            <PaginationLink
              isActive
              onClick={(e) => {
                e.preventDefault();
                return;
              }}
              href="#"
            >
              {page}
            </PaginationLink>
          </PaginationItem>

          {page < total && (
            // Last
            <PaginationItem>
              <PaginationLink
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(Math.min(total, page + 1));
                }}
                href="#"
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              className={cn(page === total && "cursor-not-allowed")}
              onClick={(e) => {
                e.preventDefault();
                if (page === total) return;
                onPageChange(Math.min(total, page + 1));
              }}
              href="#"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default function SongSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [userPlaylist, setUserPlaylist] = useState<
    GetPlaylistListResponse["playlists"]
  >([]);

  const [results, setResults] = useState<{
    tracks: Song[];
    total: number;
    page: number;
    limit: number;
  }>(defaultTracksState);

  const fetchSongs = async (searchValue: string, pageValue: number) => {
    const validation = songSearchSchema.safeParse({ query: searchValue });
    if (!validation.success) {
      setResults(defaultTracksState);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await searchSongs({
      query: searchValue,
      page: pageValue,
      limit: defaultTracksState.limit,
    });

    setLoading(false);

    if (error) {
      toast.error(error.detail);
      setResults(defaultTracksState);
      return;
    }

    setResults({
      ...data,
      page: pageValue,
      limit: defaultTracksState.limit,
    });
  };

  const handleAddToPlaylist = async ({
    playListId,
    trackId,
  }: {
    playListId: string;
    trackId: string;
  }) => {
    const { error } = await addTrackToPlaylist(playListId, {
      trackId: trackId,
    });

    if (error) {
      toast.error("Failed to add song to playlist. Please try again.");
      return;
    }

    setUserPlaylist((prev) =>
      prev.map((playlist) =>
        playlist._id.toString() === playListId
          ? {
              ...playlist,
              spotifyTrackIds: [...playlist.spotifyTrackIds, trackId],
            }
          : playlist
      )
    );

    toast("Added to playlist");
  };

  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchValue: string, pageValue: number) => {
        await fetchSongs(searchValue, pageValue);
      }, 600),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setResults(defaultTracksState);
    debouncedSearch(value, 1);
  };

  const handlePageChange = (newPage: number) => {
    setResults((prev) => ({ ...prev, page: newPage }));
    fetchSongs(query, newPage);
  };

  useEffect(() => {
    (async () => {
      const { data, error } = await getPlaylists();
      if (error) {
        toast.error("Failed to fetch playlist");
        return;
      }

      setUserPlaylist(data.playlists ?? []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center px-4 py-8">
      <header className="w-full max-w-2xl mb-8">
        <div className="flex justify-center">
          <Input
            type="text"
            placeholder="Search for songs, artists, or albums..."
            className="w-full text-lg px-6 py-4 rounded-full"
            value={query}
            onChange={handleInputChange}
            autoFocus
          />
        </div>
      </header>
      <section className="w-full max-w-5xl">
        <div className="flex gap-2 justify-center flex-wrap">
          <Condition>
            <Condition.If condition={loading}>
              <Loading className="flex w-full justify-center" />
            </Condition.If>
            <Condition.ElseIf condition={results.tracks.length > 0}>
              <>
                {results.tracks.map((song) => (
                  <Card key={song.id} className="flex-1 basis-[100%]">
                    <div className="flex gap-6 p-3">
                      <div className="w-[320px] -m-3 -my-9 aspect-video flex items-center justify-center rounded-l-lg overflow-hidden bg-gray-200">
                        <ImageWithFallback
                          src={song.album_images[0]?.url ?? ""}
                          alt={song.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <CardHeader className="px-0 pb-2">
                          <CardTitle className="truncate" title={song.name}>
                            {song.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-0 pt-0">
                          <div className="text-muted-foreground mb-1 truncate">
                            Artist: {song.artist_names.join(", ")}
                          </div>
                          <div className="text-muted-foreground truncate">
                            Album: {song.album_name}
                          </div>
                        </CardContent>
                      </div>
                      <div className="flex items-center justify-center ml-auto">
                        <AddToPlaylistDropdown
                          userPlaylist={userPlaylist}
                          song={song}
                          onSelect={(playListId: string) => {
                            handleAddToPlaylist({
                              playListId: playListId,
                              trackId: song.id,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                {results.total > 1 && (
                  <PaginationControls
                    page={results.page}
                    total={results.total}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            </Condition.ElseIf>
            <Condition.ElseIf
              condition={results.tracks.length === 0 && Boolean(query.length)}
            >
              <div className="text-center text-muted-foreground mt-12">
                No songs found. Try searching for something!
              </div>
            </Condition.ElseIf>
            <Condition.Else>
              <div className="text-center text-muted-foreground mt-12">
                Start your search to discover songs!
              </div>
            </Condition.Else>
          </Condition>
        </div>
      </section>
    </div>
  );
}
