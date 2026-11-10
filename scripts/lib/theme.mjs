/**
 * Тема для прогонов: по умолчанию приложение тёмное, поэтому `colorScheme` в
 * контексте Playwright больше ни на что не влияет.
 *
 * Светлую тему приходится заказывать явно — cookie для сервера и localStorage
 * для песочницы, где cookie не сохраняется между страницами. Раньше хватало
 * `colorScheme`, и после смены умолчания прогоны обеих тем молча стали тёмными.
 *
 * @param context контекст Playwright
 * @param theme тема прогона
 * @returns {Promise<void>} ничего
 */
export async function applyTheme(context, theme) {
  await context.addCookies([
    { name: "theme", value: theme, domain: "127.0.0.1", path: "/" },
    { name: "theme", value: theme, domain: "localhost", path: "/" },
  ]);
  await context.addInitScript((value) => {
    try {
      localStorage.setItem("theme", value);
    } catch {
      // песочница без localStorage: остаётся cookie
    }
  }, theme);
}
