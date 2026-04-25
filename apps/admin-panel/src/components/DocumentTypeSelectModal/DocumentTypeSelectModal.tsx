import { memo, useCallback } from 'react';
import { Button, List, Modal } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import type { DocumentType } from '@/types/document';
import { ModalHeader } from '@/components';

interface DocumentTypeSelectModalProps {
  visible: boolean;
  documentTypes: DocumentType[];
  selectedId?: number;
  onClose: () => void;
  onSelect: (documentTypeId: number) => void;
}

const LIST_EMPTY_TEXT = 'Нет доступных типов документа';

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
      <FileTextOutlined />
    </div>
  );
});

export const DocumentTypeSelectModal = memo(function DocumentTypeSelectModal({
  visible,
  documentTypes,
  selectedId,
  onClose,
  onSelect,
}: DocumentTypeSelectModalProps) {
  const handleSelect = useCallback(
    (id: number) => {
      onSelect(id);
      onClose();
    },
    [onSelect, onClose],
  );

  return (
    <Modal
      title={
        <ModalHeader
          eyebrow="Справочник"
          title="Тип документа"
          hint="Выберите формат или категорию научной работы"
        />
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={520}
    >
      <List
        dataSource={documentTypes}
        locale={{ emptyText: LIST_EMPTY_TEXT }}
        renderItem={(type) => {
          const isSelected = selectedId === type.id;
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
                  onClick={() => handleSelect(type.id)}
                  disabled={isSelected}
                >
                  {isSelected ? 'Выбран' : 'Выбрать'}
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
                    {type.name}
                  </span>
                }
              />
            </List.Item>
          );
        }}
      />
    </Modal>
  );
});
