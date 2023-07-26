"use client";

import {
  Box,
  Divider,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";
import { Post } from "contentlayer/generated";
import { format, parseISO } from "date-fns";

export default function PostView({ post }: { post: Post }) {
  return (
    <article className="mx-auto max-w-xl py-8">
      <Box className="mb-8 text-center">
        <Text component="time" dateTime={post.date}>
          {format(parseISO(post.date), "LLLL d, yyyy")}
        </Text>
        <Title mt="sm" order={1} className="text-3xl font-bold">
          {post.title}
        </Title>
      </Box>
      <Divider my="xl" color="black" />
      <TypographyStylesProvider>
        <div dangerouslySetInnerHTML={{ __html: post.body.html }} />
      </TypographyStylesProvider>
    </article>
  );
}
