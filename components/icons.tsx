import type { SVGProps } from "react";

type Icon = (props: SVGProps<SVGSVGElement>) => React.ReactElement;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

/** Стрелка вправо. */
export const ArrowRight: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

/** Галочка готовности. */
export const Check: Icon = (props) => (
  <svg {...base} strokeWidth={2.5} {...props}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/** Вращающийся индикатор загрузки. */
export const Loader2: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

/** Плюс для маркеров сетки. */
export const Plus: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

/** Глобус: карта мира. */
export const Globe: Icon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

/** Список: дерево файлов. */
export const ListIcon: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 5h.01" />
    <path d="M3 12h.01" />
    <path d="M3 19h.01" />
    <path d="M8 5h13" />
    <path d="M8 12h13" />
    <path d="M8 19h13" />
  </svg>
);

/** Шеврон вверх: раскрытие блока. */
export const ChevronUp: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="m18 15-6-6-6 6" />
  </svg>
);

/** Луна: тёмная тема. */
export const Moon: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
  </svg>
);

/** Солнце: светлая тема. */
export const Sun: Icon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

/** «Стопка» из бейджа героя */
export const StackedIcons: Icon = (props) => (
  <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
    <path d="M7.63 1.1a.75.75 0 0 1 .74 0l5.25 3a.75.75 0 0 1 0 1.3l-5.25 3a.75.75 0 0 1-.74 0l-5.25-3a.75.75 0 0 1 0-1.3l5.25-3Z" />
    <path d="M2.57 7.24 2.38 7.35a.75.75 0 0 0 0 1.3l5.25 3a.75.75 0 0 0 .74 0l5.25-3a.75.75 0 0 0 0-1.3l-.19-.11-4.31 2.46a1.75 1.75 0 0 1-1.74 0L2.57 7.24Z" />
    <path d="m2.38 10.6-.01.01a.75.75 0 0 0 0 1.3l5.25 3a.75.75 0 0 0 .74 0l5.25-3a.75.75 0 0 0 0-1.3l-.19-.11-4.31 2.46a1.75 1.75 0 0 1-1.74 0L2.38 10.6Z" />
  </svg>
);

/** Иконка «scale» из badge-плашки секций */
export const ScaleIcon: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 21V9l6-3v15" />
    <path d="M9 21V3l6 3v15" />
    <path d="M15 21V11l6 3v7" />
  </svg>
);

/** Кавычка для отзывов. */
export const QuoteIcon: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 4h3v3a2 2 0 0 1-2 2H4V4Z" />
    <path d="M11 4h3v3a2 2 0 0 1-2 2h-1V4Z" />
  </svg>
);

/** Логотип проекта. */
export const Logo: Icon = (props) => (
  <svg viewBox="0 0 32 32" fill="none" {...props}>
    <rect width="32" height="32" rx="8" fill="url(#logo-g)" />
    <path
      d="M13.2 10.5 8.9 16l4.3 5.5M18.8 10.5 23.1 16l-4.3 5.5"
      stroke="white"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="logo-g" x1="0" y1="0" x2="32" y2="32">
        <stop stopColor="#2cd5ff" />
        <stop offset="1" stopColor="#2c30ff" />
      </linearGradient>
    </defs>
  </svg>
);

/** Ветка репозитория: интеграции с Git-хостингами. */
export const GitBranch: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M6 3v12" />
    <circle cx="6" cy="18" r="2.6" />
    <circle cx="18" cy="6" r="2.6" />
    <path d="M18 8.6a9 9 0 0 1-9 9" />
  </svg>
);

/** Чат: уведомления в мессенджеры. */
export const Chat: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M20 12a7.5 7.5 0 0 1-11 6.6L4.5 20l1.4-4.2A7.5 7.5 0 1 1 20 12Z" />
    <path d="M9 11.5h6M9 14.5h3.5" />
  </svg>
);

/** Документ: интеграции с базами знаний. */
export const FileText: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M13.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z" />
    <path d="M13.5 3.5V9H19" />
    <path d="M8.5 13h7M8.5 16.5h4.5" />
  </svg>
);

/** Рамка холста: интеграции с макетами. */
export const Frame: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M8 3v18M16 3v18M3 8h18M3 16h18" />
  </svg>
);

/** Ошибка: трекеры сбоев. */
export const Bug: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M8 3l1.8 1.8M16 3l-1.8 1.8" />
    <path d="M9 7.5v-.7a3 3 0 0 1 6 0v.7" />
    <path d="M12 20.5c-3 0-5.5-2.5-5.5-5.5v-2.5A3.5 3.5 0 0 1 10 9h4a3.5 3.5 0 0 1 3.5 3.5V15c0 3-2.5 5.5-5.5 5.5Z" />
    <path d="M12 20.5V13" />
    <path d="M6.5 13H3M21 13h-3.5M7.5 19.5 4 22M16.5 19.5 20 22M7 9.5 3.5 7M17 9.5 20.5 7" />
  </svg>
);

/** Ракета: деплой. */
export const Deploy: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1Z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-4A13 13 0 0 1 22 2c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2Z" />
    <path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5" />
  </svg>
);
