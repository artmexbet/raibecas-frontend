import React, {useState, useEffect} from 'react';
import {useNavigate} from '@tanstack/react-router';
import {
    Form,
    Input,
    Button,
    Card,
    DatePicker,
    Select,
    message,
    Space,
    Row,
    Col,
    Upload,
    Alert,
    Collapse,
    Spin,
    Tag,
} from 'antd';
import {
    ArrowLeftOutlined,
    SaveOutlined,
    InboxOutlined,
    InfoCircleOutlined,
    UserOutlined,
    TagsOutlined,
} from '@ant-design/icons';
import {documentService} from '../services/document.service';
import {authorService} from '../services/author.service';
import {categoryService} from '../services/category.service';
import {tagService} from '../services/tag.service';
import type {CreateDocumentRequest, Author, Category, Tag as TagType} from '@/types/document';
import type {UploadProps} from 'antd';
import './DocumentEditPage.css';
import {DocumentEditor, AuthorSelectModal, TagSelectModal} from "@/components";

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

    // Модальные окна
    const [authorModalVisible, setAuthorModalVisible] = useState(false);
    const [tagModalVisible, setTagModalVisible] = useState(false);

    // Данные с сервера
    const [authors, setAuthors] = useState<Author[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<TagType[]>([]);

    // Выбранные значения
    const [selectedAuthorName, setSelectedAuthorName] = useState<string>('');
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [authorsData, categoriesData, tagsData] = await Promise.all([
                    authorService.getAll(),
                    categoryService.getAll(),
                    tagService.getAll(),
                ]);
                setAuthors(authorsData);
                setCategories(categoriesData);
                setTags(tagsData);
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

    const handleOpenAuthorModal = () => {
        setAuthorModalVisible(true);
    };

    const handleCloseAuthorModal = () => {
        setAuthorModalVisible(false);
    };

    const handleSelectAuthor = (authorId: string) => {
        const selectedAuthor = authors.find(a => a.id === authorId);
        form.setFieldValue('authorId', authorId);
        if (selectedAuthor) {
            setSelectedAuthorName(selectedAuthor.name);
        }
        message.success('Автор выбран');
    };

    const handleAddAuthor = (newAuthor: Author) => {
        const updatedAuthors = [...authors, newAuthor];
        setAuthors(updatedAuthors);
        setSelectedAuthorName(newAuthor.name);
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

                // Устанавливаем значения в форму, если они не заполнены
                if (titleMatch && titleMatch[1] && !form.getFieldValue('title')) {
                    form.setFieldValue('title', titleMatch[1].trim());
                }
                if (authorMatch && authorMatch[1] && !form.getFieldValue('authorId')) {
                    // Пытаемся найти автора по имени
                    const authorName = authorMatch[1].trim().toLowerCase();
                    const foundAuthor = authors.find(author =>
                        author.name.toLowerCase().includes(authorName) ||
                        authorName.includes(author.name.toLowerCase())
                    );
                    if (foundAuthor) {
                        form.setFieldValue('authorId', foundAuthor.id);
                        setSelectedAuthorName(foundAuthor.name);
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

            // Устанавливаем содержимое в форму
            form.setFieldValue('content', content);
            setContent(content);
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

            // Формируем запрос в соответствии с CreateDocumentRequest
            const documentData = {
                title: values.title,
                authorId: values.authorId, // UUID автора
                categoryId: values.categoryId, // ID категории
                publicationDate: values.publicationDate?.toISOString(), // ISO 8601 timestamp
                tagIds: values.tagIds || [], // Массив ID тегов
                description: values.description || null,
                content: values.content || '', // Содержимое документа в Markdown
            } as CreateDocumentRequest;

            const newDocument = await documentService.create(documentData);
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
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <Spin size="large" tip="Загрузка данных..." />
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
                        name="authorId"
                        label="Автор"
                        rules={[
                            {required: true, message: 'Пожалуйста, выберите автора'},
                        ]}
                    >
                        <Space.Compact style={{ width: '100%' }}>
                            <Input
                                size="large"
                                placeholder="Нажмите кнопку для выбора автора"
                                readOnly
                                value={selectedAuthorName}
                                style={{ flex: 1 }}
                            />
                            <Button
                                size="large"
                                icon={<UserOutlined />}
                                onClick={handleOpenAuthorModal}
                            >
                                Выбрать
                            </Button>
                        </Space.Compact>
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
                            {required: true, message: 'Пожалуйста, добавьте хотя бы один тег'},
                        ]}
                    >
                        <div>
                            <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
                                <Input
                                    size="large"
                                    placeholder="Нажмите кнопку для выбора тегов"
                                    readOnly
                                    value={`Выбрано тегов: ${selectedTagIds.length}`}
                                    style={{ flex: 1 }}
                                />
                                <Button
                                    size="large"
                                    icon={<TagsOutlined />}
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

            {/* Модальное окно выбора автора */}
            <AuthorSelectModal
                visible={authorModalVisible}
                authors={authors}
                onClose={handleCloseAuthorModal}
                onSelect={handleSelectAuthor}
                onAddAuthor={handleAddAuthor}
            />

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

