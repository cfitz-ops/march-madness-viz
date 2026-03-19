import streamlit as st
import pandas as pd
import plotly.express as px
import joblib
from utils.style import inject_css, PURE_TEAL, VIVID_PURPLE

inject_css()

st.title("Feature Importance")
st.caption("How much weight does each stat carry in the model's predictions?")


@st.cache_resource
def load_model():
    return joblib.load("assets/model.pkl")


saved = load_model()
model = saved["model"]
features = saved["features"]

# Extract coefficients from the pipeline
coefficients = model.named_steps["clf"].coef_[0]

# Build DataFrame
df = pd.DataFrame({
    "feature": features,
    "coefficient": coefficients,
    "abs_coefficient": abs(coefficients),
}).sort_values("abs_coefficient", ascending=True)

# Readable feature names
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
    "ftrd_diff": "Defensive FT Rate",
    "oreb_diff": "Offensive Rebound %",
    "dreb_diff": "Defensive Rebound %",
    "wab_diff": "Wins Above Bubble",
    "coach_pake_diff": "Coach PAKE",
    "conf_tourney_wins_diff": "Conference Tourney Wins",
    "conf_tourney_champ_diff": "Conference Tourney Champ",
    "last10_win_pct_diff": "Last 10 Games Win %",
    "close_game_pct_diff": "Close Game Win %",
    "spread": "Betting Spread",
}

df["label"] = df["feature"].map(FEATURE_LABELS).fillna(df["feature"])
df["direction"] = df["coefficient"].apply(lambda x: "Higher = more likely to win" if x > 0 else "Higher = less likely to win")

fig = px.bar(
    df, x="coefficient", y="label",
    orientation="h",
    color="direction",
    color_discrete_map={"Higher = more likely to win": PURE_TEAL, "Higher = less likely to win": VIVID_PURPLE},
    labels={"coefficient": "Model Weight", "label": ""},
)
fig.update_layout(
    plot_bgcolor="rgba(0,0,0,0)",
    paper_bgcolor="rgba(0,0,0,0)",
    font_color="#FFFFFF",
    height=max(400, len(df) * 28),
    margin=dict(l=0, r=20, t=10, b=30),
    legend=dict(orientation="h", yanchor="bottom", y=1.02),
    showlegend=True,
)
st.plotly_chart(fig, use_container_width=True)

st.markdown("---")
st.markdown("### How to Read This Chart")
st.markdown("""
Each bar represents a stat the model uses to predict winners. **Longer bars = more influence** on the prediction.

- **Teal bars (right):** When a team scores higher in this stat, the model gives them a better chance of winning. For example, a team with a great Coach PAKE rating gets a significant boost.
- **Purple bars (left):** These stats have an inverse relationship — a higher value here actually correlates with losing. For example, faster-tempo teams tend to underperform in the tournament according to our model.

The model considers all of these features together for each matchup, not in isolation.
""")

# Top features explanation
st.markdown("---")
st.markdown("### Top 5 Predictors")

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

top5 = df.nlargest(5, "abs_coefficient")
for _, row in top5.iterrows():
    label = row["label"]
    explanation = FEATURE_EXPLANATIONS.get(label, "")
    weight = abs(row["coefficient"])
    st.markdown(f"**{label}** (weight: `{weight:.3f}`) — {explanation}")
