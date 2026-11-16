# Siteverify 403: диагностика и исправление

## Что было невозможно определить

Старая `verifyTurnstile()` возвращала только `false`. Один HTTP 403 мог означать отсутствующую переменную, HTTP failure Cloudflare, invalid JSON, `invalid-input-secret`, `invalid-input-response`, `timeout-or-duplicate` или hostname mismatch. Поэтому точную Production-причину по старым logs восстановить нельзя.

## Исправления

- Siteverify возвращает структурированный результат `verified`, `rejected` или `unavailable`.
- Vercel Logs получают только: `category`, HTTP status, Cloudflare `error-codes`, `success`, `hostname`, `hostnameMatched`.
- Token, secret, IP и поля клиента не логируются.
- Configuration/network/HTTP failures дают 503; реальное отклонение token/hostname даёт 403.
- Production требует site key, secret и `TURNSTILE_EXPECTED_HOSTNAME`.
- `TURNSTILE_EXPECTED_HOSTNAME` поддерживает явный comma-separated allowlist, например apex и `www`, если оба реально обслуживаются.
- Client использует explicit widget без автоматического hidden response field.
- Текущий token читается и добавляется в `FormData` только после сжатия фотографий.
- Expired/error callbacks очищают token; `refresh-expired=auto` запрашивает новый.
- После ошибки widget сбрасывается, поэтому использованный token не отправляется повторно.

## Как читать безопасный Vercel log

| Category / error code | Значение | Действие |
|---|---|---|
| `configuration_missing` | Нет site key, secret или Production hostname | Проверить scope переменных и redeploy |
| `siteverify_http_error` | Cloudflare вернул non-2xx | Проверить status и доступность Cloudflare |
| `siteverify_request_failed` | Timeout/network failure | Повторить и проверить Vercel networking |
| `invalid-input-secret` | Secret недействителен | Скопировать secret того же widget, что и site key |
| `invalid-input-response` | Token недействителен; возможна несовместимая key pair | Сверить pair и client token lifecycle |
| `timeout-or-duplicate` | Token истёк или уже использован | Проверить explicit refresh/reset и отсутствие двойного POST |
| `hostname_mismatch` | Cloudflare hostname не входит в allowlist | Исправить Production hostname variable, не отключая проверку |
| `verified` | Siteverify успешен | Продолжить проверку Upstash/Telegram |

## Безопасная сверка key pair

1. Cloudflare Dashboard → Turnstile → widget `Handyman Tampa Production`.
2. Скопировать site key в Vercel Production `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
3. Reveal/copy secret того же widget в `TURNSTILE_SECRET_KEY`; не выводить его в logs или PR.
4. Убедиться, что обе переменные имеют scope Production, не Preview-only.
5. Проверить hostname management widget и `TURNSTILE_EXPECTED_HOSTNAME`.
6. После любого изменения variables выполнить новый Production deployment только после разрешения владельца: старый deployment не получает новые build-time public variables.

## Acceptance test в Preview

Использовать официальную Cloudflare test pair. Успешная форма должна показать log category `verified`. Always-fail и duplicate test secrets должны дать `siteverify_rejected` с соответствующими error codes без token/secret/IP в log.
