/**
 * Генератор статей из новостей через AI
 * Использует Cloudflare Worker для генерации контента
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AI_ENDPOINT = 'https://club-ring-ai.club-ring-ai.workers.dev/generate-article';
const ARTICLE_TEMPLATE_PATH = path.join(__dirname, '..', 'boxing-riyadh-night-of-champions.html');

/**
 * Перевод новости на русский язык через AI
 */
async function translateNewsToRussian(newsItem) {
  if (newsItem.language === 'ru') {
    return newsItem; // Уже на русском
  }

  try {
    console.log(`🌐 Перевод новости с ${newsItem.language} на русский...`);
    
    const translatePrompt = `Переведи следующую новость о боксе с английского на русский язык. Сохрани все факты, имена, даты и цифры точно. Верни только перевод без дополнительных пояснений.

Заголовок: ${newsItem.title}
Текст: ${newsItem.description}`;

    const response = await fetch(AI_ENDPOINT.replace('/generate-article', '/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: translatePrompt
      })
    });

    if (!response.ok) {
      console.warn('⚠️ Ошибка перевода, используем оригинал');
      return newsItem;
    }

    const data = await response.json();
    const translated = data.response || '';
    
    // Парсим перевод (предполагаем формат "Заголовок: ...\nТекст: ...")
    const lines = translated.split('\n');
    const titleMatch = translated.match(/Заголовок[:\s]+(.+)/i);
    const textMatch = translated.match(/Текст[:\s]+(.+)/is);
    
    return {
      ...newsItem,
      title: titleMatch ? titleMatch[1].trim() : newsItem.title,
      description: textMatch ? textMatch[1].trim() : newsItem.description,
      language: 'ru'
    };
  } catch (error) {
    console.warn('⚠️ Ошибка перевода:', error.message);
    return newsItem; // Возвращаем оригинал при ошибке
  }
}

/**
 * Генерация статьи через AI
 */
async function generateArticleContent(newsItem) {
  const prompt = `Напиши подробную развернутую аналитическую статью о боксе на русском языке на основе следующей новости:

Заголовок: ${newsItem.title}
Описание: ${newsItem.description}
Источник: ${newsItem.source}
Дата: ${newsItem.pubDate}

ТРЕБОВАНИЯ К СТАТЬЕ (ОБЯЗАТЕЛЬНО СОБЛЮДАЙ ВСЕ ПУНКТЫ):

1. ОБЪЕМ: Статья должна быть 2000-3000 слов (не меньше!). Это не краткая новость, а полноценная аналитическая статья.

2. СТРУКТУРА:
   - Начни с введения (2-3 абзаца), которое задает контекст события
   - Раздели на 4-6 логических разделов с подзаголовками уровня h2 (##)
   - Каждый раздел должен быть развернутым (минимум 3-4 абзаца)
   - Добавь подразделы h3 (###) где уместно
   - Заверши выводом и связью с клубом RING в Пензе

3. СТИЛЬ И КОНТЕНТ:
   - Используй профессиональную терминологию бокса
   - Добавь исторический контекст: упомяни похожие события в истории бокса
   - Включи анализ: почему это важно, какие последствия может иметь
   - Добавь детали: имена боксёров, весовые категории, титулы, даты
   - Используй описательный язык, создавай атмосферу
   - Включи мнения экспертов (можно обобщенные: "эксперты считают...")

4. ПРИМЕРЫ РАЗДЕЛОВ:
   - "Исторический контекст: предыстория события"
   - "Детальный разбор: что произошло"
   - "Анализ и последствия"
   - "Место в истории бокса"
   - "Выводы и перспективы"

5. ФОРМАТ:
   - Используй Markdown форматирование
   - Подзаголовки: ## для h2, ### для h3
   - Выделяй важные моменты **жирным**
   - Используй списки где уместно

6. В КОНЦЕ обязательно добавь:
   - Связь с клубом RING в Пензе (1-2 абзаца)
   - Призыв к действию: запись на тренировки, телефон +7 (937) 429-11-11

Верни только текст статьи в формате Markdown, без дополнительных пояснений. Статья должна быть развернутой и аналитической, как полноценная журналистская работа.`;

  try {
    console.log(`🤖 Генерация статьи: "${newsItem.title.substring(0, 50)}..."`);
    
    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt,
        title: newsItem.title,
        source: newsItem.source 
      })
    });

    if (!response.ok) {
      throw new Error(`AI endpoint error: ${response.status}`);
    }

    const data = await response.json();
    return data.content || data.response || '';
  } catch (error) {
    console.error(`❌ Ошибка генерации статьи:`, error.message);
    throw error;
  }
}

/**
 * Создание имени файла из заголовка
 */
function createFileName(title) {
  return title
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)
    .replace(/-$/, '') + '.html';
}

/**
 * Генерация HTML из Markdown и шаблона
 */
function generateHTML(title, content, date, category) {
  const template = fs.readFileSync(ARTICLE_TEMPLATE_PATH, 'utf-8');
  
  // Находим секцию с контентом статьи для замены
  const dateObj = new Date(date);
  const dateFormatted = formatDate(date);
  const readingTime = Math.max(15, Math.ceil(content.split(/\s+/).length / 200));
  const description = content.substring(0, 160).replace(/"/g, '&quot;');
  const keywords = 'бокс, новости бокса, ' + title.split(' ').slice(0, 5).join(', ');
  
  // Заменяем заголовок в title и meta
  let html = template
    .replace(/<title>.*?<\/title>/i, `<title>${title} | RING BOXING CLUB</title>`)
    .replace(/meta name="description" content="[^"]*"/i, `meta name="description" content="${description}"`)
    .replace(/meta name="keywords" content="[^"]*"/i, `meta name="keywords" content="${keywords}"`)
    .replace(/property="og:title" content="[^"]*"/i, `property="og:title" content="${title}"`)
    .replace(/property="og:description" content="[^"]*"/i, `property="og:description" content="${description}"`)
    .replace(/itemprop="headline"[^>]*>.*?<\/h1>/i, `itemprop="headline">${title}</h1>`)
    .replace(/itemprop="description"[^>]*>.*?<\/p>/i, `itemprop="description">${description}</p>`)
    .replace(/class="blog-date"[^>]*>.*?<\/div>/i, `class="blog-date" itemprop="datePublished" content="${dateObj.toISOString().split('T')[0]}">${dateFormatted} ${dateObj.getFullYear()}</div>`)
    .replace(/Анализ боёв/g, category) // Заменяем категорию в бейдже
    .replace(/⏱️ \d+ минут чтения/i, `⏱️ ${readingTime} минут чтения`)
    .replace(/<span>Рияд как новая столица бокса<\/span>/i, `<span>${title.substring(0, 40)}</span>`);


    // Улучшенная конвертация Markdown в HTML
    const markdownToHTML = (md) => {
      let html = md;
      
      // Заголовки h2
      html = html.replace(/^##\s+(.+)$/gim, '</div><h2 style="color: var(--gold-metal); font-size: 1.6rem; font-weight: 800; margin: 40px 0 20px; padding-top: 30px; border-top: 1px solid rgba(200, 178, 115, 0.1);">$1</h2><div style="color: #aaa; font-size: 1.05rem; line-height: 1.8;">');
      
      // Заголовки h3
      html = html.replace(/^###\s+(.+)$/gim, '</div><h3 style="color: var(--silver-metal); font-size: 1.3rem; margin: 30px 0 15px;">$1</h3><div style="color: #aaa; font-size: 1.05rem; line-height: 1.8;">');
      
      // Жирный текст
      html = html.replace(/\*\*(.+?)\*\*/gim, '<strong>$1</strong>');
      
      // Курсив
      html = html.replace(/\*(.+?)\*/gim, '<em>$1</em>');
      
      // Параграфы (двойной перенос строки)
      html = html.split('\n\n').map(para => {
        para = para.trim();
        if (!para) return '';
        if (para.startsWith('<h')) return para; // Уже обработанные заголовки
        return `<p style="margin-bottom: 20px;">${para}</p>`;
      }).join('\n');
      
      // Эмодзи между разделами (добавляем автоматически)
      html = html.replace(/<\/h2>/g, '</h2>\n<div style="text-align: center; font-size: 3rem; margin: 30px 0;">🥊</div>');
      
      return html;
    };

    // Замена контента статьи (находим div с itemprop="articleBody")
    const articleBodyRegex = /<div itemprop="articleBody"[^>]*>[\s\S]*?<\/div>/i;
    const articleBodyMatch = html.match(articleBodyRegex);
    
    if (articleBodyMatch) {
      const convertedContent = markdownToHTML(content);
      html = html.replace(articleBodyRegex, `<div itemprop="articleBody" style="color:#aaa;font-size:1.05rem;line-height:1.8">${convertedContent}</div>`);
    } else {
      // Fallback: ищем любой большой div с контентом
      html = html.replace(/<div[^>]*style="[^"]*color:#aaa[^"]*"[^>]*>[\s\S]*?<\/div>/i, 
        `<div style="color:#aaa;font-size:1.05rem;line-height:1.8">${markdownToHTML(content)}</div>`);
    }

  return html;
}

/**
 * Форматирование даты
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

/**
 * Обновление articles-data.js
 */
function updateArticlesData(newArticle) {
  const articlesDataPath = path.join(__dirname, '..', 'js', 'articles-data.js');
  let content = fs.readFileSync(articlesDataPath, 'utf-8');
  
  const newEntry = `    {
        date: "${new Date().toISOString().split('T')[0]}",
        dateText: "${formatDate(new Date())}",
        title: "${newArticle.title.replace(/"/g, '\\"')}",
        description: "${newArticle.description.substring(0, 150).replace(/"/g, '\\"')}",
        category: "${newArticle.category}",
        categoryClass: "gold",
        url: "${newArticle.fileName}",
        isExternal: false
    },`;
  
  // Вставляем в начало массива
  content = content.replace(
    /const articlesData = \[/,
    `const articlesData = [\n${newEntry}`
  );
  
  fs.writeFileSync(articlesDataPath, content, 'utf-8');
  console.log('✅ Обновлен articles-data.js');
}

/**
 * Обновление sitemap.xml
 */
function updateSitemap(fileName, title) {
  const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
  let sitemap = fs.readFileSync(sitemapPath, 'utf-8');
  
  const today = new Date().toISOString().split('T')[0];
  const newEntry = `  <url>
    <loc>https://club-ring.ru/${fileName}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
`;
  
  // Вставляем перед закрывающим тегом </urlset>
  sitemap = sitemap.replace('</urlset>', newEntry + '</urlset>');
  
  fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
  console.log('✅ Обновлен sitemap.xml');
}

/**
 * Главная функция генерации
 */
export async function generateArticleFromNews(newsItem) {
  try {
    // Шаг 1: Перевод на русский (если нужно)
    const translatedNews = await translateNewsToRussian(newsItem);
    
    // Шаг 2: Генерация контента через AI
    const content = translatedNews.content || await generateArticleContent(translatedNews);
    
    if (!content && !translatedNews.content) {
      throw new Error('AI вернул слишком короткий контент');
    }
    
    // Определение категории
    const category = newsItem.title.toLowerCase().includes('бой') || 
                     newsItem.title.toLowerCase().includes('fight') ||
                     newsItem.title.toLowerCase().includes('match')
      ? 'Анализ боёв' : 'Новости бокса';
    
    // Создание файла
    const fileName = createFileName(newsItem.title);
    const filePath = path.join(__dirname, '..', fileName);
    
    const html = generateHTML(newsItem.title, content, newsItem.pubDate, category);
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`✅ Создан файл: ${fileName}`);
    
    // Обновление данных (очищаем от Markdown в описании)
    const cleanDescription = content
      .replace(/^#+\s+/gm, '') // Убираем заголовки Markdown
      .replace(/\*\*/g, '') // Убираем жирный текст
      .replace(/\*/g, '') // Убираем курсив
      .replace(/\n+/g, ' ') // Заменяем переносы на пробелы
      .trim()
      .substring(0, 150);
    
    updateArticlesData({
      title: translatedNews.title, // Используем переведенный заголовок
      description: cleanDescription,
      category,
      fileName
    });
    
    updateSitemap(fileName, newsItem.title);
    
    return { fileName, success: true };
  } catch (error) {
    console.error(`❌ Ошибка генерации статьи:`, error);
    return { success: false, error: error.message };
  }
}

// Запуск если вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  const newsPath = path.join(__dirname, 'parsed-news.json');
  
  if (!fs.existsSync(newsPath)) {
    console.error('❌ Файл parsed-news.json не найден. Сначала запустите parse-news.js');
    process.exit(1);
  }
  
  const news = JSON.parse(fs.readFileSync(newsPath, 'utf-8'));
  
  if (news.length === 0) {
    console.log('ℹ️ Нет новых новостей для генерации статей');
    process.exit(0);
  }
  
  // Генерируем статью из первой новости
  generateArticleFromNews(news[0]).then(result => {
    if (result.success) {
      console.log(`\n🎉 Статья успешно создана: ${result.fileName}`);
    } else {
      console.error(`\n❌ Ошибка: ${result.error}`);
      process.exit(1);
    }
  });
}
