import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Empty, Flex, Tag, Typography, theme } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { Link } from '@tanstack/react-router';
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
import chatFormat from '@/features/chat/lib/chat-format';

const { Title, Text } = Typography;

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
    latestSessionId,
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

  const canManageSessions = !isStreaming;
  const canCreateSessions = Boolean(userID) && canManageSessions;
  const allMessages = streamingContent
    ? [...messages, { role: 'assistant', content: streamingContent } satisfies ChatMessage]
    : messages;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  useEffect(() => {
    setStreamingContent('');
    setSendError(null);
  }, [activeSessionId]);

  const handleCreateSession = useCallback(async () => {
    if (!canCreateSessions) {
      return;
    }

    await createSession();
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
    if (!text || !isConnected || isStreaming || !activeSessionId) {
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: text };
    const baseMessages = [...messages, userMessage];

    replaceMessages(baseMessages, activeSessionId);
    setInputValue('');
    setStreamingContent('');
    setSendError(null);

    let accumulated = '';

    try {
      await sendMessage(
        text,
        activeSessionId,
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

          replaceMessages(finalizedMessages, activeSessionId);
          setStreamingContent('');
        }
        },
      );
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'Не удалось отправить сообщение');
      setStreamingContent('');
    }
  }, [
    activeSessionId,
    inputValue,
    isConnected,
    isStreaming,
    messages,
    replaceMessages,
    sendMessage,
  ]);

  return (
    <AppLayout>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>

      <Flex vertical gap={20}>
        <Flex justify="space-between" align="flex-start" gap={16} wrap>
          <div>
            <Link to="/catalog">
              <Button icon={<ArrowLeftOutlined />} type="text" style={{ paddingInline: 0, marginBottom: 8 }}>
                Назад к каталогу
              </Button>
            </Link>

            <Title level={2} style={{ margin: 0 }}>
              Чат с библиотекой
            </Title>
            <Text type="secondary">
              Создавайте отдельные диалоги и возвращайтесь к уже начатым обсуждениям.
            </Text>
          </div>

          <Flex gap={8} wrap align="center">
            <Tag color={isConnected ? 'success' : 'error'} style={{ marginInlineEnd: 0 }}>
              {isConnected ? '● чат подключён' : '○ чат не подключён'}
            </Tag>

            {!isConnected && userID ? (
              <Button onClick={reconnect}>Переподключиться</Button>
            ) : null}

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => void handleCreateSession()}
              loading={creatingSession}
              disabled={!canCreateSessions}
            >
              Новый чат
            </Button>
          </Flex>
        </Flex>

        {!userID ? (
          <Alert
            type="warning"
            showIcon
            title="Не удалось определить пользователя"
            description="Перезайдите в приложение, чтобы открыть чат и загрузить ваши сессии."
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

        <div
          style={{
            borderRadius: 28,
            overflow: 'hidden',
            border: `1px solid ${token.colorBorderSecondary}`,
            background: 'rgba(255,255,255,0.82)',
            boxShadow: token.boxShadowSecondary,
            minHeight: 620,
          }}
        >
          <Flex style={{ minHeight: 620 }}>
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
              borderColor={token.colorBorderSecondary}
            />

            <Flex vertical style={{ flex: 1, minWidth: 0 }}>
              {activeSession ? (
                <>
                  <Flex
                    justify="space-between"
                    align="center"
                    gap={12}
                    wrap
                    style={{
                      padding: '18px 20px',
                      borderBottom: `1px solid ${token.colorBorderSecondary}`,
                      background: 'rgba(255,255,255,0.72)',
                    }}
                  >
                    <div>
                      <Text strong style={{ display: 'block', fontSize: 16 }}>
                        {chatFormat.formatSessionLabel(activeSession)}
                      </Text>
                      <Text type="secondary">
                        {allMessages.length} сообщ. · ID {activeSession.id.slice(0, 8)}…
                      </Text>
                    </div>

                    <Tag color={latestSessionId === activeSessionId ? 'success' : 'processing'} style={{ marginInlineEnd: 0 }}>
                      {latestSessionId === activeSessionId ? 'актуальный чат' : 'выбранный чат'}
                    </Tag>
                  </Flex>

                  {hasLaunchContext ? (
                    <ChatLaunchContextAlert
                      routeState={initialRouteState}
                      onAppendContext={handleAppendLaunchContext}
                    />
                  ) : null}

                  <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
                    {allMessages.length === 0 ? (
                      <Flex justify="center" align="center" style={{ height: '100%' }}>
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            hasLaunchContext
                              ? 'Контекст готов. Сформулируйте первый вопрос к библиотеке.'
                              : 'Задайте первый вопрос, чтобы начать диалог.'
                          }
                        />
                      </Flex>
                    ) : (
                      allMessages.map((msg: ChatMessage, index: number) => (
                        <MessageBubble
                          key={`${msg.role}-${index}-${msg.content.slice(0, 16)}`}
                          msg={msg}
                          streaming={
                            isStreaming &&
                            index === allMessages.length - 1 &&
                            msg.role === 'assistant'
                          }
                        />
                      ))
                    )}

                    <div ref={bottomRef} />
                  </div>

                  {sendError ? (
                    <Alert
                      type="error"
                      showIcon
                      title="Сообщение не отправлено"
                      description={sendError}
                      closable={{ onClose: () => setSendError(null) }}
                      style={{ margin: '0 16px 12px' }}
                    />
                  ) : null}

                  <ChatComposer
                    inputValue={inputValue}
                    isConnected={isConnected}
                    isStreaming={isStreaming}
                    hasActiveSession={Boolean(activeSessionId)}
                    borderColor={token.colorBorderSecondary}
                    onInputChange={setInputValue}
                    onSend={() => void handleSend()}
                  />
                </>
              ) : (
                <Flex justify="center" align="center" style={{ flex: 1, padding: 32 }}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Выберите чат слева или создайте новый диалог"
                  >
                    <Button
                      type="primary"
                      onClick={() => void handleCreateSession()}
                      loading={creatingSession}
                      disabled={!canCreateSessions}
                    >
                      Создать чат
                    </Button>
                  </Empty>
                </Flex>
              )}
            </Flex>
          </Flex>
        </div>
      </Flex>
    </AppLayout>
  );
}





