"use client";

import type { ReactElement } from "react";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { RETRO_FRAG, WAVE_FRAG } from "./shaders";
import { createProgram, parseColor } from "./webgl";

/** Пропсы Dither: палитра, квантование и параметры волны. */
export type DitherProps = {
  /** Сколько уровней цвета оставить (2 = чистый 1-бит) */
  colorNum?: number;
  /** Размер «пикселя» дизеринга в CSS-пикселях */
  pixelSize?: number;
  waveSpeed?: number;
  waveFrequency?: number;
  waveAmplitude?: number;
  enableMouseInteraction?: boolean;
  mouseRadius?: number;
  /** Цвет рисунка; по умолчанию --gradient-primary */
  color?: string;
  /** Цвет фона; по умолчанию --background (поэтому полоса «бесшовная») */
  background?: string;
  className?: string;
};

/** WebGL-дизеринг на FBM-шуме и матрице Байера 8x8. */
export function Dither({
  colorNum = 4,
  pixelSize = 2,
  waveSpeed = 0.06,
  waveFrequency = 1.6,
  waveAmplitude = 0.5,
  enableMouseInteraction = true,
  mouseRadius = 0.35,
  color,
  background,
  className,
}: DitherProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
      powerPreference: "low-power",
    });
    if (!gl) return; // нет WebGL — останется только CSS-подложка

    // Контекст уже терялся (например, после жёсткого cleanup или OOM у GPU):
    // второй раз шейдеры на нём не соберутся — оставляем CSS-подложку.
    if (gl.isContextLost()) return;

    const waveProgram = createProgram(gl, WAVE_FRAG);
    const retroProgram = createProgram(gl, RETRO_FRAG);
    if (!waveProgram || !retroProgram) return;

    // один quad на все проходы
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const bindQuad = (program: WebGLProgram): void => {
      const location = gl.getAttribLocation(program, "position");
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    };

    const u = (program: WebGLProgram, name: string): WebGLUniformLocation | null =>
      gl.getUniformLocation(program, name);

    // --- фреймбуфер для первого прохода ----------------------------------
    const texture = gl.createTexture();
    const framebuffer = gl.createFramebuffer();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // --- цвета берём из CSS-переменных (и следим за сменой темы) ----------
    const readVar = (name: string): string | null => getComputedStyle(canvas).getPropertyValue(name).trim() || null;

    let waveColorArr = parseColor(color) ?? parseColor(readVar("--gradient-primary")) ?? [0.17, 0.84, 1];
    let bgColorArr = parseColor(background) ?? parseColor(readVar("--background")) ?? [1, 1, 1];

    const refreshColors = (): void => {
      if (!color) {
        waveColorArr = parseColor(readVar("--gradient-primary")) ?? waveColorArr;
      }
      if (!background) {
        bgColorArr = parseColor(readVar("--background")) ?? bgColorArr;
      }
    };

    const themeObserver = new MutationObserver(refreshColors);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    // --- размеры ----------------------------------------------------------
    let width = 0;
    let height = 0;
    let rafId = 0;
    // курсор нужен уже на первом кадре — объявляем до renderFrame/resize
    const mouse = { x: 0, y: 0 };
    const start = performance.now();

    const reducedMotion =
      typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** Один кадр: проход шума в фреймбуфер, затем дизеринг на экран. */
    const renderFrame = (now: number): void => {
      const time = (now - start) / 1000;

      // проход 1 → в текстуру
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.viewport(0, 0, width, height);
      gl.useProgram(waveProgram);
      bindQuad(waveProgram);
      gl.uniform2f(u(waveProgram, "resolution"), width, height);
      gl.uniform1f(u(waveProgram, "time"), reducedMotion ? 4 : time);
      gl.uniform1f(u(waveProgram, "waveSpeed"), waveSpeed);
      gl.uniform1f(u(waveProgram, "waveFrequency"), waveFrequency);
      gl.uniform1f(u(waveProgram, "waveAmplitude"), waveAmplitude);
      gl.uniform3f(u(waveProgram, "waveColor"), ...waveColorArr);
      gl.uniform3f(u(waveProgram, "bgColor"), ...bgColorArr);
      gl.uniform2f(u(waveProgram, "mousePos"), mouse.x, mouse.y);
      gl.uniform1f(u(waveProgram, "enableMouseInteraction"), enableMouseInteraction ? 1 : 0);
      gl.uniform1f(u(waveProgram, "mouseRadius"), mouseRadius);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // проход 2 → на экран
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      gl.useProgram(retroProgram);
      bindQuad(retroProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(u(retroProgram, "inputBuffer"), 0);
      gl.uniform2f(u(retroProgram, "resolution"), width, height);
      gl.uniform1f(u(retroProgram, "colorNum"), Math.max(colorNum, 2));
      gl.uniform1f(u(retroProgram, "pixelSize"), pixelSize);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const resize = (): void => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssWidth = canvas.clientWidth || canvas.parentElement?.clientWidth || 1;
      const cssHeight = canvas.clientHeight || canvas.parentElement?.clientHeight || 1;
      const nextWidth = Math.max(1, Math.round(cssWidth * dpr));
      const nextHeight = Math.max(1, Math.round(cssHeight * dpr));
      if (nextWidth === width && nextHeight === height) return;

      width = nextWidth;
      height = nextHeight;
      canvas.width = width;
      canvas.height = height;

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

      // Смена размера обнуляет буферы. Отрисовываем кадр синхронно,
      // чтобы в это же мгновение на экране (и в скриншоте) был валидный кадр.
      renderFrame(performance.now());
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
    resize();

    // --- мышь -------------------------------------------------------------
    const onPointerMove = (event: PointerEvent): void => {
      const rect = canvas.getBoundingClientRect();
      const dpr = width / Math.max(rect.width, 1);
      mouse.x = (event.clientX - rect.left) * dpr;
      mouse.y = (event.clientY - rect.top) * dpr;
    };
    if (enableMouseInteraction) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    // --- цикл -------------------------------------------------------------
    const draw = (now: number): void => {
      resize(); // при смене размера сам отрисует кадр
      renderFrame(now);
      if (!reducedMotion && !document.hidden) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      gl.deleteProgram(waveProgram);
      gl.deleteProgram(retroProgram);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
      gl.deleteFramebuffer(framebuffer);
    };
  }, [
    colorNum,
    pixelSize,
    waveSpeed,
    waveFrequency,
    waveAmplitude,
    enableMouseInteraction,
    mouseRadius,
    color,
    background,
  ]);

  return <canvas ref={canvasRef} aria-hidden className={cn("block h-full w-full", className)} />;
}

export default Dither;
