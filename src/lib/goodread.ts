import * as cheerio from "cheerio";
import { GOODREADS_USER_ID } from "@/consts";
import { withCache } from "@/lib/cache";

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

export async function get_book(kv: KVNamespace) {
  return withCache(kv, "goodreads_books", 3600, async () => {
    const current_reads = await crawl_book(
      `https://www.goodreads.com/review/list_rss/${GOODREADS_USER_ID}?shelf=currently-reading`
    );
    const read = await crawl_book(
      `https://www.goodreads.com/review/list_rss/${GOODREADS_USER_ID}?shelf=read`
    );
    return { current_reads, read };
  });
}

async function crawl_book(url: string) {
  console.log(`[Goodreads] Fetching: ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      }
    });
    console.log(`[Goodreads] Status: ${res.status} ${res.statusText}`);

    const data = await res.text();
    console.log(`[Goodreads] Length: ${data.length}`);
    if (res.status !== 200) {
      console.warn(`[Goodreads] Non-200 response. Content preview: ${data.slice(0, 500)}`);
    }
    const $ = cheerio.load(data, {
      xmlMode: true,
    });
    const books: Book[] = [];
    $("item").each((i, el) => {
      const title = $(el).find("title").text();
      const url = $(el).find("link").text();
      const rating = Number($(el).find("user_rating").text());
      const author = $(el).find("author_name").text();
      const cover = $(el).find("book_large_image_url").text();
      const num_pages = $(el).find("num_pages").text();
      const book_published = $(el).find("book_published").text();
      const user_read_at = $(el).find("user_read_at").text();
      books.push({
        title,
        url,
        rating,
        author,
        cover,
        num_pages,
        book_published,
        user_read_at,
      });
    });
    books.sort((a, b) => {
      const dateA = a.user_read_at ? new Date(a.user_read_at).getTime() : 0;
      const dateB = b.user_read_at ? new Date(b.user_read_at).getTime() : 0;
      return dateB - dateA;
    });
    return books;
  } catch (error) {
    console.error(`[Goodreads] Error fetching ${url}:`, error);
    return [];
  }
}

