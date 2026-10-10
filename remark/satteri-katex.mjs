import katex from "katex";

function renderMath(node, ctx, displayMode) {
  const value = katex.renderToString(node.value, {
    displayMode,
    throwOnError: false,
  });
  if (displayMode) return { rawHtml: value };

  // Inline math in Markdown: rawHtml would make Sätteri emit a block-level
  // paragraph inside the surrounding paragraph, so use an inline HTML node.
  // In MDX an html node becomes an escaped string child, while rawHtml is
  // parsed into inline JSX, so MDX needs rawHtml.
  const isMdx = ctx.fileURL?.pathname.endsWith(".mdx");
  return isMdx ? { rawHtml: value } : { type: "html", value };
}

const satteriKatex = {
  name: "katex",
  math(node, ctx) {
    return renderMath(node, ctx, true);
  },
  inlineMath(node, ctx) {
    return renderMath(node, ctx, false);
  },
};

export default satteriKatex;
