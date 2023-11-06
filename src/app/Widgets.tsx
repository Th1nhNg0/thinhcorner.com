"use client";
import { useTime } from "@/lib/useTime";
import { cn, resolveActivity, resolveActivityTypeName } from "@/lib/utils";
import { differenceInMilliseconds, format, formatDistance } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaMobileAlt, FaLaptop } from "react-icons/fa";
import { Activity, useLanyardWS } from "use-lanyard";

const MYBIRTHDAY = new Date(2001, 8, 8, 22, 5, 0);
const MYDISCORDID = "335602055441940481";

export default function Widgets() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <DiscordPresence />
      <MyAge />
      <Spotify />
    </div>
  );
}

function DiscordPresence() {
  const data = useLanyardWS(MYDISCORDID);
  return (
    <div className="p-3 text-white bg-gray-900 rounded-lg lg:col-span-2 drop-shadow-xl bg-noise">
      <p className="font-semibold lg:text-lg">Current activity</p>
      {data?.activities.filter((activity) => activity.type === 0).length ===
        0 && <p>Nothing</p>}
      <div className="mt-3 space-y-5">
        {data?.activities
          .filter((activity) => activity.type === 0)
          .map((activity) => (
            <Activity key={activity.id} activity={activity} />
          ))}
      </div>
      <div className="flex items-center justify-end gap-2 text-sm">
        {data?.active_on_discord_desktop && (
          <FaLaptop
            className="text-base text-green-500"
            title="Online on computer"
          />
        )}
        {data?.active_on_discord_mobile && (
          <FaMobileAlt
            className="text-base text-green-500"
            title="Online on mobile"
          />
        )}
        <span
          className={cn("w-3 h-3 rounded-full outline outline-2", {
            "bg-green-700 outline-green-900 animate-pulse":
              data?.discord_status == "online",
            "bg-yellow-700 outline-yellow-900": data?.discord_status == "idle",
            "bg-red-700 outline-red-900": data?.discord_status == "dnd",
            "bg-gray-700 outline-gray-900": data?.discord_status == "offline",
          })}
          title={
            data?.discord_status == "online"
              ? "Online"
              : data?.discord_status == "idle"
              ? "Idle"
              : data?.discord_status == "dnd"
              ? "Do not disturb"
              : data?.discord_status == "offline"
              ? "Offline"
              : ""
          }
        ></span>
      </div>
    </div>
  );
}

function Activity({ activity }: { activity: Activity }) {
  const time = useTime(activity.timestamps);
  return (
    <div className="flex items-center gap-3">
      <picture>
        <img
          src={resolveActivity(activity, "large") || ""}
          className="object-cover w-24 h-24 rounded-lg"
          alt=""
        />
      </picture>
      <div className="flex-1">
        <p className="text-lg font-bold">
          {resolveActivityTypeName(activity)} {activity.name}
        </p>
        <p>
          {activity.details} - {activity.state}
        </p>
        <p>
          {time && time.start && !time.end && (
            <span title={time.start}>{time.start} elapsed</span>
          )}
          {time && time.end && !time.start && (
            <span title={time.end}>{time.end} left</span>
          )}
          {time && time.completion && (
            <div className="w-full ">
              <div className="flex justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase">
                  {time.start}
                </span>
                <span className="text-xs font-semibold text-gray-400 uppercase">
                  {time.end}
                </span>
              </div>
              <span className="relative block w-full h-2 bg-gray-800 rounded-lg">
                <span
                  className="block h-2 bg-green-500 rounded-lg"
                  style={{
                    width: `${time.completion}%`,
                  }}
                ></span>
              </span>
            </div>
          )}
        </p>
      </div>
    </div>
  );
}

function MyAge() {
  const [age, setAge] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAge(calculateAge());
    }, 10);
    return () => clearInterval(interval);
  }, []);

  function calculateAge() {
    const now = new Date();
    const ageInMs = differenceInMilliseconds(now, MYBIRTHDAY);

    return ageInMs / 1000 / 60 / 60 / 24 / 365;
  }
  return (
    <div className="p-3 text-white bg-gray-900 rounded-lg drop-shadow-xl bg-noise">
      <p className="font-semibold lg:text-lg">My Age</p>
      <p className="font-mono text-xl font-bold lg:text-2xl tabular-nums">
        {age.toFixed(9)}
      </p>
    </div>
  );
}

function Spotify() {
  const data = useLanyardWS(MYDISCORDID);
  const spotify = data?.spotify;
  const time = useTime(spotify?.timestamps);

  if (!spotify)
    return (
      <div className="relative p-3 overflow-hidden text-white bg-gray-900 rounded-lg bg-noise drop-shadow-xl group">
        <p className="relative font-semibold lg:text-lg">Currently listening</p>
        <p className="relative text-xl font-bold font lg:text-2xl whitespace-nowrap">
          Not listening to anything
        </p>
      </div>
    );
  return (
    <Link
      className="relative p-3 overflow-hidden text-white rounded-lg drop-shadow-xl group spinning-bg"
      href={`https://open.spotify.com/track/${spotify.track_id}`}
      target="_blank"
      title="Open in Spotify"
    >
      <div className="absolute left-0 -m-5 -translate-y-1/2 top-1/2">
        <picture>
          <img
            src={spotify.album_art_url || ""}
            className="duration-1000 animate-spin-slow"
            alt=""
          />
        </picture>
      </div>
      <div
        className={cn(
          "absolute top-0 left-0 w-full h-full bg-gray-900/40 group-hover:bg-gray-900/30 duration-300 "
        )}
      >
        <div className="w-full h-full bg-noise"></div>
      </div>
      <div className="absolute bottom-0 left-0 w-full">
        <div className="flex justify-between px-2 pb-0.5">
          <span className="text-xs font-semibold text-gray-400 uppercase">
            {time?.start}
          </span>
          <span className="text-xs font-semibold text-gray-400 uppercase">
            {time?.end}
          </span>
        </div>
        <span className="w-full h-1 bg-gray-800/50">
          <span
            className="absolute bottom-0 left-0 h-1 bg-green-500/50"
            style={{
              width: `${time?.completion}%`,
            }}
          ></span>
        </span>
      </div>
      <p className="relative font-semibold lg:text-lg">Currently listening</p>
      <p className="relative text-xl font-bold lg:text-2xl line-clamp-1">
        {spotify.song}
      </p>
    </Link>
  );
}
