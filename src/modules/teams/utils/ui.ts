/* Classes visuais da tela (selos e botões de cabeçalho), só deste módulo. */

export const BADGE_BASE =
  'inline-flex w-fit items-center rounded-[6px] px-[8px] py-[2px] text-[11.5px] leading-[16px] font-medium whitespace-nowrap'

export const BADGE = {
  neutral:
    'bg-(--bg-muted) text-(--text-secondary) dark:bg-white/10 dark:text-(--text-inverse-muted)',
  success: 'bg-[#e4f4ea] text-[#127a3e] dark:bg-[#127a3e]/25 dark:text-[#7ed9a2]',
  warning: 'bg-[#fdf1dc] text-[#a35a00] dark:bg-[#d97706]/20 dark:text-[#f5b14c]',
  danger: 'bg-[#fde8e8] text-[#c42b2b] dark:bg-[#dc2626]/20 dark:text-[#ff8a8a]',
  info: 'bg-[#e8efff] text-[#2563eb] dark:bg-[#2563eb]/20 dark:text-[#8fb1ff]',
  accent: 'bg-[#fff1e6] text-[#e2560b] dark:bg-[#ff6700]/15 dark:text-[#ff8a4c]',
  ink: 'bg-(--text-primary) text-white dark:bg-(--text-inverse) dark:text-(--text-primary)',
  outline:
    'border border-(--border-default) text-(--text-secondary) dark:border-(--border-inverse) dark:text-(--text-inverse-muted)',
  dashed:
    'border border-dashed border-(--text-muted) text-(--text-secondary) dark:text-(--text-inverse-muted)',
} as const

export type BadgeTone = keyof typeof BADGE

// ajusta o BaseButton do shared ao tamanho dos botões de cabeçalho do design
export const TOOLBAR_BUTTON =
  'mt-0! h-[40px]! rounded-[10px]! px-[16px]! py-0! text-[13.5px]! font-medium! [&_.material-symbols-outlined]:text-[17px]!'
