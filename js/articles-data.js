/**
 * База данных статей RING BOXING CLUB
 * При добавлении новой статьи добавьте её В НАЧАЛО массива
 */

const articlesData = [
    {
        date: "2025-11-26",
        dateText: "26 ноября",
        title: "Тайсон vs. Холифилд: Противостояние эпохи, изменившее бокс",
        description: "История величайшего соперничества в боксе: путь двух чемпионов, драма их дуэлей и главное противостояние, изменившее спорт навсегда.",
        category: "Анализ боёв",
        categoryClass: "gold",
        url: "tyson-holyfield-rivalry-epoch.html",
        isExternal: false
    },
    {
        date: "2025-11-26",
        dateText: "26 ноября",
        title: "Рияд как новая столица бокса: ночь чемпионов в ANB Arena",
        description: "22 ноября крупнейшее шоу «Night of Champions» в Эр-Рияде собрало сразу несколько чемпионских боёв, включая защиту титула Бенавидесом и историческую победу Хэйни в третьем дивизионе...",
        category: "Анализ боёв",
        categoryClass: "gold",
        url: "boxing-riyadh-night-of-champions.html",
        isExternal: false
    },
    {
        date: "2025-11-18",
        dateText: "18 ноября",
        title: "Первый бой Тайсона и Холифилда: названный «Наконец-то»",
        description: "В истории бокса есть матчи, которые становятся легендой не только из-за зрелищности, но и из-за эмоций, драмы и неожиданных поворотов и предыстории. Один из таких поединков — первый бой Майка Тайсона и Эвандера Холифилда.",
        category: "Мотивация",
        categoryClass: "gold",
        url: "https://dzen.ru/a/aB8nMPTGHU7JTgHs?share_to=link",
        isExternal: true
    },
    {
        date: "2025-11-15",
        dateText: "15 ноября",
        title: "«Неоконченное дело»: Леннокс Льюис против Холифилда 2 бой.",
        description: "13 ноября 1999 года в Лас-Вегасе случилось то, что должно было произойти ещё восемь месяцев назад. Леннокс Льюис и Эвандер Холифилд снова сошлись в ринге, но на этот раз судьи не стали мудрить.",
        category: "Методика",
        categoryClass: "silver",
        url: "https://dzen.ru/a/aB-QALK-e1zbWMBG?share_to=link",
        isExternal: true
    },
    {
        date: "2025-11-12",
        dateText: "12 ноября",
        title: "Туа vs Ибеабучи: 12 раундов ада, которые навсегда вошли в историю бокса.",
        description: "Июнь 1997 года, калифорнийский Casino Magic. Два непобежденных танка с кувалдами вместо рук — Дэвид Туа и Ике Ибеабучи — сошлись в бою, который не оставил прежними ни зрителей, ни самих бойцов.",
        category: "Анализ",
        categoryClass: "gold",
        url: "https://dzen.ru/a/aBxqbKDMFXODwUSE?share_to=link",
        isExternal: true
    }
];

/**
 * Получить 3 последние статьи для главной страницы
 */
function getLatestArticles(count = 3) {
    return articlesData.slice(0, count);
}

/**
 * Получить все статьи для каталога
 */
function getAllArticles() {
    return articlesData;
}

/**
 * Сгенерировать HTML карточки статьи
 */
function generateArticleCard(article) {
    const targetAttr = article.isExternal ? 'target="_blank"' : '';
    
    return `
        <article class="blog-card">
            <div class="blog-date">${article.dateText}</div>
            <h3>${article.title}</h3>
            <p>${article.description}</p>
            <div class="blog-meta">
                <span class="category ${article.categoryClass}">${article.category}</span>
                <a href="${article.url}" class="read-more" ${targetAttr}>Читать →</a>
            </div>
        </article>
    `;
}
