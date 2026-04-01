import { Button, Flex, Input } from 'antd';
import { LoadingOutlined, SendOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface ChatComposerProps {
  inputValue: string;
  isConnected: boolean;
  isStreaming: boolean;
  isLatestSessionActive: boolean;
  hasActiveSession: boolean;
  borderColor: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export function ChatComposer({
  inputValue,
  isConnected,
  isStreaming,
  isLatestSessionActive,
  hasActiveSession,
  borderColor,
  onInputChange,
  onSend,
}: ChatComposerProps) {
  return (
    <div
      style={{
        padding: 20,
        borderTop: `1px solid ${borderColor}`,
        background: 'rgba(255,255,255,0.84)',
      }}
    >
      <Flex gap={12} align="flex-end">
        <TextArea
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          autoSize={{ minRows: 2, maxRows: 6 }}
          disabled={!isConnected || isStreaming || !isLatestSessionActive}
          placeholder={
            !isLatestSessionActive
              ? 'Для продолжения откройте текущий чат или создайте новый'
              : isConnected
                ? 'Спросите о работе, идее или фрагменте текста…'
                : 'Подключаемся к чату…'
          }
          style={{ flex: 1 }}
        />

        <Button
          type="primary"
          icon={isStreaming ? <LoadingOutlined /> : <SendOutlined />}
          loading={isStreaming}
          disabled={!inputValue.trim() || !isConnected || !isLatestSessionActive || !hasActiveSession}
          onClick={onSend}
        >
          Отправить
        </Button>
      </Flex>
    </div>
  );
}

