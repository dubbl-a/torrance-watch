# Torrance Watch

## What this site is
A standing nonpartisan civic reference for the City of Torrance. Launching April 2026 with coverage of the June 2 municipal election (mayor, 3 council races, treasurer), continuing indefinitely as a year-round civic resource. The site is not a campaign, not an endorsement engine, not an advocacy org.

## Editorial bright line
Equal treatment of all candidates in every race. Same depth, same tone, same layout, same data presentation. If a fact appears for one candidate in a race, the equivalent fact must appear for every other candidate in that race or not at all. Never editorialize. Never interpret motive. Attribute every factual claim to a public source via a numbered superscript footnote. This is the project's primary credibility asset. Do not cross this line.

## Stack
- Astro 6 (stable, released March 2026) with Content Collections
- Node 22+ required (Astro 6 dropped Node 18 and 20)
- Cloudflare Workers with Static Assets (deployment target, first-class support in Astro 6)
- Plotly.js basic partial bundle (plotly.js-basic-dist-min) for data visualizations
- Vanilla CSS with custom properties (no Tailwind, no CSS-in-JS)
- TypeScript for component logic and schemas
- No React unless absolutely needed for an island of interactivity

## Design system
Typography: Playfair Display (headings, serif) + Source Sans 3 (body, sans). Already on Google Fonts. Do not add other fonts.

Color palette (defined in src/styles/global.css as CSS custom properties, ported from existing /legacy/shared.css):
- Primary accent red: #C0392B (also #A32D2D, #7A2020 for the top-accent gradient)
- Secondary accent green: #1D9E75 (Kalani/Kartsonis)
- Body text: #1a1a1a on background #FAF9F6
- Muted text: #666 to #999 range
- Card backgrounds: #fefbfa, #F0EEEA

Layout: max-width 680px for content pages, centered. Mobile-first. The existing /legacy/shared.css has a full system of scroll reveals, stat cards, callouts, legends, footnotes. Reuse these patterns exactly — do not redesign.

Callouts: Race finance pages use 4-callout grids where callout #1 spans full width. Use the existing `.callout`, `.callout.accent-red`, `.callout.accent-amber`, `.callout.accent-slate` classes. Do not invent new accent variants.

## Visualizations

**Library**: Plotly.js basic partial bundle (plotly.js-basic-dist-min, ~200KB gzipped). Load via CDN `<script>` tag only on pages that have charts. Do not load globally.

**Loading pattern** (per-page, inside the .astro file):
```html
<script src="https://cdn.plot.ly/plotly-basic-3.5.0.min.js" is:inline></script>
```

**Chart style constraints**:
- Horizontal bar charts for proportional comparisons. Never pie or donut charts.
- Muted palette only. Use the CSS custom properties for brand colors. No Plotly default purples, teals, or oranges.
- Modebar hidden by default: `config: { displayModeBar: false }`. Re-enable to 'hover' on specific charts if zoom/download genuinely helps the reader.
- Remove Plotly branding: `config: { displaylogo: false }`.
- Match the visual output of the existing Chart.js pages in /legacy/ when porting. The current aesthetic (bar borderRadius, data labels at end of bars, muted axis text) must be preserved. This is a configuration exercise, not a redesign.

**Chart configs as data**: Plotly accepts declarative `data + layout + config` objects. Store these as fields inside the race content collection entries. Components read the config and pass to Plotly.newPlot.

**Existing chart code**: /legacy/shared.js contains Chart.js helpers (createVerticalBarChart, createHorizontalBarChart). These are the spec for what the Plotly ports must visually match. Read them for defaults on borderRadius, label positioning, muted tick colors, animation, and bar percentage. Do not port the Chart.js code — rewrite as Plotly.

## File conventions
- Components in PascalCase.astro
- Content files in kebab-case.md or kebab-case.json
- Utilities and data files in kebab-case.ts or kebab-case.js
- One component per file, colocated CSS via <style> blocks inside .astro files
- Global styles only in src/styles/global.css

## Content collections
- `races`: one entry per race (mayor-2026, district-1-2026, district-3-2026, district-5-2026, treasurer-2026). Drives the finance tracker dynamic routes. Schema includes Plotly chart configs and footnotes.
- `candidates`: one entry per candidate. Schema intentionally loose during Sprint 1 because candidate page design is still being figured out.

Schemas live in src/content/config.ts. Footnotes are first-class on race pages — schema should include a `footnotes` array of `{ number, body }` objects. Every factual claim on a race page must link to a numbered footnote.

Do not tighten the candidate schema without checking with Aaron first.

## Signup form
Single form component, src/components/SignupForm.astro. Posts to a URL defined in src/data/site.ts as `SIGNUP_ENDPOINT`. Backend is TBD — currently a stub. When Aaron picks a backend (Zapier webhook, Formspree, Buttondown, Mailchimp, or Cloudflare Worker), only the endpoint URL and possibly the field names change. Do not hardcode any specific provider's URL, schema, or field names beyond `email` and optional `zip`.

## Deployment
Cloudflare Workers with Static Assets (use @astrojs/cloudflare adapter, Astro 6 native support). `wrangler.toml` at repo root. Main branch deploys to production. Every other branch deploys to a preview URL automatically via Cloudflare's GitHub integration. Custom domain: torrancewatch.org (cutover planned for end of Sprint 1, currently on GitHub Pages via the `main` branch).

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
- Don't redesign the visual language. Match /legacy/ pixel-for-pixel.

## Existing work to port
The repo root currently contains the existing finance site (to be moved to /legacy/ as part of the scaffold step). Port these assets to the Astro structure:

- shared.css → src/styles/global.css (keep CSS variables intact, keep the exact visual language)
- shared.js → reference only. Do not port. Rewrite chart logic as Plotly configs embedded in race content collection entries.
- page-data.js → one JSON file per race in src/content/races/ with the data as collection fields (adapted to Plotly format)
- data/*.csv → src/data/finance-2026/*.csv (passed through unchanged for download buttons)
- index.html, kaji_2026.html, mattucci_2026.html → consolidated into src/pages/finance/2026/[race].astro using the races content collection

Reference the original HTML files in /legacy/ to match the visual design exactly. Do not redesign. The existing aesthetic is a credibility asset and must be preserved.

## Who this is for
Torrance residents trying to figure out their ballot, research a candidate, or understand a council decision. Not political professionals. Not national media. Not lawyers. Write for a resident with 3 minutes and a question.