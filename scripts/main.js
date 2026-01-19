/**
 * Главный скрипт автоматической генерации статей
 * Объединяет парсинг новостей и генерацию статей
 */

import { parseNews } from './parse-news.js';
import { generateArticleFromNews } from './generate-article.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Главная функция
 */
async function main() {
  console.log('🚀 Запуск автоматической генерации статей...\n');
  
  try {
    // Шаг 1: Парсинг новостей
    console.log('📰 ШАГ 1: Парсинг новостей с проверенных источников\n');
    const news = await parseNews();
    
    if (news.length === 0) {
      console.log('ℹ️ Новых новостей не найдено. Выход.');
      return;
    }
    
    console.log(`\n✅ Найдено ${news.length} новых новостей\n`);
    
    // Шаг 2: Генерация статей (берем первую новость)
    console.log('✍️ ШАГ 2: Генерация статьи через AI\n');
    const result = await generateArticleFromNews(news[0]);
    
    if (result.success) {
      console.log(`\n🎉 Успешно! Статья создана: ${result.fileName}`);
      console.log('\n📋 Следующие шаги:');
      console.log('1. Проверьте созданную статью');
      console.log('2. Зафиксируйте изменения: git add .');
      console.log('3. Закоммитьте: git commit -m "Auto: новая статья"');
      console.log('4. Запушьте: git push origin main');
    } else {
      console.error(`\n❌ Ошибка генерации: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Критическая ошибка:', error);
    process.exit(1);
  }
}

// Запуск
main();
