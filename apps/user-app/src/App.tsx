import { RouterProvider } from '@tanstack/react-router';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { router } from '@/router';
import { ThemeProvider, useTheme } from '@/theme/ThemeContext';
import { getThemeConfig } from '@/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import './index.css';

dayjs.locale('ru');

function ThemedApp() {
  const { mode } = useTheme();
  const themeConfig = getThemeConfig(mode);

  return (
    <ConfigProvider theme={themeConfig} locale={ruRU}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ConfigProvider>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

export default App;
