import { defineConfig, fontProviders } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { satteri } from "@astrojs/markdown-satteri";
import satteriKatex from "./remark/satteri-katex.mjs";
import satteriImageAlt from "./remark/satteri-image-alt.mjs";
import satteriImageSizes from "./remark/satteri-image-sizes.mjs";
import { getPostLastmods } from "./src/lib/post-lastmods.ts";

import cloudflare from "@astrojs/cloudflare";

const { lastmods, drafts } = getPostLastmods();
const sitemapPath = (url) => new URL(url).pathname.replace(/\/$/, "") || "/";

const markdownProcessor = satteri({
  features: { math: true },
  mdastPlugins: [satteriKatex, satteriImageAlt],
  hastPlugins: [satteriImageSizes],
});

export default defineConfig({
  site: "https://thinhcorner.com",
  trailingSlash: "never",
  prefetch: true,
  image: {
    layout: "constrained",
    responsiveStyles: false,
  },
  // Iosevka is the site-wide font. The files in src/assets/fonts are subsets of
  // @fontsource/iosevka (Latin, Latin-1, Vietnamese and common punctuation), so each
  // weight is ~60 KB instead of ~1 MB. The 600 weight also ships a WOFF copy because
  // the Open Graph image generator (Satori) cannot parse WOFF2.
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Iosevka",
      cssVariable: "--font-iosevka",
      display: "swap",
      fallbacks: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      options: {
        variants: [
          { weight: 400, style: "normal", src: ["./src/assets/fonts/iosevka-400.woff2"] },
          { weight: 400, style: "italic", src: ["./src/assets/fonts/iosevka-400-italic.woff2"] },
          { weight: 500, style: "normal", src: ["./src/assets/fonts/iosevka-500.woff2"] },
          {
            weight: 600,
            style: "normal",
            src: ["./src/assets/fonts/iosevka-600.woff2", "./src/assets/fonts/iosevka-600.woff"],
          },
          { weight: 700, style: "normal", src: ["./src/assets/fonts/iosevka-700.woff2"] },
        ],
      },
    },
  ],
  adapter: cloudflare({
    prerenderEnvironment: "node",
    // Pre-optimize images with sharp at build time. The default "cloudflare-binding"
    // mode optimizes only at request time, so prerendered pages ship passthrough
    // (unprocessed) copies of every image.
    imageService: "compile",
  }),
  integrations: [
    sitemap({
      filter: (page) => !drafts.has(sitemapPath(page)),
      serialize(item) {
        const lastmod = lastmods.get(sitemapPath(item.url));
        if (lastmod) item.lastmod = lastmod.toISOString();
        return item;
      },
    }),
    mdx({ processor: markdownProcessor }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    processor: markdownProcessor,
  },
});
