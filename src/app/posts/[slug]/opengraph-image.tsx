/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { allPosts } from "contentlayer/generated";
import { ImageResponse } from "next/server";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const post = allPosts.find((post) => post._raw.flattenedPath === params.slug);
  const image = await fetch(new URL("./logo.png", import.meta.url)).then(
    (res) => res.arrayBuffer()
  );
  const fontData = await fetch(
    new URL("./Quicksand-SemiBold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Quicksand",
        }}
      >
        <div tw="flex justify-center items-center">
          <img width="256" height="256" src={image as unknown as string} />
          <div tw="text-5xl ml-20 w-[600px] leading-relaxed line-clamp-2">
            {post!.title}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Quicksand",
          data: fontData,
        },
      ],
    }
  );
}
