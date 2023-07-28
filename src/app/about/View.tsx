"use client";
import { Anchor, Box, List, Text, Title } from "@mantine/core";

export default function View() {
  return (
    <Box>
      <Title>Hi. I&apos;m Thinh.</Title>
      <Text>
        I made this site just for fun. Inspired by{" "}
        <Anchor href="https://garden.bradwoods.io">
          Brad Woods&apos; Digital Garden
        </Anchor>{" "}
        and{" "}
        <Anchor href="https://nathanrooy.github.io/">Nathan Rooy Blog</Anchor>
      </Text>
      <Text>Some of my links:</Text>
      <List>
        <List.Item>
          <Anchor href="https://github.com/Th1nhNg0" target="_blank">
            GitHub
          </Anchor>
        </List.Item>
        <List.Item>
          <Anchor href="https://www.facebook.com/Th1nhNg0/" target="_blank">
            Facebook
          </Anchor>
        </List.Item>
        <List.Item>
          <Anchor href="https://www.goodreads.com/th1nhng0" target="_blank">
            Goodreads
          </Anchor>
        </List.Item>
        <List.Item>
          <Anchor href="mailto:thinhngow@gmail.com" target="_blank">
            Mail
          </Anchor>
        </List.Item>
      </List>
    </Box>
  );
}
