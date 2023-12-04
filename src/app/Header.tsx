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
      <div className="flex flex-wrap justify-between gap-3 lg:justify-normal lg:gap-4">
        <Link
          title="Home"
          href="/"
          className="p-3 text-2xl text-white bg-gray-900 lg:text-xl rounded-xl bg-noise"
        >
          <AiFillHome />
        </Link>
        <Link
          className="p-3 text-2xl text-white bg-gray-900 lg:text-xl rounded-xl bg-noise"
          title="Timeline"
          href="/timeline"
        >
          <BsFillRocketTakeoffFill />
        </Link>
        <Link
          className="p-3 text-2xl text-white bg-gray-900 lg:text-xl rounded-xl bg-noise"
          title="Reading"
          href="/reading"
        >
          <AiFillRead />
        </Link>
        <Link
          className="p-3 text-2xl text-white bg-gray-900 lg:text-xl rounded-xl bg-noise"
          title="Music"
          href="/music"
        >
          <BsMusicNoteBeamed />
        </Link>
        <Link
          className="p-3 text-2xl text-white bg-gray-900 lg:text-xl rounded-xl bg-noise"
          title="Rss"
          href="/rss"
        >
          <BsFillRssFill />
        </Link>
        <Link
          className="p-3 text-2xl text-white bg-gray-900 lg:text-xl rounded-xl bg-noise"
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
