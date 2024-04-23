import { getBlogPosts } from "./db/blog";

export default async function sitemap() {
  let blogs = getBlogPosts().map((post) => ({
    url: `https://thinhcorner.com/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  let routes = ["", "/blog", "/guestbook", "/uses", "/work"].map((route) => ({
    url: `https://thinhcorner.com${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...blogs];
}
