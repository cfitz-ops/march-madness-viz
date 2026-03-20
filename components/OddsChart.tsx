// components/OddsChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonteCarloTeam } from "@/lib/types";

export default function OddsChart({ teams }: { teams: MonteCarloTeam[] }) {
  const top10 = teams.slice(0, 10).map((t) => ({
    name: t.team_name,
    pct: Math.round(t.champion * 1000) / 10,
  }));

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top10} layout="vertical" margin={{ left: 80 }}>
          <XAxis
            type="number"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#d1d5db", fontSize: 12 }}
            width={80}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, "Championship"]}
            contentStyle={{ background: "#111827", border: "1px solid #374151" }}
            labelStyle={{ color: "#f3f4f6" }}
          />
          <Bar dataKey="pct" fill="#f59e0b" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
