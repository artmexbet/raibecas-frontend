export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface ChatLaunchContext {
  documentId?: string;
  documentTitle?: string;
  quoteText?: string;
  context?: string;
  pageLabel?: string;
}

export interface ChatRouteState extends ChatLaunchContext {
  sessionId?: string;
}

function normalizeSearchValue(value: string | null): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export function readChatRouteState(search: string = window.location.search): ChatRouteState {
  const params = new URLSearchParams(search);

  return {
    sessionId: normalizeSearchValue(params.get('sessionId')),
    documentId: normalizeSearchValue(params.get('documentId')),
    documentTitle: normalizeSearchValue(params.get('documentTitle')),
    quoteText: normalizeSearchValue(params.get('quoteText')),
    context: normalizeSearchValue(params.get('context')),
    pageLabel: normalizeSearchValue(params.get('pageLabel')),
  };
}

export function hasChatLaunchContext(state: ChatLaunchContext): boolean {
  return Boolean(state.documentId || state.documentTitle || state.quoteText || state.context || state.pageLabel);
}

export function buildPromptFromLaunchContext(state: ChatLaunchContext): string {
  const parts = [
    state.documentTitle ? `Работа: ${state.documentTitle}` : null,
    state.pageLabel ? `Страница: ${state.pageLabel}` : null,
    state.quoteText ? `Фрагмент: «${state.quoteText}»` : null,
    state.context ? `Контекст: ${state.context}` : null,
  ].filter(Boolean);

  return parts.join('\n');
}

export function replaceChatRouteState(state: ChatRouteState): void {
  const url = new URL(window.location.href);

  const nextValues: Record<keyof ChatRouteState, string | undefined> = {
    sessionId: state.sessionId,
    documentId: state.documentId,
    documentTitle: state.documentTitle,
    quoteText: state.quoteText,
    context: state.context,
    pageLabel: state.pageLabel,
  };

  (Object.entries(nextValues) as Array<[keyof ChatRouteState, string | undefined]>).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  });

  const nextSearch = url.searchParams.toString();
  const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ''}${url.hash}`;
  window.history.replaceState(window.history.state, '', nextUrl);
}
