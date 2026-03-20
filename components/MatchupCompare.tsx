// components/MatchupCompare.tsx
"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TeamStats, ModelData } from "@/lib/types";
import { predictWinProbability, percentileRank } from "@/lib/matchup";

const DISPLAY_STATS: [string, string, boolean][] = [
  ["kenpom_adj_em", "KenPom Efficiency", true],
  ["kenpom_adj_o", "Offensive Rating", true],
  ["kenpom_adj_d", "Defensive Rating", false],
  ["win_pct", "Win %", true],
  ["barthag", "Barthag", true],
  ["efg_pct", "eFG%", true],
  ["three_pt_pct", "3PT%", true],
  ["tov_pct", "Turnover %", false],
  ["experience", "Experience", true],
  ["talent", "Talent", true],
  ["wab", "Wins Above Bubble", true],
  ["adj_tempo", "Tempo", true],
];

interface Props {
  teams: TeamStats[];
  model: ModelData;
}

export default function MatchupCompare({ teams, model }: Props) {
  const teamOptions = teams.map((t) => ({
    id: t.team_id,
    label: `(${t.seed}) ${t.team_name}`,
  }));

  const [teamAId, setTeamAId] = useState(teams[0]?.team_id ?? 0);
  const [teamBId, setTeamBId] = useState(teams[1]?.team_id ?? 0);

  const teamA = teams.find((t) => t.team_id === teamAId);
  const teamB = teams.find((t) => t.team_id === teamBId);

  const probA = useMemo(() => {
    if (!teamA || !teamB || teamAId === teamBId) return 0.5;
    return predictWinProbability(teamA, teamB, model);
  }, [teamA, teamB, teamAId, teamBId, model]);

  const chartData = useMemo(() => {
    if (!teamA || !teamB) return [];
    return DISPLAY_STATS.map(([key, label, higherIsBetter]) => {
      const allValues = teams.map((t) => Number(t[key]) || 0);
      return {
        stat: label,
        [teamA.team_name]: Math.round(
          percentileRank(Number(teamA[key]) || 0, allValues, higherIsBetter)
        ),
        [teamB.team_name]: Math.round(
          percentileRank(Number(teamB[key]) || 0, allValues, higherIsBetter)
        ),
      };
    });
  }, [teamA, teamB, teams]);

  const selectClass =
    "bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 w-full";

  return (
    <div>
      {/* Team selectors */}
      <div className="grid grid-cols-2 gap-8 max-w-2xl">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Team A</label>
          <select
            className={selectClass}
            value={teamAId}
            onChange={(e) => setTeamAId(Number(e.target.value))}
          >
            {teamOptions.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Team B</label>
          <select
            className={selectClass}
            value={teamBId}
            onChange={(e) => setTeamBId(Number(e.target.value))}
          >
            {teamOptions.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Win probability */}
      {teamA && teamB && teamAId !== teamBId && (
        <div className="mt-8 text-center">
          <div className="text-2xl font-bold">
            <span>{teamA.team_name}</span>
            <span className="text-amber-400 mx-4">
              {Math.round(probA * 100)}% &mdash; {Math.round((1 - probA) * 100)}%
            </span>
            <span>{teamB.team_name}</span>
          </div>
        </div>
      )}

      {/* Stat comparison chart */}
      {teamA && teamB && teamAId !== teamBId && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Stat Comparison</h2>
          <p className="text-xs text-gray-400 mb-4">
            Percentile rank among all tournament teams (higher = better)
          </p>
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 120 }}>
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  tickFormatter={(v) => `${v}th`}
                />
                <YAxis
                  type="category"
                  dataKey="stat"
                  tick={{ fill: "#d1d5db", fontSize: 11 }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{ background: "#111827", border: "1px solid #374151" }}
                  labelStyle={{ color: "#f3f4f6" }}
                  formatter={(value) => [`${value}th percentile`]}
                />
                <Legend />
                <Bar dataKey={teamA.team_name} fill="#14b8a6" radius={[0, 4, 4, 0]} />
                <Bar dataKey={teamB.team_name} fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
