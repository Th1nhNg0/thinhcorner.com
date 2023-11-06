"use client";

import Link from "next/link";
import { AiFillHome, AiFillInfoCircle, AiFillRead } from "react-icons/ai";
import {
  BsFillRocketTakeoffFill,
  BsFillRssFill,
  BsMusicNoteBeamed,
} from "react-icons/bs";

export default function Header() {
  return (
    <div className="py-10 pb-5">
      <div className="flex justify-between gap-3 lg:justify-normal lg:gap-4">
        <Link
          title="Home"
          href="/"
          className="p-2 text-xl text-white bg-gray-900 rounded-lg md:p-3 bg-noise"
        >
          <AiFillHome />
        </Link>
        <Link
          className="p-2 text-xl text-white bg-gray-900 rounded-lg md:p-3 bg-noise"
          title="Timeline"
          href="/timeline"
        >
          <BsFillRocketTakeoffFill />
        </Link>
        <Link
          className="p-2 text-xl text-white bg-gray-900 rounded-lg md:p-3 bg-noise"
          title="Reading"
          href="/reading"
        >
          <AiFillRead />
        </Link>
        <Link
          className="p-2 text-xl text-white bg-gray-900 rounded-lg md:p-3 bg-noise"
          title="Music"
          href="/music"
        >
          <BsMusicNoteBeamed />
        </Link>
        <Link
          className="p-2 text-xl text-white bg-gray-900 rounded-lg md:p-3 bg-noise"
          title="Rss"
          href="/rss"
        >
          <BsFillRssFill />
        </Link>
        <Link
          className="p-2 text-xl text-white bg-gray-900 rounded-lg md:p-3 bg-noise"
          title="About"
          href="/about"
        >
          <AiFillInfoCircle />
        </Link>
      </div>
      <div className="w-full h-px mt-5 bg-black/30"></div>
    </div>
  );
}
