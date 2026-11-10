#!/usr/bin/env node

/**
 * Живость ссылок «источник».
 *
 * Гейт не входит в `verify:all`: он ходит в интернет, а сборка должна быть
 * воспроизводимой без сети. Запускается отдельно — перед сдачей итерации или
 * при правке источников.
 *
 * Проверяем не «страница открылась», а `response.status()`: у Next-приложений
 * несуществующий маршрут отдаёт 404, а редирект на главную — 200, поэтому
 * только статус конечного ответа отличает настоящий источник от заглушки.
 */

import { readFileSync, readdirSync } from "node:fs";

const DIRS = ["lib/kit/entries", "lib/patterns/entries"];
const TIMEOUT_MS = 20000;
const CONCURRENCY = 5;

/**
 * Ссылки на источники из манифестов.
 * @returns {{ url: string, where: string }[]} пары «адрес — где объявлен»
 */
function sources() {
  const found = [];

  for (const dir of DIRS) {
    for (const file of readdirSync(dir).filter((name) => name.endsWith(".ts"))) {
      const text = readFileSync(`${dir}/${file}`, "utf8");
      const ids = [...text.matchAll(/^ {4}id: "([a-z0-9-]+)",/gm)];

      for (const [index, match] of ids.entries()) {
        const block = text.slice(match.index, index + 1 < ids.length ? ids[index + 1].index : text.length);
        const url = block.match(/source: "([^"]+)"/)?.[1];

        if (url) {
          found.push({ url, where: `${dir}/${file}:${match[1]}` });
        }
      }
    }
  }

  return found;
}

/**
 * Статус адреса без скачивания тела.
 * @param {string} url - адрес
 * @returns {Promise<number>} HTTP-статус или 0 при сетевой ошибке
 */
async function status(url) {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "design-kit-link-check" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    // Тело не нужно: закрываем поток, чтобы не тянуть мегабайты документации.
    await response.body?.cancel();

    return response.status;
  } catch {
    return 0;
  }
}

const list = sources();
const results = [];

for (let index = 0; index < list.length; index += CONCURRENCY) {
  const batch = list.slice(index, index + CONCURRENCY);
  const statuses = await Promise.all(batch.map((item) => status(item.url)));
  batch.forEach((item, position) => results.push({ ...item, code: statuses[position] }));
  process.stdout.write(`проверено ${Math.min(index + CONCURRENCY, list.length)} из ${list.length}\n`);
}

const broken = results.filter((item) => item.code !== 200);

for (const item of broken) {
  process.stderr.write(`[FAIL] ${item.code || "сеть"} ${item.url} — ${item.where}\n`);
}

if (broken.length > 0) {
  process.stderr.write(`[FAIL] verify-links: битых ссылок ${broken.length} из ${results.length}.\n`);
  process.exit(1);
}

process.stdout.write(`[OK] verify-links: все ${results.length} источников отвечают 200.\n`);
