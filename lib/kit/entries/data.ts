import type { KitEntry } from "@/lib/kit/types";

/** Данные: карта мира, где геометрия считается на сервере. */
export const kitEntriesData: KitEntry[] = [
  {
    id: "world-map",
    name: "WorldMap",
    ru: "Карта мира",
    what: "Карта мира из точек, посчитанная на сервере: фон за 0 КБ JS.",
    category: "data",
    verdict: "core",
    tech: "svg",
    cost: { js: "0", motion: "нет" },
    surfaces: ["section"],
    source: "https://magicui.design/docs/components/dotted-map",
    file: "components/kit/world-map/world-map.tsx",
    usage: "<WorldMap markers={cities} />",
    uses: ["dot-pattern"],
    props: [
      { name: "width", type: "number", defaultValue: "150", note: "ширина карты в единицах SVG" },
      { name: "height", type: "number", defaultValue: "75", note: "высота карты в единицах SVG" },
      { name: "samples", type: "number", defaultValue: "4200", note: "сколько точек карты строится" },
      { name: "dotRadius", type: "number", defaultValue: "0.22", note: "радиус точки карты" },
      { name: "markers", type: "Marker[]", note: "широта, долгота, подпись" },
      { name: "markerColor", type: "string", defaultValue: "#FF6900", note: "цвет метки города" },
    ],
    states: ["static"],
    a11y: [
      "role=img и aria-label: карта читается как изображение",
      "метки городов не единственный носитель смысла: подписи есть в тексте",
    ],
    where: ["главная, hero: карта фоном"],
  },
];
