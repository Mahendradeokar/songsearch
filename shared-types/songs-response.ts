export type Song = {
  name: string;
  duration_ms: number;
  album_name: string;
  album_images: {
    url: string;
    height: number;
    width: number;
  }[];
  artist_names: string[];
  id: string;
};

export type SearchSongsResponse = {
  tracks: Song[];
  total: number;
};
