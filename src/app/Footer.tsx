"use client";

import { NowPlaying } from "@/lib/spotify";
import { Anchor, Box, Center, Divider, Group, Text } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

export default function Footer({
  spotifyNowPlaying,
}: {
  spotifyNowPlaying: NowPlaying;
}) {
  return (
    <Box>
      <Divider my="xl" />
      {spotifyNowPlaying.isPlaying ? (
        <Box mb="lg">
          <Image
            src={"/images/wave.gif"}
            alt="song wave"
            width={30}
            height={30}
          />
          <Anchor
            ml={10}
            href={spotifyNowPlaying.songUrl}
            target="_blank"
            component={Link}
            style={{
              position: "relative",
            }}
            color="black"
          >
            {spotifyNowPlaying.title} - {spotifyNowPlaying.artist}
          </Anchor>
        </Box>
      ) : null}
      <Text>
        ©{new Date().getFullYear()} Thịnh Ngô • A place to put my thoughts in
        writing
      </Text>
    </Box>
  );
}
