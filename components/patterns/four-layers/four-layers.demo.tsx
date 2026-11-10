"use client";

import { BorderBeam } from "@/components/kit/border-beam/border-beam";
import { DotPattern } from "@/components/kit/dot-pattern/dot-pattern";
import { FlickeringGrid } from "@/components/kit/flickering-grid/flickering-grid";
import { LightRays } from "@/components/kit/light-rays/light-rays";
import { NoiseTexture } from "@/components/kit/noise-texture/noise-texture";
import { StripedPattern } from "@/components/kit/striped-pattern/striped-pattern";
import { PatternFrame } from "@/components/patterns/_shared/pattern-frame";
import { useState, type ReactElement } from "react";

/** Линии приёма: каждая — отдельная техника и отдельная зона кадра. */
type LineId = "dots" | "stripes" | "flicker" | "rays";

const LINES: { id: LineId; ru: string }[] = [
  { id: "dots", ru: "точки" },
  { id: "stripes", ru: "штрих" },
  { id: "flicker", ru: "пиксель" },
  { id: "rays", ru: "луч" },
];

const LAYERS = [
  { id: 1, ru: "подложка" },
  { id: 2, ru: "узор" },
  { id: 3, ru: "содержимое" },
  { id: 4, ru: "свет" },
];

/**
 * Сцена паттерна «четыре линии, четыре слоя».
 *
 * Песочница, а не картинка: слой изолируется кнопкой, линия снимается чипом.
 * Так правило «слой, который нельзя выключить, — декорация» проверяется прямо
 * в кадре. Состояние держат два массива, поэтому компонент клиентский.
 *
 * `compact` убирает пульт: в плитке каталога кнопки оказались бы внутри ссылки
 * на страницу паттерна и вместо переключения слоя уводили с индекса.
 */
export function FourLayersDemo({ compact = false }: { compact?: boolean }): ReactElement {
  const [focus, setFocus] = useState(0);
  const [off, setOff] = useState<LineId[]>([]);

  const toggleLine = (id: LineId): void => {
    setOff((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const show = (id: LineId): boolean => !off.includes(id);

  return (
    <PatternFrame data-pattern="four-layers" tone="dark" className={`flex-col p-0 ${compact ? "h-60" : "h-72"}`}>
      <div className="four-layers-stage relative w-full flex-1" data-focus={focus}>
        {/* слой 01: тон и зерно */}
        <div className="four-layer absolute inset-0" data-layer="1">
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_18%_-10%,rgba(44,213,255,0.16),transparent_62%),radial-gradient(90%_80%_at_92%_108%,rgba(44,48,255,0.26),transparent_66%)]" />
          <NoiseTexture opacity={0.2} className="mix-blend-overlay" />
        </div>

        {/* слой 02: три линии, каждая в своей зоне */}
        <div className="four-layer absolute inset-0" data-layer="2">
          <div className={show("dots") ? "absolute inset-0" : "absolute inset-0 opacity-0"}>
            <DotPattern
              width={18}
              height={18}
              cr={1}
              className="[mask-image:radial-gradient(62%_74%_at_20%_18%,black_12%,transparent_76%)] text-white/50"
            />
          </div>
          <div className={show("stripes") ? "absolute inset-0" : "absolute inset-0 opacity-0"}>
            <StripedPattern
              width={10}
              height={10}
              className="[mask-image:radial-gradient(46%_58%_at_90%_10%,black_4%,transparent_72%)] text-white/25"
            />
          </div>
          <div
            className={`absolute inset-0 [mask-image:radial-gradient(52%_62%_at_10%_94%,black_6%,transparent_74%)] ${
              show("flicker") ? "" : "opacity-0"
            }`}
          >
            <FlickeringGrid
              squareSize={4}
              gridGap={4}
              color="#2cd5ff"
              maxOpacity={0.4}
              flickerChance={0.22}
              className="h-full w-full"
            />
          </div>
        </div>

        {/* слой 03: содержимое */}
        <div className="four-layer absolute inset-0 grid place-items-center p-5" data-layer="3">
          <svg
            aria-hidden
            viewBox="0 0 200 220"
            className="pointer-events-none absolute right-[3%] bottom-[4%] w-[26%]"
          >
            <text
              x="100"
              y="170"
              textAnchor="middle"
              fontSize="200"
              fill="none"
              stroke="rgb(44 213 255 / 0.1)"
              transform="translate(8 8)"
            >
              4
            </text>
            <text x="100" y="170" textAnchor="middle" fontSize="200" fill="none" stroke="rgb(44 213 255 / 0.22)">
              4
            </text>
          </svg>

          <BorderBeam
            mode="shine"
            style={{ backgroundColor: "rgb(9 13 20 / 0.82)" }}
            className="relative w-64 border-white/15 p-4 backdrop-blur-md"
          >
            <span className="font-mono text-[9.5px] tracking-[0.18em] text-white/45 uppercase">
              слой 03 · содержимое
            </span>
            <p className="mt-1.5 text-xl leading-none font-medium tracking-tight text-white">4 линии, 4 слоя</p>
            <p className="mt-2 text-[11.5px] text-white/60">
              Подложка, узор, карточка, свет. Уберите любой — сцена станет плоской.
            </p>
            <p className="mt-3 flex gap-3 border-t border-white/10 pt-2 font-mono text-[9px] tracking-[0.12em] text-white/45 uppercase">
              <span>4 линии</span>
              <span>6 компонентов</span>
              <span>0 кб js</span>
            </p>
          </BorderBeam>
        </div>

        {/* слой 04: свет */}
        <div
          className={`four-layer pointer-events-none absolute inset-0 ${show("rays") ? "" : "opacity-0"}`}
          data-layer="4"
        >
          <LightRays
            rays={13}
            color="rgb(44 213 255 / 0.5)"
            className="[mask-image:radial-gradient(88%_78%_at_50%_-6%,black,transparent_80%)]"
          />
        </div>
      </div>

      <div
        className={`relative z-10 w-full flex-wrap items-center gap-1.5 border-t border-white/10 bg-[#05080d]/90 px-2.5 py-2 ${
          compact ? "hidden" : "flex"
        }`}
      >
        <span className="mr-1 font-mono text-[9px] tracking-[0.16em] text-white/35 uppercase">слой</span>
        {LAYERS.map((layer) => (
          <button
            key={layer.id}
            type="button"
            aria-pressed={focus === layer.id}
            onClick={() => setFocus((current) => (current === layer.id ? 0 : layer.id))}
            className={`rounded-full border px-2 py-0.5 font-mono text-[10px] transition-colors ${
              focus === layer.id
                ? "border-cyan-300/60 bg-cyan-300/10 text-cyan-200"
                : "border-white/12 text-white/50 hover:text-white/80"
            }`}
          >
            0{layer.id}
          </button>
        ))}

        <span className="mx-1 h-3 w-px bg-white/10" aria-hidden />

        <span className="mr-1 font-mono text-[9px] tracking-[0.16em] text-white/35 uppercase">линии</span>
        {LINES.map((line) => (
          <button
            key={line.id}
            type="button"
            aria-pressed={show(line.id)}
            onClick={() => toggleLine(line.id)}
            className={`rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
              show(line.id)
                ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-200"
                : "border-white/12 text-white/40 hover:text-white/70"
            }`}
          >
            {line.ru}
          </button>
        ))}
      </div>
    </PatternFrame>
  );
}
