/* Torrance 2026 — shared Chart.js setup and helpers */

Chart.register(ChartDataLabels);
Chart.defaults.font.family = "'DM Sans',sans-serif";

/* Shared palette & base config */
var COLORS = { red: '#C0392B', green: '#1D9E75', gray: '#A8A8A8' };
var TXT = 'rgba(0,0,0,0.45)';
var BAR_BASE = { borderRadius: 5, barPercentage: 0.7 };
var DATALABEL_BASE = { font: { weight: 600, size: 12 }, formatter: function(v) { return v ? v + '%' : ''; } };

/**
 * Resolve a color value — either a named key from COLORS or a raw value.
 */
function resolveColor(c) {
  if (typeof c === 'string' && COLORS[c]) return COLORS[c];
  return c;
}

/**
 * Create a vertical grouped bar chart (e.g. geo charts with two candidates).
 */
function createVerticalBarChart(id, cfg) {
  new Chart(document.getElementById(id), {
    type: 'bar',
    data: {
      labels: cfg.labels,
      datasets: cfg.datasets.map(function(ds) {
        return { label: ds.label, data: ds.data, backgroundColor: resolveColor(ds.color), borderRadius: BAR_BASE.borderRadius, barPercentage: BAR_BASE.barPercentage };
      })
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        datalabels: { anchor: 'end', align: 'end', color: TXT, font: DATALABEL_BASE.font, formatter: DATALABEL_BASE.formatter },
        tooltip: { callbacks: { label: function(c) { return c.dataset.label + ': ' + c.raw + (cfg.tooltipSuffix || '% of donors'); } } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: TXT, font: { size: 12 }, maxRotation: 0 } },
        y: { display: false, max: cfg.max || 100 }
      }
    }
  });
}

/**
 * Create a horizontal bar chart (e.g. occupation breakdown).
 */
function createHorizontalBarChart(id, cfg) {
  var dlColor = cfg.datalabelColor || TXT;
  var dlOverrides = cfg.datalabelOverrides || {};
  new Chart(document.getElementById(id), {
    type: 'bar',
    data: {
      labels: cfg.labels,
      datasets: cfg.datasets.map(function(ds) {
        return { label: ds.label, data: ds.data, backgroundColor: resolveColor(ds.color), borderRadius: BAR_BASE.borderRadius, barPercentage: BAR_BASE.barPercentage };
      })
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        datalabels: Object.assign({ anchor: 'end', align: 'end', color: dlColor, font: DATALABEL_BASE.font, formatter: DATALABEL_BASE.formatter }, dlOverrides),
        tooltip: { callbacks: { label: function(c) { return (cfg.datasets.length > 1 ? c.dataset.label + ': ' : '') + c.raw + (cfg.tooltipSuffix || '% of dollars'); } } }
      },
      scales: {
        x: { display: false, max: cfg.max || 85 },
        y: { grid: { display: false }, ticks: { color: TXT, font: { size: cfg.tickSize || 10 } } }
      }
    }
  });
}

/**
 * Wire up a CSV download button that fetches from a file.
 */
function setupCsvDownload(btnId, csvPath, downloadFilename) {
  document.getElementById(btnId).addEventListener('click', function() {
    fetch(csvPath)
      .then(function(r) { return r.text(); })
      .then(function(csv) {
        var blob = new Blob([csv], { type: 'text/csv' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = downloadFilename;
        a.click();
        URL.revokeObjectURL(a.href);
      });
  });
}

/**
 * Wire up all CSV download buttons for a race from PAGE_DATA config.
 */
function setupAllDownloads(raceKey) {
  var race = PAGE_DATA[raceKey];
  if (!race || !race.csvFiles) return;
  race.csvFiles.forEach(function(entry) {
    setupCsvDownload(entry.btnId, entry.file, entry.filename);
  });
}
