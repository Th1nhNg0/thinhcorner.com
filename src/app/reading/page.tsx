import { get_book } from "@/lib/goodread";
import { Metadata } from "next";
import BooksTable from "./BooksTable";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Reading - Thịnh's Corner"
};

export default async function page() {
  const books = await get_book();
  return <BooksTable books={books} />;
}
