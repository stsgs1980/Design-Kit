import { kitDemos } from "@/components/kit/_shared/registry";
import type { ReactElement } from "react";

/**
 * Демо-сцена компонента по его id.
 *
 * Реестр генерируется из папок кита: файл `<id>/<id>.demo.tsx` — единственный
 * способ получить демо. Папка без демо не попадёт в реестр и валит `verify:kit`.
 */
export function KitDemo({ id }: { id: string }): ReactElement | null {
  const demo = kitDemos[id];

  return demo ? demo() : null;
}
