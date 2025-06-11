const client_id = import.meta.env.SPOTIFY_CLIENT_ID;
const client_secret = import.meta.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = import.meta.env.SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const TOP_TRACKS_ENDPOINT = `https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=25`;
const TOP_ARTISTS_ENDPOINT = `https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=24`;
const RECENTLY_PLAYED_ENDPOINT = `https://api.spotify.com/v1/me/player/recently-played?limit=5`;
const SAVED_TRACKS_ENDPOINT = `https://api.spotify.com/v1/me/tracks?limit=50`;
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

const getAccessToken = async () => {
  const body = new URLSearchParams();
  body.append("grant_type", "refresh_token");
  body.append("refresh_token", refresh_token);
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body,
  });
  const result = await response.json();
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

const getNowPlaying = async () => {
  const { access_token } = await getAccessToken();

  const res = await fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  if (res.status === 204 || res.status > 400) {
    return {
      isPlaying: false,
    } as NowPlaying;
  }
  const song = await res.json();
  if (song.item === null) {
    return {
      isPlaying: false,
    } as NowPlaying;
  }

  const isPlaying = song.is_playing;
  const title = song.item.name;
  const artist = song.item.artists
    .map((_artist: any) => _artist.name)
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

export interface TopTrack {
  id: string;
  artist: {
    href: string;
    id: string;
    name: string;
    external_urls: {
      spotify: string;
    };
    followers: {
      href: string | null;
      total: number;
    };
    genres: string[];
    images: {
      url: string;
      height: number | null;
      width: number | null;
    }[];
    popularity: number;
    type: string;
    uri: string;
  }[];
  songUrl: string;
  title: string;
  imageUrl: string;
  previewUrl: string;
}

const getTopTracks = async () => {
  const { access_token } = await getAccessToken();

  const { items } = await fetch(TOP_TRACKS_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  }).then((res) => res.json());
  const tracks: TopTrack[] =
    items?.map((track: any) => ({
      id: track.id,
      artist: track.artists,
      songUrl: track.external_urls.spotify,
      title: track.name,
      imageUrl: track.album.images[1].url,
      // previewUrl: track.preview_url,
    })) || [];
  return tracks;
};

export interface RecentlyPlayedTrack {
  id: string;
  artist: {
    href: string;
    id: string;
    name: string;
    external_urls: {
      spotify: string;
    };
    followers: {
      href: string | null;
      total: number;
    };
    genres: string[];
    images: {
      url: string;
      height: number | null;
      width: number | null;
    }[];
    popularity: number;
    type: string;
    uri: string;
  }[];
  songUrl: string;
  title: string;
  imageUrl: string;
  played_at: string;
}

const getRecentlyPlayed = async () => {
  const { access_token } = await getAccessToken();
  const response = await fetch(`${RECENTLY_PLAYED_ENDPOINT}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  const { items } = await response.json();
  const tracks: RecentlyPlayedTrack[] =
    items?.map((track: any) => ({
      id: track.track.id,
      artist: track.track.artists,
      songUrl: track.track.external_urls.spotify,
      title: track.track.name,
      imageUrl: track.track.album.images[1].url,
      played_at: track.played_at,
    })) || [];

  return tracks;
};

interface SavedTracksResponse {
  total: number;
}

const getTotalSavedTracks = async () => {
  const { access_token } = await getAccessToken();
  const response = await fetch(SAVED_TRACKS_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  const data: SavedTracksResponse = await response.json();
  return data.total;
};

export interface TopArtist {
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string | null;
    total: number;
  };
  genres: string[];
  href: string;
  id: string;
  images: {
    url: string;
    height: number | null;
    width: number | null;
  }[];
  name: string;
  popularity: number;
  type: "artist";
  uri: string;
}

const getTopArtists = async () => {
  const { access_token } = await getAccessToken();

  const { items } = await fetch(TOP_ARTISTS_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  }).then((res) => res.json());

  const artists: TopArtist[] =
    items?.map((artist: any) => ({
      external_urls: artist.external_urls,
      followers: artist.followers,
      genres: artist.genres,
      href: artist.href,
      id: artist.id,
      images: artist.images,
      name: artist.name,
      popularity: artist.popularity,
      type: artist.type,
      uri: artist.uri,
    })) || [];
  return artists;
};

export {
  getNowPlaying,
  getTopTracks,
  getRecentlyPlayed,
  getTotalSavedTracks,
  getTopArtists,
};
