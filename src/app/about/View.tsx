"use client";

import Link from "next/link";

export default function View() {
  return (
    <div className="prose max-w-none prose-lg">
      <h1>Hi. I&apos;m Thinh.</h1>
      <p>
        I made this site just for fun. Inspired by{" "}
        <Link href="https://garden.bradwoods.io">
          Brad Woods&apos; Digital Garden
        </Link>{" "}
        and <Link href="https://nathanrooy.github.io/">Nathan Rooy Blog</Link>
      </p>
      <p>Some of my links:</p>
      <ul>
        <li>
          <Link href="https://github.com/Th1nhNg0" target="_blank">
            GitHub
          </Link>
        </li>
        <li>
          <Link href="https://www.facebook.com/Th1nhNg0/" target="_blank">
            Facebook
          </Link>
        </li>
        <li>
          <Link href="https://www.goodreads.com/th1nhng0" target="_blank">
            Goodreads
          </Link>
        </li>
        <li>
          <Link href="mailto:thinhngow@gmail.com" target="_blank">
            Mail
          </Link>
        </li>
      </ul>
    </div>
  );
}
