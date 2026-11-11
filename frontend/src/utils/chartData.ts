import type { PageviewEntry } from "../types/index";
export type Timeframe = "30d" | "90d" | "1y" | "all";
export interface ChartDataPoint {
  date: string;
  primaryViews: number | null;
  comparisonViews?: number | null;
}
const DAY = 86_400_000;
function validRecords(entries: PageviewEntry[]) {
  return new Map(
    entries
      .filter(
        (entry) =>
          /^\d{4}-\d{2}-\d{2}$/.test(entry.date) &&
          Number.isFinite(Date.parse(entry.date)) &&
          new Date(entry.date).toISOString().slice(0, 10) === entry.date &&
          Number.isFinite(entry.views) &&
          entry.views >= 0,
      )
      .map((entry) => [entry.date, entry.views]),
  );
}
export function buildChartData(
  primary: PageviewEntry[],
  comparison: PageviewEntry[] | undefined,
  timeframe: Timeframe,
): ChartDataPoint[] {
  const first = validRecords(primary);
  const second = validRecords(comparison || []);
  const dates = [...first.keys(), ...second.keys()].sort();
  if (!dates.length) return [];
  const end = Date.parse(dates[dates.length - 1]);
  let start = Date.parse(dates[0]);
  if (timeframe === "30d" || timeframe === "90d")
    start = Math.max(start, end - (timeframe === "30d" ? 29 : 89) * DAY);
  if (timeframe === "1y") {
    const cutoff = new Date(end);
    const originalMonth = cutoff.getUTCMonth();
    cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 1);
    // Clamp 29 February to 28 February in the previous year before advancing
    // to the first included day, instead of rolling into 1 March twice.
    if (cutoff.getUTCMonth() !== originalMonth) cutoff.setUTCDate(0);
    cutoff.setUTCDate(cutoff.getUTCDate() + 1);
    start = Math.max(start, cutoff.getTime());
  }
  const points: ChartDataPoint[] = [];
  for (let time = start; time <= end; time += DAY) {
    const date = new Date(time).toISOString().slice(0, 10);
    points.push({
      date,
      primaryViews: first.get(date) ?? null,
      ...(comparison !== undefined
        ? { comparisonViews: second.get(date) ?? null }
        : {}),
    });
  }
  return points;
}
export function formatChartDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}
export function summarizeSeries(
  points: ChartDataPoint[],
  key: "primaryViews" | "comparisonViews",
) {
  const values = points
    .map((point) => point[key])
    .filter((value): value is number => typeof value === "number");
  return {
    recordedDays: values.length,
    total: values.reduce((sum, value) => sum + value, 0),
  };
}
