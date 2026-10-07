"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { JSONContent } from "@tiptap/core";
import { CircleAlert, LoaderCircle, Save, Sparkles } from "lucide-react";
import { NotePreview } from "@/components/note-preview";
import { RichEditor, type EditorValue } from "@/components/rich-editor";

const MAX_NOTE_LENGTH = 120;

type Note = {
  id: string;
  content: JSONContent;
  plainText: string;
  createdAt: string;
};

const emptyDraft: EditorValue = {
  text: "",
  content: { type: "doc", content: [{ type: "paragraph" }] },
};

function characterCount(value: string) {
  return Array.from(value).length;
}

export function Notebook() {
  const [draft, setDraft] = useState<EditorValue>(emptyDraft);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const count = useMemo(() => characterCount(draft.text), [draft.text]);
  const remaining = MAX_NOTE_LENGTH - count;
  const overLimit = remaining < 0;
  const empty = draft.text.trim().length === 0;
  const nearLimit = !overLimit && remaining <= 15;
  const progress = Math.min((count / MAX_NOTE_LENGTH) * 100, 100);

  const loadNotes = useCallback(async () => {
    try {
      const response = await fetch("/api/notes", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось загрузить заметки.");
      }

      setNotes(data.notes);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Не удалось загрузить заметки.",
      );
    } finally {
      setLoadingNotes(false);
    }
  }, []);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  async function saveNote() {
    if (saving || overLimit || empty) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: draft.text,
          content: draft.content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось сохранить заметку.");
      }

      setNotes((current) => [data.note, ...current].slice(0, 50));
      setDraft(emptyDraft);
      setResetKey((value) => value + 1);
      setMessage("Заметка сохранена.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Не удалось сохранить заметку.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950/70 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
        <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/50 to-transparent" />
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-white">Новая заметка</h2>
            <p className="mt-1 text-sm text-zinc-500">
              До 120 символов. Форматирование не увеличивает лимит.
            </p>
          </div>
          <Sparkles className="mt-1 size-5 text-violet-300/80" />
        </div>

        <RichEditor
          onChange={(value) => {
            setDraft(value);
            if (message === "Заметка сохранена.") {
              setMessage(null);
            }
          }}
          resetKey={resetKey}
          overLimit={overLimit}
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
              <span
                className={
                  overLimit
                    ? "font-medium text-rose-300"
                    : nearLimit
                      ? "font-medium text-amber-300"
                      : "text-zinc-500"
                }
              >
                {overLimit
                  ? `Превышение на ${Math.abs(remaining)}`
                  : `Осталось ${remaining}`}
              </span>
              <span
                className={
                  overLimit
                    ? "tabular-nums text-rose-300"
                    : nearLimit
                      ? "tabular-nums text-amber-300"
                      : "tabular-nums text-zinc-500"
                }
              >
                {count} / {MAX_NOTE_LENGTH}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className={[
                  "h-full rounded-full transition-all duration-300",
                  overLimit
                    ? "bg-rose-400"
                    : nearLimit
                      ? "bg-amber-300"
                      : "bg-violet-400",
                ].join(" ")}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={saveNote}
            disabled={saving || overLimit || empty}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-zinc-950 transition hover:-translate-y-0.5 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-white/10 disabled:text-zinc-600"
          >
            {saving ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {saving ? "Сохраняю…" : "Сохранить"}
          </button>
        </div>

        <div className="mt-3 min-h-5" aria-live="polite">
          {overLimit ? (
            <p className="flex items-center gap-2 text-sm text-rose-300">
              <CircleAlert className="size-4 shrink-0" />
              Сократите заметку — сохранение временно отключено.
            </p>
          ) : message ? (
            <p
              className={
                message === "Заметка сохранена."
                  ? "text-sm text-emerald-300"
                  : "text-sm text-amber-200"
              }
            >
              {message}
            </p>
          ) : null}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Сохранённые заметки</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Последние 50 записей из PostgreSQL.
            </p>
          </div>
          {!loadingNotes && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs tabular-nums text-zinc-400">
              {notes.length}
            </span>
          )}
        </div>

        {loadingNotes ? (
          <div className="grid min-h-40 place-items-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
            <LoaderCircle className="size-5 animate-spin text-zinc-500" />
          </div>
        ) : notes.length === 0 ? (
          <div className="grid min-h-40 place-items-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
            <div>
              <p className="text-sm font-medium text-zinc-300">Пока пусто</p>
              <p className="mt-1 text-sm text-zinc-600">
                Первая сохранённая заметка появится здесь.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <article
                key={note.id}
                className="group min-h-44 rounded-3xl border border-white/10 bg-white/[0.035] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.055]"
              >
                <div className="min-h-24 text-zinc-200">
                  <NotePreview content={note.content} />
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-3 text-xs text-zinc-600">
                  <time dateTime={note.createdAt}>
                    {new Intl.DateTimeFormat("ru-RU", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(note.createdAt))}
                  </time>
                  <span>{characterCount(note.plainText)} симв.</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
