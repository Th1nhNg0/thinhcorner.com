interface ImportMetaEnv {
  readonly SPOTIFY_REFRESH_TOKEN: string;
  readonly SPOTIFY_CLIENT_SECRET: string;
  readonly SPOTIFY_CLIENT_ID: string;
  readonly PUBLIC_GOOGLE_ANALYTICS_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
