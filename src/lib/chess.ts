import { withCache } from "@/lib/cache";

const API_BASE = "https://api.chess.com/pub";
const HISTORY_MONTHS = 6;
const RECENT_GAMES_LIMIT = 10;

// Chess.com's Published-Data API requires clients to identify themselves
// with a descriptive User-Agent (https://www.chess.com/news/view/published-data-api).
const REQUEST_HEADERS = {
  "User-Agent": "thinhcorner.com personal blog (https://github.com/th1nhng0)",
};

export interface ChessProfile {
  username: string;
  name: string;
  avatar: string;
  url: string;
  followers: number;
  country: string;
  joined: number; // epoch seconds
  lastOnline: number; // epoch seconds
  league?: string;
}

export interface ChessTimeClassStats {
  key: string; // e.g. "chess_rapid"
  label: string; // e.g. "Rapid"
  rating: number;
  best?: number;
  win: number;
  loss: number;
  draw: number;
}

export type GameOutcome = "win" | "loss" | "draw";

export interface ChessGameSummary {
  id: string;
  url: string;
  endTime: number; // epoch ms
  timeClass: string;
  color: "white" | "black";
  outcome: GameOutcome;
  opponent: string;
  opponentRating: number;
  myRating: number;
  delta: number | null; // rating change after this game, when determinable
  accuracy?: number;
  opening?: string;
}

export interface OpeningCount {
  name: string;
  count: number;
}

export interface ChessStreak {
  outcome: GameOutcome;
  length: number;
}

export interface ColorPerformance {
  games: number;
  win: number;
  loss: number;
  draw: number;
  avgOpponentRating: number;
  avgAccuracy?: number;
}

export interface HistoryPoint {
  t: number; // epoch ms
  r: number; // rating after playing at time t
}

export interface ChessOverview {
  profile: ChessProfile;
  stats: ChessTimeClassStats[];
  recent: ChessGameSummary[];
  history: Record<string, HistoryPoint[]>; // per time class, ascending by time
  openings: OpeningCount[];
  gamesFetched: number;
  monthsCovered: number;
  currentStreak: ChessStreak | null;
  bestWinStreak: number;
  avgOpponentRating: number;
  avgAccuracy?: number;
  ratingChange: number; // net points across all time classes in window
  byColor: { white: ColorPerformance; black: ColorPerformance };
}

interface RawPlayerSide {
  rating: number;
  result: string;
  username: string;
}

interface RawGame {
  url: string;
  uuid: string;
  time_class: string;
  rules: string;
  rated: boolean;
  end_time: number; // epoch seconds
  white: RawPlayerSide;
  black: RawPlayerSide;
  eco?: string;
  accuracies?: { white?: number; black?: number };
}

interface RawProfile {
  avatar?: string;
  name?: string;
  username: string;
  followers: number;
  url: string;
  country: string;
  joined: number;
  last_online: number;
  league?: string;
}

type RawStats = Record<
  string,
  | {
      last?: { rating?: number };
      best?: { rating?: number };
      record?: { win?: number; loss?: number; draw?: number };
    }
  | undefined
>;

const TIME_CLASSES = [
  { key: "chess_rapid", label: "Rapid" },
  { key: "chess_blitz", label: "Blitz" },
  { key: "chess_bullet", label: "Bullet" },
] as const;

// Result codes that count as a draw for the player holding them.
// https://www.chess.com/news/view/published-data-api#toc-game-results-codes
const DRAW_LIKE_RESULTS = new Set([
  "agreed",
  "repetition",
  "stalemate",
  "insufficient",
  "50move",
  "timevsinsufficient",
]);

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: REQUEST_HEADERS,
  });
  if (!response.ok) {
    throw new Error(
      `Chess.com API ${response.status} for ${path}: ${await response.text()}`,
    );
  }
  return (await response.json()) as T;
}

function outcomeFrom(resultCode: string): GameOutcome {
  if (resultCode === "win") return "win";
  if (DRAW_LIKE_RESULTS.has(resultCode)) return "draw";
  return "loss";
}

/** Last N months (inclusive of the current one), oldest first, not before join date. */
function monthList(
  joinedEpochSeconds: number,
): { year: number; month: number }[] {
  const joined = new Date(joinedEpochSeconds * 1000);
  const start = Date.UTC(joined.getUTCFullYear(), joined.getUTCMonth(), 1);
  const cursor = new Date();
  const months: { year: number; month: number }[] = [];
  let count = 0;
  while (
    Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), 1) >= start &&
    count < HISTORY_MONTHS
  ) {
    months.push({
      year: cursor.getUTCFullYear(),
      month: cursor.getUTCMonth() + 1,
    });
    cursor.setUTCMonth(cursor.getUTCMonth() - 1);
    count++;
  }
  return months.reverse();
}

/** "https://www.chess.com/openings/Sicilian-Defense-Najdorf-Variation" -> "Sicilian Defense Najdorf Variation" */
function openingName(ecoUrl: string): string {
  const segment = ecoUrl.split("/").pop() ?? "";
  return decodeURIComponent(segment).replace(/-/g, " ").trim();
}

async function getMonthlyGames(
  username: string,
  year: number,
  month: number,
): Promise<RawGame[]> {
  try {
    const { games } = await fetchJson<{ games: RawGame[] }>(
      `/player/${username}/games/${year}/${String(month).padStart(2, "0")}`,
    );
    return games ?? [];
  } catch {
    // The archive endpoint returns 404 for months without games.
    return [];
  }
}

function mapProfile(raw: RawProfile): ChessProfile {
  return {
    username: raw.username,
    name: raw.name || raw.username,
    avatar: raw.avatar || "",
    url: raw.url,
    followers: raw.followers ?? 0,
    country: raw.country?.split("/").pop() ?? "",
    joined: raw.joined,
    lastOnline: raw.last_online,
    league: raw.league,
  };
}

function mapStats(raw: RawStats): ChessTimeClassStats[] {
  return TIME_CLASSES.flatMap(({ key, label }) => {
    const entry = raw[key];
    if (!entry?.last?.rating) return [];
    return [
      {
        key,
        label,
        rating: entry.last.rating,
        best: entry.best?.rating,
        win: entry.record?.win ?? 0,
        loss: entry.record?.loss ?? 0,
        draw: entry.record?.draw ?? 0,
      },
    ];
  });
}

/**
 * Fetches profile, stats and up to HISTORY_MONTHS of rated-games archives in one go,
 * deriving recent games, rating history per time class and most-played openings.
 */
export async function getChessOverview(
  username: string,
  kv: KVNamespace | undefined | null,
): Promise<ChessOverview> {
  // Key is versioned: bump when the cached payload shape changes.
  return withCache(kv, `chess_overview_v4_${username}`, 3600, async () => {
    // The Chess.com API rejects mixed-case usernames in paths — always lowercase.
    const usernameLower = username.toLowerCase();
    const rawProfile = await fetchJson<RawProfile>(`/player/${usernameLower}`);
    const profile = mapProfile(rawProfile);

    const [rawStats, ...archives] = await Promise.all([
      fetchJson<RawStats>(`/player/${usernameLower}/stats`),
      ...monthList(profile.joined).map(({ year, month }) =>
        getMonthlyGames(usernameLower, year, month),
      ),
    ]);

    const lowerUsername = rawProfile.username.toLowerCase();
    const games = archives
      .flat()
      .filter((g) => g.rated && g.rules === "chess")
      .sort((a, b) => a.end_time - b.end_time);

    const meOf = (g: RawGame) =>
      g.white.username.toLowerCase() === lowerUsername ? g.white : g.black;
    const themOf = (g: RawGame) =>
      g.white.username.toLowerCase() === lowerUsername ? g.black : g.white;

    // Rating delta per game: compare against the next game in the same time class.
    const deltas = new Map<string, number>();
    for (let i = 0; i < games.length; i++) {
      for (let j = i + 1; j < games.length; j++) {
        if (games[j].time_class !== games[i].time_class) continue;
        deltas.set(
          games[j].uuid,
          meOf(games[j]).rating - meOf(games[i]).rating,
        );
        break;
      }
    }

    const toSummary = (g: RawGame): ChessGameSummary => {
      const me = meOf(g);
      const them = themOf(g);
      return {
        id: g.uuid,
        url: g.url,
        endTime: g.end_time * 1000,
        timeClass: g.time_class,
        color:
          g.white.username.toLowerCase() === lowerUsername ? "white" : "black",
        outcome: outcomeFrom(me.result),
        opponent: them.username,
        opponentRating: them.rating,
        myRating: me.rating,
        delta: deltas.get(g.uuid) ?? null,
        accuracy:
          g.accuracies?.[
            g.white.username.toLowerCase() === lowerUsername ? "white" : "black"
          ],
        opening: g.eco ? openingName(g.eco) : undefined,
      };
    };

    // Rating history per time class, ascending.
    const history: Record<string, HistoryPoint[]> = {};
    for (const game of games) {
      const me = meOf(game);
      (history[game.time_class] ??= []).push({
        t: game.end_time * 1000,
        r: me.rating,
      });
    }

    // Most played openings across the fetched window.
    const openingCounts = new Map<string, number>();
    for (const game of games) {
      if (!game.eco) continue;
      const name = openingName(game.eco);
      if (!name) continue;
      openingCounts.set(name, (openingCounts.get(name) ?? 0) + 1);
    }
    const openings = [...openingCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) satisfies OpeningCount[];

    // Outcome runs across the whole window, chronological.
    const outcomes = games.map((g) => outcomeFrom(meOf(g).result));

    let currentStreak: ChessStreak | null = null;
    const lastOutcome = outcomes.at(-1);
    if (lastOutcome) {
      let length = 0;
      for (
        let i = outcomes.length - 1;
        i >= 0 && outcomes[i] === lastOutcome;
        i--
      ) {
        length++;
      }
      currentStreak = { outcome: lastOutcome, length };
    }

    let bestWinStreak = 0;
    let winRun = 0;
    for (const o of outcomes) {
      winRun = o === "win" ? winRun + 1 : 0;
      if (winRun > bestWinStreak) bestWinStreak = winRun;
    }

    const avgOpponentRating =
      games.length > 0
        ? Math.round(
            games.reduce((sum, g) => sum + themOf(g).rating, 0) / games.length,
          )
        : 0;

    const allAccuracies = games
      .map((g) => {
        const isWhite = g.white.username.toLowerCase() === lowerUsername;
        return g.accuracies?.[isWhite ? "white" : "black"];
      })
      .filter((a): a is number => typeof a === "number");

    const avgAccuracy =
      allAccuracies.length > 0
        ? Math.round(
            (allAccuracies.reduce((sum, a) => sum + a, 0) /
              allAccuracies.length) *
              10,
          ) / 10
        : undefined;

    // Net rating change per time class across the window (last minus first), summed.
    const ratingChange = Object.values(history).reduce((total, points) => {
      if (points.length < 2) return total;
      return total + points[points.length - 1].r - points[0].r;
    }, 0);

    const colorPerf = (side: "white" | "black"): ColorPerformance => {
      const subset = games.filter(
        (g) =>
          (side === "white" ? g.white : g.black).username.toLowerCase() ===
          lowerUsername,
      );
      const wins = subset.filter(
        (g) =>
          outcomeFrom((side === "white" ? g.white : g.black).result) === "win",
      ).length;
      const losses = subset.filter(
        (g) =>
          outcomeFrom((side === "white" ? g.white : g.black).result) === "loss",
      ).length;
      const draws = subset.length - wins - losses;
      const accuracies = subset
        .map((g) => g.accuracies?.[side])
        .filter((a): a is number => typeof a === "number");
      return {
        games: subset.length,
        win: wins,
        loss: losses,
        draw: draws,
        avgOpponentRating:
          subset.length > 0
            ? Math.round(
                subset.reduce((sum, g) => sum + themOf(g).rating, 0) /
                  subset.length,
              )
            : 0,
        avgAccuracy:
          accuracies.length > 0
            ? Math.round(
                (accuracies.reduce((sum, a) => sum + a, 0) /
                  accuracies.length) *
                  10,
              ) / 10
            : undefined,
      };
    };

    return {
      profile,
      stats: mapStats(rawStats),
      recent: games.slice(-RECENT_GAMES_LIMIT).toReversed().map(toSummary),
      history,
      openings,
      gamesFetched: games.length,
      monthsCovered: monthList(profile.joined).length,
      currentStreak,
      bestWinStreak,
      avgOpponentRating,
      avgAccuracy,
      ratingChange,
      byColor: { white: colorPerf("white"), black: colorPerf("black") },
    } satisfies ChessOverview;
  });
}
