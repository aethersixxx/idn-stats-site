import { INDICATORS } from '../data/indicators.js';
import { dataTable, findIndicator, kpiGrid, lineChart, page } from '../ui.js';

export function render(container) {
  const section = page(container, {
    eyebrow: 'Kependudukan',
    title: 'Populasi Indonesia',
    intro: 'Jumlah penduduk dan laju pertumbuhan tahunan, dengan data perkiraan nasional 2015–2024.',
  });

  const indicators = ['population', 'population-growth']
    .map((id) => findIndicator(INDICATORS, id))
    .filter(Boolean);
  kpiGrid(section, indicators);

  const chartPanels = document.createElement('div');
  chartPanels.className = 'chart-stack';
  indicators.forEach((indicator) => {
    const panel = document.createElement('section');
    panel.className = 'panel chart-panel';
    panel.innerHTML = `
      <h2 class="section-title">${indicator.label}</h2>
      <p class="section-note">Sumber ${indicator.source}, ${indicator.unit}.</p>
    `;
    panel.append(lineChart(indicator, { showValues: indicator.id === 'population' }));
    chartPanels.append(panel);
  });
  section.append(chartPanels);

  dataTable(section, indicators, { title: 'Tabel indikator kependudukan' });
}
