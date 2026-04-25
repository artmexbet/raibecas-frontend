import { memo, useCallback, useEffect, useState } from 'react';
import { Button, Checkbox, Form, Input, Modal, Space, message } from 'antd';
import { PlusOutlined, TagOutlined } from '@ant-design/icons';
import type { Tag } from '@/types/document';
import { tagService } from '@/services/tag.service';
import { ModalHeader } from '@/components';

interface TagSelectModalProps {
  visible: boolean;
  tags: Tag[];
  selectedTagIds: number[];
  onClose: () => void;
  onSelect: (tagIds: number[]) => void;
  onAddTag?: (tag: Tag) => void;
}

const TAG_PILL_BASE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 12px',
  borderRadius: 999,
  border: '1px solid var(--hairline-strong)',
  background: 'var(--paper-soft)',
  color: 'var(--ink-700)',
  fontSize: 13,
  fontFamily: 'var(--font-body)',
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'all 0.15s ease',
};

const TAG_PILL_ACTIVE: React.CSSProperties = {
  ...TAG_PILL_BASE,
  background: 'var(--ink-800)',
  color: 'var(--paper-soft)',
  borderColor: 'var(--ink-800)',
};

export const TagSelectModal = memo(function TagSelectModal({
  visible,
  tags,
  selectedTagIds,
  onClose,
  onSelect,
  onAddTag,
}: TagSelectModalProps) {
  const [addingTag, setAddingTag] = useState(false);
  const [newTagForm] = Form.useForm<{ title: string }>();
  const [localSelectedIds, setLocalSelectedIds] = useState<number[]>(selectedTagIds);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalSelectedIds(selectedTagIds);
  }, [selectedTagIds]);

  const handleClose = useCallback(() => {
    setAddingTag(false);
    newTagForm.resetFields();
    onClose();
  }, [newTagForm, onClose]);

  const handleConfirm = useCallback(() => {
    onSelect(localSelectedIds);
    handleClose();
  }, [onSelect, localSelectedIds, handleClose]);

  const handleToggleTag = useCallback((tagId: number) => {
    setLocalSelectedIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  }, []);

  const handleAddTag = useCallback(
    async (values: { title: string }) => {
      try {
        setLoading(true);
        const newTag = await tagService.create({ title: values.title });
        onAddTag?.(newTag);
        setLocalSelectedIds((prev) => [...prev, newTag.id]);
        message.success('Тег успешно добавлен');
        setAddingTag(false);
        newTagForm.resetFields();
      } catch (error) {
        message.error('Ошибка при добавлении тега');
        console.error('Error adding tag:', error);
      } finally {
        setLoading(false);
      }
    },
    [onAddTag, newTagForm],
  );

  const handleCancelAddingTag = useCallback(() => {
    setAddingTag(false);
    newTagForm.resetFields();
  }, [newTagForm]);

  const handleOpenAdding = useCallback(() => setAddingTag(true), []);

  return (
    <Modal
      title={
        <ModalHeader
          eyebrow="Справочник"
          title="Ключевые слова"
          hint="Выберите один или несколько тегов"
        />
      }
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
            <Button type="dashed" icon={<PlusOutlined />} block onClick={handleOpenAdding}>
              Добавить новый тег
            </Button>
          </div>

          <div
            style={{
              maxHeight: 320,
              overflowY: 'auto',
              padding: 4,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            {tags.length === 0 ? (
              <span
                style={{
                  color: 'var(--ink-400)',
                  fontStyle: 'italic',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Пока нет тегов
              </span>
            ) : (
              tags.map((tag) => {
                const active = localSelectedIds.includes(tag.id);
                return (
                  <Checkbox
                    key={tag.id}
                    checked={active}
                    onChange={() => handleToggleTag(tag.id)}
                    style={{ display: 'inline-flex' }}
                  >
                    <span style={active ? TAG_PILL_ACTIVE : TAG_PILL_BASE}>
                      <TagOutlined style={{ fontSize: 11 }} />
                      {tag.title}
                    </span>
                  </Checkbox>
                );
              })
            )}
          </div>

          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: '1px solid var(--hairline)',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--ink-500)',
              letterSpacing: '0.04em',
            }}
          >
            Выбрано: {localSelectedIds.length}
          </div>
        </>
      ) : (
        <Form form={newTagForm} layout="vertical" onFinish={handleAddTag}>
          <Form.Item
            name="title"
            label="Название тега"
            rules={[
              { required: true, message: 'Введите название тега' },
              { min: 2, message: 'Название должно содержать минимум 2 символа' },
            ]}
          >
            <Input size="large" placeholder="Введите название тега" autoFocus />
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
});
