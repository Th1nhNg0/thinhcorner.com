"use client";

import { Book } from "@/lib/goodread";
import {
  Anchor,
  Box,
  Image,
  Rating,
  SimpleGrid,
  Stack,
  Table,
  Title,
} from "@mantine/core";
import Link from "next/link";

export default function BooksTable({
  books,
}: {
  books: {
    current_reads: Book[];
    read: Book[];
  };
}) {
  const cr_rows = books.read.map((element) => (
    <tr key={element.url}>
      <td>
        <Anchor href={element.url} target="_blank" component={Link}>
          {element.title}
        </Anchor>
      </td>
      <td>{element.author}</td>
      <td>
        <Rating value={element.rating} readOnly />
      </td>
    </tr>
  ));

  return (
    <Stack>
      <Box>
        <Title>Currently Reading</Title>
        <SimpleGrid
          cols={4}
          breakpoints={[
            { maxWidth: "sm", cols: 2 },
            { maxWidth: "md", cols: 3 },
          ]}
        >
          {books.current_reads.map((element) => (
            <Box key={element.url} title={element.title}>
              <Anchor href={element.url} target="_blank" component={Link}>
                <Image src={element.thumbnail} alt={element.title} />
              </Anchor>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
      <Box>
        <Title>Finished</Title>
        <Table fontSize="md">
          <thead>
            <tr>
              <th>Book</th>
              <th>Author</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>{cr_rows}</tbody>
        </Table>
      </Box>
    </Stack>
  );
}
