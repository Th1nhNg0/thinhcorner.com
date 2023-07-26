import { Metadata } from "next";
import RootStyleRegistry from "./mantine";
import { getNowPlaying } from "@/lib/spotify";
import Footer from "./Footer";
import Header from "./Header";

export const revalidate = 120;
export const metadata: Metadata = {
  title: "Thịnh's Corner",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const spotifyNowPlaying = await getNowPlaying();

  return (
    <html lang="en-US">
      <head />
      <body>
        <RootStyleRegistry>
          <Header />
          {children}
          <Footer spotifyNowPlaying={spotifyNowPlaying} />
        </RootStyleRegistry>
      </body>
    </html>
  );
}
