# Инструкция по добавлению VK/OK тегов

## Для cosmetic.html, pharma.html, articles.html, cart.html

Добавьте эти строки ПОСЛЕ Open Graph тегов (после `<meta property="og:locale" ...>`):

```html
<!-- VK (ВКонтакте) -->
<meta property="vk:image" content="https://club-ring.ru/[IMAGE_URL]">

<!-- OK (Одноклассники) -->
<meta property="ok:image" content="https://club-ring.ru/[IMAGE_URL]">
```

## Для cosmetic.html:
```html
<!-- VK (ВКонтакте) -->
<meta property="vk:image" content="https://club-ring.ru/f.png">

<!-- OK (Одноклассники) -->
<meta property="ok:image" content="https://club-ring.ru/f.png">
```

## Для pharma.html:
```html
<!-- VK (ВКонтакте) -->
<meta property="vk:image" content="https://club-ring.ru/Whey Gold Protein.png">

<!-- OK (Одноклассники) -->
<meta property="ok:image" content="https://club-ring.ru/Whey Gold Protein.png">
```

## Для articles.html:
```html
<!-- VK (ВКонтакте) -->
<meta property="vk:image" content="https://club-ring.ru/rg.png">

<!-- OK (Одноклассники) -->
<meta property="ok:image" content="https://club-ring.ru/rg.png">
```

## Для cart.html:
```html
<!-- VK (ВКонтакте) -->
<meta property="vk:image" content="https://club-ring.ru/rg.png">

<!-- OK (Одноклассники) -->
<meta property="ok:image" content="https://club-ring.ru/rg.png">
```

## Для всех страниц товаров (eleotarakokka.html и другие):
```html
<!-- VK (ВКонтакте) -->
<meta property="vk:image" content="https://club-ring.ru/[PRODUCT_IMAGE_URL]">

<!-- OK (Одноклассники) -->
<meta property="ok:image" content="https://club-ring.ru/[PRODUCT_IMAGE_URL]">
```

Где [PRODUCT_IMAGE_URL] - указываете URL изображения товара (например, `eleotarakokka.png`)

---

## Полный пример для cosmetic.html:

Найдите в cosmetic.html строку:
```html
<meta property="og:locale" content="ru_RU">
```

Добавьте ПОСЛЕ неё:
```html
    
<!-- VK (ВКонтакте) -->
<meta property="vk:image" content="https://club-ring.ru/f.png">

<!-- OK (Одноклассники) -->
<meta property="ok:image" content="https://club-ring.ru/f.png">
```

---

## Проверка

После добавления тегов проверьте их через:

1. **ВКонтакте Debugger:**  
   https://vk.com/dev/pages.clearCache

2. **Facebook Sharing Debugger:**  
   https://developers.facebook.com/tools/debug/

3. **Просмотр HTML:**  
   Откройте страницу в браузере, нажмите F12, перейдите во вкладку "Elements" и найдите <head> - проверьте, что VK/OK теги присутствуют.

---

## Статус добавления тегов:

- [x] index.html ✅
- [x] shop.html ✅
- [x] equipment.html ✅
- [ ] cosmetic.html ⏳ (используйте эту инструкцию)
- [ ] pharma.html ⏳ (используйте эту инструкцию)
- [ ] articles.html ⏳ (используйте эту инструкцию)
- [ ] cart.html ⏳ (используйте эту инструкцию)
- [ ] eleotarakokka.html и другие товары ⏳ (используйте эту инструкцию)

---

**Примечание:** Этот файл содержит готовые теги для вставки. Просто скопируйте нужные строки и вставьте в <head> каждой страницы.