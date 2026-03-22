export const prerender = true;

import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import satori from "satori";
import sharp from "sharp";
import { readFileSync } from "node:fs";

const fontHeading = readFileSync(
  "./node_modules/@fontsource/iosevka-etoile/files/iosevka-etoile-latin-700-normal.woff",
);
const fontBody = readFileSync(
  "./node_modules/@fontsource/iosevka-aile/files/iosevka-aile-latin-400-normal.woff",
);
const bgImage = readFileSync("./src/assets/og-template.png");

const posts = await getCollection("blog");
const postMap = new Map(posts.map((p) => [p.id, p.data]));

export function getStaticPaths() {
  return posts.map((post) => ({ params: { id: post.id } }));
}

export const GET: APIRoute = async ({ params }) => {
  const data = postMap.get(params.id as string);
  if (!data) return new Response("Not found", { status: 404 });

  // Render text layer with transparent background
  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          width: "100%",
          height: "100%",
        },
        children: [
          // Yellow left border
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                left: 0,
                top: 0,
                width: 8,
                height: "100%",
                backgroundColor: "#eab308",
              },
            },
          },
          // Content
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                padding: "64px 80px 64px 96px",
                width: "100%",
                height: "100%",
              },
              children: [
                // Title — vertically centered in remaining space
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      flex: 1,
                      color: "#ffffff",
                      fontSize: 62,
                      fontFamily: "Iosevka Etoile",
                      fontWeight: 700,
                      lineHeight: 1.3,
                    },
                    children: data.title,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Iosevka Etoile",
          data: fontHeading,
          weight: 700,
          style: "normal",
        },
        {
          name: "Iosevka Aile",
          data: fontBody,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );

  // Composite: template background + text overlay
  const png = await sharp(bgImage)
    .resize(1200, 630, { fit: "cover" })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer();

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
