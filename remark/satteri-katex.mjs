import katex from "katex";

function renderMath(node, displayMode) {
  return {
    rawHtml: katex.renderToString(node.value, {
      displayMode,
      throwOnError: false,
    }),
  };
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
