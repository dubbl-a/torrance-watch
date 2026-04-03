/*
 * Torrance 2026 — page data config
 *
 * This is the ONE file to update when new filings come in.
 * After replacing the CSV files in data/, update the summary
 * numbers below to match your analysis.
 *
 * Each race key corresponds to a page:
 *   chen    → index.html
 *   kaji    → kaji_2026.html
 *   mattucci → mattucci_2026.html
 */

var PAGE_DATA = {

  chen: {
    /* CSV files for download buttons */
    csvFiles: [
      { btnId: 'dlBtn',   file: 'data/george_chen.csv',   filename: 'george_chen_donors_2025.csv' },
      { btnId: 'dlBtnSK', file: 'data/sharon_kalani.csv', filename: 'sharon_kalani_donors_2025.csv' }
    ],

    /* "Where do the donors live?" — vertical bar chart */
    geo: {
      labels: ['Torrance', 'Outside Torrance'],
      datasets: [
        { label: 'Chen',   data: [45, 55], color: 'red' },
        { label: 'Kalani', data: [85, 15], color: 'green' }
      ]
    },

    /* "Where do the donor dollars come from?" — horizontal bar chart */
    occupation: {
      labels: [
        'Business owners, professionals,\nand their family \u00B9',
        'Teachers, public servants,\nand service workers \u00B9',
        'Retired',
        'Not employed'
      ],
      datasets: [
        { label: 'Chen',   data: [61, 5, 31, 3], color: 'red' },
        { label: 'Kalani', data: [30, 19, 51, 0], color: 'green' }
      ]
    },

    /* "Who's behind the money?" — horizontal bar chart */
    contrast: {
      labels: [
        'Business owners, professionals,\nand their family',
        'Teachers, public servants,\nservice workers'
      ],
      datasets: [
        { label: 'Chen',   data: [61, 5], color: 'red' },
        { label: 'Kalani', data: [30, 19], color: 'green' }
      ]
    },

    /* "Who's giving the legal maximum?" — stat cards */
    stats: {
      maxedOutside: { red: '76%', green: '25%' }
    }
  },

  kaji: {
    csvFiles: [
      { btnId: 'dlBtnJK', file: 'data/jon_kaji.csv',        filename: 'jon_kaji_donors_2025.csv' },
      { btnId: 'dlBtnDK', file: 'data/david_kartsonis.csv',  filename: 'david_kartsonis_donors_2025.csv' }
    ],

    geo: {
      labels: ['Torrance', 'Outside Torrance'],
      datasets: [
        { label: 'Kaji',      data: [31, 69], color: 'red' },
        { label: 'Kartsonis', data: [76, 24], color: 'green' }
      ]
    },

    occupation: {
      labels: [
        'Business owners, professionals,\nand their family \u00B9',
        'Teachers, public servants,\nand service workers \u00B9',
        'Retired',
        'Not employed'
      ],
      datasets: [
        { label: 'Kaji',      data: [67, 6, 23, 5], color: 'red' },
        { label: 'Kartsonis', data: [41, 17, 43, 0], color: 'green' }
      ]
    },

    contrast: {
      labels: [
        'Business owners, professionals,\nand their family',
        'Teachers, public servants,\nservice workers'
      ],
      datasets: [
        { label: 'Kaji',      data: [67, 6], color: 'red' },
        { label: 'Kartsonis', data: [41, 17], color: 'green' }
      ]
    },

    stats: {
      maxedOutside: { red: '93%', green: '0%' }
    }
  },

  mattucci: {
    csvFiles: [
      { btnId: 'dlBtn', file: 'data/aurelio_mattucci.csv', filename: 'mattucci_donors_2026.csv' }
    ],

    geo: {
      labels: ['Torrance', 'Not Torrance'],
      datasets: [
        { label: 'Mattucci', data: [58, 42], color: ['#C0392B', '#A8A8A8'] }
      ],
      max: 72,
      tooltipSuffix: '% of donors'
    },

    occupation: {
      labels: [
        'Business owners, professionals,\nand their family \u00B9',
        'Teachers, public servants,\nand service workers \u00B9',
        'Retired',
        'Not employed'
      ],
      datasets: [
        { label: 'Mattucci', data: [66, 15, 12, 7], color: ['#C0392B', '#2E7D6A', '#5B7FA5', '#A8A8A8'] }
      ],
      max: 82
    }
  }

};
