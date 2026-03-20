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
        top: { name: game.team_a, seed: game.seed_a },
        bottom: { name: game.team_b, seed: game.seed_b },
      };
    }
    return {
      top: { name: game.team_b, seed: game.seed_b },
      bottom: { name: game.team_a, seed: game.seed_a },
    };
  }
  return {
    top: { name: game.team_a, seed: game.seed_a },
    bottom: { name: game.team_b, seed: game.seed_b },
  };
}

interface GameCardProps {
  game: BracketGame;
  onClick?: () => void;
}

export default function GameCard({ game, onClick }: GameCardProps) {
  const { top, bottom } = getTopBottom(game);

  const prob =
    game.predicted_winner === game.team_a
      ? game.team_a_win_prob
      : 1 - game.team_a_win_prob;

  const isUpset =
    game.predicted_winner === game.team_a
      ? game.seed_a > game.seed_b
      : game.seed_b > game.seed_a;

  const accent = isUpset ? "rgb(245 158 11)" : "rgb(34 197 94)";

  function teamRow(name: string, seed: number) {
    const isWinner = name === game.predicted_winner;
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
        {isWinner && (
          <span className="text-[0.6rem] ml-1 shrink-0" style={{ color: accent }}>
            {Math.round(prob * 100)}%
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`border rounded overflow-hidden my-0.5 bg-gray-900${onClick ? " cursor-pointer hover:brightness-125 transition-[filter]" : ""}`}
      style={isUpset ? { borderColor: "rgb(245 158 11)" } : { borderColor: "#333" }}
      onClick={onClick}
    >
      {teamRow(top.name, top.seed)}
      {teamRow(bottom.name, bottom.seed)}
    </div>
  );
}
