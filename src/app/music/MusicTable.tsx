"use client";
import { TopTrack } from "@/lib/spotify";
import { Anchor, Box, Group, Image, Table, Text, Title } from "@mantine/core";
import React from "react";
import { formatDistance } from "date-fns";

export default function MusicTable({
  tracks,
  lastUpdated,
}: {
  tracks: TopTrack[];
  lastUpdated: Date;
}) {
  const rows = tracks.map((track) => (
    <tr key={track.id}>
      <td>
        <Anchor color="black" fw="bold" href={track.songUrl} target="_blank">
          <Group>
            <Image
              src={track.imageUrl}
              alt={track.title}
              width={50}
              height={50}
              sx={{
                "@media (max-width: 755px)": {
                  display: "none",
                },
              }}
            />
            {track.title}
          </Group>
        </Anchor>
      </td>
      <td>
        {track.artist.map((e, i) => (
          <Anchor
            key={e.id}
            color="black"
            href={e.external_urls.spotify}
            target="_blank"
          >
            {e.name}
            {i !== track.artist.length - 1 ? ", " : ""}
          </Anchor>
        ))}
      </td>
    </tr>
  ));

  return (
    <Box>
      <Title>Spotify Top Tracks</Title>
      <Text>
        These are my top tracks on Spotify, based on the last 4 weeks of
        listening.
      </Text>
      <Text>
        Last updated:{" "}
        {formatDistance(lastUpdated, new Date(), { addSuffix: true })}
      </Text>
      <Table mt="lg">
        <thead>
          <tr>
            <th>
              <Text color="black">Track</Text>
            </th>
            <th>
              <Text color="black">Artist</Text>
            </th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </Box>
  );
}
