import { getBlogPosts } from "@/app/db/blog";
import { CustomMDX } from "@/components/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import readingTime from "reading-time";

import { formatDistanceToNow } from "date-fns";
import "katex/dist/katex.min.css";

export async function generateMetadata({
  params,
}: {
  params: {
    slug: string;
  };
}): Promise<Metadata | undefined> {
  let post = getBlogPosts().find((post) => post.slug === params.slug);
  if (!post) {
    return;
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;
  let ogImage = image
    ? `http://thinhcorner.com${image}`
    : `http://thinhcorner.com/og?title=${title}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `http://thinhcorner.com/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function Blog({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  let post = getBlogPosts().find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `http://thinhcorner.com${post.metadata.image}`
              : `http://thinhcorner.com/og?title=${post.metadata.title}`,
            url: `http://thinhcorner.com/blog/${post.slug}`,
            author: {
              "@type": "Person",
              name: "Thinh Ngo",
            },
          }),
        }}
      />
      <h1 className="title font-medium text-2xl tracking-tighter max-w-[650px]">
        {post.metadata.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm max-w-[650px]">
        <Suspense fallback={<p className="h-5" />}>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {formatDistanceToNow(new Date(post.metadata.publishedAt), {
              addSuffix: true,
            })}
          </p>
        </Suspense>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          ~{readingTime(post.content).text}
        </p>
      </div>
      <article className="prose prose-quoteless prose-neutral dark:prose-invert">
        <CustomMDX source={post.content} />
      </article>
    </section>
  );
}
