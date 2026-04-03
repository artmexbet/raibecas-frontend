import { Button, Input, theme } from 'antd';
import { ArrowRightOutlined, DownOutlined, LoadingOutlined } from '@ant-design/icons';

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
        padding: `${token.paddingMD}px ${token.paddingLG - 2}px ${token.paddingMD - 2}px`,
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
          autoSize={{ minRows: 3, maxRows: 7 }}
          disabled={!canSendMessage || creatingSession}
          placeholder="Введите текст для поиска..."
          style={{ fontSize: token.fontSizeLG + 1, lineHeight: 1.5 }}
        />

      <div className="chat-composer__footer">
        <div className="chat-composer__meta">
          <div className="chat-composer__chips" aria-hidden="true">
            <span
              className="chat-composer__chip"
              style={{
                minHeight: token.controlHeight - 2,
                padding: `0 ${token.paddingSM + 8}px`,
                borderRadius: token.borderRadiusLG - 2,
                background: token.colorBgChatChip,
                color: token.colorText,
                fontSize: token.fontSize,
              }}
            >
              Период <DownOutlined />
            </span>
            <span
              className="chat-composer__chip"
              style={{
                minHeight: token.controlHeight - 2,
                padding: `0 ${token.paddingSM + 8}px`,
                borderRadius: token.borderRadiusLG - 2,
                background: token.colorBgChatChip,
                color: token.colorText,
                fontSize: token.fontSize,
              }}
            >
              Темы <DownOutlined />
            </span>
          </div>

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
            width: token.controlHeightLG - 2,
            height: token.controlHeightLG - 2,
            borderRadius: token.borderRadius,
            background: token.colorBgChatChip,
            color: token.colorText,
          }}
        />
      </div>
    </div>
  );
}

