# Telegram Portfolio CMS — настройка и использование

## Что делает система

Приватный Telegram-бот создаёт черновик, хранит ссылки на загруженные фотографии в существующем Upstash Redis, принимает проверенный JSON из ChatGPT Plus и по кнопке **Publish**:

1. повторно скачивает фотографии из Telegram;
2. исправляет EXIF orientation, удаляет metadata/GPS и создаёт WebP до 2000 px без увеличения;
3. проверяет дубликаты;
4. одним атомарным Git commit добавляет WebP и запись в `app/data/cms-projects.json`;
5. Vercel выполняет обычный deployment из `main`;
6. GitHub Actions сверяет exact slug, title, meta description, canonical и sitemap с данными конкретного Git commit и только затем присылает подтверждённый URL. Для Unpublish/Delete проверяются HTTP 404 и отсутствие URL в sitemap.

Существующие проекты остаются в `app/data/projects.ts`. CMS их не перезаписывает.

## Важное ограничение бесплатных планов

- Telegram Bot API бесплатен. Стандартный Bot API позволяет боту скачать файл размером до 20 MB; CMS дополнительно ограничивает входное фото до 12 MB.
- GitHub Actions на стандартных runners бесплатен для public repository. Для private repository действует месячная квота текущего GitHub-плана.
- Upstash Free на момент подготовки инструкции включает 256 MB, 10 GB bandwidth и 500 000 commands/month. Черновики имеют TTL 30 дней. Не включайте автоматический переход на платный план.
- **Vercel Hobby разрешён только для personal, non-commercial use.** Сайт handyman-бизнеса является commercial use. Перед включением CMS убедитесь, что существующий Vercel account уже находится на подходящем плане либо получите письменное подтверждение Vercel. Код не включает billing и не меняет план.

CMS не использует OpenAI API, Gemini, Vercel Blob, Zapier, Make или платную базу.

## 1. Создание отдельного бота

1. Откройте в Telegram официальный `@BotFather`.
2. Отправьте `/newbot`.
3. Задайте имя, например `Vitalii Handyman Portfolio CMS`.
4. Задайте username, заканчивающийся на `bot`.
5. Скопируйте token один раз. Не отправляйте его в чаты и не добавляйте в Git.
6. Через `/setcommands` можно добавить:

   ```text
   start - Open Portfolio CMS
   menu - Main Menu
   ```

Не используйте существующего бота заявок клиентов.

## 2. Numeric Telegram user ID

Получите собственный числовой ID через проверенного ID-бота либо временно вызовите `getUpdates` у нового бота после сообщения `/start`. Нужен именно `from.id`, не username. CMS сравнивает только numeric ID.

## 3. GitHub credential

Создайте fine-grained personal access token:

- Repository access: только `VitaliiPivnev/handyman-site`.
- Repository permission `Contents`: **Read and write**.
- Остальные permissions: `No access`, если GitHub не требует metadata read.
- Установите разумный срок действия и календарное напоминание о ротации.

Токен создаёт commits непосредственно в ветке, заданной `GITHUB_CMS_BRANCH`. Для реальной автоматической публикации это `main`. Branch protection должна разрешать этому token обновлять ветку. Если требуется Pull Request, автоматическая публикация без ручного GitHub шага невозможна — используйте отдельную publish-ветку и вручную merge.

## 4. Environment Variables в Vercel

Добавьте в **Project → Settings → Environment Variables → Production**:

| Переменная | Значение/назначение |
|---|---|
| `TELEGRAM_CMS_BOT_TOKEN` | token нового CMS-бота от BotFather |
| `TELEGRAM_CMS_OWNER_ID` | ваш numeric Telegram user ID |
| `TELEGRAM_CMS_WEBHOOK_SECRET` | случайная строка 32–64 символа, только буквы/цифры/`_`/`-` |
| `GITHUB_CMS_TOKEN` | fine-grained token с Contents read/write |
| `GITHUB_CMS_REPOSITORY` | `VitaliiPivnev/handyman-site` |
| `GITHUB_CMS_BRANCH` | `main` после разрешения production-публикации |

Уже существующие `UPSTASH_REDIS_REST_URL` и `UPSTASH_REDIS_REST_TOKEN` используются повторно. Не удаляйте и не переименовывайте переменные формы заявок.

Для Preview используйте отдельного тестового бота, отдельный owner ID и `GITHUB_CMS_BRANCH` с тестовой веткой. Никогда не давайте Preview token для записи в `main`.

После Preview deployment откройте `https://<preview-domain>/api/portfolio-cms`. Ответ `{"service":"portfolio-cms","configured":true}` подтверждает наличие обязательных для webhook переменных бота, owner, webhook secret и Upstash. Значения и названия отсутствующих секретов endpoint не раскрывает. `configured:false` означает, что минимум одна обязательная Preview-переменная отсутствует; проверьте Environment scope и выполните Redeploy.

## 5. GitHub Actions secrets

В **Repository → Settings → Secrets and variables → Actions** создайте:

- `TELEGRAM_CMS_BOT_TOKEN`
- `TELEGRAM_CMS_OWNER_ID`

Они нужны только workflow, который подтверждает появление live URL. GitHub token туда добавлять не нужно: workflow имеет только `contents: read`.

## 6. Webhook

После разрешённого production deployment установите webhook:

```bash
export CMS_BOT_TOKEN='вставьте token локально'
export CMS_WEBHOOK_SECRET='та же секретная строка из Vercel'
curl -fsS -X POST "https://api.telegram.org/bot${CMS_BOT_TOKEN}/setWebhook" \
  --data-urlencode "url=https://handymantampa.net/api/portfolio-cms" \
  --data-urlencode "secret_token=${CMS_WEBHOOK_SECRET}" \
  --data-urlencode 'allowed_updates=["message","callback_query"]' \
  --data-urlencode "drop_pending_updates=true"
unset CMS_BOT_TOKEN CMS_WEBHOOK_SECRET
```

Проверьте через `getWebhookInfo`, что URL указан правильно и `last_error_message` отсутствует. Endpoint отклоняет запросы без заголовка `X-Telegram-Bot-Api-Secret-Token`.

## 7. Первый проект

1. Откройте нового бота и нажмите **Start**.
2. Нажмите **➕ New Project**.
3. Выберите **BEFORE**, **DURING** или **AFTER** до отправки фотографий.
4. Отправьте одну фотографию или Telegram album. Необязательно иметь все три категории.
5. В **🖼 Manage Photos** можно удалить фото, передвинуть выше или последовательно сменить BEFORE → DURING → AFTER.
6. При необходимости добавьте короткое описание без автоматического перевода.
7. В **📍 Location** укажите только подтверждённый город либо нажмите **Skip**.
8. В **🧰 Service & Category** выберите подходящую услугу. Бот автоматически назначит связанную с ней категорию портфолио.
9. Нажмите **📋 Copy Template**. В сообщении будут stable photo IDs и выбранный `serviceSlug`; придумывать `category` для JSON не нужно.

### Канонические категории CMS

| Service slug | Категория портфолио |
|---|---|
| `door-repair` | Door Installation & Repair |
| `drywall-repair` | Drywall & Ceiling Repair |
| `interior-painting` | Interior Painting & Finishing |
| `flooring-installation` | Flooring Installation & Repair |
| `tv-mounting` | TV Mounting & Media Installation |
| `furniture-assembly` | Furniture Assembly |
| `plumbing-repairs` | Plumbing Fixture Replacement |
| `fence-repair` | Fence & Gate Repair |
| `deck-repair` | Deck Repair & Maintenance |
| `exterior-painting` | Exterior Painting & Trim |
| `general-handyman-services` | General Handyman Services |

Mapping хранится централизованно и применяется только к Telegram CMS-проектам. Исторические категории legacy-портфолио не изменяются.

## 8. Подготовка JSON в ChatGPT Plus

Передайте ChatGPT только подтверждённые факты и JSON template. Добавьте инструкцию:

> Return valid JSON only. Use natural American English. Do not invent location, work, dimensions, materials, prices, reviews, permits or licensing. Keep every supplied photo ID unchanged in imageAlt.

Не просите ChatGPT открывать Telegram, GitHub или Vercel. Скопируйте готовый JSON вручную.

## 9. Импорт, preview и публикация

1. Нажмите **📥 Import JSON**.
2. Вставьте JSON либо загрузите `.json` до 100 KB.
3. Исправьте перечисленные ботом ошибки и импортируйте повторно — фотографии не потеряются.
4. Проверьте title, summary, description, SEO title, meta description, URL, service, category, location, photo counts и alt text. Если старый JSON содержит другую `category` либо не содержит её, Preview явно покажет автоматическую коррекцию.
5. Только после проверки нажмите **✅ Publish**.
6. Первое сообщение подтверждает Git commit, но **не утверждает, что страница уже live**.
7. Отдельное сообщение `Published and verified` придёт после успешного Vercel deployment и HTTP-проверки страницы.

Если build или deployment не завершился, GitHub Actions будет красным, live URL не будет отправлен, а исходный Telegram draft сохранится при ошибке до commit. После успешного commit Git является источником опубликованной версии.

## 10. Черновики и безопасность

- **📝 Drafts** возобновляет текущий черновик.
- Telegram update помечается завершённым только после успешной обработки. При временной ошибке claim освобождается, endpoint отвечает ошибкой, и Telegram может безопасно повторить update. Завершённый `update_id` хранится 7 дней и повторно не выполняется.
- Все изменения одного owner ID сериализуются коротким Redis lock. Поэтому параллельно доставленные фотографии Telegram album не перезаписывают draft и не теряются; занятой update возвращается Telegram для повторной доставки.
- Повторное нажатие Publish защищено статусом и Git fast-forward check.
- Черновик автоматически удаляется из Redis через 30 дней.
- Draft images не попадают в `public/` до Publish.
- Бот не пишет tokens, полные Telegram updates или пользовательские данные в logs.
- При компрометации token немедленно выполните `/revoke` в BotFather, замените Vercel/GitHub secrets и переустановите webhook.

## 10.1 Управление опубликованными CMS-проектами

- **📁 Published Projects** показывает проекты, созданные CMS, и отдельно reversible unpublished projects.
- **Full in-place edit** создаёт защищённый draft из существующего CMS-проекта. Можно изменить текст, SEO title/description, service/category, подтверждённую location, удалить/добавить/переставить фотографии и изменить BEFORE/DURING/AFTER. Импортируйте JSON заново после изменения набора фотографий. Исходный slug и URL сохраняются независимо от `slug` в импортированном JSON.
- При смене service через Telegram category обновляется автоматически. Текст, SEO metadata, фотографии, location и исходный URL при этом не перезаписываются.
- **Unpublish** после отдельного подтверждения убирает проект из публичного JSON, портфолио и sitemap, но сохраняет запись и фотографии для Republish.
- **Republish** также требует подтверждения и возвращает тот же slug и URL. Не используйте slug для другого проекта.
- **Permanently delete** требует отдельного подтверждения, удаляет CMS-запись и её изображения из текущего Git tree. История Git остаётся технически восстановимой администраторами repository.

После Publish/Edit/Unpublish/Republish/Delete workflow проверяет именно ожидаемое состояние конкретного slug. Сообщение об успехе не отправляется только по наличию произвольного `<h1>`.

## 11. Troubleshooting

- **Forbidden webhook:** не совпадает `TELEGRAM_CMS_WEBHOOK_SECRET` или webhook установлен до нового deployment.
- **Draft storage unavailable:** проверьте существующие Upstash URL/token и free-tier usage.
- **GitHub publishing failed (401/403):** token истёк, нет Contents write или branch protection запрещает update.
- **GitHub API rate limit reached:** дождитесь сброса лимита; draft сохранён.
- **Duplicate URL:** измените slug, но не переиспользуйте URL другого проекта.
- **Duplicate photograph:** удалите повторное изображение из draft.
- **JSON error:** используйте template версии 1 и все photo IDs из сообщения бота.
- **Workflow failed:** откройте Actions → Confirm portfolio CMS publication. Проверьте Vercel build и оба Actions secrets.
- **CMS owner workflow is busy:** Telegram доставил части album одновременно. Бот намеренно попросил Telegram повторить занятой update; дождитесь повторной доставки, не загружайте album заново вручную.
- **Страница не появилась:** не публикуйте проект повторно с новым slug; сначала проверьте commit, Vercel deployment и workflow.

### Безопасная диагностика Preview webhook

Runtime log `Portfolio CMS update failed` содержит только безопасные поля `code`, `service`, `operation`, `retryable`, необязательный HTTP status зависимости и класс ошибки. Tokens, Redis URL, Telegram IDs, текст сообщения и содержимое проекта не логируются.

- `redis_not_configured`: Upstash URL или token не назначен окружению Preview.
- `redis_http_error` + `dependencyStatus: 401/403`: неверная пара Upstash URL/token или credential от другой database.
- `redis_http_error` + `429/5xx`: временный лимит или сбой Upstash; webhook отвечает 503 для повторной доставки Telegram.
- `redis_command_error`: Upstash принял HTTP-запрос, но отклонил Redis command.
- `telegram_not_configured`: Preview bot token отсутствует.
- `telegram_api_error` + `401/404`: неверный либо отозванный token тестового бота.
- `owner_lock_busy` или `update_already_processing`: параллельная доставка; это retryable-состояние, повторная отправка пользователем не нужна.

Для проверки отправьте `/start` именно Preview-боту, затем убедитесь, что webhook получил HTTP 200 и бот показал `Private Portfolio CMS`. Не используйте production bot/token для Preview.

## Практические ограничения

- Telegram сохраняет `file_id`, но URL скачивания выдаётся заново и гарантирован минимум на один час; CMS вызывает `getFile` непосредственно перед publication.
- Репозиторий растёт с каждым WebP. Периодически контролируйте Git repository size.
- Один Redis draft поддерживается на одного owner ID, что предотвращает случайное параллельное редактирование с телефона.
- Redis lock действует 90 секунд. Обычный Vercel handler ограничен меньшим временем; если процесс аварийно завершился, lock автоматически истечёт и update сможет повториться.
- Автоматический commit в `main` является production publication. Включайте `GITHUB_CMS_BRANCH=main` только после проверки Preview и отдельного разрешения владельца.
- CMS управляет только проектами из `cms-projects.json`; существующие legacy-проекты намеренно остаются read-only, чтобы не рисковать их индексируемыми URL и фотографиями.
