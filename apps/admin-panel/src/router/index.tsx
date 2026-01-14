import { createRouter, createRoute, createRootRoute, redirect, Outlet } from '@tanstack/react-router';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DocumentListPage } from '@/pages/DocumentListPage';
import { DocumentViewPage } from '../pages/DocumentViewPage';
import { DocumentEditPage } from '../pages/DocumentEditPage';
import { UserRequestsListPage } from "@/pages/UserRequestsListPage.tsx";
import { AdminLayout } from '../layouts/AdminLayout';
import { authService } from '../services/auth.service';
import { ProtectedRoute } from '@/components';
import {DocumentCreatePage} from "@/pages/DocumentCreatePage.tsx";
import {UsersListPage} from "../pages/UsersListPage.tsx";

// Корневой маршрут
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Маршрут логина
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: () => {
    // Если уже авторизован, редиректим на главную
    if (authService.isAuthenticated()) {
      throw redirect({ to: '/' });
    }
  },
});

// Главная страница (Dashboard)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <ProtectedRoute requireAuth>
      <AdminLayout>
        <DashboardPage />
      </AdminLayout>
    </ProtectedRoute>
  ),
  beforeLoad: () => {
    // Если не авторизован, редиректим на логин
    if (!authService.isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
});

// Документы
const documentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/documents',
  component: () => (
    <ProtectedRoute requireAuth permissions={['view_documents']}>
      <AdminLayout>
        <DocumentListPage />
      </AdminLayout>
    </ProtectedRoute>
  ),
  beforeLoad: () => {
    if (!authService.isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
});

// Создание нового документа
const documentCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/documents/new',
  component: () => (
    <ProtectedRoute requireAuth permissions={['edit_documents']}>
      <AdminLayout>
        <DocumentCreatePage />
      </AdminLayout>
    </ProtectedRoute>
  ),
  beforeLoad: () => {
    if (!authService.isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
});

// Просмотр документа
const documentViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/documents/$id',
  component: () => (
    <ProtectedRoute requireAuth permissions={['view_documents']}>
      <AdminLayout>
        <DocumentViewPage />
      </AdminLayout>
    </ProtectedRoute>
  ),
  beforeLoad: () => {
    if (!authService.isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
});

// Редактирование документа
const documentEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/documents/$id/edit',
  component: () => (
    <ProtectedRoute requireAuth permissions={['edit_documents']}>
      <AdminLayout>
        <DocumentEditPage />
      </AdminLayout>
    </ProtectedRoute>
  ),
  beforeLoad: () => {
    if (!authService.isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
});

// Заявки на регистрацию
const registrationRequestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/registration-requests',
  component: () => (
    <ProtectedRoute requireAuth permissions={['view_registration_requests']}>
      <AdminLayout>
        <UserRequestsListPage/>
      </AdminLayout>
    </ProtectedRoute>
  ),
  beforeLoad: () => {
    if (!authService.isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
});

// Пользователи
const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: () => (
    <ProtectedRoute requireAuth permissions={['view_users']}>
      <AdminLayout>
        <UsersListPage />
      </AdminLayout>
    </ProtectedRoute>
  ),
  beforeLoad: () => {
    if (!authService.isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
});

// Настройки (только для супер-админа)
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => (
    <ProtectedRoute requireAuth permissions={['manage_settings']}>
      <AdminLayout>
        <div>
          <h1>Настройки</h1>
          <p>Страница в разработке</p>
          <p>Доступна только для супер-администратора</p>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  ),
  beforeLoad: () => {
    if (!authService.isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
});

// Создаем дерево маршрутов
const routeTree = rootRoute.addChildren([
  loginRoute,
  indexRoute,
  documentsRoute,
  documentCreateRoute,
  documentViewRoute,
  documentEditRoute,
  registrationRequestsRoute,
  usersRoute,
  settingsRoute,
]);

// Создаем и экспортируем роутер
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

// Типы для TypeScript
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

