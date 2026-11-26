import { INDICATORS } from '../data/indicators.js';
import { dataTable, findIndicator, kpiGrid, lineChart, page } from '../ui.js';

export function render(container) {
  const section = page(container, {
    eyebrow: 'Pendidikan',
    title: 'Pendidikan Indonesia',
    intro: 'Angka melek huruf dan partisipasi sekolah sebagai gambaran capaian pendidikan 2015–2024.',
  });

  const indicators = ['literacy', 'school-enrollment']
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

  dataTable(section, indicators, { title: 'Tabel indikator pendidikan' });
}
