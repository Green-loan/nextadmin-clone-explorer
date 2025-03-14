
import React from "react";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface BarChartProps {
  data: any[];
  xAxisKey: string;
  yAxisKey: string | string[];
  showLegend?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showTooltip?: boolean;
  valueFormatter?: (value: number) => string;
}

export function BarChart({
  data,
  xAxisKey,
  yAxisKey,
  showLegend = false,
  showXAxis = true,
  showYAxis = true,
  showTooltip = true,
  valueFormatter = (value) => value.toString(),
}: BarChartProps) {
  const yAxisKeys = Array.isArray(yAxisKey) ? yAxisKey : [yAxisKey];
  const colors = ["#2563eb", "#16a34a", "#dc2626", "#f59e0b", "#6366f1"];

  return (
    <ChartContainer
      config={{
        ...yAxisKeys.reduce(
          (acc, key, index) => ({
            ...acc,
            [key]: {
              color: colors[index % colors.length],
              label: key,
            },
          }),
          {}
        ),
      }}
    >
      <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {showXAxis && <XAxis dataKey={xAxisKey} />}
        {showYAxis && <YAxis />}
        <CartesianGrid strokeDasharray="3 3" />
        {showTooltip && (
          <Tooltip content={<ChartTooltipContent formatter={valueFormatter} />} />
        )}
        {showLegend && <Legend />}
        {yAxisKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={colors[index % colors.length]}
            name={key}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
}
