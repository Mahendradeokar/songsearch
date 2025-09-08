import type { SearchSongsResponse } from "@shared-types";
import { API } from "../api-client";

type SearchSongsParams = {
  query: string;
  limit?: number;
  page?: number;
};

export async function searchSongs(params: SearchSongsParams) {
  console.log("para", params);
  const searchParams = new URLSearchParams();
  searchParams.set("query", params.query);
  searchParams.set("limit", params.limit?.toString() ?? "0");
  searchParams.set("page", params.page?.toString() ?? "0");

  return API.makeRequest<SearchSongsResponse>({
    method: "get",
    url: `song/search?${searchParams.toString()}`,
  });
}
