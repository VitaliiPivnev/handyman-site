# Проверка формы перед публикацией

Все тесты сначала выполнять в Vercel Preview. Не использовать production Telegram chat, реальные данные клиента или рабочую GA4 property.

## Безопасный Preview по умолчанию

- Turnstile: официальная always-pass test pair.
- `LEAD_DELIVERY_MODE=test`.
- Telegram variables отсутствуют.
- Production GA4 variable отсутствует.
- После успешной формы URL содержит `test=1`, страница сообщает, что Telegram и conversion event не отправлялись.

## Матрица тестов

| Сценарий | Действие | Ожидаемый результат |
|---|---|---|
| Успешная тестовая заявка | Валидные имя, телефон, сообщение; 0–3 допустимых фото | 303 на `/thanks?...&test=1`; нет Telegram и `generate_lead` |
| Turnstile отсутствует | Отправить POST без `cf-turnstile-response` при включённом secret | HTTP 403, понятная ошибка, Telegram не вызывается |
| Неверный Turnstile | Использовать официальный always-fail test pair либо подменить token | HTTP 403; виджет сбрасывается для повторной попытки |
| Duplicate token | Использовать официальный test secret, который всегда возвращает `timeout-or-duplicate` | HTTP 403 и возможность получить новый token; реальный replay может быть eventually consistent |
| Большой request | Multipart body больше 4 MB либо photo после compression больше 1 MB | HTTP 413 для body или 400 для photo; Telegram не вызывается |
| Запрещённый MIME | `.txt`, PDF или executable под видом attachment | HTTP 400 |
| Поддельный MIME | Файл с `image/jpeg`, но без JPEG magic bytes | HTTP 400 |
| Слишком много фото | 4 файла | Client предупреждение; прямой POST HTTP 400 |
| Honeypot | Заполнить `company_website` | HTTP 403 |
| Rate limit | При `RATE_LIMIT_MODE=enforce` выполнить 6 валидных попыток с одного IP за 10 минут | Шестая HTTP 429; после окна снова разрешено |
| Double click | Быстро нажать Submit несколько раз | Client блокирует повтор; одна подтверждённая обработка |
| Ошибка Telegram | Только с отдельным test bot: временно неверный test token или недоступный test chat | HTTP 500/503, success page не открывается, PII не попадает в server logs |
| Фото Telegram не прошло | Test bot принимает текст, но отдельное фото отклонено | Лид-текст считается доставленным; ошибка фото диагностируется без PII |

## Отдельный Telegram integration test

1. Создать отдельного Telegram test bot и приватный test chat.
2. В Preview задать `LEAD_DELIVERY_MODE=telegram`, `ALLOW_PREVIEW_TELEGRAM_DELIVERY=true`, test bot token и test chat ID.
3. Отправить синтетическую заявку без реальных персональных данных; убедиться, что текст приходит один раз.
4. Повторить с JPG, PNG и WebP/HEIC document path.
5. Проверить ошибку неверного test token; success page не должна появиться.
6. Вернуть Preview к `LEAD_DELIVERY_MODE=test`, удалить четыре Telegram test variables и redeploy Preview.

Production smoke test допускается только после разрешения владельца: одна явно помеченная синтетическая заявка, затем проверка единственного Telegram-сообщения и единственного GA4 `generate_lead`.
