import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const writing = defineCollection({
  loader: glob({ pattern: "**/index.{md,mdx}", base: "./data/writing" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    // Optional: set when a post is substantially revised.
    updated: z.coerce.date().optional(),
    draft: z.boolean().optional(),
    lang: z.string().optional(),
  }),
});

export const collections = { writing, blog: writing };
