/* Torrance 2026 — shared Chart.js setup and helpers */

Chart.register(ChartDataLabels);
Chart.defaults.font.family = "'Source Sans 3',sans-serif";

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
      animation: { duration: 800, easing: 'easeOutQuart', delay: function(ctx) { return ctx.dataIndex * 120 + ctx.datasetIndex * 200; } },
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
      animation: { duration: 800, easing: 'easeOutQuart', delay: function(ctx) { return ctx.dataIndex * 120 + ctx.datasetIndex * 200; } },
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

/**
 * Scroll-triggered section reveal using IntersectionObserver.
 */
function initScrollReveal() {
  var targets = document.querySelectorAll('.section, .data-section, .footnotes');
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function(el) { el.classList.add('revealed'); });
    return;
  }
  var delay = 0;
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        el.style.transitionDelay = delay + 'ms';
        delay += 80;
        el.classList.add('revealed');
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(function(el) { observer.observe(el); });
}

/**
 * Animate a stat number counting up (supports "76%" format).
 */
function animateStatNumber(el) {
  var raw = el.textContent.trim();
  var suffix = raw.replace(/[\d.]/g, '');
  var target = parseFloat(raw);
  if (isNaN(target)) return;
  var duration = 1200;
  var start = null;
  el.textContent = '0' + suffix;
  function step(ts) {
    if (!start) start = ts;
    var progress = Math.min((ts - start) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = Math.round(eased * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/**
 * Observe stat numbers and trigger count-up when visible.
 */
function initStatCountUp() {
  var stats = document.querySelectorAll('.stat-num');
  if (!stats.length) return;
  if (!('IntersectionObserver' in window)) return;
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        animateStatNumber(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  stats.forEach(function(el) { observer.observe(el); });
}

/* Auto-initialize on DOM ready */
document.addEventListener('DOMContentLoaded', function() {
  initScrollReveal();
  initStatCountUp();
});
