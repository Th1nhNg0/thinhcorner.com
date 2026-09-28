import { buildFeed } from "@/lib/feed";
import type { APIRoute } from "astro";

export const GET: APIRoute = (context) => buildFeed(context.site!);
