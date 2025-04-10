import { visit } from "unist-util-visit";

/**
 * Custom Rehype plugin to wrap images with titles in <figure> and <figcaption>.
 *
 * @returns {import('unified').Transformer}
 */
function rehypeFigure() {
  // All unified plugins return a transformer function
  return (tree) => {
    // Use `visit` to find all 'element' nodes in the tree
    visit(tree, "element", (node, index, parent) => {
      // Check if the element is an <img> tag
      if (node.tagName === "img") {
        // Check if it has properties and specifically a non-empty title property
        const title = node.properties && node.properties.title;
        if (typeof title === "string" && title.length > 0) {
          // 1. Create the <figcaption> node
          const figcaptionNode = {
            type: "element",
            tagName: "figcaption",
            properties: {}, // You can add properties like class names here if needed
            children: [{ type: "text", value: title }],
          };

          // 2. Remove the title attribute from the original <img> node
          //    so it doesn't render as a tooltip.
          delete node.properties.title;

          // 3. Create the <figure> node, containing the modified <img> and the new <figcaption>
          const figureNode = {
            type: "element",
            tagName: "figure",
            properties: {}, // You can add properties like class names here if needed
            children: [node, figcaptionNode], // The children are the img and figcaption
          };

          // 4. Replace the original <img> node in the parent's children array
          //    with the new <figure> node.
          //    `parent` is the node containing the `img` (often a `<p>` or `<body>` etc.)
          //    `index` is the position of the `img` in the parent's `children` array
          if (parent && parent.children && typeof index === "number") {
            parent.children[index] = figureNode;
          }

          // Optional: Tell visit to skip traversing the children of the *new* figure node
          // since we just constructed it. This isn't strictly necessary here but
          // can be useful in more complex transformations.
          // return visit.SKIP;
        }
      }
    });
  };
}

export default rehypeFigure; // Export it for use
