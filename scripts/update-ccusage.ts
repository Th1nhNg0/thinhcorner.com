import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { hostname } from "node:os";
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
const extraArgs = process.argv.slice(2);
const sourceId = process.env.CCUSAGE_SOURCE?.trim() || hostname() || "local";
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

let output: string;
try {
  const result = await execFileAsync(
    process.execPath,
    ["x", "ccusage", "daily", "--json", "--by-agent", ...extraArgs],
    { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
  );
  output = result.stdout;
} catch (error) {
  const details = error as NodeJS.ErrnoException & { stderr?: string };
  if (details.stderr) process.stderr.write(`${details.stderr.trim()}\n`);
  throw error;
}

let incoming: { daily?: RawDay[] };
try {
  incoming = JSON.parse(output) as { daily?: RawDay[] };
} catch {
  throw new Error("ccusage did not return valid JSON");
}

const incomingDays = incoming.daily ?? [];
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
  currentSource[day.period] = normalizeRawDay(day);
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
  `Upserted ${incomingDays.length} days from ${sourceId}: ${newPeriods} new, ${refreshedPeriods} refreshed, ${Object.values(namedSources).reduce((sum, source) => sum + Object.keys(source).length, 0)} stored source-days.\n`,
);
