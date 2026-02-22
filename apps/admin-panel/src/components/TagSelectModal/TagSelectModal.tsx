import React, { useState } from 'react';
import { Modal, Button, Form, Input, Space, message, Checkbox } from 'antd';
import { PlusOutlined, TagOutlined } from '@ant-design/icons';
import type { Tag } from '@/types/document';
import { tagService } from '@/services/tag.service';

interface TagSelectModalProps {
    visible: boolean;
    tags: Tag[];
    selectedTagIds: number[];
    onClose: () => void;
    onSelect: (tagIds: number[]) => void;
    onAddTag?: (tag: Tag) => void;
}

export const TagSelectModal: React.FC<TagSelectModalProps> = ({
    visible,
    tags,
    selectedTagIds,
    onClose,
    onSelect,
    onAddTag,
}) => {
    const [addingTag, setAddingTag] = useState(false);
    const [newTagForm] = Form.useForm();
    const [localSelectedIds, setLocalSelectedIds] = useState<number[]>(selectedTagIds);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        setLocalSelectedIds(selectedTagIds);
    }, [selectedTagIds]);

    const handleClose = () => {
        setAddingTag(false);
        newTagForm.resetFields();
        onClose();
    };

    const handleConfirm = () => {
        onSelect(localSelectedIds);
        handleClose();
    };

    const handleToggleTag = (tagId: number) => {
        setLocalSelectedIds(prev => {
            if (prev.includes(tagId)) {
                return prev.filter(id => id !== tagId);
            }
            return [...prev, tagId];
        });
    };

    const handleAddTag = async (values: { title: string }) => {
        try {
            setLoading(true);

            // Отправляем запрос на сервер
            const newTag = await tagService.create({ title: values.title });

            if (onAddTag) {
                onAddTag(newTag);
            }

            // Автоматически выбираем новый тег
            setLocalSelectedIds(prev => [...prev, newTag.id]);

            message.success('Тег успешно добавлен');
            setAddingTag(false);
            newTagForm.resetFields();
        } catch (error) {
            message.error('Ошибка при добавлении тега');
            console.error('Error adding tag:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAddingTag = () => {
        setAddingTag(false);
        newTagForm.resetFields();
    };

    return (
        <Modal
            title="Выбор тегов"
            open={visible}
            onCancel={handleClose}
            onOk={handleConfirm}
            okText="Применить"
            cancelText="Отмена"
            width={600}
        >
            {!addingTag ? (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            block
                            onClick={() => setAddingTag(true)}
                        >
                            Добавить новый тег
                        </Button>
                    </div>
                    <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                        <Space size={[0, 8]} wrap style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            {tags.map(tag => (
                                <Checkbox
                                    key={tag.id}
                                    checked={localSelectedIds.includes(tag.id)}
                                    onChange={() => handleToggleTag(tag.id)}
                                >
                                    <Space>
                                        <TagOutlined />
                                        {tag.title}
                                    </Space>
                                </Checkbox>
                            ))}
                        </Space>
                    </div>
                    <div style={{ marginTop: 16, color: '#666' }}>
                        Выбрано: {localSelectedIds.length}
                    </div>
                </>
            ) : (
                <Form
                    form={newTagForm}
                    layout="vertical"
                    onFinish={handleAddTag}
                >
                    <Form.Item
                        name="title"
                        label="Название тега"
                        rules={[
                            { required: true, message: 'Введите название тега' },
                            { min: 2, message: 'Название должно содержать минимум 2 символа' },
                        ]}
                    >
                        <Input
                            size="large"
                            placeholder="Введите название тега"
                            autoFocus
                        />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Добавить
                            </Button>
                            <Button onClick={handleCancelAddingTag} disabled={loading}>
                                Отмена
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            )}
        </Modal>
    );
};
