import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const postTitle = searchParams.get("title");
  const font = fetch(
    new URL("../../../public/fonts/quicksand.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());
  const fontData = await font;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundImage: "url(http://thinhcorner.com/og-bg.png)",
        }}
      >
        <div
          style={{
            marginLeft: 190,
            marginRight: 190,
            display: "flex",
            fontSize: 130,
            fontFamily: "quicksand",
            letterSpacing: "-0.02em",
            fontStyle: "normal",
            color: "white",
            lineHeight: "140px",
            whiteSpace: "pre-wrap",
          }}
        >
          {postTitle}
        </div>
      </div>
    ),
    {
      width: 1920,
      height: 1080,
      fonts: [
        {
          name: "quicksand",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );
}
