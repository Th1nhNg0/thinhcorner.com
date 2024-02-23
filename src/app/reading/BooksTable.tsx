"use client";

import { Book } from "@/lib/goodread";
import Link from "next/link";

export default function BooksTable({
  books,
}: {
  books: {
    current_reads: Book[];
    read: Book[];
  };
}) {
  return (
    <div>
      <div>
        <h2 className="mb-3 text-3xl font-bold lg:text-5xl">
          Currently Reading
        </h2>
        <p className="mb-5">
          I am currently reading {books.current_reads.length} books.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {books.current_reads.map((element) => (
            <div key={element.url} title={element.title}>
              <Link href={element.url} target="_blank">
                <picture>
                  <img
                    src={element.cover}
                    alt={element.title}
                    className="object-cover w-full h-full"
                  />
                </picture>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-10">
        <h2 className="mb-3 text-3xl font-bold lg:text-5xl">Finished</h2>
        <p className="mb-5">I have read {books.read.length} books in total.</p>
        <div className="grid gap-5 md:grid-cols-3">
          {books.read.map((book, i) => (
            <Link
              href={book.url}
              target="_blank"
              key={book.url}
              className="group bg-gray-900 md:aspect-[4/6] shadow-lg relative overflow-hidden text-white rounded-md bg-noise p-5"
            >
              <div className="absolute w-1/3 opacity-80 md:opacity-100 right-5 top-1/3 md:left-0 md:top-0 md:w-full md:h-full">
                <picture>
                  <img
                    src={book.cover}
                    alt=""
                    className="object-cover w-full h-full duration-300 group-hover:scale-125"
                  />
                </picture>
              </div>
              <div className="absolute left-0 w-full h-full duration-300 opacity-0 bg-gradient-to-t from-gray-900 group-hover:opacity-100"></div>
              <div className="bottom-0 left-0 w-full duration-300 delay-75 md:absolute group-hover:opacity-100 md:opacity-0 md:p-3 ">
                <p className="relative mb-2 text-lg font-bold md:text-base md:line-clamp-3">
                  {i + 1} - {book.title}
                </p>
                <p className="relative mb-1 md:text-sm">
                  Author: {book.author}
                </p>
                <p className="relative mb-1 md:text-sm">
                  Book Published: {book.book_published}
                </p>
                <p className="relative mb-1 md:text-sm">
                  Page: {book.num_pages}
                </p>
                <p className="relative mb-1 md:text-sm">
                  Rating: {book.rating}/5
                </p>
                <p className="relative mb-1 md:text-sm">
                  Date Read:{" "}
                  {book.user_read_at
                    ? new Date(book.user_read_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
