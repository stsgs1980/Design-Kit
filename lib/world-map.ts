/**
 * Даунсемплинг карты в точки (Web Mercator + ray casting).
 * Функция чистая и синхронная — её можно звать на сервере при рендере,
 * клиентского JS она не требует вовсе.
 */

export type Ring = [number, number][];
export type Feature = { id: string; r: Ring[] };

const DEG = Math.PI / 180;
/** Радиус сферы в «метрах» проекции. Важна только согласованность пути туда-обратно. */
const R = 6378137;

/** Границы карты: Антарктиду отсекаем, иначе карта растягивается вниз. */
export const LAT_MIN = -56;
export const LAT_MAX = 72;

const mercX = (lng: number): number => R * lng * DEG;
const mercY = (lat: number): number => R * Math.log(Math.tan(Math.PI / 4 + (lat * DEG) / 2));

const invLng = (x: number): number => x / R / DEG;
const invLat = (y: number): number => (2 * Math.atan(Math.exp(y / R)) - Math.PI / 2) / DEG;

type Bounds = { minX: number; maxX: number; minY: number; maxY: number };

function featureBounds(features: Feature[]): Bounds {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const feature of features) {
    for (const ring of feature.r) {
      for (const [lng, lat] of ring) {
        const x = mercX(Math.max(-180, Math.min(180, lng)));
        const y = mercY(Math.max(LAT_MIN, Math.min(LAT_MAX, lat)));
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  // ровно «весь мир»: так карта не дёргается, если GeoJSON обрежут
  return { minX: mercX(-180), maxX: mercX(180), minY: mercY(LAT_MIN), maxY: mercY(LAT_MAX) };
}

/** Пересечение луча и отрезка (even-odd). */
function pointInRing(x: number, y: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** Точка внутри страны: нечётное число попаданий во все кольца (внешнее + дырки). */
function pointInCountry(x: number, y: number, rings: Ring[]): boolean {
  let hits = 0;
  for (const ring of rings) if (pointInRing(x, y, ring)) hits++;
  return hits % 2 === 1;
}

export type DottedMapOptions = {
  width?: number;
  height?: number;
  /** Желаемое число сэмплов сетки — влияет на плотность */
  samples?: number;
  /** Отступ от краёв в единицах viewBox */
  padding?: number;
};

/** Пиксельные координаты точки в системе viewBox карты. */
export type Point = { x: number; y: number };

export type DottedMapResult = {
  dots: (Point & { row: number })[];
  xStep: number;
  width: number;
  height: number;
};

const cache = new Map<string, DottedMapResult>();

/** Растровая выборка точек мира по GeoJSON в координатах карты. */
export function buildDottedMap(
  features: Feature[],
  { width = 150, height = 75, samples = 4200, padding = 2 }: DottedMapOptions = {},
): DottedMapResult {
  const key = `${width}x${height}:${samples}:${padding}:${features.length}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const { minX, maxX, minY, maxY } = featureBounds(features);
  const xRange = maxX - minX;
  const yRange = maxY - minY;

  // вписываем мир в viewBox с сохранением пропорций (иначе точки «плющатся»)
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const scale = Math.min(innerW / xRange, innerH / yRange);
  const offsetX = padding + (innerW - xRange * scale) / 2;
  const offsetY = padding + (innerH - yRange * scale) / 2;

  const cols = Math.max(1, Math.round(Math.sqrt(samples * (innerW / innerH))));
  const rows = Math.max(1, Math.round(samples / cols));

  const cellW = innerW / cols;
  const cellH = innerH / rows;

  const dots: DottedMapResult["dots"] = [];

  for (let row = 0; row < rows; row++) {
    // сдвиг чётных строк на полшага — гексагональная упаковка, край не «лесенкой»
    const rowShift = row % 2 === 1 ? cellW / 2 : 0;

    for (let col = 0; col <= cols; col++) {
      const px = offsetX + col * cellW + rowShift;
      if (px > width - padding) continue;
      const py = offsetY + (row + 0.5) * cellH;

      const lng = invLng((px - offsetX) / scale + minX);
      const lat = invLat(maxY - (py - offsetY) / scale);

      if (lng < -180 || lng > 180 || lat < LAT_MIN || lat > LAT_MAX) continue;
      if (!features.some((feature) => pointInCountry(lng, lat, feature.r))) continue;

      dots.push({ x: px, y: py, row });
    }
  }

  const result = { dots, xStep: cellW, width, height };
  cache.set(key, result);
  return result;
}

/** Проекция произвольной точки (для маркеров городов) — та же математика, что в сэмплинге. */
export function projectPoint(
  lng: number,
  lat: number,
  features: Feature[],
  width = 150,
  height = 75,
  padding = 2,
): Point {
  const { minX, maxX, minY, maxY } = featureBounds(features);
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const scale = Math.min(innerW / (maxX - minX), innerH / (maxY - minY));
  const offsetX = padding + (innerW - (maxX - minX) * scale) / 2;
  const offsetY = padding + (innerH - (maxY - minY) * scale) / 2;

  return {
    x: offsetX + (mercX(lng) - minX) * scale,
    y: offsetY + (maxY - mercY(Math.max(LAT_MIN, Math.min(LAT_MAX, lat)))) * scale,
  };
}
