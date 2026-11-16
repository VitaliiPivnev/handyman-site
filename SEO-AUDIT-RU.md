# SEO-аудит шаблонных страниц

Дата локальной проверки: 2026-11-15. Данные Google Search Console не предоставлены, поэтому массовые удаления, redirects и `noindex` не применялись.

| Группа | Количество | Контент | Canonical | Sitemap | Robots | Реальные кейсы | Решение сейчас |
|---|---:|---|---|---|---|---|---|
| Главная | 1 | Уникальный коммерческий обзор | Self `/` | Да | Index/follow | 6 карточек + 3 фотосерии | Keep |
| Основные услуги | 11 | Уникальные intro, процесс, estimate tip, FAQ | Self `/services/{service}` | Да | Index/follow | Автоматически связанные реальные проекты | Keep / improve по GSC |
| Города | 17 | Уникальные названия и краткие описания, остальная структура шаблонная | Self `/handyman/{city}` | Да | Index/follow | Общая service grid, без неподтверждённых городов проектов | Keep; улучшать только при спросе |
| Город + услуга | 187 | Title/description/H1 локализованы, основной текст сильно шаблонный | Self `/handyman/{city}/{service}` | Нет | Index/follow | Не приписывает проекты конкретному городу | Не удалять; оценить по GSC до noindex/consolidation |
| Project detail | 23 | Уникальные реальные фотографии и описания | Self `/projects/{id}` | Да + image URLs | Index/follow | Сам кейс | Keep |
| Portfolio index | 1 | Категории и все 33 проекта | Self `/projects` | Да | Index/follow | Все реальные работы | Keep |

## Выводы

1. Основной duplicate-content риск — 187 city/service URL. Self-canonical технически корректен, пока каждая страница заявлена как самостоятельная локальная landing page; canonical на общую service page был бы противоречив при отличающемся city intent.
2. Исключение city/service из sitemap снижает сигнал приоритета, но не является `noindex`. Эти URL доступны внутренними ссылками с city pages и могут индексироваться.
3. Blanket `noindex` или массовые redirects без GSC могут удалить страницы с реальными impressions/leads. Сначала нужен экспорт Page + Query за 16 и 3 месяца.
4. На city/service страницах нет выдуманных локальных кейсов. Реальные проекты связаны с общими service pages без утверждения неподтверждённого города выполнения.
5. Review/AggregateRating schema отсутствует. FAQ schema используется только там, где ответы видимы на основной service page.

## URL-level процесс после GSC

- **Keep/improve:** URL имеет clicks, meaningful impressions или leads; добавить уникальные локальные вопросы только из подтверждённых данных.
- **Consolidate/redirect:** несколько URL конкурируют по одинаковым queries и один явно сильнее; выбрать наиболее релевантную страницу и сделать 301 после проверки backlinks/leads.
- **Noindex:** нулевой спрос/ценность, шаблонная страница не может быть качественно улучшена, но URL временно нужен пользователю.
- **Remove:** только для ошибочного/необслуживаемого города или услуги, с подходящим 301/410 и после проверки GSC/backlinks.

Нужные GSC exports перечислены в `ISSUES-BLOCKED-BY-ACCOUNT-ACCESS.md`.
