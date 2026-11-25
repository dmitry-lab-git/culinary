import fs from 'fs';
import path from 'path';

const BASE_DIR = '.';
const SHARE_DIR = path.join(BASE_DIR, 'share');
const indexData = JSON.parse(fs.readFileSync(path.join(BASE_DIR, 'content/index.json'), 'utf8'));

const SHARE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
const CHECK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

function escapeAttr(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getField(field, lang) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field.ru || field.en || '';
}

fs.mkdirSync(SHARE_DIR, { recursive: true });

for (const item of indexData) {
  for (const lang of ['ru', 'en']) {
    const ext = item.format === 'html' ? 'html' : 'md';
    const contentPath = path.join(BASE_DIR, `content/${lang}/${item.slug}.${ext}`);

    if (!fs.existsSync(contentPath)) continue;

    const bodyHtml = fs.readFileSync(contentPath, 'utf8');
    const title = getField(item.title, lang);
    const summary = getField(item.summary, lang);
    const tag = getField(item.tag, lang);
    const status = getField(item.status, lang);
    const date = item.date || '';
    const version = item.version || '';

    const shareLabel = lang === 'ru' ? 'Поделиться ссылкой' : 'Share link';
    const copiedLabel = lang === 'ru' ? 'Ссылка скопирована' : 'Link copied';
    const backLabel = lang === 'ru' ? '← Интерактивная версия' : '← Interactive view';
    const catalogLabel = lang === 'ru' ? 'Каталог' : 'Catalog';

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
        <a href="../index.html?lang=${lang}" class="btn">${catalogLabel}</a>
        <a href="../post.html?slug=${encodeURIComponent(item.slug)}&lang=${lang}" class="btn">${backLabel}</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <header class="post-header">
      <div class="meta-row post-meta-bar">
        ${tag ? `<span class="tag">${escapeAttr(tag)}</span>` : ''}
        ${status ? `<span class="status">${escapeAttr(status)}</span>` : ''}
        <span class="mono">${escapeAttr(date)}${version ? ` · ${escapeAttr(version)}` : ''}</span>
      </div>
      <h1>${title}</h1>
    </header>

    <article class="post-body">
${bodyHtml}
    </article>
  </main>

  <footer style="border-top: 1px solid #E2E8F0; margin-top: 48px; padding: 20px 0; color: #475569; font-size: 13px;">
    <div class="container" style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
      <span><strong style="color: #0F766E;">DMITRY LAB</strong> — Craft. Construction. Result.</span>
      <span class="mono">${escapeAttr(version)} · ${escapeAttr(date)}</span>
    </div>
  </footer>

  <button type="button" id="floating-share-btn" class="floating-share-btn" onclick="copyCurrentUrl(this)">
    ${SHARE_ICON}
    <span>${shareLabel}</span>
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
        btn.innerHTML = '${CHECK_ICON}<span>${copiedLabel}</span>';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = '${SHARE_ICON}<span>${shareLabel}</span>';
        }, 2000);
      }).catch(() => {
        prompt('${shareLabel}', url);
      });
    }
  </script>
</body>
</html>`;

    fs.writeFileSync(path.join(SHARE_DIR, `${item.slug}-${lang}.html`), fullHtml, 'utf8');
    console.log(`Собрано: share/${item.slug}-${lang}.html`);
  }
}
