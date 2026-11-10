/**
 * Разрешение конфликтов утилит Tailwind: последний класс в списке побеждает.
 *
 * Зачем свой: `cn` раньше просто склеивал строки. Компонент с базовым
 * `items-start` и потребитель с `items-center` получали оба класса, и какой
 * сработает, решал порядок правил в собранном CSS, а не порядок в коде. Ошибка
 * невидимая: в разметке всё «правильно», в браузере — не то. Именно так сцена
 * «Прожектор» молча уезжала вверх страницы.
 *
 * Утилиты группируются по осям, а не «по префиксу»: `px-3` и `py-1.5` живут в
 * одной группе `padding`, но на разных осях, и гасить друг друга не должны.
 * Первая версия таблицы валила их в одно семейство и стирала горизонтальные
 * отступы у половины интерфейса — поэтому ось теперь часть ключа.
 */

/** Группа утилит и её оси: `null` — значение на все оси сразу. */
type Family = { group: string; axis: string };

/** Таблица: регулярка значения -> группа и ось. Порядок важен, первое совпадение выигрывает. */
const FAMILIES: readonly (readonly [RegExp, Family])[] = [
  [/^p-/, { group: "padding", axis: "all" }],
  [/^px-/, { group: "padding", axis: "x" }],
  [/^py-/, { group: "padding", axis: "y" }],
  [/^pt-/, { group: "padding", axis: "top" }],
  [/^pr-/, { group: "padding", axis: "right" }],
  [/^pb-/, { group: "padding", axis: "bottom" }],
  [/^pl-/, { group: "padding", axis: "left" }],
  [/^m-/, { group: "margin", axis: "all" }],
  [/^mx-/, { group: "margin", axis: "x" }],
  [/^my-/, { group: "margin", axis: "y" }],
  [/^mt-/, { group: "margin", axis: "top" }],
  [/^mr-/, { group: "margin", axis: "right" }],
  [/^mb-/, { group: "margin", axis: "bottom" }],
  [/^ml-/, { group: "margin", axis: "left" }],
  [/^inset-x-/, { group: "inset", axis: "x" }],
  [/^inset-y-/, { group: "inset", axis: "y" }],
  [/^inset-/, { group: "inset", axis: "all" }],
  [/^top-/, { group: "inset", axis: "top" }],
  [/^right-/, { group: "inset", axis: "right" }],
  [/^bottom-/, { group: "inset", axis: "bottom" }],
  [/^left-/, { group: "inset", axis: "left" }],
  [/^gap-x-/, { group: "gap", axis: "x" }],
  [/^gap-y-/, { group: "gap", axis: "y" }],
  [/^gap-/, { group: "gap", axis: "all" }],
  [/^rounded$/, { group: "radius", axis: "all" }],
  [/^rounded-t-/, { group: "radius", axis: "top" }],
  [/^rounded-b-/, { group: "radius", axis: "bottom" }],
  [/^rounded-l-/, { group: "radius", axis: "left" }],
  [/^rounded-r-/, { group: "radius", axis: "right" }],
  [/^rounded-tl-/, { group: "radius", axis: "top-left" }],
  [/^rounded-tr-/, { group: "radius", axis: "top-right" }],
  [/^rounded-bl-/, { group: "radius", axis: "bottom-left" }],
  [/^rounded-br-/, { group: "radius", axis: "bottom-right" }],
  [/^rounded-/, { group: "radius", axis: "all" }],
  [
    /^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|contents|hidden|table)$/,
    { group: "display", axis: "all" },
  ],
  [/^(static|fixed|absolute|relative|sticky)$/, { group: "position", axis: "all" }],
  [/^(flex-row|flex-row-reverse|flex-col|flex-col-reverse)$/, { group: "flex-direction", axis: "all" }],
  [/^(flex-wrap|flex-wrap-reverse|flex-nowrap)$/, { group: "flex-wrap", axis: "all" }],
  [/^items-/, { group: "align-items", axis: "all" }],
  [/^justify-/, { group: "justify", axis: "all" }],
  [/^(place-items|place-content|place-self)-/, { group: "place", axis: "all" }],
  [/^self-/, { group: "align-self", axis: "all" }],
  [/^content-/, { group: "content", axis: "all" }],
  [/^text-(left|center|right|justify|start|end)$/, { group: "text-align", axis: "all" }],
  [/^(text-wrap|text-nowrap|text-balance|text-pretty)$/, { group: "text-wrap", axis: "all" }],
  [/^text-(xs|sm|base|lg|xl|[2-9]xl|\[[^\]]+\])$/, { group: "font-size", axis: "all" }],
  [/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/, { group: "font-weight", axis: "all" }],
  [/^leading-/, { group: "leading", axis: "all" }],
  [/^tracking-/, { group: "tracking", axis: "all" }],
  [/^w-/, { group: "width", axis: "all" }],
  [/^h-/, { group: "height", axis: "all" }],
  [/^size-/, { group: "size", axis: "all" }],
  [/^border(-[tblrxy])?(-\d|$)/, { group: "border-width", axis: "all" }],
  [/^border-(?!\d)/, { group: "border-color", axis: "all" }],
  [/^opacity-/, { group: "opacity", axis: "all" }],
  [/^overflow(-[xy])?-/, { group: "overflow", axis: "all" }],
  [/^z-/, { group: "z-index", axis: "all" }],
  [/^grid-cols-/, { group: "grid-cols", axis: "all" }],
  [/^grid-rows-/, { group: "grid-rows", axis: "all" }],
  [/^col-span-/, { group: "col-span", axis: "all" }],
  [/^row-span-/, { group: "row-span", axis: "all" }],
  [/^object-(contain|cover|fill|none|scale-down)$/, { group: "object-fit", axis: "all" }],
  [
    /^bg-(?!gradient|none|cover|contain|center|top|bottom|left|right|repeat|no-repeat|fixed|local|scroll|\[url)/,
    { group: "background-color", axis: "all" },
  ],
  [
    /^text-(?!left$|center$|right$|justify$|xs$|sm$|base$|lg$|xl$|[2-9]xl$|wrap$|nowrap$|balance$|pretty$)[a-z[]/,
    { group: "text-color", axis: "all" },
  ],
  [/^shrink(-0)?$/, { group: "shrink", axis: "all" }],
  [/^grow(-0)?$/, { group: "grow", axis: "all" }],
];

/** Модификаторы Tailwind: `hover:`, `dark:`, `md:`, `[&>*]:` — сравниваем в пределах одного набора. */
const VARIANT = /^((?:[a-z0-9-]+:|\[[^\]]+\]:)+)/;

/**
 * Группа и ось для одного класса.
 * @param {string} token - один класс без пробелов
 * @returns {{ key: string; group: string; axis: string } | null} ключ и координаты семейства
 */
export function familyOf(token: string): { key: string; group: string; axis: string } | null {
  const variant = VARIANT.exec(token)?.[1] ?? "";
  const base = token.slice(variant.length);

  for (const [pattern, family] of FAMILIES) {
    if (pattern.test(base)) {
      return { key: `${variant}|${family.group}`, group: family.group, axis: family.axis };
    }
  }

  return null;
}

/**
 * Гасит ли класс `next` более ранний класс `previous`.
 *
 * Правило осей: значение на все оси перекрывает любую ось, значение на ось —
 * только себя. `px-4` не стирает `py-1`, `p-2` стирает и то, и другое.
 * @param {{ key: string; axis: string }} next - более поздний класс
 * @param {{ key: string; axis: string }} previous - более ранний класс
 * @returns {boolean} true, если ранний класс надо выбросить
 */
function supersedes(next: { key: string; axis: string }, previous: { key: string; axis: string }): boolean {
  if (next.key !== previous.key) {
    return false;
  }

  return next.axis === "all" || previous.axis === next.axis || previous.axis === "all";
}

/**
 * Схлопывает конфликтующие классы: остаётся последний.
 * @param {string} classes - строка классов через пробел
 * @returns {string} строка без конфликтов, порядок первых вхождений сохранён
 */
export function mergeClasses(classes: string): string {
  const tokens = classes.split(/\s+/).filter(Boolean);
  const parsed = tokens.map((token) => familyOf(token));
  const dropped = new Set<number>();

  tokens.forEach((token, index) => {
    const current = parsed[index];

    if (!current) {
      return;
    }

    for (let earlier = 0; earlier < index; earlier += 1) {
      const previous = parsed[earlier];

      if (previous && supersedes(current, previous)) {
        dropped.add(earlier);
      }
    }
  });

  return tokens.filter((token, index) => !dropped.has(index)).join(" ");
}
