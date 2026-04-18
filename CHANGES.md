# Copy changes — nonpartisan rewrite

All changes are content-only. No structural or styling changes.

## Section A — prescribed changes

| Page | Element | Before | After |
|------|---------|--------|-------|
| Mayor | `<title>` | Who funds George Chen's campaign? — Torrance Watch | Mayor 2026: Campaign finance — Torrance Watch |
| Mayor | h1 | Who funds George Chen's campaign? | Who's funding the mayor race? |
| District 1 | `<title>` | Who funds Jon Kaji's campaign? — Torrance Watch | District 1 2026: Campaign finance — Torrance Watch |
| District 1 | h1 | Who funds Jon Kaji's campaign? | Who's funding the District 1 race? |
| Treasurer | `<title>` | Who funds Aurelio Mattucci's campaign? — Torrance Watch | Treasurer 2026: Campaign finance — Torrance Watch |
| Treasurer | h1 | Who funds Aurelio Mattucci's campaign? | Who's funding the treasurer race? |

Deks, section heads, section subs: no changes (already neutral).

## Section B — callout rewrites

### Mayor page

| Callout | Element | Before | After |
|---------|---------|--------|-------|
| 01 | title | 8% of Chen's donor dollars from shared-surname donors | Shared-surname unemployed donors |
| 01 | body | 23 Chen donors filed as not employed and share a last name with at least one other Chen donor.`<sup>2</sup>` Torrance limits individual donations to $1,000. Kalani has zero donors in this category. | Donors who filed as not employed and share a last name with at least one other donor to the same candidate`<sup>2</sup>`: Chen has 23 such donors (8% of his donor dollars). Kalani has zero. Torrance limits individual donations to $1,000. |
| 03 | body | Real estate and property professionals contributed to Chen's campaign. Donors include Aurelio Mattucci, a real estate broker who is also running for City Treasurer. | Chen received contributions from 11 real estate and property professionals (7% of donor dollars). Kalani received contributions from one property professional (9% of donor dollars). Chen's real estate donors include Aurelio Mattucci, a real estate broker who is also running for City Treasurer. |
| 04 | body | Chen's non-Torrance donors averaged 24% more per person than his Torrance-based donors. | Chen's non-Torrance donors averaged 55% more per person than his Torrance-based donors. Kalani's non-Torrance donors averaged 65% more per person than her Torrance-based donors. |

Mayor callout 02 (out-of-state donors): no change — already reports both candidates.

### District 1 page

| Callout | Element | Before | After |
|---------|---------|--------|-------|
| 01 | title | 25% of donor dollars from real estate | Real estate industry donors |
| 01 | body | Seven real estate and property professionals contributed to Kaji, including Tommy Murakoshi, who listed Kaji &amp; Associates as his employer, and Aurelio Mattucci, who is also running for City Treasurer. | Kaji received contributions from seven real estate and property professionals (25% of donor dollars), including Tommy Murakoshi, who listed Kaji &amp; Associates as his employer, and Aurelio Mattucci, who is also running for City Treasurer. Kartsonis received contributions from two property professionals (14% of donor dollars). |
| 04 | body | Kaji's non-Torrance donors averaged 69% more per person than his Torrance-based donors. | Kaji's average donation: $347 from Torrance-based donors, $588 from non-Torrance donors (non-Torrance 69% higher). Kartsonis's average donation: $363 from Torrance-based donors, $308 from non-Torrance donors (Torrance 15% higher). |

District 1 callout 02 (shared donors): no change — factual cross-reference.
District 1 callout 03 (out-of-state): no change — already reports both candidates.

### Treasurer page

No changes — single-candidate race, all callouts already factual.

## Section C — home page

| Element | Before | After |
|---------|--------|-------|
| Home page cards | No candidate-name-as-headline framing | No change needed — cards already use race-centric labels (Mayor, District 1, Treasurer) |

## Computation results (from scripts/recompute-callouts.mjs)

### Mayor race
- Chen real estate donors: 11 donors, $5,419, 7% of total dollars
- Kalani real estate donors: 1 donor (Adam Schwartz, Property Manager), $1,000, 9% of total dollars
- Chen avg donation: Torrance $358.75, non-Torrance $554.72 (non-Torrance +55% higher)
- Kalani avg donation: Torrance $393.48, non-Torrance $650.00 (non-Torrance +65% higher)
- Chen's "24% more" figure from legacy copy has been updated to 55% per current CSV data (see Corrections below).

### District 1 race
- Kaji real estate donors: 7 donors, $5,300, 25% of total dollars
- Kartsonis real estate donors: 2 donors, $1,250, 14% of total dollars
- Kaji avg donation: Torrance $347.48, non-Torrance $587.73 (non-Torrance +69% higher)
- Kartsonis avg donation: Torrance $363.16, non-Torrance $308.00 (Torrance +15% higher)

## Corrections

Mayor callout 04 Chen ratio updated from legacy figure of 24% to current-data figure of 55%. Legacy figure may have been computed with a different methodology; preserving a potentially stale number conflicts with the editorial standard.

District 1 callout 04 restructured from percentage-only framing to absolute dollar amounts ($347/$588 for Kaji, $363/$308 for Kartsonis) with percentage context, since the direction flips between candidates and a single framing verb doesn't work for both.

## Signup form feature flag

Added `SIGNUP_ENABLED` constant in `src/data/site.ts`, default `false`. When false, the SignupForm component renders nothing and all parent sections wrapping it (home page, finance pages, candidate pages) are also hidden via `{SIGNUP_ENABLED && (...)}`. No orphaned headings or whitespace.

## Future-date promise removal

| Page | Element | Before | After |
|------|---------|--------|-------|
| Home | dek | Starting with campaign finance. Voter guide coming before June 2. Standing after the election as a year-round resource on the city, how it works, and who represents you. | Campaign finance data for the June 2, 2026 election. Nonpartisan. Sourced from public records. Independent of any campaign. |
| Home | "What's coming" section | Full section with voter guide promise | Removed entirely |
| Home | "What's here now" heading | What's here now | Campaign finance tracker |
| About | source line | ...We continue after the election as a year-round reference for who holds office, how the city works, and what's being decided. | ...We cover local elections, campaign finance, and city government on an ongoing basis. |
| Candidates index | source line | Full profiles coming before June 2. | Candidate profiles for the June 2, 2026 municipal election. |
| Candidate [slug] | section head | Full profile coming before June 2 | Profile |
| Candidate [slug] | section body | This page will include sourced biographical information... | This page covers sourced biographical information... |
| All signup instances | success message | Thanks. We'll email you when the voter guide is live. | Thanks. We'll email you when we publish something new. |

## About page cleanup

| Element | Change |
|---------|--------|
| "Editorial team" section | Removed -- contact mailbox not live |
| "Corrections" section | Removed -- contact mailbox not live |
| Opening paragraph sentence about city communications | Rewritten -- reframe from independence critique to usability gap |
