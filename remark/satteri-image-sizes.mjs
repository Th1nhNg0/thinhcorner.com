// Astro's constrained layout defaults `sizes` to "(min-width: <image width>px) <image width>px, 100vw",
// so on a wide screen a 2000px image is fetched at full size even though the post column
// (Container: 45rem minus padding) never shows it wider than 672px. Tell the browser the real
// slot width so it picks a matching srcset candidate.
export const POST_IMAGE_SIZES = "(min-width: 720px) 672px, 100vw";

const satteriImageSizes = {
  name: "image-sizes",
  element: {
    filter: ["img"],
    visit(node, ctx) {
      if (!node.properties?.sizes) {
        ctx.setProperty(node, "sizes", POST_IMAGE_SIZES);
      }
    },
  },
};

export default satteriImageSizes;
