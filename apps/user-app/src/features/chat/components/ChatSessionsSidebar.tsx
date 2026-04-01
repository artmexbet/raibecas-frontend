import { Button, Empty, Flex, List, Spin, Tag, Tooltip, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ChatSession } from '@/types/chat';
import chatFormat from '@/features/chat/lib/chat-format';

const { Text } = Typography;

interface ChatSessionsSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  loadingSessions: boolean;
  creatingSession: boolean;
  canManageSessions: boolean;
  canCreateSessions: boolean;
  hasLaunchContext: boolean;
  onCreateSession: () => void;
  onSelectSession: (sessionId: string) => void;
  borderColor: string;
}

export function ChatSessionsSidebar({
  sessions,
  activeSessionId,
  loadingSessions,
  creatingSession,
  canManageSessions,
  canCreateSessions,
  hasLaunchContext,
  onCreateSession,
  onSelectSession,
  borderColor,
}: ChatSessionsSidebarProps) {
  return (
    <div
      style={{
        width: 320,
        borderRight: `1px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(246, 241, 237, 0.76)',
      }}
    >
      <Flex
        justify="space-between"
        align="center"
        style={{ padding: '18px 20px', borderBottom: `1px solid ${borderColor}` }}
      >
        <div>
          <Text strong style={{ display: 'block' }}>
            Ваши чаты
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Каркас уже готов под будущий список диалогов.
          </Text>
        </div>

        <Tooltip title="Создать новый чат">
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            onClick={onCreateSession}
            loading={creatingSession}
            disabled={!canCreateSessions}
          />
        </Tooltip>
      </Flex>

      {loadingSessions ? (
        <Flex justify="center" align="center" style={{ flex: 1 }}>
          <Spin />
        </Flex>
      ) : sessions.length === 0 ? (
        <Flex justify="center" align="center" style={{ flex: 1, padding: 24 }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              hasLaunchContext
                ? 'Контекст для разговора уже подготовлен. Создайте первый чат, чтобы начать.'
                : 'Пока нет ни одного чата. Создайте первый диалог.'
            }
          >
            <Button
              type="primary"
              onClick={onCreateSession}
              loading={creatingSession}
              disabled={!canCreateSessions}
            >
              Создать чат
            </Button>
          </Empty>
        </Flex>
      ) : (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <List
            dataSource={sessions}
            renderItem={(session, index) => (
              <List.Item
                onClick={() => {
                  if (!canManageSessions) {
                    return;
                  }

                  onSelectSession(session.id);
                }}
                style={{
                  padding: '14px 18px',
                  cursor: canManageSessions ? 'pointer' : 'not-allowed',
                  opacity: canManageSessions ? 1 : 0.72,
                  background:
                    session.id === activeSessionId ? 'rgba(127, 86, 217, 0.08)' : 'transparent',
                  borderLeft:
                    session.id === activeSessionId
                      ? '3px solid #7f56d9'
                      : '3px solid transparent',
                }}
              >
                <Flex vertical gap={6} style={{ width: '100%' }}>
                  <Flex justify="space-between" gap={8} align="center">
                    <Text strong={session.id === activeSessionId} ellipsis title={chatFormat.formatSessionLabel(session)}>
                      {chatFormat.formatSessionLabel(session)}
                    </Text>

                    {index === 0 ? (
                      <Tag color="purple" style={{ marginInlineEnd: 0 }}>
                        Текущий
                      </Tag>
                    ) : null}
                  </Flex>

                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {session.messages.length > 0 ? `${session.messages.length} сообщ.` : 'Без сообщений'}
                  </Text>
                </Flex>
              </List.Item>
            )}
            split={false}
          />
        </div>
      )}
    </div>
  );
}


