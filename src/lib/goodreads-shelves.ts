// Reads Goodreads shelves from the public shelf widget. Goodreads retired its RSS
// feeds in October 2026 and its shelf pages now ask for a sign-in, which leaves the
// embeddable widget as the only public source. The widget has titles, authors,
// covers and ratings, but no read dates or page counts.
//
// Shared by the Worker (src/lib/goodread.ts) and the scheduled sync
// (scripts/update-goodreads.ts), so it has no Worker- or alias-dependent imports.
import * as cheerio from "cheerio";

export interface Book {
  /** Goodreads review id: stable for one book on one person's shelves. */
  id?: string;
  title: string;
  url: string;
  rating: number;
  author: string;
  cover?: string;
  /**
   * The widget carries no dates. The sync fills this in with the time it first saw
   * the book on the read shelf, so only books finished after the sync began have one.
   */
  user_read_at?: string;
  num_pages?: string;
}

export interface Shelves {
  current_reads: Book[];
  read: Book[];
}

// The widget ignores `page`, so one request has to carry the whole shelf.
export const MAX_BOOKS = 200;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

/** The widget is a script that assigns its HTML to `widget_code`; this returns that HTML. */
export function widgetHtml(script: string): string {
  const marker = "widget_code = '";
  const start = script.indexOf(marker);
  if (start < 0) throw new Error("no widget_code in the response");
  const escapes: Record<string, string> = { n: "\n", r: "\r", t: "\t" };
  let html = "";
  for (let i = start + marker.length; i < script.length; i++) {
    const char = script[i];
    if (char === "\\") {
      const next = script[++i];
      html += escapes[next] ?? next ?? "";
    } else if (char === "'") {
      return html;
    } else {
      html += char;
    }
  }
  throw new Error("widget_code string never ends");
}

export function parseBooks(script: string): Book[] {
  const $ = cheerio.load(widgetHtml(script));
  const books: Book[] = [];
  // Every class carries the widget id as a suffix (gr_custom_title_1234), hence ^=.
  $('[class^="gr_custom_each_container"]').each((_i, el) => {
    const part = (name: string) => $(el).find(`[class^="gr_custom_${name}"]`).first();
    const titleLink = part("title").find("a").first();
    const title = titleLink.text().trim();
    if (!title) return;

    const reviewUrl = (titleLink.attr("href") ?? "").split("?")[0];
    const id = reviewUrl.match(/\/review\/show\/(\d+)/)?.[1];
    const image = part("book_container").find("img").attr("src") ?? "";
    const cover = image && !image.includes("nophoto") ? image : undefined;
    // Cover paths end in the book id: …/books/1738790966l/4671._SX98_.jpg
    const bookId = cover?.match(/\/books\/[^/]+\/(\d+)\./)?.[1];

    books.push({
      id,
      title,
      // Review pages ask for a sign-in; book pages don't.
      url: bookId ? `https://www.goodreads.com/book/show/${bookId}` : reviewUrl,
      rating: part("rating").find('img[src*="star_active"]').length,
      author: part("author").find("a").first().text().trim(),
      cover,
    });
  });
  return books;
}

// Goodreads caches a widget's books by its id and ignores every other parameter on
// later requests with the same one. The id is the current time, so each sync gets
// fresh books, and its last bit says which shelf it is for, so the two shelves can
// never be handed each other's cached books.
function widgetId(shelf: string): string {
  const seconds = Math.floor(Date.now() / 1000);
  return String(seconds - (seconds % 2) + (shelf === "read" ? 0 : 1));
}

/** Every book on one shelf, in the order Goodreads returns it. Throws if the widget can't be read. */
export async function fetchShelf(userId: string, shelf: string, sort: string): Promise<Book[]> {
  const params = new URLSearchParams({
    shelf,
    sort,
    order: "d",
    num_books: String(MAX_BOOKS),
    cover_size: "medium",
    show_author: "1",
    show_cover: "1",
    show_rating: "1",
    show_title: "1",
    widget_id: widgetId(shelf),
  });
  const url = `https://www.goodreads.com/review/custom_widget/${userId}?${params}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Goodreads ${shelf}: HTTP ${res.status}. Body starts: ${body.slice(0, 200)}`);
  }
  if (!body.includes("widget_code")) {
    throw new Error(`Goodreads ${shelf}: not a shelf widget. Body starts: ${body.slice(0, 200)}`);
  }
  return parseBooks(body);
}

export async function fetchShelves(userId: string): Promise<Shelves> {
  const [current_reads, read] = await Promise.all([
    fetchShelf(userId, "currently-reading", "date_added"),
    fetchShelf(userId, "read", "date_read"),
  ]);
  return { current_reads, read };
}

export function isShelves(value: unknown): value is Shelves {
  if (!value || typeof value !== "object") return false;
  const shelves = value as Partial<Shelves>;
  return Array.isArray(shelves.current_reads) && Array.isArray(shelves.read);
}
