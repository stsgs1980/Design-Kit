import { DemoFrame } from "@/components/kit/_shared/demo-frame";
import { ShinyText } from "@/components/kit/shiny-text/shiny-text";
import type { ReactElement } from "react";

/** Демо-сцена: по фразе проезжает блик. */
export function ShinyTextDemo(): ReactElement {
  return (
    <DemoFrame data-scene="shiny">
      <ShinyText duration={3} className="text-lg font-semibold tracking-tight">
        по тексту едет блик
      </ShinyText>
    </DemoFrame>
  );
}
