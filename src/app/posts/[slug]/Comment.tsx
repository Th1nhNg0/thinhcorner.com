import Giscus from "@giscus/react";

export default function Comment() {
  return (
    <Giscus
      id="comments"
      repo="th1nhng0/thinhcorner.com"
      repoId="R_kgDOKAHYOg"
      category="Announcements"
      categoryId="DIC_kwDOKAHYOs4CYPCB"
      mapping="title"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="light"
      lang="en"
      loading="lazy"
    />
  );
}
