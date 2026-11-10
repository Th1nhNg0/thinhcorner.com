// Reads Goodreads shelves from their public RSS feeds. Shared by the Worker
// (src/lib/goodread.ts) and the scheduled sync (scripts/update-goodreads.ts), so it
// has no Worker- or alias-dependent imports.
import * as cheerio from "cheerio";

export interface Book {
  title: string;
  url: string;
  rating: number;
  author: string;
  cover?: string;
  num_pages?: string;
  book_published?: string;
  user_read_at?: string;
}

export interface Shelves {
  current_reads: Book[];
  read: Book[];
}

// The feed serves 100 reviews per page.
const PAGE_SIZE = 100;
const MAX_PAGES = 30;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export function parseBooks(xml: string): Book[] {
  const $ = cheerio.load(xml, { xmlMode: true });
  const books: Book[] = [];
  $("item").each((_i, el) => {
    const field = (name: string) => $(el).find(name).first().text().trim();
    books.push({
      title: field("title"),
      url: field("link"),
      rating: Number(field("user_rating")),
      author: field("author_name"),
      cover: field("book_large_image_url"),
      num_pages: field("num_pages"),
      book_published: field("book_published"),
      user_read_at: field("user_read_at"),
    });
  });
  return books;
}

/** Every book on one shelf, newest read first. Throws when a page can't be fetched. */
export async function fetchShelf(userId: string, shelf: string): Promise<Book[]> {
  const books: Book[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `https://www.goodreads.com/review/list_rss/${userId}?shelf=${shelf}&page=${page}`;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/rss+xml, application/xml, text/xml" },
    });
    const body = await res.text();
    if (!res.ok) {
      throw new Error(
        `Goodreads ${shelf} page ${page}: HTTP ${res.status}. Body starts: ${body.slice(0, 200)}`,
      );
    }
    if (!body.includes("<rss")) {
      throw new Error(
        `Goodreads ${shelf} page ${page}: not an RSS feed. Body starts: ${body.slice(0, 200)}`,
      );
    }
    const pageBooks = parseBooks(body);
    books.push(...pageBooks);
    if (pageBooks.length < PAGE_SIZE) break;
  }
  const readAt = (book: Book) => (book.user_read_at ? new Date(book.user_read_at).getTime() : 0);
  return books.sort((a, b) => readAt(b) - readAt(a));
}

export async function fetchShelves(userId: string): Promise<Shelves> {
  const current_reads = await fetchShelf(userId, "currently-reading");
  const read = await fetchShelf(userId, "read");
  return { current_reads, read };
}

export function isShelves(value: unknown): value is Shelves {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as Shelves).read) &&
    Array.isArray((value as Shelves).current_reads)
  );
}
