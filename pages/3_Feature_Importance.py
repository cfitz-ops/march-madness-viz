import streamlit as st
import pandas as pd
import plotly.express as px
import joblib
from utils.style import inject_css, PURE_TEAL, TIGER_BLOOD

st.set_page_config(page_title="Feature Importance", page_icon="🔬", layout="wide")
inject_css()

st.title("Feature Importance")
st.caption("Which stats drive the model's predictions?")


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
df["direction"] = df["coefficient"].apply(lambda x: "Favors Team A" if x > 0 else "Favors Team B")

fig = px.bar(
    df, x="coefficient", y="label",
    orientation="h",
    color="direction",
    color_discrete_map={"Favors Team A": PURE_TEAL, "Favors Team B": TIGER_BLOOD},
    labels={"coefficient": "Coefficient (scaled)", "label": ""},
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

# Top features explanation
st.markdown("---")
st.markdown("### What Matters Most")

top5 = df.nlargest(5, "abs_coefficient")
for _, row in top5.iterrows():
    direction = "↑" if row["coefficient"] > 0 else "↓"
    st.markdown(f"**{row['label']}** — coefficient: `{row['coefficient']:.4f}` {direction}")
