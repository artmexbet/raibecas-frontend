import { memo, useCallback, useState } from 'react';
import { Button, Form, Input, List, Modal, Space, message } from 'antd';
import { AppstoreOutlined, PlusOutlined } from '@ant-design/icons';
import type { Category } from '@/types/document';
import { categoryService } from '@/services/category.service';
import { ModalHeader } from '@/components';

interface CategorySelectModalProps {
  visible: boolean;
  categories: Category[];
  selectedId?: number;
  onClose: () => void;
  onSelect: (categoryId: number) => void;
  onAddCategory?: (category: Category) => void;
}

const IconBadge = memo(function IconBadge() {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--paper-deep)',
        border: '1px solid var(--hairline-strong)',
        color: 'var(--ochre-deep)',
        fontSize: 16,
      }}
    >
      <AppstoreOutlined />
    </div>
  );
});

export const CategorySelectModal = memo(function CategorySelectModal({
  visible,
  categories,
  selectedId,
  onClose,
  onSelect,
  onAddCategory,
}: CategorySelectModalProps) {
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryForm] = Form.useForm<{ title: string }>();
  const [loading, setLoading] = useState(false);

  const handleClose = useCallback(() => {
    setAddingCategory(false);
    newCategoryForm.resetFields();
    onClose();
  }, [newCategoryForm, onClose]);

  const handleSelect = useCallback(
    (categoryId: number) => {
      onSelect(categoryId);
      handleClose();
    },
    [onSelect, handleClose],
  );

  const handleAdd = useCallback(
    async (values: { title: string }) => {
      try {
        setLoading(true);
        const newCategory = await categoryService.create({ title: values.title });
        onAddCategory?.(newCategory);
        message.success('Категория успешно добавлена');
        onSelect(newCategory.id);
        handleClose();
      } catch (error) {
        message.error('Ошибка при добавлении категории');
        console.error('Error adding category:', error);
      } finally {
        setLoading(false);
      }
    },
    [onAddCategory, onSelect, handleClose],
  );

  const handleCancelAdding = useCallback(() => {
    setAddingCategory(false);
    newCategoryForm.resetFields();
  }, [newCategoryForm]);

  const handleOpenAdding = useCallback(() => setAddingCategory(true), []);

  return (
    <Modal
      title={
        <ModalHeader
          eyebrow="Справочник"
          title="Тематический раздел"
          hint="Категория, в которую попадёт документ"
        />
      }
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
              onClick={handleOpenAdding}
            >
              Добавить новую категорию
            </Button>
          </div>
          <List
            dataSource={categories}
            locale={{ emptyText: 'Пока нет категорий' }}
            renderItem={(category) => {
              const isSelected = selectedId === category.id;
              return (
                <List.Item
                  style={{
                    padding: '14px 4px',
                    borderBottom: '1px solid var(--hairline)',
                  }}
                  actions={[
                    <Button
                      key="select"
                      type={isSelected ? 'default' : 'primary'}
                      onClick={() => handleSelect(category.id)}
                      disabled={isSelected}
                    >
                      {isSelected ? 'Выбрана' : 'Выбрать'}
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
                        {category.title}
                      </span>
                    }
                  />
                </List.Item>
              );
            }}
          />
        </>
      ) : (
        <Form form={newCategoryForm} layout="vertical" onFinish={handleAdd}>
          <Form.Item
            name="title"
            label="Название категории"
            rules={[
              { required: true, message: 'Введите название категории' },
              { min: 2, message: 'Название должно содержать минимум 2 символа' },
              { max: 100, message: 'Максимум 100 символов' },
            ]}
          >
            <Input size="large" placeholder="Введите название категории" autoFocus />
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
