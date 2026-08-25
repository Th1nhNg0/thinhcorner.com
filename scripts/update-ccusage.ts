import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { hostname } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

type ModelBreakdown = {
  modelName: string;
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
  [key: string]: unknown;
};

type UsageAgent = {
  agent: string;
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalCost?: number;
  totalTokens?: number;
  modelBreakdowns?: ModelBreakdown[];
  modelsUsed?: string[];
  [key: string]: unknown;
};

type UsageNumericRow = {
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
  totalCost?: number;
  totalTokens?: number;
};

type UsageMetadata = {
  agents?: string[];
  [key: string]: unknown;
};

type UsageDay = {
  period: string;
  agent?: string;
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalCost?: number;
  totalTokens?: number;
  agents?: UsageAgent[];
  metadata?: UsageMetadata;
  modelBreakdowns?: ModelBreakdown[];
  modelsUsed?: string[];
  [key: string]: unknown;
};

type SourceReport = {
  daily?: UsageDay[];
  [key: string]: unknown;
};

type UsageReport = {
  daily?: UsageDay[];
  totals?: Record<string, number>;
  sources?: Record<string, SourceReport>;
  [key: string]: unknown;
};

type UsageTotals = {
  cacheCreationTokens: number;
  cacheReadTokens: number;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  totalTokens: number;
};

const execFileAsync = promisify(execFile);
const dataPath = resolve(
  fileURLToPath(new URL("../data/ccusage.json", import.meta.url)),
);
const extraArgs = process.argv.slice(2);
const sourceId = process.env.CCUSAGE_SOURCE?.trim() || hostname() || "local";

const sumField = (rows: UsageNumericRow[], field: keyof UsageNumericRow) =>
  rows.reduce((sum, row) => sum + (row[field] ?? 0), 0);

const uniqueStrings = (values: Array<string | undefined>) => [
  ...new Set(values.filter((value): value is string => Boolean(value))),
];

const mergeModelBreakdowns = (rows: ModelBreakdown[]) => {
  const groups = new Map<string, ModelBreakdown[]>();
  for (const row of rows) {
    const group = groups.get(row.modelName) ?? [];
    group.push(row);
    groups.set(row.modelName, group);
  }

  return [...groups.entries()].map(([modelName, group]) => ({
    ...group[0],
    modelName,
    cacheCreationTokens: sumField(group, "cacheCreationTokens"),
    cacheReadTokens: sumField(group, "cacheReadTokens"),
    inputTokens: sumField(group, "inputTokens"),
    outputTokens: sumField(group, "outputTokens"),
    cost: sumField(group, "cost"),
  }));
};

const mergeAgents = (rows: UsageAgent[]) => {
  const groups = new Map<string, UsageAgent[]>();
  for (const row of rows) {
    const group = groups.get(row.agent) ?? [];
    group.push(row);
    groups.set(row.agent, group);
  }

  return [...groups.entries()].map(([agent, group]) => ({
    ...group[0],
    agent,
    cacheCreationTokens: sumField(group, "cacheCreationTokens"),
    cacheReadTokens: sumField(group, "cacheReadTokens"),
    inputTokens: sumField(group, "inputTokens"),
    outputTokens: sumField(group, "outputTokens"),
    totalCost: sumField(group, "totalCost"),
    totalTokens: sumField(group, "totalTokens"),
    modelBreakdowns: mergeModelBreakdowns(
      group.flatMap((row) => row.modelBreakdowns ?? []),
    ),
    modelsUsed: uniqueStrings(group.flatMap((row) => row.modelsUsed ?? [])),
  }));
};

const aggregateDay = (period: string, rows: UsageDay[]): UsageDay => {
  const first = rows[0];
  if (!first)
    throw new Error(`Cannot aggregate an empty day group for ${period}`);

  const agents = mergeAgents(rows.flatMap((row) => row.agents ?? []));
  const agentNames = agents.map((agent) => agent.agent);
  const metadata: UsageMetadata = { ...first.metadata };
  if (agentNames.length > 0) metadata.agents = agentNames;

  return {
    ...first,
    period,
    agent: "all",
    cacheCreationTokens: sumField(rows, "cacheCreationTokens"),
    cacheReadTokens: sumField(rows, "cacheReadTokens"),
    inputTokens: sumField(rows, "inputTokens"),
    outputTokens: sumField(rows, "outputTokens"),
    totalCost: sumField(rows, "totalCost"),
    totalTokens: sumField(rows, "totalTokens"),
    agents,
    metadata,
    modelBreakdowns: mergeModelBreakdowns(
      rows.flatMap((row) => row.modelBreakdowns ?? []),
    ),
    modelsUsed: uniqueStrings(rows.flatMap((row) => row.modelsUsed ?? [])),
  };
};

const upsertDays = (existingDays: UsageDay[], incomingDays: UsageDay[]) => {
  const daysByPeriod = new Map<string, UsageDay>();
  for (const day of existingDays) daysByPeriod.set(day.period, day);
  for (const day of incomingDays) daysByPeriod.set(day.period, day);
  return [...daysByPeriod.values()].sort((a, b) =>
    a.period.localeCompare(b.period),
  );
};

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

let incoming: UsageReport;
try {
  incoming = JSON.parse(output) as UsageReport;
} catch {
  throw new Error("ccusage did not return valid JSON");
}

const incomingDays = incoming.daily ?? [];
if (incomingDays.length === 0) {
  throw new Error("ccusage returned no daily usage rows");
}

let existing: UsageReport = { daily: [] };
try {
  existing = JSON.parse(await readFile(dataPath, "utf8")) as UsageReport;
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

const sources = { ...existing.sources };
if (!existing.sources && (existing.daily ?? []).length > 0) {
  // The first source-aware run migrates the old single-source snapshot.
  sources[sourceId] = { daily: existing.daily };
}

const previousSourceDays = sources[sourceId]?.daily ?? [];
sources[sourceId] = {
  ...sources[sourceId],
  daily: upsertDays(previousSourceDays, incomingDays),
};

const rowsByPeriod = new Map<string, UsageDay[]>();
for (const source of Object.values(sources)) {
  for (const day of source.daily ?? []) {
    const rows = rowsByPeriod.get(day.period) ?? [];
    rows.push(day);
    rowsByPeriod.set(day.period, rows);
  }
}

const daily = [...rowsByPeriod.entries()]
  .map(([period, rows]) => aggregateDay(period, rows))
  .sort((a, b) => a.period.localeCompare(b.period));

const totals: UsageTotals = {
  cacheCreationTokens: sumField(daily, "cacheCreationTokens"),
  cacheReadTokens: sumField(daily, "cacheReadTokens"),
  inputTokens: sumField(daily, "inputTokens"),
  outputTokens: sumField(daily, "outputTokens"),
  totalCost: sumField(daily, "totalCost"),
  totalTokens: sumField(daily, "totalTokens"),
};

const merged: UsageReport = {
  ...existing,
  ...incoming,
  sources,
  daily,
  totals,
};

await writeFile(dataPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");

const previousPeriods = new Set(previousSourceDays.map((day) => day.period));
const newPeriods = incomingDays.filter(
  (day) => !previousPeriods.has(day.period),
).length;
const refreshedPeriods = incomingDays.length - newPeriods;
process.stdout.write(
  `Upserted ${incomingDays.length} days from ${sourceId}: ${newPeriods} new, ${refreshedPeriods} refreshed, ${daily.length} aggregated total.\n`,
);
