import { execFile } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { homedir, hostname } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

type RawModel = {
  modelName: string;
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
};

type RawAgent = {
  agent: string;
  totalCost?: number;
  totalTokens?: number;
};

type RawDay = {
  period: string;
  inputTokens?: number;
  outputTokens?: number;
  cacheReadTokens?: number;
  modelBreakdowns?: RawModel[];
  agents?: RawAgent[];
};

type NamedModel = [modelName: string, totalTokens: number, costCents: number];
type NamedAgent = [agent: string, totalTokens: number, costCents: number];
type NamedDay = [
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens: number,
  models: NamedModel[],
  agents: NamedAgent[],
];
type IndexedModel = [
  modelIndex: number,
  totalTokens: number,
  costCents: number,
];
type IndexedAgent = [
  agentIndex: number,
  totalTokens: number,
  costCents: number,
];
type IndexedDay = [
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens: number,
  models: IndexedModel[],
  agents: IndexedAgent[],
];
type EncodedDay = [
  dayOffset: number,
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens: number,
  models: IndexedModel[],
  agents: IndexedAgent[],
];
type StoredSource =
  | {
      daily?: RawDay[] | Record<string, NamedDay | IndexedDay>;
      [period: string]: unknown;
    }
  | EncodedDay[];
type StoredReport = {
  daily?: RawDay[];
  b?: number;
  m?: string[];
  a?: string[];
  sources?: Record<string, StoredSource>;
};

type NamedSource = Record<string, NamedDay>;
type IndexedSource = EncodedDay[];

const DAY_MS = 86_400_000;
const toDayNumber = (period: string) =>
  Math.floor(Date.parse(`${period}T00:00:00Z`) / DAY_MS);
const fromDayNumber = (dayNumber: number) =>
  new Date(dayNumber * DAY_MS).toISOString().slice(0, 10);

const execFileAsync = promisify(execFile);
const dataPath = resolve(
  fileURLToPath(new URL("../data/ccusage.json", import.meta.url)),
);
const rawArgs = process.argv.slice(2);
const shouldCommit =
  !rawArgs.includes("--no-commit") && !rawArgs.includes("--dry-run");
const shouldPush = shouldCommit && !rawArgs.includes("--no-push");
const extraArgs = rawArgs.filter(
  (arg) =>
    !["--commit", "--no-commit", "--push", "--no-push", "--dry-run"].includes(
      arg,
    ),
);
const sourceId = process.env.CCUSAGE_SOURCE?.trim() || hostname() || "local";
const getTargetHomes = (): string[] => {
  const homes = new Set<string>();
  const currentHome = process.env.HOME || homedir();
  if (currentHome) homes.add(currentHome);

  if (process.env.WINDOWS_HOME && existsSync(process.env.WINDOWS_HOME)) {
    homes.add(process.env.WINDOWS_HOME);
  } else if (existsSync("/mnt/c/Users")) {
    const skip = new Set([
      "Public",
      "Default",
      "Default User",
      "All Users",
      "desktop.ini",
      "CodexSandboxOffline",
    ]);
    try {
      const entries = readdirSync("/mnt/c/Users");
      for (const entry of entries) {
        if (skip.has(entry)) continue;
        const fullPath = resolve("/mnt/c/Users", entry);
        const hasAgentLogs =
          existsSync(resolve(fullPath, ".codex")) ||
          existsSync(resolve(fullPath, ".claude")) ||
          existsSync(resolve(fullPath, ".agents")) ||
          existsSync(resolve(fullPath, ".pi"));
        if (hasAgentLogs) {
          homes.add(fullPath);
        }
      }
    } catch {
      // Ignore filesystem permission issues
    }
  }

  return [...homes];
};
const toCents = (value?: number) => Math.round((value ?? 0) * 100);
const normalizeModelName = (modelName: string) =>
  modelName.replace(/^\[[^\]]+\]\s*/, "");

const mergeModels = (models: NamedModel[]) => {
  const merged = new Map<string, NamedModel>();
  for (const [modelName, totalTokens, costCents] of models) {
    const normalizedName = normalizeModelName(modelName);
    const current = merged.get(normalizedName);
    if (current) {
      current[1] += totalTokens;
      current[2] += costCents;
    } else {
      merged.set(normalizedName, [normalizedName, totalTokens, costCents]);
    }
  }
  return [...merged.values()];
};

const normalizeRawDay = (day: RawDay): NamedDay => [
  day.inputTokens ?? 0,
  day.outputTokens ?? 0,
  day.cacheReadTokens ?? 0,
  mergeModels(
    (day.modelBreakdowns ?? []).map(
      (model): NamedModel => [
        model.modelName,
        (model.inputTokens ?? 0) +
          (model.outputTokens ?? 0) +
          (model.cacheReadTokens ?? 0) +
          (model.cacheCreationTokens ?? 0),
        toCents(model.cost),
      ],
    ),
  ),
  (day.agents ?? []).map(
    (agent): NamedAgent => [
      agent.agent,
      agent.totalTokens ?? 0,
      toCents(agent.totalCost),
    ],
  ),
];

const normalizeNamedDay = (day: NamedDay): NamedDay => [
  day[0],
  day[1],
  day[2],
  mergeModels(day[3]),
  day[4],
];

const decodeIndexedDay = (
  day: IndexedDay,
  modelNames: string[],
  agentNames: string[],
): NamedDay => [
  day[0],
  day[1],
  day[2],
  mergeModels(
    day[3].map(
      ([modelIndex, totalTokens, costCents]): NamedModel => [
        modelNames[modelIndex] ?? `model-${modelIndex}`,
        totalTokens,
        costCents,
      ],
    ),
  ),
  day[4].map(
    ([agentIndex, totalTokens, costCents]): NamedAgent => [
      agentNames[agentIndex] ?? `agent-${agentIndex}`,
      totalTokens,
      costCents,
    ],
  ),
];

const normalizeStoredDay = (
  day: RawDay | NamedDay | IndexedDay,
  indexed: boolean,
  modelNames: string[],
  agentNames: string[],
): NamedDay => {
  if (!Array.isArray(day)) return normalizeRawDay(day);
  return indexed
    ? decodeIndexedDay(day as IndexedDay, modelNames, agentNames)
    : normalizeNamedDay(day as NamedDay);
};

const normalizeSource = (
  source: StoredSource,
  indexed: boolean,
  modelNames: string[],
  agentNames: string[],
  baseDay: number,
): NamedSource => {
  if (Array.isArray(source)) {
    return Object.fromEntries(
      source.map((row) => [
        fromDayNumber(baseDay + row[0]),
        decodeIndexedDay(
          [row[1], row[2], row[3], row[4], row[5]],
          modelNames,
          agentNames,
        ),
      ]),
    );
  }

  if (Array.isArray(source.daily)) {
    return Object.fromEntries(
      source.daily.map((day) => [day.period, normalizeRawDay(day)]),
    );
  }

  const daily = source.daily;
  if (daily) {
    return Object.fromEntries(
      Object.entries(daily).map(([period, day]) => [
        period,
        normalizeStoredDay(
          day as RawDay | NamedDay | IndexedDay,
          indexed,
          modelNames,
          agentNames,
        ),
      ]),
    );
  }

  return Object.fromEntries(
    Object.entries(source).flatMap(([period, day]) =>
      period === "daily"
        ? []
        : [
            [
              period,
              normalizeStoredDay(
                day as RawDay | NamedDay | IndexedDay,
                indexed,
                modelNames,
                agentNames,
              ),
            ],
          ],
    ),
  );
};

const encodeSource = (
  source: NamedSource,
  modelIndexes: Map<string, number>,
  agentIndexes: Map<string, number>,
  baseDay: number,
): IndexedSource =>
  Object.entries(source)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([period, day]): EncodedDay => [
        toDayNumber(period) - baseDay,
        day[0],
        day[1],
        day[2],
        day[3].map(
          ([modelName, totalTokens, costCents]): IndexedModel => [
            modelIndexes.get(modelName) ?? 0,
            totalTokens,
            costCents,
          ],
        ),
        day[4].map(
          ([agent, totalTokens, costCents]): IndexedAgent => [
            agentIndexes.get(agent) ?? 0,
            totalTokens,
            costCents,
          ],
        ),
      ],
    );

async function fetchUsageForHome(homeDir: string): Promise<RawDay[]> {
  try {
    const result = await execFileAsync(
      process.execPath,
      ["x", "ccusage", "daily", "--json", "--by-agent", ...extraArgs],
      {
        encoding: "utf8",
        maxBuffer: 16 * 1024 * 1024,
        env: { ...process.env, HOME: homeDir },
      },
    );
    const parsed = JSON.parse(result.stdout) as { daily?: RawDay[] };
    return parsed.daily ?? [];
  } catch (error) {
    const details = error as NodeJS.ErrnoException & { stderr?: string };
    if (details.stderr) process.stderr.write(`${details.stderr.trim()}\n`);
    throw error;
  }
}

const currentHome = process.env.HOME || homedir();
const targetHomes = getTargetHomes();
const incomingByPeriod = new Map<string, RawDay>();

for (const homeDir of targetHomes) {
  try {
    const days = await fetchUsageForHome(homeDir);
    for (const day of days) {
      const existing = incomingByPeriod.get(day.period);
      if (!existing) {
        incomingByPeriod.set(day.period, {
          period: day.period,
          inputTokens: day.inputTokens ?? 0,
          outputTokens: day.outputTokens ?? 0,
          cacheReadTokens: day.cacheReadTokens ?? 0,
          modelBreakdowns: [...(day.modelBreakdowns ?? [])],
          agents: [...(day.agents ?? [])],
        });
      } else {
        existing.inputTokens = (existing.inputTokens ?? 0) + (day.inputTokens ?? 0);
        existing.outputTokens = (existing.outputTokens ?? 0) + (day.outputTokens ?? 0);
        existing.cacheReadTokens = (existing.cacheReadTokens ?? 0) + (day.cacheReadTokens ?? 0);
        existing.modelBreakdowns = [
          ...(existing.modelBreakdowns ?? []),
          ...(day.modelBreakdowns ?? []),
        ];
        existing.agents = [
          ...(existing.agents ?? []),
          ...(day.agents ?? []),
        ];
      }
    }
  } catch (error) {
    if (homeDir === currentHome) throw error;
  }
}

const incomingDays = [...incomingByPeriod.values()].sort((a, b) =>
  a.period.localeCompare(b.period),
);

if (incomingDays.length === 0) {
  throw new Error("ccusage returned no daily usage rows");
}

let existing: StoredReport = {};
try {
  existing = JSON.parse(await readFile(dataPath, "utf8")) as StoredReport;
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

const indexed = "m" in existing || "a" in existing;
const modelNames = existing.m ?? [];
const agentNames = existing.a ?? [];
const existingBaseDay = existing.b ?? 0;
const namedSources: Record<string, NamedSource> = Object.create(null);
for (const [id, source] of Object.entries(existing.sources ?? {})) {
  namedSources[id] = normalizeSource(
    source,
    indexed,
    modelNames,
    agentNames,
    existingBaseDay,
  );
}
if (!existing.sources && existing.daily) {
  namedSources[sourceId] = Object.fromEntries(
    existing.daily.map((day) => [day.period, normalizeRawDay(day)]),
  );
}

const currentSource = namedSources[sourceId] ?? {};
const previousPeriods = new Set(Object.keys(currentSource));
for (const day of incomingDays) {
  const normalized = normalizeRawDay(day);
  const existingDay = currentSource[day.period];
  if (!existingDay) {
    currentSource[day.period] = normalized;
  } else {
    const incomingAgentNames = new Set(normalized[4].map(([name]) => name));
    const missingExistingAgents = existingDay[4].filter(([name]) => !incomingAgentNames.has(name));
    if (missingExistingAgents.length === 0) {
      currentSource[day.period] = normalized;
    } else {
      const incomingMatchesExisting = normalized[4].every(([agentName, tokens]) => {
        const match = existingDay[4].find(([name]) => name === agentName);
        return match && match[1] === tokens;
      });
      if (!incomingMatchesExisting) {
        currentSource[day.period] = [
          normalized[0] + existingDay[0],
          normalized[1] + existingDay[1],
          normalized[2] + existingDay[2],
          mergeModels([...normalized[3], ...existingDay[3]]),
          [...normalized[4], ...missingExistingAgents],
        ];
      }
    }
  }
}
namedSources[sourceId] = currentSource;

const allModelNames = [
  ...new Set(
    Object.values(namedSources).flatMap((source) =>
      Object.values(source).flatMap((day) => day[3].map(([name]) => name)),
    ),
  ),
];
const allAgentNames = [
  ...new Set(
    Object.values(namedSources).flatMap((source) =>
      Object.values(source).flatMap((day) => day[4].map(([name]) => name)),
    ),
  ),
];
const modelIndexes = new Map(allModelNames.map((name, index) => [name, index]));
const agentIndexes = new Map(allAgentNames.map((name, index) => [name, index]));
const allPeriods = Object.values(namedSources).flatMap((source) =>
  Object.keys(source),
);
const baseDay = Math.min(...allPeriods.map(toDayNumber));
const sources = Object.fromEntries(
  Object.entries(namedSources).map(([id, source]) => [
    id,
    encodeSource(source, modelIndexes, agentIndexes, baseDay),
  ]),
);

await writeFile(
  dataPath,
  JSON.stringify({ b: baseDay, m: allModelNames, a: allAgentNames, sources }),
  "utf8",
);

const newPeriods = incomingDays.filter(
  (day) => !previousPeriods.has(day.period),
).length;
const refreshedPeriods = incomingDays.length - newPeriods;
process.stdout.write(
  `Upserted ${incomingDays.length} days from ${sourceId} across ${targetHomes.length} home(s): ${newPeriods} new, ${refreshedPeriods} refreshed, ${Object.values(namedSources).reduce((sum, source) => sum + Object.keys(source).length, 0)} stored source-days.\n`,
);

if (shouldCommit) {
  try {
    const unstaged = await execFileAsync("git", ["diff", "--name-only", dataPath], {
      encoding: "utf8",
    });
    const staged = await execFileAsync(
      "git",
      ["diff", "--cached", "--name-only", dataPath],
      { encoding: "utf8" },
    );
    const hasChanges = Boolean(unstaged.stdout.trim() || staged.stdout.trim());

    if (hasChanges) {
      await execFileAsync("git", ["add", dataPath]);
      const commitMsg =
        process.env.COMMIT_MESSAGE?.trim() ||
        `chore(ccusage): sync usage data from ${sourceId}`;
      await execFileAsync("git", ["commit", "-m", commitMsg]);
      process.stdout.write(`Committed: "${commitMsg}"\n`);

      if (shouldPush) {
        process.stdout.write(`Pushing to remote...\n`);
        await execFileAsync("git", ["push"]);
        process.stdout.write(`Pushed to remote successfully.\n`);
      }
    } else {
      process.stdout.write(`No changes in ${dataPath} to commit.\n`);
    }
  } catch (error) {
    const details = error as NodeJS.ErrnoException & { stderr?: string };
    process.stderr.write(`Git error: ${details.stderr || details.message}\n`);
    throw error;
  }
}
