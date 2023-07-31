"use client";

import { ActionIcon, Box, Divider, Group } from "@mantine/core";
import Link from "next/link";
import { AiFillHome, AiFillInfoCircle, AiFillRead } from "react-icons/ai";
import {
  BsFillRocketTakeoffFill,
  BsFillRssFill,
  BsMusicNoteBeamed,
} from "react-icons/bs";

export default function Header() {
  return (
    <Box>
      <Group>
        <ActionIcon
          title="Home"
          size={40}
          fz={20}
          variant="filled"
          component={Link}
          href="/"
          color="dark"
        >
          <AiFillHome />
        </ActionIcon>
        <ActionIcon
          title="Timeline"
          size={40}
          fz={20}
          variant="filled"
          component={Link}
          color="dark"
          href="/timeline"
        >
          <BsFillRocketTakeoffFill />
        </ActionIcon>
        <ActionIcon
          title="Reading"
          size={40}
          fz={20}
          variant="filled"
          component={Link}
          color="dark"
          href="/reading"
        >
          <AiFillRead />
        </ActionIcon>
        <ActionIcon
          title="Music"
          size={40}
          fz={20}
          variant="filled"
          component={Link}
          color="dark"
          href="/music"
        >
          <BsMusicNoteBeamed />
        </ActionIcon>
        <ActionIcon
          title="Rss"
          size={40}
          fz={20}
          variant="filled"
          component={Link}
          color="dark"
          href="/rss"
        >
          <BsFillRssFill />
        </ActionIcon>
        <ActionIcon
          title="About"
          size={40}
          fz={20}
          variant="filled"
          component={Link}
          color="dark"
          href="/about"
        >
          <AiFillInfoCircle />
        </ActionIcon>
      </Group>
      <Divider my="lg" />
    </Box>
  );
}
