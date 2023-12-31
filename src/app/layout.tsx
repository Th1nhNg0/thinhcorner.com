import { Metadata } from "next";
import { Quicksand } from "next/font/google";
import Footer from "./Footer";
import GA from "./GA";
import Header from "./Header";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';

const myFont = Quicksand({
  subsets: ["vietnamese", "latin", "latin-ext"],
});

export const revalidate = 120;
export const metadata: Metadata = {
  title: "Thịnh's Corner",
  metadataBase: new URL("https://thinhcorner.com"),
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
  return (
    <html lang="en-US">
      <head />
      <body className={`container ${myFont.className} bg-noise`}>
        <Header />
        {children}
        <GA GA_TRACKING_ID="G-P4B7XCWCYP" />
        <Analytics />

        <Footer />
      </body>
    </html>
  );
}
