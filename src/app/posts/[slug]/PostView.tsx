"use client";
import {
  Box,
  Center,
  Divider,
  Flex,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";
import { Prism } from "@mantine/prism";
import { Post } from "contentlayer/generated";
import { format, parseISO } from "date-fns";
import { useMDXComponent } from "next-contentlayer/hooks";
import { BlogPosting } from "schema-dts";

export default function PostView({ post }: { post: Post }) {
  const MDXContent = useMDXComponent(post.body.code);
  const blogPosting: BlogPosting = {
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: "Thịnh Ngô",
    },
    wordCount: post.readingTime.words,
  };

  return (
    <article className="mx-auto max-w-xl py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPosting) }}
      />
      <Box className="mb-8 text-center">
        <Flex justify="space-between">
          <Text component="time" color="dimmed" dateTime={post.date}>
            {format(parseISO(post.date), "LLLL d, yyyy")}
          </Text>
          <Text color="dimmed">
            {post.readingTime.words} words • {post.readingTime.text}
          </Text>
        </Flex>
        <Title mt="sm" order={1} className="text-3xl font-bold">
          {post.title}
        </Title>
      </Box>
      <Divider my="xl" />
      <TypographyStylesProvider>
        <MDXContent
          components={{
            ...MDXComponents,
          }}
        />
      </TypographyStylesProvider>
    </article>
  );
}

const MDXComponents = {
  pre: Pre,
  img: CustomImage,
};

function CustomImage({ src, alt }: any) {
  return (
    <Center>
      <picture>
        <img src={src} alt={alt} />
      </picture>
    </Center>
  );
}

function Pre(props: any) {
  return (
    <Prism
      mb={20}
      colorScheme="dark"
      withLineNumbers
      language={props.children.props.className.replace("language-", "")}
    >
      {props.children.props.children}
    </Prism>
  );
}
