import { Check, Globe, Plus } from "@/components/icons";
import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { RadialOrbit } from "@/components/kit/radial-orbit/radial-orbit";
import type { ReactElement } from "react";

const ORBIT = [
  { id: 1, rayIndex: 1, distance: 54, icon: <Globe className="size-3 text-foreground/70" /> },
  { id: 2, rayIndex: 7, distance: 42, icon: <Check className="size-3 text-foreground/70" /> },
  { id: 3, rayIndex: 14, distance: 58, icon: <Plus className="size-3 text-foreground/70" /> },
];

/**
 * Демо-сцена: три разные метки по полярным координатам.
 *
 * Три одинаковых плюса читались как «орбита без иконок»; Globe / Check / Plus
 * показывают, что это метки состояния, а не декор.
 */
export function RadialOrbitDemo(): ReactElement {
  return (
    <DemoFrame data-scene="orbit">
      <RadialOrbit
        items={ORBIT}
        lineCount={18}
        centerIcon={<span className="font-mono text-[11px] text-muted-foreground">20</span>}
        className="h-full"
        inView
      />
    </DemoFrame>
  );
}
