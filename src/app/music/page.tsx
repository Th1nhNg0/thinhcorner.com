import { Metadata } from "next";
import React from "react";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Music - Thịnh's Corner",
};

export default function MusicPage() {
  return <div>page</div>;
}
