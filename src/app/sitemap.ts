import { getBlogPosts } from "../lib/blog";

export default async function sitemap() {
  let blogs = getBlogPosts()
    .filter((post) => post.metadata.draft !== "true")
    .map((post) => ({
      url: `https://thinhcorner.com/blog/${post.slug}`,
      lastModified: post.metadata.publishedAt,
    }));

  let routes = ["", "/blog", "/reading", "/timeline", "/music"].map(
    (route) => ({
      url: `https://thinhcorner.com${route}`,
      lastModified: new Date().toISOString().split("T")[0],
    })
  );

  return [...routes, ...blogs];
}
