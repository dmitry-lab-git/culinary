const UI_STRINGS = {
  ru: {
    pageTitleIndex: 'Dmitry Lab — Журнал рецептов и тестов',
    pageDescriptionIndex: 'Кулинарный журнал Dmitry Lab: проверенные рецепты, процессы ферментации и лабораторные заметки.',
    catalogTitle: 'Журнал рецептов и тестов',
    backBtn: '← Назад',
    shareBtn: 'Поделиться ссылкой',
    copiedBtn: 'Ссылка скопирована',
    versionLabel: 'Версия',
    publicationVersionLabel: 'Версия публикации',
    publicationDateLabel: 'Дата публикации',
    authorLabel: 'Автор',
    sourceRecipeLabel: 'Исходная рецептура',
    platformLabel: 'Платформа',
    firstDraftLabel: 'Первое оформление статьи',
    revisionLabel: 'Редакция',
    firstEditionLabel: 'Первая редакция',
    currentEditionLabel: 'Текущая редакция',
    loading: 'Загрузка…',
    notFound: 'Материал не найден.',
    loadError: 'Ошибка загрузки материалов.',
    retryBtn: 'Повторить',
    aiAccordionTitle: 'Дополнительные возможности: разбор рецепта с помощью AI-ассистента',
    aiAccordionBody: [
      'Данная публикация содержит расширенное описание рецептуры, ингредиентов и технологических процессов.',
      'Для более подробного изучения материала вы можете скопировать ссылку на эту страницу и передать её любому AI-ассистенту, поддерживающему работу с веб-ссылками. Это позволит задавать дополнительные вопросы, получать пояснения к отдельным этапам приготовления, разбирать назначение ингредиентов и лучше понимать описанные процессы.',
      'Вы можете использовать AI-ассистента для уточнения терминологии, изучения технологических особенностей и рассмотрения альтернативных вариантов.',
      'Ответы AI-ассистента следует рассматривать как дополнительный информационный материал, а не как подтверждение безопасности рецептуры или замену профессиональных технологических рекомендаций.'
    ]
  },
  en: {
    pageTitleIndex: 'Dmitry Lab — Recipe & Test Journal',
    pageDescriptionIndex: 'Dmitry Lab culinary journal: tested recipes, fermentation processes, and lab notes.',
    catalogTitle: 'Recipe & Test Journal',
    backBtn: '← Back',
    shareBtn: 'Share link',
    copiedBtn: 'Link copied',
    versionLabel: 'Version',
    publicationVersionLabel: 'Publication version',
    publicationDateLabel: 'Publication date',
    authorLabel: 'Author',
    sourceRecipeLabel: 'Original recipe',
    platformLabel: 'Platform',
    firstDraftLabel: 'Initial draft',
    revisionLabel: 'Revision',
    firstEditionLabel: 'First edition',
    currentEditionLabel: 'Current edition',
    loading: 'Loading…',
    notFound: 'Entry not found.',
    loadError: 'Failed to load entries.',
    retryBtn: 'Retry',
    aiAccordionTitle: 'Additional Features: exploring the recipe with an AI assistant',
    aiAccordionBody: [
      'This publication contains an expanded description of the recipe, its ingredients, and the preparation processes involved.',
      'For a more detailed exploration of the material, you can copy the link to this page and share it with any AI assistant that supports working with web links. This will allow you to ask follow-up questions, receive explanations of individual preparation steps, explore the purpose of specific ingredients, and gain a better understanding of the processes described.',
      'You can use an AI assistant to clarify terminology, explore technological aspects, and consider alternative approaches.',
      'AI-generated responses should be treated as supplementary informational material, not as confirmation of recipe safety or a substitute for professional technological guidance.'
    ]
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

function escapeAttr(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatDisplayDate(rawDate, lang) {
  if (!rawDate) return '';
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(rawDate).trim());
  if (!isoMatch) return String(rawDate);
  const [, year, month, day] = isoMatch;
  if (lang === 'en') return `${month}/${day}/${year}`;
  return `${day}.${month}.${year}`;
}

function normalizeVersion(rawVersion) {
  if (!rawVersion) return '';
  return String(rawVersion).trim().replace(/^v\.?\s*/i, '');
}

function formatEditionTag(rawVersion) {
  const cleaned = normalizeVersion(rawVersion);
  return cleaned ? `v${cleaned}` : '';
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

function renderEditionNotes(item, ui) {
  const firstDate = item.firstDate || item.createdDate || '';
  const firstVer = formatEditionTag(item.firstVersion || 'v1.0');
  const currentDate = item.revisionDate || item.date || '';
  const currentVer = formatEditionTag(item.revision || item.version || '');

  const spans = [];
  if (firstDate) {
    const verPart = firstVer ? ` (${firstVer})` : '';
    spans.push(
      `  <span>${ui.firstEditionLabel}${verPart}: <time datetime="${escapeAttr(firstDate)}">${firstDate}</time></span>`
    );
  }
  if (currentDate) {
    const verPart = currentVer ? ` (${currentVer})` : '';
    spans.push(
      `  <span>${ui.currentEditionLabel}${verPart}: <time datetime="${escapeAttr(currentDate)}">${currentDate}</time></span>`
    );
  }

  if (!spans.length) return '';
  return `<div class="doc-colophon-dates">\n${spans.join('\n')}\n</div>`;
}

function renderColophon(item, ui, lang) {
  const author = t(item.author, lang);
  const sourceRecipe = t(item.sourceRecipe, lang);
  const platform = t(item.platform, lang);
  const version = normalizeVersion(item.version);
  const pubDate = formatDisplayDate(item.date, lang);

  const lines = [];
  if (author) {
    lines.push(`<p><strong>${ui.authorLabel}:</strong> ${author}</p>`);
  }
  if (sourceRecipe) {
    lines.push(`<p><strong>${ui.sourceRecipeLabel}:</strong> ${sourceRecipe}</p>`);
  }
  if (platform) {
    lines.push(`<p><strong>${ui.platformLabel}:</strong> ${platform}</p>`);
  }
  if (version) {
    lines.push(`<p><strong>${ui.publicationVersionLabel}:</strong> ${version}</p>`);
  }
  if (pubDate) {
    lines.push(`<p><strong>${ui.publicationDateLabel}:</strong> ${pubDate}</p>`);
  }

  const editionsHtml = renderEditionNotes(item, ui);
  const colophonHtml = lines.length
    ? `<div class="doc-colophon">\n  ${lines.join('\n  ')}\n</div>`
    : '';

  return `${editionsHtml}${colophonHtml}`;
}

function renderAiAccordion(ui) {
  if (!ui.aiAccordionTitle || !Array.isArray(ui.aiAccordionBody)) return '';
  const paragraphs = ui.aiAccordionBody
    .map((text) => `    <p>${text}</p>`)
    .join('\n');

  return `
<details class="ai-accordion">
  <summary class="ai-accordion-summary">
    <span class="ai-accordion-title">${ui.aiAccordionTitle}</span>
    <span class="ai-accordion-icon" aria-hidden="true">+</span>
  </summary>
  <div class="ai-accordion-body">
${paragraphs}
  </div>
</details>`;
}

function stripManualAiAccordion(html) {
  return html.replace(/<details\s+class=["']ai-accordion["'][\s\S]*?<\/details>\s*/gi, '');
}

function insertAiAccordionBeforeFirstHeading(html, accordionHtml) {
  if (!accordionHtml) return html;
  if (/<h2\b/i.test(html)) {
    return html.replace(/<h2\b/i, `${accordionHtml}\n\n<h2`);
  }
  return `${accordionHtml}\n\n${html}`;
}

function stripManualColophon(html) {
  return html.replace(/<div\s+class=["']doc-colophon["'][\s\S]*?<\/div>\s*$/i, '').trim();
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
      const version = normalizeVersion(item.version);

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
            <span>${ui.versionLabel}: ${version}</span>
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
    const version = normalizeVersion(item.version);

    document.title = `${title} — Dmitry Lab`;
    updateMetaDescription(summary);

    const ext = item.format === 'html' ? 'html' : 'md';
    const contentRes = await fetch(`content/${lang}/${slug}.${ext}`);
    if (!contentRes.ok) throw new Error('HTTP ' + contentRes.status);
    const rawContent = await contentRes.text();

    const parsedHtml = ext === 'html'
      ? rawContent
      : (window.marked ? window.marked.parse(rawContent) : rawContent);

    const cleanedHtml = stripManualAiAccordion(stripManualColophon(parsedHtml));
    const aiAccordionHtml = renderAiAccordion(ui);
    const bodyHtml = insertAiAccordionBeforeFirstHeading(cleanedHtml, aiAccordionHtml);
    const colophonHtml = renderColophon(item, ui, lang);

    container.innerHTML = `
      <header class="post-header">
        <div class="meta-row post-meta-bar">
          <a href="index.html?lang=${lang}" class="btn btn-back" id="back-btn">${ui.backBtn}</a>
          <span class="tag">${tag}</span>
          <span class="status">${status}</span>
          <span class="mono">${item.date || ''}${version ? ` · v${version}` : ''}</span>
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