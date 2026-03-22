export const prerender = true;

import { OGImageRoute } from "astro-og-canvas";
import { getCollection } from "astro:content";

const posts = await getCollection("blog");
const pages = Object.fromEntries(posts.map((post) => [post.id, post.data]));

const route = await OGImageRoute({
  param: "id",
  pages,
  getImageOptions: (_id, data) => ({
    title: data.title,
    bgImage: { path: "./src/assets/og-template.png" },
    fonts: ["./src/assets/Inter_18pt-Bold.ttf"],
    font: {
      title: {
        color: [255, 255, 255],
        size: 56,
        weight: "ExtraBold",
        families: ["Inter"],
        lineHeight: 1.3,
      },
    },
    padding: 80,
  }),
  getSlug: (id) => id,
});

export const getStaticPaths = route.getStaticPaths;
export const GET = route.GET;
