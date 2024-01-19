import * as cheerio from "cheerio";

export interface Book {
  title: string;
  url: string;
  rating: number;
  author: string;
  cover?: string;
  date_read?: string;
}

export async function get_book() {
  const current_reads = await crawl_book(
    "https://www.goodreads.com/review/list/161740636-th-nh-ng?shelf=currently-reading"
  );
  const read = await crawl_book(
    "https://www.goodreads.com/review/list/161740636-th-nh-ng?order=d&shelf=read&sort=date_read&utf8=%E2%9C%93"
  );

  return {
    current_reads,
    read,
  };
}

async function crawl_book(url: string) {
  const res = await fetch(url);
  const data = await res.text();
  const $ = cheerio.load(data);
  const books: Book[] = [];
  $("#booksBody > tr").each((i, el) => {
    const title = $(el).find("td:nth-child(4) a").text().trim();
    const url =
      "https://www.goodreads.com" +
      $(el).find("td:nth-child(4) a").attr("href");
    const rating = $(el).find("td.rating");
    const stars = rating.find("span.staticStar.p10").length;
    let cover = $(el).find("td.cover img").attr("src");
    if (cover) {
      cover = cover.replace(/.\_.+\_/, "._SX500_");
    }
    const author = $(el).find("td:nth-child(5) .value").text().trim();
    const date_read = $(el).find("td.date_read .date_read_value").text().trim();
    const book: Book = {
      title,
      url,
      rating: stars,
      author,
      date_read,
      cover: cover,
    };
    books.push(book);
  });
  return books;
}
