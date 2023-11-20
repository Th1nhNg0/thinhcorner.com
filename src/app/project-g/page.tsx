import { format } from "date-fns";

export const metadata = {
  title: "Project G - Thịnh's Corner",
};

export default function page() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="mb-5 text-5xl font-bold">Project G</h1>
        <p className="text-xl">
          <b>Project G</b> is a project that I started in November 2023. It a
          simple tower defense game that I made with{" "}
          <a
            className="text-blue-900 underline"
            href="https://godotengine.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Godot Engine
          </a>
          . I&apos;m still working on it and I hope I can finish it soon.
        </p>
      </div>

      <div className="space-y-5">
        <h2 className="mb-3 text-3xl font-bold">What I&apos;ve done so far?</h2>
        <div>
          <time className="font-mono text-2xl text-gray-800">
            {format(new Date("2023-11-20"), "dd/MM/yyyy")}
          </time>
          <p>
            Create a simple path following and enemy spawning system. Simple
            Base Tower and Enemy. Enemy have speed, health. Tower have custom
            fire rate, damage, range.
          </p>
          <div className="mt-2">
            <video
              src="/projectG/20112023.mp4"
              autoPlay={true}
              loop
              controls
            ></video>
          </div>
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-3xl font-bold">Wanna Join with me?</h2>
        <p className="text-xl">
          If you are interested in joining the development of <b>Project G</b>,
          feel free to reach out to me. I&apos;m looking for passionate people
          who want to contribute to the game and help make it even better!
        </p>
        <div className="flex items-center justify-center">
          <a
            href="mailto:thinhngow@gmail.com"
            className="px-5 py-3 mx-auto mt-5 text-xl font-bold text-white duration-300 bg-blue-900 rounded-xl hover:bg-blue-700"
          >
            Contact me
          </a>
        </div>
      </div>
    </div>
  );
}
