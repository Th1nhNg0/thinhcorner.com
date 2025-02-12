export const prerender = true;

import { ImageResponse } from "@vercel/og";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { readFileSync } from "fs";

interface Props {
  data: { title: string; date: Date };
}

export const GET: APIRoute<Props> = async ({ props }) => {
  const interBold = readFileSync("./src/assets/Inter_18pt-Bold.ttf");
  const ogTemplate = readFileSync("./src/assets/og-template.png");
  return new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `url("data:image/png;base64,${ogTemplate.toString(
            "base64"
          )}")`,
        },
        children: {
          type: "p",
          props: {
            style: {
              fontSize: 48,
              color: "white",
              textAlign: "center",
              maxWidth: 900,
            },
            children: props.data.title,
          },
        },
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: interBold,
          style: "normal",
          weight: 800,
        },
      ],
    }
  );
};

export async function getStaticPaths() {
  const posts = (await getCollection("blog")).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );
  return posts.map((post) => ({
    params: { id: post.id },
    props: post,
  }));
}
