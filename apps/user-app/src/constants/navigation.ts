import {
  BookOutlined,
  EditOutlined,
  FolderOutlined,
  MessageOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { NavItem } from '@/components/common/NavBar';

/** Маппинг ключ навигации → путь роутера */
export const NAV_ROUTES: Record<string, string> = {
  catalog: '/catalog',
  search: '/search',
  bookmarks: '/bookmarks',
  notes: '/notes',
  settings: '/settings',
  help: '/chat',
};

/** Пункты нижней навигации для мобильной вёрстки */
export const mobileNavItems: NavItem[] = [
  { key: 'catalog', icon: FolderOutlined, label: 'Каталог' },
  { key: 'bookmarks', icon: BookOutlined, label: 'Закладки' },
  { key: 'help', icon: MessageOutlined, label: 'AI Чат' },
  { key: 'notes', icon: EditOutlined, label: 'Заметки' },
  { key: 'settings', icon: SettingOutlined, label: 'Настройки' },
];
