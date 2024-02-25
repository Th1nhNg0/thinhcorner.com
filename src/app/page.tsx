"use client";

import { Post, allPosts } from "contentlayer/generated";
import { compareDesc, format, parseISO } from "date-fns";
import Link from "next/link";
import Widgets from "./Widgets";

function PostCard(post: Post) {
  return (
    <div>
      <Link href={post.url} className="text-lg font-semibold">
        {post.title}
      </Link>
      <time className="block text-gray-600">
        {format(parseISO(post.date), "dd-MM-yyyy")}
      </time>
    </div>
  );
}

export default function Home() {
  const posts = allPosts
    .filter((post) => !post.hide)
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  return (
    <div className="space-y-5">
      <Widgets />
      <div className="w-full h-px mt-3 bg-black/30"></div>
      <div>
        <h2 className="mb-5 text-2xl font-bold">Latest Posts</h2>
        <div className="space-y-3">
          {posts.map((post, idx) => (
            <PostCard key={idx} {...post} />
          ))}
        </div>
      </div>
    </div>
  );
}
