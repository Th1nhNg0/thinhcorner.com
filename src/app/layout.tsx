import { getNowPlaying } from "@/lib/spotify";
import { Metadata } from "next";
import Footer from "./Footer";
import GA from "./GA";
import Header from "./Header";
import RootStyleRegistry from "./mantine";

export const revalidate = 120;
export const metadata: Metadata = {
  title: "Thịnh's Corner",
  description: "A place to put my thoughts in writing",
  icons: "/images/logo.png",
  openGraph: {
    type: "website",
    url: "https://thinhcorner.com/",
    locale: "en_IE",
    title: "Thịnh's Corner",
    description: "A place to put my thoughts in writing",
    images: [
      {
        url: "https://thinhcorner.com/images/socialbg.png",
        width: 1920,
        height: 1080,
        alt: "Thịnh's Corner",
      },
    ],
    emails: "thinhngow@gmail.com",
  },
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
      <GA GA_TRACKING_ID="G-P4B7XCWCYP" />
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
