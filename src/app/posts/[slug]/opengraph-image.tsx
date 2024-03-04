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
  const fontData = await fetch(
    new URL("./Quicksand-SemiBold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());
  const image = await fetch(new URL("./logo.png", import.meta.url)).then(
    (res) => res.arrayBuffer()
  );

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
          backgroundImage: 'url("https://thinhcorner.com/images/noise.png")',
          backgroundSize: "repeat",
          backgroundColor:'white'
        }}
      >
        <div tw="flex justify-between items-center">
          <div tw="w-[500px] h-[500px]  rounded-md flex overflow-hidden items-center justify-center">
            <img src={`https://source.unsplash.com/random?${post?.keywords}`} />
          </div>
          <div tw="w-[500px] flex flex-col ml-20">
            <div tw="flex items-center">
              <img width="60" height="60" src={image as unknown as string} />
              <p tw="ml-5 text-3xl">ThinhCorner</p>
            </div>
            <h1 tw="text-4xl leading-relaxed text-gray-800 mt-5 font-semibold line-clamp-5">
              {post!.title}
            </h1>
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
