import fs from 'fs';
import path from 'path';

const BASE_DIR = '.';
const SHARE_DIR = path.join(BASE_DIR, 'share');
const indexData = JSON.parse(fs.readFileSync(path.join(BASE_DIR, 'content/index.json'), 'utf8'));

const UI = {
  ru: {
    shareLabel: 'Поделиться ссылкой',
    copiedLabel: 'Ссылка скопирована',
    backLabel: '← Интерактивная версия',
    catalogLabel: 'Каталог',
    authorLabel: 'Автор',
    sourceRecipeLabel: 'Исходная рецептура',
    platformLabel: 'Платформа',
    publicationVersionLabel: 'Версия публикации',
    publicationDateLabel: 'Дата публикации',
    aiAccordionTitle: 'Дополнительные возможности: разбор рецепта с помощью AI-ассистента',
    aiAccordionBody: [
      'Данная публикация содержит расширенное описание рецептуры, ингредиентов и технологических процессов.',
      'Для более подробного изучения материала вы можете скопировать ссылку на эту страницу и передать её любому AI-ассистенту, поддерживающему работу с веб-ссылками. Это позволит задавать дополнительные вопросы, получать пояснения к отдельным этапам приготовления, разбирать назначение ингредиентов и лучше понимать описанные процессы.',
      'Вы можете использовать AI-ассистента для уточнения терминологии, изучения технологических особенностей и рассмотрения альтернативных вариантов.',
      'Ответы AI-ассистента следует рассматривать как дополнительный информационный материал, а не как подтверждение безопасности рецептуры или замену профессиональных технологических рекомендаций.'
    ]
  },
  en: {
    shareLabel: 'Share link',
    copiedLabel: 'Link copied',
    backLabel: '← Interactive view',
    catalogLabel: 'Catalog',
    authorLabel: 'Author',
    sourceRecipeLabel: 'Original recipe',
    platformLabel: 'Platform',
    publicationVersionLabel: 'Publication version',
    publicationDateLabel: 'Publication date',
    aiAccordionTitle: 'Additional Features: exploring the recipe with an AI assistant',
    aiAccordionBody: [
      'This publication contains an expanded description of the recipe, its ingredients, and the preparation processes involved.',
      'For a more detailed exploration of the material, you can copy the link to this page and share it with any AI assistant that supports working with web links. This will allow you to ask follow-up questions, receive explanations of individual preparation steps, explore the purpose of specific ingredients, and gain a better understanding of the processes described.',
      'You can use an AI assistant to clarify terminology, explore technological aspects, and consider alternative approaches.',
      'AI-generated responses should be treated as supplementary informational material, not as confirmation of recipe safety or a substitute for professional technological guidance.'
    ]
  }
};

const SHARE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
const CHECK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

function escapeAttr(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getField(field, lang) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field.ru || field.en || '';
}

function formatDisplayDate(rawDate, lang) {
  if (!rawDate) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(rawDate).trim());
  if (!match) return String(rawDate);
  const [, year, month, day] = match;
  if (lang === 'en') return `${month}/${day}/${year}`;
  return `${day}.${month}.${year}`;
}

function normalizeVersion(rawVersion) {
  if (!rawVersion) return '';
  return String(rawVersion).trim().replace(/^v\.?\s*/i, '');
}

function renderAiAccordion(ui) {
  if (!ui.aiAccordionTitle || !Array.isArray(ui.aiAccordionBody)) return '';
  const paragraphs = ui.aiAccordionBody
    .map((text) => `    <p>${escapeHtml(text)}</p>`)
    .join('\n');

  return `<details class="ai-accordion">
  <summary class="ai-accordion-summary">
    <span class="ai-accordion-title">${escapeHtml(ui.aiAccordionTitle)}</span>
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

function renderColophon(item, ui, lang) {
  const author = getField(item.author, lang);
  const sourceRecipe = getField(item.sourceRecipe, lang);
  const platform = getField(item.platform, lang);
  const version = normalizeVersion(item.version);
  const pubDate = formatDisplayDate(item.date, lang);

  const lines = [];
  if (author) {
    lines.push(`  <p><strong>${escapeHtml(ui.authorLabel)}:</strong> ${escapeHtml(author)}</p>`);
  }
  if (sourceRecipe) {
    lines.push(`  <p><strong>${escapeHtml(ui.sourceRecipeLabel)}:</strong> ${escapeHtml(sourceRecipe)}</p>`);
  }
  if (platform) {
    lines.push(`  <p><strong>${escapeHtml(ui.platformLabel)}:</strong> ${escapeHtml(platform)}</p>`);
  }
  if (version) {
    lines.push(`  <p><strong>${escapeHtml(ui.publicationVersionLabel)}:</strong> ${escapeHtml(version)}</p>`);
  }
  if (pubDate) {
    lines.push(`  <p><strong>${escapeHtml(ui.publicationDateLabel)}:</strong> ${escapeHtml(pubDate)}</p>`);
  }

  if (!lines.length) return '';

  return `\n<div class="doc-colophon">\n${lines.join('\n')}\n</div>`;
}

fs.mkdirSync(SHARE_DIR, { recursive: true });

for (const item of indexData) {
  for (const lang of ['ru', 'en']) {
    const ext = item.format === 'html' ? 'html' : 'md';
    const contentPath = path.join(BASE_DIR, `content/${lang}/${item.slug}.${ext}`);

    if (!fs.existsSync(contentPath)) continue;

    const ui = UI[lang];
    const rawBodyHtml = fs.readFileSync(contentPath, 'utf8').trimEnd();
    const cleanedBodyHtml = stripManualAiAccordion(rawBodyHtml);
    const bodyHtml = insertAiAccordionBeforeFirstHeading(cleanedBodyHtml, renderAiAccordion(ui));
    const colophonHtml = renderColophon(item, ui, lang);
    const title = getField(item.title, lang);
    const summary = getField(item.summary, lang);
    const tag = getField(item.tag, lang);
    const status = getField(item.status, lang);
    const date = item.date || '';
    const rawVersion = item.version || '';
    const normVersion = normalizeVersion(rawVersion);

    const fullHtml = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeAttr(title)} — Dmitry Lab</title>
  <meta name="description" content="${escapeAttr(summary)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Dmitry Lab">
  <meta property="og:title" content="${escapeAttr(title)} — Dmitry Lab">
  <meta property="og:description" content="${escapeAttr(summary)}">
  <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
  <header class="site-header" style="border-bottom: 1px solid #E2E8F0; padding: 16px 0; margin-bottom: 24px;">
    <div class="container" style="display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
      <a href="../index.html?lang=${lang}" style="text-decoration: none; color: #1E293B; font-weight: 600; letter-spacing: 0.04em; border-left: 4px solid #0F766E; padding-left: 10px;">
        DMITRY LAB <span style="color: #475569; font-weight: 400;">· Culinary Systems</span>
      </a>
      <nav style="display: flex; gap: 8px; align-items: center;">
        <a href="../index.html?lang=${lang}" class="btn">${escapeHtml(ui.catalogLabel)}</a>
        <a href="../post.html?slug=${encodeURIComponent(item.slug)}&lang=${lang}" class="btn">${escapeHtml(ui.backLabel)}</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <header class="post-header">
      <div class="meta-row post-meta-bar">
        ${tag ? `<span class="tag">${escapeAttr(tag)}</span>` : ''}
        ${status ? `<span class="status">${escapeAttr(status)}</span>` : ''}
        <span class="mono">${escapeAttr(date)}${normVersion ? ` · v${escapeAttr(normVersion)}` : ''}</span>
      </div>
      <h1>${title}</h1>
    </header>

    <article class="post-body">
${bodyHtml}${colophonHtml}
    </article>
  </main>

  <footer style="border-top: 1px solid #E2E8F0; margin-top: 48px; padding: 20px 0; color: #475569; font-size: 13px;">
    <div class="container" style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
      <span><strong style="color: #0F766E;">DMITRY LAB</strong> — Craft. Construction. Result.</span>
      <span class="mono">${escapeAttr(rawVersion)} · ${escapeAttr(date)}</span>
    </div>
  </footer>

  <button type="button" id="floating-share-btn" class="floating-share-btn" onclick="copyCurrentUrl(this)">
    ${SHARE_ICON}
    <span>${escapeHtml(ui.shareLabel)}</span>
  </button>

  <script>
    function copyCurrentUrl(btn) {
      const url = window.location.href;
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        navigator.share({ title: document.title, url }).catch(() => {});
        return;
      }
      navigator.clipboard.writeText(url).then(() => {
        btn.classList.add('copied');
        btn.innerHTML = '${CHECK_ICON}<span>${escapeHtml(ui.copiedLabel)}</span>';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = '${SHARE_ICON}<span>${escapeHtml(ui.shareLabel)}</span>';
        }, 2000);
      }).catch(() => {
        prompt('${escapeHtml(ui.shareLabel)}', url);
      });
    }
  </script>
</body>
</html>`;

    fs.writeFileSync(path.join(SHARE_DIR, `${item.slug}-${lang}.html`), fullHtml, 'utf8');
    console.log(`Собрано: share/${item.slug}-${lang}.html`);
  }
}