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
    Col,
    Upload,
} from 'antd';
import {ArrowLeftOutlined, SaveOutlined, UserOutlined, TagsOutlined, InboxOutlined} from '@ant-design/icons';
import {documentService} from '@/services/document.service';
import {authorService} from '@/services/author.service';
import {categoryService} from '@/services/category.service';
import {tagService} from '@/services/tag.service';
import type {Document, Author, Category, Tag as TagType} from '@/types/document';
import dayjs from 'dayjs';
import './DocumentEditPage.css';
import {DocumentEditor, AuthorSelectModal, TagSelectModal} from "@/components";
import {markdownToEditorjsBlocks, editorjsToMarkdown} from "@/utils/editorjsMarkdown";

export function DocumentEditPage() {
    const params = useParams({strict: false});
    const id = (params as any).id;
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [document, setDocument] = useState<Document | null>(null);

    // Metadata states
    const [authors, setAuthors] = useState<Author[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<TagType[]>([]);
    const [loadingMetadata, setLoadingMetadata] = useState(false);

    // Modal states
    const [authorModalVisible, setAuthorModalVisible] = useState(false);
    const [tagModalVisible, setTagModalVisible] = useState(false);

    // Selected values
    const [selectedAuthorId, setSelectedAuthorId] = useState<string>('');
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    // EditorJS JSON content (конвертируется из markdown при загрузке)
    const [editorContent, setEditorContent] = useState<string>('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    useEffect(() => {
        loadMetadata();
        if (id) {
            loadDocument(id);
        }
    }, [id]);

    const loadMetadata = async () => {
        try {
            setLoadingMetadata(true);
            const [authorsData, categoriesData, tagsData] = await Promise.all([
                authorService.getAll(),
                categoryService.getAll(),
                tagService.getAll(),
            ]);
            setAuthors(authorsData);
            setCategories(categoriesData);
            setTags(tagsData);
        } catch (err) {
            message.error('Не удалось загрузить данные');
            console.error('Error loading metadata:', err);
        } finally {
            setLoadingMetadata(false);
        }
    };

    const loadDocument = async (documentId: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await documentService.getById(documentId);
            setDocument(data);

            // Устанавливаем выбранные значения
            setSelectedAuthorId(data.author.id);
            setSelectedTagIds(data.tags.map(tag => tag.id));

            // Показываем текущую обложку если есть
            if (data.cover_url) {
                setCoverPreview(data.cover_url);
            }

            // Конвертируем markdown content в EditorJS JSON для редактора
            const rawContent = data.content || '';
            let editorContentValue = rawContent;
            try {
                const parsed = JSON.parse(rawContent);
                // Уже EditorJS JSON — используем как есть
                if (!Array.isArray(parsed?.blocks)) throw new Error('not editorjs');
            } catch {
                // Это markdown — конвертируем
                const blocks = markdownToEditorjsBlocks(rawContent);
                editorContentValue = JSON.stringify({
                    time: Date.now(),
                    version: "2.31.0",
                    blocks,
                });
            }

            setEditorContent(editorContentValue);

            // Заполняем форму данными документа
            form.setFieldsValue({
                title: data.title,
                authorId: data.author.id,
                categoryId: data.category.id,
                publicationDate: data.publication_date ? dayjs(data.publication_date) : null,
                content: editorContentValue,
                tagIds: data.tags.map(tag => tag.id),
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

    const handleAuthorSelect = (authorId: string) => {
        setSelectedAuthorId(authorId);
        form.setFieldValue('authorId', authorId);
        setAuthorModalVisible(false);
    };

    const handleAddAuthor = (author: Author) => {
        setAuthors(prev => [...prev, author]);
    };

    const handleTagSelect = (tagIds: number[]) => {
        setSelectedTagIds(tagIds);
        form.setFieldValue('tagIds', tagIds);
        setTagModalVisible(false);
    };

    const handleAddTag = (tag: TagType) => {
        setTags(prev => [...prev, tag]);
    };

    const getSelectedAuthorName = () => {
        const author = authors.find(a => a.id === selectedAuthorId);
        return author?.name || 'Не выбран';
    };

    const getSelectedTagsCount = () => {
        return selectedTagIds.length;
    };

    const handleSave = async (values: any) => {
        if (!document) return;

        try {
            setSaving(true);

            // Конвертируем EditorJS JSON → Markdown перед отправкой на бэкенд
            const rawContent: string = values.content || '';
            let markdownContent = rawContent;
            try {
                const parsed = JSON.parse(rawContent);
                if (Array.isArray(parsed?.blocks)) {
                    markdownContent = editorjsToMarkdown(parsed);
                }
            } catch {
                // уже Markdown — отправляем как есть
            }

            const updatedData = {
                title: values.title,
                authorId: values.authorId,
                categoryId: values.categoryId,
                publicationDate: values.publicationDate?.toISOString(),
                tagIds: values.tagIds || [],
                content: markdownContent,
            };

            await documentService.update(document.id, updatedData);

            // Загружаем обложку если выбрана новая
            if (coverFile) {
                try {
                    const url = await documentService.uploadCover(document.id, coverFile);
                    setCoverPreview(url);
                    setCoverFile(null);
                } catch {
                    message.warning('Документ сохранён, но не удалось загрузить обложку');
                }
            }

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
        setEditorContent(value);
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
                        name="authorId"
                        label="Автор"
                        rules={[
                            {required: true, message: 'Пожалуйста, выберите автора'},
                        ]}
                    >
                        <Button
                            size="large"
                            icon={<UserOutlined/>}
                            onClick={() => setAuthorModalVisible(true)}
                            block
                            style={{textAlign: 'left'}}
                        >
                            {getSelectedAuthorName()}
                        </Button>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <Form.Item
                                name="categoryId"
                                label="Категория"
                                rules={[
                                    {required: true, message: 'Пожалуйста, выберите категорию'},
                                ]}
                            >
                                <Select
                                    size="large"
                                    placeholder="Выберите категорию"
                                    loading={loadingMetadata}
                                    options={categories.map(cat => ({
                                        label: cat.title,
                                        value: cat.id,
                                    }))}
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
                        name="tagIds"
                        label="Теги"
                        rules={[
                            {required: true, message: 'Пожалуйста, выберите хотя бы один тег'},
                        ]}
                    >
                        <Button
                            size="large"
                            icon={<TagsOutlined/>}
                            onClick={() => setTagModalVisible(true)}
                            block
                            style={{textAlign: 'left'}}
                        >
                            {getSelectedTagsCount() > 0
                                ? `Выбрано тегов: ${getSelectedTagsCount()}`
                                : 'Выберите теги'}
                        </Button>
                    </Form.Item>

                    <Form.Item label="Обложка документа">
                        <Upload
                            accept="image/jpeg,image/png,image/webp"
                            maxCount={1}
                            showUploadList={false}
                            beforeUpload={(file) => {
                                const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                                if (!allowed.includes(file.type)) {
                                    message.error('Допустимые форматы: JPEG, PNG, WebP');
                                    return false;
                                }
                                if (file.size > 5 * 1024 * 1024) {
                                    message.error('Файл обложки не должен превышать 5 МБ');
                                    return false;
                                }
                                setCoverFile(file);
                                setCoverPreview(URL.createObjectURL(file));
                                return false;
                            }}
                        >
                            <Button icon={<InboxOutlined/>}>
                                {coverPreview ? 'Заменить обложку' : 'Выбрать обложку'}
                            </Button>
                        </Upload>
                        {coverPreview && (
                            <div style={{marginTop: 12, display: 'inline-block'}}>
                                <img
                                    src={coverPreview}
                                    alt="Обложка"
                                    style={{maxWidth: 320, maxHeight: 180, borderRadius: 8, objectFit: 'cover', border: '1px solid #d9d9d9'}}
                                />
                                {coverFile && (
                                    <Button
                                        size="small"
                                        danger
                                        style={{marginLeft: 12, verticalAlign: 'top'}}
                                        onClick={() => { setCoverFile(null); setCoverPreview(document?.cover_url || null); }}
                                    >
                                        Отменить
                                    </Button>
                                )}
                            </div>
                        )}
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="Содержание"
                        rules={[
                            {required: true, message: 'Пожалуйста, введите содержание документа'},
                            {min: 10, message: 'Содержание должно содержать минимум 10 символов'},
                        ]}
                    >
                        <DocumentEditor onChange={handleContentChange} value={editorContent}/>
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

            {/* Модальные окна */}
            <AuthorSelectModal
                visible={authorModalVisible}
                authors={authors}
                onClose={() => setAuthorModalVisible(false)}
                onSelect={handleAuthorSelect}
                onAddAuthor={handleAddAuthor}
            />

            <TagSelectModal
                visible={tagModalVisible}
                tags={tags}
                selectedTagIds={selectedTagIds}
                onClose={() => setTagModalVisible(false)}
                onSelect={handleTagSelect}
                onAddTag={handleAddTag}
            />
        </div>
    );
}

