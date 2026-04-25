import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { List, Spin, Typography, message } from 'antd';
import {
  CommentOutlined,
  FileTextOutlined,
  TeamOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { statsService } from '../services/stats.service';
import type { DashboardStats } from '@/mocks';
import { PageHeader, SectionLabel, StatCard } from '@/components';
import { palette } from '@/theme';

const { Text } = Typography;

/* ------------------------------------------------------------------ */
/* Formatter memoised at module scope (js-hoist-regexp pattern).       */
/* ------------------------------------------------------------------ */

const DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const formatDate = (dateString: string) => DATE_FORMATTER.format(new Date(dateString));

/* ------------------------------------------------------------------ */
/* Sub-components                                                     */
/* ------------------------------------------------------------------ */

const DashboardListCard = memo(function DashboardListCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 10,
        padding: '20px 22px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div>
        <span
          className="eyebrow"
          style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--ink-500)' }}
        >
          {eyebrow}
        </span>
        <h3
          style={{
            margin: '4px 0 0',
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 500,
            fontStyle: 'italic',
            letterSpacing: '-0.01em',
            color: 'var(--ink-900)',
          }}
        >
          {title}
        </h3>
      </div>
      <div style={{ marginTop: 4 }}>{children}</div>
    </section>
  );
});

const WelcomeStrip = memo(function WelcomeStrip() {
  return (
    <section
      style={{
        marginTop: 24,
        padding: '28px 32px',
        background: 'var(--paper-soft)',
        border: '1px solid var(--hairline)',
        borderRadius: 10,
        display: 'flex',
        gap: 32,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ maxWidth: 720 }}>
        <span
          className="eyebrow"
          style={{ color: 'var(--ochre-deep)', fontSize: 11, letterSpacing: '0.24em' }}
        >
          Добро пожаловать
        </span>
        <p
          style={{
            margin: '8px 0 0',
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 400,
            lineHeight: 1.35,
            color: 'var(--ink-800)',
            letterSpacing: '-0.01em',
          }}
        >
          Здесь собраны все ваши документы, пользователи и&nbsp;заявки. Внесите изменения —
          каталог обновится моментально.
        </p>
      </div>
      <div
        aria-hidden
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 96,
          lineHeight: 0.8,
          color: 'var(--ochre)',
          fontStyle: 'italic',
          fontWeight: 400,
        }}
      >
        Ϙ
      </div>
    </section>
  );
});

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await statsService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Ошибка при загрузке статистики:', error);
      message.error('Не удалось загрузить статистику');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const statCards = useMemo(
    () => [
      {
        key: 'documents',
        eyebrow: 'Документы',
        value: stats?.documentsCount ?? 0,
        hint: 'научные работы в библиотеке',
        icon: <FileTextOutlined />,
        accent: palette.inkPrimary,
        tint: '#eef0f6',
      },
      {
        key: 'users',
        eyebrow: 'Пользователи',
        value: stats?.usersCount ?? 0,
        hint: 'читатели платформы',
        icon: <TeamOutlined />,
        accent: palette.forest,
        tint: '#e4f0e7',
      },
      {
        key: 'requests',
        eyebrow: 'Заявки',
        value: stats?.pendingRequestsCount ?? 0,
        hint: 'на рассмотрении',
        icon: <UserAddOutlined />,
        accent: palette.ochre,
        tint: '#f3e6c6',
      },
      {
        key: 'notes',
        eyebrow: 'Заметки',
        value: stats?.totalNotesCount ?? 0,
        hint: 'создано читателями',
        icon: <CommentOutlined />,
        accent: palette.burgundy,
        tint: '#f6dcd8',
      },
    ],
    [stats],
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0' }}>
        <Spin size="large" tip="Загрузка статистики…" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Общий обзор"
        title="Панель управления"
        description="Срез по ключевым метрикам библиотеки — документы, пользователи, заметки и заявки на вступление."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {statCards.map((card) => (
          <StatCard
            key={card.key}
            eyebrow={card.eyebrow}
            value={card.value}
            hint={card.hint}
            icon={card.icon}
            accent={card.accent}
            tint={card.tint}
          />
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 20,
          marginTop: 28,
        }}
      >
        <DashboardListCard eyebrow="Свежие поступления" title="Последние документы">
          <List
            dataSource={stats?.recentDocuments ?? []}
            locale={{ emptyText: 'Пока нет документов' }}
            renderItem={(doc) => (
              <List.Item style={{ padding: '14px 0', borderBottomColor: 'var(--hairline)' }}>
                <List.Item.Meta
                  title={
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 16,
                        fontWeight: 500,
                        letterSpacing: '-0.005em',
                        color: 'var(--ink-900)',
                      }}
                    >
                      {doc.title}
                    </span>
                  }
                  description={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Text
                        style={{
                          fontStyle: 'italic',
                          fontFamily: 'var(--font-display)',
                          color: 'var(--ink-600)',
                        }}
                      >
                        {doc.author}
                      </Text>
                      <span className="mono-meta">{formatDate(doc.created_at)}</span>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </DashboardListCard>

        <DashboardListCard eyebrow="Каталог читателей" title="Последние пользователи">
          <List
            dataSource={stats?.recentUsers ?? []}
            locale={{ emptyText: 'Новых регистраций пока нет' }}
            renderItem={(user) => (
              <List.Item style={{ padding: '14px 0', borderBottomColor: 'var(--hairline)' }}>
                <List.Item.Meta
                  title={
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 14,
                        fontWeight: 500,
                        color: 'var(--ink-900)',
                      }}
                    >
                      {user.username}
                    </span>
                  }
                  description={
                    <span className="mono-meta">
                      Регистрация: {formatDate(user.registeredAt)}
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        </DashboardListCard>
      </div>

      <WelcomeStrip />

      <SectionLabel marginTop={28}>О платформе</SectionLabel>
      <p
        style={{
          maxWidth: 720,
          fontFamily: 'var(--font-display)',
          fontSize: 16,
          lineHeight: 1.6,
          color: 'var(--ink-600)',
          margin: 0,
        }}
      >
        Библиотека философа — административная оболочка для работы с&nbsp;научным собранием,
        пользователями и&nbsp;чат-ботом на&nbsp;локальной LLM. Используйте боковое меню
        для&nbsp;навигации между разделами.
      </p>
    </div>
  );
}
