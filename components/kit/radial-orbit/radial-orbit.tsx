"use client";

import type { ReactElement } from "react";

import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/**
 * RadialOrbit — иконки-сателлиты по полярным координатам.
 *
 * Механика (из оригинального шаблона):
 *   • рисуем N «лучей» — по одному на угол (360/N);
 *   • иконка ставится на своём луче на расстоянии `distance`
 *     (x = cos(a)·d, y = sin(a)·d) и «выстреливается» spring-анимацией;
 *   • луч — линия с origin-left и scaleX 0→1: она буквально растёт от центра.
 *
 * Контейнер обычно обрезают маской radial-gradient, чтобы схема «таяла» по краям.
 */
export function RadialOrbit({
  items,
  lineCount = 22,
  centerIcon,
  inView,
  className,
}: {
  items: { id: string | number; rayIndex: number; distance: number; delay?: number; icon: React.ReactNode }[];
  lineCount?: number;
  centerIcon?: React.ReactNode;
  inView?: boolean;
  className?: string;
}): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const selfInView = useInView(ref, { once: false, margin: "-100px" });
  const visible = inView ?? selfInView;

  const rays = Array.from({ length: lineCount }, (_, i) => ({
    id: i,
    angle: (360 / lineCount) * i,
  }));

  // у каждого луча — ближайшая к центру иконка, чтобы линия не торчала в пустоту
  const firstOnRay = new Map<number, number>();
  for (const item of items) {
    const ray = ((item.rayIndex % lineCount) + lineCount) % lineCount;
    const current = firstOnRay.get(ray);
    if (current === undefined || item.distance < current) firstOnRay.set(ray, item.distance);
  }

  return (
    <div ref={ref} className={cn("relative flex w-full items-center justify-center overflow-hidden", className)}>
      {/* лучи-линии */}
      {rays.map((ray) => {
        const distance = firstOnRay.get(ray.id);
        return (
          <div
            key={`line-${ray.id}`}
            className="absolute top-1/2 left-1/2 z-10"
            style={{ transform: `translate(-50%, -50%) rotate(${ray.angle}deg)` }}
          >
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: visible ? 1 : 0, opacity: visible ? (distance ? 0.5 : 0.35) : 0 }}
              transition={{ delay: distance ? 0.25 : 0.1, duration: 0.4 }}
              className="h-px w-screen origin-left bg-border"
            />
          </div>
        );
      })}

      {/* центральная иконка */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: visible ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
        className="z-20 flex size-10 items-center justify-center rounded-full border border-border bg-card"
      >
        {centerIcon}
      </motion.div>

      {/* сателлиты */}
      {items.map((item) => {
        const angle = (((item.rayIndex % lineCount) + lineCount) % lineCount) * (360 / lineCount);
        const radians = (angle * Math.PI) / 180;
        const x = Math.cos(radians) * item.distance - 20;
        const y = Math.sin(radians) * item.distance - 20;

        return (
          <motion.div
            key={item.id}
            initial={{ scale: 0, x: -20, y: -20 }}
            animate={{ scale: visible ? 1 : 0, x: visible ? x : -20, y: visible ? y : -20 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: item.delay ?? 0 }}
            className="absolute top-1/2 left-1/2 z-30 flex size-10 items-center justify-center rounded-full border border-border bg-card"
          >
            {item.icon}
          </motion.div>
        );
      })}
    </div>
  );
}
