import { kitStats } from "@/lib/kit/manifest";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import type { ReactElement } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Design Kit — справочник по компонентам: что это, куда ставить, как применить",
  description: `${kitStats().total} компонента с паспортами: что делает, куда ставить, с чем сочетать, сколько стоит в килобайтах. ${kitStats().surfaces} мест, три готовых набора и матрица «техника × цена».`,
};

/** Корневой layout: шрифты, тема из cookie, глобальная разметка. */
export default async function RootLayout({ children }: { children: React.ReactNode }): Promise<ReactElement> {
  /**
   * Тема приходит из cookie и по умолчанию тёмная.
   *
   * Раньше по умолчанию была системная тема: без cookie класс на <html> не
   * ставился, и `light-dark()` брал настройку ОС. В превью-cookie не доходит,
   * поэтому переход с главной на стену перекрашивал страницу в светлую.
   * Теперь сервер всегда отдаёт явный класс.
   */
  const stored = (await cookies()).get("theme")?.value;
  const theme = stored === "light" ? "light" : "dark";

  return (
    /* suppressHydrationWarning: загрузочный скрипт ниже меняет класс на <html>
       до гидрации (cookie в песочнице превью не доходит). React сверяет
       атрибуты <html> со своей разметкой и увидел бы расхождение — поэтому
       здесь побеждает DOM, как и рекомендует Next.js для тем. */
    <html lang="ru" className={theme} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} overflow-x-hidden font-sans antialiased`}>
        {/* Тема из localStorage до первой отрисовки: cookie в песочнице превью
            не доходит, и без этой строки страница мигала бы светлой.

            Скрипт трогает только класс: color-scheme берётся из него же
            (CSS .light/.dark в globals.css). Инлайновый style на <html> здесь
            ломал гидрацию — React видел атрибут, которого нет в его разметке,
            и перерисовывал дерево. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){var r=document.documentElement;r.classList.toggle("dark",t==="dark");r.classList.toggle("light",t==="light");}}catch(e){}})();',
          }}
        />
        {children}
      </body>
    </html>
  );
}
