
import React from "react";
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";

interface PieChartProps {
  data: any[];
  nameKey: string;
  dataKey: string;
  showLegend?: boolean;
  valueFormatter?: (value: number) => string;
}

export function PieChart({
  data,
  nameKey,
  dataKey,
  showLegend = false,
  valueFormatter = (value) => value.toString(),
}: PieChartProps) {
  const colors = ["#2563eb", "#16a34a", "#dc2626", "#f59e0b", "#6366f1"];

  return (
    <ChartContainer
      config={{
        ...data.reduce(
          (acc, entry, index) => ({
            ...acc,
            [entry[nameKey]]: {
              color: colors[index % colors.length],
              label: entry[nameKey],
            },
          }),
          {}
        ),
      }}
    >
      <RechartsPieChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <Pie
          data={data}
          nameKey={nameKey}
          dataKey={dataKey}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltipContent formatter={valueFormatter} />} />
        {showLegend && <Legend content={<ChartLegendContent />} />}
      </RechartsPieChart>
    </ChartContainer>
  );
}
