import { cn } from './cn';

/** Fade/slide labels in when the rail expands (hover-capable desktop only). */
export function expandOnHover(className) {
  return cn(
    'overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-200 ease-out',
    'max-md:max-w-[14rem] max-md:opacity-100',
    'md:max-w-0 md:opacity-0',
    'md:[@media(hover:hover)_and_(pointer:fine)]:group-hover/sidebar:max-w-[14rem]',
    'md:[@media(hover:hover)_and_(pointer:fine)]:group-hover/sidebar:opacity-100',
    className,
  );
}

/** Main column offset when the fixed peer rail expands on hover. */
export function railMainOffset(variant = 'default') {
  if (variant === 'admin') {
    return cn(
      'md:pl-16',
      'md:[@media(hover:hover)_and_(pointer:fine)]:peer-hover/sidebar:pl-72',
    );
  }
  return cn(
    'md:pl-16',
    'md:[@media(hover:hover)_and_(pointer:fine)]:peer-hover/sidebar:pl-64',
  );
}

/** Fixed collapsible rail: icon-only on md+, full labels on hover; drawer on mobile. */
export function railAsideClass({ mobileOpen, surfaceClass, expandedWidth }) {
  return cn(
    'group/sidebar peer/sidebar fixed inset-y-0 left-0 z-[100] flex flex-col overflow-hidden border-r',
    surfaceClass,
    'transition-[width,transform,box-shadow] duration-200 ease-out',
    'w-[min(100%,288px)]',
    mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
    'md:translate-x-0 md:shadow-lg',
    'md:[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-xl',
    'md:w-16',
    expandedWidth ?? 'md:[@media(hover:hover)_and_(pointer:fine)]:hover:w-64',
  );
}

export const RAIL_LINK = {
  base: cn(
    'relative flex min-h-[44px] items-center rounded-xl border border-transparent text-sm font-semibold transition-all wg-focus-ring',
    'max-md:gap-3 max-md:px-3 max-md:py-2.5',
    'md:justify-center md:gap-0 md:px-0 md:py-2.5',
    'md:[@media(hover:hover)_and_(pointer:fine)]:group-hover/sidebar:justify-start',
    'md:[@media(hover:hover)_and_(pointer:fine)]:group-hover/sidebar:gap-3',
    'md:[@media(hover:hover)_and_(pointer:fine)]:group-hover/sidebar:px-3',
  ),
  activeBar: cn(
    'absolute bottom-2 top-2 w-1 rounded-full bg-gradient-to-b from-cyan-400 to-cyan-600 shadow-[0_0_12px_rgba(6,182,212,0.45)]',
    'max-md:left-1 md:hidden',
    'md:[@media(hover:hover)_and_(pointer:fine)]:group-hover/sidebar:block',
    'md:[@media(hover:hover)_and_(pointer:fine)]:group-hover/sidebar:left-1',
  ),
};

export const RAIL_BRAND_ROW = cn(
  'max-md:px-5 md:justify-center md:px-2',
  'md:[@media(hover:hover)_and_(pointer:fine)]:group-hover/sidebar:justify-start',
  'md:[@media(hover:hover)_and_(pointer:fine)]:group-hover/sidebar:px-5',
);

export const RAIL_NAV_PAD = cn(
  'max-md:p-4 md:px-2',
  'md:[@media(hover:hover)_and_(pointer:fine)]:group-hover/sidebar:px-4',
);

export const RAIL_FOOTER = cn(
  'hidden shrink-0 max-md:block',
  'md:[@media(hover:hover)_and_(pointer:fine)]:group-hover/sidebar:block',
);
