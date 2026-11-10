import { ArrowRight } from "@/components/icons";
import { WorldMap } from "@/components/kit/world-map/world-map";
import { kitStats } from "@/lib/kit/manifest";
import Link from "next/link";
import type { ReactElement } from "react";

/** Точки на карте: набор городов, чтобы карта читалась как «покрытие». */
const MARKERS = [
  { lat: 52.52, lng: 13.405 },
  { lat: 51.5074, lng: -0.1278 },
  { lat: 40.7128, lng: -74.006 },
  { lat: 55.7558, lng: 37.6176 },
  { lat: 35.6762, lng: 139.6503 },
  { lat: -33.8688, lng: 151.2093 },
  { lat: 1.3521, lng: 103.8198 },
  { lat: 28.6139, lng: 77.209 },
];

/** Строка-колонтитул: чем страница является, без обещаний. */
const META = ["справочник по киту", "обновляется из манифеста", "русский интерфейс", "без вымышленного продукта"];

/**
 * Числа стартового экрана: считаются по манифесту, а не пишутся руками.
 *
 * «0 зависимостей» — про новые: у кита четыре прод-зависимости, но ни один
 * компонент не приносит своей. «Мест на странице» тоже из манифеста: пока число
 * было вписано пятёркой, поверхностей стало 10, а подпись врала.
 */
const STATS = [
  { value: kitStats().total, label: "компонентов" },
  { value: kitStats().noJs, label: "без JS" },
  { value: 0, label: "новых зависимостей" },
  { value: kitStats().surfaces, label: "мест на странице" },
];

/**
 * Стартовый экран: макро-типографика, а не промо-блок.
 *
 * Приём редакционный: заголовок набран макро-кеглем (до 132 px), ведущая 0.88,
 * трекинг −0.055em, иерархию держат размер и вес, а не подписи. Слой статичен —
 * ни бегущих бликов, ни счётчиков: человек пришёл читать, а не смотреть
 * анимацию. Единственная графика — карта из точек, посчитанная на сервере,
 * поэтому обещание «12 компонентов без JS» подтверждается прямо здесь.
 */
export function Hero(): ReactElement {
  return (
    <section id="start" className="relative isolate w-full overflow-hidden border-b border-border">
      <WorldMap
        markers={MARKERS}
        samples={4200}
        dotRadius={0.22}
        className="pointer-events-none absolute top-4 right-0 h-[320px] w-[380px] [mask-image:linear-gradient(to_left,rgba(0,0,0,0.95)_30%,transparent_78%)] text-muted-foreground/15 md:top-8 md:h-[440px] md:w-[520px] md:text-muted-foreground/40 lg:h-[540px] lg:w-[640px]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 50% at 78% 88%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 70%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-6">
        <ul className="-mx-6 flex [scrollbar-width:none] gap-x-8 overflow-x-auto border-b border-border px-6 py-3 font-mono text-[10px] tracking-[0.16em] whitespace-nowrap text-muted-foreground uppercase">
          {META.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h1 className="max-w-[15ch] py-8 text-[clamp(34px,8.4vw,132px)] leading-[0.88] font-semibold tracking-[-0.055em] md:max-w-none md:py-10">
          {kitStats().total} компонента.
          <br />
          <span className="font-light text-foreground/55">Куда ставить,</span>
          <br />
          как <span className="text-primary-text">собрать</span>.
        </h1>

        <div className="grid gap-6 border-t border-border py-5 md:grid-cols-2 md:items-end">
          <p className="max-w-[56ch] text-sm leading-relaxed text-muted-foreground md:text-base">
            {kitStats().total} компонента с паспортами: что делает, куда ставить, с чем сочетать, сколько стоит в
            килобайтах. Ниже — {kitStats().surfaces} мест, три готовых набора и матрица «техника × цена».
          </p>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 md:justify-end">
            <Link
              href="#catalog"
              className="group inline-flex items-center gap-2 border-b border-foreground pb-1 text-sm font-medium text-foreground"
            >
              в каталог
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#where"
              className="inline-flex items-center gap-2 border-b border-border pb-1 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              что куда
            </Link>
          </div>
        </div>

        <dl className="flex flex-wrap gap-x-12 gap-y-6 border-t border-border py-7">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="text-[clamp(30px,4.4vw,56px)] leading-[0.9] font-semibold tracking-[-0.04em]">
                {stat.value}
              </dd>
              <dd className="mt-1.5 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
