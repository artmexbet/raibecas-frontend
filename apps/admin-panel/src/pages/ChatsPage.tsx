import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Empty,
  Flex,
  Input,
  List,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  LoadingOutlined,
  PlusOutlined,
  RobotOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { chatService, type ChatMessage, type ChatSession } from '@/services/chat.service';
import { authService } from '@/services/auth.service';
import { PageHeader } from '@/components';
import { CHAT_WS_BASE_URL } from '@/constants/api';

const { Text } = Typography;
const { TextArea } = Input;

const WS_BASE_URL = CHAT_WS_BASE_URL;

/* ------------------------------------------------------------------ */
/* Hoisted formatters (js-hoist-regexp / avoid re-creation per render)  */
/* ------------------------------------------------------------------ */

const SESSION_DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const formatSessionLabel = (s: ChatSession): string =>
  s.title?.trim() || `Чат от ${SESSION_DATE_FORMATTER.format(new Date(s.created_at))}`;

/* ------------------------------------------------------------------ */
/* Domain types                                                        */
/* ------------------------------------------------------------------ */

interface ConversationItem {
  key: string;
  label: string;
}

interface StreamChunk {
  done: boolean;
  message?: { role: string; content: string };
  error?: string;
  type?: string;
}

/* ------------------------------------------------------------------ */
/* Local hook: conversation list                                       */
/* ------------------------------------------------------------------ */

function useConversations() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeKey, setActiveKey] = useState<string>('');

  const replaceConversations = useCallback((convs: ConversationItem[]) => {
    setConversations(convs);
  }, []);

  const addConversation = useCallback(
    (conv: ConversationItem, placement: 'prepend' | 'append' = 'prepend') => {
      setConversations((prev) =>
        placement === 'prepend' ? [conv, ...prev] : [...prev, conv],
      );
    },
    [],
  );

  const promoteConversation = useCallback((key: string, label?: string) => {
    setConversations((prev) => {
      const existing = prev.find((item) => item.key === key);
      const nextItem: ConversationItem = existing ?? { key, label: label ?? 'Чат' };
      const remaining = prev.filter((item) => item.key !== key);
      return [
        {
          ...nextItem,
          label: label ?? nextItem.label,
        },
        ...remaining,
      ];
    });
  }, []);

  return {
    conversations,
    activeKey,
    setActiveKey,
    replaceConversations,
    addConversation,
    promoteConversation,
  };
}

/* ------------------------------------------------------------------ */
/* Local hook: WebSocket chat                                          */
/* ------------------------------------------------------------------ */

function useChatWS(userID: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const connect = useCallback(() => {
    if (!userID) return;

    wsRef.current?.close();

    const token = authService.getAccessToken();
    if (!token) {
      setIsConnected(false);
      return;
    }

    const params = new URLSearchParams();
    params.set('token', token);

    const ws = new WebSocket(`${WS_BASE_URL}/${userID}?${params.toString()}`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => {
      setIsConnected(false);
      setIsStreaming(false);
    };
    ws.onerror = () => {
      setIsConnected(false);
      setIsStreaming(false);
    };
  }, [userID]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback(
    (
      input: string,
      sessionID: string | null,
      onChunk: (chunk: StreamChunk) => void,
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          reject(new Error('WebSocket не подключён'));
          return;
        }

        setIsStreaming(true);

        const handleMessage = (event: MessageEvent) => {
          try {
            const chunk: StreamChunk = JSON.parse(event.data as string);
            if (chunk.error || chunk.type === 'error') {
              ws.removeEventListener('message', handleMessage);
              setIsStreaming(false);
              reject(new Error(chunk.error ?? 'Ошибка чата'));
              return;
            }
            onChunk(chunk);
            if (chunk.done) {
              ws.removeEventListener('message', handleMessage);
              setIsStreaming(false);
              resolve();
            }
          } catch {
            /* ignore parse errors */
          }
        };

        ws.addEventListener('message', handleMessage);
        ws.send(JSON.stringify({ user_id: userID, session_id: sessionID ?? undefined, input }));
      });
    },
    [userID],
  );

  return { isConnected, isStreaming, sendMessage, reconnect: connect };
}

/* ------------------------------------------------------------------ */
/* MessageBubble                                                       */
/* ------------------------------------------------------------------ */

const BUBBLE_BASE: React.CSSProperties = {
  maxWidth: '72%',
  padding: '12px 16px',
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
  position: 'relative',
  fontSize: 14,
  lineHeight: 1.6,
};

const MessageBubble = memo(function MessageBubble({
  msg,
  streaming,
}: {
  msg: ChatMessage;
  streaming?: boolean;
}) {
  const isUser = msg.role === 'user';

  return (
    <Flex
      gap={10}
      align="flex-start"
      justify={isUser ? 'flex-end' : 'flex-start'}
      style={{ marginBottom: 14 }}
    >
      {!isUser && (
        <Avatar
          icon={streaming ? <LoadingOutlined /> : <RobotOutlined />}
          style={{
            background: 'var(--ink-800)',
            color: 'var(--paper)',
            flexShrink: 0,
            boxShadow: 'var(--shadow-xs)',
          }}
        />
      )}
      <div
        style={{
          ...BUBBLE_BASE,
          borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
          background: isUser ? 'var(--ink-800)' : 'var(--surface)',
          color: isUser ? 'var(--paper-soft)' : 'var(--ink-800)',
          border: isUser ? 'none' : '1px solid var(--hairline)',
          boxShadow: isUser ? '0 2px 8px rgba(22, 35, 61, 0.14)' : 'var(--shadow-xs)',
          fontFamily: 'var(--font-body)',
        }}
      >
        {!isUser && (
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 11,
              color: 'var(--ochre-deep)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            ассистент
          </div>
        )}
        <Text
          style={{
            color: isUser ? 'var(--paper-soft)' : 'var(--ink-800)',
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          {msg.content}
        </Text>
        {streaming && (
          <span
            style={{
              display: 'inline-block',
              width: 6,
              height: 14,
              background: 'var(--ochre)',
              marginLeft: 4,
              animation: 'blink 1s step-start infinite',
              verticalAlign: 'text-bottom',
              borderRadius: 1,
            }}
          />
        )}
      </div>
      {isUser && (
        <Avatar
          icon={<UserOutlined />}
          style={{
            background: 'var(--paper-deep)',
            color: 'var(--ink-800)',
            border: '1px solid var(--hairline-strong)',
            flexShrink: 0,
          }}
        />
      )}
    </Flex>
  );
});

/* ------------------------------------------------------------------ */
/* SessionListItem                                                     */
/* ------------------------------------------------------------------ */

const SessionListItem = memo(function SessionListItem({
  item,
  active,
  onSelect,
}: {
  item: ConversationItem;
  active: boolean;
  onSelect: (key: string) => void;
}) {
  const handleClick = useCallback(() => onSelect(item.key), [item.key, onSelect]);
  return (
    <List.Item
      onClick={handleClick}
      style={{
        padding: '12px 18px',
        cursor: 'pointer',
        background: active ? 'var(--paper-deep)' : 'transparent',
        borderLeft: active ? '3px solid var(--ochre)' : '3px solid transparent',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--ink-400)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 2,
          }}
        >
          {item.key.slice(0, 8)}
        </div>
        <Text
          ellipsis
          strong={active}
          style={{
            color: active ? 'var(--ink-900)' : 'var(--ink-700)',
            fontFamily: active ? 'var(--font-display)' : 'var(--font-body)',
            fontSize: 14,
          }}
          title={item.label}
        >
          {item.label}
        </Text>
      </div>
    </List.Item>
  );
});

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export function ChatsPage() {
  const storedAdmin = authService.getStoredAdmin();
  const adminID = storedAdmin?.id ?? null;

  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [sessionsMap, setSessionsMap] = useState<Record<string, ChatSession>>({});
  const {
    conversations,
    activeKey,
    setActiveKey,
    replaceConversations,
    addConversation,
    promoteConversation,
  } = useConversations();

  const { isConnected, isStreaming, sendMessage, reconnect } = useChatWS(adminID);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState<string>('');

  const [inputValue, setInputValue] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const selectSession = useCallback(
    (key: string, map?: Record<string, ChatSession>) => {
      setActiveKey(key);
      setStreamingContent('');
      setSendError(null);
      const session = (map ?? sessionsMap)[key];
      setMessages(session?.messages ?? []);
    },
    [setActiveKey, sessionsMap],
  );

  const loadSessions = useCallback(async () => {
    if (!adminID) return;
    setLoadingSessions(true);
    setSessionsError(null);
    try {
      const sessions = await chatService.getUserSessions(adminID);
      const convData: ConversationItem[] = sessions.map((s) => ({
        key: s.id,
        label: formatSessionLabel(s),
      }));
      replaceConversations(convData);

      const map: Record<string, ChatSession> = {};
      for (let i = 0; i < sessions.length; i++) {
        const s = sessions[i]!;
        map[s.id] = s;
      }
      setSessionsMap(map);

      if (convData.length > 0 && !activeKey) {
        selectSession(convData[0]!.key, map);
      }
    } catch (e: unknown) {
      setSessionsError(e instanceof Error ? e.message : 'Ошибка загрузки сессий');
    } finally {
      setLoadingSessions(false);
    }
  }, [adminID, replaceConversations, activeKey, selectSession]);

  useEffect(() => {
    if (!adminID) return;
    loadSessions();
    /* intentionally run on adminID only */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminID]);

  const handleCreateSession = useCallback(async () => {
    if (!adminID) return;
    try {
      const sessionID = await chatService.createSession(adminID, 'Новый чат');
      const newConv: ConversationItem = { key: sessionID, label: 'Новый чат' };
      addConversation(newConv, 'prepend');
      setSessionsMap((prev) => ({
        ...prev,
        [sessionID]: {
          id: sessionID,
          user_id: adminID,
          title: 'Новый чат',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          messages: [],
        },
      }));
      selectSession(sessionID);
    } catch (e: unknown) {
      setSessionsError(e instanceof Error ? e.message : 'Ошибка создания сессии');
    }
  }, [adminID, addConversation, selectSession]);

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isStreaming || !isConnected) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const baseMessages = [...messages, userMsg];
    setMessages(baseMessages);
    setSessionsMap((prev) =>
      activeKey
        ? {
            ...prev,
            [activeKey]: {
              ...prev[activeKey]!,
              messages: baseMessages,
              updated_at: new Date().toISOString(),
            },
          }
        : prev,
    );
    setInputValue('');
    setStreamingContent('');
    setSendError(null);

    let accumulated = '';
    try {
      await sendMessage(text, activeKey || null, (chunk) => {
        if (chunk.message?.content) {
          accumulated += chunk.message.content;
          setStreamingContent(accumulated);
        }
        if (chunk.done) {
          const assistantMsg: ChatMessage = { role: 'assistant', content: accumulated };
          const finalMessages = [...baseMessages, assistantMsg];
          setMessages(finalMessages);
          setSessionsMap((prev) =>
            activeKey
              ? {
                  ...prev,
                  [activeKey]: {
                    ...prev[activeKey]!,
                    messages: finalMessages,
                    updated_at: new Date().toISOString(),
                  },
                }
              : prev,
          );
          if (activeKey) {
            promoteConversation(activeKey, sessionsMap[activeKey]?.title || 'Чат');
          }
          setStreamingContent('');
        }
      });
    } catch (e: unknown) {
      setSendError(e instanceof Error ? e.message : 'Ошибка отправки сообщения');
      setStreamingContent('');
    }
  }, [
    inputValue,
    isStreaming,
    isConnected,
    messages,
    activeKey,
    sendMessage,
    promoteConversation,
    sessionsMap,
  ]);

  const handleSelectSession = useCallback(
    (key: string) => {
      selectSession(key);
    },
    [selectSession],
  );

  const handleCloseSessionError = useCallback(() => setSessionsError(null), []);
  const handleCloseSendError = useCallback(() => setSendError(null), []);
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value),
    [],
  );
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const allMessages: ChatMessage[] = useMemo(
    () =>
      streamingContent
        ? [...messages, { role: 'assistant' as const, content: streamingContent }]
        : messages,
    [messages, streamingContent],
  );

  const activeSessionTitle = activeKey ? sessionsMap[activeKey]?.title || 'Чат' : '';

  return (
    <>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <PageHeader
          eyebrow="Диалоги"
          title="Чат с моделью"
          description="Переписка с научным ассистентом. История сохраняется по сессиям."
          actions={
            adminID && (
              <Flex gap={10} align="center">
                <Tag
                  style={{
                    padding: '4px 12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    borderRadius: 4,
                    background: isConnected ? 'var(--forest-soft)' : 'var(--burgundy-soft)',
                    color: isConnected ? 'var(--forest)' : 'var(--burgundy)',
                    border: `1px solid ${
                      isConnected ? 'var(--forest)' : 'var(--burgundy)'
                    }`,
                  }}
                >
                  {isConnected ? '● подключён' : '○ не подключён'}
                </Tag>
                {!isConnected && (
                  <Button size="middle" onClick={reconnect}>
                    Переподключиться
                  </Button>
                )}
              </Flex>
            )
          }
        />

        {!adminID && (
          <Alert
            type="warning"
            description="Не удалось определить ID администратора. Пожалуйста, войдите в систему."
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {sessionsError && (
          <Alert
            type="error"
            description={sessionsError}
            showIcon
            closable={{ onClose: handleCloseSessionError }}
            style={{ marginBottom: 12 }}
          />
        )}

        {adminID && (
          <Flex
            gap={0}
            style={{
              flex: 1,
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              minHeight: 0,
              background: 'var(--surface)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* ---- Left: session list ---- */}
            <div
              style={{
                width: 280,
                borderRight: '1px solid var(--hairline)',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                background: 'var(--paper-soft)',
              }}
            >
              <Flex
                justify="space-between"
                align="center"
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--hairline)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--ink-400)',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Архив
                  </div>
                  <Text
                    strong
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      fontSize: 16,
                      color: 'var(--ink-800)',
                    }}
                  >
                    Сессии
                  </Text>
                </div>
                <Tooltip title="Создать новый чат">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="small"
                    onClick={handleCreateSession}
                    disabled={!adminID}
                  />
                </Tooltip>
              </Flex>

              {loadingSessions ? (
                <Flex justify="center" align="center" style={{ flex: 1 }}>
                  <Spin />
                </Flex>
              ) : conversations.length === 0 ? (
                <Flex justify="center" align="center" style={{ flex: 1, padding: 18 }}>
                  <Empty
                    description={
                      <span style={{ color: 'var(--ink-500)', fontSize: 13 }}>
                        Нет сессий. Создайте первый чат.
                      </span>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </Flex>
              ) : (
                <div style={{ flex: 1, overflow: 'auto' }}>
                  <List
                    dataSource={conversations}
                    renderItem={(item) => (
                      <SessionListItem
                        item={item}
                        active={item.key === activeKey}
                        onSelect={handleSelectSession}
                      />
                    )}
                    split={false}
                  />
                </div>
              )}
            </div>

            {/* ---- Right: chat area ---- */}
            <Flex vertical style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              {activeKey ? (
                <>
                  <Flex
                    justify="space-between"
                    align="center"
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid var(--hairline)',
                      flexShrink: 0,
                      background: 'var(--surface-muted)',
                    }}
                  >
                    <div>
                      <Text
                        strong
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 15,
                          color: 'var(--ink-900)',
                        }}
                      >
                        {activeSessionTitle}
                      </Text>
                      <Tag
                        style={{
                          marginLeft: 10,
                          background: 'var(--paper-deep)',
                          color: 'var(--ink-700)',
                          borderColor: 'var(--hairline-strong)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                        }}
                      >
                        {allMessages.length} сообщ.
                      </Tag>
                    </div>
                    <Tooltip title="ID сессии">
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 11,
                          fontFamily: 'var(--font-mono)',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {activeKey.slice(0, 8)}…
                      </Text>
                    </Tooltip>
                  </Flex>

                  <div
                    style={{
                      flex: 1,
                      overflow: 'auto',
                      padding: '20px 24px',
                      background:
                        'linear-gradient(180deg, var(--paper-soft) 0%, var(--surface) 120px)',
                    }}
                  >
                    {allMessages.length === 0 && !isStreaming ? (
                      <Flex justify="center" align="center" style={{ height: '100%' }}>
                        <Empty
                          description={
                            <span
                              style={{
                                fontFamily: 'var(--font-display)',
                                fontStyle: 'italic',
                                color: 'var(--ink-500)',
                                fontSize: 14,
                              }}
                            >
                              Отправьте первое сообщение
                            </span>
                          }
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      </Flex>
                    ) : (
                      allMessages.map((msg, idx) => (
                        <MessageBubble
                          key={idx}
                          msg={msg}
                          streaming={
                            isStreaming &&
                            idx === allMessages.length - 1 &&
                            msg.role === 'assistant'
                          }
                        />
                      ))
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {sendError && (
                    <Alert
                      type="error"
                      description={sendError}
                      showIcon
                      closable={{ onClose: handleCloseSendError }}
                      style={{ margin: '0 20px 8px' }}
                    />
                  )}

                  <div
                    style={{
                      padding: '14px 20px',
                      borderTop: '1px solid var(--hairline)',
                      flexShrink: 0,
                      background: 'var(--surface)',
                    }}
                  >
                    <Flex gap={10} align="flex-end">
                      <TextArea
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={
                          isConnected
                            ? 'Введите сообщение… (Enter — отправить, Shift+Enter — новая строка)'
                            : 'Подключение к модели…'
                        }
                        autoSize={{ minRows: 1, maxRows: 5 }}
                        disabled={!isConnected || isStreaming}
                        style={{ flex: 1 }}
                      />
                      <Button
                        type="primary"
                        icon={isStreaming ? <LoadingOutlined /> : <SendOutlined />}
                        onClick={handleSend}
                        disabled={!isConnected || isStreaming || !inputValue.trim()}
                        title="Отправить (Enter)"
                      />
                    </Flex>
                  </div>
                </>
              ) : (
                <Flex justify="center" align="center" style={{ flex: 1 }}>
                  <Empty
                    description={
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontStyle: 'italic',
                          color: 'var(--ink-500)',
                          fontSize: 14,
                        }}
                      >
                        Выберите или создайте сессию
                      </span>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </Flex>
              )}
            </Flex>
          </Flex>
        )}
      </div>
    </>
  );
}
