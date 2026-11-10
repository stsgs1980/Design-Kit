import { kitStats } from "@/lib/kit/manifest";
import type { ReactElement } from "react";

/** Правило композиции: короткая формула, объяснение и паттерн-пример. */
type Rule = { title: string; body: string; do: string; dont: string; pattern: { id: string; name: string } };

const RULES: Rule[] = [
  {
    title: "Один акцент на экран",
    pattern: { id: "hero-recipe", name: "Первый экран" },
    body: `Из ${kitStats().total} компонентов на первом экране работает один громкий. Остальные — фон, линии и воздух. Два акцента рядом читаются как ошибка, а не как щедрость.`,
    do: "WebGL-полоса на всю ширину — единственный громкий блок страницы",
    dont: "дизеринг в карточке рядом с лучами и бликом по периметру",
  },
  {
    title: "Фон всегда с маской",
    pattern: { id: "aurora-background", name: "Полярное сияние" },
    body: "Любой паттерн под текстом ставится с mask-image и гасится к краям. Без маски точки и полосы конкурируют с буквами, и текст приходится делать жирнее — это и есть «дёшево».",
    do: "radial-gradient маска: точки гаснут к центру текста",
    dont: "точечная сетка ровным слоем под всем первым экраном",
  },
  {
    title: "Лестница стоимости",
    pattern: { id: "sustainable-web", name: "Экономный фон" },
    body: "Сначала CSS, потом SVG, потом Canvas 2D, и только потом WebGL — отдельным ленивым чанком. Дорогая техника берётся не «потому что модно», а когда дешёвая не даёт нужного кадра.",
    do: "карта мира: 1400 точек посчитаны на сервере, ноль JS на клиенте",
    dont: "тянуть шейдер ради волны, которую CSS-градиент рисует за 0 КБ",
  },
  {
    title: "Движение — только opacity и transform",
    pattern: { id: "cinematic-scrollytelling", name: "Кино на прокрутке" },
    body: "Всё, что дёргает layout, роняет кадры на длинной странице. Анимация живёт на композиторе, а тяжёлое живёт в канвасе и гасится IntersectionObserver.",
    do: "блик едет background-position, плашка навигации — layoutId",
    dont: "animate width, top и height у блоков в потоке",
  },
  {
    title: "Иерархия держится на размере, а не на подписях",
    pattern: { id: "macro-typography", name: "Макро-типографика" },
    body: "Один h1, один h2 на секцию, крупный лид. Подписи мелким шрифтом не объясняют секцию — они её извиняют. Если нужно объяснить блок, объясняет заголовок.",
    do: "h2 48 px, лид 18 px, дальше сразу контент",
    dont: "плашка 10 px с расшифровкой того, что тут нарисовано",
  },
  {
    title: "Порядок: обещание → доказательство",
    pattern: { id: "hero-recipe", name: "Первый экран" },
    body: "Первый экран обещает, каталог показывает состав, дальше — как этим пользоваться. Один сильный эффект идёт после каталога: сначала человек видит список, потом — на что способен лучший пункт.",
    do: "карта мира → каталог → паспорт записи → правила",
    dont: "начинать страницу с сетки без обещания",
  },
];

/** Правила композиции: что делать и чего не делать, с примером на каждое. */
export function CompositionRules(): ReactElement {
  return (
    <section id="rules" className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-6 py-16 md:py-20">
      <div className="flex flex-col gap-3">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">правила</p>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Правила сборки</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Шесть инвариантов: они действуют сразу на все компоненты и все приёмы, поэтому у них нет ни «когда брать», ни
          вердикта. У каждого правила — живой пример из паттернов, где оно уже соблюдено.
        </p>
      </div>

      <ol className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {RULES.map((rule, index) => (
          <li key={rule.title} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="text-base font-medium text-foreground">{rule.title}</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{rule.body}</p>
            <a
              href={`#c-${rule.pattern.id}`}
              className="w-fit rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary-text"
            >
              пример: {rule.pattern.name}
            </a>
            <div className="mt-1 flex flex-col gap-1.5 text-xs">
              <p className="text-foreground/80">
                <span className="font-mono text-[10px] tracking-wider text-primary-text uppercase">так</span> {rule.do}
              </p>
              <p className="text-muted-foreground">
                <span className="font-mono text-[10px] tracking-wider uppercase">не так</span> {rule.dont}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
