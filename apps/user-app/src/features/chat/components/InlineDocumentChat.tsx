import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Alert, Button, Input, Typography, theme } from 'antd';
import type { TextAreaRef } from 'antd/es/input/TextArea';
import {
  ArrowRightOutlined,
  LeftOutlined,
  LoadingOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import type { ChatMessage } from '@/types/chat';
import { chatService } from '@/services/chat.service';
import { authService } from '@/services/auth.service';
import useChatWebSocket, { type StreamChunk } from '@/features/chat/hooks/useChatWebSocket';
import { MessageBubble } from '@/features/chat/components/MessageBubble';
import { getChatThemeVars } from '@/features/chat/lib/chat-theme';
import '@/features/chat/chat-page.css';
import '@/features/chat/inline-document-chat.css';

const { TextArea } = Input;
const { Text } = Typography;

interface InlineDocumentChatProps {
  documentId: string;
  documentTitle: string;
  /** When true the panel is collapsed (kept mounted to preserve the conversation). */
  hidden?: boolean;
  /** Collapse the inline panel (text becomes full width). */
  onHide: () => void;
}

export interface InlineDocumentChatHandle {
  /** Append text to the composer input and focus it. */
  appendContext: (text: string) => void;
}

/**
 * Compact inline RAG chat shown next to a document's text. Reuses the existing
 * chat backend: it streams responses over the same WebSocket hook used by the
 * full chat page and lazily creates a chat session on the first message. The
 * "open fully" action hands the conversation off to `/chat` (with the document
 * launch context and the created session id) so it continues seamlessly there.
 */
export const InlineDocumentChat = forwardRef<InlineDocumentChatHandle, InlineDocumentChatProps>(
  function InlineDocumentChat({ documentId, documentTitle, hidden = false, onHide }, ref) {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const userID = authService.getStoredUser()?.id ?? null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const sessionIdRef = useRef('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<TextAreaRef>(null);

  useImperativeHandle(ref, () => ({
    appendContext: (text: string) => {
      setInputValue((prev) => (prev.trim() ? `${prev.trim()}\n\n${text}` : text));
      textAreaRef.current?.focus();
    },
  }));

  const { isConnected, isStreaming, sendMessage } = useChatWebSocket(userID);

  const chatVars = useMemo(() => getChatThemeVars(token), [token]);
  const allMessages = streamingContent
    ? [...messages, { role: 'assistant', content: streamingContent } satisfies ChatMessage]
    : messages;
  const canSend = Boolean(userID) && isConnected && !isStreaming;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  const handleOpenFull = useCallback(() => {
    const params = new URLSearchParams({ documentId, documentTitle });
    if (sessionIdRef.current) {
      params.set('sessionId', sessionIdRef.current);
    }

    navigate({ to: `/chat?${params.toString()}` });
  }, [documentId, documentTitle, navigate]);

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || !canSend || !userID) {
      return;
    }

    let sessionId = sessionIdRef.current;
    if (!sessionId) {
      try {
        sessionId = await chatService.createSession(userID, documentTitle || 'Новый чат');
        sessionIdRef.current = sessionId;
      } catch {
        setSendError('Не удалось создать чат для этого документа');
        return;
      }
    }

    const previousMessages = messages;
    const baseMessages = [...previousMessages, { role: 'user', content: text } satisfies ChatMessage];
    setMessages(baseMessages);
    setInputValue('');
    setStreamingContent('');
    setSendError(null);

    let accumulated = '';

    try {
      await sendMessage(text, sessionId, (chunk: StreamChunk) => {
        if (chunk.message?.content) {
          accumulated += chunk.message.content;
          setStreamingContent(accumulated);
        }

        if (chunk.done) {
          setMessages([...baseMessages, { role: 'assistant', content: accumulated } satisfies ChatMessage]);
          setStreamingContent('');
        }
      });
    } catch (error) {
      setMessages(previousMessages);
      setInputValue(text);
      setSendError(error instanceof Error ? error.message : 'Не удалось отправить сообщение');
      setStreamingContent('');
    }
  }, [canSend, documentTitle, inputValue, messages, sendMessage, userID]);

  return (
    <aside className="doc-chat" style={{ ...chatVars, display: hidden ? 'none' : undefined }}>
      <div className="doc-chat__header">
        <Button
          type="text"
          size="small"
          className="doc-chat__header-btn"
          icon={<LeftOutlined />}
          onClick={onHide}
        >
          Скрыть чат
        </Button>
        <Button
          type="text"
          size="small"
          className="doc-chat__header-btn"
          onClick={handleOpenFull}
        >
          Открыть чат полностью <RightOutlined />
        </Button>
      </div>

      {!isConnected && userID ? (
        <Alert
          type="warning"
          showIcon
          title="Подключаемся к чату…"
        />
      ) : null}

      <div className="doc-chat__messages">
        {allMessages.length === 0 ? (
          <div className="doc-chat__empty">
            <Text type="secondary" style={{ fontSize: token.fontSize }}>
              Спросите ассистента об этой работе — он ответит, опираясь на её текст.
            </Text>
          </div>
        ) : (
          allMessages.map((msg, index) => (
            <MessageBubble
              key={`${msg.role}-${index}-${msg.content.slice(0, 16)}`}
              msg={msg}
              streaming={isStreaming && index === allMessages.length - 1 && msg.role === 'assistant'}
            />
          ))
        )}

        <div ref={bottomRef} />
      </div>

      {sendError ? (
        <Alert
          type="error"
          showIcon
          title={sendError}
          closable={{ onClose: () => setSendError(null) }}
        />
      ) : null}

      <div className="doc-chat__composer">
        <TextArea
          ref={textAreaRef}
          className="doc-chat__composer-input"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void handleSend();
            }
          }}
          autoSize={{ minRows: 1, maxRows: 5 }}
          disabled={!canSend}
          placeholder="Сообщение"
          style={{ fontSize: token.fontSize, lineHeight: 1.6 }}
        />

        <Button
          type="text"
          className="doc-chat__send"
          icon={isStreaming ? <LoadingOutlined /> : <ArrowRightOutlined />}
          loading={isStreaming}
          disabled={!inputValue.trim() || !canSend}
          onClick={() => void handleSend()}
          aria-label="Отправить сообщение"
          style={{
            width: token.controlHeight - 4,
            height: token.controlHeight - 4,
            borderRadius: token.borderRadius,
            background: token.colorBgChatChip,
            color: token.colorText,
          }}
        />
      </div>
    </aside>
  );
});
