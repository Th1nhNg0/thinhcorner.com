"use client";

import { ActionIcon, Divider, Group } from "@mantine/core";
import { AiFillRead, AiFillHome, AiFillInfoCircle } from "react-icons/ai";
import { BsMusicNoteBeamed } from "react-icons/bs";
import { Box } from "@mantine/core";
import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <Box>
      <Group>
        <ActionIcon
          title="Home"
          size={40}
          fz={20}
          variant="filled"
          color="dark"
          component={Link}
          href="/"
        >
          <AiFillHome />
        </ActionIcon>
        <ActionIcon
          title="Reading"
          size={40}
          fz={20}
          variant="filled"
          color="dark"
          component={Link}
          href="/reading"
        >
          <AiFillRead />
        </ActionIcon>
        <ActionIcon
          title="Music"
          size={40}
          fz={20}
          variant="filled"
          color="dark"
          component={Link}
          href="/music"
        >
          <BsMusicNoteBeamed />
        </ActionIcon>
        <ActionIcon
          title="About"
          size={40}
          fz={20}
          variant="filled"
          color="dark"
          component={Link}
          href="/about"
        >
          <AiFillInfoCircle />
        </ActionIcon>
      </Group>
      <Divider my="lg" />
    </Box>
  );
}
