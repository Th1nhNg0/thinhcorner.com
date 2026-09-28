// Structural subset of a writing entry, so astro.config.mjs can use this too.
type PostLike = { data: { date: Date; updated?: Date } };

/**
 * When a post was last meaningfully changed: the `updated` frontmatter field, else
 * the publish date. File mtimes and git history are deliberately not used: a fresh
 * checkout resets mtimes, and bulk commits (formatting, image optimization) would
 * mark every post as modified.
 */
export function getModifiedDate(post: PostLike): Date {
  return post.data.updated ?? post.data.date;
}
