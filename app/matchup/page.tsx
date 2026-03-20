// app/matchup/page.tsx
import { getAllTeamStats } from "@/lib/queries";
import modelData from "@/data/model.json";
import type { ModelData } from "@/lib/types";
import MatchupCompare from "@/components/MatchupCompare";

export default async function MatchupPage() {
  const teams = await getAllTeamStats();

  if (teams.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        No team data found.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Matchup Explorer</h1>
      <p className="text-gray-400 text-sm mt-1">
        Head-to-head team comparison with model win probability
      </p>

      <div className="mt-8">
        <MatchupCompare teams={teams} model={modelData as ModelData} />
      </div>
    </div>
  );
}
