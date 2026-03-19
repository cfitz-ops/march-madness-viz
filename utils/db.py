import streamlit as st
import psycopg
import pandas as pd


def _connect():
    """Create a new psycopg connection to Ghost DB."""
    return psycopg.connect(
        st.secrets["database"]["url"],
        autocommit=True,
        connect_timeout=10,
    )


def run_query(sql, params=None):
    """Execute a SQL query and return results as a pandas DataFrame.

    Creates a fresh connection per query to avoid stale connection issues.
    Handles Ghost DB connection errors gracefully (DB may be paused).
    """
    try:
        with _connect() as conn:
            return pd.read_sql(sql, conn, params=params)
    except (psycopg.OperationalError, psycopg.InterfaceError, OSError):
        st.error("Data source is waking up — please refresh in 30 seconds.")
        st.stop()
