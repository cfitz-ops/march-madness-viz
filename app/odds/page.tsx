// app/odds/page.tsx
import { getMonteCarloOdds, getBracketResults } from "@/lib/queries";
import type { MonteCarloTeam, MonteCarloRow } from "@/lib/types";
import OddsChart from "@/components/OddsChart";
import OddsTable from "@/components/OddsTable";

const REGION_MAP: Record<string, string> = {
  W: "West",
  X: "South",
  Y: "East",
  Z: "Midwest",
};

const ROUND_KEYS: Record<number, keyof MonteCarloTeam> = {
  1: "r32",
  2: "sweet16",
  3: "elite8",
  4: "final4",
  5: "titleGame",
  6: "champion",
};

function pivotOdds(
  rows: MonteCarloRow[],
  teamRegions: Record<string, string>
): MonteCarloTeam[] {
  const byTeam = new Map<string, MonteCarloTeam>();

  for (const row of rows) {
    if (!byTeam.has(row.team_name)) {
      byTeam.set(row.team_name, {
        team_name: row.team_name,
        seed: row.seed,
        region: teamRegions[row.team_name] || "",
        r32: 0,
        sweet16: 0,
        elite8: 0,
        final4: 0,
        titleGame: 0,
        champion: 0,
      });
    }
    const team = byTeam.get(row.team_name)!;
    const key = ROUND_KEYS[row.round];
    if (key) {
      (team as unknown as Record<string, unknown>)[key] = row.reach_probability;
    }
  }

  return [...byTeam.values()].sort((a, b) => b.champion - a.champion);
}

export default async function OddsPage() {
  const [oddsRows, bracketGames] = await Promise.all([
    getMonteCarloOdds(),
    getBracketResults(),
  ]);

  if (oddsRows.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        No Monte Carlo data found. Run simulations first.
      </div>
    );
  }

  // Derive region from bracket slot prefix for each team
  const teamRegions: Record<string, string> = {};
  for (const g of bracketGames) {
    if (g.round === 1) {
      const regionCode = g.slot[2];
      const regionName = REGION_MAP[regionCode] || regionCode;
      teamRegions[g.team_a] = regionName;
      teamRegions[g.team_b] = regionName;
    }
  }

  const teams = pivotOdds(oddsRows, teamRegions);
  const nSims = oddsRows[0]?.n_sims ?? 0;

  return (
    <div>
      <h1 className="text-3xl font-bold">Monte Carlo Odds Board</h1>
      <p className="text-gray-400 text-sm mt-1">
        Win probabilities based on {nSims.toLocaleString()} bracket simulations
      </p>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Championship Favorites</h2>
        <OddsChart teams={teams} />
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">All Teams</h2>
        <OddsTable teams={teams} />
      </div>
    </div>
  );
}
