import { INDICATORS } from '../data/indicators.js';
import { dataTable, findIndicator, kpiGrid, lineChart, page } from '../ui.js';

export function render(container) {
  const section = page(container, {
    eyebrow: 'Lingkungan dan wilayah',
    title: 'Geografi Indonesia',
    intro: 'Tutupan hutan, emisi karbon dioksida, dan serapan digital sebagai indikator bentang alam dan aktivitas.',
  });

  const indicators = ['forest-area', 'co2', 'internet-users']
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
    panel.append(lineChart(indicator));
    chartPanels.append(panel);
  });
  section.append(chartPanels);

  dataTable(section, indicators, { title: 'Tabel indikator geografi' });
}
