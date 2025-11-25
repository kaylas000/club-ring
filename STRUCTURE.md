# 🏛️ Структура сайта RING BOXING CLUB

> **ВАЖНО!** Этот файл описывает критические элементы сайта.  
> **НЕ изменяйте ID, классы и структуру без проверки соответствующего JS!**

---

## 📁 Структура файлов

```
club-ring/
├── index.html          # Главная страница
├── shop.html           # Общий каталог магазина
├── equipment.html      # Категория: Экипировка
├── cosmetic.html       # Категория: Косметика
├── pharma.html         # Категория: Аптека/Спортпит
├── cart.html           # Корзина покупок
├── order.html          # Оформление заказа
├── articles.html       # Статьи блога
├── css/
│   ├── style.css       # Основные стили
│   ├── catalog.css     # Стили каталога
│   └── cart.css        # Стили корзины
└── js/
    ├── main.js         # Основная логика (меню, корзина)
    └── cart.js         # Логика страницы корзины
```

---

## 🎯 КРИТИЧЕСКИЕ ID ЭЛЕМЕНТОВ

### 🛒 cart.html (Корзина)

**НЕ МЕНЯТЬ!** Эти ID используются в `js/cart.js`:

```html
<!-- Список товаров в корзине -->
<div id="cartItemsList"></div>

<!-- Счётчик товаров -->
<span id="cartCountBadge">0 товаров</span>

<!-- Сумма товаров -->
<span id="subtotalAmount">0₽</span>

<!-- Стоимость доставки -->
<span id="deliveryAmount">0₽</span>

<!-- Итоговая сумма -->
<span id="totalAmount">0₽</span>

<!-- Кнопка оформления -->
<button id="checkoutBtn">...</button>
<span id="checkoutTotal">0₽</span>
```

### 🔍 Фильтры (все страницы магазина)

```html
<!-- Мобильный поиск -->
<input id="mobileSearchInput" />

<!-- Десктопный поиск -->
<input id="desktopSearchInput" />

<!-- Контейнер мобильных фильтров -->
<div id="mobileFiltersContainer"></div>
```

### 🏭 Навигация (все страницы)

```html
<!-- Счётчик товаров в шапке -->
<span class="cart-count">0</span>
```

---

## 🧩 СТАНДАРТНАЯ СТРУКТУРА НАВИГАЦИИ

**ОБЯЗАТЕЛЬНА на ВСЕХ страницах!**

```html
<header role="banner">
    <div class="nav">
        <a href="index.html" class="logo">
            <span>RING</span> BOXING CLUB
        </a>
        <div class="hamburger" aria-label="Меню" role="button" aria-expanded="false">
            <div></div><div></div><div></div>
        </div>
        <nav class="menu" role="navigation" aria-label="Основное меню">
            <a href="index.html">Главная</a>
            <a href="index.html#about">О клубе</a>
            
            <!-- Подменю Магазин -->
            <div class="menu-item-has-children">
                <a href="shop.html">Магазин</a>
                <div class="sub-menu">
                    <a href="equipment.html">🥊 Экипировка</a>
                    <a href="cosmetic.html">🧼 Косметика</a>
                    <a href="pharma.html">💊 Аптека</a>
                </div>
            </div>
            
            <!-- Подменю Блог -->
            <div class="menu-item-has-children">
                <a href="#blog">Блог</a>
                <div class="sub-menu">
                    <a href="articles.html">📝 Статьи</a>
                    <a href="https://rutube.ru/channel/23770571/" target="_blank">📹 Rutube</a>
                </div>
            </div>
            
            <a href="index.html#contacts">Контакты</a>
        </nav>
        
        <!-- Корзина -->
        <a href="cart.html" class="cart-btn" aria-label="Корзина">
            <svg>...</svg>
            <span class="cart-count">0</span>
        </a>
    </div>
</header>
```

---

## 📦 СТРУКТУРА СТРАНИЦ КАТЕГОРИЙ

**ОБЯЗАТЕЛЬНЫЕ блоки для shop.html, equipment.html, cosmetic.html, pharma.html:**

### 1. Hero секция
```html
<section class="hero">
    <div class="hero-content">
        <div class="hero-badge">🛍️ Название</div>
        <h1>Заголовок</h1>
        <p>Описание</p>
    </div>
</section>
```

### 2. Мобильные фильтры
```html
<div class="mobile-filters">
    <div class="mobile-filter-header" id="mobileFilterToggle">...</div>
    <div class="mobile-filters-container" id="mobileFiltersContainer">
        <!-- Поиск + категории + статусы -->
    </div>
</div>
```

### 3. Категории (десктоп)
```html
<section class="categories-section">
    <div class="categories-container">
        <div class="categories-nav">
            <button class="category-btn active" data-category="all">
                <span>📦</span> Все товары
            </button>
            <!-- ... другие категории -->
        </div>
    </div>
</section>
```

### 4. Фильтры (десктоп)
```html
<section class="filters-section">
    <div class="filters-container">
        <div class="filter-group">
            <button class="filter-btn active" data-filter="all">Все</button>
            <button class="filter-btn" data-filter="new">Новинки</button>
            <button class="filter-btn" data-filter="sale">Акции</button>
            <button class="filter-btn" data-filter="bestseller">Хиты</button>
        </div>
        <div class="sorting">
            <select aria-label="Сортировка">...</select>
        </div>
        <div class="search-box">
            <input type="text" id="desktopSearchInput" />
            <button class="search-btn">🔍</button>
        </div>
    </div>
</section>
```

### 5. Товары
```html
<section class="products-section">
    <div class="products-header">
        <h2>Каталог</h2>
        <p>Описание</p>
    </div>
    <div class="products-grid">
        <!-- Карточки товаров -->
    </div>
</section>
```

### 6. Информация
```html
<section class="about-section">
    <div class="section-header">
        <h2>Почему выбирают наш магазин</h2>
        <p>Преимущества</p>
    </div>
    <div class="info-grid">
        <!-- 3 карточки с преимуществами -->
    </div>
</section>
```

---

## 📝 СТРУКТУРА КАРТОЧКИ ТОВАРА

```html
<div class="product-card [equipment|cosmetic|pharma]" 
     data-category="[equipment|cosmetic|pharma]" 
     data-status="[bestseller|new|sale]">
    
    <!-- Бейдж -->
    <div class="product-badge [bestseller|new|sale]">ХИТ</div>
    
    <!-- Изображение -->
    <div class="product-image">
        <img src="image.png" alt="Название" loading="lazy">
    </div>
    
    <!-- Категория -->
    <div class="product-category">
        <span>🥊</span> Экипировка
    </div>
    
    <!-- Название -->
    <h3 class="product-title">Название товара</h3>
    
    <!-- Описание -->
    <p class="product-description">Описание</p>
    
    <!-- Цена и кнопка -->
    <div class="product-price">
        <div>
            <span class="price">8,500₽</span>
            <span class="old-price">10,000₽</span> <!-- опционально -->
        </div>
        <button class="add-to-cart" 
                data-product="Название" 
                data-price="8500" 
                data-category="equipment">
            <span>🛒</span> В корзину
        </button>
    </div>
</div>
```

---

## ⚠️ ВАЖНЫЕ ПРАВИЛА

### ❌ НЕЛЬЗЯ:

1. **Изменять ID элементов** без обновления соответствующего JS
2. **Удалять обязательные блоки** (фильтры, навигация)
3. **Менять структуру навигации** без проверки на всех страницах
4. **Изменять `data-` атрибуты** карточек товаров

### ✅ МОЖНО:

1. **Добавлять новые товары** по шаблону карточки
2. **Менять тексты, цены, картинки** в товарах
3. **Добавлять CSS стили** без изменения классов
4. **Добавлять новые страницы** с сохранением стандартной навигации

---

## 🔗 СВЯЗИ HTML ↔ CSS ↔ JS

### cart.html → cart.js
```
cart.html:          cart.js:
#cartItemsList  →   document.getElementById('cartItemsList')
#cartCountBadge →   document.getElementById('cartCountBadge')
#subtotalAmount →   document.getElementById('subtotalAmount')
#deliveryAmount →   document.getElementById('deliveryAmount')
#totalAmount    →   document.getElementById('totalAmount')
#checkoutBtn    →   document.getElementById('checkoutBtn')
```

### Все страницы → main.js
```
HTML:                    main.js:
.cart-count          →   updateCartCount()
.add-to-cart         →   addToCart event listener
.hamburger           →   mobile menu toggle
```

---

## 🛡️ ЗАЩИТА ОТ ПОЛОМОК

Перед ЛЮБЫМИ изменениями:

1. ✅ **Создайте резервную ветку** в Git
2. ✅ **Проверьте CHECKLIST.md**
3. ✅ **Протестируйте на всех страницах**

---

**Последнее обновление:** 26.11.2025  
**Резервная копия:** `backup-working-version-2025-11-26`
