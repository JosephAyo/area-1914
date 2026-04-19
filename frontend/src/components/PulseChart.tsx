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

interface ChartDataPoint extends PageviewEntry {
  dateFormatted: string;
}

type Timeframe = "30d" | "1y" | "all";

interface PulseChartProps {
  pageviews?: PageviewEntry[];
}

export function PulseChart({ pageviews = [] }: PulseChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("30d");

  // Format the dates and ensure views is an integer
  const chartData = useMemo<ChartDataPoint[]>(() => {
    // Sort ascending to ensure chronological order
    const sorted = [...pageviews].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Apply timeframe filter using actual date logic to prevent spanning extra years
    let filtered = sorted;
    if (sorted.length > 0) {
      const maxDate = new Date(sorted[sorted.length - 1].date);

      if (timeframe === "30d") {
        const threshold = new Date(maxDate);
        threshold.setDate(threshold.getDate() - 30);
        filtered = sorted.filter((d) => new Date(d.date) >= threshold);
      } else if (timeframe === "1y") {
        const threshold = new Date(maxDate);
        threshold.setFullYear(threshold.getFullYear() - 1);
        filtered = sorted.filter((d) => new Date(d.date) >= threshold);
      }
    }
    return filtered.map((d) => ({
      ...d,
      dateFormatted: new Date(d.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "2-digit",
      }),
      views: Number(d.views),
    }));
  }, [pageviews, timeframe]);

  if (chartData.length === 0) {
    return <div className={styles.emptyChart}>No pulse data available.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          {timeframe === "30d"
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
              dataKey="views"
              stroke="var(--accent-primary)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorViews)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
