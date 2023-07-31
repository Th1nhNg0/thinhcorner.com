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
      <div className="flex gap-5">
        <Link
          title="Home"
          href="/"
          className="bg-gray-900 text-white p-3 text-xl rounded"
        >
          <AiFillHome />
        </Link>
        <Link
          className="bg-gray-900 text-white p-3 text-xl rounded"
          title="Timeline"
          href="/timeline"
        >
          <BsFillRocketTakeoffFill />
        </Link>
        <Link
          className="bg-gray-900 text-white p-3 text-xl rounded"
          title="Reading"
          href="/reading"
        >
          <AiFillRead />
        </Link>
        <Link
          className="bg-gray-900 text-white p-3 text-xl rounded"
          title="Music"
          href="/music"
        >
          <BsMusicNoteBeamed />
        </Link>
        <Link
          className="bg-gray-900 text-white p-3 text-xl rounded"
          title="Rss"
          href="/rss"
        >
          <BsFillRssFill />
        </Link>
        <Link
          className="bg-gray-900 text-white p-3 text-xl rounded"
          title="About"
          href="/about"
        >
          <AiFillInfoCircle />
        </Link>
      </div>
      <div className="w-full h-px bg-black/30 mt-5"></div>
    </div>
  );
}
