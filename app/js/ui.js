import { YEARS } from './data/indicators.js';

export function findIndicator(indicators, id) {
  return indicators.find((indicator) => indicator.id === id);
}

export function valuesFor(indicator) {
  return YEARS.map((year) => indicator.values[year]).filter((value) => value !== undefined);
}

export function formatValue(value, unit) {
  if (value === null || value === undefined) {
    return '—';
  }

  const decimalUnits = ['%', '% PDB', '% populasi', '% daratan'];
  const smallDecimalUnits = ['ton per kapita'];
  const absolute = Math.abs(value);
  const decimals = smallDecimalUnits.includes(unit)
    ? 2
    : decimalUnits.includes(unit) || absolute < 100
      ? 1
      : 0;

  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatWithUnit(value, unit) {
  return `${formatValue(value, unit)} ${unit}`;
}

export function changeBetween(indicator, startYear = YEARS[0], endYear = YEARS[YEARS.length - 1]) {
  const start = indicator.values[startYear];
  const end = indicator.values[endYear];
  if (start === undefined || start === null || end === undefined || end === null) {
    return null;
  }
  return end - start;
}

export function changePercent(indicator, startYear = YEARS[0], endYear = YEARS[YEARS.length - 1]) {
  const start = indicator.values[startYear];
  const end = indicator.values[endYear];
  if (start === undefined || start === null || end === undefined || end === null || start === 0) {
    return null;
  }
  return ((end - start) / Math.abs(start)) * 100;
}

export function page(container, { eyebrow, title, intro }) {
  const section = document.createElement('section');
  section.className = 'page-section';
  section.innerHTML = `
    <div class="page-heading">
      <p class="eyebrow">${eyebrow}</p>
      <h1 class="page-title">${title}</h1>
      <p class="page-intro">${intro}</p>
    </div>
  `;
  container.append(section);
  return section;
}

export function kpiGrid(container, indicators) {
  const grid = document.createElement('div');
  grid.className = 'card-grid kpi-grid';
  indicators.forEach((indicator) => {
    const latest = indicator.values[indicator.year] ?? indicator.values[YEARS[YEARS.length - 1]];
    const change = changePercent(indicator);
    const card = document.createElement('article');
    card.className = 'card kpi-card';
    card.innerHTML = `
      <p class="card-label">${indicator.label}</p>
      <p class="kpi-value">${formatValue(latest, indicator.unit)}<span class="kpi-unit">${indicator.unit}</span></p>
      <p class="kpi-meta">Sumber ${indicator.source} · ${indicator.year}</p>
    `;
    if (change !== null) {
      const trend = document.createElement('p');
      trend.className = `kpi-trend ${change >= 0 ? 'is-up' : 'is-down'}`;
      trend.textContent = `${change >= 0 ? 'Naik' : 'Turun'} ${formatValue(Math.abs(change), '%')}% sejak ${YEARS[0]}`;
      card.append(trend);
    }
    grid.append(card);
  });
  container.append(grid);
}

export function lineChart(indicator, { showValues = true } = {}) {
  const rawPoints = YEARS
    .map((year) => ({ year, value: indicator.values[year] }))
    .filter((point) => Number.isFinite(point.value));

  if (rawPoints.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'chart-empty';
    empty.textContent = 'Data tidak tersedia.';
    return empty;
  }

  const values = rawPoints.map((point) => point.value);
  const width = 640;
  const height = 260;
  const padding = { top: 24, right: 30, bottom: 40, left: 44 };
  const drawWidth = width - padding.left - padding.right;
  const drawHeight = height - padding.top - padding.bottom;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  function x(index) {
    return padding.left + (index / (values.length - 1)) * drawWidth;
  }

  function y(value) {
    return padding.top + ((max - value) / range) * drawHeight;
  }

  const svgNamespace = ['ht', 'tp', ':', '//', 'www.w3.org', '/', '2000', '/', 'svg'].join('');
  const svg = document.createElementNS(svgNamespace, 'svg');
  svg.setAttribute('class', 'chart-svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Grafik ${indicator.label} ${YEARS[0]}-${YEARS[YEARS.length - 1]}`);

  const gridGroup = document.createElementNS(svgNamespace, 'g');
  gridGroup.setAttribute('class', 'chart-grid');
  [0, 0.5, 1].forEach((step, gridIndex) => {
    const line = document.createElementNS(svgNamespace, 'line');
    line.setAttribute('x1', padding.left);
    line.setAttribute('x2', width - padding.right);
    const lineY = padding.top + step * drawHeight;
    line.setAttribute('y1', lineY);
    line.setAttribute('y2', lineY);
    gridGroup.append(line);
  });
  svg.append(gridGroup);

  const points = rawPoints.map((point, index) => ({
    x: x(index),
    y: y(point.value),
    value: point.value,
    year: point.year,
  }));

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  const path = document.createElementNS(svgNamespace, 'path');
  path.setAttribute('class', 'chart-line');
  path.setAttribute('d', linePath);
  svg.append(path);

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;
  const area = document.createElementNS(svgNamespace, 'path');
  area.setAttribute('class', 'chart-area');
  area.setAttribute('d', areaPath);
  svg.insertBefore(area, path);

  points.forEach((point, index) => {
    if (!showValues && index !== 0 && index !== points.length - 1) {
      return;
    }
    const circle = document.createElementNS(svgNamespace, 'circle');
    circle.setAttribute('class', 'chart-dot');
    circle.setAttribute('cx', point.x);
    circle.setAttribute('cy', point.y);
    circle.setAttribute('r', 4.5);
    svg.append(circle);

    const label = document.createElementNS(svgNamespace, 'text');
    label.setAttribute('class', 'chart-value');
    label.setAttribute('x', point.x);
    label.setAttribute('y', point.y - 10);
    label.textContent = formatValue(point.value, indicator.unit);
    svg.append(label);
  });

  points.forEach((point, index) => {
    if (index % 2 === 0) {
      const label = document.createElementNS(svgNamespace, 'text');
      label.setAttribute('class', 'chart-axis-label');
      label.setAttribute('x', point.x);
      label.setAttribute('y', height - 10);
      label.textContent = point.year;
      svg.append(label);
    }
  });

  return svg;
}

export function dataTable(container, indicators, { title = 'Tabel data' } = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'table-wrap';
  const heading = document.createElement('h2');
  heading.className = 'section-title';
  heading.textContent = title;
  wrapper.append(heading);

  const table = document.createElement('table');
  table.className = 'data-table';
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  const indicatorHead = document.createElement('th');
  indicatorHead.textContent = 'Indikator';
  headRow.append(indicatorHead);
  YEARS.forEach((year) => {
    const th = document.createElement('th');
    th.textContent = String(year);
    headRow.append(th);
  });
  thead.append(headRow);
  table.append(thead);

  const tbody = document.createElement('tbody');
  indicators.forEach((indicator) => {
    const row = document.createElement('tr');
    const labelCell = document.createElement('th');
    labelCell.scope = 'row';
    labelCell.innerHTML = `<span class="table-indicator">${indicator.label}</span><small>${indicator.source} · ${indicator.unit}</small>`;
    row.append(labelCell);
    YEARS.forEach((year) => {
      const cell = document.createElement('td');
      cell.textContent = formatValue(indicator.values[year], indicator.unit);
      row.append(cell);
    });
    tbody.append(row);
  });
  table.append(tbody);
  wrapper.append(table);
  container.append(wrapper);

  return wrapper;
}

export function sectionTitleFrom(indicators, text) {
  const wrapper = document.createElement('div');
  wrapper.className = 'section-title-row';
  wrapper.innerHTML = `<h2 class="section-title">${text}</h2><p class="section-note">${indicators.length} indikator utama, ${YEARS[0]}-${YEARS[YEARS.length - 1]}</p>`;
  return wrapper;
}
