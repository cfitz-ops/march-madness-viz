// lib/types.ts

export interface BracketGame {
  slot: string;
  round: number;
  team_a: string;
  team_b: string;
  predicted_winner: string;
  team_a_win_prob: number;
  seed_a: number;
  seed_b: number;
}

export interface MonteCarloRow {
  team_name: string;
  seed: number;
  round: number;
  reach_probability: number;
  n_sims: number;
}

export interface MonteCarloTeam {
  team_name: string;
  seed: number;
  region: string;
  r32: number;
  sweet16: number;
  elite8: number;
  final4: number;
  titleGame: number;
  champion: number;
}

export interface TeamStats {
  team_id: number;
  team_name: string;
  conference: string;
  seed: number;
  kenpom_adj_em: number;
  kenpom_adj_o: number;
  kenpom_adj_d: number;
  net_ranking: number;
  win_pct: number;
  road_win_pct: number;
  barthag: number;
  strength_of_schedule: number;
  adj_tempo: number;
  experience: number;
  talent: number;
  efg_pct: number;
  efg_pct_d: number;
  three_pt_pct: number;
  three_pt_pct_d: number;
  tov_pct: number;
  tov_pct_d: number;
  oreb_pct: number;
  dreb_pct: number;
  ftr: number;
  ftrd: number;
  wab: number;
  coach_pake: number;
  conf_tourney_wins: number;
  conf_tourney_champ: number;
  last10_win_pct: number;
  close_game_pct: number;
  [key: string]: unknown; // allow dynamic access for DIFF_MAP
}

export interface ModelData {
  features: string[];
  coefficients: number[];
  intercept: number;
  classes: number[];
  scaler_mean: number[];
  scaler_scale: number[];
  labels: Record<string, string>;
  explanations: Record<string, string>;
}
