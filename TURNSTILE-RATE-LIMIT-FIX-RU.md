# Fix: Turnstile Siteverify и ложный HTTP 429

## Причина

В смерженном `main` rate limiter выполнялся до `verifyTurnstile()`. `withinRateLimit()` возвращал `false` не только при `count > 5`, но также при любом из этих условий при `RATE_LIMIT_MODE=enforce`:

- отсутствует `UPSTASH_REDIS_REST_URL` или token;
- отсутствует/невалиден client IP;
- Upstash вернул non-2xx;
- fetch/timeout/JSON parsing завершился ошибкой.

Caller интерпретировал любое `false` как реальное превышение и возвращал 429. Поэтому запрос мог завершиться до Siteverify, Cloudflare не видел серверной валидации, а Redis/configuration error маскировался как rate limit.

## Исправление

1. После валидации полей и файлов выполняется обязательный `verifyTurnstile()`; при ошибке возвращается 403.
2. Только после успешного Siteverify вызывается Upstash.
3. Rate limiter возвращает `allowed`, `limited` или `unavailable` с безопасным reason code.
4. Только подтверждённый `count > 5` возвращает 429.
5. Redis/config/IP/mode failures возвращают 503 и диагностический reason code без IP, token или PII.
6. `RATE_LIMIT_MODE` обязан быть ровно `enforce` в Production; неверное/отсутствующее значение — 503, не 429.
7. Client IP принимается из первого `x-forwarded-for`, затем `x-real-ip`, и проверяется через `node:net.isIP`.
8. Upstash `/multi-exec` атомарно выполняет `INCR`, `EXPIRE ... NX`, `TTL`. Проверяются HTTP status, shape, command errors, count, expire result и TTL `1..600`.

## Диагностические reason codes

- `rate_limit_mode_invalid`
- `rate_limit_not_enforced_in_production`
- `rate_limit_credentials_missing`
- `client_ip_missing_or_invalid`
- `redis_http_<status>`
- `redis_response_shape_invalid`
- `redis_command_error`
- `redis_count_invalid`
- `redis_ttl_invalid`
- `redis_request_failed`

Reason codes предназначены для Vercel Functions logs и не показываются посетителю.

## Проверка Preview после PR

1. Убедиться, что Preview variables содержат точное `RATE_LIMIT_MODE=enforce` и корректную пару Upstash URL/token.
2. Отправить валидную форму с Turnstile. В Cloudflare Turnstile Analytics должна появиться Siteverify activity даже если Redis затем недоступен.
3. При искусственно неверном Upstash token ожидать 503 и log reason `redis_http_401`, не 429.
4. При шести валидных последовательных запросах с одного IP ожидать 429 только на шестом; TTL должен оставаться положительным и не превышать 600 секунд.
5. Удалить/исправить тестовые environment overrides и redeploy Preview.
