import { SITE } from "@/consts";
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context: any) {
  const blog = (await getCollection("blog")).filter((p) => !p.data.draft);

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items: blog
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.description,
        link: `/blog/${post.id}`,
      })),
  });
}
