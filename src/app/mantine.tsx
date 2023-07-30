"use client";

import { CacheProvider } from "@emotion/react";
import { Container, MantineProvider, useEmotionCache } from "@mantine/core";
import { Quicksand } from "next/font/google";
import { useServerInsertedHTML } from "next/navigation";

const myFont = Quicksand({
  subsets: ["vietnamese", "latin", "latin-ext"],
});

export default function RootStyleRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const cache = useEmotionCache();
  cache.compat = true;

  useServerInsertedHTML(() => (
    <style
      data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(" ")}`}
      dangerouslySetInnerHTML={{
        __html: Object.values(cache.inserted).join(" "),
      }}
    />
  ));

  return (
    <CacheProvider value={cache}>
      <MantineProvider
        withNormalizeCSS
        withGlobalStyles
        theme={{
          fontFamily: myFont.style.fontFamily,
          fontSizes: {
            xs: "14px",
            sm: "16px",
            md: "18px",
            lg: "20px",
            xl: "22px",
          },
          headings: {
            fontFamily: myFont.style.fontFamily,
            fontWeight: 400,
            sizes: {
              h1: {
                fontSize: "32px",
                fontWeight: 700,
                lineHeight: "54px",
              },
              h2: {
                fontSize: "28px",
                fontWeight: 600,
                lineHeight: "44px",
              },
              h3: {
                fontSize: "24px",
                fontWeight: 500,
                lineHeight: "36px",
              },
              h4: {
                fontSize: "20px",
                fontWeight: 500,
                lineHeight: "32px",
              },
              h5: {
                fontSize: "18px",
                fontWeight: 500,
                lineHeight: "28px",
              },
              h6: {
                fontSize: "18px",
                fontWeight: 500,
                lineHeight: "24px",
              },
            },
          },
        }}
      >
        <Container py={50} size="sm">
          {children}
        </Container>
      </MantineProvider>
    </CacheProvider>
  );
}
