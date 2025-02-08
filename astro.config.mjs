// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { remarkModifiedTime } from "./remark/remark-modified-time.mjs";
import { remarkReadingTime } from "./remark/remark-reading-time.mjs";
import remarkGfm from "remark-gfm";

// https://astro.build/config
export default defineConfig({
  site: "http://localhost:3000",
  integrations: [],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [
      remarkReadingTime,
      remarkModifiedTime,
      remarkMath,
      remarkGfm,
    ],
    rehypePlugins: [rehypeKatex],
  },
});
