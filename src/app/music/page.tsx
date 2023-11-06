import { getTopTracks } from "@/lib/spotify";
import { Metadata } from "next";
import React from "react";
import MusicTable from "./MusicTable";

export const revalidate = 24 * 60 * 60;

export const metadata: Metadata = {
  title: "Music - Thịnh's Corner",
};

export default async function MusicPage() {
  const tracks = await getTopTracks();

  return <MusicTable tracks={tracks} />;
}
