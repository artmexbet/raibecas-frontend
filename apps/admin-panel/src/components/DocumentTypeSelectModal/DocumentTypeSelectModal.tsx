import React from 'react';
import { Modal, List, Button } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import type { DocumentType } from '@/types/document';

interface DocumentTypeSelectModalProps {
    visible: boolean;
    documentTypes: DocumentType[];
    selectedId?: number;
    onClose: () => void;
    onSelect: (documentTypeId: number) => void;
}

export const DocumentTypeSelectModal: React.FC<DocumentTypeSelectModalProps> = ({
    visible,
    documentTypes,
    selectedId,
    onClose,
    onSelect,
}) => {
    const handleSelect = (id: number) => {
        onSelect(id);
        onClose();
    };

    return (
        <Modal
            title="Выбор типа документа"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={520}
        >
            <List
                dataSource={documentTypes}
                locale={{ emptyText: 'Нет доступных типов документа' }}
                renderItem={(type) => (
                    <List.Item
                        actions={[
                            <Button
                                key="select"
                                type={selectedId === type.id ? 'default' : 'primary'}
                                onClick={() => handleSelect(type.id)}
                                disabled={selectedId === type.id}
                            >
                                {selectedId === type.id ? 'Выбран' : 'Выбрать'}
                            </Button>,
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<FileTextOutlined style={{ fontSize: 20 }} />}
                            title={type.name}
                        />
                    </List.Item>
                )}
            />
        </Modal>
    );
};
