import streamlit as st
import psycopg
import pandas as pd


@st.cache_resource
def get_connection():
    """Return a psycopg connection to Ghost DB using Streamlit secrets."""
    return psycopg.connect(st.secrets["database"]["url"], autocommit=True)


def run_query(sql, params=None):
    """Execute a SQL query and return results as a pandas DataFrame.

    Handles Ghost DB connection errors gracefully (DB may be paused).
    """
    try:
        conn = get_connection()
        return pd.read_sql(sql, conn, params=params)
    except (psycopg.OperationalError, psycopg.InterfaceError):
        # Clear cached connection and show friendly error
        get_connection.clear()
        st.error("Data source is waking up — please refresh in 30 seconds.")
        st.stop()
