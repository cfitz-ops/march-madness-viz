# March Madness Bracket Visualizer

Interactive bracket predictions for the 2026 NCAA tournament, powered by a logistic regression model and [Ghost DB](https://ghost.dev) (managed Postgres).

## Features

- **Interactive Bracket** — Visual tournament bracket with predicted winners and confidence levels
- **Monte Carlo Odds** — Championship and round-by-round probabilities from 10,000 simulations
- **Matchup Explorer** — Head-to-head team comparison with model win probability
- **Feature Importance** — Which stats drive the model's predictions

## Run Locally

```bash
pip install -r requirements.txt
streamlit run app.py
```

Requires a `.streamlit/secrets.toml` with your Ghost DB connection string:

```toml
[database]
url = "postgresql://..."
```

## Built With

- [Streamlit](https://streamlit.io) — App framework
- [Ghost DB](https://ghost.dev) — Managed Postgres for analytics
- [scikit-learn](https://scikit-learn.org) — Logistic regression model
- [Plotly](https://plotly.com) — Interactive charts
