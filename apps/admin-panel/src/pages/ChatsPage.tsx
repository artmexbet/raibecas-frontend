import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Typography,
  Input,
  Button,
  Spin,
  Empty,
  Flex,
  Alert,
  List,
  Tag,
  Avatar,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SendOutlined,
  UserOutlined,
  RobotOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { chatService, type ChatSession, type ChatMessage } from '@/services/chat.service';
import { authService } from '@/services/auth.service';

const { Title, Text } = Typography;
const { TextArea } = Input;

const WS_BASE_URL = 'ws://localhost:8080/ws/chat';

// ---------- domain types ----------

interface ConversationItem {
  key: string;
  label: string;
}

interface StreamChunk {
  done: boolean;
  message?: { role: string; content: string };
}

// ---------- local hook: conversation list ----------

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

  return { conversations, activeKey, setActiveKey, replaceConversations, addConversation };
}

// ---------- local hook: WebSocket chat ----------

function useChatWS(userID: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Функция подключения — читает токен в момент вызова, а не при рендере
  const connect = useCallback(() => {
    if (!userID) return;

    wsRef.current?.close();

    // Берём токен в момент подключения, а не из замыкания рендера
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
    ws.onclose = () => { setIsConnected(false); setIsStreaming(false); };
    ws.onerror = () => { setIsConnected(false); setIsStreaming(false); };
  }, [userID]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback(
    (input: string, onChunk: (chunk: StreamChunk) => void): Promise<void> => {
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
            onChunk(chunk);
            if (chunk.done) {
              ws.removeEventListener('message', handleMessage);
              setIsStreaming(false);
              resolve();
            }
          } catch {
            // ignore parse errors
          }
        };

        ws.addEventListener('message', handleMessage);

        ws.send(
          JSON.stringify({ user_id: userID, input }),
        );
      });
    },
    [userID],
  );

  return { isConnected, isStreaming, sendMessage, reconnect: connect };
}

// ---------- MessageBubble ----------

function MessageBubble({ msg, streaming }: { msg: ChatMessage; streaming?: boolean }) {
  const isUser = msg.role === 'user';
  return (
    <Flex
      gap={8}
      align="flex-start"
      justify={isUser ? 'flex-end' : 'flex-start'}
      style={{ marginBottom: 12 }}
    >
      {!isUser && (
        <Avatar
          icon={streaming ? <LoadingOutlined /> : <RobotOutlined />}
          style={{ background: '#1677ff', flexShrink: 0 }}
        />
      )}
      <div
        style={{
          maxWidth: '72%',
          padding: '8px 14px',
          borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
          background: isUser ? '#1677ff' : '#f5f5f5',
          color: isUser ? '#fff' : 'inherit',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <Text style={{ color: isUser ? '#fff' : 'inherit' }}>{msg.content}</Text>
        {streaming && (
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 16,
              background: '#1677ff',
              marginLeft: 2,
              animation: 'blink 1s step-start infinite',
              verticalAlign: 'text-bottom',
              borderRadius: 2,
            }}
          />
        )}
      </div>
      {isUser && (
        <Avatar icon={<UserOutlined />} style={{ background: '#52c41a', flexShrink: 0 }} />
      )}
    </Flex>
  );
}

// ---------- main page ----------

export function ChatsPage() {
  // Current admin (used as userID for WebSocket)
  const storedAdmin = authService.getStoredAdmin();
  const adminID = storedAdmin?.id ?? null;

  // Sessions / conversations
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [sessionsMap, setSessionsMap] = useState<Record<string, ChatSession>>({});
  const { conversations, activeKey, setActiveKey, replaceConversations, addConversation } =
    useConversations();

  // Chat WebSocket
  const { isConnected, isStreaming, sendMessage, reconnect } = useChatWS(adminID);

  // Current chat messages (local buffer + backend history)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState<string>('');

  // Input
  const [inputValue, setInputValue] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);

  // Auto-scroll ref
  const bottomRef = useRef<HTMLDivElement>(null);

  // ---------- load sessions ----------
  useEffect(() => {
    if (!adminID) return;
    loadSessions();
  }, [adminID]);

  async function loadSessions() {
    if (!adminID) return;
    setLoadingSessions(true);
    setSessionsError(null);
    try {
      const sessions = await chatService.getUserSessions(adminID);
      const convData: ConversationItem[] = sessions.map((s) => ({
        key: s.id,
        label: s.title || `Чат от ${new Date(s.created_at).toLocaleDateString()}`,
      }));
      replaceConversations(convData);

      const map: Record<string, ChatSession> = {};
      sessions.forEach((s) => (map[s.id] = s));
      setSessionsMap(map);

      if (convData.length > 0 && !activeKey) {
        selectSession(convData[0]!.key, map);
      }
    } catch (e: unknown) {
      setSessionsError(e instanceof Error ? e.message : 'Ошибка загрузки сессий');
    } finally {
      setLoadingSessions(false);
    }
  }

  function selectSession(key: string, map?: Record<string, ChatSession>) {
    setActiveKey(key);
    setStreamingContent('');
    setSendError(null);
    const session = (map ?? sessionsMap)[key];
    setMessages(session?.messages ?? []);
  }

  // ---------- create session ----------
  async function handleCreateSession() {
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
  }

  // ---------- send message ----------
  async function handleSend() {
    const text = inputValue.trim();
    if (!text || isStreaming || !isConnected) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setStreamingContent('');
    setSendError(null);

    let accumulated = '';
    try {
      await sendMessage(text, (chunk) => {
        if (chunk.message?.content) {
          accumulated += chunk.message.content;
          setStreamingContent(accumulated);
        }
        if (chunk.done) {
          const assistantMsg: ChatMessage = { role: 'assistant', content: accumulated };
          setMessages((prev) => [...prev, assistantMsg]);
          setStreamingContent('');
        }
      });
    } catch (e: unknown) {
      setSendError(e instanceof Error ? e.message : 'Ошибка отправки сообщения');
      setStreamingContent('');
    }
  }

  // ---------- auto-scroll ----------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // ---------- render ----------
  const allMessages: ChatMessage[] = streamingContent
    ? [...messages, { role: 'assistant', content: streamingContent }]
    : messages;

  return (
    <>
      {/* Blink animation */}
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>

      <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
          <Title level={2} style={{ margin: 0 }}>
            Чат с моделью
          </Title>
          {adminID && (
            <Flex gap={8} align="center">
              <Tag color={isConnected ? 'success' : 'error'} style={{ fontSize: 13 }}>
                {isConnected ? '● подключён' : '○ не подключён'}
              </Tag>
              {!isConnected && (
                <Button size="small" onClick={reconnect}>
                  Переподключиться
                </Button>
              )}
            </Flex>
          )}
        </Flex>

        {!adminID && (
          <Alert
            type="warning"
            description="Не удалось определить ID администратора. Пожалуйста, войдите в систему."
            showIcon
          />
        )}

        {sessionsError && (
          <Alert
            type="error"
            description={sessionsError}
            showIcon
            closable={{ onClose: () => setSessionsError(null) }}
            style={{ marginBottom: 12 }}
          />
        )}

        {adminID && (
          <Flex
            gap={0}
            style={{
              flex: 1,
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              overflow: 'hidden',
              minHeight: 0,
            }}
          >
            {/* ---- Left: session list ---- */}
            <div
              style={{
                width: 260,
                borderRight: '1px solid #f0f0f0',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
              }}
            >
              <Flex
                justify="space-between"
                align="center"
                style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}
              >
                <Text strong>Сессии</Text>
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
                <Flex justify="center" align="center" style={{ flex: 1, padding: 16 }}>
                  <Empty
                    description="Нет сессий. Создайте первый чат."
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </Flex>
              ) : (
                <div style={{ flex: 1, overflow: 'auto' }}>
                  <List
                    dataSource={conversations}
                    renderItem={(item) => (
                      <List.Item
                        onClick={() => selectSession(item.key)}
                        style={{
                          padding: '10px 16px',
                          cursor: 'pointer',
                          background: item.key === activeKey ? '#e6f4ff' : 'transparent',
                          borderLeft:
                            item.key === activeKey
                              ? '3px solid #1677ff'
                              : '3px solid transparent',
                          transition: 'background 0.2s',
                        }}
                      >
                        <Text
                          ellipsis
                          strong={item.key === activeKey}
                          style={{ flex: 1 }}
                          title={item.label}
                        >
                          {item.label}
                        </Text>
                      </List.Item>
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
                  {/* Header */}
                  <Flex
                    justify="space-between"
                    align="center"
                    style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}
                  >
                    <div>
                      <Text strong>
                        {sessionsMap[activeKey]?.title || 'Чат'}
                      </Text>
                      <Tag color="blue" style={{ marginLeft: 8 }}>
                        {allMessages.length} сообщ.
                      </Tag>
                    </div>
                    <Tooltip title="ID сессии">
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {activeKey.slice(0, 8)}…
                      </Text>
                    </Tooltip>
                  </Flex>

                  {/* Messages */}
                  <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
                    {allMessages.length === 0 && !isStreaming ? (
                      <Flex justify="center" align="center" style={{ height: '100%' }}>
                        <Empty
                          description="Отправьте первое сообщение"
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

                  {/* Send error */}
                  {sendError && (
                    <Alert
                      type="error"
                      description={sendError}
                      showIcon
                      closable={{ onClose: () => setSendError(null) }}
                      style={{ margin: '0 16px 8px' }}
                    />
                  )}

                  {/* Input */}
                  <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
                    <Flex gap={8} align="flex-end">
                      <TextArea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
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
                    description="Выберите или создайте сессию"
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

