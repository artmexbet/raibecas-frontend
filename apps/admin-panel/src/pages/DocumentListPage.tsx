import {documentService} from "@/services/document.service";
import {useEffect, useState} from "react";
import { useNavigate } from '@tanstack/react-router';
import { Table, Card, Input, Button, Space, Tag, message, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { Document as DocumentType, Tag as TagType } from '@/types/document';
const { Search } = Input;

export function DocumentListPage() {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<DocumentType[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    // Загрузка документов при монтировании компонента
    useEffect(() => {
        loadDocuments();
    }, []);
    const loadDocuments = async () => {
        try {
            setLoading(true);
            const data = await documentService.getAll();
            setDocuments(data);
        } catch (error) {
            message.error('Ошибка при загрузке документов');
            console.error('Error loading documents:', error);
        } finally {
            setLoading(false);
        }
    };
    // Фильтрация документов по поисковому запросу  //todo: вынести фильтрацию на ответственность бэкенда
    const filteredDocuments = documents.filter((doc: DocumentType) => {
        const search = searchText.toLowerCase();
        return (
            doc.title?.toLowerCase().includes(search) ||
            doc.author?.name.toLowerCase().includes(search) ||
            doc.category?.title.toLowerCase().includes(search) ||
            doc.tags?.some((tag: TagType) => tag.title.toLowerCase().includes(search))
        );
    });
    // Колонки таблицы
    const columns: ColumnsType<DocumentType> = [
        {
            title: 'Название',
            dataIndex: 'title',
            key: 'title',
            width: '25%',
            sorter: (a: DocumentType, b: DocumentType) => a.title.localeCompare(b.title),
        },
        {
            title: 'Автор',
            dataIndex: ['author', 'name'],
            key: 'author',
            width: '15%',
            sorter: (a: DocumentType, b: DocumentType) => a.author.name.localeCompare(b.author.name),
        },
        {
            title: 'Категория',
            dataIndex: ['category', 'title'],
            key: 'category',
            width: '15%',
            filters: [...new Set(documents.map((doc: DocumentType) => doc.category.title))].
            map((title: string) => ({
                text: title,
                value: title,
            })),
            onFilter: (value: any, record: DocumentType) => record.category.title === value,
        },
        {
            title: 'Теги',
            dataIndex: 'tags',
            key: 'tags',
            width: '20%',
            render: (tags: TagType[]) => (
                <>
                    {tags?.map((tag: TagType) => (
                        <Tag color="blue" key={tag.id}>
                            {tag.title}
                        </Tag>
                    ))}
                </>
            ),
        },
        // {
        //     title: 'Просмотры',
        //     dataIndex: 'views',
        //     key: 'views',
        //     width: '10%',
        //     sorter: (a: DocumentType, b: DocumentType) => a.views - b.views,
        //     align: 'center' as const,
        // },
        // {
        //     title: 'Заметки',
        //     dataIndex: 'notesCount',
        //     key: 'notesCount',
        //     width: '10%',
        //     sorter: (a: DocumentType, b: DocumentType) => a.notesCount - b.notesCount,
        //     align: 'center' as const,
        // },
        {
            title: 'Действия',
            key: 'actions',
            width: '15%',
            render: (_: any, record: DocumentType) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleView(record);
                        }}
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(record);
                        }}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(record);
                        }}
                    />
                </Space>
            ),
        },
    ];
    const handleView = (record: DocumentType) => {
        navigate({ to: `/documents/${record.id}` });
    };
    const handleEdit = (record: DocumentType) => {
        navigate({ to: `/documents/${record.id}/edit` });
    };
    const handleDelete = (record: DocumentType) => {
        Modal.confirm({
            title: 'Подтверждение удаления',
            icon: <ExclamationCircleOutlined />,
            content: `Вы действительно хотите удалить документ "${record.title}"? Это действие необратимо.`,
            okText: 'Удалить',
            okType: 'danger',
            cancelText: 'Отмена',
            onOk: async () => {
                try {
                    await documentService.delete(record.id);
                    message.success('Документ успешно удален');
                    await loadDocuments(); // Перезагружаем список
                } catch (error) {
                    message.error('Ошибка при удалении документа');
                    console.error('Error deleting document:', error);
                }
            },
        });
    };
    const handleCreate = () => {
        navigate({ to: '/documents/new' });
    };
    return (
        <div>
            <h1 style={{ marginBottom: 24 }}>Научные работы философов</h1>
            <Card>
                <Space size="large" style={{ width: '100%' }} orientation="vertical">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Search
                            placeholder="Поиск по названию, автору, категории или тегам"
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            style={{ width: 400 }}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={handleCreate}
                        >
                            Добавить документ
                        </Button>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={filteredDocuments}
                        loading={loading}
                        rowKey="id"
                        onRow={(record: DocumentType) => ({
                            onClick: () => handleView(record),
                            style: { cursor: 'pointer' },
                        })}
                        //todo: вынести пагинацию на ответственность бэкенда
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total: number) => `Всего документов: ${total}`,
                        }}
                    />
                </Space>
            </Card>
        </div>
    );
}
