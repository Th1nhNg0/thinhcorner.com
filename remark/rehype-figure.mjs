const rehypeFigure = {
  name: "figure",
  element: {
    filter: ["img"],
    visit(node, ctx) {
      const title = node.properties?.title;
      if (typeof title !== "string" || title.length === 0) return;

      ctx.setProperty(node, "title", null);
      return {
        type: "element",
        tagName: "figure",
        properties: {},
        children: [
          node,
          {
            type: "element",
            tagName: "figcaption",
            properties: {},
            children: [{ type: "text", value: title }],
          },
        ],
      };
    },
  },
};

export default rehypeFigure;
