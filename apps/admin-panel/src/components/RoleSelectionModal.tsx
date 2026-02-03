import { Modal, Form, Select, Button, Tag } from 'antd';
import { useState } from 'react';
import { AdminRole } from '@/types/permissions';
import type { CreateAdminRequest } from '@/types/auth';

interface RoleSelectionModalProps {
    visible: boolean;
    request: CreateAdminRequest | null;
    onCancel: () => void;
    onApprove: (requestId: string, role: AdminRole) => Promise<void>;
    onReject: (requestId: string) => Promise<void>;
}

const STATUS_COLORS = {
    pending: 'blue',
    approved: 'green',
    rejected: 'red'
};

const STATUS_LABELS = {
    pending: 'На рассмотрении',
    approved: 'Одобрено',
    rejected: 'Отклонено'
};

const ROLE_OPTIONS = [
    {
        value: AdminRole.USER,
        label: 'Пользователь',
        description: 'Базовый доступ: только просмотр документов'
    },
    {
        value: AdminRole.ADMIN,
        label: 'Администратор',
        description: 'Базовые права: просмотр и управление документами, просмотр пользователей и обработка заявок'
    },
    {
        value: AdminRole.SUPER_ADMIN,
        label: 'Суперадминистратор',
        description: 'Полные права: все возможности администратора + управление пользователями и настройками системы'
    }
];

export function RoleSelectionModal({ visible, request, onCancel, onApprove, onReject }: RoleSelectionModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<AdminRole | undefined>(AdminRole.USER);

    const handleApprove = async () => {
        try {
            const values = await form.validateFields();
            if (!request) return;

            setLoading(true);
            await onApprove(request.id, values.role);
            form.resetFields();
            setSelectedRole(AdminRole.USER);
        } catch (error) {
            console.error('Ошибка при одобрении заявки:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!request) return;

        Modal.confirm({
            title: 'Подтверждение отклонения',
            content: `Вы уверены, что хотите отклонить заявку пользователя ${request.username}?`,
            okText: 'Да, отклонить',
            okType: 'danger',
            cancelText: 'Отмена',
            onOk: async () => {
                setLoading(true);
                try {
                    await onReject(request.id);
                    form.resetFields();
                    setSelectedRole(AdminRole.USER);
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleCancel = () => {
        form.resetFields();
        setSelectedRole(AdminRole.USER);
        onCancel();
    };

    return (
        <Modal
            title="Обработка заявки на регистрацию"
            open={visible}
            onCancel={handleCancel}
            width={600}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    Отмена
                </Button>,
                <Button
                    key="reject"
                    danger
                    onClick={handleReject}
                    loading={loading}
                >
                    Отклонить
                </Button>,
                <Button
                    key="approve"
                    type="primary"
                    onClick={handleApprove}
                    loading={loading}
                >
                    Одобрить
                </Button>,
            ]}
        >
            {request && (
                <div style={{ marginBottom: 24 }}>
                    <p><strong>Имя пользователя:</strong> {request.username}</p>
                    <p><strong>Email:</strong> {request.email}</p>
                    <p>
                        <strong>Статус:</strong>{' '}
                        <Tag color={STATUS_COLORS[request.status as keyof typeof STATUS_COLORS]}>
                            {STATUS_LABELS[request.status as keyof typeof STATUS_LABELS] || request.status}
                        </Tag>
                    </p>
                    <p style={{ marginBottom: 0 }}>
                        <strong>Дата создания:</strong> {new Date(request.created_at).toLocaleDateString('ru-RU')}
                    </p>
                </div>
            )}

            <Form
                form={form}
                layout="vertical"
                initialValues={{ role: AdminRole.USER }}
            >
                <Form.Item
                    name="role"
                    label="Выберите роль для пользователя"
                    rules={[{ required: true, message: 'Пожалуйста, выберите роль' }]}
                >
                    <Select
                        placeholder="Выберите роль"
                        onChange={(value) => setSelectedRole(value)}
                        options={ROLE_OPTIONS.map(option => ({
                            value: option.value,
                            label: option.label
                        }))}
                    />
                </Form.Item>

                {selectedRole && (
                    <div style={{
                        padding: '12px 16px',
                        background: '#f0f2f5',
                        borderRadius: 8,
                        marginTop: -8
                    }}>
                        <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
                            {ROLE_OPTIONS.find(r => r.value === selectedRole)?.description}
                        </p>
                    </div>
                )}
            </Form>
        </Modal>
    );
}
