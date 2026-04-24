import {useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from '@tanstack/react-router';
import {
    Alert,
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    message,
    Row,
    Space,
    Spin,
    Tag,
    Upload,
} from 'antd';
import {
    AppstoreOutlined,
    ArrowLeftOutlined,
    FileTextOutlined,
    InboxOutlined,
    SaveOutlined,
    TagsOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import {documentService} from '@/services/document.service';
import {authorService} from '@/services/author.service';
import {categoryService} from '@/services/category.service';
import {tagService} from '@/services/tag.service';
import {documentTypeService} from '@/services/documentType.service';
import {authorshipTypeService} from '@/services/authorshipType.service';
import type {
    Author,
    AuthorshipType,
    Category,
    Document,
    DocumentParticipantRef,
    DocumentType,
    Tag as TagType,
    UpdateDocumentRequest,
} from '@/types/document';
import dayjs from 'dayjs';
import './DocumentEditPage.css';
import {
    CategorySelectModal,
    DocumentEditor,
    DocumentTypeSelectModal,
    ParticipantsSelectModal,
    TagSelectModal,
} from '@/components';
import {editorjsToMarkdown, markdownToEditorjsBlocks} from '@/utils/editorjsMarkdown';

const {TextArea} = Input;

interface EditDocumentFormValues {
    title?: string;
    description?: string;
    publicationDate?: any;
    content?: string;
}

export function DocumentEditPage() {
    const params = useParams({strict: false});
    const id = (params as any).id;
    const navigate = useNavigate();
    const [form] = Form.useForm<EditDocumentFormValues>();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [document, setDocument] = useState<Document | null>(null);

    // Справочники
    const [authors, setAuthors] = useState<Author[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<TagType[]>([]);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [authorshipTypes, setAuthorshipTypes] = useState<AuthorshipType[]>([]);
    const [loadingMetadata, setLoadingMetadata] = useState(false);

    // Модалки
    const [documentTypeModalVisible, setDocumentTypeModalVisible] = useState(false);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [participantsModalVisible, setParticipantsModalVisible] = useState(false);
    const [tagModalVisible, setTagModalVisible] = useState(false);

    // Выбранные значения
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
    const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState<number | undefined>();
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [participants, setParticipants] = useState<DocumentParticipantRef[]>([]);

    const [editorContent, setEditorContent] = useState<string>('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const authorsById = useMemo(() => {
        const map = new Map<string, Author>();
        authors.forEach((a) => map.set(a.id, a));
        return map;
    }, [authors]);

    const authorshipById = useMemo(() => {
        const map = new Map<number, AuthorshipType>();
        authorshipTypes.forEach((t) => map.set(t.id, t));
        return map;
    }, [authorshipTypes]);

    const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
    const selectedDocumentType = documentTypes.find((t) => t.id === selectedDocumentTypeId);

    useEffect(() => {
        loadMetadata();
        if (id) {
            loadDocument(id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadMetadata = async () => {
        try {
            setLoadingMetadata(true);
            const [authorsData, categoriesData, tagsData, docTypesData, authorshipData] = await Promise.all([
                authorService.getAll(),
                categoryService.getAll(),
                tagService.getAll(),
                documentTypeService.getAll(),
                authorshipTypeService.getAll(),
            ]);
            setAuthors(authorsData);
            setCategories(categoriesData);
            setTags(tagsData);
            setDocumentTypes(docTypesData);
            setAuthorshipTypes(authorshipData);
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

            setSelectedCategoryId(data.category?.id);
            setSelectedDocumentTypeId(data.documentType?.id);
            setSelectedTagIds(data.tags?.map((tag) => tag.id) ?? []);

            // Преобразуем participants из ответа в refs
            if (data.participants && data.participants.length > 0) {
                setParticipants(
                    data.participants.map((p) => ({
                        authorId: p.author.id,
                        typeId: p.authorshipType.id,
                    })),
                );
            } else if (data.author) {
                // Fallback для старых документов: один автор с ролью "автор"
                // typeId подтянется, когда справочник загрузится — временно ставим 0,
                // и fix-up применим в эффекте.
                setParticipants([{authorId: data.author.id, typeId: 0}]);
            } else {
                setParticipants([]);
            }

            if (data.cover_url) {
                setCoverPreview(data.cover_url);
            }

            const rawContent = data.content || '';
            let editorContentValue = rawContent;
            try {
                const parsed = JSON.parse(rawContent);
                if (!Array.isArray(parsed?.blocks)) throw new Error('not editorjs');
            } catch {
                const blocks = markdownToEditorjsBlocks(rawContent);
                editorContentValue = JSON.stringify({
                    time: Date.now(),
                    version: '2.31.0',
                    blocks,
                });
            }

            setEditorContent(editorContentValue);

            form.setFieldsValue({
                title: data.title,
                description: data.description ?? undefined,
                publicationDate: data.publication_date ? dayjs(data.publication_date) : undefined,
                content: editorContentValue,
            });
        } catch (err) {
            setError('Не удалось загрузить документ');
            console.error('Error loading document:', err);
        } finally {
            setLoading(false);
        }
    };

    // Подтягиваем корректный typeId для fallback participant, когда справочник доедет
    useEffect(() => {
        if (authorshipTypes.length === 0 || participants.length === 0) return;
        const needsFix = participants.some((p) => p.typeId === 0);
        if (!needsFix) return;

        const defaultType = authorshipTypes.find((t) => t.title.toLowerCase() === 'автор')
            ?? authorshipTypes[0];
        if (!defaultType) return;

        setParticipants((prev) =>
            prev.map((p) => (p.typeId === 0 ? {...p, typeId: defaultType.id} : p)),
        );
    }, [authorshipTypes, participants]);

    const handleBack = () => {
        navigate({to: '/documents'});
    };

    const handleAddAuthor = (author: Author) => {
        setAuthors((prev) => [...prev, author]);
    };

    const handleSelectParticipants = (next: DocumentParticipantRef[]) => {
        setParticipants(next);
    };

    const handleSelectCategory = (categoryId: number) => {
        setSelectedCategoryId(categoryId);
    };

    const handleAddCategory = (category: Category) => {
        setCategories((prev) => [...prev, category]);
    };

    const handleSelectDocumentType = (documentTypeId: number) => {
        setSelectedDocumentTypeId(documentTypeId);
    };

    const handleSelectTags = (tagIds: number[]) => {
        setSelectedTagIds(tagIds);
    };

    const handleAddTag = (tag: TagType) => {
        setTags((prev) => [...prev, tag]);
    };

    const renderParticipantsPreview = () => {
        if (participants.length === 0) {
            return <span style={{color: '#999'}}>Никто не выбран</span>;
        }
        return (
            <Space size={[0, 8]} wrap>
                {participants.map((p, idx) => {
                    const author = authorsById.get(p.authorId);
                    const role = authorshipById.get(p.typeId);
                    const label = author?.name ?? 'Неизвестный автор';
                    const roleLabel = role?.title ?? 'неизвестная роль';
                    return (
                        <Tag key={`${p.authorId}-${p.typeId}-${idx}`} color="geekblue">
                            {label} — {roleLabel}
                        </Tag>
                    );
                })}
            </Space>
        );
    };

    const validateExtras = (): string | null => {
        if (!selectedDocumentTypeId) return 'Выберите тип документа';
        if (!selectedCategoryId) return 'Выберите категорию';
        if (participants.length === 0) return 'Добавьте хотя бы одного участника';
        if (selectedTagIds.length === 0) return 'Добавьте хотя бы один тег';
        return null;
    };

    const handleSave = async (values: EditDocumentFormValues) => {
        if (!document) return;

        const extrasError = validateExtras();
        if (extrasError) {
            message.error(extrasError);
            return;
        }

        try {
            setSaving(true);

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

            const updatedData: UpdateDocumentRequest = {
                title: values.title,
                description: values.description ? values.description : null,
                categoryId: selectedCategoryId,
                documentTypeId: selectedDocumentTypeId,
                participants,
                publicationDate: values.publicationDate?.toISOString(),
                tagIds: selectedTagIds,
                content: markdownContent,
            };

            await documentService.update(document.id, updatedData);

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

    const handleContentChange = (value: string) => {
        setEditorContent(value);
        form.setFieldValue('content', value);
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
                    message="Ошибка"
                    description={error || 'Документ не найден'}
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div>
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

            <Card>
                <Form<EditDocumentFormValues>
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

                    <Form.Item label="Тип документа" required>
                        <Button
                            size="large"
                            icon={<FileTextOutlined/>}
                            onClick={() => setDocumentTypeModalVisible(true)}
                            block
                            style={{textAlign: 'left'}}
                            loading={loadingMetadata}
                        >
                            {selectedDocumentType ? selectedDocumentType.name : 'Выберите тип документа'}
                        </Button>
                    </Form.Item>

                    <Form.Item label="Участники" required>
                        <Space direction="vertical" style={{width: '100%'}} size={8}>
                            <Button
                                size="large"
                                icon={<TeamOutlined/>}
                                onClick={() => setParticipantsModalVisible(true)}
                                block
                                style={{textAlign: 'left'}}
                                loading={loadingMetadata}
                            >
                                {participants.length > 0
                                    ? `Участников: ${participants.length}`
                                    : 'Добавить участников'}
                            </Button>
                            {renderParticipantsPreview()}
                        </Space>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Описание/Аннотация"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Краткое описание документа (опционально)"
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <Form.Item label="Категория" required>
                                <Button
                                    size="large"
                                    icon={<AppstoreOutlined/>}
                                    onClick={() => setCategoryModalVisible(true)}
                                    block
                                    style={{textAlign: 'left'}}
                                    loading={loadingMetadata}
                                >
                                    {selectedCategory ? selectedCategory.title : 'Выберите категорию'}
                                </Button>
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

                    <Form.Item label="Теги" required>
                        <Space direction="vertical" style={{width: '100%'}} size={8}>
                            <Button
                                size="large"
                                icon={<TagsOutlined/>}
                                onClick={() => setTagModalVisible(true)}
                                block
                                style={{textAlign: 'left'}}
                            >
                                {selectedTagIds.length > 0
                                    ? `Выбрано тегов: ${selectedTagIds.length}`
                                    : 'Выберите теги'}
                            </Button>
                            {selectedTagIds.length > 0 && (
                                <Space size={[0, 8]} wrap>
                                    {selectedTagIds.map((tagId) => {
                                        const tag = tags.find((t) => t.id === tagId);
                                        return tag ? (
                                            <Tag key={tagId} color="blue">
                                                {tag.title}
                                            </Tag>
                                        ) : null;
                                    })}
                                </Space>
                            )}
                        </Space>
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
                                    style={{
                                        maxWidth: 320,
                                        maxHeight: 180,
                                        borderRadius: 8,
                                        objectFit: 'cover',
                                        border: '1px solid #d9d9d9',
                                    }}
                                />
                                {coverFile && (
                                    <Button
                                        size="small"
                                        danger
                                        style={{marginLeft: 12, verticalAlign: 'top'}}
                                        onClick={() => {
                                            setCoverFile(null);
                                            setCoverPreview(document?.cover_url || null);
                                        }}
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

            <DocumentTypeSelectModal
                visible={documentTypeModalVisible}
                documentTypes={documentTypes}
                selectedId={selectedDocumentTypeId}
                onClose={() => setDocumentTypeModalVisible(false)}
                onSelect={handleSelectDocumentType}
            />

            <CategorySelectModal
                visible={categoryModalVisible}
                categories={categories}
                selectedId={selectedCategoryId}
                onClose={() => setCategoryModalVisible(false)}
                onSelect={handleSelectCategory}
                onAddCategory={handleAddCategory}
            />

            <ParticipantsSelectModal
                visible={participantsModalVisible}
                authors={authors}
                authorshipTypes={authorshipTypes}
                selectedParticipants={participants}
                onClose={() => setParticipantsModalVisible(false)}
                onSelect={handleSelectParticipants}
                onAddAuthor={handleAddAuthor}
            />

            <TagSelectModal
                visible={tagModalVisible}
                tags={tags}
                selectedTagIds={selectedTagIds}
                onClose={() => setTagModalVisible(false)}
                onSelect={handleSelectTags}
                onAddTag={handleAddTag}
            />
        </div>
    );
}
