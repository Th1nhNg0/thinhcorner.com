// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import { remarkReadingTime } from "./remark/remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  site: "http://localhost:3000",
  integrations: [],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
});
