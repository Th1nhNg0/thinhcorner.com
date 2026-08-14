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
  // Used only by the server-side Open Graph image generator.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Quicksand",
      cssVariable: "--font-quicksand",
      weights: [700],
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
