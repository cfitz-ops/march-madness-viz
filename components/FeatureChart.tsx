// components/FeatureChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import type { ModelData } from "@/lib/types";

interface Props {
  model: ModelData;
}

export default function FeatureChart({ model }: Props) {
  const data = model.features
    .map((f, i) => ({
      feature: f,
      label: model.labels[f] || f,
      coefficient: model.coefficients[i],
      absCoefficient: Math.abs(model.coefficients[i]),
    }))
    .sort((a, b) => a.absCoefficient - b.absCoefficient);

  return (
    <div style={{ height: Math.max(400, data.length * 28) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 160 }}>
          <XAxis
            type="number"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: "#d1d5db", fontSize: 11 }}
            width={160}
          />
          <Tooltip
            contentStyle={{ background: "#111827", border: "1px solid #374151" }}
            labelStyle={{ color: "#f3f4f6" }}
            formatter={(value: number) => [value.toFixed(4), "Weight"]}
          />
          <Bar dataKey="coefficient" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.feature}
                fill={entry.coefficient > 0 ? "#14b8a6" : "#8b5cf6"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
