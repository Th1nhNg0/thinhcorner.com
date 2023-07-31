"use client";
import { TopTrack } from "@/lib/spotify";
import React from "react";
import { formatDistance } from "date-fns";
import Link from "next/link";

export default function MusicTable({ tracks }: { tracks: TopTrack[] }) {
  const rows = tracks.map((track) => (
    <tr key={track.id}>
      <td className="border-t py-3">
        <Link
          href={track.songUrl}
          target="_blank"
          className="flex gap-5 items-center font-bold hover:underline"
        >
          <picture className="w-20 h-20 hidden md:block">
            <img src={track.imageUrl} alt={track.title} />
          </picture>
          <span className="line-clamp-1">{track.title}</span>
        </Link>
      </td>
      <td className="border-t py-3">
        {track.artist.map((e, i) => (
          <Link
            key={e.id}
            href={e.external_urls.spotify}
            target="_blank"
            className="hover:underline"
          >
            {e.name}
            {i !== track.artist.length - 1 ? ", " : ""}
          </Link>
        ))}
      </td>
    </tr>
  ));

  return (
    <div>
      <h1 className="text-5xl mb-5 font-bold">Spotify Top Tracks</h1>
      <p className="text-xl">
        These are my top tracks on Spotify, based on the last 4 weeks of
        listening.
      </p>
      <table className="table mt-5">
        <thead>
          <tr>
            <th className="text-left">Track</th>
            <th className="text-left">Artist</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}
