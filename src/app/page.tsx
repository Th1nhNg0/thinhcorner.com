"use client";

import { Anchor, Box, Stack, Text } from "@mantine/core";
import { Post, allPosts } from "contentlayer/generated";
import { compareDesc, format, parseISO } from "date-fns";
import Link from "next/link";

function PostCard(post: Post) {
  return (
    <Box>
      <Anchor component={Link} href={post.url} color="black">
        {post.title}
      </Anchor>
      <Text color="dimmed" size="sm">
        {format(parseISO(post.date), "dd-MM-yyyy")}
      </Text>
    </Box>
  );
}

export default function Home() {
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  return (
    <Stack spacing="lg">
      {posts.map((post, idx) => (
        <PostCard key={idx} {...post} />
      ))}
    </Stack>
  );
}
