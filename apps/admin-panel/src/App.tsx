import { RouterProvider } from '@tanstack/react-router';
import { ConfigProvider } from 'antd';
import { router } from '@/router';
import { appTheme } from '@/theme';
import "./index.css";

export function App() {
  return (
    <ConfigProvider theme={appTheme}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
