// app/page.tsx
import { getBracketResults } from "@/lib/queries";
import Bracket from "@/components/Bracket";

export default async function BracketPage() {
  const games = await getBracketResults();

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
      </div>

      <div className="overflow-x-auto">
        <Bracket games={games} />
      </div>
    </div>
  );
}
