// lib/matchup.ts
import type { TeamStats, ModelData } from "./types";

/**
 * DIFF_MAP defines how to compute each model feature from two teams' stats.
 * "a-b" = team_a value minus team_b value
 * "b-a" = team_b value minus team_a value (for stats where lower is better)
 * "_literal" = use a fixed value
 */
const DIFF_MAP: Record<string, [string, string | number]> = {
  round: ["_literal", 2],
  em_diff: ["a-b", "kenpom_adj_em"],
  off_diff: ["a-b", "kenpom_adj_o"],
  def_diff: ["b-a", "kenpom_adj_d"],
  seed_diff: ["a-b", "seed"],
  net_diff: ["a-b", "net_ranking"],
  sos_diff: ["a-b", "strength_of_schedule"],
  win_pct_diff: ["a-b", "win_pct"],
  road_win_pct_diff: ["a-b", "road_win_pct"],
  barthag_diff: ["a-b", "barthag"],
  tempo_diff: ["a-b", "adj_tempo"],
  exp_diff: ["a-b", "experience"],
  talent_diff: ["a-b", "talent"],
  efg_diff: ["a-b", "efg_pct"],
  efg_d_diff: ["b-a", "efg_pct_d"],
  tov_diff: ["b-a", "tov_pct"],
  tov_d_diff: ["a-b", "tov_pct_d"],
  three_pt_diff: ["a-b", "three_pt_pct"],
  three_pt_d_diff: ["b-a", "three_pt_pct_d"],
  ftr_diff: ["a-b", "ftr"],
  wab_diff: ["a-b", "wab"],
  coach_pake_diff: ["a-b", "coach_pake"],
  conf_tourney_wins_diff: ["a-b", "conf_tourney_wins"],
  conf_tourney_champ_diff: ["a-b", "conf_tourney_champ"],
  last10_win_pct_diff: ["a-b", "last10_win_pct"],
  close_game_pct_diff: ["a-b", "close_game_pct"],
};

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function getStatValue(stats: TeamStats, key: string): number {
  const val = stats[key];
  return typeof val === "number" ? val : 0;
}

/**
 * Build feature vector for the model from two teams' stats.
 * Returns array aligned with model.features ordering.
 */
export function buildFeatureVector(
  teamA: TeamStats,
  teamB: TeamStats,
  features: string[]
): number[] {
  return features.map((f) => {
    const mapping = DIFF_MAP[f];
    if (!mapping) return 0;

    const [mode, key] = mapping;
    if (mode === "_literal") return key as number;
    if (mode === "a-b")
      return getStatValue(teamA, key as string) - getStatValue(teamB, key as string);
    if (mode === "b-a")
      return getStatValue(teamB, key as string) - getStatValue(teamA, key as string);
    return 0;
  });
}

/**
 * Predict win probability for team A using extracted model coefficients.
 * Applies StandardScaler, then logistic regression.
 * Returns probability that team_a wins (classes_[1]).
 */
export function predictWinProbability(
  teamA: TeamStats,
  teamB: TeamStats,
  model: ModelData
): number {
  const raw = buildFeatureVector(teamA, teamB, model.features);

  // Apply StandardScaler: (x - mean) / scale
  const scaled = raw.map(
    (val, i) => (val - model.scaler_mean[i]) / model.scaler_scale[i]
  );

  // Dot product + intercept
  const logit = scaled.reduce(
    (sum, val, i) => sum + val * model.coefficients[i],
    model.intercept
  );

  // sigmoid gives P(class=1) which is P(team_a_wins) since classes=[0,1]
  return sigmoid(logit);
}

/**
 * Compute percentile rank (0-100) for a value within a dataset.
 * higherIsBetter=false inverts the ranking (e.g., defensive rating).
 */
export function percentileRank(
  value: number,
  allValues: number[],
  higherIsBetter = true
): number {
  const valid = allValues.filter((v) => v != null && !isNaN(v));
  if (valid.length === 0) return 50;
  const rank = valid.filter((v) => v < value).length / valid.length * 100;
  return higherIsBetter ? rank : 100 - rank;
}
