# Torrance Watch

Nonpartisan civic reference for the City of Torrance. Campaign finance data for the June 2, 2026 municipal election.

**Live site**: [torrancewatch.org](https://torrancewatch.org)
**Staging**: [torrance-watch.dubbl-a.workers.dev](https://torrance-watch.dubbl-a.workers.dev)

## What's live now

Campaign finance tracker covering three races from public NetFile filings:

- **Mayor**: George Chen vs. Sharon Kalani
- **District 1 Council**: Jon Kaji vs. David Kartsonis
- **City Treasurer**: Aurelio Mattucci

Each race page includes donor geography breakdowns, occupation analysis, stat cards, callouts with sourced findings, downloadable CSV data, and footnotes.

## Stack

- [Astro 6](https://astro.build/) with Content Collections
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) with Static Assets
- [Plotly.js](https://plotly.com/javascript/) basic partial bundle for charts
- Vanilla CSS, no frameworks
- Node 22+

## Development

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static build to dist/
```

## Deployment

```bash
npm run build
wrangler deploy    # deploys to Cloudflare Workers
```

Production deploys from the `master` branch. The Cloudflare adapter generates its own `wrangler.json` at build time in `dist/server/`; the root `wrangler.toml` provides the project name and asset directory.

## Project structure

```
src/
  components/       SignupForm, PlotlyChart
  content/          races/ and candidates/ JSON collections
  content.config.ts Zod schemas for content collections
  data/             site.ts config, finance-2026/ (reserved)
  layouts/          BaseLayout, RaceLayout
  pages/            index, about, finance/2026/[race], candidates/
  styles/           global.css (ported from legacy)
public/
  data/finance-2026/ CSV files served as static assets
  favicon.svg, favicon.png, robots.txt
legacy/             Original Chart.js site (visual reference)
scripts/            recompute-callouts.mjs (CSV analysis)
```

## Editorial standard

Equal treatment of all candidates in every race. Same depth, same tone, same layout. Every factual claim sourced from public records. See [About](https://torrancewatch.org/about) for the full statement.

## Legacy redirects

The original site was at `dubbl-a.github.io/torrance-2026`. A separate redirect repo at [dubbl-a/torrance-2026](https://github.com/dubbl-a/torrance-2026) maps legacy URLs to their new equivalents on torrancewatch.org.

## License

Content is original editorial work. Code is available for reference.
