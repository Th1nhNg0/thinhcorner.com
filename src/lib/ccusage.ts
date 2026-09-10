/**
 * Aggregation layer for ccusage exports (see scripts/update-ccusage.ts).
 *
 * The stored file is a compact, index-encoded snapshot:
 *   { b: baseDayNumber, m: modelNames[], a: agentNames[], sources: { [source]: rows[] } }
 * where each row is [dayOffset, input, output, cacheRead, models[], agents[]] and
 * models/agents are [index, totalTokens, costCents] triples.
 *
 * Important subtlety: a model's totalTokens includes cache *creation* (write)
 * tokens, but the day-level split only stores input/output/cacheRead. We therefore
 * keep the model-derived total as the authoritative token count and treat the
 * difference as `cacheWriteTokens` so the token mix adds up to 100%.
 */

export type UsageSnapshot = {
  /** Base day number (days since epoch) that all row offsets are relative to. */
  b?: number;
  /** Model name dictionary referenced by index from each row. */
  m?: string[];
  /** Agent name dictionary referenced by index from each row. */
  a?: string[];
  /** Encoded day rows, keyed by the machine that produced them. */
  sources?: Record<string, CompactDay[]>;
};

/** [dayOffset, inputTokens, outputTokens, cacheReadTokens, models, agents] */
type CompactDay = [
  dayOffset: number,
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens: number,
  models: Array<[modelIndex: number, totalTokens: number, costCents: number]>,
  agents: Array<[agentIndex: number, totalTokens: number, costCents: number]>,
];

export type ModelTotal = {
  modelName: string;
  totalTokens: number;
  cost: number;
  /** Share of all tokens, 0–1. */
  tokenShare: number;
  /** Share of total cost, 0–1. */
  costShare: number;
  /** Blended cost per million tokens. */
  costPerMillion: number;
  /** Days this model recorded usage on. */
  activeDays: number;
};

export type AgentTotal = {
  agent: string;
  activeDays: number;
  totalTokens: number;
  totalCost: number;
  tokenShare: number;
  costShare: number;
  costPerMillion: number;
};

export type TokenSlice = {
  key: "cacheRead" | "cacheWrite" | "input" | "output";
  label: string;
  value: number;
  color: string;
  /** Blended cost per million tokens for this slice. */
  costPerMillion: number;
  /** Total estimated cost attributed to this slice at blended pricing. */
  cost: number;
  /** Share of total tokens, 0–1. */
  share: number;
};

export type DailyUsage = {
  period: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  totalTokens: number;
  totalCost: number;
  models: Array<{ modelName: string; totalTokens: number; cost: number }>;
  agents: Array<{ agent: string; totalTokens: number; totalCost: number }>;
};

export type UsageReport = {
  days: DailyUsage[];
  /** Days with any recorded usage — the denominator for per-day averages. */
  activeDayCount: number;
  firstPeriod: string;
  lastPeriod: string;
  /** Whole days between the last period and today; 0 means caught up. */
  daysStale: number;
  totals: {
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
    totalTokens: number;
    totalCost: number;
  };
  averageTokensPerDay: number;
  averageCostPerDay: number;
  /** Blended cost per million tokens across the whole report. */
  costPerMillion: number;
  /** Output tokens as a share of all tokens — the "real work" ratio. */
  outputShare: number;
  tokenMix: TokenSlice[];
  models: ModelTotal[];
  agents: AgentTotal[];
  /** Median day, by tokens. Used to pick a sane chart scale. */
  medianTokensPerDay: number;
};

const DAY_MS = 86_400_000;

/** Token type colors, keyed to the shared chart palette. */
export const TOKEN_COLORS = {
  cacheRead: "#a78bfa",
  cacheWrite: "#6366f1",
  input: "#eab308",
  output: "#38bdf8",
} as const;

const fromDayNumber = (dayNumber: number) =>
  new Date(dayNumber * DAY_MS).toISOString().slice(0, 10);

const safeDivide = (numerator: number, denominator: number) =>
  denominator > 0 ? numerator / denominator : 0;

/** Strips the `[provider] model` prefix ccusage writes for routed models. */
export const normalizeModelName = (modelName: string) =>
  modelName.replace(/^\[[^\]]+\]\s*/, "");

/** Parses the compact snapshot into a fully aggregated, share-annotated report. */
export function buildUsageReport(
  snapshot: UsageSnapshot,
  today: Date = new Date(),
): UsageReport {
  const modelNames = snapshot.m ?? [];
  const agentNames = snapshot.a ?? [];
  const baseDay = snapshot.b ?? 0;

  const daysByPeriod = new Map<string, DailyUsage>();

  for (const rows of Object.values(snapshot.sources ?? {})) {
    for (const row of rows) {
      const [
        dayOffset,
        inputTokens,
        outputTokens,
        cacheReadTokens,
        compactModels,
        compactAgents,
      ] = row;
      const period = fromDayNumber(baseDay + dayOffset);

      const models = compactModels.map(([modelIndex, totalTokens, costCents]) => ({
        modelName: normalizeModelName(modelNames[modelIndex] ?? `model-${modelIndex}`),
        totalTokens,
        cost: costCents / 100,
      }));
      // NOTE: agent triples are [agentIndex, totalTokens, costCents] — same order
      // as the model triples. scripts/update-ccusage.ts decodes these two fields
      // the other way round (see decodeIndexedDay), but the stored numbers only
      // reconcile as tokens-then-cents, so we follow the data.
      const agents = compactAgents.map(([agentIndex, totalTokens, costCents]) => ({
        agent: agentNames[agentIndex] ?? `agent-${agentIndex}`,
        totalTokens,
        totalCost: costCents / 100,
      }));

      // Model totals are authoritative: they include cache writes, which the
      // day-level split does not carry.
      const totalTokens = models.reduce((sum, model) => sum + model.totalTokens, 0);
      const totalCost = models.reduce((sum, model) => sum + model.cost, 0);
      const splitTotal = inputTokens + outputTokens + cacheReadTokens;

      const day: DailyUsage = {
        period,
        inputTokens,
        outputTokens,
        cacheReadTokens,
        cacheWriteTokens: Math.max(0, totalTokens - splitTotal),
        totalTokens,
        totalCost,
        models,
        agents,
      };

      const current = daysByPeriod.get(period);
      if (!current) {
        daysByPeriod.set(period, day);
        continue;
      }

      // Several machines can share a period. Counts and costs sum; per-model and
      // per-agent rows concatenate so the reducers below merge them by name.
      current.inputTokens += day.inputTokens;
      current.outputTokens += day.outputTokens;
      current.cacheReadTokens += day.cacheReadTokens;
      current.cacheWriteTokens += day.cacheWriteTokens;
      current.totalTokens += day.totalTokens;
      current.totalCost += day.totalCost;
      current.models.push(...day.models);
      current.agents.push(...day.agents);
    }
  }

  const days = [...daysByPeriod.values()].sort((a, b) =>
    a.period.localeCompare(b.period),
  );

  const totals = days.reduce(
    (sum, day) => {
      sum.inputTokens += day.inputTokens;
      sum.outputTokens += day.outputTokens;
      sum.cacheReadTokens += day.cacheReadTokens;
      sum.cacheWriteTokens += day.cacheWriteTokens;
      sum.totalTokens += day.totalTokens;
      sum.totalCost += day.totalCost;
      return sum;
    },
    {
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      totalTokens: 0,
      totalCost: 0,
    },
  );

  const activeDayCount = days.length;
  const firstPeriod = days[0]?.period ?? "";
  const lastPeriod = days[activeDayCount - 1]?.period ?? "";
  const costPerMillion = safeDivide(totals.totalCost, totals.totalTokens / 1e6);

  const daysStale = lastPeriod
    ? Math.max(
        0,
        Math.floor(
          (Date.parse(`${today.toISOString().slice(0, 10)}T00:00:00Z`) -
            Date.parse(`${lastPeriod}T00:00:00Z`)) /
            DAY_MS,
        ),
      )
    : 0;

  const tokenMix: TokenSlice[] = (
    [
      {
        key: "cacheRead",
        label: "Cache read",
        value: totals.cacheReadTokens,
        color: TOKEN_COLORS.cacheRead,
      },
      {
        key: "cacheWrite",
        label: "Cache write",
        value: totals.cacheWriteTokens,
        color: TOKEN_COLORS.cacheWrite,
      },
      {
        key: "input",
        label: "Input",
        value: totals.inputTokens,
        color: TOKEN_COLORS.input,
      },
      {
        key: "output",
        label: "Output",
        value: totals.outputTokens,
        color: TOKEN_COLORS.output,
      },
    ] satisfies Array<Omit<TokenSlice, "costPerMillion" | "cost" | "share">>
  ).map((slice) => ({
    ...slice,
    // The export carries cost per model, not per token type, so per-type cost is
    // attributed at the report's blended rate. Directionally useful, not an invoice.
    costPerMillion,
    cost: (slice.value / 1e6) * costPerMillion,
    share: safeDivide(slice.value, totals.totalTokens),
  }));

  // --- Models -------------------------------------------------------------
  const modelAccumulators = new Map<
    string,
    { totalTokens: number; cost: number; days: Set<string> }
  >();
  for (const day of days) {
    for (const model of day.models) {
      const current = modelAccumulators.get(model.modelName) ?? {
        totalTokens: 0,
        cost: 0,
        days: new Set<string>(),
      };
      current.totalTokens += model.totalTokens;
      current.cost += model.cost;
      current.days.add(day.period);
      modelAccumulators.set(model.modelName, current);
    }
  }
  const models: ModelTotal[] = [...modelAccumulators.entries()]
    .map(([modelName, acc]) => ({
      modelName,
      totalTokens: acc.totalTokens,
      cost: acc.cost,
      tokenShare: safeDivide(acc.totalTokens, totals.totalTokens),
      costShare: safeDivide(acc.cost, totals.totalCost),
      costPerMillion: safeDivide(acc.cost, acc.totalTokens / 1e6),
      activeDays: acc.days.size,
    }))
    .sort((a, b) => b.totalTokens - a.totalTokens);

  // --- Agents -------------------------------------------------------------
  const agentAccumulators = new Map<
    string,
    { totalTokens: number; totalCost: number; days: Set<string> }
  >();
  for (const day of days) {
    for (const agent of day.agents) {
      const current = agentAccumulators.get(agent.agent) ?? {
        totalTokens: 0,
        totalCost: 0,
        days: new Set<string>(),
      };
      current.totalTokens += agent.totalTokens;
      current.totalCost += agent.totalCost;
      current.days.add(day.period);
      agentAccumulators.set(agent.agent, current);
    }
  }
  const agents: AgentTotal[] = [...agentAccumulators.entries()]
    .map(([agent, acc]) => ({
      agent,
      activeDays: acc.days.size,
      totalTokens: acc.totalTokens,
      totalCost: acc.totalCost,
      tokenShare: safeDivide(acc.totalTokens, totals.totalTokens),
      costShare: safeDivide(acc.totalCost, totals.totalCost),
      costPerMillion: safeDivide(acc.totalCost, acc.totalTokens / 1e6),
    }))
    .sort((a, b) => b.totalTokens - a.totalTokens);

  const sortedTokenValues = [...days]
    .map((day) => day.totalTokens)
    .sort((a, b) => a - b);
  const medianTokensPerDay =
    sortedTokenValues[Math.floor(sortedTokenValues.length / 2)] ?? 0;

  return {
    days,
    activeDayCount,
    firstPeriod,
    lastPeriod,
    daysStale,
    totals,
    averageTokensPerDay: activeDayCount
      ? Math.round(totals.totalTokens / activeDayCount)
      : 0,
    averageCostPerDay: activeDayCount ? totals.totalCost / activeDayCount : 0,
    costPerMillion,
    outputShare: safeDivide(totals.outputTokens, totals.totalTokens),
    tokenMix,
    models,
    agents,
    medianTokensPerDay,
  };
}

/**
 * Calendar cells covering only the weeks the data actually spans, padded out to
 * whole Sun–Sat weeks. A fixed 52-week grid wastes most of its cells on an
 * export that is only a few months old.
 */
export function buildCalendar(report: UsageReport): string[][] {
  if (!report.lastPeriod) return [];

  const start = new Date(`${report.firstPeriod}T00:00:00Z`);
  // Back up to the Sunday that begins the first week.
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());

  const end = new Date(`${report.lastPeriod}T00:00:00Z`);
  // Forward to the Saturday that ends the last week.
  end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));

  const weeks: string[][] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const week: string[] = [];
    for (let index = 0; index < 7; index += 1) {
      week.push(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

/**
 * Quantile thresholds over active days only — including zero-token days would
 * collapse every populated cell into the top bucket.
 */
export function buildIntensityThresholds(days: DailyUsage[]): number[] {
  const values = days
    .map((day) => day.totalTokens)
    .filter((value) => value > 0)
    .sort((a, b) => a - b);

  if (values.length === 0) return [1, 1, 1];

  const quantile = (position: number) =>
    values[Math.min(values.length - 1, Math.floor((values.length - 1) * position))];

  return [quantile(0.25), quantile(0.5), quantile(0.75)];
}

/** Maps a day's token volume onto one of five intensity buckets (0 = no usage). */
export function usageLevel(value: number, thresholds: number[]): number {
  if (value <= 0) return 0;
  if (value >= thresholds[2]) return 4;
  if (value >= thresholds[1]) return 3;
  if (value >= thresholds[0]) return 2;
  return 1;
}

/** Colour per stacked model series, ordered so neighbouring bands contrast. */
export const MODEL_STACK_COLORS = [
  "#eab308", // amber
  "#a78bfa", // violet
  "#38bdf8", // sky
  "#4ade80", // green
  "#f472b6", // pink
  "#2dd4bf", // teal
] as const;

/** Neutral colour for the grouped remainder of low-volume models. */
export const MODEL_OTHER_COLOR = "#3f3f46";

export type StackSeries = {
  modelName: string;
  color: string;
  cost: number;
  totalTokens: number;
  /** Days this model recorded usage on. */
  activeDays: number;
  costShare: number;
};

export type StackDay = {
  period: string;
  totalCost: number;
  totalTokens: number;
  /** Per-series cost, aligned index-for-index with `series`. */
  costs: number[];
  /** Per-series tokens, aligned index-for-index with `series`. */
  tokens: number[];
};

export type DailyStack = {
  series: StackSeries[];
  days: StackDay[];
  /** Largest single-day cost, i.e. the full height of the chart. */
  maxDayCost: number;
};

/**
 * Builds a per-day, per-model cost breakdown for a stacked chart.
 *
 * Only active days are included, so the x-axis is a sequence of working days
 * rather than true calendar time — the calendar heatmap covers gaps separately.
 *
 * Stacked bars must sum to the bar height, which rules out a log scale. Cost is
 * the metric that survives that constraint: on a linear scale the median day
 * renders at ~16px of a 112px track, where a token-based stack would leave 41
 * of 71 days under 2px because cache traffic makes token volume far spikier.
 */
export function buildDailyStack(report: UsageReport, topN = 6): DailyStack {
  const totalsByModel = new Map<
    string,
    { cost: number; totalTokens: number; days: Set<string> }
  >();

  for (const day of report.days) {
    for (const model of day.models) {
      const current = totalsByModel.get(model.modelName) ?? {
        cost: 0,
        totalTokens: 0,
        days: new Set<string>(),
      };
      current.cost += model.cost;
      current.totalTokens += model.totalTokens;
      current.days.add(day.period);
      totalsByModel.set(model.modelName, current);
    }
  }

  const ranked = [...totalsByModel.entries()]
    .map(([modelName, acc]) => ({ modelName, ...acc }))
    .filter((entry) => entry.cost > 0)
    .sort((a, b) => b.cost - a.cost);

  const named = ranked.slice(0, topN);
  const seriesKeys = [...named.map((entry) => entry.modelName), "Other"];

  const totalCost = ranked.reduce((sum, entry) => sum + entry.cost, 0);
  const series: StackSeries[] = [...named, undefined].map((entry, index) => {
    const isOther = index >= named.length;
    const otherAcc = isOther
      ? ranked
          .slice(topN)
          .reduce(
            (acc, item) => ({
              cost: acc.cost + item.cost,
              totalTokens: acc.totalTokens + item.totalTokens,
              days: acc.days + item.days.size,
            }),
            { cost: 0, totalTokens: 0, days: 0 },
          )
      : null;

    return {
      modelName: isOther ? "Other" : (entry?.modelName ?? ""),
      color: isOther
        ? MODEL_OTHER_COLOR
        : (MODEL_STACK_COLORS[index] ?? MODEL_OTHER_COLOR),
      cost: otherAcc ? otherAcc.cost : (entry?.cost ?? 0),
      totalTokens: otherAcc ? otherAcc.totalTokens : (entry?.totalTokens ?? 0),
      activeDays: otherAcc ? otherAcc.days : (entry?.days.size ?? 0),
      costShare: totalCost > 0 ? (otherAcc ? otherAcc.cost : (entry?.cost ?? 0)) / totalCost : 0,
    };
  });

  const days: StackDay[] = report.days.map((day) => {
    const costs = new Array<number>(series.length).fill(0);
    const tokens = new Array<number>(series.length).fill(0);

    for (const model of day.models) {
      const index = seriesKeys.indexOf(model.modelName);
      const target = index === -1 ? series.length - 1 : index;
      costs[target] = (costs[target] ?? 0) + model.cost;
      tokens[target] = (tokens[target] ?? 0) + model.totalTokens;
    }

    return {
      period: day.period,
      totalCost: day.totalCost,
      totalTokens: day.totalTokens,
      costs,
      tokens,
    };
  });

  return {
    series,
    days,
    maxDayCost: Math.max(...days.map((day) => day.totalCost), 0),
  };
}
