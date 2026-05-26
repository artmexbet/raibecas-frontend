import { createRouter, createRoute, createRootRoute, redirect, Outlet } from '@tanstack/react-router';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { CatalogPage } from '@/pages/CatalogPage';
import { BookmarksPage } from '@/pages/BookmarksPage';
import { NotesPage } from '@/pages/NotesPage';
import { NoteCreatePage } from '@/pages/NoteCreatePage';
import { NoteViewPage } from '@/pages/NoteViewPage';
import { NoteEditPage } from '@/pages/NoteEditPage';
import { DocumentViewPage } from '@/pages/DocumentViewPage';
import { ChatPage } from '../pages/ChatPage';
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

const bookmarksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bookmarks',
  component: BookmarksPage,
  beforeLoad: () => {
    if (!authService.isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
});

const notesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notes',
  component: NotesPage,
  beforeLoad: () => {
    if (!authService.isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
});

const noteCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notes/create',
  component: NoteCreatePage,
  beforeLoad: () => {
    if (!authService.isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
});

const noteViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notes/$id',
  component: NoteViewPage,
  beforeLoad: () => {
    if (!authService.isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
});

const noteEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notes/$id/edit',
  component: NoteEditPage,
  beforeLoad: () => {
    if (!authService.isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat',
  component: ChatPage,
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
  bookmarksRoute,
  notesRoute,
  noteCreateRoute,
  noteViewRoute,
  noteEditRoute,
  chatRoute,
  documentViewRoute,
  settingsRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

