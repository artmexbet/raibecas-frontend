import { Button, Input, theme } from 'antd';
import { ArrowRightOutlined, LoadingOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface ChatComposerProps {
  inputValue: string;
  isConnected: boolean;
  isStreaming: boolean;
  hasActiveSession: boolean;
  canSendMessage: boolean;
  creatingSession?: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export function ChatComposer({
  inputValue,
  isConnected,
  isStreaming,
  hasActiveSession,
  canSendMessage,
  creatingSession = false,
  onInputChange,
  onSend,
}: ChatComposerProps) {
  const hint = !isConnected
    ? 'Подключаемся к чату…'
    : creatingSession
      ? 'Создаём новый чат…'
      : hasActiveSession
        ? 'Можно продолжать текущий диалог.'
        : 'Первое сообщение создаст новый чат.';
  const { token } = theme.useToken();

  return (
    <div
      className="chat-composer"
      style={{
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusChatPanel,
        padding: `${token.paddingSM + 4}px ${token.padding}px ${token.paddingSM + 2}px`,
        background: token.colorBgChatComposer,
        boxShadow: token.boxShadowChatSoft,
      }}
    >
        <TextArea
          className="chat-composer__input"
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          autoSize={{ minRows: 1, maxRows: 6 }}
          disabled={!canSendMessage || creatingSession}
          placeholder="Введите текст для поиска..."
          style={{ fontSize: token.fontSize, lineHeight: 1.6 }}
        />

      <div className="chat-composer__footer">
        <div className="chat-composer__meta">
          <span className="chat-composer__hint" style={{ color: token.colorTextSecondary }}>
            {hint}
          </span>
        </div>

        <Button
          type="text"
          className="chat-composer__send"
          icon={isStreaming ? <LoadingOutlined /> : <ArrowRightOutlined />}
          loading={isStreaming}
          disabled={!inputValue.trim() || !canSendMessage || creatingSession}
          onClick={onSend}
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
    </div>
  );
}

