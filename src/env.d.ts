// Vite build-time env vars (public, substituted at build)
interface ImportMetaEnv {
  readonly PUBLIC_GOOGLE_ANALYTICS_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Augment the global Env interface (declared in worker-configuration.d.ts)
// with secrets set via `wrangler secret put`
interface Env {
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
  SPOTIFY_REFRESH_TOKEN: string;
}
