import { withCache } from "./cache";
import type { UsageSnapshot } from "./ccusage";
// Frozen copy from master, used only if the data branch can't be fetched. It is
// expected to lag behind; the live data is on the ccusage-data branch.
import bundledSnapshot from "../../data/ccusage.json";

// Machines push usage to this branch (scripts/sync-ccusage.sh), so syncing never
// adds commits to master or triggers a site rebuild. The page reads it at request
// time instead.
export const CCUSAGE_DATA_BRANCH = "ccusage-data";
const DATA_URL = `https://raw.githubusercontent.com/Th1nhNg0/thinhcorner.com/${CCUSAGE_DATA_BRANCH}/data/ccusage.json`;
const CACHE_KEY = "ccusage:snapshot:v1";
const CACHE_TTL_SECONDS = 15 * 60;

async function fetchSnapshot(): Promise<UsageSnapshot> {
  const res = await fetch(DATA_URL, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`ccusage data: HTTP ${res.status} from ${DATA_URL}`);
  const data = (await res.json()) as UsageSnapshot;
  if (!data || typeof data !== "object" || !("sources" in data)) {
    throw new Error("ccusage data: unexpected shape");
  }
  return data;
}

/**
 * Latest usage snapshot from the data branch (KV-cached). Falls back to the copy
 * bundled from master's data/ccusage.json if GitHub is unreachable or the data
 * branch does not exist yet.
 */
export async function getUsageSnapshot(
  kv: KVNamespace | undefined | null,
): Promise<UsageSnapshot> {
  try {
    return await withCache(kv, CACHE_KEY, CACHE_TTL_SECONDS, fetchSnapshot);
  } catch (err) {
    console.error("[ccusage] falling back to bundled snapshot:", err);
    // The JSON import widens to loose nested arrays, so assert the encoded shape.
    return bundledSnapshot as unknown as UsageSnapshot;
  }
}
