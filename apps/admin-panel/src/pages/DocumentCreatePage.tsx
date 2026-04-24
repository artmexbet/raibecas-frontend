import React, {useEffect, useMemo, useState} from 'react';
import {useNavigate} from '@tanstack/react-router';
import type {UploadProps} from 'antd';
import {
    Alert,
    Button,
    Card,
    Col,
    Collapse,
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
    InfoCircleOutlined,
    SaveOutlined,
    TagsOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import {documentService} from '../services/document.service';
import {authorService} from '../services/author.service';
import {categoryService} from '../services/category.service';
import {tagService} from '../services/tag.service';
import {documentTypeService} from '../services/documentType.service';
import {authorshipTypeService} from '../services/authorshipType.service';
import type {
    Author,
    AuthorshipType,
    Category,
    CreateDocumentRequest,
    DocumentParticipantRef,
    DocumentType,
    Tag as TagType,
} from '@/types/document';
import './DocumentEditPage.css';
import {
    AuthorSelectModal,
    CategorySelectModal,
    DocumentEditor,
    DocumentTypeSelectModal,
    ParticipantsSelectModal,
    TagSelectModal,
} from '@/components';
import {editorjsToMarkdown, markdownToEditorjsBlocks} from '@/utils/editorjsMarkdown';

const {TextArea} = Input;
const {Dragger} = Upload;

interface DocumentFormValues {
    title?: string;
    description?: string;
    publicationDate?: any;
    content?: string;
}

const YamlFrontMatterExample = (
    <Alert
        type="info"
        showIcon
        description={
            <div>
                <strong>Пример структуры файла с метаданными:</strong>
                <pre style={{
                    background: '#f5f5f5',
                    padding: 12,
                    borderRadius: 4,
                    fontSize: 12,
                    marginTop: 8,
                }}>
{`---
title: "Название работы"
author: "Имя Автора"
category: "Эпистемология"
description: "Краткое описание"
tags: ["философия", "наука"]
---

# Содержимое документа

Ваш текст в формате Markdown...`}
                </pre>
            </div>
        }
    />
);

export function DocumentCreatePage() {
    const navigate = useNavigate();
    const [form] = Form.useForm<DocumentFormValues>();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [previewContent, setContent] = useState<string>('');
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    // Справочники
    const [authors, setAuthors] = useState<Author[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<TagType[]>([]);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [authorshipTypes, setAuthorshipTypes] = useState<AuthorshipType[]>([]);

    // Выбранные значения (отдельный state, чтобы не конфликтовать с Form.Item/<div>)
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
    const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState<number | undefined>();
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [participants, setParticipants] = useState<DocumentParticipantRef[]>([]);

    // Модалки
    const [documentTypeModalVisible, setDocumentTypeModalVisible] = useState(false);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [participantsModalVisible, setParticipantsModalVisible] = useState(false);
    const [tagModalVisible, setTagModalVisible] = useState(false);
    // Простой AuthorSelectModal пригодится для YAML front matter, но кнопки для него на форме
    // нет — участники управляются через ParticipantsSelectModal.
    const [authorModalVisible, setAuthorModalVisible] = useState(false);

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

    const selectedDocumentType = documentTypes.find((t) => t.id === selectedDocumentTypeId);
    const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
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
            } catch (error) {
                message.error('Ошибка при загрузке данных');
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleBack = () => {
        navigate({to: '/documents'});
    };

    const handleSelectDocumentType = (id: number) => {
        setSelectedDocumentTypeId(id);
    };

    const handleSelectCategory = (id: number) => {
        setSelectedCategoryId(id);
    };

    const handleAddCategory = (newCategory: Category) => {
        setCategories((prev) => [...prev, newCategory]);
    };

    const handleSelectParticipants = (next: DocumentParticipantRef[]) => {
        setParticipants(next);
    };

    const handleAddAuthor = (newAuthor: Author) => {
        setAuthors((prev) => [...prev, newAuthor]);
    };

    // AuthorSelectModal вызывается только из YAML front matter логики (опционально) —
    // оставляем обработчик, чтобы можно было расширять UX без отдельных кнопок.
    const handleSelectAuthorFromYaml = (authorId: string) => {
        const defaultType = authorshipTypes.find((t) => t.title.toLowerCase() === 'автор')
            ?? authorshipTypes[0];
        if (!defaultType) {
            message.warning('Не удалось определить тип авторства — добавьте участника вручную');
            return;
        }
        setParticipants((prev) => {
            if (prev.some((p) => p.authorId === authorId && p.typeId === defaultType.id)) {
                return prev;
            }
            return [...prev, {authorId, typeId: defaultType.id}];
        });
    };

    const handleSelectTags = (tagIds: number[]) => {
        setSelectedTagIds(tagIds);
    };

    const handleAddTag = (newTag: TagType) => {
        setTags((prev) => [...prev, newTag]);
    };

    const handleFileUpload = async (file: File) => {
        const isMarkdown = file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.type === 'text/markdown';
        if (!isMarkdown) {
            message.error('Пожалуйста, загрузите файл в формате Markdown (.md или .markdown)');
            return false;
        }

        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Файл не должен превышать 5MB');
            return false;
        }

        try {
            const text = await file.text();
            let content = text;

            const yamlFrontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
            const match = text.match(yamlFrontMatterRegex);

            if (match && match[1] && match[2]) {
                const frontMatter = match[1];
                content = match[2];

                const titleMatch = frontMatter.match(/title:\s*["']?(.+?)["']?\s*$/m);
                const authorMatch = frontMatter.match(/author:\s*["']?(.+?)["']?\s*$/m);
                const tagsMatch = frontMatter.match(/tags:\s*\[(.+?)]/);
                const categoryMatch = frontMatter.match(/category:\s*["']?(.+?)["']?\s*$/m);
                const descriptionMatch = frontMatter.match(/description:\s*["']?(.+?)["']?\s*$/m);

                if (titleMatch && titleMatch[1] && !form.getFieldValue('title')) {
                    form.setFieldValue('title', titleMatch[1].trim());
                }
                if (authorMatch && authorMatch[1] && participants.length === 0) {
                    const authorName = authorMatch[1].trim().toLowerCase();
                    const foundAuthor = authors.find((author) =>
                        author.name.toLowerCase().includes(authorName) ||
                        authorName.includes(author.name.toLowerCase()),
                    );
                    if (foundAuthor) {
                        handleSelectAuthorFromYaml(foundAuthor.id);
                    }
                }
                if (categoryMatch && categoryMatch[1] && !selectedCategoryId) {
                    const categoryName = categoryMatch[1].trim().toLowerCase();
                    const foundCategory = categories.find(
                        (category) => category.title.toLowerCase() === categoryName,
                    );
                    if (foundCategory) {
                        setSelectedCategoryId(foundCategory.id);
                    }
                }
                if (descriptionMatch && descriptionMatch[1] && !form.getFieldValue('description')) {
                    form.setFieldValue('description', descriptionMatch[1].trim());
                }
                if (tagsMatch && tagsMatch[1] && selectedTagIds.length === 0) {
                    const tagNames = tagsMatch[1]
                        .split(',')
                        .map((tag) => tag.trim().replace(/["']/g, '').toLowerCase());
                    const foundTagIds = tags
                        .filter((tag) => tagNames.includes(tag.title.toLowerCase()))
                        .map((tag) => tag.id);
                    if (foundTagIds.length > 0) {
                        setSelectedTagIds(foundTagIds);
                    }
                }

                message.success('Метаданные из файла успешно извлечены');
            }

            const editorBlocks = markdownToEditorjsBlocks(content);
            const editorJson = JSON.stringify({
                time: Date.now(),
                version: '2.31.0',
                blocks: editorBlocks,
            });

            form.setFieldValue('content', editorJson);
            setContent(editorJson);
            setUploadedFileName(file.name);

            if (!match) {
                const lines = content.split('\n');
                const firstLine = lines[0]?.trim();
                if (firstLine && firstLine.startsWith('#')) {
                    const title = firstLine.replace(/^#+\s*/, '');
                    if (!form.getFieldValue('title')) {
                        form.setFieldValue('title', title);
                    }
                }
            }

            message.success(`Файл "${file.name}" успешно загружен`);
        } catch (error) {
            message.error('Ошибка при чтении файла');
            console.error('Error reading file:', error);
        }

        return false;
    };

    const uploadProps: UploadProps = {
        name: 'file',
        multiple: false,
        accept: '.md,.markdown,text/markdown',
        beforeUpload: handleFileUpload,
        showUploadList: false,
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };

    const validateExtras = (): string | null => {
        if (!selectedDocumentTypeId) return 'Выберите тип документа';
        if (!selectedCategoryId) return 'Выберите категорию';
        if (participants.length === 0) return 'Добавьте хотя бы одного участника';
        if (selectedTagIds.length === 0) return 'Добавьте хотя бы один тег';
        return null;
    };

    const handleCreate = async (values: DocumentFormValues) => {
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

            const documentData: CreateDocumentRequest = {
                title: values.title!,
                description: values.description ? values.description : null,
                categoryId: selectedCategoryId!,
                documentTypeId: selectedDocumentTypeId!,
                participants,
                publicationDate: values.publicationDate!.toISOString(),
                tagIds: selectedTagIds,
                content: markdownContent,
            };

            const newDocument = await documentService.create(documentData);

            if (coverFile) {
                try {
                    await documentService.uploadCover(newDocument.id, coverFile);
                } catch {
                    message.warning('Документ создан, но не удалось загрузить обложку');
                }
            }

            message.success('Документ успешно создан');
            navigate({to: `/documents/${newDocument.id}`});
        } catch (err) {
            message.error('Ошибка при создании документа');
            console.error('Error creating document:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleContentChange = (value: string) => {
        form.setFieldValue('content', value);
        setContent(value);
    };

    const handleClearContent = () => {
        form.setFieldValue('content', '');
        setContent('');
        setUploadedFileName(null);
        message.info('Содержимое очищено');
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

    return (
        <div>
            <div style={{marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1>Добавление нового документа</h1>
                <Button
                    icon={<ArrowLeftOutlined/>}
                    onClick={handleBack}
                    size="large"
                >
                    Назад
                </Button>
            </div>

            {loading ? (
                <Card>
                    <div style={{textAlign: 'center', padding: '50px 0'}}>
                        <Spin size="large" tip="Загрузка данных..."/>
                    </div>
                </Card>
            ) : (
                <Card>
                    <Form<DocumentFormValues>
                        form={form}
                        layout="vertical"
                        onFinish={handleCreate}
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
                            label="Тип документа"
                            required
                            validateStatus={selectedDocumentTypeId ? undefined : undefined}
                        >
                            <Button
                                size="large"
                                icon={<FileTextOutlined/>}
                                onClick={() => setDocumentTypeModalVisible(true)}
                                block
                                style={{textAlign: 'left'}}
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
                                <Button icon={<InboxOutlined/>}>Выбрать изображение</Button>
                            </Upload>
                            {coverPreview && (
                                <div style={{marginTop: 12, position: 'relative', display: 'inline-block'}}>
                                    <img
                                        src={coverPreview}
                                        alt="Превью обложки"
                                        style={{
                                            maxWidth: 320,
                                            maxHeight: 180,
                                            borderRadius: 8,
                                            objectFit: 'cover',
                                            border: '1px solid #d9d9d9',
                                        }}
                                    />
                                    <Button
                                        size="small"
                                        danger
                                        style={{marginLeft: 12, verticalAlign: 'top'}}
                                        onClick={() => {
                                            setCoverFile(null);
                                            setCoverPreview(null);
                                        }}
                                    >
                                        Удалить
                                    </Button>
                                </div>
                            )}
                        </Form.Item>

                        <Form.Item label="Загрузка Markdown файла">
                            <Dragger {...uploadProps}>
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined/>
                                </p>
                                <p className="ant-upload-text">
                                    Нажмите или перетащите Markdown файл в эту область
                                </p>
                                <p className="ant-upload-hint">
                                    Поддерживаются файлы форматов .md и .markdown (максимум 5MB)
                                    <br/>
                                    Метаданные из YAML front matter будут автоматически извлечены
                                </p>
                                {uploadedFileName && (
                                    <p style={{marginTop: 8, color: '#52c41a', fontWeight: 'bold'}}>
                                        ✓ Загружен: {uploadedFileName}
                                    </p>
                                )}
                            </Dragger>

                            <Collapse
                                ghost
                                style={{marginTop: 16}}
                                items={[
                                    {
                                        key: '1',
                                        label: (
                                            <span>
                                                <InfoCircleOutlined style={{marginRight: 8}}/>
                                                Как использовать YAML front matter
                                            </span>
                                        ),
                                        children: YamlFrontMatterExample,
                                    },
                                ]}
                            />
                        </Form.Item>

                        <Form.Item
                            name="content"
                            label={
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '100%',
                                }}>
                                    <span>Содержание</span>
                                    {previewContent && (
                                        <Button
                                            type="link"
                                            danger
                                            size="small"
                                            onClick={handleClearContent}
                                            style={{padding: 0}}
                                        >
                                            Очистить
                                        </Button>
                                    )}
                                </div>
                            }
                            rules={[
                                {required: true, message: 'Пожалуйста, введите содержание документа'},
                                {min: 10, message: 'Содержание должно содержать минимум 10 символов'},
                            ]}
                        >
                            <DocumentEditor onChange={handleContentChange} value={previewContent}/>
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
                                    Создать документ
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
            )}

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

            {/* Оставляем закрытым, но пригодится если потребуется быстрый выбор автора */}
            <AuthorSelectModal
                visible={authorModalVisible}
                authors={authors}
                onClose={() => setAuthorModalVisible(false)}
                onSelect={handleSelectAuthorFromYaml}
                onAddAuthor={handleAddAuthor}
            />
        </div>
    );
}
