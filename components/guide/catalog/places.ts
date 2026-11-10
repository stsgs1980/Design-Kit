"use client";

import { BackgroundScene } from "@/components/guide/scenes/background-scene";
import { CardScene } from "@/components/guide/scenes/card-scene";
import { EmptyScene } from "@/components/guide/scenes/empty-scene";
import { HeroScene } from "@/components/guide/scenes/hero-scene";
import { SectionScene } from "@/components/guide/scenes/section-scene";
import type { ReactElement } from "react";

/**
 * Место на странице: правило и — если оно есть — собранная сцена.
 *
 * Сцена необязательна: поверхность может быть честно описана в паспортах
 * компонентов, но не иметь собственной постановки. Выдумывать сцену ради
 * ровного списка — значит показывать приём без примера.
 */
export type Place = {
  /** id поверхности из манифеста: `hero`, `section`, `card`, `background`, `empty`, `nav`, `cta`, `social`, `input`, `code`. */
  id: string;
  rule?: string;
  scene?: () => ReactElement;
};

/**
 * Места страницы: пять постановок и пять поверхностей-тегов.
 *
 * Список обязан покрывать все значения `surfaces` манифеста: иначе компонент,
 * помеченный, например, `social`, не находится видом «по месту» вовсе — он
 * есть в паспорте и отсутствует в навигации.
 */
export const PLACES: Place[] = [
  { id: "hero", rule: "Один акцент: либо лучи, либо блик по периметру, но не оба.", scene: HeroScene },
  { id: "section", rule: "Фон с маской и один разделитель — секции не должны спорить.", scene: SectionScene },
  { id: "card", rule: "Hover не двигает layout: только пятно, блик и рамка.", scene: CardScene },
  {
    id: "background",
    rule: "Только с mask-image и opacity до 0.4, иначе текст не читается.",
    scene: BackgroundScene,
  },
  { id: "empty", rule: "Тихая анимация 8–12 fps: пустое состояние не должно притягивать взгляд.", scene: EmptyScene },
  // Поверхности без собственной сцены: описание живёт в паспортах компонентов.
  { id: "nav" },
  { id: "cta" },
  { id: "social" },
  { id: "input" },
  { id: "code" },
];

/** Одно место по id. */
export function getPlace(id: string): Place | undefined {
  return PLACES.find((place) => place.id === id);
}
