import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useMemo, useState, useId } from "react";
import type { PageviewEntry } from "../types/index";
import {
  buildChartData,
  formatChartDate,
  summarizeSeries,
} from "../utils/chartData";
import type { Timeframe } from "../utils/chartData";
import styles from "./PulseChart.module.scss";
interface PulseChartProps {
  pageviews?: PageviewEntry[];
  title?: string;
  comparisonPageviews?: PageviewEntry[];
  comparisonTitle?: string;
}
export function PulseChart({
  pageviews = [],
  title = "Subject",
  comparisonPageviews,
  comparisonTitle = "Comparison",
}: PulseChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("30d");
  const [showTable, setShowTable] = useState(false);
  const id = useId();
  const hasComparison = comparisonPageviews !== undefined;
  const points = useMemo(
    () => buildChartData(pageviews, comparisonPageviews, timeframe),
    [pageviews, comparisonPageviews, timeframe],
  );
  const summary = summarizeSeries(points, "primaryViews");
  const secondSummary = summarizeSeries(points, "comparisonViews");
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <p className={styles.label}>Wikipedia pageviews</p>
          <h2>
            {hasComparison
              ? "Reading interest, side by side."
              : "Reading interest"}
          </h2>
        </div>
        <div
          className={styles.toggles}
          role="group"
          aria-label="Chart period"
          data-export-ignore="true"
        >
          {(
            [
              ["30d", "30 days"],
              ["90d", "90 days"],
              ["1y", "1 year"],
              ["all", "All available"],
            ] as const
          ).map(([value, label]) => (
            <button
              type="button"
              key={value}
              aria-pressed={timeframe === value}
              className={timeframe === value ? styles.active : ""}
              onClick={() => setTimeframe(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {!points.length ? (
        <p className="empty-note">
          No reading records are available for this subject yet. You can still
          explore its article and connections.
        </p>
      ) : (
        <>
          <p className={styles.coverage} id={`${id}-coverage`}>
            Daily pageviews · {formatChartDate(points[0].date)} –{" "}
            {formatChartDate(points[points.length - 1].date)}
          </p>
          <div className={styles.legend}>
            <span>
              <i />
              {title}
            </span>
            {hasComparison && (
              <span className={styles.comparison}>
                <i />
                {comparisonTitle}
              </span>
            )}
          </div>
          <div
            className={styles.chartWrapper}
            role="group"
            aria-label="Daily Wikipedia pageviews"
            aria-describedby={`${id}-coverage ${id}-summary`}
          >
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={points}
                margin={{ top: 20, right: 15, left: 0, bottom: 15 }}
                accessibilityLayer
              >
                <CartesianGrid
                  stroke="var(--glass-border)"
                  vertical={false}
                  strokeDasharray="3 5"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value: string) =>
                    formatChartDate(value).replace(/ \d{4}$/, "")
                  }
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  tickMargin={12}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={45}
                />
                <YAxis
                  width={50}
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) =>
                    Intl.NumberFormat("en", { notation: "compact" }).format(
                      value,
                    )
                  }
                />
                <Tooltip
                  labelFormatter={(value) => formatChartDate(String(value))}
                  formatter={(value, name) => [
                    `${Number(value).toLocaleString()} views`,
                    name,
                  ]}
                  contentStyle={{
                    background: "var(--dropdown-bg)",
                    border: "1px solid var(--glass-border)",
                    color: "var(--text-primary)",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="linear"
                  dataKey="primaryViews"
                  name={title}
                  stroke="var(--accent-primary)"
                  strokeWidth={2.5}
                  dot={{ r: 2, strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
                {hasComparison && (
                  <Line
                    type="linear"
                    dataKey="comparisonViews"
                    name={comparisonTitle}
                    stroke="var(--comparison-color)"
                    strokeWidth={2.5}
                    strokeDasharray="6 4"
                    dot={{ r: 2, strokeWidth: 0 }}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.summary} id={`${id}-summary`}>
            <dl className={styles.totals}>
              <div>
                <dt>{title}</dt>
                <dd>
                  <strong>{summary.total.toLocaleString()}</strong> recorded
                  views
                  <span>
                    Records across {summary.recordedDays} of {points.length}{" "}
                    days
                  </span>
                </dd>
              </div>
              {hasComparison && (
                <div>
                  <dt>{comparisonTitle}</dt>
                  <dd>
                    <strong>{secondSummary.total.toLocaleString()}</strong>{" "}
                    recorded views
                    <span>
                      Records across {secondSummary.recordedDays} of{" "}
                      {points.length} days
                    </span>
                  </dd>
                </div>
              )}
            </dl>
            <p className={styles.dataNote}>
              {hasComparison && "Both subjects use the same dates and scale. "}
              Gaps mean no record is available; they are not zero views. Reading
              activity measures attention, not historical importance.
            </p>
          </div>
          <div data-export-ignore="true">
            <button
              type="button"
              className={styles.tableToggle}
              aria-expanded={showTable}
              aria-controls={`${id}-table`}
              onClick={() => setShowTable(!showTable)}
            >
              {showTable ? "Hide" : "Read"} the daily figures{" "}
              {showTable ? "−" : "+"}
            </button>
            <div
              id={`${id}-table`}
              hidden={!showTable}
              className={styles.tableScroll}
              tabIndex={showTable ? 0 : undefined}
              role="region"
              aria-label="Daily reading figures"
            >
              {showTable && (
                <table>
                  <caption>
                    Daily Wikipedia pageviews. A dash means no record.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">{title}</th>
                      {hasComparison && <th scope="col">{comparisonTitle}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {points.map((point) => (
                      <tr key={point.date}>
                        <th scope="row">{formatChartDate(point.date)}</th>
                        <td>{point.primaryViews?.toLocaleString() ?? "—"}</td>
                        {hasComparison && (
                          <td>
                            {point.comparisonViews?.toLocaleString() ?? "—"}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
