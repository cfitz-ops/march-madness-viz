// app/page.tsx
import { getBracketResults, getAllTeamStats } from "@/lib/queries";
import modelData from "@/data/model.json";
import type { ModelData } from "@/lib/types";
import Bracket from "@/components/Bracket";

export default async function BracketPage() {
  const [games, teamStats] = await Promise.all([
    getBracketResults(),
    getAllTeamStats(),
  ]);

  if (games.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        No bracket data found. Run the simulation first.
      </div>
    );
  }

  // Find champion
  const championship = games.find((g) => g.round === 6);
  const champion = championship?.predicted_winner;
  const champProb = championship
    ? championship.predicted_winner === championship.team_a
      ? championship.team_a_win_prob
      : 1 - championship.team_a_win_prob
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">2026 NCAA Tournament Bracket</h1>
        <p className="text-gray-400 text-sm mt-1">
          Logistic regression model · KenPom + Barttorvik + Coach PAKE
        </p>
        {champion && (
          <p className="text-xl mt-4">
            Predicted Champion:{" "}
            <span className="font-bold text-amber-400">{champion}</span>{" "}
            <span className="text-gray-400">
              ({Math.round(champProb * 100)}% confidence)
            </span>
          </p>
        )}
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-500" />
            Chalk
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-500" />
            Upset
          </span>
          <span className="text-gray-600">Scores = completed · % = predicted · Click for stats</span>
        </div>
      </div>

      <Bracket games={games} teamStats={teamStats} model={modelData as ModelData} />
    </div>
  );
}
