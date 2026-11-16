# Предпубликационный отчёт

## Готово локально

- Утверждённый дизайн перенесён без замены реальных фотографий.
- 33 проекта, 23 detail pages и 96 WebP сохранены; ссылки и metadata проверены.
- Lint, TypeScript, production build и production dependency audit проходят.
- Turnstile, MIME/signature validation, upload limits, honeypot и distributed rate-limit scaffold реализованы.
- Preview delivery по умолчанию безопасный: Telegram не вызывается, conversion не создаётся.
- GA4 больше не встроен жёстко и включается в Production через Vercel environment variable.
- Sitemap содержит качественные service/city/project/guides pages; 187 шаблонных комбинаций не добавлены, но массовый `noindex` не применён.

## Действия владельца

1. Создать реальные Turnstile keys и отдельную Preview test pair configuration.
2. Создать раздельные Upstash Preview и Production databases.
3. Внести Vercel variables по таблице `DEPLOY-CHECKLIST-RU.md`.
4. Проверить отдельный test Telegram bot/chat, затем вернуть Preview в test mode.
5. Предоставить GSC/GA4 exports либо самостоятельно выполнить checklist.
6. Просмотреть Vercel Preview на 1440/1024/375, Lighthouse и форму.

## Preview acceptance gate

- Hero соответствует утверждённому HTML; нет большой карточки и верхнего пустого пространства.
- Все основные маршруты 200, неизвестный URL 404, GET формы 405.
- Preview HTML не содержит production GA measurement ID.
- Успешная Preview форма показывает test-specific confirmation; production Telegram chat остаётся чистым.
- Turnstile invalid/replay, uploads, rate limit и dedicated test Telegram проходят матрицу `FORM-QA-RU.md`.
- Robots, sitemap, canonical и JSON-LD проверены через соответствующие validators.

## Откат

- До Production сохранить SHA текущего стабильного production deployment и SHA нового release-коммита.
- При проблеме сразу Promote/Redeploy предыдущий стабильный deployment в Vercel.
- Для кода использовать новый `git revert <release-sha>` после разрешения владельца; не переписывать историю и не использовать `reset --hard`.
