from utils.db import run_query


def get_bracket_results(season=2026):
    """Full bracket with team names, seeds, and predictions."""
    return run_query("""
        SELECT
            br.slot, br.round,
            ta.team_name AS team_a, tb.team_name AS team_b,
            tw.team_name AS predicted_winner,
            br.team_a_win_prob,
            tsa.seed AS seed_a, tsb.seed AS seed_b
        FROM bracket_results br
        JOIN teams ta ON ta.team_id = br.team_a_id
        JOIN teams tb ON tb.team_id = br.team_b_id
        LEFT JOIN teams tw ON tw.team_id = br.winner_id
        JOIN team_seasons tsa ON tsa.team_id = br.team_a_id AND tsa.season = br.season
        JOIN team_seasons tsb ON tsb.team_id = br.team_b_id AND tsb.season = br.season
        WHERE br.season = %(season)s AND br.sim_type = 'deterministic'
        ORDER BY br.round, br.slot
    """, params={"season": season})


def get_monte_carlo_odds(season=2026):
    """Monte Carlo win probabilities pivoted by round."""
    return run_query("""
        SELECT
            t.team_name,
            ts.seed,
            m.round,
            m.reach_probability,
            m.n_sims
        FROM monte_carlo_odds m
        JOIN teams t ON t.team_id = m.team_id
        JOIN team_seasons ts ON ts.team_id = m.team_id AND ts.season = %(season)s
        WHERE m.season = %(season)s
        ORDER BY m.round DESC, m.reach_probability DESC
    """, params={"season": season})


def get_team_list(season=2026):
    """All tournament teams for dropdown selectors."""
    return run_query("""
        SELECT t.team_id, t.team_name, t.conference, ts.seed
        FROM teams t
        JOIN team_seasons ts ON ts.team_id = t.team_id
        WHERE ts.season = %(season)s
        ORDER BY ts.seed, t.team_name
    """, params={"season": season})


def get_team_stats(team_id, season=2026):
    """All stats for a single team."""
    return run_query("""
        SELECT ts.*, t.team_name, t.conference, tsn.seed
        FROM team_stats ts
        JOIN teams t ON t.team_id = ts.team_id
        JOIN team_seasons tsn ON tsn.team_id = ts.team_id AND tsn.season = ts.season
        WHERE ts.team_id = %(team_id)s AND ts.season = %(season)s
    """, params={"team_id": team_id, "season": season})
