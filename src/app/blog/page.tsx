import Link from "next/link";
import { getBlogPosts } from "../../lib/blog";

const getLanguageFlag = (language: string) => {
  const flags: Record<string, string> = {
    en: "🇺🇸",
    vi: "🇻🇳",
  };
  return flags[language] || language;
};

const getLanguageClass = (language: string) => {
  const classes: Record<string, string> = {
    en: "bg-blue-50 dark:bg-blue-900/30",
    vi: "bg-red-50 dark:bg-red-900/30",
  };
  return classes[language] || "bg-neutral-100 dark:bg-neutral-800";
};

export const metadata = {
  title: "Blog",
  description: "Read my thoughts on software development, design, and more.",
};

export default function BlogPage() {
  let allBlogs = getBlogPosts();

  return (
    <section>
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">
        read my blog
      </h1>
      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-8">
        <span>Available in:</span>
        <span
          title="English"
          className={`px-1.5 py-0.5 rounded-md ${getLanguageClass("en")}`}
        >
          🇺🇸 English
        </span>
        <span className="mx-1">•</span>
        <span
          title="Vietnamese"
          className={`px-1.5 py-0.5 rounded-md ${getLanguageClass("vi")}`}
        >
          🇻🇳 Tiếng Việt
        </span>
      </div>
      {allBlogs
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1;
          }
          return 1;
        })
        .filter((post) => post.metadata.draft !== "true")
        .map((post) => (
          <Link
            key={post.slug}
            className="flex flex-col space-y-1 mb-4 group"
            href={`/blog/${post.slug}`}
          >
            <div className="w-full flex flex-col">
              <p className="text-neutral-900 dark:text-neutral-100 tracking-tight">
                {post.metadata.language && (
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded-md mr-2 ${getLanguageClass(
                      post.metadata.language
                    )}`}
                  >
                    {getLanguageFlag(post.metadata.language)}
                  </span>
                )}
                <span className="group-hover:underline">
                  {post.metadata.title}
                </span>
              </p>
              <p className="text-neutral-600 dark:text-neutral-400">
                {post.metadata.publishedAt}
              </p>
            </div>
          </Link>
        ))}
    </section>
  );
}
