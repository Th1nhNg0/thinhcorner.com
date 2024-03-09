import Link from "next/link";

export default function Footer() {
  return (
    <div className="py-5">
      <div className="w-full h-px mb-5 bg-black/30"></div>
      <div className="mb-3 text-sm text-gray-800">
        <Link href="/rss">RSS</Link>
      </div>
      <p className="text-sm text-gray-800">
        ©{new Date().getFullYear()} Thịnh Ngô • A place to put my thoughts in
        writing
      </p>
    </div>
  );
}
