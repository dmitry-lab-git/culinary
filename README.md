# Создание новой статьи в Dmitry Lab Culinary

Каталог и тексты материалов организованы так: метаданные карточек и страниц хранятся в `content/index.json`, а сами статьи по языкам — в `content/ru/<slug>.html` и `content/en/<slug>.html`.

## 1. Добавьте запись в `content/index.json`

Добавьте новый объект в массив `content/index.json` (лучше ближе к началу списка, чтобы новые публикации шли первыми):

```json
{
  "slug": "your-article-slug",
  "format": "html",
  "tag": {
    "ru": "Рецепт",
    "en": "Recipe"
  },
  "status": {
    "ru": "Опубликовано",
    "en": "Published"
  },
  "version": "v1.0",
  "date": "2026-11-24",
  "title": {
    "ru": "Заголовок на русском (без подмены понятий: если не чай — так и называем)",
    "en": "Title in English"
  },
  "summary": {
    "ru": "Краткое описание процесса и результата для карточки и мета-описания.",
    "en": "Concise summary of the process and outcome for the card and meta description."
  }
}
```

## 2. Создайте HTML-файлы статьи для обоих языков

Создайте два файла с одинаковым `<slug>`:

- `content/ru/<slug>.html` — русская версия статьи.
- `content/en/<slug>.html` — английская версия статьи.

Для оформления внутри статьи используйте принятые классы из `assets/css/style.css`:

- **Подзаголовки разделов:** `<h2 id="sec-...">...</h2>` и `<h3>...</h3>`.
- **Акценты и параметры:** `<span class="hl">...</span>` и `<span class="param">...</span>`.
- **Выноски:** `<div class="callout-caution">`, `<div class="callout-signal">`, `<div class="callout-hypothesis">`.
- **Списки:** `<ul class="clean-list">...</ul>`.

## 3. Добавьте блок авторства и редакций (`.doc-colophon`)

В конце каждой статьи добавляйте блок `.doc-colophon` в едином оформлении:

```html
<div class="doc-colophon">
  <div class="doc-colophon-author">Мелихов Дмитрий</div>
  <div class="doc-colophon-dates">
    <span>Первая редакция (v1.0): <time datetime="2026-11-24">2026-11-24</time></span>
  </div>
</div>
```

Для английской версии используйте те же даты и структуру, переведя подписи:

```html
<div class="doc-colophon">
  <div class="doc-colophon-author">Dmitry Melikhov</div>
  <div class="doc-colophon-dates">
    <span>First edition (v1.0): <time datetime="2026-11-24">2026-11-24</time></span>
  </div>
</div>
```

## 4. Проверьте отображение перед публикацией

1. Откройте `index.html` и убедитесь, что карточка новой статьи корректно переключается между **RU** и **EN**.
2. Перейдите на страницу статьи (`post.html?slug=<slug>`) и проверьте шапку, строку метаданных, заголовки, списки и блок `.doc-colophon` на десктопе и на мобильном экране.
