import { withCache } from "@/lib/cache";

const STEAM_API_BASE = "https://api.steampowered.com";
const TOP_GAMES_LIMIT = 12;
const RECENT_GAMES_LIMIT = 8;
const TOP_SHARE_LIMIT = 5;

// Library/playtime endpoints require a free Web API key
// (https://steamcommunity.com/dev/apikey). Without it the page renders a
// setup notice instead of failing.
// Standalone on purpose: the generated Cloudflare `Env` marks the key as
// required, but local/dev deployments may legitimately omit it.
interface SteamEnv {
  STEAM_API_KEY?: string;
}

export interface SteamProfile {
  steamId64: string;
  personaName: string;
  avatarUrl: string;
  profileUrl: string;
  countryCode?: string;
  memberSince: number; // epoch ms
}

export interface SteamGameSummary {
  appId: number;
  name: string;
  hours: number;
  lastPlayed: number | null; // epoch ms
  headerUrl: string;
}

export interface SteamRecentGame {
  appId: number;
  name: string;
  hoursLastTwoWeeks: number;
}

export interface SteamPlaytimeTier {
  label: string;
  count: number;
}

export interface SteamHourShare {
  name: string;
  hours: number;
  pct: number;
}

export interface SteamPlatformSplit {
  windowsPct: number;
  macPct: number;
  linuxPct: number;
}

export interface SteamOverview {
  profile: SteamProfile;
  totals: {
    games: number;
    hours: number;
    avgHours: number;
    medianHours: number;
    unplayed: number;
    recentCount: number;
  };
  topGames: SteamGameSummary[];
  hourShares: SteamHourShare[];
  topSharePct: number;
  platforms: SteamPlatformSplit | null;
  tiers: SteamPlaytimeTier[];
  recent: SteamRecentGame[];
}

interface RawPlayer {
  steamid: string;
  personaname: string;
  avatarfull: string;
  profileurl: string;
  loccountrycode?: string;
  timecreated?: string;
}

interface RawOwnedGame {
  appid: number;
  name?: string;
  playtime_forever?: number;
  rtime_last_played?: number;
  playtime_windows?: number;
  playtime_mac?: number;
  playtime_linux?: number;
}

interface RawRecentGame {
  appid: number;
  name?: string;
  playtime_2weeks?: number;
}

const PLAYTIME_TIERS = [
  { label: "Under 1h", maxMinutes: 60 },
  { label: "1–10h", maxMinutes: 600 },
  { label: "10–50h", maxMinutes: 3000 },
  { label: "50–100h", maxMinutes: 6000 },
  { label: "100h+", maxMinutes: Number.POSITIVE_INFINITY },
] as const;

/** Resolves a 17-digit SteamID64 directly, or a vanity URL name via the Web API. */
async function resolveSteamId(vanity: string, env: SteamEnv): Promise<string> {
  if (/^\d{17}$/.test(vanity)) return vanity;

  const { response } = await steamApi<{
    response: { success: number; steamid?: string };
  }>("/ISteamUser/ResolveVanityURL/v1/", { vanityurl: vanity }, env);

  if (response.success !== 1 || !response.steamid) {
    throw new Error(`No SteamID64 found for vanity "${vanity}"`);
  }
  return response.steamid;
}

async function steamApi<T>(
  path: string,
  params: Record<string, string>,
  env: SteamEnv,
): Promise<T> {
  const query = new URLSearchParams({
    key: env.STEAM_API_KEY ?? "",
    ...params,
  });

  const response = await fetch(`${STEAM_API_BASE}${path}?${query}`, {
    // Never let a hung connection spin the page forever.
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`Steam API ${response.status} for ${path}`);
  }
  return (await response.json()) as T;
}

function headerImage(appId: number): string {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
}

/**
 * Fetches profile, owned-game library and recently-played games in one go,
 * deriving totals, top games and a playtime distribution. Returns null when
 * no API key is configured so the page can show a setup notice instead.
 */
export async function getSteamOverview(
  env: SteamEnv,
  kv: KVNamespace | undefined | null,
  vanity: string,
): Promise<SteamOverview | null> {
  if (!env.STEAM_API_KEY) return null;

  return withCache(kv, `steam_overview_${vanity}_v3`, 21600, async () => {
    const steamId = await resolveSteamId(vanity, env);
    const [playersResult, ownedResult, recentResult] = await Promise.allSettled(
      [
        steamApi<{ response: { players: RawPlayer[] } }>(
          "/ISteamUser/GetPlayerSummaries/v2/",
          { steamids: steamId },
          env,
        ),
        steamApi<{
          response: {
            game_count?: number;
            games?: RawOwnedGame[];
          };
        }>(
          "/IPlayerService/GetOwnedGames/v1/",
          {
            steamid: steamId,
            include_appinfo: "true",
            include_played_free_games: "true",
          },
          env,
        ),
        steamApi<{
          response: { total_count?: number; games?: RawRecentGame[] };
        }>(
          "/IPlayerService/GetRecentlyPlayedGames/v1/",
          { steamid: steamId },
          env,
        ),
      ],
    );

    if (playersResult.status !== "fulfilled") {
      throw playersResult.reason instanceof Error
        ? playersResult.reason
        : new Error("Steam profile request failed");
    }

    const player =
      playersResult.value.response.players.find((p) => p.steamid === steamId) ??
      playersResult.value.response.players[0];

    const owned = (
      ownedResult.status === "fulfilled"
        ? (ownedResult.value.response.games ?? [])
        : []
    ).toSorted((a, b) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0));

    const totalMinutes = owned.reduce(
      (sum, game) => sum + (game.playtime_forever ?? 0),
      0,
    );
    const unplayed = owned.filter(
      (game) => (game.playtime_forever ?? 0) < 60,
    ).length;

    const hoursTo1dp = (minutes: number) =>
      Math.round((minutes / 60) * 10) / 10;

    // Median lifetime hours — more honest than the mean for skewed libraries.
    const sortedMinutes = owned
      .map((game) => game.playtime_forever ?? 0)
      .toSorted((a, b) => a - b);
    const medianMinutes =
      sortedMinutes[Math.floor((sortedMinutes.length - 1) / 2)] ?? 0;

    // How concentrated is playtime? Share of lifetime hours in the top games.
    const shareMinutes = owned
      .slice(0, TOP_SHARE_LIMIT)
      .reduce((sum, game) => sum + (game.playtime_forever ?? 0), 0);
    const topSharePct =
      totalMinutes > 0 ? Math.round((shareMinutes / totalMinutes) * 100) : 0;

    const hourShares: SteamHourShare[] = owned
      .slice(0, TOP_SHARE_LIMIT)
      .map((game) => ({
        name: game.name ?? `App ${game.appid}`,
        hours: hoursTo1dp(game.playtime_forever ?? 0),
        pct:
          totalMinutes > 0
            ? Math.round(((game.playtime_forever ?? 0) / totalMinutes) * 100)
            : 0,
      }));

    // Platform split — per-platform minutes are only present on some responses.
    const windowsMin = owned.reduce(
      (sum, game) => sum + (game.playtime_windows ?? 0),
      0,
    );
    const macMin = owned.reduce(
      (sum, game) => sum + (game.playtime_mac ?? 0),
      0,
    );
    const linuxMin = owned.reduce(
      (sum, game) => sum + (game.playtime_linux ?? 0),
      0,
    );
    const platformTotal = windowsMin + macMin + linuxMin;
    const platforms: SteamPlatformSplit | null =
      platformTotal > 0
        ? {
            windowsPct: Math.round((windowsMin / platformTotal) * 100),
            macPct: Math.round((macMin / platformTotal) * 100),
            linuxPct: Math.round((linuxMin / platformTotal) * 100),
          }
        : null;

    // Bucket games by lifetime playtime into fixed tiers.
    const tiers: SteamPlaytimeTier[] = PLAYTIME_TIERS.map((tier, index) => {
      const minMinutes = index === 0 ? 0 : PLAYTIME_TIERS[index - 1].maxMinutes;
      return {
        label: tier.label,
        count: owned.filter(
          (game) =>
            (game.playtime_forever ?? 0) >= minMinutes &&
            (game.playtime_forever ?? 0) < tier.maxMinutes,
        ).length,
      };
    });

    const topGames: SteamGameSummary[] = owned
      .slice(0, TOP_GAMES_LIMIT)
      .map((game) => ({
        appId: game.appid,
        name: game.name ?? `App ${game.appid}`,
        hours: Math.round(((game.playtime_forever ?? 0) / 60) * 10) / 10,
        lastPlayed: game.rtime_last_played
          ? game.rtime_last_played * 1000
          : null,
        headerUrl: headerImage(game.appid),
      }));

    const recent: SteamRecentGame[] = (
      recentResult.status === "fulfilled"
        ? (recentResult.value.response.games ?? [])
        : []
    )
      .slice(0, RECENT_GAMES_LIMIT)
      .map((game) => ({
        appId: game.appid,
        name: game.name ?? `App ${game.appid}`,
        hoursLastTwoWeeks:
          Math.round(((game.playtime_2weeks ?? 0) / 60) * 10) / 10,
      }));

    return {
      profile: {
        steamId64: player.steamid,
        personaName: player.personaname,
        avatarUrl: player.avatarfull,
        profileUrl: player.profileurl,
        countryCode: player.loccountrycode,
        memberSince: player.timecreated
          ? Date.parse(player.timecreated)
          : Date.now(),
      },
      totals: {
        games: owned.length,
        hours: Math.round(totalMinutes / 60),
        avgHours: owned.length ? hoursTo1dp(totalMinutes / owned.length) : 0,
        medianHours: hoursTo1dp(medianMinutes),
        unplayed,
        recentCount: recent.length,
      },
      topGames,
      hourShares,
      topSharePct,
      platforms,
      tiers,
      recent,
    } satisfies SteamOverview;
  });
}
