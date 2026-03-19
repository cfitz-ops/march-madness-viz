import streamlit as st

# Tiger Data brand colors
ELECTRIC_YELLOW = "#F5FF80"
TIGER_BLOOD = "#FF7044"
PURE_TEAL = "#14D7D8"
VIVID_PURPLE = "#7558FF"
BLACK = "#000000"
GRAY = "#E9E9E9"
WHITE = "#FFFFFF"

# Plotly chart color sequences
CHART_COLORS = [ELECTRIC_YELLOW, PURE_TEAL, VIVID_PURPLE, TIGER_BLOOD]
TEAM_A_COLOR = PURE_TEAL
TEAM_B_COLOR = VIVID_PURPLE
POSITIVE_COLOR = PURE_TEAL
NEGATIVE_COLOR = TIGER_BLOOD


def inject_css():
    """Inject Tiger Data brand CSS overrides into the Streamlit page."""
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;600&display=swap');

    /* Data values in monospace */
    .stMetric [data-testid="stMetricValue"],
    .stDataFrame td {
        font-family: 'Geist Mono', monospace !important;
    }

    /* Sidebar styling */
    [data-testid="stSidebar"] {
        background-color: #F5F5F5;
    }

    /* Hide Streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}

    /* Link colors */
    a { color: #7558FF !important; }
    </style>
    """, unsafe_allow_html=True)
