import streamlit as st

st.set_page_config(
    page_title="March Madness Predictor",
    page_icon="🏀",
    layout="wide",
)

bracket = st.Page("bracket_page.py", title="Bracket", icon="🏀", default=True)
monte_carlo = st.Page("pages/1_Monte_Carlo_Odds.py", title="Monte Carlo Odds", icon="🎲")
matchup = st.Page("pages/2_Matchup_Explorer.py", title="Matchup Explorer", icon="🔍")
features = st.Page("pages/3_Feature_Importance.py", title="Feature Importance", icon="🔬")

pg = st.navigation([bracket, monte_carlo, matchup, features])
pg.run()
