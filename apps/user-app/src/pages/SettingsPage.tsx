import React, { useState } from 'react';
import { Avatar, Button, Divider, message, Modal, Typography, theme } from 'antd';
import { LogoutOutlined, UserOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/layouts/AppLayout';

const { Title, Text } = Typography;

export function SettingsPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { token } = theme.useToken();
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleLogout = async () => {
        setLogoutLoading(true);
        try {
            await logout();
            message.success('Вы вышли из аккаунта');
            navigate({ to: '/login' });
        } catch {
            message.error('Ошибка при выходе');
        } finally {
            setLogoutLoading(false);
            setConfirmOpen(false);
        }
    };

    return (
        <AppLayout>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <Title level={3} style={{ marginBottom: 32 }}>
                    Настройки
                </Title>

                {/* Блок профиля */}
                <div
                    style={{
                        background: token.colorBgContainer,
                        borderRadius: 16,
                        padding: '24px 28px',
                        marginBottom: 16,
                        border: `1px solid ${token.colorBorderSecondary}`,
                    }}
                >
                    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Профиль
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
                        <Avatar
                            size={56}
                            style={{ background: token.colorPrimary, flexShrink: 0, fontSize: 22 }}
                            icon={!user?.username ? <UserOutlined /> : undefined}
                        >
                            {user?.username?.[0]?.toUpperCase()}
                        </Avatar>
                        <div>
                            <Text strong style={{ fontSize: 17, display: 'block' }}>
                                {user?.username ?? '—'}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 14 }}>
                                {user?.email ?? '—'}
                            </Text>
                        </div>
                    </div>
                </div>

                {/* Блок аккаунта */}
                <div
                    style={{
                        background: token.colorBgContainer,
                        borderRadius: 16,
                        border: `1px solid ${token.colorBorderSecondary}`,
                        overflow: 'hidden',
                    }}
                >
                    <div style={{ padding: '16px 28px 4px' }}>
                        <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Аккаунт
                        </Text>
                    </div>

                    <Divider style={{ margin: '12px 0' }} />

                    <div style={{ padding: '4px 28px 20px' }}>
                        <Button
                            danger
                            icon={<LogoutOutlined />}
                            size="large"
                            style={{ borderRadius: 10, width: '100%', justifyContent: 'flex-start' }}
                            onClick={() => setConfirmOpen(true)}
                        >
                            Выйти из аккаунта
                        </Button>
                    </div>
                </div>
            </div>

            {/* Модалка подтверждения */}
            <Modal
                open={confirmOpen}
                onCancel={() => setConfirmOpen(false)}
                onOk={handleLogout}
                okText="Выйти"
                cancelText="Отмена"
                okButtonProps={{ danger: true, loading: logoutLoading }}
                title={
                    <span>
                        <WarningOutlined style={{ color: token.colorError, marginRight: 8 }} />
                        Выход из аккаунта
                    </span>
                }
                centered
            >
                <Text>Вы уверены, что хотите выйти? Вам потребуется снова войти в систему.</Text>
            </Modal>
        </AppLayout>
    );
}

