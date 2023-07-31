"use client";

import { NowPlaying } from "@/lib/spotify";
import Image from "next/image";
import Link from "next/link";

export default function Footer({
  spotifyNowPlaying,
}: {
  spotifyNowPlaying: NowPlaying;
}) {
  return (
    <div className="py-5">
      <div className="w-full h-px bg-black/30 mb-5"></div>
      {spotifyNowPlaying.isPlaying ? (
        <div className="flex gap-3 mb-5">
          <Image
            src={"/images/wave.gif"}
            alt="song wave"
            width={30}
            height={30}
          />
          <Link
            href={spotifyNowPlaying.songUrl}
            target="_blank"
            style={{
              position: "relative",
            }}
          >
            {spotifyNowPlaying.title} - {spotifyNowPlaying.artist}
          </Link>
        </div>
      ) : null}
      <p className="text-gray-800 text-sm">
        ©{new Date().getFullYear()} Thịnh Ngô • A place to put my thoughts in
        writing
      </p>
    </div>
  );
}
