import React, { useEffect, useState } from 'react';
import {
    Modal,
    Button,
    Form,
    Input,
    Select,
    Space,
    List,
    Tag,
    Divider,
    message,
    Empty,
} from 'antd';
import { DeleteOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import type { Author, AuthorshipType, DocumentParticipantRef } from '@/types/document';
import { authorService } from '@/services/author.service';

interface ParticipantsSelectModalProps {
    visible: boolean;
    authors: Author[];
    authorshipTypes: AuthorshipType[];
    selectedParticipants: DocumentParticipantRef[];
    onClose: () => void;
    onSelect: (participants: DocumentParticipantRef[]) => void;
    onAddAuthor?: (author: Author) => void;
}

interface AddRowFormValues {
    authorId?: string;
    typeId?: number;
    newAuthorName?: string;
}

type AddMode = 'existing' | 'new';

export const ParticipantsSelectModal: React.FC<ParticipantsSelectModalProps> = ({
    visible,
    authors,
    authorshipTypes,
    selectedParticipants,
    onClose,
    onSelect,
    onAddAuthor,
}) => {
    const [localParticipants, setLocalParticipants] = useState<DocumentParticipantRef[]>(selectedParticipants);
    const [addMode, setAddMode] = useState<AddMode>('existing');
    const [addForm] = Form.useForm<AddRowFormValues>();
    const [creatingAuthor, setCreatingAuthor] = useState(false);

    useEffect(() => {
        if (visible) {
            setLocalParticipants(selectedParticipants);
            setAddMode('existing');
            addForm.resetFields();
        }
    }, [visible, selectedParticipants, addForm]);

    const findAuthor = (id: string) => authors.find((a) => a.id === id);
    const findAuthorshipType = (id: number) => authorshipTypes.find((t) => t.id === id);

    const handleRemove = (index: number) => {
        setLocalParticipants((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAddExisting = async (values: AddRowFormValues) => {
        if (!values.authorId || !values.typeId) return;

        const exists = localParticipants.some(
            (p) => p.authorId === values.authorId && p.typeId === values.typeId,
        );
        if (exists) {
            message.warning('Такой участник с этой ролью уже добавлен');
            return;
        }

        setLocalParticipants((prev) => [
            ...prev,
            { authorId: values.authorId!, typeId: values.typeId! },
        ]);
        addForm.resetFields();
    };

    const handleAddNew = async (values: AddRowFormValues) => {
        if (!values.newAuthorName || !values.typeId) return;

        try {
            setCreatingAuthor(true);
            const created = await authorService.create({ name: values.newAuthorName.trim() });
            if (onAddAuthor) {
                onAddAuthor(created);
            }
            setLocalParticipants((prev) => [
                ...prev,
                { authorId: created.id, typeId: values.typeId! },
            ]);
            addForm.resetFields();
            setAddMode('existing');
            message.success('Автор добавлен');
        } catch (error) {
            message.error('Ошибка при добавлении автора');
            console.error('Error creating author:', error);
        } finally {
            setCreatingAuthor(false);
        }
    };

    const handleConfirm = () => {
        onSelect(localParticipants);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    const authorOptions = authors.map((a) => ({ label: a.name, value: a.id }));
    const typeOptions = authorshipTypes.map((t) => ({ label: t.title, value: t.id }));

    return (
        <Modal
            title="Участники документа"
            open={visible}
            onCancel={handleCancel}
            onOk={handleConfirm}
            okText="Применить"
            cancelText="Отмена"
            width={720}
            okButtonProps={{ disabled: localParticipants.length === 0 }}
        >
            <div style={{ marginBottom: 16 }}>
                <strong>Текущие участники:</strong>
                {localParticipants.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Пока не выбран ни один участник"
                        style={{ marginTop: 8 }}
                    />
                ) : (
                    <List
                        style={{ marginTop: 8 }}
                        dataSource={localParticipants}
                        renderItem={(participant, index) => {
                            const author = findAuthor(participant.authorId);
                            const type = findAuthorshipType(participant.typeId);
                            return (
                                <List.Item
                                    actions={[
                                        <Button
                                            key="remove"
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleRemove(index)}
                                        >
                                            Удалить
                                        </Button>,
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<UserOutlined style={{ fontSize: 20 }} />}
                                        title={author?.name ?? 'Неизвестный автор'}
                                        description={
                                            <Tag color="blue">
                                                {type?.title ?? 'неизвестная роль'}
                                            </Tag>
                                        }
                                    />
                                </List.Item>
                            );
                        }}
                    />
                )}
            </div>

            <Divider />

            <div style={{ marginBottom: 8 }}>
                <Space>
                    <Button
                        type={addMode === 'existing' ? 'primary' : 'default'}
                        onClick={() => {
                            setAddMode('existing');
                            addForm.resetFields(['newAuthorName']);
                        }}
                    >
                        Выбрать из списка
                    </Button>
                    <Button
                        type={addMode === 'new' ? 'primary' : 'default'}
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setAddMode('new');
                            addForm.resetFields(['authorId']);
                        }}
                    >
                        Новый автор
                    </Button>
                </Space>
            </div>

            <Form
                form={addForm}
                layout="vertical"
                onFinish={addMode === 'existing' ? handleAddExisting : handleAddNew}
            >
                {addMode === 'existing' ? (
                    <Form.Item
                        name="authorId"
                        label="Автор"
                        rules={[{ required: true, message: 'Выберите автора' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Найдите и выберите автора"
                            options={authorOptions}
                            optionFilterProp="label"
                            size="large"
                        />
                    </Form.Item>
                ) : (
                    <Form.Item
                        name="newAuthorName"
                        label="Имя нового автора"
                        rules={[
                            { required: true, message: 'Введите имя автора' },
                            { min: 2, message: 'Минимум 2 символа' },
                            { max: 255, message: 'Максимум 255 символов' },
                        ]}
                    >
                        <Input size="large" placeholder="Введите имя нового автора" />
                    </Form.Item>
                )}

                <Form.Item
                    name="typeId"
                    label="Роль"
                    rules={[{ required: true, message: 'Выберите роль' }]}
                >
                    <Select
                        placeholder="Выберите роль"
                        options={typeOptions}
                        size="large"
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        htmlType="submit"
                        loading={creatingAuthor}
                        block
                    >
                        Добавить участника
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};
