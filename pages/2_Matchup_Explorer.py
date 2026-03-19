import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import joblib
from utils.style import inject_css, VIVID_PURPLE, PURE_TEAL
from utils.queries import get_team_list, get_team_stats

st.set_page_config(page_title="Matchup Explorer", page_icon="⚔️", layout="wide")
inject_css()

st.title("Matchup Explorer")
st.caption("Head-to-head team comparison with model win probability")

teams = get_team_list(2026)
if teams.empty:
    st.warning("No team data found.")
    st.stop()

team_options = {f"({row['seed']}) {row['team_name']}": row["team_id"] for _, row in teams.iterrows()}

col1, col2 = st.columns(2)
with col1:
    team_a_label = st.selectbox("Team A", list(team_options.keys()), index=0)
with col2:
    team_b_label = st.selectbox("Team B", list(team_options.keys()), index=min(1, len(team_options) - 1))

team_a_id = team_options[team_a_label]
team_b_id = team_options[team_b_label]

if team_a_id == team_b_id:
    st.info("Select two different teams to compare.")
    st.stop()

stats_a = get_team_stats(team_a_id, 2026)
stats_b = get_team_stats(team_b_id, 2026)

if stats_a.empty or stats_b.empty:
    st.error("Stats not found for one or both teams.")
    st.stop()

sa = stats_a.iloc[0]
sb = stats_b.iloc[0]

# Load model and predict
@st.cache_resource
def load_model():
    return joblib.load("assets/model.pkl")

saved = load_model()
model = saved["model"]
features = saved["features"]

# Build feature vector (same sign conventions as simulate.py)
DIFF_MAP = {
    "round": ("_literal", 2),  # assume Round of 32 for generic comparison
    "em_diff": ("a-b", "kenpom_adj_em"),
    "off_diff": ("a-b", "kenpom_adj_o"),
    "def_diff": ("b-a", "kenpom_adj_d"),
    "seed_diff": ("a-b", "seed"),
    "net_diff": ("a-b", "net_ranking"),
    "sos_diff": ("a-b", "strength_of_schedule"),
    "win_pct_diff": ("a-b", "win_pct"),
    "road_win_pct_diff": ("a-b", "road_win_pct"),
    "barthag_diff": ("a-b", "barthag"),
    "tempo_diff": ("a-b", "adj_tempo"),
    "exp_diff": ("a-b", "experience"),
    "talent_diff": ("a-b", "talent"),
    "efg_diff": ("a-b", "efg_pct"),
    "efg_d_diff": ("b-a", "efg_pct_d"),
    "tov_diff": ("b-a", "tov_pct"),
    "tov_d_diff": ("a-b", "tov_pct_d"),
    "three_pt_diff": ("a-b", "three_pt_pct"),
    "three_pt_d_diff": ("b-a", "three_pt_pct_d"),
    "ftr_diff": ("a-b", "ftr"),
    "ftrd_diff": ("b-a", "ftrd"),
    "oreb_diff": ("a-b", "oreb_pct"),
    "dreb_diff": ("a-b", "dreb_pct"),
    "wab_diff": ("a-b", "wab"),
    "coach_pake_diff": ("a-b", "coach_pake"),
    "conf_tourney_wins_diff": ("a-b", "conf_tourney_wins"),
    "conf_tourney_champ_diff": ("a-b", "conf_tourney_champ"),
    "last10_win_pct_diff": ("a-b", "last10_win_pct"),
    "close_game_pct_diff": ("a-b", "close_game_pct"),
    "spread": ("_literal", 0.0),
}

vec = []
for f in features:
    if f not in DIFF_MAP:
        vec.append(0.0)
        continue
    mode, key = DIFF_MAP[f]
    if mode == "_literal":
        vec.append(float(key))
    elif mode == "a-b":
        vec.append(float((sa.get(key, 0) or 0) - (sb.get(key, 0) or 0)))
    elif mode == "b-a":
        vec.append(float((sb.get(key, 0) or 0) - (sa.get(key, 0) or 0)))

X = np.array(vec).reshape(1, -1)
prob_a = float(model.predict_proba(X)[0, 1])
prob_b = 1 - prob_a

# Display win probability
st.markdown("---")
c1, c2, c3 = st.columns([2, 1, 2])
with c1:
    st.markdown(f"### {sa['team_name']}")
    st.metric("Win Probability", f"{prob_a:.0%}")
with c2:
    st.markdown("### vs")
with c3:
    st.markdown(f"### {sb['team_name']}")
    st.metric("Win Probability", f"{prob_b:.0%}")

# Stat comparison chart
st.markdown("---")
st.markdown("### Key Stats Comparison")
st.caption("Percentile rank among all 2026 tournament teams (higher = better)")

DISPLAY_STATS = [
    ("kenpom_adj_em", "KenPom Efficiency", True),
    ("kenpom_adj_o", "Offensive Rating", True),
    ("kenpom_adj_d", "Defensive Rating", False),  # lower is better
    ("win_pct", "Win %", True),
    ("barthag", "Barthag", True),
    ("efg_pct", "eFG%", True),
    ("three_pt_pct", "3PT%", True),
    ("tov_pct", "Turnover %", False),  # lower is better
    ("experience", "Experience", True),
    ("talent", "Talent", True),
    ("wab", "Wins Above Bubble", True),
    ("adj_tempo", "Tempo", True),
]

# Get all tournament team stats for percentile calculation
from utils.db import run_query
all_stats = run_query("""
    SELECT ts.* FROM team_stats ts
    JOIN team_seasons tsn ON tsn.team_id = ts.team_id AND tsn.season = ts.season
    WHERE ts.season = 2026
""")

def percentile_rank(value, column, higher_is_better=True):
    """Compute percentile rank (0-100) for a value within the tournament field."""
    col_data = all_stats[column].dropna()
    if col_data.empty:
        return 50.0
    rank = (col_data < value).sum() / len(col_data) * 100
    return rank if higher_is_better else 100 - rank

stat_names = [s[1] for s in DISPLAY_STATS]
pct_a = [percentile_rank(float(sa.get(s[0], 0) or 0), s[0], s[2]) for s in DISPLAY_STATS]
pct_b = [percentile_rank(float(sb.get(s[0], 0) or 0), s[0], s[2]) for s in DISPLAY_STATS]

fig = go.Figure()
fig.add_trace(go.Bar(
    name=sa["team_name"], x=stat_names, y=pct_a, marker_color=VIVID_PURPLE,
    hovertemplate="%{x}: %{y:.0f}th percentile<extra></extra>",
))
fig.add_trace(go.Bar(
    name=sb["team_name"], x=stat_names, y=pct_b, marker_color=PURE_TEAL,
    hovertemplate="%{x}: %{y:.0f}th percentile<extra></extra>",
))
fig.update_layout(
    barmode="group",
    plot_bgcolor="rgba(0,0,0,0)",
    paper_bgcolor="rgba(0,0,0,0)",
    font_color="#000000",
    height=500,
    margin=dict(l=0, r=0, t=10, b=80),
    legend=dict(orientation="h", yanchor="bottom", y=1.02),
    xaxis_tickangle=-45,
    yaxis=dict(range=[0, 100], title="Percentile"),
)
st.plotly_chart(fig, use_container_width=True)
