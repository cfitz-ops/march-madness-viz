import streamlit as st
import psycopg2
import pandas as pd


@st.cache_resource
def get_connection():
    """Return a psycopg2 connection to Ghost DB using Streamlit secrets."""
    return psycopg2.connect(st.secrets["database"]["url"])


def run_query(sql, params=None):
    """Execute a SQL query and return results as a pandas DataFrame.

    Handles Ghost DB connection errors gracefully (DB may be paused).
    """
    try:
        conn = get_connection()
        return pd.read_sql(sql, conn, params=params)
    except (psycopg2.OperationalError, psycopg2.InterfaceError):
        # Clear cached connection and show friendly error
        get_connection.clear()
        st.error("Data source is waking up — please refresh in 30 seconds.")
        st.stop()
