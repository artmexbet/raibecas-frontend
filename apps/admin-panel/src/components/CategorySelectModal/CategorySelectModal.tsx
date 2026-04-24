import React, { useState } from 'react';
import { Modal, Button, Form, Input, List, Space, message } from 'antd';
import { AppstoreOutlined, PlusOutlined } from '@ant-design/icons';
import type { Category } from '@/types/document';
import { categoryService } from '@/services/category.service';

interface CategorySelectModalProps {
    visible: boolean;
    categories: Category[];
    selectedId?: number;
    onClose: () => void;
    onSelect: (categoryId: number) => void;
    onAddCategory?: (category: Category) => void;
}

export const CategorySelectModal: React.FC<CategorySelectModalProps> = ({
    visible,
    categories,
    selectedId,
    onClose,
    onSelect,
    onAddCategory,
}) => {
    const [addingCategory, setAddingCategory] = useState(false);
    const [newCategoryForm] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        setAddingCategory(false);
        newCategoryForm.resetFields();
        onClose();
    };

    const handleSelect = (categoryId: number) => {
        onSelect(categoryId);
        handleClose();
    };

    const handleAdd = async (values: { title: string }) => {
        try {
            setLoading(true);
            const newCategory = await categoryService.create({ title: values.title });

            if (onAddCategory) {
                onAddCategory(newCategory);
            }

            message.success('Категория успешно добавлена');
            onSelect(newCategory.id);
            handleClose();
        } catch (error) {
            message.error('Ошибка при добавлении категории');
            console.error('Error adding category:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAdding = () => {
        setAddingCategory(false);
        newCategoryForm.resetFields();
    };

    return (
        <Modal
            title="Выбор категории"
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={560}
        >
            {!addingCategory ? (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            block
                            onClick={() => setAddingCategory(true)}
                        >
                            Добавить новую категорию
                        </Button>
                    </div>
                    <List
                        dataSource={categories}
                        locale={{ emptyText: 'Пока нет категорий' }}
                        renderItem={(category) => (
                            <List.Item
                                actions={[
                                    <Button
                                        key="select"
                                        type={selectedId === category.id ? 'default' : 'primary'}
                                        onClick={() => handleSelect(category.id)}
                                        disabled={selectedId === category.id}
                                    >
                                        {selectedId === category.id ? 'Выбрана' : 'Выбрать'}
                                    </Button>,
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<AppstoreOutlined style={{ fontSize: 20 }} />}
                                    title={category.title}
                                />
                            </List.Item>
                        )}
                    />
                </>
            ) : (
                <Form
                    form={newCategoryForm}
                    layout="vertical"
                    onFinish={handleAdd}
                >
                    <Form.Item
                        name="title"
                        label="Название категории"
                        rules={[
                            { required: true, message: 'Введите название категории' },
                            { min: 2, message: 'Название должно содержать минимум 2 символа' },
                            { max: 100, message: 'Максимум 100 символов' },
                        ]}
                    >
                        <Input
                            size="large"
                            placeholder="Введите название категории"
                            autoFocus
                        />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Добавить
                            </Button>
                            <Button onClick={handleCancelAdding} disabled={loading}>
                                Отмена
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            )}
        </Modal>
    );
};
