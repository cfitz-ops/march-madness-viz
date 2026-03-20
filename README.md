# March Madness Predictor

NCAA tournament bracket predictions powered by logistic regression.

Built with Next.js, Tailwind CSS, and Recharts. Data served from Ghost DB (managed Postgres) via static generation.

## Development

```bash
npm install
npm run dev
```

Requires `GHOST_CONNECTION_STRING` in `.env.local`.

## Deploy

Push to main triggers Vercel deployment. To update data after running predictions:

```bash
./deploy.sh
```

## Pages

- **/** — Full tournament bracket
- **/odds** — Monte Carlo simulation odds board
- **/matchup** — Head-to-head team comparison
- **/features** — Model feature importance
