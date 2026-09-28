import rss from "@astrojs/rss";
import { getContainerRenderer as getMDXRenderer } from "@astrojs/mdx/container-renderer";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { getCollection, render, type CollectionEntry } from "astro:content";
import * as cheerio from "cheerio";
import { SITE } from "../../data/consts";

export const FEED_LANGS = {
  en: { label: "English", locale: "en-us" },
  vi: { label: "Tiếng Việt", locale: "vi-vn" },
} as const;
export type FeedLang = keyof typeof FEED_LANGS;

const postLang = (post: CollectionEntry<"writing">) => post.data.lang ?? "en";

let container: AstroContainer | undefined;
async function getContainer() {
  container ??= await AstroContainer.create({
    renderers: await loadRenderers([getMDXRenderer()]),
  });
  return container;
}

// Feed readers show the HTML outside the site, so strip interactive bits and make
// every URL absolute.
async function renderPostHtml(
  post: CollectionEntry<"writing">,
  site: URL,
): Promise<string> {
  const { Content } = await render(post);
  const html = await (await getContainer()).renderToString(Content);
  const $ = cheerio.load(html, null, false);

  $("script, style, link, template").remove();
  $("[srcset]").removeAttr("srcset").removeAttr("sizes");
  $("source").remove();
  for (const attr of ["src", "href", "poster"]) {
    $(`[${attr}]`).each((_, el) => {
      const value = $(el).attr(attr);
      if (!value || value.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(value)) {
        return;
      }
      $(el).attr(attr, new URL(value, site).href);
    });
  }
  return $.html();
}

export async function buildFeed(site: URL, lang?: FeedLang) {
  const posts = (await getCollection("writing"))
    .filter((p) => !p.data.draft && (!lang || postLang(p) === lang))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  const items = await Promise.all(
    posts.map(async (post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: new URL(`/writing/${post.id}`, site).toString(),
      content: await renderPostHtml(post, site),
      customData: `<dc:language>${postLang(post)}</dc:language>`,
    })),
  );

  return rss({
    title: lang ? `${SITE.title} (${FEED_LANGS[lang].label})` : SITE.title,
    description: SITE.description,
    site,
    xmlns: { dc: "http://purl.org/dc/elements/1.1/" },
    customData: lang ? `<language>${FEED_LANGS[lang].locale}</language>` : "",
    items,
  });
}
