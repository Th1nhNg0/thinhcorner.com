import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Globe from "@/components/ui/globe";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-medium tracking-tighter">
        Hi. I&apos;m Thinh.👋
      </h1>

      <div className="prose max-w-none prose-quoteless prose-neutral dark:prose-invert">
        <p>
          I'm a data science enthusiast with a computer science background,
          currently navigating the world of business through my MBA journey.
          Join me as I explore the exciting fusion of tech and entrepreneurship.
        </p>
        <Gallery />
        <p>
          Reading book, doing data science, listening to music and programming
          are some of my hobbies. I&apos;m currently really interested in
          politics and economics, but I haven&apos;t have enough knowledge to
          have strong opinions on either.
        </p>

        <p>
          I made this site just for fun. Inspired by{" "}
          <a href="https://nathanrooy.github.io/">Nathan Rooy Blog</a> and{" "}
          <a href="https://leerob.io/">Lee Robinson site</a>.
        </p>
        <p>
          Want to know more about me? Check <Link href="/now">here</Link>.
        </p>
        <p>
          You can contact me via{" "}
          <a href="mailto:thinhngow@gmail.com">thinhngow@gmail.com</a>
        </p>
      </div>
    </div>
  );
}

function Gallery() {
  return (
    <div className="my-8 columns-2 gap-4 sm:columns-3 not-prose">
      <div className="relative mb-4 h-40">
        <Image
          alt="Me winning a hackathon"
          src="/timeline/webdev2022.jpg"
          fill
          sizes="(max-width: 768px) 213px, 33vw"
          priority
          className="rounded-lg object-cover border border-stone-200 dark:border-stone-800 "
        />
      </div>
      <div className="relative mb-4 h-80 sm:mb-0">
        <Image
          alt="Random memory"
          src="/gallery/butterfly.jpeg"
          fill
          sizes="(max-width: 768px) 213px, 33vw"
          priority
          className="rounded-lg object-cover border border-stone-200 dark:border-stone-800 "
        />
      </div>
      <div className="relative h-40 sm:mb-4 sm:h-80">
        <Image
          alt="Where I live"
          src="/gallery/milky-way.jpg"
          fill
          sizes="(max-width: 768px) 213px, 33vw"
          priority
          className="rounded-lg object-cover border border-stone-200 dark:border-stone-800 "
        />
      </div>
      <div className="relative mb-4 h-40 sm:mb-0">
        <Image
          alt="Another unlucky Hackathon"
          src="/gallery/hackathon.jpg"
          fill
          sizes="(max-width: 768px) 213px, 33vw"
          priority
          className="rounded-lg object-cover border border-stone-200 dark:border-stone-800 "
        />
      </div>
      <div className="relative mb-4 h-40 ">
        <Image
          alt="My hobby guitar"
          src="/gallery/guitar and tab.jpg"
          fill
          sizes="(max-width: 768px) 213px, 33vw"
          priority
          className="rounded-lg object-cover border border-stone-200 dark:border-stone-800 "
        />
      </div>
      <div className="relative h-80">
        <Card className="size-full overflow-hidden  md:h-full bg-stone-950 text-white">
          <CardHeader>
            <CardTitle>My Current Location</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ho Chi Minh City, Vietnam
            </p>
          </CardHeader>
          <div className="relative size-full">
            <Globe />
          </div>
        </Card>
      </div>
    </div>
  );
}
