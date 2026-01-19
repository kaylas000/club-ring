# AI‑ассистент на GitHub Pages (club-ring.ru) — без ключей в репозитории

Сайт `https://club-ring.ru/` остаётся статическим (GitHub Pages).
AI‑логика работает через внешний endpoint (например Cloudflare Workers на `workers.dev`) — **DNS домена менять не нужно**.

## Что уже есть в репо

- Виджет: `js/ai-chat.js` (подключён на страницах)
- Пример backend: `ai-backend/cloudflare-worker.js`
- Workflow деплоя: `.github/workflows/deploy-ai-worker.yml`

## Что нужно сделать один раз

### 1) Деплой backend (Workers)

- задеплойте `ai-backend/cloudflare-worker.js`
- добавьте Secret `GROQ_API_KEY` (в Cloudflare / GitHub Secrets, но не в git)

Worker будет доступен как `https://<name>.<account>.workers.dev`.
Endpoint: `https://<...>.workers.dev/chat`

### 2) Прописать endpoint на сайте

Внизу страниц установите:

```html
<script>
  window.AI_CHAT_ENDPOINT = "https://<...>.workers.dev/chat";
</script>
<script src="js/ai-chat.js"></script>
```

## Важно

Нельзя коммитить `GROQ_API_KEY` в репозиторий — GitHub Push Protection блокирует такие пуши.

# 🚀 Автоматический деплой AI-ассистента на https://club-ring.ru/

## ✅ Что уже готово

1. ✅ AI-виджет (`js/ai-chat.js`) подключён на всех страницах
2. ✅ Cloudflare Worker код (`ai-backend/cloudflare-worker.js`)
3. ✅ GitHub Actions workflow (`.github/workflows/deploy-ai-worker.yml`)
4. ✅ Конфигурация Wrangler (`ai-backend/wrangler.toml`)

## 📋 Что нужно сделать ОДИН РАЗ (5 минут)

### Шаг 1: Получить Cloudflare API токены

1. Зайдите на https://dash.cloudflare.com/profile/api-tokens
2. Нажмите **"Create Token"**
3. Используйте шаблон **"Edit Cloudflare Workers"**
4. Скопируйте **API Token** (начинается с `...`)
5. Также скопируйте **Account ID** (в правой панели Dashboard)

### Шаг 2: Добавить секреты в GitHub

1. Зайдите в репозиторий: https://github.com/kaylas000/club-ring
2. **Settings → Secrets and variables → Actions**
3. Добавьте 3 секрета:
   - `CLOUDFLARE_API_TOKEN` = ваш API Token из шага 1
   - `CLOUDFLARE_ACCOUNT_ID` = ваш Account ID из шага 1
   - `GROQ_API_KEY` = `ваш_ключ_здесь`

### Шаг 3: Запустить деплой

После добавления секретов:
- Либо сделайте `git push` (workflow запустится автоматически)
- Либо зайдите в **Actions** → **Deploy AI Worker** → **Run workflow**

### Шаг 4: Получить URL Worker и обновить сайт

После успешного деплоя:
1. Зайдите в Cloudflare Dashboard → **Workers & Pages**
2. Найдите Worker `club-ring-ai`
3. Скопируйте URL (например: `https://club-ring-ai.YOUR-ACCOUNT.workers.dev`)
4. Endpoint для чата: `https://club-ring-ai.YOUR-ACCOUNT.workers.dev/chat`

5. Обновите все HTML страницы, заменив:
   ```html
   window.AI_CHAT_ENDPOINT = window.AI_CHAT_ENDPOINT || "";
   ```
   на:
   ```html
   window.AI_CHAT_ENDPOINT = "https://club-ring-ai.YOUR-ACCOUNT.workers.dev/chat";
   ```

## 🎉 Готово!

После этого AI-ассистент будет работать на https://club-ring.ru/

---

**Альтернатива (если не хотите настраивать Cloudflare):**

Можно использовать Vercel или другой сервис - напишите, настрою под него.
