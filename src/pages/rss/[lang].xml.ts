import { buildFeed, FEED_LANGS, type FeedLang } from "@/lib/feed";
import type { APIRoute, GetStaticPaths } from "astro";

export const getStaticPaths = (() =>
  Object.keys(FEED_LANGS).map((lang) => ({ params: { lang } }))) satisfies GetStaticPaths;

export const GET: APIRoute = (context) =>
  buildFeed(context.site!, context.params.lang as FeedLang);
