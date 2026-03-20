// components/OddsTable.tsx
"use client";

import { useState, useMemo } from "react";
import type { MonteCarloTeam } from "@/lib/types";

const ROUND_COLS = [
  { key: "r32" as const, label: "R32%" },
  { key: "sweet16" as const, label: "S16%" },
  { key: "elite8" as const, label: "E8%" },
  { key: "final4" as const, label: "F4%" },
  { key: "titleGame" as const, label: "Title%" },
  { key: "champion" as const, label: "Champ%" },
];

type SortKey = "team_name" | "seed" | "r32" | "sweet16" | "elite8" | "final4" | "titleGame" | "champion";

export default function OddsTable({ teams }: { teams: MonteCarloTeam[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("champion");
  const [sortAsc, setSortAsc] = useState(false);
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [seedFilter, setSeedFilter] = useState<string>("all");

  const regions = useMemo(
    () => [...new Set(teams.map((t) => t.region))].sort(),
    [teams]
  );

  const SEED_RANGES = [
    { label: "All Seeds", value: "all" },
    { label: "Seeds 1-4", value: "1-4" },
    { label: "Seeds 5-8", value: "5-8" },
    { label: "Seeds 9-16", value: "9-16" },
  ];

  const sorted = useMemo(() => {
    let filtered = regionFilter === "all"
      ? teams
      : teams.filter((t) => t.region === regionFilter);

    if (seedFilter !== "all") {
      const [min, max] = seedFilter.split("-").map(Number);
      filtered = filtered.filter((t) => t.seed >= min && t.seed <= max);
    }

    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string")
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortAsc
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [teams, sortKey, sortAsc, regionFilter, seedFilter]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  function fmtPct(val: number): string {
    return val > 0 ? `${(val * 100).toFixed(1)}%` : "\u2014";
  }

  const headerClass = "px-3 py-2 text-left text-xs font-medium text-gray-400 cursor-pointer hover:text-white select-none";

  return (
    <div>
      <div className="mb-4">
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-300"
        >
          <option value="all">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={seedFilter}
          onChange={(e) => setSeedFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-300 ml-2"
        >
          {SEED_RANGES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className={headerClass} onClick={() => handleSort("team_name")}>
                Team {sortKey === "team_name" ? (sortAsc ? "\u2191" : "\u2193") : ""}
              </th>
              <th className={headerClass} onClick={() => handleSort("seed")}>
                Seed {sortKey === "seed" ? (sortAsc ? "\u2191" : "\u2193") : ""}
              </th>
              {ROUND_COLS.map((col) => (
                <th
                  key={col.key}
                  className={headerClass}
                  onClick={() => handleSort(col.key)}
                >
                  {col.label} {sortKey === col.key ? (sortAsc ? "\u2191" : "\u2193") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((team) => (
              <tr
                key={team.team_name}
                className="border-b border-gray-800/50 hover:bg-gray-800/30"
              >
                <td className="px-3 py-2 font-medium">{team.team_name}</td>
                <td className="px-3 py-2 text-gray-400">{team.seed}</td>
                {ROUND_COLS.map((col) => (
                  <td key={col.key} className="px-3 py-2 tabular-nums">
                    {fmtPct(team[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
