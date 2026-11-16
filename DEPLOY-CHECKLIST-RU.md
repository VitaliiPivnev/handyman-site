# Чек-лист Preview и Production

Изменения пока только локальные. Не выполнять merge/push/deploy в production без явного разрешения владельца.

## 0. Переменные Vercel

`VERCEL_ENV` создаётся Vercel автоматически и вручную не добавляется. Значения секретов нельзя хранить в Git, документации или `NEXT_PUBLIC_*` переменных.

| Имя | Production | Preview | Назначение | Где получить |
|---|---|---|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Реальный site key | Официальный always-pass test site key | Публичный ключ виджета Turnstile | Cloudflare Dashboard → Turnstile; test key — Cloudflare Testing docs |
| `TURNSTILE_SECRET_KEY` | Реальный secret key | Парный официальный test secret | Серверная Siteverify-проверка | Cloudflare Dashboard → Turnstile; test secret — Cloudflare Testing docs |
| `TURNSTILE_EXPECTED_HOSTNAME` | `handymantampa.net` | Не задавать для test key | Проверка hostname успешного challenge | Домен сайта |
| `UPSTASH_REDIS_REST_URL` | Production database | Отдельная Preview database | REST endpoint распределённого rate limit | Upstash Console → Redis database → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | Production token | Token отдельной Preview database | Авторизация Redis REST | Upstash Console → Redis database → REST API |
| `RATE_LIMIT_MODE` | `enforce` после проверки | Сначала не задавать, затем `enforce` | Fail-closed режим rate limit | Фиксированное значение из проекта |
| `LEAD_DELIVERY_MODE` | `telegram` | `test` | Production доставляет лид; Preview подтверждает тест без Telegram | Фиксированное значение из проекта |
| `TELEGRAM_BOT_TOKEN` | Production bot token | Не задавать в обычном Preview | Серверная отправка заявки | BotFather; значение только в Vercel secret storage |
| `TELEGRAM_CHAT_ID` | Production destination | Не задавать в обычном Preview | Получатель production-лида | ID приватного рабочего чата/канала |
| `ALLOW_PREVIEW_TELEGRAM_DELIVERY` | Не задавать | Не задавать; временно `true` только для отдельного test bot/chat | Дополнительный предохранитель Preview | Фиксированное значение из проекта |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Production GA4 Measurement ID | Не задавать | Загружает GA4 только в Production | GA4 → Admin → Data Streams → Web |
| `ENABLE_PREVIEW_ANALYTICS` | Не задавать | Не задавать; временно `true` только вместе с отдельной test GA4 property | Явное разрешение Preview analytics | Фиксированное значение из проекта |

Обычная Preview-конфигурация не содержит Telegram и GA4 production values. Даже если локально существуют Telegram credentials, `LEAD_DELIVERY_MODE=test` не вызывает Telegram, показывает test-specific success page и не создаёт `generate_lead`.

## 1. Cloudflare Turnstile

1. Создать widget для `handymantampa.net` в Cloudflare Turnstile.
2. В Vercel Preview использовать официальную always-pass test pair из Cloudflare Testing docs; не сохранять значения в Git.
3. Добавить в Preview: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`. `TURNSTILE_EXPECTED_HOSTNAME` не задавать для test key.
4. С `LEAD_DELIVERY_MODE=test` проверить успешную форму без Telegram, ошибочный/пустой токен и повторную отправку использованного токена.
5. В Production добавить реальные keys и `TURNSTILE_EXPECTED_HOSTNAME=handymantampa.net`. Секрет никогда не добавлять с префиксом `NEXT_PUBLIC_`.

## 2. Distributed rate limit (Upstash Redis REST)

1. Создать бесплатную Redis database в Upstash или выбрать другой совместимый распределённый store.
2. Добавить `UPSTASH_REDIS_REST_URL` и `UPSTASH_REDIS_REST_TOKEN` в Preview.
3. Сначала оставить `RATE_LIMIT_MODE` пустым и проверить доступность store.
4. Установить `RATE_LIMIT_MODE=enforce`, отправить 5 безопасных тестовых запросов, убедиться, что шестой возвращает HTTP 429, а через 10 минут снова разрешён.
5. Только после успешной Preview-проверки перенести три переменные в Production. При `enforce` недоступный store закрывает форму безопасно.

## 3. Telegram

- Обычный Preview использует `LEAD_DELIVERY_MODE=test` без Telegram credentials и никогда не отправляет тестовые заявки клиентам.
- Для отдельного интеграционного теста Telegram создать отдельного test bot и test chat, установить Preview `LEAD_DELIVERY_MODE=telegram` и временно `ALLOW_PREVIEW_TELEGRAM_DELIVERY=true`.
- Переменные: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — только server-side.
- Проверить одну доставку текста и 0–3 фото; success page должна появляться только после подтверждённой доставки текста.

## 4. GA4 и Search Console

- Production GA4 Measurement ID задаётся через `NEXT_PUBLIC_GA_MEASUREMENT_ID`; ID больше не встроен в код. В GA4 DebugView проверить: `form_started`, `generate_lead`, `click_to_call`, `click_to_text`, `external_reviews`.
- Убедиться, что события не содержат имени, телефона, email, ZIP/адреса, сообщения или имени файла.
- Пометить `generate_lead` как key event. Сравнить один тест с Network/DebugView и исключить дубль после refresh страницы thanks.
- В Search Console подтвердить Domain property через DNS либо URL-prefix property. Отправить `https://handymantampa.net/sitemap.xml` после production-релиза.

## 5. Preview QA

1. Создать Vercel Preview из текущей feature-ветки, не Production.
2. Проверить `/`, `/services/door-repair`, `/handyman/tampa`, `/handyman/tampa/door-repair`, `/projects`, один project detail, `/guides`, `/404-test`, форму и внешнюю ссылку Thumbtack.
3. Viewports: 1440 px, 1024 px, 375 px; keyboard focus, контраст, hero gap, sticky bar, изображения без layout shift.
4. Выполнить Lighthouse mobile/desktop и записать LCP/CLS/INP. Проверить sitemap/robots и Schema Markup Validator.
5. Команды перед Preview:

```bash
npm run lint
npx next build --webpack
npm audit --omit=dev
```

## 6. Production gate

- Реальные Turnstile и rate-limit переменные настроены и проверены в Preview.
- Источник отзывов подтверждён владельцем; никаких скопированных отзывов без разрешения.
- Владелец просмотрел diff и дал явное разрешение на production deploy.

## 7. Rollback

1. В Vercel открыть Project → Deployments → последний известный стабильный Production deployment.
2. Выбрать Promote to Production / Redeploy для стабильного deployment. Не удалять проблемный deployment до анализа.
3. Если проблема только во внешнем сервисе: временно убрать production `RATE_LIMIT_MODE=enforce` лишь при отказе Upstash или отключить форму через `LEAD_DELIVERY_MODE=test` нельзя — Production намеренно fail-closed. Вместо этого вернуть стабильный deployment и оставить телефон/SMS CTA.
4. В Git не делать `reset --hard`. Создать отдельный revert-коммит нужного release-коммита после подтверждения владельца.
