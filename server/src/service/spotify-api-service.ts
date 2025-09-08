const spotifyAuthUrl = "https://accounts.spotify.com/api/token";
const spotifyApiBaseUrl = "https://api.spotify.com/v1";

type MarketType = Uppercase<string>;
type SpotifyConfig = {
  clientId: string;
  clientSecret: string;
  market: MarketType;
};

type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type SpotifyErrorResponse = {
  error: {
    status: number;
    message: string;
  };
};

export interface SpotifyTracks {
  id: string;
  name: string;
  duration_ms: number;
  album: {
    name: string;
    images: {
      url: string;
      height: number;
      width: number;
    }[];
  };
  artists: {
    name: string;
  }[];
}

export class SpotifyApiService {
  static instance: SpotifyApiService | null = null;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string = "";
  private tokenExpiresAt: number = 0;
  private market: MarketType = "IN";

  constructor(config: SpotifyConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.market = config.market ?? "IN";
    console.log("COnfig", config);
  }

  static getInstance() {
    if (!SpotifyApiService.instance) {
      console.log("INSIDE spotify api service", process.env);
      SpotifyApiService.instance = new SpotifyApiService({
        clientId: process.env.SPOTIFY_CLIENT_ID!,
        market: "IN",
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      });
      console.log("INSIDE spotify api service", SpotifyApiService);
    }
    return SpotifyApiService.instance;
  }

  private async fetchAccessToken(): Promise<string> {
    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString("base64");

    const res = await fetch(spotifyAuthUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
    });

    if (!res.ok) {
      const errorData = (await res.json()) as SpotifyErrorResponse;
      throw new Error(
        `Spotify Access Token Error: ${errorData?.error?.status} ${errorData?.error?.message}`
      );
    }

    const data = (await res.json()) as TokenResponse;

    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000;
    return this.accessToken;
  }

  private async getValidAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 100) {
      // litter buffer time
      return this.accessToken;
    }
    return this.fetchAccessToken();
  }

  private async fetchWithAuth<T>(
    url: string,
    options: Parameters<typeof fetch>[1] = {}
  ): Promise<T> {
    const token = await this.getValidAccessToken();

    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      await this.fetchAccessToken();
      return this.fetchWithAuth(url, options);
    }

    if (!res.ok) {
      const errorData = (await res.json()) as SpotifyErrorResponse;
      console.log("ERROR DATA", errorData);
      throw new Error(
        `Spotify API error: ${errorData?.error?.status} ${errorData?.error?.message}`
      );
    }

    return res.json() as T;
  }

  async searchTracks({
    query,
    limit = 10,
    offset = 0,
    market,
  }: {
    query: string;
    limit: number;
    offset: number;
    market?: string;
  }): Promise<{
    tracks: {
      total: number;
      limit: number;
      offset: number;
      items: SpotifyTracks[];
    };
  }> {
    const params = new URLSearchParams({
      type: "track",
      q: query,
      limit: limit.toString(),
      offset: offset.toString(),
      market: market ?? this.market,
    });

    const url = `${spotifyApiBaseUrl}/search?${params.toString()}`;

    return this.fetchWithAuth(url);
  }

  async getTracksByIds({
    ids = [],
    market,
  }: {
    ids: string[];
    market?: string;
  }): Promise<{
    tracks: SpotifyTracks[];
  }> {
    const params = new URLSearchParams({
      ids: ids.join(","),
      market: market ?? this.market,
    });
    const url = `${spotifyApiBaseUrl}/tracks?${params.toString()}`;
    return this.fetchWithAuth(url);
  }
}
