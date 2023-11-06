"use client";
import { useTime } from "@/lib/useTime";
import { cn, resolveActivity, stringFromType } from "@/lib/utils";
import { differenceInMilliseconds } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaLaptop, FaMobileAlt } from "react-icons/fa";
import { Activity, useLanyardWS } from "use-lanyard";
import Lottie from "react-lottie";
import cat from "./cat.json";

const MYBIRTHDAY = new Date(2001, 8, 8, 22, 5, 0);
const MYDISCORDID = "335602055441940481";

export default function Widgets() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Info />
      <Map />
      <Spotify />
      <MyAge />
      <DiscordPresence />
    </div>
  );
}

function Info() {
  return (
    <div className="relative p-3 min-h-[150px] md:min-h-0 text-white bg-gray-900 rounded-xl drop-shadow-xl bg-noise">
      <div className="absolute bottom-0 right-0">
        <Lottie
          options={{
            animationData: cat,
            loop: false,
            autoplay: true,
          }}
          isClickToPauseDisabled={true}
          width={200}
          height={200}
          speed={0.5}
        />
      </div>
      <div className="relative text-xl">
        <p>
          Hi. I&apos;m <b> Thinh</b>.
        </p>
        <p>Welcome to my corner of the internet.</p>
      </div>
    </div>
  );
}

function Map() {
  // get map image from:
  // https://render.openstreetmap.org/cgi-bin/export?bbox=106.6545867919922,10.746126188284567,106.72110557556152,10.773952188496649&scale=80000&format=png
  return (
    <div className="relative overflow-hidden rounded-xl drop-shadow-xl group ">
      <div className="absolute flex flex-col items-center justify-center gap-1 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
        <div className="relative duration-300 ease-in-out group-hover:rotate-12 group-hover:scale-110">
          <div className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
            <div className="bg-green-500 rounded-full w-14 h-14 animate-ping"></div>
          </div>
          <picture>
            <img
              src="/images/logo.png"
              alt=""
              className="relative w-16 h-16 p-2 bg-white border-2 border-green-500 rounded-full bg-noise"
            />
          </picture>
        </div>
        <div className="pl-1 pr-2 text-sm text-white duration-300 ease-in-out rounded-full bg-black/80 group-hover:-rotate-3 group-hover:scale-110">
          📍Ho Chi Minh
        </div>
      </div>
      <picture>
        <img
          src="/images/map.png"
          className="object-cover w-full h-full"
          alt=""
        />
      </picture>
    </div>
  );
}

function DiscordPresence() {
  const data = useLanyardWS(MYDISCORDID);
  const activities = data?.activities.filter((e) => e.name !== "Spotify") || [];
  return (
    <div className="p-3 text-white bg-gray-900 rounded-xl md:col-span-2 drop-shadow-xl bg-noise">
      <p className="font-bold md:text-2xl">Current activity</p>
      {activities.length == 0 && <p>Nothing</p>}
      <div className="mt-3 space-y-5">
        {activities.map((activity) => (
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
  const largeImage = resolveActivity(activity, "large") || "";
  const smallImage = resolveActivity(activity, "small") || "";

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <picture>
          <img
            src={largeImage}
            className="object-cover w-24 h-24 rounded-lg"
            alt=""
          />
        </picture>
        {smallImage && (
          <div className="absolute bottom-0 right-0 p-1 translate-x-3 translate-y-3 bg-gray-900 rounded-full bg-noise ">
            <picture>
              <img
                src={smallImage}
                className="object-cover w-10 h-10 rounded-full "
                alt=""
              />
            </picture>
          </div>
        )}
      </div>
      <div className="flex-1">
        <p className="text-lg font-bold">
          {stringFromType(activity.type)} {activity.name}
        </p>
        <p>{activity.details}</p>
        <p>{activity.state}</p>
        <p>
          {time && time.start && !time.end && (
            <span title={time.start}>{time.start} elapsed</span>
          )}
          {time && time.end && !time.start && (
            <span title={time.end}>{time.end} left</span>
          )}
          {time && time.start && time.end && time.completion && (
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
    <div className="row-start-2 p-3 text-white bg-gray-900 md:row-start-auto rounded-xl drop-shadow-xl bg-noise">
      <p className="font-semibold md:text-lg">My Age 🕛</p>
      <p className="my-2 font-mono text-xl font-bold md:text-2xl tabular-nums">
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
        <p className="relative font-semibold md:text-lg">Currently listening</p>
        <p className="relative text-xl font-bold font md:text-2xl whitespace-nowrap">
          Not listening to anything
        </p>
      </div>
    );
  return (
    <Link
      className="relative p-3 min-h-[200px] md:min-h-0 overflow-hidden text-white rounded-xl drop-shadow-xl group "
      href={`https://open.spotify.com/track/${spotify.track_id}`}
      target="_blank"
      title="Open in Spotify"
    >
      <div className="absolute left-0 -m-5 -translate-y-1/2 top-1/2">
        <picture>
          <img
            src={spotify.album_art_url || ""}
            className="object-cover w-full h-full duration-1000 animate-spin-slow"
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
          <span className="text-xs font-semibold text-green-500 uppercase shadow">
            {time?.start}
          </span>
          <span className="text-xs font-semibold text-green-500 uppercase shadow">
            {time?.end}
          </span>
        </div>
        <span className="w-full h-1 bg-gray-800/50">
          <span
            className="absolute bottom-0 left-0 h-1 bg-green-500"
            style={{
              width: `${time?.completion}%`,
            }}
          ></span>
        </span>
      </div>
      <p className="relative font-semibold md:text-lg">Currently listening</p>
      <p className="relative my-2 text-xl font-bold md:text-2xl line-clamp-1">
        {spotify.song}
      </p>
    </Link>
  );
}
