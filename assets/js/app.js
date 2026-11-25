const UI_STRINGS = {
  ru: {
    pageTitleIndex: 'Dmitry Lab — Журнал рецептов и тестов',
    pageDescriptionIndex: 'Кулинарный журнал Dmitry Lab: проверенные рецепты, процессы ферментации и лабораторные заметки.',
    catalogTitle: 'Журнал рецептов и тестов',
    backBtn: '← Назад',
    shareBtn: 'Поделиться ссылкой',
    copiedBtn: 'Ссылка скопирована',
    versionLabel: 'Версия',
    firstDraftLabel: 'Первое оформление статьи',
    revisionLabel: 'Редакция',
    loading: 'Загрузка…',
    notFound: 'Материал не найден.',
    loadError: 'Ошибка загрузки материалов.',
    retryBtn: 'Повторить'
  },
  en: {
    pageTitleIndex: 'Dmitry Lab — Recipe & Test Journal',
    pageDescriptionIndex: 'Dmitry Lab culinary journal: tested recipes, fermentation processes, and lab notes.',
    catalogTitle: 'Recipe & Test Journal',
    backBtn: '← Back',
    shareBtn: 'Share link',
    copiedBtn: 'Link copied',
    versionLabel: 'Version',
    firstDraftLabel: 'Initial draft',
    revisionLabel: 'Revision',
    loading: 'Loading…',
    notFound: 'Entry not found.',
    loadError: 'Failed to load entries.',
    retryBtn: 'Retry'
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
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
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

// === ОБНОВЛЁННАЯ ФУНКЦИЯ ===
function copyShareUrl(slug, lang, btnElement, shareIcon, checkIcon) {
  const ui = UI_STRINGS[lang];
  const shareUrl = new URL(`share/${encodeURIComponent(slug)}-${lang}.html`, window.location.href).href;

  if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
    navigator.share({ title: document.title, url: shareUrl }).catch(() => {});
    return;
  }

  navigator.clipboard.writeText(shareUrl).then(() => {
    btnElement.classList.add('copied');
    btnElement.innerHTML = `${checkIcon}<span>${ui.copiedBtn}</span>`;
    setTimeout(() => {
      btnElement.classList.remove('copied');
      btnElement.innerHTML = `${shareIcon}<span>${ui.shareBtn}</span>`;
    }, 2000);
  }).catch(() => {
    prompt(ui.shareBtn, shareUrl);
  });
}

function renderErrorBlock(message, retryLabel) {
  return `
    <div class="callout-caution" role="alert">
      <p>${message}</p>
      <p style="margin-top: 12px;">
        <button type="button" class="btn" onclick="renderPage()">${retryLabel}</button>
      </p>
    </div>
  `;
}

function renderColophon(item, ui, lang, bodyHtml) {
  if (bodyHtml.includes('class="doc-colophon"')) return '';

  const author = t(item.author, lang);
  const firstDate = item.createdDate || item.firstDate || '';
  const revisionDate = item.revisionDate || item.date || '';
  const revisionNo = item.revision || item.version || '';

  const dateLines = [];
  if (firstDate) {
    dateLines.push(`<span>${ui.firstDraftLabel}: ${firstDate}</span>`);
  }
  if (revisionDate) {
    const revSuffix = revisionNo ? ` (${revisionNo})` : '';
    dateLines.push(`<span>${ui.revisionLabel}${revSuffix}: ${revisionDate}</span>`);
  }

  if (!author && dateLines.length === 0) return '';

  return `
    <div class="doc-colophon">
      ${author ? `<div class="doc-colophon-author">${author}</div>` : ''}
      ${dateLines.length ? `<div class="doc-colophon-dates">${dateLines.join('')}</div>` : ''}
    </div>
  `;
}

async function renderCatalog(lang) {
  const grid = document.getElementById('posts-grid');
  if (!grid) return;

  const ui = UI_STRINGS[lang];
  document.title = ui.pageTitleIndex;
  updateMetaDescription(ui.pageDescriptionIndex);

  const catalogTitle = document.getElementById('catalog-title');
  if (catalogTitle) catalogTitle.textContent = ui.catalogTitle;

  grid.innerHTML = `<p class="mono">${ui.loading}</p>`;

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
    grid.innerHTML = renderErrorBlock(ui.loadError, ui.retryBtn);
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

  container.innerHTML = `<p class="mono">${ui.loading}</p>`;

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

    const colophonHtml = renderColophon(item, ui, lang, bodyHtml);

    container.innerHTML = `
      <header class="post-header">
        <div class="meta-row post-meta-bar">
          <a href="index.html?lang=${lang}" class="btn btn-back" id="back-btn">${ui.backBtn}</a>
          <span class="tag">${tag}</span>
          <span class="status">${status}</span>
          <span class="mono">${item.date || ''} · ${item.version || ''}</span>
        </div>
        <h1>${title}</h1>
      </header>
      <article class="post-body">${bodyHtml}${colophonHtml}</article>
    `;

    // === ПЛАВАЮЩАЯ КНОПКА В СТИЛЕ DMITRY LAB ===
    const shareIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
    const checkIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

    const oldFloatBtn = document.getElementById('floating-share-btn');
    if (oldFloatBtn) oldFloatBtn.remove();

    const floatBtn = document.createElement('button');
    floatBtn.id = 'floating-share-btn';
    floatBtn.type = 'button';
    floatBtn.className = 'floating-share-btn';
    floatBtn.innerHTML = `${shareIcon}<span>${ui.shareBtn}</span>`;
    floatBtn.onclick = () => copyShareUrl(slug, lang, floatBtn, shareIcon, checkIcon);
    document.body.appendChild(floatBtn);

  } catch (err) {
    container.innerHTML = renderErrorBlock(ui.loadError, ui.retryBtn);
  }
}

function renderPage() {
  const lang = getLang();
  updateLangButtons(lang);
  renderCatalog(lang);
  renderPost(lang);
}

document.addEventListener('DOMContentLoaded', renderPage);
