import { useEffect, useState } from 'react';
import { Button, Card, Space, Table, Tag, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UserDeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { User } from '@/types';
import { usersService } from '../services/users.service';

export function UsersListPage() {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
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
    };

    const handleToggleStatus = async (user: User) => {
        const newStatus = !user.is_active;
        const actionText = newStatus ? 'активировать' : 'деактивировать';

        Modal.confirm({
            title: `Подтверждение действия`,
            content: `Вы уверены, что хотите ${actionText} пользователя ${user.full_name}?`,
            okText: 'Да',
            cancelText: 'Отмена',
            onOk: async () => {
                try {
                    setActionLoading(user.id);
                    await usersService.toggleUserStatus(user.id, newStatus);

                    // Обновляем локальное состояние
                    setUsers(prevUsers =>
                        prevUsers.map(u =>
                            u.id === user.id ? { ...u, is_active: newStatus } : u
                        )
                    );

                    message.success(
                        `Пользователь ${newStatus ? 'активирован' : 'деактивирован'}`
                    );
                } catch (error) {
                    console.error('Ошибка при изменении статуса пользователя:', error);
                    message.error('Не удалось изменить статус пользователя');
                } finally {
                    setActionLoading(null);
                }
            },
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const columns: ColumnsType<User> = [
        {
            title: 'Имя пользователя',
            dataIndex: 'username',
            key: 'username',
            width: '15%',
            sorter: (a, b) => a.username.localeCompare(b.username),
        },
        {
            title: 'Полное имя',
            dataIndex: 'full_name',
            key: 'full_name',
            width: '20%',
            sorter: (a, b) => a.full_name.localeCompare(b.full_name),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: '20%',
            sorter: (a, b) => a.email.localeCompare(b.email),
        },
        {
            title: 'Статус',
            dataIndex: 'is_active',
            key: 'is_active',
            width: '10%',
            render: (is_active: boolean) => (
                <Tag color={is_active ? 'green' : 'red'}>
                    {is_active ? 'Активен' : 'Неактивен'}
                </Tag>
            ),
            filters: [
                { text: 'Активные', value: true },
                { text: 'Неактивные', value: false },
            ],
            onFilter: (value, record) => record.is_active === value,
        },
        // {
        //     title: 'Заметок',
        //     dataIndex: 'notesCount',
        //     key: 'notesCount',
        //     width: '10%',
        //     align: 'center',
        //     sorter: (a, b) => a.notesCount - b.notesCount,
        // },
        {
            title: 'Дата регистрации',
            dataIndex: 'registered_at',
            key: 'registered_at',
            width: '15%',
            render: (date: string) => formatDate(date),
            sorter: (a, b) =>
                new Date(a.registered_at).getTime() - new Date(b.registered_at).getTime(),
        },
        {
            title: 'Последний вход',
            dataIndex: 'last_login_at',
            key: 'last_login_at',
            width: '15%',
            render: (date: string) => formatDate(date),
            sorter: (a, b) =>
                new Date(a.last_login_at).getTime() - new Date(b.last_login_at).getTime(),
        },
        {
            title: 'Действия',
            key: 'actions',
            width: '10%',
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={
                            record.is_active ? (
                                <UserDeleteOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
                            ) : (
                                <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                            )
                        }
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(record);
                        }}
                        loading={actionLoading === record.id}
                        title={record.is_active ? 'Деактивировать' : 'Активировать'}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <h1 style={{ marginBottom: 24 }}>Пользователи</h1>
            <Card>
                <Table
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
            </Card>
        </div>
    );
}
