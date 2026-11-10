import { redirect } from "next/navigation";
import type { ReactElement } from "react";

/**
 * Гайд переехал на главную: страница и есть каталог фич.
 * Роут оставлен, чтобы старые ссылки не ломались. Ведёт на `#start` — на главной
 * нет якоря `#index`, и прежний редирект приземлял в никуда.
 */
export default function GuidePage(): ReactElement {
  redirect("/#start");
}
