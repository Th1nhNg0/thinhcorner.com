import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="grid min-h-full px-6 py-24 bg-white place-items-center sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-gray-900">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">
          Sorry, look like you&apos;re looking for something that doesn&apos;t
          exist.
        </p>
        <div className="flex items-center justify-center mt-10 gap-x-6">
          <Link
            href="/"
            className="rounded-md bg-gray-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
