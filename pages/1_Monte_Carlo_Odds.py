import streamlit as st
import pandas as pd
import plotly.express as px
from utils.style import inject_css, ELECTRIC_YELLOW, PURE_TEAL, VIVID_PURPLE, TIGER_BLOOD, CHART_COLORS
from utils.queries import get_monte_carlo_odds

st.set_page_config(page_title="Monte Carlo Odds", page_icon="🎲", layout="wide")
inject_css()

st.title("Monte Carlo Odds Board")
st.caption("Win probabilities based on 10,000 bracket simulations")

raw = get_monte_carlo_odds(2026)

if raw.empty:
    st.warning("No Monte Carlo data found. Run `python -m src.simulate 2026 --sims 10000` first.")
    st.stop()

# Pivot: one row per team, columns for each round
ROUND_LABELS = {1: "R32", 2: "Sweet 16", 3: "Elite 8", 4: "Final Four", 5: "Title Game", 6: "Champion"}

pivot = raw.pivot_table(index=["team_name", "seed"], columns="round", values="reach_probability", fill_value=0).reset_index()
pivot.columns = [ROUND_LABELS.get(c, c) if isinstance(c, int) else c for c in pivot.columns]

# Sort by championship odds descending
sort_col = "Champion" if "Champion" in pivot.columns else pivot.columns[-1]
pivot = pivot.sort_values(sort_col, ascending=False)

# Top 10 Championship Favorites bar chart
st.markdown("### Championship Favorites")
top10 = pivot.head(10).copy()
top10["Champion_pct"] = top10[sort_col] * 100

fig = px.bar(
    top10, x="Champion_pct", y="team_name",
    orientation="h",
    labels={"Champion_pct": "Championship %", "team_name": ""},
    color_discrete_sequence=[ELECTRIC_YELLOW],
)
fig.update_layout(
    plot_bgcolor="rgba(0,0,0,0)",
    paper_bgcolor="rgba(0,0,0,0)",
    font_color="#FFFFFF",
    yaxis=dict(autorange="reversed"),
    height=400,
    margin=dict(l=0, r=20, t=10, b=30),
)
st.plotly_chart(fig, use_container_width=True)

# Full odds table
st.markdown("### All Teams")

# Format as percentages for display
display = pivot.copy()
pct_cols = [c for c in ROUND_LABELS.values() if c in display.columns]
for c in pct_cols:
    display[c] = display[c].apply(lambda x: f"{x:.1%}" if x > 0 else "—")

st.dataframe(
    display,
    use_container_width=True,
    hide_index=True,
    column_config={
        "team_name": st.column_config.TextColumn("Team"),
        "seed": st.column_config.NumberColumn("Seed", format="%d"),
    },
)

n_sims = int(raw["n_sims"].iloc[0])
st.caption(f"Based on {n_sims:,} Monte Carlo simulations")
