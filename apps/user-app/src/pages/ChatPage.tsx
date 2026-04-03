import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { Alert, Button, theme } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { AppLayout } from '@/layouts/AppLayout';
import { authService } from '@/services/auth.service';
import type { ChatMessage, ChatRouteState } from '@/types/chat';
import {
  buildPromptFromLaunchContext,
  hasChatLaunchContext,
  readChatRouteState,
} from '@/types/chat';
import useChatSessions from '@/features/chat/hooks/useChatSessions';
import useChatWebSocket from '@/features/chat/hooks/useChatWebSocket';
import { ChatSessionsSidebar } from '@/features/chat/components/ChatSessionsSidebar';
import { ChatLaunchContextAlert } from '@/features/chat/components/ChatLaunchContextAlert';
import { ChatComposer } from '@/features/chat/components/ChatComposer';
import { MessageBubble } from '@/features/chat/components/MessageBubble';
import { ChatEmptyState } from '@/features/chat/components/ChatEmptyState';
import '@/features/chat/chat-page.css';

function getChatPageStyles(token: ReturnType<typeof theme.useToken>['token']): CSSProperties {
  return {
    ['--chat-text-primary' as string]: token.colorText,
    ['--chat-text-secondary' as string]: token.colorTextSecondary,
    ['--chat-placeholder' as string]: token.colorTextTertiary,
    ['--chat-border' as string]: token.colorBorderSecondary,
    ['--chat-divider' as string]: token.colorSplit,
    ['--chat-sidebar-bg' as string]: token.colorBgChatSidebar,
    ['--chat-surface-strong' as string]: token.colorBgChatSurface,
    ['--chat-composer-bg' as string]: token.colorBgChatComposer,
    ['--chat-chip-bg' as string]: token.colorBgChatChip,
    ['--chat-chip-bg-hover' as string]: token.colorBgChatChipHover,
    ['--chat-bubble-user' as string]: token.colorBgChatBubbleUser,
    ['--chat-bubble-user-border' as string]: token.colorBorderChatBubbleUser,
    ['--chat-bubble-assistant' as string]: token.colorBgChatBubbleAssistant,
    ['--chat-shadow-soft' as string]: token.boxShadowChatSoft,
  };
}

export function ChatPage() {
  const storedUser = authService.getStoredUser();
  const userID = storedUser?.id ?? null;
  const initialRouteState = useMemo<ChatRouteState>(() => readChatRouteState(), []);
  const launchContextPrompt = useMemo(
    () => buildPromptFromLaunchContext(initialRouteState),
    [initialRouteState],
  );
  const hasLaunchContext = useMemo(
    () => hasChatLaunchContext(initialRouteState),
    [initialRouteState],
  );

  const [streamingContent, setStreamingContent] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const { token } = theme.useToken();
  const {
    sessions,
    activeSessionId,
    activeSession,
    messages,
    loadingSessions,
    creatingSession,
    sessionsError,
    setSessionsError,
    selectSession,
    createSession,
    replaceMessages,
  } = useChatSessions({ userID, initialRouteState });
  const { isConnected, isStreaming, sendMessage, reconnect } = useChatWebSocket(userID);

  const chatPageStyles = useMemo(() => getChatPageStyles(token), [token]);
  const allMessages = streamingContent
    ? [...messages, { role: 'assistant', content: streamingContent } satisfies ChatMessage]
    : messages;
  const canManageSessions = !isStreaming;
  const canCreateSessions = Boolean(userID) && canManageSessions;
  const canSendMessage = Boolean(userID) && isConnected && !isStreaming;
  const showSidebar = loadingSessions || sessions.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  useEffect(() => {
    setStreamingContent('');
    setSendError(null);
  }, [activeSessionId]);

  const handleCreateSession = useCallback(async () => {
    if (!canCreateSessions) {
      return null;
    }

    return createSession();
  }, [canCreateSessions, createSession]);

  const handleSelectSession = useCallback(
    (sessionID: string) => {
      if (!canManageSessions) {
        return;
      }

      selectSession(sessionID);
    },
    [canManageSessions, selectSession],
  );

  const handleAppendLaunchContext = useCallback(() => {
    if (!launchContextPrompt) {
      return;
    }

    setInputValue((prev) => (prev.trim() ? `${prev.trim()}\n\n${launchContextPrompt}` : launchContextPrompt));
  }, [launchContextPrompt]);

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || !canSendMessage) {
      return;
    }

    let targetSessionId: string | null = activeSessionId || null;

    if (!targetSessionId) {
      if (!canCreateSessions) {
        return;
      }

      targetSessionId = await createSession();

      if (!targetSessionId) {
        setSendError('Не удалось создать новый чат для отправки сообщения');
        return;
      }
    }

    if (!targetSessionId) {
      return;
    }

    const previousMessages = [...messages];
    const userMessage: ChatMessage = { role: 'user', content: text };
    const baseMessages = [...previousMessages, userMessage];

    replaceMessages(baseMessages, targetSessionId);
    setInputValue('');
    setStreamingContent('');
    setSendError(null);

    let accumulated = '';

    try {
      await sendMessage(
        text,
        targetSessionId,
        (chunk: { done: boolean; message?: { role: string; content: string } }) => {
          if (chunk.message?.content) {
            accumulated += chunk.message.content;
            setStreamingContent(accumulated);
          }

          if (chunk.done) {
            const assistantMessage: ChatMessage = {
              role: 'assistant',
              content: accumulated,
            };
            const finalizedMessages = [...baseMessages, assistantMessage];

            replaceMessages(finalizedMessages, targetSessionId);
            setStreamingContent('');
          }
        },
      );
    } catch (error) {
      replaceMessages(previousMessages, targetSessionId);
      setInputValue(text);
      setSendError(error instanceof Error ? error.message : 'Не удалось отправить сообщение');
      setStreamingContent('');
    }
  }, [
    activeSessionId,
    canCreateSessions,
    canSendMessage,
    createSession,
    inputValue,
    messages,
    replaceMessages,
    sendMessage,
  ]);

  return (
    <AppLayout
      hideFooter
      contentMaxWidth={1680}
      contentPadding="20px 24px 24px"
      headerProps={{ showSearch: false }}
    >
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>

      <div className="chat-page" style={chatPageStyles}>
        <div className="chat-page__alerts">
          {!userID ? (
            <Alert
              type="warning"
              showIcon
              title="Не удалось определить пользователя"
              description="Перезайдите в приложение, чтобы открыть чат и загрузить ваши сессии."
            />
          ) : null}

          {!isConnected && userID ? (
            <Alert
              type="warning"
              showIcon
              title="Чат временно недоступен"
              description="Пробуем переподключиться к серверу. Если соединение не восстановится, повторите попытку вручную."
              action={
                <Button type="text" icon={<ReloadOutlined />} onClick={reconnect}>
                  Переподключиться
                </Button>
              }
            />
          ) : null}

          {sessionsError ? (
            <Alert
              type="error"
              showIcon
              title="Ошибка чата"
              description={sessionsError}
              closable={{ onClose: () => setSessionsError(null) }}
            />
          ) : null}
        </div>

        <div className={`chat-page__layout${showSidebar ? ' chat-page__layout--with-sidebar' : ''}`}>
          {showSidebar ? (
            <div className="chat-page__sidebar-shell">
              <ChatSessionsSidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                loadingSessions={loadingSessions}
                creatingSession={creatingSession}
                canManageSessions={canManageSessions}
                canCreateSessions={canCreateSessions}
                hasLaunchContext={hasLaunchContext}
                onCreateSession={() => void handleCreateSession()}
                onSelectSession={handleSelectSession}
              />
            </div>
          ) : null}

          <section className="chat-page__main">
            <div className={`chat-page__conversation${!activeSession ? ' chat-page__conversation--empty' : ''}`}>
              {hasLaunchContext ? (
                <div className="chat-page__context">
                  <ChatLaunchContextAlert
                    routeState={initialRouteState}
                    onAppendContext={handleAppendLaunchContext}
                  />
                </div>
              ) : null}

              {activeSession ? (
                <div className="chat-page__messages">
                  {allMessages.length === 0 ? (
                    <ChatEmptyState />
                  ) : (
                    allMessages.map((msg: ChatMessage, index: number) => (
                      <MessageBubble
                        key={`${msg.role}-${index}-${msg.content.slice(0, 16)}`}
                        msg={msg}
                        streaming={isStreaming && index === allMessages.length - 1 && msg.role === 'assistant'}
                      />
                    ))
                  )}

                  <div ref={bottomRef} />
                </div>
              ) : (
                <ChatEmptyState />
              )}

              {sendError ? (
                <div className="chat-page__send-error">
                  <Alert
                    type="error"
                    showIcon
                    title="Сообщение не отправлено"
                    description={sendError}
                    closable={{ onClose: () => setSendError(null) }}
                  />
                </div>
              ) : null}

              <div className={`chat-page__composer-wrap${!activeSession ? ' chat-page__composer-wrap--empty' : ''}`}>
                <ChatComposer
                  inputValue={inputValue}
                  isConnected={isConnected}
                  isStreaming={isStreaming}
                  hasActiveSession={Boolean(activeSessionId)}
                  canSendMessage={canSendMessage}
                  creatingSession={creatingSession}
                  onInputChange={setInputValue}
                  onSend={() => void handleSend()}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}





