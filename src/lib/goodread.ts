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

export async function get_book() {
  const current_reads = await crawl_book(
    "https://www.goodreads.com/review/list_rss/161740636?shelf=currently-reading"
  );
  const read = await crawl_book(
    "https://www.goodreads.com/review/list_rss/161740636?shelf=read"
  );

  return {
    current_reads,
    read,
  };
}

async function crawl_book(url: string) {
  const res = await fetch(url);
  const data = await res.text();
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
}
