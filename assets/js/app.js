const UI_STRINGS = {
  ru: {
    pageTitleIndex: 'Dmitry Lab — Журнал рецептов и тестов',
    pageDescriptionIndex: 'Кулинарный журнал Dmitry Lab: проверенные рецепты, процессы ферментации и лабораторные заметки.',
    catalogTitle: 'Журнал рецептов и тестов',
    backBtn: '← Назад',
    versionLabel: 'Версия',
    notFound: 'Материал не найден.',
    loadError: 'Ошибка загрузки материалов.'
  },
  en: {
    pageTitleIndex: 'Dmitry Lab — Recipe & Test Journal',
    pageDescriptionIndex: 'Dmitry Lab culinary journal: tested recipes, fermentation processes, and lab notes.',
    catalogTitle: 'Recipe & Test Journal',
    backBtn: '← Back',
    versionLabel: 'Version',
    notFound: 'Entry not found.',
    loadError: 'Failed to load entries.'
  }
};

function getLang() {
  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get('lang');
  if (urlLang === 'ru' || urlLang === 'en') {
    localStorage.setItem('dl_lang', urlLang);
    return urlLang;
  }
  const saved = localStorage.getItem('dl_lang');
  return saved === 'en' ? 'en' : 'ru';
}

function setLang(lang) {
  localStorage.setItem('dl_lang', lang);
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  window.history.replaceState({}, '', url);
  renderPage();
}

function t(field, lang) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field.ru || field.en || '';
}

function updateLangButtons(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('.lang-switch .btn[data-lang]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function updateMetaDescription(text) {
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'description';
    document.head.appendChild(meta);
  }
  meta.content = text;
}

async function renderCatalog(lang) {
  const grid = document.getElementById('posts-grid');
  if (!grid) return;

  const ui = UI_STRINGS[lang];
  document.title = ui.pageTitleIndex;
  updateMetaDescription(ui.pageDescriptionIndex);

  const catalogTitle = document.getElementById('catalog-title');
  if (catalogTitle) catalogTitle.textContent = ui.catalogTitle;

  try {
    const res = await fetch('content/index.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const items = await res.json();

    grid.innerHTML = items.map((item) => {
      const title = t(item.title, lang);
      const summary = t(item.summary, lang);
      const tag = t(item.tag, lang);
      const status = t(item.status, lang);
      const href = `post.html?slug=${encodeURIComponent(item.slug)}&lang=${lang}`;

      return `
        <a class="card" href="${href}">
          <div>
            <div class="meta-row">
              <span class="tag">${tag}</span>
              <span class="status">${status}</span>
            </div>
            <h3>${title}</h3>
            <p>${summary}</p>
          </div>
          <div class="card-footer">
            <span>${item.date || ''}</span>
            <span>${ui.versionLabel}: ${item.version || ''}</span>
          </div>
        </a>
      `;
    }).join('');
  } catch (err) {
    grid.innerHTML = `<p>${ui.loadError}</p>`;
  }
}

async function renderPost(lang) {
  const container = document.getElementById('post-container');
  if (!container) return;

  const ui = UI_STRINGS[lang];
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.textContent = ui.backBtn;
    backBtn.href = `index.html?lang=${lang}`;
  }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) {
    container.innerHTML = `<p>${ui.notFound}</p>`;
    return;
  }

  try {
    const indexRes = await fetch('content/index.json');
    if (!indexRes.ok) throw new Error('HTTP ' + indexRes.status);
    const items = await indexRes.json();
    const item = items.find((entry) => entry.slug === slug);

    if (!item) {
      container.innerHTML = `<p>${ui.notFound}</p>`;
      return;
    }

    const title = t(item.title, lang);
    const summary = t(item.summary, lang);
    const tag = t(item.tag, lang);
    const status = t(item.status, lang);

    document.title = `${title} — Dmitry Lab`;
    updateMetaDescription(summary);

    const ext = item.format === 'html' ? 'html' : 'md';
    const contentRes = await fetch(`content/${lang}/${slug}.${ext}`);
    if (!contentRes.ok) throw new Error('HTTP ' + contentRes.status);
    const rawContent = await contentRes.text();

    const bodyHtml = ext === 'html'
      ? rawContent
      : (window.marked ? window.marked.parse(rawContent) : rawContent);

    container.innerHTML = `
      <header class="post-header">
        <div class="meta-row">
          <span class="tag">${tag}</span>
          <span class="status">${status}</span>
          <span class="mono">${item.date || ''} · ${item.version || ''}</span>
        </div>
        <h1>${title}</h1>
      </header>
      <article class="post-body">${bodyHtml}</article>
    `;
  } catch (err) {
    container.innerHTML = `<p>${ui.loadError}</p>`;
  }
}

function renderPage() {
  const lang = getLang();
  updateLangButtons(lang);
  renderCatalog(lang);
  renderPost(lang);
}

document.addEventListener('DOMContentLoaded', renderPage);