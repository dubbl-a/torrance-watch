/**
 * recompute-callouts.mjs
 *
 * Parses CSV donor files and computes parallel statistics needed
 * for nonpartisan callout rewrites. Run with: node scripts/recompute-callouts.mjs
 *
 * Output: prints computed stats to stdout for use in callout copy.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../public/data/finance-2026');

// ── Simple CSV parser (handles quoted fields with commas) ──
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = (values[i] || '').trim(); });
    return row;
  });
}

function parseLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function parseDollar(s) {
  return parseFloat(s.replace(/[$,]/g, '')) || 0;
}

function loadCSV(filename) {
  return parseCSV(readFileSync(resolve(DATA_DIR, filename), 'utf-8'));
}

// ── Real estate keyword matching ──
// Match real estate industry donors. Exclude insurance brokers, software developers,
// and other non-real-estate uses of "broker", "agent", "developer", "property".
const RE_TITLE_KEYWORDS = /\b(realtor|real estate|real property|property (manager|owner|investor|management)|RE broker)\b/i;
const RE_TITLE_BROAD = /\b(broker|agent|developer)\b/i;
const RE_TITLE_EXCLUDE = /\b(insurance|software|travel|customs|freight|literary)\b/i;

function isRealEstate(row) {
  const title = row['Job Title'] || '';
  const employer = row['Employer'] || '';
  // Direct match on unambiguous real estate terms
  if (RE_TITLE_KEYWORDS.test(title) || RE_TITLE_KEYWORDS.test(employer)) return true;
  // Broad terms only if not excluded by context
  if (RE_TITLE_BROAD.test(title) && !RE_TITLE_EXCLUDE.test(title) && !RE_TITLE_EXCLUDE.test(employer)) {
    // "Broker/Owner" without further context — include if employer suggests real estate
    // Otherwise check if title explicitly says "real estate" or "property"
    if (/real estate|property|realt/i.test(title + ' ' + employer)) return true;
    // Standalone "Broker/Owner" — ambiguous, include only if no other industry context
    if (/broker\/owner/i.test(title)) return true;
  }
  return false;
}

// ── Torrance detection ──
function isTorrance(row) {
  return (row['City'] || '').toLowerCase().includes('torrance');
}

// ── Compute stats for a candidate ──
function computeStats(rows, label) {
  const total = rows.length;
  const totalDollars = rows.reduce((s, r) => s + parseDollar(r['Total Donated 2026']), 0);

  // Real estate donors
  const reRows = rows.filter(isRealEstate);
  const reCount = reRows.length;
  const reDollars = reRows.reduce((s, r) => s + parseDollar(r['Total Donated 2026']), 0);
  const rePct = totalDollars > 0 ? Math.round((reDollars / totalDollars) * 100) : 0;

  // Torrance vs non-Torrance average donation
  const torrRows = rows.filter(isTorrance);
  const nonTorrRows = rows.filter((r) => !isTorrance(r));
  const torrAvg = torrRows.length > 0
    ? torrRows.reduce((s, r) => s + parseDollar(r['Total Donated 2026']), 0) / torrRows.length
    : 0;
  const nonTorrAvg = nonTorrRows.length > 0
    ? nonTorrRows.reduce((s, r) => s + parseDollar(r['Total Donated 2026']), 0) / nonTorrRows.length
    : 0;
  const avgDiffPct = torrAvg > 0
    ? Math.round(((nonTorrAvg - torrAvg) / torrAvg) * 100)
    : 0;

  console.log(`\n=== ${label} ===`);
  console.log(`Total donors: ${total}`);
  console.log(`Total dollars: $${totalDollars.toLocaleString()}`);
  console.log(`Real estate donors: ${reCount} (${rePct}% of dollars, $${reDollars.toLocaleString()})`);
  console.log(`Torrance donors: ${torrRows.length}, avg $${torrAvg.toFixed(2)}`);
  console.log(`Non-Torrance donors: ${nonTorrRows.length}, avg $${nonTorrAvg.toFixed(2)}`);
  console.log(`Non-Torrance avg vs Torrance avg: ${avgDiffPct > 0 ? '+' : ''}${avgDiffPct}%`);

  // List real estate donors for reference
  if (reRows.length > 0) {
    console.log(`Real estate donor details:`);
    reRows.forEach((r) => {
      console.log(`  - ${r['Full Name']}, ${r['City']}, "${r['Job Title']}", $${parseDollar(r['Total Donated 2026'])}`);
    });
  }

  return { total, totalDollars, reCount, reDollars, rePct, torrAvg, nonTorrAvg, avgDiffPct };
}

// ── Run computations ──
console.log('MAYOR RACE');
console.log('='.repeat(60));
const chen = loadCSV('george_chen.csv');
const kalani = loadCSV('sharon_kalani.csv');
computeStats(chen, 'George Chen');
computeStats(kalani, 'Sharon Kalani');

console.log('\n\nDISTRICT 1 RACE');
console.log('='.repeat(60));
const kaji = loadCSV('jon_kaji.csv');
const kartsonis = loadCSV('david_kartsonis.csv');
computeStats(kaji, 'Jon Kaji');
computeStats(kartsonis, 'David Kartsonis');
