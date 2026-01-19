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
const ARTICLE_TEMPLATE_PATH = path.join(__dirname, '..', 'ARTICLE_TEMPLATE.md');

/**
 * Генерация статьи через AI
 */
async function generateArticleContent(newsItem) {
  const prompt = `Напиши подробную статью о боксе на русском языке на основе следующей новости:

Заголовок: ${newsItem.title}
Описание: ${newsItem.description}
Источник: ${newsItem.source}
Дата: ${newsItem.pubDate}

Требования к статье:
1. Заголовок должен быть привлекательным и SEO-оптимизированным
2. Статья должна быть 800-1200 слов
3. Раздели на логические разделы с подзаголовками (h2)
4. Добавь контекст и анализ события
5. Используй профессиональную терминологию бокса
6. В конце добавь вывод и связь с клубом RING в Пензе
7. Категория: "Анализ боёв" или "Новости бокса"

Верни только текст статьи в формате Markdown, без дополнительных пояснений.`;

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
  
  // Простая замена плейсхолдеров
  let html = template
    .replace(/\[ЗАГОЛОВОК_СТАТЬИ\]/g, title)
    .replace(/\[ДАТА\]/g, formatDate(date))
    .replace(/\[КАТЕГОРИЯ\]/g, category)
    .replace(/\[КРАТКОЕ_ОПИСАНИЕ_ДЛЯ_ПОИСКОВИКОВ\]/g, title.substring(0, 160))
    .replace(/\[КЛЮЧЕВЫЕ_СЛОВА\]/g, 'бокс, новости бокса, ' + title.split(' ').slice(0, 5).join(', '))
    .replace(/\[ВРЕМЯ\]/g, Math.ceil(content.split(/\s+/).length / 200))
    .replace(/\[КРАТКОЕ_НАЗВАНИЕ_ДЛЯ_КРОШЕК\]/g, title.substring(0, 40));

  // Конвертация Markdown в HTML (упрощенная)
  const markdownToHTML = (md) => {
    return md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="color: var(--gold-metal); font-size: 1.6rem; font-weight: 800; margin: 40px 0 20px; padding-top: 30px; border-top: 1px solid rgba(200, 178, 115, 0.1);">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\n\n/gim, '</p><p style="margin-bottom: 20px;">')
      .replace(/^(.+)$/gim, '<p style="margin-bottom: 20px;">$1</p>');
  };

  // Замена контента
  html = html.replace(
    /<!-- Контент -->[\s\S]*?<!-- Добавьте столько разделов, сколько нужно -->/,
    `<!-- Контент -->
                    <div style="color: #aaa; font-size: 1.05rem; line-height: 1.8;">
                        ${markdownToHTML(content)}
                    </div>`
  );

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
    // Генерация контента через AI
    const content = await generateArticleContent(newsItem);
    
    if (!content || content.length < 100) {
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
    
    // Обновление данных
    updateArticlesData({
      title: newsItem.title,
      description: content.substring(0, 150),
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
