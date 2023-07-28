const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN as string;

const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const TOP_TRACKS_ENDPOINT = `https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50`;
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

  return response.json();
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

export { getNowPlaying, getTopTracks };
