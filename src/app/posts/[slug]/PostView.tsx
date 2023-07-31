"use client";

import { Post } from "contentlayer/generated";
import { format, parseISO } from "date-fns";
import Comment from "./Comment";
import Content from "./Content";

export default function PostView({ post }: { post: Post }) {
  return (
    <article
      className="prose max-w-none prose-img:mx-auto prose-img:rounded-lg text-xl prose-pre:bg-[#151515]"
      itemScope
      itemType="http://schema.org/BlogPosting"
    >
      <div className="mb-8">
        <div className="flex justify-between mb-3 text-lg text-gray-600 not-prose">
          <time itemProp="datePublished" dateTime={post.date}>
            {format(parseISO(post.date), "LLLL d, yyyy")}
          </time>
          <p>
            <span itemProp="wordCount">{post.readingTime.words}</span> words •{" "}
            <span itemProp="timeRequired">{post.readingTime.text}</span>
          </p>
        </div>
        <h1 itemProp="headline" className="leading-normal">
          {post.title}
        </h1>
      </div>
      <div className="w-full h-px my-5 bg-black/30"></div>
      <div itemProp="articleBody" className="">
        <Content code={post.body.code} />
      </div>
      <Comment />
    </article>
  );
}
