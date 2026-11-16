# Подключение Cloudflare Turnstile и Upstash Redis

## Cloudflare Turnstile

1. В Cloudflare Dashboard открыть Turnstile → Add widget.
2. Назвать widget, например `handymantampa-production`, выбрать Managed mode.
3. В Hostname Management разрешить только `handymantampa.net` и при необходимости `www.handymantampa.net`. Не добавлять localhost к production widget.
4. Site key сохранить в Vercel Production как `NEXT_PUBLIC_TURNSTILE_SITE_KEY`; secret — как sensitive `TURNSTILE_SECRET_KEY`.
5. Добавить Production `TURNSTILE_EXPECTED_HOSTNAME=handymantampa.net`.
6. Для Preview использовать официальную always-pass test pair из [Cloudflare Testing](https://developers.cloudflare.com/turnstile/troubleshooting/testing/). Значения не копировать в репозиторий.
7. Для invalid-token теста временно использовать официальную always-fail pair; для deterministic duplicate теста — специальный test secret `token already spent`, затем вернуть always-pass pair.
8. После каждой смены Vercel variables сделать новый deployment: существующие deployment не получают обновлённые значения автоматически.

Сервер вызывает [Siteverify](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) для каждой валидной по полям заявки. Production без secret fail-closed. Tokens действуют пять минут и предназначены для однократного использования; client сбрасывает widget после ошибки.

## Upstash Redis

1. В Upstash Console создать две Redis databases: `handymantampa-preview-ratelimit` и `handymantampa-production-ratelimit`. Не использовать одну database для обоих окружений.
2. В каждой database открыть Connect → REST API.
3. Endpoint сохранить как соответствующий `UPSTASH_REDIS_REST_URL`; standard REST token — как sensitive `UPSTASH_REDIS_REST_TOKEN`. Token не должен иметь `NEXT_PUBLIC_` и не должен попадать в client code/logs.
4. Preview сначала запустить без `RATE_LIMIT_MODE`. Проверить доступность REST endpoint и обычную успешную test-form.
5. Установить Preview `RATE_LIMIT_MODE=enforce`, redeploy и выполнить rate-limit сценарий: первые пять попыток в десятиминутном окне разрешены, шестая получает 429.
6. После успешного Preview QA добавить Production URL/token и `RATE_LIMIT_MODE=enforce`.
7. Настроить budget/usage alerts в Upstash. При смене/утечке token выполнить rotation/reset и обновить Vercel variables с новым deployment.

Код отправляет `INCR` и `EXPIRE ... NX` через атомарный REST [`/multi-exec`](https://upstash.com/docs/redis/features/restapi) transaction. В Redis хранится только усечённый SHA-256 от IP, без raw IP; ключ автоматически истекает через десять минут. В режиме `enforce` отсутствие credentials или отказ store закрывает заявку безопасно.

## Проверка разделения окружений

| Проверка | Preview | Production |
|---|---|---|
| Turnstile | Cloudflare test pair | Реальный restricted widget |
| Redis | Отдельная Preview database | Отдельная Production database |
| Lead delivery | `test`, без Telegram | `telegram` |
| GA4 | Не загружается | Production Measurement ID |
| Hostname assertion | Не задаётся для test pair | `handymantampa.net` |

Vercel позволяет назначать variables отдельно для Preview и Production; изменения применяются только к новым deployments: [Vercel Environment Variables](https://vercel.com/docs/environment-variables).
