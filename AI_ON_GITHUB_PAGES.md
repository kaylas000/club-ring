# Как оставить сайт на GitHub Pages и при этом включить AI‑ассистента

GitHub Pages — статический хостинг. Он **не может хранить секреты** и **не умеет выполнять серверный код**.
Поэтому AI‑чат делаем так:

- **Frontend** (сайт) — на GitHub Pages
- **Backend** (AI endpoint с API‑ключом) — отдельно (например, Cloudflare Worker)

## 1) Виджет на сайте (уже добавлено)

Файл: `js/ai-chat.js`  
Подключён на страницах (внизу перед `</body>`).

Чтобы указать URL backend, задайте переменную:

```html
<script>
  window.AI_CHAT_ENDPOINT = "https://YOUR-WORKER.your-subdomain.workers.dev/chat";
</script>
```

Сейчас в страницах стоит `window.AI_CHAT_ENDPOINT = window.AI_CHAT_ENDPOINT || ""` — вы можете заменить `""` на ваш URL (или оставить и задавать через другой скрипт).

## 2) Backend на Cloudflare Worker

Код воркера лежит в `ai-backend/cloudflare-worker.js`.

Шаги:

1. Создайте Worker в Cloudflare (Workers)
2. Вставьте код из `ai-backend/cloudflare-worker.js`
3. Добавьте Secret: `GROQ_API_KEY`
4. (Опционально) добавьте Variable: `GROQ_MODEL` (например `llama-3.1-8b-instant`)
5. Опубликуйте Worker и получите URL вида `https://xxxxx.workers.dev`

Endpoint будет: `https://xxxxx.workers.dev/chat`

## 3) Безопасность

- **API ключ НЕ хранится в репозитории** и не попадает на GitHub Pages.
- CORS в воркере включён. Если нужно — ограничьте его whitelist доменов (в `corsHeaders()`).

