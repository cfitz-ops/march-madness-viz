// components/MatchupModal.tsx
"use client";

import { useMemo } from "react";
import type { BracketGame, TeamStats, ModelData } from "@/lib/types";
import { predictWinProbability, percentileRank } from "@/lib/matchup";

const DISPLAY_STATS: [string, string, boolean][] = [
  ["kenpom_adj_em", "KenPom Eff. Margin", true],
  ["kenpom_adj_o", "Offensive Rating", true],
  ["kenpom_adj_d", "Defensive Rating", false],
  ["barthag", "Barthag", true],
  ["win_pct", "Win %", true],
  ["efg_pct", "eFG%", true],
  ["three_pt_pct", "3PT%", true],
  ["tov_pct", "Turnover %", false],
  ["wab", "Wins Above Bubble", true],
  ["talent", "Talent", true],
  ["coach_pake", "Coach PAKE", true],
  ["strength_of_schedule", "SOS", true],
];

interface Props {
  game: BracketGame;
  teamStats: TeamStats[];
  model: ModelData;
  onClose: () => void;
}

export default function MatchupModal({ game, teamStats, model, onClose }: Props) {
  const teamA = teamStats.find((t) => t.team_name === game.team_a);
  const teamB = teamStats.find((t) => t.team_name === game.team_b);

  const probA = useMemo(() => {
    if (!teamA || !teamB) return game.team_a_win_prob;
    return predictWinProbability(teamA, teamB, model);
  }, [teamA, teamB, model, game.team_a_win_prob]);

  if (!teamA || !teamB) return null;

  const isUpset =
    game.predicted_winner === game.team_a
      ? game.seed_a > game.seed_b
      : game.seed_b > game.seed_a;

  const rows = DISPLAY_STATS.map(([key, label, higherIsBetter]) => {
    const allValues = teamStats.map((t) => Number(t[key]) || 0);
    const valA = Number(teamA[key]) || 0;
    const valB = Number(teamB[key]) || 0;
    const pctA = Math.round(percentileRank(valA, allValues, higherIsBetter));
    const pctB = Math.round(percentileRank(valB, allValues, higherIsBetter));
    return { label, valA, valB, pctA, pctB, aWins: pctA > pctB };
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">
              ({game.seed_a}) {game.team_a} vs ({game.seed_b}) {game.team_b}
            </div>
            <div className="text-sm text-gray-400 mt-0.5">
              Round {game.round} · {game.slot}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-xl leading-none px-2"
          >
            &times;
          </button>
        </div>

        {/* Win probability bar */}
        <div className="px-5 py-4">
          <div className="flex justify-between text-sm font-semibold mb-1">
            <span>{game.team_a}</span>
            <span>{game.team_b}</span>
          </div>
          <div className="flex h-6 rounded overflow-hidden">
            <div
              className="flex items-center justify-center text-xs font-bold transition-all"
              style={{
                width: `${Math.round(probA * 100)}%`,
                backgroundColor: isUpset
                  ? game.predicted_winner === game.team_a ? "rgb(245 158 11)" : "rgb(34 197 94)"
                  : game.predicted_winner === game.team_a ? "rgb(34 197 94)" : "rgb(245 158 11)",
              }}
            >
              {Math.round(probA * 100)}%
            </div>
            <div
              className="flex items-center justify-center text-xs font-bold transition-all"
              style={{
                width: `${Math.round((1 - probA) * 100)}%`,
                backgroundColor: isUpset
                  ? game.predicted_winner === game.team_b ? "rgb(245 158 11)" : "rgb(34 197 94)"
                  : game.predicted_winner === game.team_b ? "rgb(34 197 94)" : "rgb(245 158 11)",
              }}
            >
              {Math.round((1 - probA) * 100)}%
            </div>
          </div>
          <div className="text-center text-xs text-gray-500 mt-1">
            Predicted winner: <span className="text-gray-200 font-medium">{game.predicted_winner}</span>
          </div>
        </div>

        {/* Stat comparison table */}
        <div className="px-5 pb-5">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500">
                <th className="text-left py-1.5 font-medium">{game.team_a}</th>
                <th className="text-center py-1.5 font-medium">Stat</th>
                <th className="text-right py-1.5 font-medium">{game.team_b}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-gray-800/40">
                  <td className={`py-1.5 tabular-nums ${row.aWins ? "text-green-400 font-medium" : "text-gray-400"}`}>
                    {row.valA.toFixed(1)} <span className="text-gray-600 text-[0.6rem]">{row.pctA}p</span>
                  </td>
                  <td className="py-1.5 text-center text-gray-500">{row.label}</td>
                  <td className={`py-1.5 text-right tabular-nums ${!row.aWins ? "text-green-400 font-medium" : "text-gray-400"}`}>
                    <span className="text-gray-600 text-[0.6rem]">{row.pctB}p</span> {row.valB.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[0.6rem] text-gray-600 mt-2">
            Green = advantage · percentile rank among all tournament teams shown as &ldquo;p&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
