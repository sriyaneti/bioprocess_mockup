# Formo Integration Layer — Mockup

A clickable prototype of an integration/analytics layer for Formo's bioprocess
data: strain engineering → fermentation → downstream → functionality →
application testing. All data is simulated (12 strains, 36 batches); nothing
here reads a real system.

## Running it

```bash
npm install
npm run dev
```

Opens the landing page first (`src/outer.jsx`) — click **Launch Demo** to
enter the console.

## Structure

- `src/outer.jsx` — landing page: dataset overview, cross-pillar analysis blurb, launch button.
- `src/integration_layer/` — the console (`integration_layer.jsx` is the shell: sidebar, header, page routing). Pages:
  - `PipelinesPage.jsx` — **Pipelines**: the orchestration flow (ingest → resolve IDs → thread → load → analyze), per-stage retry/failure history, and a before/after comparison against Formo's current manual import process.
  - `Insights.jsx` — **Insights**: DO-vs-meltability descriptive stats, plus PLS Regression and Random Forest tabs showing what multivariate/ML analysis adds beyond single-variable correlation.
  - `ConnectionsPage.jsx` — **Connections**: source systems feeding the layer and how each one's raw fields map to a canonical schema.
  - `GraphDatabase.jsx` — **Graph database**: node/edge traceability (strain → batch → lot → test → application), framed as a concept that can sit on top of Formo's existing relational + TimescaleDB stack.
  - `DataBrowser.jsx` — **Data browser**: the flat, tabular view of the same records.
  - `theme.js` / `ui.jsx` — shared palette and small presentational components (status pills, sparklines).
- `src/data.js` — the simulated dataset and derived stats, shared by every page above.

## Notes

- This was adapted after feedback from Formo's engineering lead — it leads with orchestration and analytics (the two areas they confirmed as gaps), and no longer proposes replacing their relational + TimescaleDB stack with a graph database or standardizing instrument ingestion on OPC UA/SiLA.
- Built with React 19 + Vite + Recharts. No backend — everything renders from `src/data.js`.
