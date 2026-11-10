import { getPatternEntry } from "@/lib/patterns/manifest";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

type PatternPageProps = {
  params: Promise<{ id: string }>;
};

/** Заголовок вкладки для редиректа: берётся из записи паттерна. */
export async function generateMetadata({ params }: PatternPageProps): Promise<Metadata> {
  const { id } = await params;
  const entry = getPatternEntry(id);

  return { title: entry ? `${entry.name} · ${entry.latin}` : "Паттерн не найден" };
}

/**
 * Старый маршрут паттерна ведёт в каталог на вкладку «Паттерны».
 *
 * Пример, правила, грабли и состав переехали в паспорт паттерна на `/#c-<id>`:
 * так «с чем сочетать» открывается превью рядом, а не новой страницей.
 */
export default async function PatternRedirect({ params }: PatternPageProps): Promise<ReactElement> {
  const { id } = await params;

  redirect(getPatternEntry(id) ? `/#c-${id}` : "/#patterns");
}
