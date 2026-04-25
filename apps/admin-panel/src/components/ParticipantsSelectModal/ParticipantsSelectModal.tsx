import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Divider,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Select,
  Space,
  Tag,
  message,
} from 'antd';
import { DeleteOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import type { Author, AuthorshipType, DocumentParticipantRef } from '@/types/document';
import { authorService } from '@/services/author.service';
import { ModalHeader } from '@/components';

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

const IconBadge = memo(function IconBadge() {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--paper-deep)',
        border: '1px solid var(--hairline-strong)',
        color: 'var(--ochre-deep)',
        fontSize: 16,
      }}
    >
      <UserOutlined />
    </div>
  );
});

export const ParticipantsSelectModal = memo(function ParticipantsSelectModal({
  visible,
  authors,
  authorshipTypes,
  selectedParticipants,
  onClose,
  onSelect,
  onAddAuthor,
}: ParticipantsSelectModalProps) {
  const [localParticipants, setLocalParticipants] =
    useState<DocumentParticipantRef[]>(selectedParticipants);
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

  /* -- O(1) lookups -- */
  const authorsById = useMemo(() => {
    const map = new Map<string, Author>();
    for (let i = 0; i < authors.length; i++) {
      const a = authors[i]!;
      map.set(a.id, a);
    }
    return map;
  }, [authors]);

  const typesById = useMemo(() => {
    const map = new Map<number, AuthorshipType>();
    for (let i = 0; i < authorshipTypes.length; i++) {
      const t = authorshipTypes[i]!;
      map.set(t.id, t);
    }
    return map;
  }, [authorshipTypes]);

  const authorOptions = useMemo(
    () => authors.map((a) => ({ label: a.name, value: a.id })),
    [authors],
  );
  const typeOptions = useMemo(
    () => authorshipTypes.map((t) => ({ label: t.title, value: t.id })),
    [authorshipTypes],
  );

  const handleRemove = useCallback((index: number) => {
    setLocalParticipants((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddExisting = useCallback(
    (values: AddRowFormValues) => {
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
    },
    [localParticipants, addForm],
  );

  const handleAddNew = useCallback(
    async (values: AddRowFormValues) => {
      if (!values.newAuthorName || !values.typeId) return;

      try {
        setCreatingAuthor(true);
        const created = await authorService.create({ name: values.newAuthorName.trim() });
        onAddAuthor?.(created);
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
    },
    [onAddAuthor, addForm],
  );

  const handleConfirm = useCallback(() => {
    onSelect(localParticipants);
    onClose();
  }, [onSelect, localParticipants, onClose]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const setModeExisting = useCallback(() => {
    setAddMode('existing');
    addForm.resetFields(['newAuthorName']);
  }, [addForm]);

  const setModeNew = useCallback(() => {
    setAddMode('new');
    addForm.resetFields(['authorId']);
  }, [addForm]);

  return (
    <Modal
      title={
        <ModalHeader
          eyebrow="Участники"
          title="Авторы и соавторы"
          hint="Соберите коллектив документа с указанием ролей"
        />
      }
      open={visible}
      onCancel={handleCancel}
      onOk={handleConfirm}
      okText="Применить"
      cancelText="Отмена"
      width={720}
      okButtonProps={{ disabled: localParticipants.length === 0 }}
    >
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ink-400)',
            marginBottom: 8,
          }}
        >
          Текущий состав
        </div>

        {localParticipants.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  color: 'var(--ink-500)',
                }}
              >
                Пока не выбран ни один участник
              </span>
            }
            style={{ marginTop: 8 }}
          />
        ) : (
          <List
            style={{ marginTop: 4 }}
            dataSource={localParticipants}
            renderItem={(participant, index) => {
              const author = authorsById.get(participant.authorId);
              const type = typesById.get(participant.typeId);
              return (
                <List.Item
                  style={{
                    padding: '12px 4px',
                    borderBottom: '1px solid var(--hairline)',
                  }}
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
                    avatar={<IconBadge />}
                    title={
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 15,
                          color: 'var(--ink-900)',
                          fontWeight: 500,
                        }}
                      >
                        {author?.name ?? 'Неизвестный автор'}
                      </span>
                    }
                    description={
                      <Tag
                        style={{
                          background: 'var(--paper-deep)',
                          color: 'var(--ink-700)',
                          borderColor: 'var(--hairline-strong)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                          letterSpacing: '0.04em',
                          textTransform: 'lowercase',
                        }}
                      >
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

      <Divider style={{ borderColor: 'var(--hairline)' }} />

      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--ink-400)',
          marginBottom: 10,
        }}
      >
        Добавить участника
      </div>

      <div style={{ marginBottom: 10 }}>
        <Space>
          <Button
            type={addMode === 'existing' ? 'primary' : 'default'}
            onClick={setModeExisting}
          >
            Выбрать из списка
          </Button>
          <Button
            type={addMode === 'new' ? 'primary' : 'default'}
            icon={<PlusOutlined />}
            onClick={setModeNew}
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
          <Select placeholder="Выберите роль" options={typeOptions} size="large" />
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
});
