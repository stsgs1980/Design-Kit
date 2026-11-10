import { cn } from "@/lib/utils";
import type { ReactElement, ReactNode } from "react";

/** Пропсы рамки сцены места. */
export type SceneShellProps = {
  children: ReactNode;
  /** id места: попадает в data-scene, по нему сцену находят проверки. */
  place: string;
  className?: string;
};

/**
 * Рамка сцены места: одна геометрия для всех пяти композиций.
 *
 * Сцена — это не демо отдельного компонента, а собранный блок страницы, поэтому
 * рамка держит одинаковые скругление, границу и обрезку фона: иначе композиции
 * в разделе «что куда» читались бы как пять разных сайтов.
 */
export function SceneShell({ children, place, className }: SceneShellProps): ReactElement {
  return (
    <div
      data-scene={place}
      className={cn("relative isolate w-full overflow-hidden rounded-xl border border-border bg-card", className)}
    >
      {children}
    </div>
  );
}
