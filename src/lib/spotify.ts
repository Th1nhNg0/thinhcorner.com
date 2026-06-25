import { withCache } from "@/lib/cache";

const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const TOP_TRACKS_ENDPOINT = `https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=25`;
const TOP_ARTISTS_ENDPOINT = `https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=24`;
const RECENTLY_PLAYED_ENDPOINT = `https://api.spotify.com/v1/me/player/recently-played?limit=5`;
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

const getAccessToken = async (env: Env): Promise<AccessTokenResponse> => {
  const basic = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);
  const body = new URLSearchParams();
  body.append("grant_type", "refresh_token");
  body.append("refresh_token", env.SPOTIFY_REFRESH_TOKEN);
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body,
  });
  const result = await response.json() as AccessTokenResponse;
  return result;
};

type NowPlayingTrue = {
  album: string;
  albumImageUrl: string;
  artist: string;
  isPlaying: true;
  songUrl: string;
  title: string;
};

type NowPlayingFalse = {
  isPlaying: false;
};

export type NowPlaying = NowPlayingTrue | NowPlayingFalse;

interface SpotifyCurrentlyPlaying {
  is_playing: boolean;
  item: {
    name: string;
    artists: { name: string }[];
    album: {
      name: string;
      images: { url: string }[];
    };
    external_urls: {
      spotify: string;
    };
  } | null;
}

const getNowPlaying = async (env: Env): Promise<NowPlaying> => {
  const { access_token } = await getAccessToken(env);

  const res = await fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  if (res.status === 204 || res.status > 400) {
    return {
      isPlaying: false,
    };
  }
  const song = await res.json() as SpotifyCurrentlyPlaying;
  if (song.item === null) {
    return {
      isPlaying: false,
    };
  }

  const isPlaying = song.is_playing;
  const title = song.item.name;
  const artist = song.item.artists
    .map((_artist) => _artist.name)
    .join(", ");
  const album = song.item.album.name;
  const albumImageUrl = song.item.album.images[0].url;
  const songUrl = song.item.external_urls.spotify;
  return {
    album,
    albumImageUrl,
    artist,
    isPlaying,
    songUrl,
    title,
  } as NowPlaying;
};

interface SpotifyArtist {
  id: string;
  name: string;
  external_urls: {
    spotify: string;
  };
  followers: {
    total: number;
  };
  images: {
    url: string;
  }[];
  popularity: number;
}

interface SpotifyTrack {
  id: string;
  artists: SpotifyArtist[];
  external_urls: {
    spotify: string;
  };
  name: string;
  album: {
    images: { url: string }[];
  };
}

export interface TopTrack {
  id: string;
  artist: string;
  songUrl: string;
  title: string;
  imageUrl: string;
}

interface SpotifyTopTracksResponse {
  items: SpotifyTrack[];
}

const getTopTracks = async (env: Env, kv: KVNamespace): Promise<TopTrack[]> => {
  return withCache(kv, "spotify_top_tracks", 3600, async () => {
    const { access_token } = await getAccessToken(env);
    const { items } = await fetch(TOP_TRACKS_ENDPOINT, {
      headers: { Authorization: `Bearer ${access_token}` },
    }).then((res) => res.json() as Promise<SpotifyTopTracksResponse>);
    const tracks: TopTrack[] =
      items?.map((track) => ({
        id: track.id,
        artist: track.artists.map((artist) => artist.name).join(", "),
        songUrl: track.external_urls.spotify,
        title: track.name,
        imageUrl: track.album.images[1].url,
      })) || [];
    return tracks;
  });
};

export interface RecentlyPlayedTrack {
  id: string;
  artist: string;
  songUrl: string;
  title: string;
  imageUrl: string;
  played_at: string;
}

interface SpotifyRecentlyPlayedItem {
  track: SpotifyTrack;
  played_at: string;
}

interface SpotifyRecentlyPlayedResponse {
  items: SpotifyRecentlyPlayedItem[];
}

const getRecentlyPlayed = async (env: Env, kv: KVNamespace): Promise<RecentlyPlayedTrack[]> => {
  return withCache(kv, "spotify_recently_played", 1800, async () => {
    const { access_token } = await getAccessToken(env);
    const response = await fetch(RECENTLY_PLAYED_ENDPOINT, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const { items } = await response.json() as SpotifyRecentlyPlayedResponse;
    const tracks: RecentlyPlayedTrack[] =
      items?.map((item) => ({
        id: item.track.id,
        artist: item.track.artists.map((artist) => artist.name).join(", "),
        songUrl: item.track.external_urls.spotify,
        title: item.track.name,
        imageUrl: item.track.album.images[1].url,
        played_at: item.played_at,
      })) || [];
    return tracks;
  });
};

export interface TopArtist {
  id: string;
  name: string;
  url: string;
  imageUrl: string;
  followers: number;
  popularity: number;
}

interface SpotifyTopArtistsResponse {
  items: TopArtist[];
}

const getTopArtists = async (env: Env, kv: KVNamespace): Promise<TopArtist[]> => {
  return withCache(kv, "spotify_top_artists", 3600, async () => {
    const { access_token } = await getAccessToken(env);
    const { items } = await fetch(TOP_ARTISTS_ENDPOINT, {
      headers: { Authorization: `Bearer ${access_token}` },
    }).then((res) => res.json() as Promise<SpotifyTopArtistsResponse>);
    const artists: TopArtist[] =
      items?.map((artist) => ({
        id: artist.id,
        name: artist.name,
        url: artist.external_urls.spotify,
        imageUrl: artist.images[0].url,
        followers: artist.followers.total,
        popularity: artist.popularity,
      })) || [];
    return artists;
  });
};

export { getNowPlaying, getTopTracks, getRecentlyPlayed, getTopArtists };
