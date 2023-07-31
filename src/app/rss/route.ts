import { allPosts } from "contentlayer/generated";
import { Feed } from "feed";

export async function GET(request: Request) {
  const feed = new Feed({
    title: "Thịnh's Corner",
    description: "A place to put my thoughts in writing",
    id: "https://thinhcorner.com",
    link: "https://thinhcorner.com",
    language: "en",
    image: "https://thinhcorner.com/images/socialbg.png",
    favicon: "https://thinhcorner.com/favicon.ico",
    copyright: "All rights reserved 2023, Thinh Ngo",
    author: {
      name: "Thinh Ngo",
      email: "thinhngow@gmail.com",
      link: "https://thinhcorner.com/about",
    },
  });

  allPosts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: "https://thinhcorner.com" + post.url,
      link: "https://thinhcorner.com" + post.url,
      date: new Date(post.date),
    });
  });
  feed.addCategory("Technologie");
  feed.addCategory("Blog");

  return new Response(feed.rss2(), {
    headers: {
      "content-type": "application/xml;charset=UTF-8",
    },
  });
}
