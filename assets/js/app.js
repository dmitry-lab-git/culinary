let currentLang = localStorage.getItem('dl_lang') || 'ru';

const UI_TEXT = {
  ru: { catalogTitle: 'Реестр рецептов и тестов', back: '← Назад', version: 'Версия' },
  en: { catalogTitle: 'Recipe & Protocol Registry', back: '← Back', version: 'Version' }
};

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('dl_lang', lang);
  updateLangButtons();
  initPage();
}

function updateLangButtons() {
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
    document.getElementById('catalog-title').textContent = UI_TEXT[currentLang].catalogTitle;
    grid.innerHTML = posts.map(post => `
      <a class="card" href="post.html?slug=${post.slug}">
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
    document.getElementById('back-btn').textContent = UI_TEXT[currentLang].back;
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const post = posts.find(p => p.slug === slug);

    if (!post) {
      postContainer.innerHTML = '<p>Protocol not found.</p>';
      return;
    }

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
