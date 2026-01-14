import {useEffect, useState} from 'react';
import {useParams, useNavigate} from '@tanstack/react-router';
import {
    Form,
    Input,
    Button,
    Card,
    DatePicker,
    Select,
    message,
    Space,
    Spin,
    Alert,
    Row,
    Col
} from 'antd';
import {ArrowLeftOutlined, SaveOutlined} from '@ant-design/icons';
import {documentService} from '@/services/document.service';
import type {Document} from '@/types/document';
import dayjs from 'dayjs';
import './DocumentEditPage.css';
import {DocumentEditor} from "@/components";

export function DocumentEditPage() {
    const params = useParams({strict: false});
    const id = (params as any).id;
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [document, setDocument] = useState<Document | null>(null);

    useEffect(() => {
        if (id) {
            loadDocument(id);
        }
    }, [id]);

    const loadDocument = async (documentId: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await documentService.getById(documentId);
            setDocument(data);

            // Заполняем форму данными документа
            form.setFieldsValue({
                title: data.title,
                author: data.author,
                category: data.category,
                publicationDate: data.publicationDate ? dayjs(data.publicationDate) : null,
                content: data.content,
                tags: data.tags,
            });
        } catch (err) {
            setError('Не удалось загрузить документ');
            console.error('Error loading document:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate({to: '/documents'});
    };

    const handleSave = async (values: any) => {
        if (!document) return;

        try {
            setSaving(true);

            const updatedData = {
                ...values,
                publicationDate: values.publicationDate ? values.publicationDate.format('YYYY-MM-DD') : document.publicationDate,
            };

            await documentService.update(document.id, updatedData);
            message.success('Документ успешно сохранен');
            navigate({to: `/documents/${document.id}`});
        } catch (err) {
            message.error('Ошибка при сохранении документа');
            console.error('Error saving document:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{textAlign: 'center', padding: '100px 0'}}>
                <Spin size="large" tip="Загрузка документа..."/>
            </div>
        );
    }

    if (error || !document) {
        return (
            <div>
                <Button
                    icon={<ArrowLeftOutlined/>}
                    onClick={handleBack}
                    style={{marginBottom: 16}}
                >
                    Назад к списку
                </Button>
                <Alert
                    title="Ошибка"
                    description={error || 'Документ не найден'}
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    const handleContentChange = (value: string) => {
        form.setFieldValue('content', value);
    };

    return (
        <div>
            {/* Заголовок */}
            <div style={{marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1>Редактирование документа</h1>
                <Button
                    icon={<ArrowLeftOutlined/>}
                    onClick={handleBack}
                    size="large"
                >
                    Назад
                </Button>
            </div>

            {/* Форма редактирования */}
            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                >
                    <Form.Item
                        name="title"
                        label="Название"
                        rules={[
                            {required: true, message: 'Пожалуйста, введите название документа'},
                            {min: 3, message: 'Название должно содержать минимум 3 символа'},
                        ]}
                    >
                        <Input size="large" placeholder="Введите название документа"/>
                    </Form.Item>

                    <Form.Item
                        name="author"
                        label="Автор"
                        rules={[
                            {required: true, message: 'Пожалуйста, введите автора'},
                        ]}
                    >
                        <Input size="large" placeholder="Введите имя автора"/>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <Form.Item
                                name="category"
                                label="Категория"
                                rules={[
                                    {required: true, message: 'Пожалуйста, выберите категорию'},
                                ]}
                            >
                                <Select
                                    size="large"
                                    placeholder="Выберите категорию"
                                    options={[
                                        {label: 'Эпистемология', value: 'Эпистемология'},
                                        {label: 'Онтология', value: 'Онтология'},
                                        {label: 'Феноменология', value: 'Феноменология'},
                                        {label: 'Этика', value: 'Этика'},
                                        {label: 'Логика', value: 'Логика'},
                                        {label: 'Метафизика', value: 'Метафизика'},
                                        {label: 'Философия науки', value: 'Философия науки'},
                                        {label: 'Разное', value: 'Разное'},
                                    ]}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <Form.Item
                                name="publicationDate"
                                label="Дата публикации"
                                rules={[
                                    {required: true, message: 'Пожалуйста, выберите дату публикации'},
                                ]}
                            >
                                <DatePicker
                                    size="large"
                                    style={{width: '100%'}}
                                    placeholder="Выберите дату"
                                    format="DD.MM.YYYY"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="tags"
                        label="Теги"
                        rules={[
                            {required: true, message: 'Пожалуйста, добавьте хотя бы один тег'},
                        ]}
                    >
                        <Select
                            mode="tags"
                            size="large"
                            placeholder="Введите теги и нажмите Enter"
                            tokenSeparators={[',']}
                        />
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="Содержание"
                        rules={[
                            {required: true, message: 'Пожалуйста, введите содержание документа'},
                            {min: 10, message: 'Содержание должно содержать минимум 10 символов'},
                        ]}
                    >
                        <DocumentEditor onChange={handleContentChange} value={document.content}/>
                    </Form.Item>

                    <Form.Item>
                        <Space size="middle">
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined/>}
                                size="large"
                                loading={saving}
                            >
                                Сохранить изменения
                            </Button>
                            <Button
                                size="large"
                                onClick={handleBack}
                            >
                                Отмена
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

