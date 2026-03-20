// components/Bracket.tsx
"use client";

import { useState } from "react";
import type { BracketGame, TeamStats, ModelData } from "@/lib/types";
import GameCard from "./GameCard";
import MatchupModal from "./MatchupModal";

const REGION_MAP: Record<string, string> = {
  W: "West",
  X: "South",
  Y: "East",
  Z: "Midwest",
};

const ROUND_NAMES: Record<number, string> = {
  1: "R64",
  2: "R32",
  3: "Sweet 16",
  4: "Elite 8",
};

/**
 * Visual ordering for games within a round so that adjacent pairs
 * feed into the same next-round game.
 */
const VISUAL_ORDER: Record<number, number[]> = {
  1: [1, 8, 5, 4, 6, 3, 7, 2],
  2: [1, 4, 3, 2],
  3: [1, 2],
  4: [1],
};

function slotSortKey(slot: string): number {
  const round = parseInt(slot[1]);
  const num = parseInt(slot.slice(3));
  const order = VISUAL_ORDER[round] || [];
  const idx = order.indexOf(num);
  return idx >= 0 ? idx : num;
}

function getRegion(slot: string): string {
  return slot[2]; // W, X, Y, Z
}

interface RegionBracketProps {
  games: BracketGame[];
  regionCode: string;
  reversed?: boolean;
  onGameClick: (game: BracketGame) => void;
}

function RegionBracket({ games, regionCode, reversed = false, onGameClick }: RegionBracketProps) {
  const rounds = [1, 2, 3, 4];
  const roundColumns = reversed ? [...rounds].reverse() : rounds;

  // 8 R64 games define 8 row slots. Later rounds span multiple rows
  // to center between their feeder games.
  const ROW_SPAN: Record<number, number> = { 1: 1, 2: 2, 3: 4, 4: 8 };

  return (
    <div>
      <h3 className="text-center text-sm font-semibold text-gray-400 mb-2">
        {REGION_MAP[regionCode]}
      </h3>
      {/* Column headers */}
      <div
        className="grid gap-x-1 mb-1"
        style={{
          gridTemplateColumns: `repeat(4, 1fr)`,
        }}
      >
        {roundColumns.map((round) => (
          <div key={round} className="text-[0.6rem] text-gray-600">
            {ROUND_NAMES[round]}
          </div>
        ))}
      </div>
      {/* Bracket grid: 4 columns x 8 rows */}
      <div
        className="grid gap-x-1 gap-y-1"
        style={{
          gridTemplateColumns: `repeat(4, 1fr)`,
          gridTemplateRows: `repeat(8, auto)`,
        }}
      >
        {roundColumns.map((round) => {
          const roundGames = games
            .filter((g) => g.round === round)
            .sort((a, b) => slotSortKey(a.slot) - slotSortKey(b.slot));

          const span = ROW_SPAN[round];
          const colIndex = reversed
            ? 4 - rounds.indexOf(round)
            : rounds.indexOf(round) + 1;

          return roundGames.map((game, i) => (
            <div
              key={game.slot}
              className="flex items-center"
              style={{
                gridColumn: colIndex,
                gridRow: `${i * span + 1} / span ${span}`,
              }}
            >
              <div className="w-full">
                <GameCard game={game} onClick={() => onGameClick(game)} />
              </div>
            </div>
          ));
        })}
      </div>
    </div>
  );
}

interface BracketProps {
  games: BracketGame[];
  teamStats: TeamStats[];
  model: ModelData;
}

export default function Bracket({ games, teamStats, model }: BracketProps) {
  const [selectedGame, setSelectedGame] = useState<BracketGame | null>(null);

  const leftRegions = ["W", "Y"]; // West, East on left side
  const rightRegions = ["X", "Z"]; // South, Midwest on right side

  const finalFour = games.filter((g) => g.round === 5);
  const championship = games.filter((g) => g.round === 6);

  return (
    <>
      <div
        className="grid gap-2 w-full"
        style={{ gridTemplateColumns: "1fr auto 1fr" }}
      >
        {/* Left side: West and East, L→R */}
        <div className="space-y-8">
          {leftRegions.map((code) => (
            <RegionBracket
              key={code}
              regionCode={code}
              games={games.filter(
                (g) => getRegion(g.slot) === code && g.round <= 4
              )}
              onGameClick={setSelectedGame}
            />
          ))}
        </div>

        {/* Center: Final Four + Championship */}
        <div className="flex flex-col items-center justify-center px-2 min-w-[140px]">
          <h3 className="text-sm font-semibold text-amber-400 mb-4">
            FINAL FOUR
          </h3>
          {finalFour.map((game) => (
            <div key={game.slot} className="mb-2 w-full">
              <GameCard game={game} onClick={() => setSelectedGame(game)} />
            </div>
          ))}
          {championship.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-amber-400 mt-4 mb-2">
                CHAMPIONSHIP
              </h3>
              {championship.map((game) => (
                <div key={game.slot} className="w-full">
                  <GameCard game={game} onClick={() => setSelectedGame(game)} />
                </div>
              ))}
            </>
          )}
        </div>

        {/* Right side: South and Midwest, R→L */}
        <div className="space-y-8">
          {rightRegions.map((code) => (
            <RegionBracket
              key={code}
              regionCode={code}
              games={games.filter(
                (g) => getRegion(g.slot) === code && g.round <= 4
              )}
              reversed
              onGameClick={setSelectedGame}
            />
          ))}
        </div>
      </div>

      {selectedGame && (
        <MatchupModal
          game={selectedGame}
          teamStats={teamStats}
          model={model}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </>
  );
}
