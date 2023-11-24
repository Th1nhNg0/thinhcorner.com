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

      <div className="space-y-5 prose max-w-none">
        <h2 className="mb-3 text-3xl font-bold">What I&apos;ve done so far?</h2>
        <div>
          <time className="font-mono text-2xl text-gray-800">
            {format(new Date("2023-11-24"), "dd/MM/yyyy")}
          </time>
          <div>
            <p>Adding basic upgrade and selling towers function.</p>
            <p>The game should be like this:</p>
            <ul>
              <li>
                <b>Project G</b> offers 6 distinct tower types.
              </li>
              <li>
                When purchasing a tower, it&apos;s randomly selected from
                it&apos;s set according to a distribution.
              </li>
              <li>
                Tower upgrades involve merging two identical towers to create a
                more potent tower. And the upgraded tower is randomly selected
              </li>
              <li>
                This fusion mechanism introduces strategic depth to the game as
                you strive to enhance your defenses.
              </li>
            </ul>
            <p>Here is an example of Probability Distribution Table</p>
            <table className="table border border-black table-auto">
              <tr>
                <th className="border">Basic</th>
                <th className="border">Advanced</th>
                <th className="border">Expert</th>
                <th className="border">Master</th>
                <th className="border">Legendary</th>
                <th className="border">Divine</th>
              </tr>
              <tr>
                <td className="border">30%</td>
                <td className="border">25%</td>
                <td className="border">20%</td>
                <td className="border">15%</td>
                <td className="border">8%</td>
                <td className="border">2%</td>
              </tr>
            </table>
          </div>
          <div className="mt-2">
            <video autoPlay={true} loop controls>
              <source src="/projectG/24112023.webm" type="video/webm" />
              <source src="/projectG/24112023.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        <div>
          <time className="font-mono text-2xl text-gray-800">
            {format(new Date("2023-11-23"), "dd/MM/yyyy")}
          </time>
          <div>
            <p> Adding simple health and gold mechanic.</p>
            <p>Kill monster to get gold and use gold to buy tower.</p>
          </div>
          <div className="mt-2">
            <video autoPlay={true} loop controls>
              <source src="/projectG/23112023.webm" type="video/webm" />
              <source src="/projectG/23112023.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        <div>
          <time className="font-mono text-2xl text-gray-800">
            {format(new Date("2023-11-21"), "dd/MM/yyyy")}
          </time>
          <p>
            Adding game assets:{" "}
            <a
              className="text-blue-900 underline"
              href="https://skullreaper.itch.io/cute-tower-defense"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cute Tower Defense
            </a>
            . It&apos;s look so cute and better than my old assets.
          </p>
          <p>Addding simple tower placement system.</p>
          <div className="mt-2">
            <video autoPlay={true} loop controls>
              <source src="/projectG/21112023.webm" type="video/webm" />
              <source src="/projectG/21112023.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
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
            <video autoPlay={true} loop controls>
              <source src="/projectG/20112023.webm" type="video/webm" />
              <source src="/projectG/20112023.mp4" type="video/mp4" />
            </video>
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
