import { useId } from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import type { PageviewEntry } from "../types/index";

interface MiniPulseChartProps {
  pageviews?: PageviewEntry[];
  color?: string;
}

export function MiniPulseChart({
  pageviews = [],
  color = "var(--accent-primary)",
}: MiniPulseChartProps) {
  const id = useId();

  if (!pageviews || pageviews.length === 0) {
    return null;
  }

  // Use React's useId for a stable, unique gradient ID across renders
  const gradientId = `mini-pulse-gradient-${id}`;

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={pageviews}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.6} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="views"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            isAnimationActive={false} // Disable animation for performance on multiple renders
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
