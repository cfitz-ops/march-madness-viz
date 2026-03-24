// app/live/page.tsx
import { getLivePredictions } from "@/lib/queries";
import type { LivePrediction } from "@/lib/types";

const ROUND_NAMES: Record<number, string> = {
  1: "Round of 64",
  2: "Round of 32",
  3: "Sweet 16",
  4: "Elite Eight",
  5: "Final Four",
  6: "Championship",
};

function getProbColor(prob: number, isWinner: boolean): string {
  if (!isWinner) return "text-gray-500";
  if (prob >= 0.8) return "text-green-400";
  if (prob >= 0.6) return "text-green-600";
  return "text-yellow-400";
}

function PredictionCard({ game }: { game: LivePrediction }) {
  const pickProb =
    game.predicted_winner === game.team_a
      ? game.team_a_win_prob
      : 1 - game.team_a_win_prob;

  const isUpset =
    game.predicted_winner === game.team_a
      ? game.seed_a > game.seed_b
      : game.seed_b > game.seed_a;

  const flipped =
    game.pretournament_winner !== null &&
    !game.agrees_with_pretournament;

  const resultCorrect =
    game.actual_winner !== null &&
    game.actual_winner === game.predicted_winner;
  const resultWrong =
    game.actual_winner !== null &&
    game.actual_winner !== game.predicted_winner;

  return (
    <div
      className={`rounded-lg border p-4 ${
        resultCorrect
          ? "border-green-700 bg-green-950/30"
          : resultWrong
          ? "border-red-800 bg-red-950/20"
          : "border-gray-800 bg-gray-900"
      }`}
    >
      {/* Teams */}
      <div className="flex items-center justify-between gap-2 text-sm mb-3">
        <span
          className={`font-medium ${
            game.predicted_winner === game.team_a ? "text-white" : "text-gray-500"
          }`}
        >
          <span className="text-gray-600 mr-1">#{game.seed_a}</span>
          {game.team_a}
        </span>
        <span className="text-gray-700 text-xs">vs</span>
        <span
          className={`font-medium text-right ${
            game.predicted_winner === game.team_b ? "text-white" : "text-gray-500"
          }`}
        >
          {game.team_b}
          <span className="text-gray-600 ml-1">#{game.seed_b}</span>
        </span>
      </div>

      {/* Pick */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide">Pick</span>
        <span className={`font-semibold ${getProbColor(pickProb, true)}`}>
          {game.predicted_winner}
        </span>
        <span className="text-gray-500 text-xs">({(pickProb * 100).toFixed(1)}%)</span>
        {isUpset && (
          <span className="text-xs bg-red-900/50 text-red-400 px-1.5 py-0.5 rounded">
            upset
          </span>
        )}
      </div>

      {/* Spread */}
      {game.spread !== null && (
        <div className="text-xs text-gray-500 mb-2">
          Spread: {game.spread > 0 ? `+${game.spread}` : game.spread}
        </div>
      )}

      {/* Pre-tournament comparison */}
      {flipped ? (
        <div className="text-xs text-yellow-500 mt-1">
          Flipped from pre-tournament pick: {game.pretournament_winner}
        </div>
      ) : game.pretournament_winner ? (
        <div className="text-xs text-gray-600 mt-1">
          Agrees with pre-tournament pick
        </div>
      ) : null}

      {/* Result */}
      {game.actual_winner && (
        <div
          className={`text-xs mt-2 font-medium ${
            resultCorrect ? "text-green-400" : "text-red-400"
          }`}
        >
          {resultCorrect ? "Correct" : `Wrong — ${game.actual_winner} won`}
        </div>
      )}
    </div>
  );
}

export default async function LivePage() {
  const predictions = await getLivePredictions();

  if (predictions.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        No live predictions yet. Run <code className="text-gray-400">python -m src.predict 2026 &lt;round&gt;</code> first.
      </div>
    );
  }

  const byRound = predictions.reduce<Record<number, LivePrediction[]>>(
    (acc, g) => {
      (acc[g.round] ??= []).push(g);
      return acc;
    },
    {}
  );

  const rounds = Object.keys(byRound)
    .map(Number)
    .sort((a, b) => b - a); // most recent first

  const flippedCount = predictions.filter((g) => !g.agrees_with_pretournament && g.pretournament_winner).length;
  const correctCount = predictions.filter((g) => g.actual_winner && g.actual_winner === g.predicted_winner).length;
  const gradedCount = predictions.filter((g) => g.actual_winner !== null).length;

  return (
    <div>
      <h1 className="text-3xl font-bold">Live Picks</h1>
      <p className="text-gray-400 text-sm mt-1">
        Round-by-round predictions using the spread model (where odds are available)
      </p>

      {/* Summary stats */}
      <div className="flex gap-6 mt-6 mb-10">
        <div className="bg-gray-900 border border-gray-800 rounded-lg px-5 py-3">
          <div className="text-2xl font-bold">{predictions.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Games predicted</div>
        </div>
        {flippedCount > 0 && (
          <div className="bg-yellow-950/40 border border-yellow-800/50 rounded-lg px-5 py-3">
            <div className="text-2xl font-bold text-yellow-400">{flippedCount}</div>
            <div className="text-xs text-gray-500 mt-0.5">Flipped from pre-tournament</div>
          </div>
        )}
        {gradedCount > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg px-5 py-3">
            <div className="text-2xl font-bold text-green-400">
              {correctCount}/{gradedCount}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Correct so far</div>
          </div>
        )}
      </div>

      {rounds.map((round) => (
        <div key={round} className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">
            {ROUND_NAMES[round] ?? `Round ${round}`}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {byRound[round].map((game) => (
              <PredictionCard key={game.game_id} game={game} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
