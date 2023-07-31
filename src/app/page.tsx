"use client";

import { Post, allPosts } from "contentlayer/generated";
import { compareDesc, format, parseISO } from "date-fns";
import Link from "next/link";

function PostCard(post: Post) {
  return (
    <div>
      <Link href={post.url} className="text-xl font-semibold">
        {post.title}
      </Link>
      <time className="block text-gray-600">
        {format(parseISO(post.date), "dd-MM-yyyy")}
      </time>
    </div>
  );
}

export default function Home() {
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  return (
    <div className="space-y-5">
      {posts.map((post, idx) => (
        <PostCard key={idx} {...post} />
      ))}
    </div>
  );
}
