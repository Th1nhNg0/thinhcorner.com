import { RoundedImage, RoundedImageRaw } from "@/components/mdx-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRecentlyPlayed, getTopTracks } from "@/lib/spotify";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60 * 5;

export const metadata = {
  title: "Music",
  description: "My music taste.",
};

export default async function page() {
  const recentTracks = await getRecentlyPlayed();
  return (
    <div>
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">my music</h1>

      <div className="prose max-w-none dark:prose-invert">
        <p>
          These are the songs I&apos;ve listened to most recently on{" "}
          <b className="text-[#1DB954]">Spotify</b>:
        </p>

        <Table className="not-prose">
          <TableHeader>
            <TableRow>
              <TableHead>Track</TableHead>
              <TableHead>Played At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTracks.map((track) => (
              <TableRow key={track.id}>
                <TableCell className="flex items-center gap-3">
                  <Link href={track.songUrl} target="_blank">
                    <picture>
                      <img
                        src={track.imageUrl}
                        className="w-20 h-20 hidden md:block object-cover aspect-square"
                        alt=""
                      />
                    </picture>
                  </Link>
                  <div>
                    <Link
                      className="font-medium"
                      href={track.songUrl}
                      target="_blank"
                    >
                      <p className="hover:underline text-lg">{track.title}</p>
                    </Link>
                    <div>
                      {track.artist.map((e, i) => (
                        <Link
                          key={e.id}
                          href={e.external_urls.spotify}
                          target="_blank"
                          className="hover:underline text-gray-500"
                        >
                          {e.name}
                          {i !== track.artist.length - 1 ? ", " : ""}
                        </Link>
                      ))}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  {formatDistanceToNow(new Date(track.played_at), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p>
          Want to know more about my music taste? I got an analysis of my{" "}
          <b className="text-[#1DB954]">Spotify</b> data. Learn more:{" "}
          <Link href="https://support.spotify.com/us/article/understanding-my-data/">
            Spotify Data Privacy
          </Link>
        </p>
        <p>Here is a quick review:</p>
        <ul>
          <li>
            My records begin on{" "}
            <span className="text-[#1DB954]">
              {new Date("2018-03-14").toLocaleDateString()}
            </span>{" "}
            and end on{" "}
            <span className="text-[#1DB954]">
              {new Date("2024-05-05").toLocaleDateString()}
            </span>
            . That&apos;s a span of{" "}
            <span className="text-[#1DB954]">2243 days</span>.
          </li>
          <li>
            I played songs on <span className="text-[#1DB954]">1570 days</span>,
            which account for <span className="text-[#1DB954]">70%</span> of all
            days.
          </li>
          <li>
            I played <span className="text-[#1DB954]">66861 songs</span>,
            totaling
            <span className="text-[#1DB954]"> 2420 hours</span>. That&apos;s an
            average of about <span className="text-[#1DB954]">43 tracks</span>{" "}
            or <span className="text-[#1DB954]">2:32 hours</span> per day.
          </li>

          <li>
            I have listened to{" "}
            <span className="text-[#1DB954]">13144 unique songs</span>, from{" "}
            <span className="text-[#1DB954]">5588 artists</span> and{" "}
            <span className="text-[#1DB954]">10770 albums</span>. That&apos;s an
            average of about <span className="text-[#1DB954]">2.4 songs</span>{" "}
            per artist.
          </li>
          <li>
            I play a song, on average,{" "}
            <span className="text-[#1DB954]">5.1 times</span>.
          </li>
          <li>
            I skipped <span className="text-[#1DB954]">13353 songs</span>, which
            is about <span className="text-[#1DB954]">20%</span> of all songs I
            started.
          </li>
          <li>
            On average, I listen to a song for{" "}
            <span className="text-[#1DB954]">38 seconds</span> before skipping
            it. Of the songs I skip, <span className="text-[#1DB954]">51%</span>{" "}
            are skipped within <span className="text-[#1DB954]">3 seconds</span>
            , while <span className="text-[#1DB954]">29%</span> are skipped
            after more than <span className="text-[#1DB954]">30 seconds</span>{" "}
            and <span className="text-[#1DB954]">13%</span> after more than{" "}
            <span className="text-[#1DB954]">2 minutes</span>.
          </li>
          <li>
            About <span className="text-[#1DB954]">55%</span> of all songs I
            listened to were played using shuffle.
          </li>
          <li>
            I skip <span className="text-[#1DB954]">1.8%</span> of all started
            songs when using shuffle and{" "}
            <span className="text-[#1DB954]">16.57%</span> when not using
            shuffle.
          </li>
          <li>
            I started <span className="text-[#1DB954]">48%</span> of my songs
            because I clicked the forward button,{" "}
            <span className="text-[#1DB954]">4%</span> because I clicked the
            back button, <span className="text-[#1DB954]">37%</span> because the
            previous song ended, and <span className="text-[#1DB954]">11%</span>{" "}
            because I clicked on the song.
          </li>
        </ul>
        <p>And these are some visualizations</p>
        <div className="space-y-5">
          <RoundedImageRaw src="/spotify/1.png" alt="Spotify 1" />
          <RoundedImageRaw src="/spotify/2.png" alt="Spotify 2" />
          <RoundedImageRaw src="/spotify/3.png" alt="Spotify 3" />
          <RoundedImageRaw src="/spotify/4.png" alt="Spotify 4" />
          <RoundedImageRaw src="/spotify/5.png" alt="Spotify 5" />
        </div>
      </div>
    </div>
  );
}
