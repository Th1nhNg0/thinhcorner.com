// Vite build-time env vars (public, substituted at build)
interface ImportMetaEnv {
  readonly PUBLIC_GOOGLE_ANALYTICS_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Cloudflare Workers runtime env (secrets + bindings)
declare namespace Cloudflare {
  interface Env {
    SPOTIFY_CLIENT_ID: string;
    SPOTIFY_CLIENT_SECRET: string;
    SPOTIFY_REFRESH_TOKEN: string;
  }
}
