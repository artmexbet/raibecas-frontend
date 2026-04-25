import { memo, useCallback, useState } from 'react';
import { Button, Form, Input, List, Modal, Space, message } from 'antd';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import type { Author } from '@/types/document';
import { authorService } from '@/services/author.service';
import { ModalHeader } from '@/components';

interface AuthorSelectModalProps {
  visible: boolean;
  authors: Author[];
  onClose: () => void;
  onSelect: (authorId: string) => void;
  onAddAuthor?: (author: Author) => void;
}

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

export const AuthorSelectModal = memo(function AuthorSelectModal({
  visible,
  authors,
  onClose,
  onSelect,
  onAddAuthor,
}: AuthorSelectModalProps) {
  const [addingAuthor, setAddingAuthor] = useState(false);
  const [newAuthorForm] = Form.useForm<{ name: string }>();
  const [loading, setLoading] = useState(false);

  const handleClose = useCallback(() => {
    setAddingAuthor(false);
    newAuthorForm.resetFields();
    onClose();
  }, [newAuthorForm, onClose]);

  const handleSelectAuthor = useCallback(
    (authorId: string) => {
      onSelect(authorId);
      handleClose();
    },
    [onSelect, handleClose],
  );

  const handleAddAuthor = useCallback(
    async (values: { name: string }) => {
      try {
        setLoading(true);
        const newAuthor = await authorService.create({ name: values.name });
        onAddAuthor?.(newAuthor);
        onSelect(newAuthor.id);
        message.success('Автор успешно добавлен');
        handleClose();
      } catch (error) {
        message.error('Ошибка при добавлении автора');
        console.error('Error adding author:', error);
      } finally {
        setLoading(false);
      }
    },
    [onAddAuthor, onSelect, handleClose],
  );

  const handleCancelAdding = useCallback(() => {
    setAddingAuthor(false);
    newAuthorForm.resetFields();
  }, [newAuthorForm]);

  const handleOpenAdding = useCallback(() => setAddingAuthor(true), []);

  return (
    <Modal
      title={
        <ModalHeader
          eyebrow="Участники"
          title="Выбор автора"
          hint="Имя автора или соавтора публикации"
        />
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={600}
    >
      {!addingAuthor ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <Button type="dashed" icon={<PlusOutlined />} block onClick={handleOpenAdding}>
              Добавить нового автора
            </Button>
          </div>
          <List
            dataSource={authors}
            locale={{ emptyText: 'Пока нет авторов' }}
            renderItem={(author) => (
              <List.Item
                style={{
                  padding: '14px 4px',
                  borderBottom: '1px solid var(--hairline)',
                }}
                actions={[
                  <Button
                    key="select"
                    type="primary"
                    onClick={() => handleSelectAuthor(author.id)}
                  >
                    Выбрать
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
                      {author.name}
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        </>
      ) : (
        <Form form={newAuthorForm} layout="vertical" onFinish={handleAddAuthor}>
          <Form.Item
            name="name"
            label="Имя автора"
            rules={[
              { required: true, message: 'Введите имя автора' },
              { min: 2, message: 'Имя должно содержать минимум 2 символа' },
            ]}
          >
            <Input size="large" placeholder="Введите имя автора" autoFocus />
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
});
