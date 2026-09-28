// Many posts caption images with a Markdown title (`![](img.webp "caption")`) and
// leave the alt text empty, so screen readers announce nothing. Reuse the title as
// the alt text whenever the author didn't write one.
const satteriImageAlt = {
  name: "image-alt",
  image(node, ctx) {
    if (!node.alt?.trim() && node.title?.trim()) {
      ctx.setProperty(node, "alt", node.title.trim());
    }
  },
};

export default satteriImageAlt;
