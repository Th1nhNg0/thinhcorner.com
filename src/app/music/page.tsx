import { getRecentlyPlayed, getTopTracks } from "@/lib/spotify";
import { Metadata } from "next";
import React from "react";
import MusicTable from "./MusicTable";
// 5 min
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Music - Thịnh's Corner",
};

export default async function MusicPage() {
  const tracks = await getTopTracks();
  const recentTracks = await getRecentlyPlayed();

  return <MusicTable tracks={tracks} recentTracks={recentTracks} />;
}
