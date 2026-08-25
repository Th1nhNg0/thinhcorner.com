export const prerender = true;

import type { APIRoute } from "astro";
import { experimental_getFontFileURL, fontData } from "astro:assets";
import satori from "satori";
import sharp from "sharp";
import { readFileSync } from "node:fs";

const SCALE = 2;
const WIDTH = 1200 * SCALE;
const HEIGHT = 630 * SCALE;
const px = (value: number) => value * SCALE;
const bgImage = readFileSync("./src/assets/og-background.png");

type Page = {
  slug: string;
  section: string;
  label: string;
  title: string;
  footer: string;
};

const pages: Page[] = [
  {
    slug: "home",
    section: "home",
    label: "en",
    title: "Thinh's Corner",
    footer: "PERSONAL BLOG",
  },
  {
    slug: "writing",
    section: "writing",
    label: "en",
    title: "Writing",
    footer: "NOTES & ESSAYS",
  },
  {
    slug: "projects",
    section: "projects",
    label: "en",
    title: "Projects",
    footer: "THINGS I BUILD",
  },
  {
    slug: "now",
    section: "now",
    label: "en",
    title: "Now & then",
    footer: "A LIFE IN PROGRESS",
  },
  {
    slug: "data",
    section: "data",
    label: "en",
    title: "Data",
    footer: "TRACKED INTERESTS",
  },
  {
    slug: "books",
    section: "data",
    label: "books",
    title: "Books",
    footer: "GOODREADS",
  },
  {
    slug: "music",
    section: "data",
    label: "music",
    title: "Music",
    footer: "SPOTIFY",
  },
  {
    slug: "chess",
    section: "data",
    label: "chess",
    title: "Chess",
    footer: "CHESS.COM",
  },
  {
    slug: "steam",
    section: "data",
    label: "steam",
    title: "Steam",
    footer: "STEAM",
  },
  {
    slug: "404",
    section: "error",
    label: "404",
    title: "Nothing here.",
    footer: "END OF LINE",
  },
];

const pageMap = new Map(pages.map((page) => [page.slug, page]));

export function getStaticPaths() {
  return pages.map((page) => ({ params: { slug: page.slug } }));
}

const fallbackSubsets = ["latin", "latin-ext", "vietnamese"];

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 600;
  style: "normal";
};

async function loadInter600(url: URL): Promise<OgFont[]> {
  const variants = fontData["--font-inter"]?.filter(
    (font) => String(font.weight) === "600" && font.style === "normal",
  );

  if (!variants?.length) {
    throw new Error("Cannot find Inter 600 fonts.");
  }

  return Promise.all(
    variants.map(async (variant, index) => {
      const source = variant.src.find((src) => src.format === "woff");
      if (!source) {
        throw new Error("Cannot find a WOFF source for Inter 600.");
      }

      const response = await fetch(
        experimental_getFontFileURL(source.url, url),
      );
      if (!response.ok) {
        throw new Error(
          `Unable to load Inter 600 (${response.status} ${response.statusText}).`,
        );
      }

      const subset = (
        (variant as { meta?: { subset?: string } }).meta?.subset ??
        fallbackSubsets[index] ??
        `subset-${index}`
      ).replace(/[^a-z0-9-]/gi, "-");

      return {
        name: `Inter-${subset}`,
        data: await response.arrayBuffer(),
        weight: 600 as const,
        style: "normal" as const,
      };
    }),
  );
}

function getTitleFontSize(title: string) {
  if (title.length > 34) return 62;
  return 68;
}

export const GET: APIRoute = async ({ params, url }) => {
  const page = pageMap.get(params.slug ?? "");
  if (!page) return new Response("Not found", { status: 404 });

  const fonts = await loadInter600(url);
  const fontFamily = fonts.map((font) => font.name).join(", ");
  const titleFontSize = getTitleFontSize(page.title) * SCALE;

  const backgroundOverlay = Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wash" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#02030a" stop-opacity="0.52" />
          <stop offset="0.48" stop-color="#02030a" stop-opacity="0.28" />
          <stop offset="1" stop-color="#02030a" stop-opacity="0.1" />
        </linearGradient>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#wash)" />
    </svg>
  `);

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          color: "#ededed",
          fontFamily,
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: px(72),
                left: px(112),
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: px(1016),
                height: px(28),
                color: "#8f8f98",
                fontSize: px(15),
                fontWeight: 600,
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: { display: "flex", alignItems: "center" },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: { color: "#eab308" },
                          children: page.section,
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: { marginLeft: px(10), color: "#52525b" },
                          children: "/",
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: { marginLeft: px(10) },
                          children: page.label,
                        },
                      },
                    ],
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      color: "#8f8f98",
                      fontSize: px(13),
                      letterSpacing: px(1.2),
                    },
                    children: "THINH'S CORNER",
                  },
                },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: px(156),
                left: px(112),
                display: "flex",
                alignItems: "center",
                width: px(900),
                height: px(342),
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      width: "100%",
                      minWidth: 0,
                      color: "#ededed",
                      fontSize: titleFontSize,
                      fontFamily,
                      fontWeight: 600,
                      lineHeight: 1.08,
                      letterSpacing: px(-1.4),
                    },
                    children: page.title,
                  },
                },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                left: px(112),
                bottom: px(48),
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: px(1016),
                height: px(28),
                color: "#8f8f98",
                fontSize: px(13),
                fontWeight: 600,
                letterSpacing: px(1.1),
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: { display: "flex", alignItems: "center" },
                    children: [
                      { type: "div", props: { children: page.footer } },
                      {
                        type: "div",
                        props: {
                          style: { marginLeft: px(10), color: "#52525b" },
                          children: "/",
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: { marginLeft: px(10), color: "#eab308" },
                          children: page.label,
                        },
                      },
                    ],
                  },
                },
                {
                  type: "div",
                  props: {
                    style: { color: "#8f8f98" },
                    children: "thinhcorner.com",
                  },
                },
              ],
            },
          },
        ],
      },
    } as any,
    { width: WIDTH, height: HEIGHT, fonts },
  );

  const jpeg = await sharp(bgImage)
    .resize(WIDTH, HEIGHT, { fit: "cover" })
    .composite([
      { input: backgroundOverlay, top: 0, left: 0 },
      { input: Buffer.from(svg), top: 0, left: 0 },
    ])
    .jpeg({ quality: 100, chromaSubsampling: "4:4:4", progressive: true })
    .toBuffer();

  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": "image/jpeg" },
  });
};
