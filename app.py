import streamlit as st
from utils.style import inject_css, ELECTRIC_YELLOW, TIGER_BLOOD
from utils.queries import get_bracket_results

st.set_page_config(
    page_title="March Madness Predictor",
    page_icon="🏀",
    layout="wide",
)
inject_css()

st.title("2026 NCAA Tournament Bracket")
st.caption("Logistic regression model · KenPom + Barttorvik + Coach PAKE")

df = get_bracket_results(2026)

if df.empty:
    st.warning("No bracket data found. Run the simulation first.")
    st.stop()

# Region mapping from slot prefix
REGION_MAP = {"W": "West", "X": "South", "Y": "East", "Z": "Midwest"}
ROUND_NAMES = {1: "Round of 64", 2: "Round of 32", 3: "Sweet 16", 4: "Elite Eight", 5: "Final Four", 6: "Championship"}

# Bracket visual order: adjacent games feed into each other in the next round
# 1v16 plays winner of 8v9, 5v12 plays winner of 4v13, etc.
VISUAL_ORDER = {
    1: [1, 8, 5, 4, 6, 3, 7, 2],  # R64: 8 games per region
    2: [1, 4, 3, 2],               # R32: 4 games per region
    3: [1, 2],                      # S16: 2 games per region
    4: [1],                         # E8: 1 game per region
}


def bracket_sort_key(slot):
    """Sort slot names in visual bracket order (not seed-pair order)."""
    rnd = int(slot[1])
    num = int(slot[3:])
    order = VISUAL_ORDER.get(rnd, list(range(1, 20)))
    try:
        return order.index(num)
    except ValueError:
        return num


# Build HTML bracket
def pick_prob(row):
    p = row["team_a_win_prob"]
    return p if row["predicted_winner"] == row["team_a"] else 1 - p


def is_upset(row):
    if row["predicted_winner"] == row["team_a"]:
        return row["seed_a"] > row["seed_b"]
    return row["seed_b"] > row["seed_a"]


def game_card_html(row):
    prob = pick_prob(row)
    upset = is_upset(row)
    accent = TIGER_BLOOD if upset else ELECTRIC_YELLOW

    def team_row(name, seed, is_winner):
        if is_winner:
            return f'<div style="display:flex;justify-content:space-between;padding:4px 8px;border-left:3px solid {accent};background:rgba(245,255,128,0.1);font-weight:600;"><span>({seed}) {name}</span><span style="color:{accent};font-size:0.8em">{prob:.0%}</span></div>'
        return f'<div style="padding:4px 8px;color:#888;">({seed}) {name}</div>'

    a_wins = row["predicted_winner"] == row["team_a"]
    return f'''<div style="border:1px solid #333;border-radius:4px;overflow:hidden;margin:2px 0;font-size:0.85em;background:#0e1219;{'border-color:' + TIGER_BLOOD + ';' if upset else ''}">
        {team_row(row["team_a"], row["seed_a"], a_wins)}
        {team_row(row["team_b"], row["seed_b"], not a_wins)}
    </div>'''


# Show championship result prominently
champ = df[df["round"] == 6]
if not champ.empty:
    winner = champ.iloc[0]["predicted_winner"]
    prob = pick_prob(champ.iloc[0])
    st.markdown(f"### 🏆 Predicted Champion: **{winner}** ({prob:.0%} confidence)")

# Display by region for rounds 1-4
st.markdown("---")

for region_code, region_name in REGION_MAP.items():
    with st.expander(f"**{region_name} Region**", expanded=True):
        region_games = df[(df["slot"].str.contains(region_code)) & (df["round"].between(1, 4))]
        if region_games.empty:
            continue

        cols = st.columns(4)
        for i, rnd in enumerate([1, 2, 3, 4]):
            with cols[i]:
                st.markdown(f"**{ROUND_NAMES[rnd]}**")
                rnd_games = region_games[region_games["round"] == rnd].copy()
                rnd_games["_sort"] = rnd_games["slot"].apply(bracket_sort_key)
                rnd_games = rnd_games.sort_values("_sort")
                for _, row in rnd_games.iterrows():
                    st.markdown(game_card_html(row), unsafe_allow_html=True)

# Final Four and Championship
st.markdown("---")
st.markdown("### Final Four & Championship")
cols = st.columns(3)
with cols[0]:
    st.markdown("**Final Four**")
    for _, row in df[df["round"] == 5].iterrows():
        st.markdown(game_card_html(row), unsafe_allow_html=True)
with cols[1]:
    st.markdown("**Championship**")
    for _, row in df[df["round"] == 6].iterrows():
        st.markdown(game_card_html(row), unsafe_allow_html=True)
