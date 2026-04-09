import React, {useEffect, useState} from 'react';
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
    Select,
    Space,
    Spin,
    Tag,
    Upload,
} from 'antd';
import {
    ArrowLeftOutlined,
    InboxOutlined,
    InfoCircleOutlined,
    MinusCircleOutlined,
    PlusOutlined,
    SaveOutlined,
    TagsOutlined,
} from '@ant-design/icons';
import {documentService} from '../services/document.service';
import {authorService} from '../services/author.service';
import {authorshipTypeService} from '../services/authorship-type.service';
import {categoryService} from '../services/category.service';
import {documentTypeService} from '../services/document-type.service';
import {tagService} from '../services/tag.service';
import type {Author, AuthorshipType, Category, CreateDocumentRequest, DocumentParticipantRef, DocumentType, Tag as TagType} from '@/types/document';
import './DocumentEditPage.css';
import {DocumentEditor, TagSelectModal} from "@/components";
import {editorjsToMarkdown, markdownToEditorjsBlocks} from "@/utils/editorjsMarkdown";

const {TextArea} = Input;
const {Dragger} = Upload;

// Компонент с примером YAML front matter
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
                    marginTop: 8
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
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [previewContent, setContent] = useState<string>('');
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const [tagModalVisible, setTagModalVisible] = useState(false);

    // Данные с сервера
    const [authors, setAuthors] = useState<Author[]>([]);
    const [authorshipTypes, setAuthorshipTypes] = useState<AuthorshipType[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [tags, setTags] = useState<TagType[]>([]);

    // Выбранные значения
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [authorsData, authorshipTypesData, categoriesData, documentTypesData, tagsData] = await Promise.all([
                    authorService.getAll(),
                    authorshipTypeService.getAll(),
                    categoryService.getAll(),
                    documentTypeService.getAll(),
                    tagService.getAll(),
                ]);
                setAuthors(authorsData);
                setAuthorshipTypes(authorshipTypesData);
                setCategories(categoriesData);
                setDocumentTypes(documentTypesData);
                setTags(tagsData);

                const defaultAuthorshipType = authorshipTypesData.find(type => type.title.toLowerCase() === 'автор') ?? authorshipTypesData[0];
                if (defaultAuthorshipType) {
                    form.setFieldValue('participants', [{typeId: defaultAuthorshipType.id}]);
                }
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

    const handleOpenTagModal = () => {
        setTagModalVisible(true);
    };

    const handleCloseTagModal = () => {
        setTagModalVisible(false);
    };

    const handleSelectTags = (tagIds: number[]) => {
        setSelectedTagIds(tagIds);
        form.setFieldValue('tagIds', tagIds);
        message.success(`Выбрано тегов: ${tagIds.length}`);
    };

    const handleAddTag = (newTag: TagType) => {
        const updatedTags = [...tags, newTag];
        setTags(updatedTags);
    };

    const defaultAuthorshipTypeId = authorshipTypes.find(type => type.title.toLowerCase() === 'автор')?.id ?? authorshipTypes[0]?.id;

    const handleFileUpload = async (file: File) => {
        // Проверка типа файла
        const isMarkdown = file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.type === 'text/markdown';
        if (!isMarkdown) {
            message.error('Пожалуйста, загрузите файл в формате Markdown (.md или .markdown)');
            return false;
        }

        // Проверка размера файла (например, максимум 5MB)
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Файл не должен превышать 5MB');
            return false;
        }

        try {
            const text = await file.text();
            let content = text;

            // Попытка извлечь YAML front matter (метаданные в начале файла)
            const yamlFrontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
            const match = text.match(yamlFrontMatterRegex);

            if (match && match[1] && match[2]) {
                const frontMatter = match[1];
                content = match[2]; // Содержимое без front matter

                // Извлекаем метаданные
                const titleMatch = frontMatter.match(/title:\s*["']?(.+?)["']?\s*$/m);
                const authorMatch = frontMatter.match(/author:\s*["']?(.+?)["']?\s*$/m);
                const tagsMatch = frontMatter.match(/tags:\s*\[(.+?)]/);
                const categoryMatch = frontMatter.match(/category:\s*["']?(.+?)["']?\s*$/m);
                const descriptionMatch = frontMatter.match(/description:\s*["']?(.+?)["']?\s*$/m);
                const typeMatch = frontMatter.match(/(?:type|document_type):\s*["']?(.+?)["']?\s*$/m);

                // Устанавливаем значения в форму, если они не заполнены
                if (titleMatch && titleMatch[1] && !form.getFieldValue('title')) {
                    form.setFieldValue('title', titleMatch[1].trim());
                }
                if (authorMatch && authorMatch[1] && !(form.getFieldValue('participants') || []).length) {
                    const authorName = authorMatch[1].trim().toLowerCase();
                    const foundAuthor = authors.find(author =>
                        author.name.toLowerCase().includes(authorName) ||
                        authorName.includes(author.name.toLowerCase())
                    );
                    if (foundAuthor && defaultAuthorshipTypeId) {
                        form.setFieldValue('participants', [{authorId: foundAuthor.id, typeId: defaultAuthorshipTypeId}]);
                    }
                }
                if (categoryMatch && categoryMatch[1] && !form.getFieldValue('categoryId')) {
                    // Пытаемся найти категорию по названию
                    const categoryName = categoryMatch[1].trim().toLowerCase();
                    const foundCategory = categories.find(category =>
                        category.title.toLowerCase() === categoryName
                    );
                    if (foundCategory) {
                        form.setFieldValue('categoryId', foundCategory.id);
                    }
                }
                if (descriptionMatch && descriptionMatch[1] && !form.getFieldValue('description')) {
                    form.setFieldValue('description', descriptionMatch[1].trim());
                }
                if (typeMatch && typeMatch[1] && !form.getFieldValue('documentTypeId')) {
                    const documentTypeName = typeMatch[1].trim().toLowerCase();
                    const foundDocumentType = documentTypes.find(type => type.name.toLowerCase() === documentTypeName);
                    if (foundDocumentType) {
                        form.setFieldValue('documentTypeId', foundDocumentType.id);
                    }
                }
                if (tagsMatch && tagsMatch[1] && !form.getFieldValue('tagIds')) {
                    const tagNames = tagsMatch[1].split(',').map(tag => tag.trim().replace(/["']/g, '').toLowerCase());
                    // Находим ID тегов по именам
                    const foundTagIds = tags
                        .filter(tag => tagNames.includes(tag.title.toLowerCase()))
                        .map(tag => tag.id);
                    if (foundTagIds.length > 0) {
                        form.setFieldValue('tagIds', foundTagIds);
                        setSelectedTagIds(foundTagIds);
                    }
                }

                message.success(`Метаданные из файла успешно извлечены`);
            }

            // Конвертируем markdown в EditorJS JSON для редактора
            const editorBlocks = markdownToEditorjsBlocks(content);
            const editorJson = JSON.stringify({
                time: Date.now(),
                version: "2.31.0",
                blocks: editorBlocks,
            });

            // Устанавливаем содержимое в форму
            form.setFieldValue('content', editorJson);
            setContent(editorJson);
            setUploadedFileName(file.name);

            // Если метаданных не было, пытаемся извлечь заголовок из первой строки
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

        return false; // Предотвращаем автоматическую загрузку
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

    const handleCreate = async (values: any) => {
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

            const documentData = {
                title: values.title,
                categoryId: values.categoryId,
                documentTypeId: values.documentTypeId,
                participants: (values.participants || []).filter((participant: DocumentParticipantRef) => participant?.authorId && participant?.typeId),
                publicationDate: values.publicationDate?.toISOString(),
                tagIds: values.tagIds || [],
                description: values.description || null,
                content: markdownContent,
            } as CreateDocumentRequest;

            const newDocument = await documentService.create(documentData);

            // Загружаем обложку, если она выбрана
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

    return (
        <div>
            {/* Заголовок */}
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

            {/* Индикатор загрузки */}
            {loading ? (
                <Card>
                    <div style={{textAlign: 'center', padding: '50px 0'}}>
                        <Spin size="large" tip="Загрузка данных..."/>
                    </div>
                </Card>
            ) : (
                <>
                    {/* Форма создания */}
                    <Card>
                        <Form
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
                                name="description"
                                label="Описание/Аннотация"
                            >
                                <TextArea
                                    rows={3}
                                    placeholder="Краткое описание документа (опционально)"
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col xs={24} sm={24} md={8} lg={8} xl={8}>
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
                                            loading={loading}
                                            options={categories.map(category => ({
                                                label: category.title,
                                                value: category.id,
                                            }))}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                                    <Form.Item
                                        name="documentTypeId"
                                        label="Тип документа"
                                        rules={[
                                            {required: true, message: 'Пожалуйста, выберите тип документа'},
                                        ]}
                                    >
                                        <Select
                                            size="large"
                                            placeholder="Выберите тип документа"
                                            loading={loading}
                                            options={documentTypes.map(documentType => ({
                                                label: documentType.name,
                                                value: documentType.id,
                                            }))}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={24} md={8} lg={8} xl={8}>
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

                            <Form.Item label="Участники" required>
                                <Form.List name="participants" rules={[
                                    {
                                        validator: async (_, value) => {
                                            if (!value || value.length === 0) {
                                                throw new Error('Добавьте хотя бы одного участника');
                                            }
                                        },
                                    },
                                ]}>
                                    {(fields, {add, remove}, {errors}) => (
                                        <>
                                            {fields.map((field, index) => (
                                                <Space key={field.key} align="start" style={{display: 'flex', marginBottom: 12}} wrap>
                                                    <Form.Item
                                                        {...field}
                                                        name={[field.name, 'authorId']}
                                                        label={index === 0 ? 'Участник' : ''}
                                                        rules={[{required: true, message: 'Выберите участника'}]}
                                                        style={{minWidth: 280, marginBottom: 0}}
                                                    >
                                                        <Select
                                                            showSearch
                                                            size="large"
                                                            placeholder="Выберите участника"
                                                            filterOption={(input, option) => String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                                            options={authors.map(author => ({label: author.name, value: author.id}))}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...field}
                                                        name={[field.name, 'typeId']}
                                                        label={index === 0 ? 'Роль' : ''}
                                                        rules={[{required: true, message: 'Выберите роль'}]}
                                                        style={{minWidth: 220, marginBottom: 0}}
                                                    >
                                                        <Select
                                                            size="large"
                                                            placeholder="Выберите роль"
                                                            options={authorshipTypes.map(type => ({label: type.title, value: type.id}))}
                                                        />
                                                    </Form.Item>
                                                    {fields.length > 1 && (
                                                        <Button danger icon={<MinusCircleOutlined/>} onClick={() => remove(field.name)} style={{marginTop: index === 0 ? 30 : 0}} />
                                                    )}
                                                </Space>
                                            ))}
                                            <Form.ErrorList errors={errors}/>
                                            <Button
                                                type="dashed"
                                                onClick={() => add({typeId: defaultAuthorshipTypeId})}
                                                icon={<PlusOutlined/>}
                                                size="large"
                                            >
                                                Добавить участника
                                            </Button>
                                        </>
                                    )}
                                </Form.List>
                            </Form.Item>

                            <Form.Item
                                name="tagIds"
                                label="Теги"
                                rules={[
                                    {required: true, message: 'Пожалуйста, добавьте хотя бы один тег'},
                                ]}
                            >
                                <div>
                                    <Space.Compact style={{width: '100%', marginBottom: 8}}>
                                        <Input
                                            size="large"
                                            placeholder="Нажмите кнопку для выбора тегов"
                                            readOnly
                                            value={`Выбрано тегов: ${selectedTagIds.length}`}
                                            style={{flex: 1}}
                                        />
                                        <Button
                                            size="large"
                                            icon={<TagsOutlined/>}
                                            onClick={handleOpenTagModal}
                                        >
                                            Выбрать
                                        </Button>
                                    </Space.Compact>
                                    {selectedTagIds.length > 0 && (
                                        <Space size={[0, 8]} wrap>
                                            {selectedTagIds.map(tagId => {
                                                const tag = tags.find(t => t.id === tagId);
                                                return tag ? (
                                                    <Tag key={tagId} color="blue">
                                                        {tag.title}
                                                    </Tag>
                                                ) : null;
                                            })}
                                        </Space>
                                    )}
                                </div>
                            </Form.Item>

                            {/* Обложка документа */}
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
                                                border: '1px solid #d9d9d9'
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

                            {/* Drag & Drop для загрузки файла */}
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
                                        width: '100%'
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
                </>
            )}


            {/* Модальное окно выбора тегов */}
            <TagSelectModal
                visible={tagModalVisible}
                tags={tags}
                selectedTagIds={selectedTagIds}
                onClose={handleCloseTagModal}
                onSelect={handleSelectTags}
                onAddTag={handleAddTag}
            />
        </div>
    );
}

