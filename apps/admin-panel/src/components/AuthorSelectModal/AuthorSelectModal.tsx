import React, { useState } from 'react';
import { Modal, Button, List, Form, Input, Space, message } from 'antd';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import type { Author } from '@/types/document';
import { authorService } from '@/services/author.service';

interface AuthorSelectModalProps {
    visible: boolean;
    authors: Author[];
    onClose: () => void;
    onSelect: (authorId: string) => void;
    onAddAuthor?: (author: Author) => void;
}

export const AuthorSelectModal: React.FC<AuthorSelectModalProps> = ({
    visible,
    authors,
    onClose,
    onSelect,
    onAddAuthor,
}) => {
    const [addingAuthor, setAddingAuthor] = useState(false);
    const [newAuthorForm] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        setAddingAuthor(false);
        newAuthorForm.resetFields();
        onClose();
    };

    const handleSelectAuthor = (authorId: string) => {
        onSelect(authorId);
        handleClose();
    };

    const handleAddAuthor = async (values: { name: string }) => {
        try {
            setLoading(true);

            // Отправляем запрос на сервер
            const newAuthor = await authorService.create({ name: values.name });

            // Вызываем коллбэк для добавления автора в локальный список
            if (onAddAuthor) {
                onAddAuthor(newAuthor);
            }

            // Автоматически выбираем нового автора
            onSelect(newAuthor.id);

            message.success('Автор успешно добавлен');
            handleClose();
        } catch (error) {
            message.error('Ошибка при добавлении автора');
            console.error('Error adding author:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAddingAuthor = () => {
        setAddingAuthor(false);
        newAuthorForm.resetFields();
    };

    return (
        <Modal
            title="Выбор автора"
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={600}
        >
            {!addingAuthor ? (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            block
                            onClick={() => setAddingAuthor(true)}
                        >
                            Добавить нового автора
                        </Button>
                    </div>
                    <List
                        dataSource={authors}
                        renderItem={(author) => (
                            <List.Item
                                actions={[
                                    <Button
                                        key="select"
                                        type="primary"
                                        onClick={() => handleSelectAuthor(author.id)}
                                    >
                                        Выбрать
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<UserOutlined style={{ fontSize: 24 }} />}
                                    title={author.name}
                                />
                            </List.Item>
                        )}
                    />
                </>
            ) : (
                <Form
                    form={newAuthorForm}
                    layout="vertical"
                    onFinish={handleAddAuthor}
                >
                    <Form.Item
                        name="name"
                        label="Имя автора"
                        rules={[
                            { required: true, message: 'Введите имя автора' },
                            { min: 2, message: 'Имя должно содержать минимум 2 символа' },
                        ]}
                    >
                        <Input
                            size="large"
                            placeholder="Введите имя автора"
                            autoFocus
                        />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Добавить
                            </Button>
                            <Button onClick={handleCancelAddingAuthor} disabled={loading}>
                                Отмена
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            )}
        </Modal>
    );
};
