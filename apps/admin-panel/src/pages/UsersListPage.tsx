import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Modal, Space, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckCircleOutlined,
  EditOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';
import type { User } from '@/types';
import { usersService } from '../services/users.service';
import { UserEditModal } from '@/components/UserEditModal';
import { PageHeader } from '@/components';

/* ------------------------------------------------------------------ */
/* Module-scoped formatters to avoid re-creation on every render.     */
/* ------------------------------------------------------------------ */

const DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const formatDate = (dateString: string) => DATE_FORMATTER.format(new Date(dateString));

const STATUS_FILTERS = [
  { text: 'Активные', value: true },
  { text: 'Неактивные', value: false },
];

export function UsersListPage() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersService.fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error('Ошибка при загрузке пользователей:', error);
      message.error('Не удалось загрузить список пользователей');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleStatus = useCallback((user: User) => {
    const newStatus = !user.is_active;
    const actionText = newStatus ? 'активировать' : 'деактивировать';

    Modal.confirm({
      title: 'Подтверждение действия',
      content: `Вы уверены, что хотите ${actionText} пользователя ${user.full_name}?`,
      okText: 'Да',
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          setActionLoading(user.id);
          await usersService.toggleUserStatus(user.id, newStatus);
          setUsers((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, is_active: newStatus } : u)),
          );
          message.success(`Пользователь ${newStatus ? 'активирован' : 'деактивирован'}`);
        } catch (error) {
          console.error('Ошибка при изменении статуса пользователя:', error);
          message.error('Не удалось изменить статус пользователя');
        } finally {
          setActionLoading(null);
        }
      },
    });
  }, []);

  const handleEditUser = useCallback((user: User) => {
    setSelectedUser(user);
    setEditModalVisible(true);
  }, []);

  const handleSaveUser = useCallback(
    async (userId: string, data: Partial<User>) => {
      try {
        const updatedUser = await usersService.updateUser(userId, data);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, ...updatedUser } : u)),
        );
        message.success('Данные пользователя обновлены');
        setEditModalVisible(false);
        setSelectedUser(null);
      } catch (error) {
        console.error('Ошибка при обновлении пользователя:', error);
        message.error('Не удалось обновить данные пользователя');
        throw error;
      }
    },
    [],
  );

  const handleCloseEdit = useCallback(() => {
    setEditModalVisible(false);
    setSelectedUser(null);
  }, []);

  const columns: ColumnsType<User> = useMemo(
    () => [
      {
        title: 'Имя пользователя',
        dataIndex: 'username',
        key: 'username',
        width: '15%',
        sorter: (a, b) => a.username.localeCompare(b.username),
        render: (value: string) => (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-800)' }}>
            {value}
          </span>
        ),
      },
      {
        title: 'Полное имя',
        dataIndex: 'full_name',
        key: 'full_name',
        width: '20%',
        sorter: (a, b) => a.full_name.localeCompare(b.full_name),
        render: (value: string) => (
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              color: 'var(--ink-900)',
              fontSize: 15,
            }}
          >
            {value}
          </span>
        ),
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        width: '20%',
        sorter: (a, b) => a.email.localeCompare(b.email),
        render: (value: string) => (
          <span className="mono-meta" style={{ fontSize: 12 }}>
            {value}
          </span>
        ),
      },
      {
        title: 'Статус',
        dataIndex: 'is_active',
        key: 'is_active',
        width: '10%',
        render: (is_active: boolean) => (
          <Tag
            style={{
              background: is_active ? 'var(--forest-soft)' : 'var(--burgundy-soft)',
              color: is_active ? 'var(--forest)' : 'var(--burgundy)',
              borderColor: 'transparent',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontSize: 10,
            }}
          >
            {is_active ? 'Активен' : 'Неактивен'}
          </Tag>
        ),
        filters: STATUS_FILTERS,
        onFilter: (value, record) => record.is_active === value,
      },
      {
        title: 'Регистрация',
        dataIndex: 'registered_at',
        key: 'registered_at',
        width: '15%',
        render: (date: string) => <span className="mono-meta">{formatDate(date)}</span>,
        sorter: (a, b) =>
          new Date(a.registered_at).getTime() - new Date(b.registered_at).getTime(),
      },
      {
        title: 'Последний вход',
        dataIndex: 'last_login_at',
        key: 'last_login_at',
        width: '15%',
        render: (date: string) => <span className="mono-meta">{formatDate(date)}</span>,
        sorter: (a, b) =>
          new Date(a.last_login_at).getTime() - new Date(b.last_login_at).getTime(),
      },
      {
        title: '',
        key: 'actions',
        width: 110,
        align: 'right',
        render: (_, record) => (
          <Space size={2}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEditUser(record);
              }}
              aria-label="Редактировать"
            />
            <Button
              type="text"
              danger={record.is_active}
              icon={record.is_active ? <UserDeleteOutlined /> : <CheckCircleOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleStatus(record);
              }}
              loading={actionLoading === record.id}
              aria-label={record.is_active ? 'Деактивировать' : 'Активировать'}
            />
          </Space>
        ),
      },
    ],
    [actionLoading, handleEditUser, handleToggleStatus],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Каталог"
        title="Пользователи"
        description="Читатели платформы. Следите за активностью, управляйте статусом учётных записей и профилями."
      />

      <Table<User>
        columns={columns}
        rowKey={(record) => record.id}
        scroll={{ y: 600 }}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Всего: ${total}`,
        }}
        dataSource={users}
        loading={loading}
      />

      <UserEditModal
        visible={editModalVisible}
        user={selectedUser}
        onCancel={handleCloseEdit}
        onSave={handleSaveUser}
      />
    </div>
  );
}
