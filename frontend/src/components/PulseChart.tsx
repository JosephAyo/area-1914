import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import styles from "./PulseChart.module.scss";
import { useMemo, useState } from "react";
import type { PageviewEntry } from "../types/index";

interface ChartDataPoint {
  date: string;
  dateFormatted: string;
  primaryViews: number;
  comparisonViews?: number;
}

type Timeframe = "30d" | "1y" | "all";

interface PulseChartProps {
  pageviews?: PageviewEntry[];
  title?: string;
  comparisonPageviews?: PageviewEntry[];
  comparisonTitle?: string;
}

const PRIMARY_COLOR = "var(--accent-primary)";
const COMPARISON_COLOR = "#f59e0b";

export function PulseChart({
  pageviews = [],
  title,
  comparisonPageviews,
  comparisonTitle,
}: PulseChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("30d");
  const hasComparison = !!comparisonPageviews?.length;

  // Format the dates and ensure views is an integer
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const sortedPrimary = [...pageviews].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const sortedComparison = [...(comparisonPageviews || [])].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const allDates = [...sortedPrimary, ...sortedComparison];

    if (allDates.length === 0) {
      return [];
    }

    const primaryByDate = new Map(
      sortedPrimary.map((entry) => [entry.date, Number(entry.views)]),
    );
    const comparisonByDate = new Map(
      sortedComparison.map((entry) => [entry.date, Number(entry.views)]),
    );
    const dateKeys = Array.from(
      new Set(allDates.map((entry) => entry.date)),
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    let filteredDates = dateKeys;
    const maxDate = new Date(dateKeys[dateKeys.length - 1]);

    if (timeframe === "30d") {
      const threshold = new Date(maxDate);
      threshold.setDate(threshold.getDate() - 30);
      filteredDates = dateKeys.filter((date) => new Date(date) >= threshold);
    } else if (timeframe === "1y") {
      const threshold = new Date(maxDate);
      threshold.setFullYear(threshold.getFullYear() - 1);
      filteredDates = dateKeys.filter((date) => new Date(date) >= threshold);
    }

    return filteredDates.map((date) => ({
      date,
      dateFormatted: new Date(date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "2-digit",
      }),
      primaryViews: primaryByDate.get(date) || 0,
      comparisonViews: hasComparison
        ? comparisonByDate.get(date) || 0
        : undefined,
    }));
  }, [comparisonPageviews, hasComparison, pageviews, timeframe]);

  if (chartData.length === 0) {
    return <div className={styles.emptyChart}>No pulse data available.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          {hasComparison
            ? "Pulse Comparison"
            : timeframe === "30d"
              ? "30-Day Pulse"
              : timeframe === "1y"
                ? "1-Year Pulse"
                : "Historical Pulse"}
        </h2>
        <div className={styles.toggles}>
          <button
            className={timeframe === "30d" ? styles.active : ""}
            onClick={() => setTimeframe("30d")}
          >
            30 Days
          </button>
          <button
            className={timeframe === "1y" ? styles.active : ""}
            onClick={() => setTimeframe("1y")}
          >
            1 Year
          </button>
          <button
            className={timeframe === "all" ? styles.active : ""}
            onClick={() => setTimeframe("all")}
          >
            Max
          </button>
        </div>
      </div>
      <div className={styles.legend}>
        <span>
          <i style={{ background: PRIMARY_COLOR }} />
          {title || "Topic"}
        </span>
        {hasComparison && (
          <span>
            <i style={{ background: COMPARISON_COLOR }} />
            {comparisonTitle || "Comparison"}
          </span>
        )}
      </div>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--accent-primary)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--accent-primary)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id="colorComparisonViews"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--glass-border)"
              vertical={false}
            />
            <XAxis
              dataKey="dateFormatted"
              stroke="var(--text-secondary)"
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              tickMargin={10}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="var(--text-secondary)"
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val: number) =>
                val >= 1000 ? `${(val / 1000).toFixed(1)}k` : String(val)
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-color)",
                borderColor: "var(--glass-border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
              }}
              itemStyle={{ color: "var(--accent-primary)" }}
            />
            <Area
              type="monotone"
              dataKey="primaryViews"
              name={title || "Topic"}
              stroke={PRIMARY_COLOR}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorViews)"
            />
            {hasComparison && (
              <Area
                type="monotone"
                dataKey="comparisonViews"
                name={comparisonTitle || "Comparison"}
                stroke={COMPARISON_COLOR}
                strokeDasharray="6 4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorComparisonViews)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className={styles.disclaimer}>
        * Based on Wikipedia pageviews. Data may contain inaccuracies or missing
        periods.
      </p>
    </div>
  );
}
