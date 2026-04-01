import { Avatar, Flex, Typography } from 'antd';
import { LoadingOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import type { ChatMessage } from '@/types/chat';

const { Text } = Typography;

interface MessageBubbleProps {
  msg: ChatMessage;
  streaming?: boolean;
}

export function MessageBubble({ msg, streaming = false }: MessageBubbleProps) {
  const isUser = msg.role === 'user';

  return (
    <Flex
      gap={10}
      align="flex-start"
      justify={isUser ? 'flex-end' : 'flex-start'}
      style={{ marginBottom: 14 }}
    >
      {!isUser ? (
        <Avatar
          icon={streaming ? <LoadingOutlined /> : <RobotOutlined />}
          style={{ background: '#7f56d9', flexShrink: 0 }}
        />
      ) : null}

      <div
        style={{
          maxWidth: '78%',
          padding: '10px 14px',
          borderRadius: isUser ? '18px 6px 18px 18px' : '6px 18px 18px 18px',
          background: isUser ? '#2f1d1f' : '#ffffff',
          color: isUser ? '#ffffff' : 'inherit',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          boxShadow: '0 12px 32px rgba(31, 24, 20, 0.08)',
          border: isUser ? 'none' : '1px solid rgba(47, 29, 31, 0.08)',
        }}
      >
        <Text style={{ color: isUser ? '#ffffff' : 'inherit' }}>{msg.content}</Text>

        {streaming ? (
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 16,
              marginLeft: 4,
              verticalAlign: 'text-bottom',
              borderRadius: 999,
              background: '#7f56d9',
              animation: 'blink 1s step-start infinite',
            }}
          />
        ) : null}
      </div>

      {isUser ? (
        <Avatar icon={<UserOutlined />} style={{ background: '#b67b55', flexShrink: 0 }} />
      ) : null}
    </Flex>
  );
}

