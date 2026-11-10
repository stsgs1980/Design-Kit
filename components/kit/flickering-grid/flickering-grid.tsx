"use client";

import type { ReactElement } from "react";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

/**
 * FlickeringGrid — сетка квадратов со случайной прозрачностью, «мерцающих» во времени.
 *
 * Именно этот эффект в оригинальном Codeforge подсвечивает активный таб
 * в Demo-секции (там он обёрнут в motion.div с mask-[linear-gradient(...)]).
 *
 * Реализация — Canvas2D, без библиотек:
 *   • сетка считается в «логических» пикселях, canvas умножается на DPR;
 *   • состояние — Float32Array прозрачностей (по одной на квадрат);
 *   • вспышка редкая и с хвостом: квадрат получает почти полную прозрачность, а
 *     дальше гаснет по экспоненте (за секунду остаётся 8%). Поэтому сцена читается
 *     как тихая текстура, а не как плотный голубой шум на всю плитку;
 *   • вероятность вспышки зависит от flickerChance и dt, поэтому на 60 и 144 Гц
 *     скорость одинаковая;
 *   • IntersectionObserver выключает rAF, когда блок ушёл из вьюпорта.
 */
export function FlickeringGrid({
  squareSize = 4,
  gridGap = 6,
  color = "#6B7280",
  maxOpacity = 0.3,
  flickerChance = 0.1,
  width,
  height,
  className,
}: {
  squareSize?: number;
  gridGap?: number;
  color?: string;
  maxOpacity?: number;
  flickerChance?: number;
  width?: number;
  height?: number;
  className?: string;
}): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // rgba(...) с подставляемой альфой — чтобы не собирать строку на каждый квадрат
    const colorPrefix = (() => {
      const probe = document.createElement("div");
      probe.style.color = color;
      document.body.appendChild(probe);
      const computed = getComputedStyle(probe).color; // "rgb(r, g, b)"
      document.body.removeChild(probe);
      const match = computed.match(/rgba?\(([^)]+)\)/);
      if (!match) return "rgba(107, 114, 128,";
      const [r, g, b] = match[1].split(/[\s,/]+/).map(Number);
      return `rgba(${r}, ${g}, ${b},`;
    })();

    let cols = 0;
    let rows = 0;
    let opacities = new Float32Array(0);
    let dpr = 1;

    const setup = (): void => {
      const cssWidth = width ?? container.clientWidth;
      const cssHeight = height ?? container.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.max(1, Math.round(cssWidth * dpr));
      canvas.height = Math.max(1, Math.round(cssHeight * dpr));
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      cols = Math.max(1, Math.floor(cssWidth / (squareSize + gridGap)));
      rows = Math.max(1, Math.floor(cssHeight / (squareSize + gridGap)));

      opacities = new Float32Array(cols * rows);
      // первый кадр почти пустой: вспышки появляются по мере работы rAF
      for (let i = 0; i < opacities.length; i++) {
        opacities[i] = Math.random() < 0.04 ? Math.random() * maxOpacity : 0;
      }
    };

    const draw = (dt: number): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // за секунду от вспышки остаётся 8% яркости: хвост виден, шума нет
      const decay = Math.pow(0.08, dt);
      const flash = flickerChance * dt;

      for (let i = 0; i < opacities.length; i++) {
        // мерцание: с вероятностью flickerChance*dt квадрат вспыхивает и потом гаснет
        if (Math.random() < flash) {
          opacities[i] = maxOpacity * (0.6 + Math.random() * 0.4);
        } else {
          opacities[i] *= decay;
        }

        // погасшие квадраты не рисуем: на 800 ячейках это заметная экономия
        if (opacities[i] < 0.012) continue;

        const col = i % cols;
        const row = Math.floor(i / cols);
        ctx.fillStyle = `${colorPrefix} ${opacities[i]})`;
        ctx.fillRect(
          col * (squareSize + gridGap) * dpr,
          row * (squareSize + gridGap) * dpr,
          squareSize * dpr,
          squareSize * dpr,
        );
      }
    };

    setup();

    let raf = 0;
    let last = performance.now();
    let visible = false;

    const loop = (now: number): void => {
      const dt = Math.min((now - last) / 1000, 0.1); // защита от скачков после таб-аута
      last = now;
      draw(dt);
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        const next = entry.isIntersecting;
        if (next === visible) return;
        visible = next;
        if (visible) {
          last = performance.now();
          raf = requestAnimationFrame(loop);
        } else {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 },
    );
    io.observe(container);

    const ro = new ResizeObserver(() => {
      setup();
      if (!visible) draw(0); // перерисовать после ресайза, пока не крутится rAF
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [squareSize, gridGap, color, maxOpacity, flickerChance, width, height]);

  return (
    <div ref={containerRef} className={cn("relative h-full w-full", className)}>
      <canvas ref={canvasRef} className="pointer-events-none block" aria-hidden />
    </div>
  );
}
