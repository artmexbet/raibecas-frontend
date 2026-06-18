# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies (run from root)
bun install

# Start user-app in dev mode
cd apps/user-app && bun run dev

# Start admin-panel in dev mode
cd apps/admin-panel && bun run dev

# Build user-app for production
cd apps/user-app && bun run build

# Build admin-panel for production
cd apps/admin-panel && bun run build

# Validate admin-panel Swagger spec
cd apps/admin-panel && bun run docs:validate
```

## Architecture

Bun workspace monorepo with two independent React 19 applications:

```
apps/
  user-app/    — end-user app (catalog, chat, bookmarks, notes, search)
  admin-panel/ — admin app (document management, user/request management)
```

Both apps share the same dependency stack but are entirely separate builds — no shared `packages/` currently.

## Stack

- **Routing:** TanStack Router (`@tanstack/react-router`) — file-based `beforeLoad` guards for auth redirects
- **UI:** Ant Design v6 (`antd`) + `@ant-design/icons`
- **HTTP:** Axios with interceptors for auto token-refresh
- **Runtime/bundler:** Bun (no webpack/vite)

## Auth Flow

Both apps use the same JWT token pattern:
- Access token stored in `localStorage` via `tokenManager` singleton
- Refresh token in HttpOnly cookie (managed by backend)
- Axios response interceptor in `src/services/api.ts` handles 401 → refresh → retry automatically
- On refresh failure: clears token and redirects to `/login`

`authService.isAuthenticated()` checks for a non-null access token in localStorage — used in every route's `beforeLoad`.

## user-app Routes

`/catalog` → `/documents/$id` → `/bookmarks` → `/notes` (CRUD) → `/chat` → `/search?q=` → `/settings`

Document view supports `?highlight=` query param for search result highlighting.

## admin-panel Routes

`/` (dashboard) → `/documents` (list/view/edit/create) → `/registration-requests` → `/users` → `/chats` → `/settings`

Routes use `PermissionGuard` / `ProtectedRoute` with permission strings like `view_documents`, `edit_documents`, `manage_settings`.

## admin-panel Document Editor

Documents are edited with **Editor.js** (blocks: header, list, code, table, quote, marker, checklist, etc.). Conversion to/from Markdown is handled in `src/utils/editorjsMarkdown.ts`.

## Theming (user-app)

`ThemeProvider` in `src/theme/ThemeContext.tsx` sets `data-theme` attribute on `<html>`. CSS variables drive light/dark mode. Ant Design theme tokens are configured in `src/theme/index.ts`.

## API Base URL

Configured via `BUN_PUBLIC_*` env vars (see `.env` in each app). The `src/constants/api.ts` file exports `API_BASE_URL`. The backend gateway is the sole API endpoint.
