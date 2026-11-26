import { INDICATORS } from '../data/indicators.js';
import { dataTable, findIndicator, kpiGrid, lineChart, page } from '../ui.js';

export function render(container) {
  const section = page(container, {
    eyebrow: 'Perdagangan dan ekonomi',
    title: 'Ekonomi Indonesia',
    intro: 'Produk domestik bruto, inflasi, serta nilai ekspor dan impor nasional 2015–2024.',
  });

  const indicators = ['gdp', 'gdp-growth', 'inflation', 'exports', 'imports']
    .map((id) => findIndicator(INDICATORS, id))
    .filter(Boolean);
  kpiGrid(section, indicators.slice(0, 4));

  const panel = document.createElement('section');
  panel.className = 'panel chart-panel';
  panel.innerHTML = `
    <h2 class="section-title">Dua sisi perdagangan</h2>
    <p class="section-note">Nilai ekspor dan impor barang/jasa, miliar US$.</p>
  `;
  const tradeChart = document.createElement('div');
  tradeChart.className = 'multi-chart';
  tradeChart.append(lineChart(findIndicator(INDICATORS, 'exports'), { showValues: false }));
  tradeChart.append(lineChart(findIndicator(INDICATORS, 'imports'), { showValues: false }));
  panel.append(tradeChart);
  section.append(panel);

  dataTable(section, indicators, { title: 'Tabel indikator ekonomi' });
}
