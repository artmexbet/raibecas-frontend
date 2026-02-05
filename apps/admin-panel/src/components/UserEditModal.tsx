import { Modal, Form, Input, Select, Switch, message } from 'antd';
import { useEffect, useState } from 'react';
import { AdminRole } from '@/types/permissions';
import type { User } from '@/types';

interface UserEditModalProps {
    visible: boolean;
    user: User | null;
    onCancel: () => void;
    onSave: (userId: string, data: Partial<User>) => Promise<void>;
}

const ROLE_OPTIONS = [
    {
        value: AdminRole.USER,
        label: 'Пользователь',
        description: 'Базовый доступ'
    },
    {
        value: AdminRole.ADMIN,
        label: 'Администратор',
        description: 'Базовые права доступа'
    },
    {
        value: AdminRole.SUPER_ADMIN,
        label: 'Суперадминистратор',
        description: 'Полные права доступа'
    }
];

export function UserEditModal({ visible, user, onCancel, onSave }: UserEditModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<AdminRole | undefined>(undefined);

    useEffect(() => {
        if (visible && user) {
            form.setFieldsValue({
                username: user.username,
                full_name: user.full_name,
                email: user.email,
                role: user.role || AdminRole.ADMIN,
                is_active: user.is_active,
            });
            setSelectedRole(user.role as AdminRole || AdminRole.ADMIN);
        } else {
            form.resetFields();
            setSelectedRole(undefined);
        }
    }, [visible, user, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!user) return;

            setLoading(true);
            await onSave(user.id, values);
            form.resetFields();
            setSelectedRole(undefined);
        } catch (error) {
            console.error('Ошибка при сохранении пользователя:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setSelectedRole(undefined);
        onCancel();
    };

    return (
        <Modal
            title="Редактирование пользователя"
            open={visible}
            onCancel={handleCancel}
            onOk={handleSubmit}
            okText="Сохранить"
            cancelText="Отмена"
            confirmLoading={loading}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
            >
                <Form.Item
                    name="username"
                    label="Имя пользователя"
                    rules={[
                        { required: true, message: 'Пожалуйста, введите имя пользователя' },
                        { min: 3, message: 'Минимум 3 символа' }
                    ]}
                >
                    <Input placeholder="Введите имя пользователя" />
                </Form.Item>

                <Form.Item
                    name="full_name"
                    label="Полное имя"
                    rules={[
                        { required: true, message: 'Пожалуйста, введите полное имя' }
                    ]}
                >
                    <Input placeholder="Введите полное имя" />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: 'Пожалуйста, введите email' },
                        { type: 'email', message: 'Введите корректный email' }
                    ]}
                >
                    <Input placeholder="Введите email" type="email" />
                </Form.Item>

                <Form.Item
                    name="role"
                    label="Роль"
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
                        marginTop: -8,
                        marginBottom: 16
                    }}>
                        <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
                            {ROLE_OPTIONS.find(r => r.value === selectedRole)?.description}
                        </p>
                    </div>
                )}

                <Form.Item
                    name="is_active"
                    label="Статус"
                    valuePropName="checked"
                >
                    <Switch
                        checkedChildren="Активен"
                        unCheckedChildren="Неактивен"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
