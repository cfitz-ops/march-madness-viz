#!/usr/bin/env python3
"""Extract model coefficients from model.pkl to data/model.json.

Run from the march-madness-viz repo root:
    python scripts/extract_model.py /path/to/march-madness/models/model.pkl
"""
import json
import sys
import joblib

FEATURE_LABELS = {
    "round": "Tournament Round",
    "em_diff": "KenPom Efficiency Margin",
    "off_diff": "Offensive Rating",
    "def_diff": "Defensive Rating",
    "seed_diff": "Seed Difference",
    "net_diff": "NET Ranking",
    "sos_diff": "Strength of Schedule",
    "win_pct_diff": "Win Percentage",
    "road_win_pct_diff": "Road Win %",
    "barthag_diff": "Barthag (Power Rating)",
    "tempo_diff": "Tempo",
    "exp_diff": "Experience",
    "talent_diff": "Talent Rating",
    "efg_diff": "Effective FG%",
    "efg_d_diff": "Defensive eFG%",
    "tov_diff": "Turnover %",
    "tov_d_diff": "Defensive Turnover %",
    "three_pt_diff": "3-Point %",
    "three_pt_d_diff": "3-Point Defense %",
    "ftr_diff": "Free Throw Rate",
    "wab_diff": "Wins Above Bubble",
    "coach_pake_diff": "Coach PAKE",
    "conf_tourney_wins_diff": "Conference Tourney Wins",
    "conf_tourney_champ_diff": "Conference Tourney Champ",
    "last10_win_pct_diff": "Last 10 Games Win %",
    "close_game_pct_diff": "Close Game Win %",
}

FEATURE_EXPLANATIONS = {
    "Betting Spread": "Vegas point spread — the single strongest predictor. Incorporates injury news, matchup context, and public/sharp money that pure stats miss.",
    "Coach PAKE": "Coaching quality measured by historical post-season performance. Tournament experience matters.",
    "Strength of Schedule": "How tough a team's regular season opponents were. Battle-tested teams fare better.",
    "Barthag (Power Rating)": "Barttorvik's power rating — estimated probability of beating an average D1 team.",
    "Effective FG%": "Shooting efficiency adjusted for 3-pointers being worth more. Better shooters advance.",
    "Offensive Rating": "Points scored per 100 possessions. Efficient offenses win tournament games.",
    "KenPom Efficiency Margin": "The gap between a team's offensive and defensive efficiency — the gold standard power rating.",
    "Defensive Rating": "Points allowed per 100 possessions. Tournament games are lower-scoring — defense travels.",
    "Tempo": "Pace of play. Faster-tempo teams tend to underperform in March — the model penalizes this.",
    "Tournament Round": "Later rounds favor stronger teams — upsets are more common early.",
    "3-Point Defense %": "How well a team defends the three-point line. Limiting threes matters in single-elimination.",
    "Seed Difference": "Higher seeds (lower numbers) win more often, but carries less weight than you'd think.",
    "Road Win %": "Winning away from home. Tournament games are on neutral courts — road warriors adapt.",
    "Defensive Turnover %": "How often a team forces turnovers. Disruptive defenses create extra possessions.",
    "Close Game Win %": "Win percentage in games decided by 5 or fewer points. Clutch play under pressure.",
    "Win Percentage": "Overall regular season win rate. A baseline signal for team quality.",
}


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/extract_model.py /path/to/model.pkl")
        sys.exit(1)

    saved = joblib.load(sys.argv[1])
    model = saved["model"]
    features = saved["features"]

    scaler = model.named_steps["scaler"]
    clf = model.named_steps["clf"]

    data = {
        "features": features,
        "coefficients": clf.coef_[0].tolist(),
        "intercept": float(clf.intercept_[0]),
        "classes": clf.classes_.tolist(),
        "scaler_mean": scaler.mean_.tolist(),
        "scaler_scale": scaler.scale_.tolist(),
        "labels": {f: FEATURE_LABELS.get(f, f) for f in features},
        "explanations": FEATURE_EXPLANATIONS,
    }

    with open("data/model.json", "w") as f:
        json.dump(data, f, indent=2)

    print(f"Extracted {len(features)} features to data/model.json")
    print(f"Classes: {data['classes']} (index 1 = team_a wins)")


if __name__ == "__main__":
    main()
