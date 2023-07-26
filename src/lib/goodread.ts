import * as cheerio from "cheerio";

export interface Book {
  title: string;
  url: string;
  thumbnail: string;
  rating: number;
  author: string;
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
    const thumbnail = $(el)
      .find("td:nth-child(3) img")
      .attr("src")
      ?.trim()
      .replace(/.\_.+\_/, "._SX250_");

    const rating = $(el).find("td.rating");
    const stars = rating.find("span.staticStar.p10").length;

    const author = $(el).find("td:nth-child(5) .value").text().trim();

    const book: Book = {
      title,
      url,
      thumbnail: thumbnail || "",
      rating: stars,
      author,
    };
    books.push(book);
  });
  return books;
}
