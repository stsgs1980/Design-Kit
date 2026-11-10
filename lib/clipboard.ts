/**
 * Копирование текста в буфер обмена.
 *
 * Помощник один на три места: панель экспорта кита, паспорт компонента и
 * паспорт паттерна. Раньше запасной путь через textarea дублировался в каждом
 * файле, а «буфера нет» передавалось исключением, пойманным рядом.
 */

/**
 * Скопировать текст в буфер обмена.
 *
 * Сначала — Clipboard API. Если его нет или браузер отказал (песочница
 * превью, iframe без разрешения на буфер), — запасной путь через
 * `execCommand`: он устарел, но работает там, где новый API недоступен.
 * @param text текст для копирования
 * @returns true, если текст оказался в буфере
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // буфер запрещён (iframe без разрешения) — уходим в запасной путь
  }

  return copyViaTextarea(text);
}

/**
 * Запасной путь: скрытая textarea и команда `copy`.
 *
 * textarea нужна, потому что команда копирует выделение, а выделить текст
 * без видимого поля нельзя.
 * @param text текст для копирования
 * @returns true, если команда отработала
 */
function copyViaTextarea(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(area);

  return copied;
}
