/**
 * Парсер новостей бокса с проверенных источников
 * Использует RSS фиды и HTML парсинг
 */

import Parser from 'rss-parser';
import fetch from 'node-fetch';
// import * as cheerio from 'cheerio'; // Пока не используется
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new Parser({
  customFields: {
    item: ['media:content', 'enclosure']
  }
});

/**
 * Загрузить источники из конфига
 */
function loadSources() {
  const configPath = path.join(__dirname, 'news-sources.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  return config.sources.filter(s => s.enabled);
}

/**
 * Парсинг RSS фида
 */
async function parseRSS(source) {
  try {
    console.log(`📡 Парсинг RSS: ${source.name}...`);
    const feed = await parser.parseURL(source.rss);
    
    const articles = feed.items
      .slice(0, 10) // Берем последние 10 новостей
      .map(item => ({
        title: item.title || '',
        description: item.contentSnippet || item.content || '',
        link: item.link || '',
        pubDate: item.pubDate || new Date().toISOString(),
        source: source.name,
        language: source.language
      }))
      .filter(item => item.title && item.link);
    
    console.log(`✅ Найдено ${articles.length} новостей из ${source.name}`);
    return articles;
  } catch (error) {
    console.error(`❌ Ошибка парсинга ${source.name}:`, error.message);
    return [];
  }
}

/**
 * Проверка на дубликаты (по заголовку)
 */
function filterDuplicates(articles, existingTitles = []) {
  const seen = new Set(existingTitles.map(t => t.toLowerCase().trim()));
  
  return articles.filter(article => {
    const titleKey = article.title.toLowerCase().trim();
    if (seen.has(titleKey)) {
      return false;
    }
    seen.add(titleKey);
    return true;
  });
}

/**
 * Фильтрация по ключевым словам
 */
function filterByKeywords(articles, filters) {
  return articles.filter(article => {
    const text = `${article.title} ${article.description}`.toLowerCase();
    
    // Проверка на исключающие слова
    if (filters.excludeKeywords.some(keyword => text.includes(keyword.toLowerCase()))) {
      return false;
    }
    
    // Проверка на обязательные слова
    if (filters.keywords && filters.keywords.length > 0) {
      const hasKeyword = filters.keywords.some(keyword => 
        text.includes(keyword.toLowerCase())
      );
      if (!hasKeyword) return false;
    }
    
    // Проверка длины
    const wordCount = text.split(/\s+/).length;
    if (filters.minWords && wordCount < filters.minWords) return false;
    if (filters.maxWords && wordCount > filters.maxWords) return false;
    
    return true;
  });
}

/**
 * Загрузить существующие заголовки статей
 */
function loadExistingTitles() {
  try {
    const articlesDataPath = path.join(__dirname, '..', 'js', 'articles-data.js');
    const content = fs.readFileSync(articlesDataPath, 'utf-8');
    
    // Простой парсинг массива articlesData
    const titleMatches = content.matchAll(/title:\s*"([^"]+)"/g);
    return Array.from(titleMatches, m => m[1]);
  } catch (error) {
    console.warn('⚠️ Не удалось загрузить существующие заголовки:', error.message);
    return [];
  }
}

/**
 * Главная функция парсинга
 */
export async function parseNews() {
  console.log('🚀 Начало парсинга новостей бокса...\n');
  
  const sources = loadSources();
  const configPath = path.join(__dirname, 'news-sources.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  
  const allArticles = [];
  
  // Парсим все источники
  for (const source of sources) {
    if (source.type === 'rss' && source.rss) {
      const articles = await parseRSS(source);
      allArticles.push(...articles);
    }
    
    // Небольшая задержка между запросами
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 Всего собрано: ${allArticles.length} новостей`);
  
  // Фильтрация
  const existingTitles = loadExistingTitles();
  const uniqueArticles = filterDuplicates(allArticles, existingTitles);
  console.log(`🔍 После фильтрации дубликатов: ${uniqueArticles.length} новостей`);
  
  const filteredArticles = filterByKeywords(uniqueArticles, config.filters);
  console.log(`✅ После фильтрации по ключевым словам: ${filteredArticles.length} новостей\n`);
  
  // Сохраняем результаты
  const outputPath = path.join(__dirname, 'parsed-news.json');
  fs.writeFileSync(outputPath, JSON.stringify(filteredArticles, null, 2), 'utf-8');
  console.log(`💾 Результаты сохранены в: ${outputPath}`);
  
  return filteredArticles;
}

// Запуск если вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  parseNews().catch(console.error);
}
