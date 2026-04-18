# Torrance Watch

## What this site is
A standing nonpartisan civic reference for the City of Torrance. Launched April 2026 with coverage of the June 2 municipal election (mayor, 3 council races, treasurer), continuing indefinitely as a year-round civic resource. The site is not a campaign, not an endorsement engine, not an advocacy org.

## Editorial bright line
Equal treatment of all candidates in every race. Same depth, same tone, same layout, same data presentation. If a fact appears for one candidate in a race, the equivalent fact must appear for every other candidate in that race or not at all. Never editorialize. Never interpret motive. Attribute every factual claim to a public source via a numbered superscript footnote. This is the project's primary credibility asset. Do not cross this line.

## Stack
- Astro 6 (stable, released March 2026) with Content Collections
- Node 22+ required (Astro 6 dropped Node 18 and 20)
- Cloudflare Workers with Static Assets (deployment target, first-class support in Astro 6)
- Plotly.js basic partial bundle (plotly.js-basic-dist-min) for data visualizations
- @astrojs/sitemap for sitemap generation
- Vanilla CSS with custom properties (no Tailwind, no CSS-in-JS)
- TypeScript for component logic and schemas
- No React unless absolutely needed for an island of interactivity

## Design system
Typography: Playfair Display (headings, serif) + Source Sans 3 (body, sans). Already on Google Fonts. Do not add other fonts.

Color palette (defined in src/styles/global.css, ported from legacy/shared.css):
- Primary accent red: #C0392B (also #A32D2D, #7A2020 for the top-accent gradient)
- Secondary accent green: #1D9E75 (Kalani/Kartsonis)
- Body text: #1a1a1a on background #FAF9F6
- Muted text: #666 to #999 range
- Card backgrounds: #fefbfa, #F0EEEA

Layout: max-width 680px for content pages, centered. Mobile-first. The CSS has a full system of scroll reveals, stat cards, callouts, legends, footnotes. Reuse these patterns -- do not redesign.

Callouts: Race finance pages use 4-callout grids where callout #1 spans full width. Use the existing `.callout`, `.callout.accent-red`, `.callout.accent-amber`, `.callout.accent-slate` classes. Do not invent new accent variants.

## Visualizations

**Library**: Plotly.js basic partial bundle (plotly.js-basic-dist-min, ~200KB gzipped). Load via CDN `<script>` tag only on pages that have charts. Do not load globally.

**Loading pattern** (per-page, inside the .astro file):
```html
<script src="https://cdn.plot.ly/plotly-basic-3.5.0.min.js" is:inline></script>
```

**Chart style constraints**:
- Horizontal bar charts for proportional comparisons. Never pie or donut charts.
- Muted palette only. Use the brand colors. No Plotly default purples, teals, or oranges.
- Modebar hidden by default: `config: { displayModeBar: false }`. Re-enable to 'hover' on specific charts if zoom/download genuinely helps the reader.
- Remove Plotly branding: `config: { displaylogo: false }`.
- Visual spec: /legacy/shared.js contains the Chart.js helpers that defined the original aesthetic (borderRadius, label positioning, muted tick colors, animation). Plotly charts should match this feel.

**Chart configs as data**: Plotly `data + layout + config` objects are stored as fields inside the race content collection entries. The PlotlyChart component reads config and calls Plotly.newPlot.

**Reusable component**: src/components/charts/PlotlyChart.astro takes `id`, `data`, `layout`, `config`, and `height` props. Used on all race finance pages.

## File conventions
- Components in PascalCase.astro
- Content files in kebab-case.json
- Utilities and data files in kebab-case.ts or kebab-case.js
- One component per file, colocated CSS via <style> blocks inside .astro files
- Global styles only in src/styles/global.css

## Content collections

Schemas live in `src/content.config.ts` (Astro 6 location, not src/content/config.ts).

- `races`: one entry per race in src/content/races/. Currently: mayor-2026, district-1-2026, treasurer-2026. Schema includes pageTitle, headline, dek, source, sections (geo chart, optional stats, occupation chart, optional contrast chart), csvFiles, callouts, and footnotes. Each chart section has its own heading, sub text, legend, and Plotly chart config.
- `candidates`: one entry per candidate in src/content/candidates/. Currently: george-chen, sharon-kalani, jon-kaji, david-kartsonis, aurelio-mattucci. Schema is intentionally loose -- required fields are name, slug, office, raceSlug. Optional Sprint 2 fields: shortBio, keyPositions, endorsements, sourcesConsulted, website, photoSrc.

Footnotes are first-class on race pages -- schema includes a `footnotes` array of `{ number, body }` objects. Every factual claim on a race page must link to a numbered footnote.

Do not tighten the candidate schema without checking with Aaron first.

## Signup form
Single form component, src/components/SignupForm.astro. Controlled by `SIGNUP_ENABLED` flag in src/data/site.ts (currently `false`). When false, the component renders nothing and all parent sections wrapping it are hidden via `{SIGNUP_ENABLED && (...)}`.

When enabled, the form posts JSON `{ email, zip, source: 'torrancewatch.org' }` to `SIGNUP_ENDPOINT` in src/data/site.ts (currently empty string). With an empty endpoint, the form logs to console and shows success state for testing. When Aaron picks a backend, only the endpoint URL changes.

Fields: email (required), zip (optional, 5 digits). No name field.

## Deployment

**Production**: Cloudflare Workers with Static Assets at torrancewatch.org.
- `@astrojs/cloudflare` adapter with `output: 'static'`
- `trailingSlash: 'never'` and `build.format: 'file'` for clean URLs
- `wrangler.toml` at repo root defines project name and assets directory
- The adapter generates `dist/server/wrangler.json` at build time with the Worker entry point
- `master` branch is production

**Commands**:
```bash
npm run dev       # local dev server at http://localhost:4321
npm run build     # build to dist/
wrangler deploy   # deploy to Cloudflare Workers
```

**Staging**: torrance-watch.dubbl-a.workers.dev (same Worker, deployed from any branch).

**Legacy redirects**: The original GitHub Pages site at dubbl-a.github.io/torrance-2026 redirects to torrancewatch.org via a separate repo (dubbl-a/torrance-2026).

**Known issue**: The @astrojs/cloudflare 13.x adapter auto-provisions a KV namespace for sessions (torrance-watch-session). There is no flag to disable this. The namespace is empty, unused, and free-tier.

## SEO and meta
- Open Graph + Twitter Card meta tags in BaseLayout.astro with per-page overrides via ogTitle, ogDescription, ogImage props
- Canonical link tags on all pages using the torrancewatch.org production domain
- @astrojs/sitemap generates sitemap-index.xml on build
- robots.txt in public/ allows all crawlers
- TODO: og-default.png needs to be created before sharing links publicly

## CSV data
Donor CSV files are in `public/data/finance-2026/` and served as static assets. Race pages link to them via `<a>` tags with `download` attributes. The `scripts/recompute-callouts.mjs` script parses these CSVs to compute parallel statistics for callout copy (real estate donor counts, average donation by geography). Run it when new filings come in.

## What not to do
- Don't add Tailwind or other utility CSS frameworks
- Don't add Chart.js, ECharts, D3, or any other charting library. Plotly only.
- Don't load Plotly globally. Per-page only.
- Don't use the full Plotly bundle. Basic partial bundle only (bar, pie, scatter).
- Don't enable Plotly's mode bar by default. Hide it unless a specific chart genuinely benefits.
- Don't add React components unless the interactivity genuinely requires it (Plotly works via plain script tags)
- Don't add analytics tags beyond Cloudflare Web Analytics
- Don't embed Google Analytics, Meta Pixel, or any third-party tracker
- Don't add comment systems, social login, or user-generated content features
- Don't use em dashes in body copy (project style preference)
- Don't write candidate copy that interprets motive, strategy, or character. Stick to verifiable public facts.
- Don't redesign the visual language. The existing aesthetic is a credibility asset.
- Don't hardcode the workers.dev staging URL in meta tags or canonical links. Use torrancewatch.org.
- Don't commit .env files, Cloudflare account IDs, or API keys

## Reference: legacy site
The /legacy/ directory contains the original Chart.js finance site. It is preserved as a visual reference for design matching. Do not modify it. Do not serve it. Do not delete it until the design has been verified against it.

## Who this is for
Torrance residents trying to figure out their ballot, research a candidate, or understand a council decision. Not political professionals. Not national media. Not lawyers. Write for a resident with 3 minutes and a question.
