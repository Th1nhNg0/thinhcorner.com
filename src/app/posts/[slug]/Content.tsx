"use client";

import "katex/dist/katex.css";
import { useMDXComponent } from "next-contentlayer/hooks";
import "./highlight.css";

export default function Content({ code }: { code: string }) {
  const MDXContent = useMDXComponent(code);
  return (
    <MDXContent
      components={{
        ...MDXComponents,
      }}
    />
  );
}

const MDXComponents = {};
