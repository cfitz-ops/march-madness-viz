// components/GameCard.tsx
import type { BracketGame } from "@/lib/types";

/**
 * Determine if higher seed is on top based on slot lineage.
 * In R64, higher seed (lower number) on top.
 * In later rounds, team_a is always on top (preserves bracket topology).
 */
function getTopBottom(game: BracketGame) {
  if (game.round === 1) {
    if (game.seed_a <= game.seed_b) {
      return {
        top: { name: game.team_a, seed: game.seed_a, score: game.score_a },
        bottom: { name: game.team_b, seed: game.seed_b, score: game.score_b },
      };
    }
    return {
      top: { name: game.team_b, seed: game.seed_b, score: game.score_b },
      bottom: { name: game.team_a, seed: game.seed_a, score: game.score_a },
    };
  }
  return {
    top: { name: game.team_a, seed: game.seed_a, score: game.score_a },
    bottom: { name: game.team_b, seed: game.seed_b, score: game.score_b },
  };
}

interface GameCardProps {
  game: BracketGame;
  onClick?: () => void;
}

export default function GameCard({ game, onClick }: GameCardProps) {
  const { top, bottom } = getTopBottom(game);
  const isCompleted = game.actual_winner != null;

  // For completed games, use actual winner; for predictions, use predicted winner
  const displayWinner = isCompleted ? game.actual_winner : game.predicted_winner;

  const modelWrong =
    isCompleted && game.actual_winner !== game.predicted_winner;

  const prob =
    game.predicted_winner === game.team_a
      ? game.team_a_win_prob
      : 1 - game.team_a_win_prob;

  // Upset = lower seed (higher number) won/predicted to win
  const winnerSeed = displayWinner === game.team_a ? game.seed_a : game.seed_b;
  const loserSeed = displayWinner === game.team_a ? game.seed_b : game.seed_a;
  const isUpset = winnerSeed > loserSeed;

  const accent = modelWrong
    ? "rgb(239 68 68)"
    : isUpset
    ? "rgb(245 158 11)"
    : "rgb(34 197 94)";

  function teamRow(name: string, seed: number, score: number | null) {
    const isWinner = name === displayWinner;
    return (
      <div
        className={`flex justify-between items-center px-1.5 py-0.5 text-[0.65rem] leading-tight ${
          isWinner ? "font-semibold" : "text-gray-500"
        }`}
        style={
          isWinner
            ? {
                borderLeft: `3px solid ${accent}`,
                background: isUpset
                  ? "rgba(245, 158, 11, 0.08)"
                  : "rgba(34, 197, 94, 0.08)",
              }
            : {}
        }
      >
        <span>
          ({seed}) {name}
        </span>
        <span className="text-[0.6rem] ml-1 shrink-0" style={isWinner ? { color: accent } : {}}>
          {isCompleted && score != null
            ? score
            : isWinner
              ? `${Math.round(prob * 100)}%`
              : ""}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`border rounded overflow-hidden my-0.5 bg-gray-900${onClick ? " cursor-pointer hover:brightness-125 transition-[filter]" : ""}${modelWrong ? " bg-red-950/20" : ""}`}
      style={{ borderColor: modelWrong ? "rgb(239 68 68)" : isUpset ? "rgb(245 158 11)" : "#333" }}
      onClick={onClick}
    >
      {isCompleted && (
        <div className={`text-[0.5rem] px-1.5 pt-0.5 uppercase tracking-wider flex justify-between ${modelWrong ? "text-red-500" : "text-gray-600"}`}>
          <span>{modelWrong ? "Wrong" : "Final"}</span>
          {modelWrong && (
            <span className="normal-case tracking-normal">
              picked {game.predicted_winner}
            </span>
          )}
        </div>
      )}
      {teamRow(top.name, top.seed, top.score)}
      {teamRow(bottom.name, bottom.seed, bottom.score)}
    </div>
  );
}
