import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { get_book } from "@/lib/goodread";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export const metadata = {
  title: "Reading",
  description: "Books I have read.",
};

export default async function page() {
  const books = await get_book();

  return (
    <div>
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">
        book I have read
      </h1>
      <p className="text-lg mb-6">
        I am currently reading {books.current_reads.length} books:
      </p>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {books.current_reads.map((book) => (
          <Link key={book.url} href={book.url} target="_blank">
            <picture>
              <img
                src={book.cover}
                alt=""
                className="w-full h-full object-cover"
              />
            </picture>
          </Link>
        ))}
      </div>

      <p className="text-lg my-6">
        I have read {books.read.length} books in total:
      </p>
      <Table className="mx-auto">
        <TableHeader>
          <TableRow>
            <TableHead>Book name</TableHead>
            <TableHead>My rating</TableHead>
            <TableHead>Date read</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.read.map((book) => (
            <TableRow key={book.url}>
              <TableCell>
                <Link
                  className="font-medium flex max-w-96 items-center gap-3 "
                  href={book.url}
                  target="_blank"
                >
                  <p className="truncate">{book.title}</p>
                </Link>
              </TableCell>
              <TableCell>{book.rating}/5</TableCell>
              <TableCell
                title={
                  book.user_read_at &&
                  new Date(book.user_read_at).toDateString()
                }
              >
                {book.user_read_at
                  ? formatDistanceToNow(new Date(book.user_read_at), {
                      addSuffix: true,
                    })
                  : "a long time ago"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
