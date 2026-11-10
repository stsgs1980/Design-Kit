"use client";

import { KitPreviewChip } from "@/components/guide/catalog/kit-preview";
import type { Place } from "@/components/guide/catalog/places";
import { PlaceMatrix } from "@/components/guide/place-matrix";
import { kitEntries, kitSurfaceLabels } from "@/lib/kit/manifest";
import type { ReactElement } from "react";

/**
 * Паспорт места: что вообще уместно в этом блоке страницы.
 *
 * Это обратный разворот каталога — не «что делает компонент», а «что взять под
 * hero / секцию / карточку». Состав считается из поля `surfaces` манифеста,
 * поэтому список не расходится с паспортами компонентов.
 */
export function PlacePassport({ place, onOpenKit }: { place: Place; onOpenKit: (id: string) => void }): ReactElement {
  const entries = kitEntries.filter((entry) => entry.surfaces.includes(place.id));
  const Scene = place.scene;
  const label = kitSurfaceLabels[place.id] ?? place.id;

  return (
    <article id={`p-${place.id}`} className="flex min-w-0 scroll-mt-24 flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{label}</h2>
        <span className="font-mono text-sm text-muted-foreground">{place.id}</span>
        <span className="ml-auto rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          {entries.length} компонентов
        </span>
      </div>

      {place.rule ? <p className="max-w-2xl text-base leading-relaxed text-foreground/85">{place.rule}</p> : null}

      <p className="flex flex-wrap items-center gap-1.5">
        {entries.map((entry) => (
          <KitPreviewChip key={entry.id} id={entry.id} onOpen={onOpenKit} />
        ))}
      </p>

      {Scene ? (
        <div className="min-w-0 overflow-hidden rounded-xl border border-border">
          <Scene />
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          Отдельной сцены нет: поверхность — тег в паспорте, а не постановка. Компоненты выше показывают себя каждый в
          своём демо.
        </p>
      )}

      <PlaceMatrix placeId={place.id} />
    </article>
  );
}
