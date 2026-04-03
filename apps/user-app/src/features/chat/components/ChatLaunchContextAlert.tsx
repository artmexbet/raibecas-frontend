import { Alert, Button, Flex, Tag, Typography, theme } from 'antd';
import type { ChatRouteState } from '@/types/chat';
import chatFormat from '@/features/chat/lib/chat-format';

const { Text } = Typography;

interface ChatLaunchContextAlertProps {
  routeState: ChatRouteState;
  onAppendContext: () => void;
}

export function ChatLaunchContextAlert({ routeState, onAppendContext }: ChatLaunchContextAlertProps) {
  const { token } = theme.useToken();

  return (
    <Alert
      className="chat-launch-context"
      type="info"
      showIcon
      style={{
        borderRadius: token.borderRadiusChatPanel - 4,
        border: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgChatSurface,
        boxShadow: token.boxShadowChatSoft,
      }}
      title="Контекст для разговора уже подготовлен"
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
            <Button
              size="small"
              onClick={onAppendContext}
              style={{
                borderRadius: token.borderRadius,
                background: token.colorBgChatChip,
                color: token.colorText,
                borderColor: token.colorBgChatChip,
              }}
            >
              Добавить в сообщение
            </Button>
            {routeState.pageLabel ? (
              <Tag color="blue" style={{ marginInlineEnd: 0, borderRadius: 999 }}>
                Стр. {routeState.pageLabel}
              </Tag>
            ) : null}
          </Flex>
        </Flex>
      }
    />
  );
}


