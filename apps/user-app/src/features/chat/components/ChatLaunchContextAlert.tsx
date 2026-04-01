import { Alert, Button, Flex, Tag, Typography } from 'antd';
import type { ChatRouteState } from '@/types/chat';
import chatFormat from '@/features/chat/lib/chat-format';

const { Text } = Typography;

interface ChatLaunchContextAlertProps {
  routeState: ChatRouteState;
  onAppendContext: () => void;
}

export function ChatLaunchContextAlert({ routeState, onAppendContext }: ChatLaunchContextAlertProps) {
  return (
    <Alert
      type="info"
      showIcon
      style={{ margin: 16, marginBottom: 0 }}
      title="Контекст для будущего перехода из документа уже поддержан"
      description={
        <Flex vertical gap={8}>
          {routeState.documentTitle ? (
            <Text>
              <Text strong>Работа:</Text> {routeState.documentTitle}
            </Text>
          ) : null}

          {routeState.quoteText ? (
            <Text>
              <Text strong>Фрагмент:</Text> “{chatFormat.truncateText(routeState.quoteText, 180)}”
            </Text>
          ) : null}

          {routeState.context ? (
            <Text type="secondary">{chatFormat.truncateText(routeState.context, 220)}</Text>
          ) : null}

          <Flex gap={8} wrap>
            <Button size="small" onClick={onAppendContext}>
              Добавить в сообщение
            </Button>
            {routeState.pageLabel ? (
              <Tag color="blue" style={{ marginInlineEnd: 0 }}>
                Стр. {routeState.pageLabel}
              </Tag>
            ) : null}
          </Flex>
        </Flex>
      }
    />
  );
}


