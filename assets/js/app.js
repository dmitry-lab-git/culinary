const SUPPORTED_LANGS = ['ru', 'en'];

function detectInitialLang() {
  // 1. Проверяем параметр ?lang= в адресной строке
  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get('lang');
  if (SUPPORTED_LANGS.includes(urlLang)) {
    localStorage.setItem('dl_lang', urlLang);
    return urlLang;
  }

  // 2. Проверяем сохранённый выбор пользователя
  const savedLang = localStorage.getItem('dl_lang');
  if (SUPPORTED_LANGS.includes(savedLang)) {
    return savedLang;
  }

  // 3. Определяем язык по настройкам браузера
  const browserLangs = navigator.languages || [navigator.language || 'en'];
  for (const lang of browserLangs) {
    const code = lang.toLowerCase().split('-')[0];
    if (code === 'ru') return 'ru';
    if (code === 'en') return 'en';
  }

  // По умолчанию для остальных регионов — английский
  return 'en';
}

let currentLang = detectInitialLang();

const UI_TEXT = {
  ru: {
    siteTitle: 'Dmitry Lab — Кулинарные протоколы',
    catalogTitle: 'Реестр рецептов и тестов',
    back: '← Назад',
    version: 'Версия',
    notFound: 'Протокол не найден.'
  },
  en: {
    siteTitle: 'Dmitry Lab — Culinary Engineering',
    catalogTitle: 'Recipe & Protocol Registry',
    back: '← Back',
    version: 'Version',
    notFound: 'Protocol not found.'
  }
};

function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  currentLang = lang;
  localStorage.setItem('dl_lang', lang);

  // Синхронизируем параметр ?lang= в URL без перезагрузки страницы
  const url = new URL(window.location);
  url.searchParams.set('lang', lang);
  window.history.replaceState({}, '', url);

  updateLangButtons();
  initPage();
}

function updateLangButtons() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

async function initPage() {
  updateLangButtons();
  const res = await fetch('content/index.json');
  const posts = await res.json();

  const grid = document.getElementById('posts-grid');
  const postContainer = document.getElementById('post-container');

  if (grid) {
    document.title = UI_TEXT[currentLang].siteTitle;
    document.getElementById('catalog-title').textContent = UI_TEXT[currentLang].catalogTitle;
    grid.innerHTML = posts.map(post => `
      <a class="card" href="post.html?slug=${post.slug}&lang=${currentLang}">
        <div>
          <div class="meta-row">
            <span class="tag">${post.tag}</span>
            <span class="status">${post.status}</span>
          </div>
          <h3>${post.title[currentLang]}</h3>
          <p>${post.summary[currentLang]}</p>
        </div>
        <div class="card-footer">
          <span>${post.date}</span>
          <span>${UI_TEXT[currentLang].version}: ${post.version}</span>
        </div>
      </a>
    `).join('');
  }

  if (postContainer) {
    const backBtn = document.getElementById('back-btn');
    backBtn.textContent = UI_TEXT[currentLang].back;
    backBtn.href = `index.html?lang=${currentLang}`;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const post = posts.find(p => p.slug === slug);

    if (!post) {
      postContainer.innerHTML = `<p>${UI_TEXT[currentLang].notFound}</p>`;
      return;
    }

    document.title = `${post.title[currentLang]} — Dmitry Lab`;

    const mdRes = await fetch(`content/${currentLang}/${slug}.md`);
    const mdText = await mdRes.text();

    postContainer.innerHTML = `
      <div class="post-header">
        <div class="meta-row">
          <span class="tag">${post.tag}</span>
          <span class="status">${post.status} · ${post.version}</span>
        </div>
        <h1>${post.title[currentLang]}</h1>
        <div class="summary-box">${post.summary[currentLang]}</div>
      </div>
      <article class="post-body">${marked.parse(mdText)}</article>
    `;
  }
}

document.addEventListener('DOMContentLoaded', initPage);
