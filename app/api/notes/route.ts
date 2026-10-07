import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { notes } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_NOTE_LENGTH = 120;
const MAX_RICH_CONTENT_BYTES = 20_000;

const noteInputSchema = z.object({
  text: z.string(),
  content: z.record(z.string(), z.unknown()),
});

function characterCount(value: string) {
  return Array.from(value).length;
}

export async function GET() {
  try {
    const result = await getDb()
      .select()
      .from(notes)
      .orderBy(desc(notes.createdAt))
      .limit(50);

    return NextResponse.json({ notes: result });
  } catch (error) {
    console.error("GET /api/notes failed", error);
    return NextResponse.json(
      { error: "Не удалось загрузить заметки." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const parsed = noteInputSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректный формат заметки." },
        { status: 400 },
      );
    }

    const { text, content } = parsed.data;
    const count = characterCount(text);

    if (text.trim().length === 0) {
      return NextResponse.json(
        { error: "Заметка не может быть пустой." },
        { status: 400 },
      );
    }

    if (count > MAX_NOTE_LENGTH) {
      return NextResponse.json(
        { error: `Лимит — ${MAX_NOTE_LENGTH} символов.` },
        { status: 400 },
      );
    }

    if (JSON.stringify(content).length > MAX_RICH_CONTENT_BYTES) {
      return NextResponse.json(
        { error: "Содержимое заметки слишком большое." },
        { status: 413 },
      );
    }

    const [created] = await getDb()
      .insert(notes)
      .values({
        content,
        plainText: text,
      })
      .returning();

    return NextResponse.json({ note: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/notes failed", error);
    return NextResponse.json(
      { error: "Не удалось сохранить заметку." },
      { status: 500 },
    );
  }
}
