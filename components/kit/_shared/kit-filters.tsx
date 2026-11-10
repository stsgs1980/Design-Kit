import { kitCategoryLabels, kitTechLabels, type KitCategory, type KitTech } from "@/lib/kit/manifest";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactElement } from "react";

/** Пропсы панели фильтров. */
export type KitFiltersProps = {
  categories: KitCategory[];
  techs: KitTech[];
  surfaces: string[];
  /** Текущие значения из searchParams. */
  active: { cat?: string; tech?: string; surface?: string };
};

const chip = "rounded-full border border-border px-3 py-1 text-xs transition-colors";

/** Ссылка-чип: фильтры живут в URL, поэтому страница остаётся серверной. */
function Chip({ href, label, isActive }: { href: string; label: string; isActive: boolean }): ReactElement {
  return (
    <Link
      href={href}
      className={cn(
        chip,
        isActive ? "border-foreground/40 bg-foreground text-background" : "text-muted-foreground hover:bg-muted",
      )}
    >
      {label}
    </Link>
  );
}

/** Три группы фильтров: категория, техника, поверхность. */
export function KitFilters({ categories, techs, surfaces, active }: KitFiltersProps): ReactElement {
  const query = (next: Partial<KitFiltersProps["active"]>): string => {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries({ ...active, ...next })) {
      if (value) {
        params.set(key, value);
      }
    }

    const search = params.toString();

    return search ? `/kit?${search}` : "/kit";
  };

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] text-muted-foreground">категория</span>
        <Chip href={query({ cat: undefined })} label="все" isActive={!active.cat} />
        {categories.map((category) => (
          <Chip
            key={category}
            href={query({ cat: category })}
            label={kitCategoryLabels[category]}
            isActive={active.cat === category}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] text-muted-foreground">техника</span>
        <Chip href={query({ tech: undefined })} label="все" isActive={!active.tech} />
        {techs.map((tech) => (
          <Chip key={tech} href={query({ tech })} label={kitTechLabels[tech]} isActive={active.tech === tech} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] text-muted-foreground">поверхность</span>
        <Chip href={query({ surface: undefined })} label="все" isActive={!active.surface} />
        {surfaces.map((surface) => (
          <Chip key={surface} href={query({ surface })} label={surface} isActive={active.surface === surface} />
        ))}
      </div>
    </div>
  );
}
