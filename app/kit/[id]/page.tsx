import { getKitEntry } from "@/lib/kit/manifest";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

type KitEntryPageProps = {
  params: Promise<{ id: string }>;
};

/** Заголовок вкладки: даже у редиректа он должен быть осмысленным. */
export async function generateMetadata({ params }: KitEntryPageProps): Promise<Metadata> {
  const { id } = await params;
  const entry = getKitEntry(id);

  return { title: entry ? `${entry.ru} · ${entry.name}` : "Компонент не найден" };
}

/**
 * Старый маршрут компонента ведёт в каталог на главной.
 *
 * Демо, пропсы и факты теперь живут в одном паспорте на `/`: отдельная страница
 * «демо и пропсы» заставляла возвращаться назад кнопкой браузера. Маршрут оставлен
 * редиректом, чтобы не ломать внешние ссылки и закладки.
 */
export default async function KitEntryRedirect({ params }: KitEntryPageProps): Promise<ReactElement> {
  const { id } = await params;

  redirect(getKitEntry(id) ? `/#c-${id}` : "/#catalog");
}
