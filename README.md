# Notebook · PostgreSQL 18

Современный мини-блокнот на Next.js App Router, React, TypeScript, Tailwind CSS, Tiptap, Drizzle ORM и PostgreSQL 18.

В редакторе доступны жирный текст, курсив, зачёркивание, маркированные и нумерованные списки, undo/redo. Лимит заметки — 120 символов. При превышении лимита редактор подсвечивается и анимируется, счётчик показывает превышение, а кнопка сохранения блокируется. Проверка лимита дублируется в API и на уровне PostgreSQL.

## Локальный запуск

Создайте локальный файл окружения:

```bash
cp .env.example .env.local
```

Задайте собственный пароль в `.env.local` и используйте тот же пароль внутри `DATABASE_URL`. Затем запустите PostgreSQL 18:

```bash
docker compose --env-file .env.local up -d
```

Установите зависимости и запустите приложение:

```bash
npm install
npm run dev
```

Docker автоматически создаёт таблицу `notes` через `database/init.sql`. Для внешней PostgreSQL 18 базы можно применить Drizzle-схему командой:

```bash
npm run db:push
```

## Environment и GitHub

Реальные пароли и `DATABASE_URL` не должны попадать в git. В репозитории хранится только `.env.example`.

Для production добавьте `DATABASE_URL` в **GitHub → Settings → Secrets and variables → Actions** или в secrets выбранного GitHub Environment. Если платформа деплоя использует собственные environment variables, задайте тот же секрет там.

Основная переменная:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
```

Опционально можно задать `DB_POOL_MAX`.

## Модель данных

`notes.content` хранит Tiptap JSON в `jsonb`, `notes.plain_text` — текст заметки для проверки длины, `notes.created_at` — время создания. В PostgreSQL есть ограничения, запрещающие пустые заметки и текст длиннее 120 символов.
