// Numbers behind the charts in this post.
// Activity, tokens and cost: the agent transcripts. Milestones: git history.
// Benchmarks: XCTest on an iPhone 11 Pro Max (10 runs per app per metric) and
// adb on a Galaxy S23 Ultra (10 cold launches per app), both in the order
// Expo, native, native, Expo. Expo is the live store build (9.11.0) on both.

// Agent events per hour, Nov 11 00:00 to Nov 15 00:00, local time (UTC+7).
const lane = (segments: Array<[number, number[]]>) => {
  const hours = Array<number>(96).fill(0);
  for (const [start, values] of segments) values.forEach((v, i) => (hours[start + i] = v));
  return hours;
};

export const activity = {
  days: ["Nov 11", "Nov 12", "Nov 13", "Nov 14"],
  marker: { hour: 93.58, label: "submitted" },
  lanes: [
    { label: "iOS · Codex", detail: "3.2 h", hours: lane([[11, [271, 79, 0, 269, 332, 138, 9]]]) },
    {
      label: "iOS · Claude Code",
      detail: "12.4 h",
      hours: lane([
        [17, [165, 133, 136, 320, 352, 131, 132, 103, 69, 8]],
        [39, [27, 56, 200, 26, 60]],
        [57, [203, 177, 271, 103, 204, 171, 188]],
        [75, [35, 72]],
      ]),
    },
    { label: "Android", detail: "8.6 h", hours: lane([[63, [205, 10]], [68, [7, 244, 151, 339, 430, 281, 291, 270, 221, 320, 36]]]) },
    {
      label: "Merge + release",
      detail: "13.9 h · 19 sub-agents",
      hours: lane([[78, [918, 496, 571, 172, 324, 187, 251, 343, 162, 277, 689, 24, 0, 336, 285, 332]]]),
    },
  ],
};

export const benchmarks = [
  {
    name: "iPhone 11 Pro Max",
    note: "App Store build vs native · 10 runs each",
    rows: [
      { label: "Memory on Home", expo: 82.15, native: 48.16, unit: "MB", digits: 0 },
      { label: "Memory while scrolling", expo: 101.67, native: 66.55, unit: "MB", digits: 0 },
      { label: "Back from background", expo: 0.31, native: 0.256, unit: "s", digits: 2 },
      { label: "Open a law", expo: 1.078, native: 1.059, unit: "s", digits: 2 },
      { label: "Launch", expo: 0.271, native: 0.368, unit: "s", digits: 2 },
    ],
  },
  {
    name: "Galaxy S23 Ultra",
    note: "Play Store build vs native · 10 cold launches",
    rows: [
      { label: "Memory after launch", expo: 397.1, native: 169.1, unit: "MB", digits: 0 },
      { label: "Cold launch", expo: 364, native: 246, unit: "ms", digits: 0 },
      { label: "Installed size", expo: 56.2, native: 3.6, unit: "MB", digits: 1 },
    ],
  },
];

export const cost = [
  { label: "iOS port", hours: 12.4, tokens: "304M", cost: 118.31 },
  { label: "Android port", hours: 8.6, tokens: "293M", cost: 114.56 },
  { label: "Merge + release", hours: 13.9, tokens: "757M", cost: 292.79 },
  { label: "Prompt tightening", hours: 0.3, tokens: "2M", cost: 2.3 },
];
