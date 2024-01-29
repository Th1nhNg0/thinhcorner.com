"use client";
import { RecentlyPlayedTrack, TopTrack } from "@/lib/spotify";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function MusicTable({
  tracks,
  recentTracks,
}: {
  tracks: TopTrack[];
  recentTracks: RecentlyPlayedTrack[];
}) {
  return (
    <div>
      <h1 className="mb-5 text-5xl font-bold">My Music</h1>
      <h2 className="mb-5 text-4xl font-bold">Recently Played</h2>
      <p className="text-xl">
        These are the songs I&apos;ve listened to most recently on Spotify.
      </p>
      <table className="table mt-5">
        <thead>
          <tr>
            <th className="text-left">Track</th>
            <th className="text-left">Artist</th>
            <th className="text-left">Played At</th>
          </tr>
        </thead>
        <tbody>
          {recentTracks.map((track) => (
            <tr key={track.id}>
              <td className="py-3 border-t">
                <Link
                  href={track.songUrl}
                  target="_blank"
                  className="flex items-center gap-5 font-bold hover:underline"
                >
                  <picture className="hidden w-20 h-20 md:block">
                    <img src={track.imageUrl} alt={track.title} />
                  </picture>
                  <span className="line-clamp-1">{track.title}</span>
                </Link>
              </td>
              <td className="py-3 border-t">
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
              </td>
              <td className="py-3 border-t">
                {formatDistanceToNow(new Date(track.played_at), {
                  addSuffix: true,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr className="my-10" />
      <h2 className="mb-5 text-4xl font-bold">Top Tracks</h2>
      <p className="text-xl">
        These are my top tracks on Spotify, based on the last 4 weeks of
        listening.
      </p>
      <table className="table mt-5">
        <thead>
          <tr>
            <th className="text-left">Track</th>
            <th className="text-left">Artist</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track) => (
            <tr key={track.id}>
              <td className="py-3 border-t">
                <Link
                  href={track.songUrl}
                  target="_blank"
                  className="flex items-center gap-5 font-bold hover:underline"
                >
                  <picture className="hidden w-20 h-20 md:block aspect-square">
                    <img
                      src={track.imageUrl}
                      alt={track.title}
                      className="w-full h-full"
                    />
                  </picture>
                  <span className="line-clamp-1">{track.title}</span>
                </Link>
              </td>
              <td className="py-3 border-t">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
