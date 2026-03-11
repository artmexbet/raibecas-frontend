import { createRouter, createRoute, createRootRoute, redirect, Outlet } from '@tanstack/react-router';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { CatalogPage } from '@/pages/CatalogPage';
import { DocumentViewPage } from '@/pages/DocumentViewPage';
import { SettingsPage } from '../pages/SettingsPage';
import { authService } from '@/services/auth.service';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/catalog' });
  },
  component: () => null,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: () => {
    if (authService.isAuthenticated()) {
      throw redirect({ to: '/catalog' });
    }
  },
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
  beforeLoad: () => {
    if (authService.isAuthenticated()) {
      throw redirect({ to: '/catalog' });
    }
  },
});


const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/catalog',
  component: CatalogPage,
  beforeLoad: () => {
    if (!authService.isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
});

const documentViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/documents/$id',
  component: DocumentViewPage,
  beforeLoad: () => {
    if (!authService.isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
  beforeLoad: () => {
    if (!authService.isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  catalogRoute,
  documentViewRoute,
  settingsRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

