import { INDICATORS, YEARS } from '../data/indicators.js';
import { changeBetween, changePercent, formatValue, page } from '../ui.js';

function yearOptions(selectedYear) {
  return YEARS.map((year) => {
    const selected = year === selectedYear ? 'selected' : '';
    return `<option value="${year}" ${selected}>${year}</option>`;
  }).join('');
}

function comparisonRows(startYear, endYear) {
  return INDICATORS.map((indicator) => {
    const start = indicator.values[startYear];
    const end = indicator.values[endYear];
    const delta = changeBetween(indicator, startYear, endYear);
    const percent = changePercent(indicator, startYear, endYear);
    const hasChange = delta !== null && percent !== null && Number.isFinite(delta);
    const directionClass = hasChange && delta >= 0 ? 'is-positive' : 'is-negative';
    const arrow = hasChange ? (delta >= 0 ? '↑' : '↓') : '—';
    const percentText = percent === null ? '—' : `${formatValue(percent, '%')}%`;
    const deltaText = hasChange ? Math.abs(delta).toFixed(2) : '—';
    const barScale = hasChange && percent !== null ? Math.min(Math.abs(percent), 20) : 0;

    return `
      <tr>
        <th scope="row">
          <span class="table-indicator">${indicator.label}</span>
          <small>${indicator.source} · ${indicator.unit}</small>
        </th>
        <td>${formatValue(start, indicator.unit)}</td>
        <td>${formatValue(end, indicator.unit)}</td>
        <td class="${directionClass}">${arrow} ${deltaText}</td>
        <td>
          <div class="trend-cell">
            <div class="trend-track" aria-hidden="true">
              <span class="trend-center"></span>
              <span class="trend-value ${directionClass}" style="--bar-scale: ${barScale}"></span>
            </div>
            <span class="trend-label">${percentText}</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function comparisonTable(startYear, endYear) {
  return `
    <div class="table-wrap">
      <h2 class="section-title">${startYear} vs ${endYear}</h2>
      <table class="data-table compare-table">
        <thead>
          <tr>
            <th>Indikator</th>
            <th>${startYear}</th>
            <th>${endYear}</th>
            <th>Perubahan</th>
            <th>Perubahan relatif</th>
          </tr>
        </thead>
        <tbody>${comparisonRows(startYear, endYear)}</tbody>
      </table>
    </div>
  `;
}

function renderComparison(body, startYear, endYear) {
  const summary = document.createElement('div');
  summary.className = 'compare-summary';
  summary.innerHTML = `
    <p class="compare-summary-label">Rentang perbandingan</p>
    <p class="compare-summary-value">${startYear} → ${endYear}</p>
    <p class="compare-summary-note">Semua perubahan dihitung terhadap nilai tahun awal.</p>
  `;
  const tableContainer = document.createElement('div');
  tableContainer.innerHTML = comparisonTable(startYear, endYear);
  body.replaceChildren(summary, tableContainer);
}

export function render(container) {
  const section = page(container, {
    eyebrow: 'Perbandingan',
    title: 'Bandingkan Tahun',
    intro: 'Pilih dua tahun untuk melihat perubahan indikator nasional secara berdampingan.',
  });

  const controls = document.createElement('div');
  controls.className = 'compare-controls';
  controls.innerHTML = `
    <label>
      <span>Tahun awal</span>
      <select id="compare-start">${yearOptions(YEARS[0])}</select>
    </label>
    <label>
      <span>Tahun akhir</span>
      <select id="compare-end">${yearOptions(YEARS[YEARS.length - 1])}</select>
    </label>
  `;
  section.append(controls);

  const body = document.createElement('div');
  body.className = 'compare-body';
  section.append(body);

  const startSelect = controls.querySelector('#compare-start');
  const endSelect = controls.querySelector('#compare-end');

  function update() {
    let startYear = Number(startSelect.value);
    let endYear = Number(endSelect.value);
    if (endYear < startYear) {
      const swap = startYear;
      startYear = endYear;
      endYear = swap;
      startSelect.value = String(startYear);
      endSelect.value = String(endYear);
    }
    renderComparison(body, startYear, endYear);
  }

  startSelect.addEventListener('change', update);
  endSelect.addEventListener('change', update);
  update();
}
