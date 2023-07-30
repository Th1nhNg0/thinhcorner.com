"use client";
import {
  Blockquote,
  Box,
  Center,
  Code,
  Divider,
  Flex,
  Image,
  List,
  Text,
  Title,
} from "@mantine/core";
import { Prism } from "@mantine/prism";
import { Post } from "contentlayer/generated";
import { format, parseISO } from "date-fns";
import { useMDXComponent } from "next-contentlayer/hooks";
import "katex/dist/katex.css";

export default function PostView({ post }: { post: Post }) {
  const MDXContent = useMDXComponent(post.body.code);

  return (
    <article
      className="mx-auto max-w-xl py-8"
      itemScope
      itemType="http://schema.org/BlogPosting"
    >
      <Box className="mb-8 text-center">
        <Flex justify="space-between">
          <Text
            component="time"
            color="dimmed"
            itemProp="datePublished"
            dateTime={post.date}
          >
            {format(parseISO(post.date), "LLLL d, yyyy")}
          </Text>
          <Text color="dimmed">
            <span itemProp="wordCount">{post.readingTime.words}</span> words •{" "}
            <span itemProp="timeRequired">{post.readingTime.text}</span>
          </Text>
        </Flex>
        <Title
          mt="sm"
          order={1}
          className="text-3xl font-bold"
          itemProp="headline"
        >
          {post.title}
        </Title>
      </Box>
      <Divider my="xl" />
      <Box itemProp="articleBody">
        <MDXContent
          components={{
            ...MDXComponents,
          }}
        />
      </Box>
    </article>
  );
}
const MDXComponents = {
  pre: customPre,
  code: customCode,
  img: CustomImage,
  blockquote: CustomBlockquote,
  p: (props: any) => <Text component="p" size="lg" {...props} />,
  li: (props: any) => <List.Item fz="lg">{props.children}</List.Item>,
  ol: (props: any) => <List withPadding>{props.children}</List>,
  ul: (props: any) => <List withPadding>{props.children}</List>,
};

function customCode(props: any) {
  return <Code color="dark">{props.children}</Code>;
}

function CustomBlockquote({ children }: any) {
  return (
    <Blockquote>
      <Box mt={-16}>{children}</Box>
    </Blockquote>
  );
}
function CustomImage({ src, alt }: any) {
  return (
    <Center>
      <Box>
        <Image src={src} alt={alt} />
      </Box>
    </Center>
  );
}

function customPre(props: any) {
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
