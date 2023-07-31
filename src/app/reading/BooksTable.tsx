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
  const cr_rows = books.read.map((element) => (
    <tr key={element.url}>
      <td className="border-t py-2">
        <Link href={element.url} target="_blank">
          {element.title}
        </Link>
      </td>
      <td className="border-t py-2 px-2">{element.author}</td>
      <td className="border-t py-2">{element.rating}/5</td>
    </tr>
  ));

  return (
    <div>
      <div>
        <h2 className="text-5xl font-bold mb-5">Currently Reading</h2>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {books.current_reads.map((element) => (
            <div key={element.url} title={element.title}>
              <Link href={element.url} target="_blank">
                <picture>
                  <img
                    src={element.thumbnail}
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
        <h2 className="text-5xl font-bold mb-5">Finished</h2>
        <table className="table border-collapse">
          <thead>
            <tr>
              <th className="text-left">Book</th>
              <th className="text-left  px-2">Author</th>
              <th className="text-left">Rating</th>
            </tr>
          </thead>
          <tbody>{cr_rows}</tbody>
        </table>
      </div>
    </div>
  );
}
