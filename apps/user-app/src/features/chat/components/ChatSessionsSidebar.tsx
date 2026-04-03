import { Button, Empty, Flex, Spin, Typography, theme } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ChatSession } from '@/types/chat';
import chatFormat from '@/features/chat/lib/chat-format';

const { Text, Title } = Typography;

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
}: ChatSessionsSidebarProps) {
  const { token } = theme.useToken();

  return (
    <aside
      className="chat-sessions-sidebar"
      style={{
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        borderLeft: 'none',
        borderBottom: 'none',
        borderTopLeftRadius: 0,
        borderTopRightRadius: token.borderRadiusChatPanel - 2,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
        background: token.colorBgChatSidebar,
        boxShadow: token.boxShadowChatSoft,
      }}
    >
      <div
        className="chat-sessions-sidebar__header"
        style={{
          padding: `${token.paddingMD - 2}px ${token.paddingMD}px ${token.paddingSM + 8}px`,
          borderBottom: `1px solid ${token.colorSplit}`,
        }}
      >
        <div>
          <Title level={4} className="chat-sessions-sidebar__title" style={{ marginBottom: 0, color: token.colorText }}>
            Ваши чаты
          </Title>
          <p className="chat-sessions-sidebar__caption" style={{ color: token.colorTextSecondary }}>
            Здесь позже появятся история диалогов и быстрый переход в нужный разговор.
          </p>
        </div>

        <Button
          type="text"
          className="chat-sessions-sidebar__create"
          icon={sessions.length > 0 ? <EditOutlined /> : <PlusOutlined />}
          onClick={onCreateSession}
          loading={creatingSession}
          disabled={!canCreateSessions}
          style={{
            height: token.controlHeight - 2,
            paddingInline: token.paddingSM + 8,
            borderRadius: token.borderRadius,
            background: token.colorBgChatChip,
            color: token.colorText,
            fontSize: token.fontSize,
          }}
        >
          Новый чат
        </Button>
      </div>

      <div className="chat-sessions-sidebar__content">
        {loadingSessions ? (
          <Flex justify="center" align="center" className="chat-sessions-sidebar__empty">
          <Spin />
          </Flex>
        ) : sessions.length === 0 ? (
          <Flex justify="center" align="center" className="chat-sessions-sidebar__empty">
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
          <div className="chat-sessions-sidebar__list">
            {sessions.map((session, index) => {
              const isActive = session.id === activeSessionId;

              return (
                <button
                  key={session.id}
                  type="button"
                  className={`chat-sessions-sidebar__item${isActive ? ' chat-sessions-sidebar__item--active' : ''}`}
                  onClick={() => {
                    if (!canManageSessions) {
                      return;
                    }

                    onSelectSession(session.id);
                  }}
                  disabled={!canManageSessions}
                  style={{
                    padding: `${token.paddingSM + 8}px ${token.paddingMD}px`,
                    background: isActive ? token.colorBgChatSurface : 'transparent',
                  }}
                >
                  <div className="chat-sessions-sidebar__item-head">
                    <span
                      className="chat-sessions-sidebar__item-title"
                      title={chatFormat.formatSessionLabel(session)}
                      style={{ color: token.colorText, fontWeight: isActive ? 600 : 500 }}
                    >
                      {chatFormat.formatSessionLabel(session)}
                    </span>

                    {index === 0 ? (
                      <span
                        className="chat-sessions-sidebar__status"
                        style={{
                          minWidth: 62,
                          height: 24,
                          padding: `0 ${token.paddingSM}px`,
                          borderRadius: 999,
                          background: token.colorBgChatSurface,
                          color: token.colorText,
                          fontSize: token.fontSizeSM,
                        }}
                      >
                        Текущий
                      </span>
                    ) : null}
                  </div>

                  <div className="chat-sessions-sidebar__item-meta" style={{ color: token.colorTextSecondary }}>
                    <Text type="secondary" style={{ color: token.colorTextSecondary }}>
                      {session.messages.length > 0 ? `${session.messages.length} сообщ.` : 'Без сообщений'}
                    </Text>
                    <span>•</span>
                    <span>{new Date(session.updated_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}


