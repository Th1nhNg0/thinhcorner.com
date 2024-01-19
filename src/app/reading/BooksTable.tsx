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
  const cr_rows = books.read.map((element, i) => (
    <tr key={element.url}>
      <td className="border-t py-2">
        <Link href={element.url} target="_blank">
          {i + 1} - <b className="font-medium">{element.title}</b>
        </Link>
      </td>
      <td className="border-t py-2 px-2">{element.author}</td>
      <td className="border-t py-2 px-2">{element.rating}/5</td>
      <td className="border-t py-2 whitespace-nowrap">
        {element.date_read || "Unkown"}
      </td>
    </tr>
  ));

  return (
    <div>
      <div>
        <h2 className="text-3xl lg:text-5xl font-bold mb-3">
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
                    className="w-full h-full object-cover"
                  />
                </picture>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-10">
        <h2 className="text-3xl lg:text-5xl font-bold mb-3">Finished</h2>
        <p className="mb-5">I have read {books.read.length} books in total.</p>
        <div className="grid md:grid-cols-3 gap-5">
          {books.read.map((book, i) => (
            <Link
              href={book.url}
              target="_blank"
              key={book.url}
              className="group bg-gray-900 md:aspect-[4/6] shadow-lg relative overflow-hidden text-white rounded-md bg-noise p-5"
            >
              <div className="absolute opacity-80 md:opacity-100 right-5  top-1/3 w-1/3 md:left-0 md:top-0 md:w-full md:h-full">
                <picture>
                  <img
                    src={book.cover}
                    alt=""
                    className="group-hover:scale-125 duration-300 w-full object-cover  h-full"
                  />
                </picture>
              </div>
              <div className="absolute duration-300 w-full h-full bg-gradient-to-t from-gray-900 left-0 group-hover:opacity-100 opacity-0"></div>
              <div className="md:absolute bottom-0 group-hover:opacity-100 md:opacity-0 duration-300 delay-75 left-0 w-full md:p-3 ">
                <p className="text-lg md:text-base font-bold mb-2 relative md:line-clamp-3">
                  {i + 1} - {book.title}
                </p>
                <p className="mb-1 md:text-sm relative">
                  Author: {book.author}
                </p>
                <p className="mb-1 md:text-sm relative">
                  Rating: {book.rating}/5
                </p>
                <p className="mb-1 md:text-sm relative">
                  Date Read: {book.date_read || "Unkown"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
