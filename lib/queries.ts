// lib/queries.ts
import { query } from "./db";
import type { BracketGame, MonteCarloRow, TeamStats } from "./types";

const SEASON = 2026;

export async function getBracketResults(): Promise<BracketGame[]> {
  return query<BracketGame>(
    `SELECT
      br.slot, br.round,
      ta.team_name AS team_a, tb.team_name AS team_b,
      tw.team_name AS predicted_winner,
      br.team_a_win_prob,
      tsa.seed AS seed_a, tsb.seed AS seed_b,
      aw.team_name AS actual_winner,
      g.score_a, g.score_b
    FROM bracket_results br
    JOIN teams ta ON ta.team_id = br.team_a_id
    JOIN teams tb ON tb.team_id = br.team_b_id
    LEFT JOIN teams tw ON tw.team_id = br.winner_id
    JOIN team_seasons tsa ON tsa.team_id = br.team_a_id AND tsa.season = br.season
    JOIN team_seasons tsb ON tsb.team_id = br.team_b_id AND tsb.season = br.season
    LEFT JOIN games g ON g.season = br.season
      AND g.team_a_id = br.team_a_id
      AND g.team_b_id = br.team_b_id
      AND g.round = br.round
    LEFT JOIN teams aw ON aw.team_id = g.winner_id
    WHERE br.season = $1 AND br.sim_type = 'deterministic'
    ORDER BY br.round, br.slot`,
    [SEASON]
  );
}

export async function getMonteCarloOdds(): Promise<MonteCarloRow[]> {
  return query<MonteCarloRow>(
    `SELECT
      t.team_name,
      ts.seed,
      m.round,
      m.reach_probability,
      m.n_sims
    FROM monte_carlo_odds m
    JOIN teams t ON t.team_id = m.team_id
    JOIN team_seasons ts ON ts.team_id = m.team_id AND ts.season = $1
    WHERE m.season = $1
    ORDER BY m.round DESC, m.reach_probability DESC`,
    [SEASON]
  );
}

export async function getAllTeamStats(): Promise<TeamStats[]> {
  return query<TeamStats>(
    `SELECT
      ts.*, t.team_name, t.conference, tsn.seed
    FROM team_stats ts
    JOIN teams t ON t.team_id = ts.team_id
    JOIN team_seasons tsn ON tsn.team_id = ts.team_id AND tsn.season = ts.season
    WHERE ts.season = $1
    ORDER BY tsn.seed, t.team_name`,
    [SEASON]
  );
}
