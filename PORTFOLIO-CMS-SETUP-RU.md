# Telegram Portfolio CMS — настройка и использование

## Что делает система

Приватный Telegram-бот создаёт черновик, хранит ссылки на загруженные фотографии в существующем Upstash Redis, принимает проверенный JSON из ChatGPT Plus и по кнопке **Publish**:

1. повторно скачивает фотографии из Telegram;
2. исправляет EXIF orientation, удаляет metadata/GPS и создаёт WebP до 2000 px без увеличения;
3. проверяет дубликаты;
4. одним атомарным Git commit добавляет WebP и запись в `app/data/cms-projects.json`;
5. Vercel выполняет обычный deployment из `main`;
6. GitHub Actions ждёт реальную страницу и только затем присылает подтверждённый URL.

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
8. Нажмите **📋 Copy Template**. В сообщении будут stable photo IDs.

## 8. Подготовка JSON в ChatGPT Plus

Передайте ChatGPT только подтверждённые факты и JSON template. Добавьте инструкцию:

> Return valid JSON only. Use natural American English. Do not invent location, work, dimensions, materials, prices, reviews, permits or licensing. Keep every supplied photo ID unchanged in imageAlt.

Не просите ChatGPT открывать Telegram, GitHub или Vercel. Скопируйте готовый JSON вручную.

## 9. Импорт, preview и публикация

1. Нажмите **📥 Import JSON**.
2. Вставьте JSON либо загрузите `.json` до 100 KB.
3. Исправьте перечисленные ботом ошибки и импортируйте повторно — фотографии не потеряются.
4. Проверьте title, summary, description, SEO title, meta description, URL, service, location, photo counts и alt text.
5. Только после проверки нажмите **✅ Publish**.
6. Первое сообщение подтверждает Git commit, но **не утверждает, что страница уже live**.
7. Отдельное сообщение `Published and verified` придёт после успешного Vercel deployment и HTTP-проверки страницы.

Если build или deployment не завершился, GitHub Actions будет красным, live URL не будет отправлен, а исходный Telegram draft сохранится при ошибке до commit. После успешного commit Git является источником опубликованной версии.

## 10. Черновики и безопасность

- **📝 Drafts** возобновляет текущий черновик.
- Повторный Telegram update игнорируется по `update_id`.
- Повторное нажатие Publish защищено статусом и Git fast-forward check.
- Черновик автоматически удаляется из Redis через 30 дней.
- Draft images не попадают в `public/` до Publish.
- Бот не пишет tokens, полные Telegram updates или пользовательские данные в logs.
- При компрометации token немедленно выполните `/revoke` в BotFather, замените Vercel/GitHub secrets и переустановите webhook.

## 10.1 Управление опубликованными CMS-проектами

- **📁 Published Projects** показывает проекты, созданные CMS, и отдельно reversible unpublished projects.
- **Unpublish** убирает проект из публичного JSON, портфолио и sitemap, но сохраняет запись и фотографии для Republish.
- **Republish** возвращает тот же slug и URL. Не используйте slug для другого проекта.
- **Permanently delete** требует отдельного подтверждения, удаляет CMS-запись и её изображения из текущего Git tree. История Git остаётся технически восстановимой администраторами repository.
- Для изменения текста или фотографий опубликованного проекта безопаснее сначала Unpublish, затем подготовить исправленную версию. Полное in-place редактирование индексируемого проекта намеренно не автоматизировано в первой версии, чтобы случайно не менять URL и внешние ссылки.

## 11. Troubleshooting

- **Forbidden webhook:** не совпадает `TELEGRAM_CMS_WEBHOOK_SECRET` или webhook установлен до нового deployment.
- **Draft storage unavailable:** проверьте существующие Upstash URL/token и free-tier usage.
- **GitHub publishing failed (401/403):** token истёк, нет Contents write или branch protection запрещает update.
- **GitHub API rate limit reached:** дождитесь сброса лимита; draft сохранён.
- **Duplicate URL:** измените slug, но не переиспользуйте URL другого проекта.
- **Duplicate photograph:** удалите повторное изображение из draft.
- **JSON error:** используйте template версии 1 и все photo IDs из сообщения бота.
- **Workflow failed:** откройте Actions → Confirm portfolio CMS publication. Проверьте Vercel build и оба Actions secrets.
- **Страница не появилась:** не публикуйте проект повторно с новым slug; сначала проверьте commit, Vercel deployment и workflow.

## Практические ограничения

- Telegram сохраняет `file_id`, но URL скачивания выдаётся заново и гарантирован минимум на один час; CMS вызывает `getFile` непосредственно перед publication.
- Репозиторий растёт с каждым WebP. Периодически контролируйте Git repository size.
- Один Redis draft поддерживается на одного owner ID, что предотвращает случайное параллельное редактирование с телефона.
- Автоматический commit в `main` является production publication. Включайте `GITHUB_CMS_BRANCH=main` только после проверки Preview и отдельного разрешения владельца.
- CMS управляет только проектами из `cms-projects.json`; существующие legacy-проекты намеренно остаются read-only, чтобы не рисковать их индексируемыми URL и фотографиями.
