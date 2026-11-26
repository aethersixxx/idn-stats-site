import { INDICATORS } from '../data/indicators.js';
import { dataTable, findIndicator, kpiGrid, lineChart, page } from '../ui.js';

export function render(container) {
  const section = page(container, {
    eyebrow: 'Ringkasan nasional',
    title: 'Statistik Indonesia',
    intro: `Indikator utama Indonesia untuk periode 2015–2024, dengan angka perkiraan terkini dari BPS dan World Bank.`,
  });

  const featured = ['population', 'gdp', 'life-expectancy', 'internet-users']
    .map((id) => findIndicator(INDICATORS, id))
    .filter(Boolean);
  kpiGrid(section, featured);

  const chartPanel = document.createElement('section');
  chartPanel.className = 'panel chart-panel';
  chartPanel.innerHTML = `
    <div class="section-title-row">
      <div>
        <h2 class="section-title">Tren populasi</h2>
        <p class="section-note">Jumlah penduduk dalam juta jiwa, 2015–2024.</p>
      </div>
    </div>
  `;
  chartPanel.append(lineChart(findIndicator(INDICATORS, 'population')));
  section.append(chartPanel);

  dataTable(section, INDICATORS, { title: 'Semua indikator utama' });
}
