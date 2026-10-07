import { Database, NotebookPen } from "lucide-react";
import { Notebook } from "@/components/notebook";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur">
              <NotebookPen className="size-3.5" />
              Личный блокнот
            </div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Мысли, которые стоит сохранить.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Форматируйте текст, следите за лимитом и сохраняйте короткие записи в базе данных.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3.5 py-2 text-sm text-emerald-200">
            <Database className="size-4" />
            PostgreSQL 18
          </div>
        </header>

        <Notebook />
      </div>
    </main>
  );
}
