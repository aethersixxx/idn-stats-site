import { INDICATORS } from '../data/indicators.js';
import { dataTable, findIndicator, kpiGrid, lineChart, page } from '../ui.js';

export function render(container) {
  const section = page(container, {
    eyebrow: 'Kesehatan',
    title: 'Kesehatan Indonesia',
    intro: 'Angka harapan hidup dan proporsi belanja kesehatan terhadap produk domestik bruto.',
  });

  const indicators = ['life-expectancy', 'health-expenditure']
    .map((id) => findIndicator(INDICATORS, id))
    .filter(Boolean);
  kpiGrid(section, indicators);

  const panel = document.createElement('section');
  panel.className = 'panel chart-panel';
  panel.innerHTML = `
    <h2 class="section-title">Usia harapan hidup</h2>
    <p class="section-note">Perkiraan harapan hidup saat lahir, dalam tahun.</p>
  `;
  panel.append(lineChart(findIndicator(INDICATORS, 'life-expectancy')));
  section.append(panel);

  dataTable(section, indicators, { title: 'Tabel indikator kesehatan' });
}
