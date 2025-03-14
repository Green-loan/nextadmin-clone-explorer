
import React from "react";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface LineChartProps {
  data: any[];
  xAxisKey: string;
  yAxisKey: string | string[];
  showLegend?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showTooltip?: boolean;
  valueFormatter?: (value: number) => string;
}

export function LineChart({
  data,
  xAxisKey,
  yAxisKey,
  showLegend = false,
  showXAxis = true,
  showYAxis = true,
  showTooltip = true,
  valueFormatter = (value) => value.toString(),
}: LineChartProps) {
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
      <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {showXAxis && <XAxis dataKey={xAxisKey} />}
        {showYAxis && <YAxis />}
        <CartesianGrid strokeDasharray="3 3" />
        {showTooltip && (
          <Tooltip content={<ChartTooltipContent formatter={valueFormatter} />} />
        )}
        {showLegend && <Legend />}
        {yAxisKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            activeDot={{ r: 8 }}
            name={key}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );
}
