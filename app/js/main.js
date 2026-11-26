const app = document.getElementById('app');
const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const mobileToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('nav-menu');

const routes = {
  '': { file: 'overview', page: 'overview', title: 'Ringkasan' },
  population: { file: 'population', page: 'population', title: 'Populasi' },
  economy: { file: 'economy', page: 'economy', title: 'Ekonomi' },
  education: { file: 'education', page: 'education', title: 'Pendidikan' },
  health: { file: 'health', page: 'health', title: 'Kesehatan' },
  geography: { file: 'geography', page: 'geography', title: 'Geografi' },
  compare: { file: 'compare', page: 'compare', title: 'Bandingkan' },
};

let renderToken = 0;

function currentRouteKey() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  return routes[hash] ? hash : (routes[hash] === undefined && hash ? hash : '');
}

function setActiveNav(routeKey) {
  const activePage = routeKey || 'overview';
  navLinks.forEach((link) => {
    const isActive = link.dataset.page === activePage;
    link.classList.toggle('is-active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  if (mobileToggle) {
    mobileToggle.setAttribute('aria-expanded', 'false');
  }
  if (navMenu) {
    navMenu.classList.remove('is-open');
  }
}

function renderLoading() {
  app.className = 'main-content';
  app.replaceChildren();
  const section = document.createElement('section');
  section.className = 'page-section loading-panel';
  section.setAttribute('aria-live', 'polite');
  section.innerHTML = `
    <p class="eyebrow">Memuat data</p>
    <h1 class="page-title">Menyiapkan halaman…</h1>
    <p class="page-intro">Mengambil modul statistik untuk ditampilkan.</p>
    <div class="loading-bar" role="status" aria-label="Memuat halaman"></div>
  `;
  app.append(section);
}

function renderNotFound() {
  app.className = 'main-content';
  app.replaceChildren();
  const section = document.createElement('section');
  section.className = 'page-section not-found';
  section.innerHTML = `
    <p class="eyebrow">404</p>
    <h1 class="page-title">Halaman tidak ditemukan</h1>
    <p class="page-intro">Alamat rute ini tidak dikenali. Gunakan menu navigasi untuk kembali ke data utama.</p>
    <a class="button primary" href="#/">Kembali ke Ringkasan</a>
  `;
  app.append(section);
}

function updatePageTitle(route) {
  if (route) {
    document.title = `${route.title} — Statistik Indonesia`;
  } else {
    document.title = 'Statistik Indonesia';
  }
}

async function renderRoute() {
  const routeKey = currentRouteKey();
  const route = routes[routeKey];
  const token = ++renderToken;
  setActiveNav(routeKey);

  if (!route) {
    updatePageTitle(null);
    renderNotFound();
    return;
  }

  updatePageTitle(route);
  renderLoading();

  try {
    const pageModule = await import(`./pages/${route.file}.js`);
    if (token !== renderToken) {
      return;
    }
    app.className = 'main-content';
    app.replaceChildren();
    pageModule.render(app);
  } catch (error) {
    if (token !== renderToken) {
      return;
    }
    console.error('Failed to load page module:', error);
    renderNotFound();
  }
}

function toggleMobileMenu() {
  const isOpen = navMenu && navMenu.classList.toggle('is-open');
  if (mobileToggle) {
    mobileToggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
  }
}

if (mobileToggle) {
  mobileToggle.addEventListener('click', toggleMobileMenu);
}

window.addEventListener('hashchange', renderRoute);
renderRoute();
