# BLOCKED — USER ACTION

## Google Search Console

Нужен доступ владельца. Экспортировать за последние 16 месяцев (и отдельно последние 3 месяца): Performance → Search results → Queries, Pages, Countries, Devices; Indexing → Pages; Experience → Core Web Vitals; Sitemaps. Для Queries и Pages включить clicks, impressions, CTR, average position. Только после этого принимать URL-level решения по 187 city/service страницам.

## Google Analytics 4

Нужен доступ к production GA4 property. Measurement ID теперь задаётся только через Production `NEXT_PUBLIC_GA_MEASUREMENT_ID`; Preview по умолчанию не загружает GA4. Проверить Web stream/domain, отсутствие второго тега, DebugView событий и key event `generate_lead`. Account UI и реальные события в этой локальной работе не проверялись.

## Cloudflare Turnstile

Нужны созданные владельцем widget keys. Код готов; Production без `TURNSTILE_SECRET_KEY` отклоняет отправку формы. Инструкции и test keys находятся в `DEPLOY-CHECKLIST-RU.md`.

## Upstash / distributed rate limit

Нужна бесплатная Redis database и две REST-переменные. До Preview-проверки не включать `RATE_LIMIT_MODE=enforce`. Локальная in-memory замена намеренно не используется, потому что она ненадёжна в serverless.

## Verified reviews

Нужны разрешённые для повторной публикации фактические данные: имя/инициалы, платформа, rating, дата (если известна), точная цитата и original URL. Пока сайт показывает только прямую ссылку на Thumbtack и не публикует placeholder, aggregate rating или review schema. Google Business Profile OAuth/API не подключались и Thumbtack не скрейпился.

## Visual/CWV production evidence

Нужен Vercel Preview URL для окончательного browser QA 1440/1024/375 и Lighthouse. Локальный build подтверждён, но реальные CDN/network metrics и account dashboards недоступны без Preview и аккаунтов.
