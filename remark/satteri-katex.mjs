import katex from "katex";

function renderMath(node, displayMode) {
  const value = katex.renderToString(node.value, {
    displayMode,
    throwOnError: false,
  });

  // Preserve inline math as an inline HTML node. Returning rawHtml here makes
  // Sätteri emit a block-level paragraph inside the surrounding paragraph.
  return displayMode ? { rawHtml: value } : { type: "html", value };
}

const satteriKatex = {
  name: "katex",
  math(node) {
    return renderMath(node, true);
  },
  inlineMath(node) {
    return renderMath(node, false);
  },
};

export default satteriKatex;
