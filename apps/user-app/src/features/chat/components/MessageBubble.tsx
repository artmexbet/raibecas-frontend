import { Typography, theme } from 'antd';
import type { ChatMessage } from '@/types/chat';

const { Text } = Typography;

interface MessageBubbleProps {
  msg: ChatMessage;
  streaming?: boolean;
}

export function MessageBubble({ msg, streaming = false }: MessageBubbleProps) {
  const isUser = msg.role === 'user';
  const { token } = theme.useToken();

  const bubbleRadius = token.borderRadiusChatBubble;

  return (
    <div
      className={`chat-message ${isUser ? 'chat-message--user' : 'chat-message--assistant'}`}
      style={{ marginBottom: token.marginSM }}
    >
      <div
        className="chat-message__bubble"
        style={{
          padding: `${token.paddingMD - 6}px ${token.paddingLG - 4}px`,
          borderRadius: bubbleRadius,
          borderTopRightRadius: isUser ? token.borderRadiusLG - 2 : bubbleRadius,
          borderTopLeftRadius: isUser ? bubbleRadius : token.borderRadiusLG - 2,
          background: isUser ? token.colorBgChatBubbleUser : token.colorBgChatBubbleAssistant,
          border: isUser ? `1px solid ${token.colorBorderChatBubbleUser}` : 'none',
          boxShadow: token.boxShadowChatSoft,
          color: token.colorText,
        }}
      >
        <Text
          className="chat-message__text"
          style={{
            color: 'inherit',
            fontSize: 20,
            lineHeight: 1.5,
          }}
        >
          {msg.content}
        </Text>

        {streaming ? (
          <span className="chat-message__cursor" style={{ color: token.colorPrimary }} />
        ) : null}
      </div>
    </div>
  );
}

