import { defineConfig, fontProviders } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { satteri } from "@astrojs/markdown-satteri";
import satteriKatex from "./remark/satteri-katex.mjs";

import cloudflare from "@astrojs/cloudflare";

const markdownProcessor = satteri({
  features: { math: true },
  mdastPlugins: [satteriKatex],
  hastPlugins: [],
});

export default defineConfig({
  site: "https://thinhcorner.com",
  trailingSlash: "never",
  prefetch: true,
  image: {
    layout: "constrained",
    responsiveStyles: false,
  },
  // Used by the server-side Open Graph image generator and matches the site's sans-serif UI.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: [600],
      styles: ["normal"],
      subsets: ["latin", "latin-ext", "vietnamese"],
      formats: ["woff"],
    },
  ],
  adapter: cloudflare({
    prerenderEnvironment: "node",
  }),
  integrations: [sitemap(), mdx({ processor: markdownProcessor })],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    processor: markdownProcessor,
  },
});
