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
import Link from "next/link";

export const revalidate = 60 * 5;

export const metadata = {
  title: "Music",
  description: "My music taste.",
};

export default async function page() {
  const tracks = await getTopTracks();
  const recentTracks = await getRecentlyPlayed();
  return (
    <div>
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">my music</h1>

      <p className="text-lg mb-6">
        These are the songs I&apos;ve listened to most recently on{" "}
        <span className="text-[#1DB954]">Spotify</span>.
      </p>

      <Table className="mx-auto">
        <TableHeader>
          <TableRow>
            <TableHead>Track</TableHead>
            <TableHead>Artist</TableHead>
            <TableHead>Played At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentTracks.map((track) => (
            <TableRow key={track.id}>
              <TableCell>
                <Link
                  className="font-medium flex items-center gap-3"
                  href={track.songUrl}
                  target="_blank"
                >
                  <picture>
                    <img
                      src={track.imageUrl}
                      className="w-20 h-20 hidden md:block"
                      alt=""
                    />
                  </picture>
                  <p>{track.title}</p>
                </Link>
              </TableCell>
              <TableCell>
                {track.artist.map((e, i) => (
                  <Link
                    key={e.id}
                    href={e.external_urls.spotify}
                    target="_blank"
                    className="hover:underline"
                  >
                    {e.name}
                    {i !== track.artist.length - 1 ? ", " : ""}
                  </Link>
                ))}
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
      <p className="text-lg my-6">
        And this is the list of my top tracks on{" "}
        <span className="text-[#1DB954]">Spotify</span> based on the last 30
        days.
      </p>
      <Table className="mx-auto">
        <TableHeader>
          <TableRow>
            <TableHead>Track</TableHead>
            <TableHead>Artist</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tracks.map((track, i) => (
            <TableRow key={track.id}>
              <TableCell>
                <Link
                  className="font-medium flex items-center gap-3"
                  href={track.songUrl}
                  target="_blank"
                >
                  <p className="text-4xl w-12 text-center">{i + 1}</p>
                  <picture>
                    <img
                      src={track.imageUrl}
                      className="w-20 h-20 hidden md:block"
                      alt=""
                    />
                  </picture>
                  <p className="truncate">{track.title}</p>
                </Link>
              </TableCell>
              <TableCell>
                {track.artist.map((e, i) => (
                  <Link
                    key={e.id}
                    href={e.external_urls.spotify}
                    target="_blank"
                    className="hover:underline"
                  >
                    {e.name}
                    {i !== track.artist.length - 1 ? ", " : ""}
                  </Link>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
