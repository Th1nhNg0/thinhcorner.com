import type { TransitionDirectionalAnimations } from "astro";

// Page content between navigations: the old page fades out quickly, the new one
// rises a few pixels into place. Header, sky and footer have their own names and no
// animation, so they stay still while only the content changes.
const out = { name: "pageOut", duration: "140ms", easing: "ease-in", fillMode: "both" };
const rise = {
  name: "pageRise",
  duration: "300ms",
  delay: "140ms",
  easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
  fillMode: "both",
};
const drop = { ...rise, name: "pageDrop" };

export const pageSwap: TransitionDirectionalAnimations = {
  forwards: { old: out, new: rise },
  // Going back, the earlier page settles down from above instead.
  backwards: { old: out, new: drop },
};

/** Shared name for a post title, so it moves from a list into the post's heading. */
export const postTitleName = (id: string) => `post-title-${id}`;
