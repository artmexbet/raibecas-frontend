import { Grid } from 'antd';

/**
 * Возвращает true, если ширина экрана меньше breakpoint `md` (768px).
 * До первого измерения считается десктопом, чтобы избежать вспышки мобильной вёрстки.
 */
export function useIsMobile(): boolean {
  const screens = Grid.useBreakpoint();
  return screens.md === false;
}
