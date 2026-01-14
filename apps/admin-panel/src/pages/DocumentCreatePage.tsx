import React, {useState} from 'react';
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
} from 'antd';
import {
    ArrowLeftOutlined,
    SaveOutlined,
    InboxOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import {documentService} from '@/services/document.service';
import type {Document} from '@/types/document';
import type {UploadProps} from 'antd';
import './DocumentEditPage.css';
import {DocumentEditor} from "@/components";

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
    const [previewContent, setContent] = useState<string>('');
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

    const handleBack = () => {
        navigate({to: '/documents'});
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
                if (authorMatch && authorMatch[1] && !form.getFieldValue('author')) {
                    form.setFieldValue('author', authorMatch[1].trim());
                }
                if (categoryMatch && categoryMatch[1] && !form.getFieldValue('category')) {
                    form.setFieldValue('category', categoryMatch[1].trim());
                }
                if (descriptionMatch && descriptionMatch[1] && !form.getFieldValue('description')) {
                    form.setFieldValue('description', descriptionMatch[1].trim());
                }
                if (tagsMatch && tagsMatch[1] && !form.getFieldValue('tags')) {
                    const tags = tagsMatch[1].split(',').map(tag => tag.trim().replace(/["']/g, ''));
                    form.setFieldValue('tags', tags);
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

            const documentData: Partial<Document> = {
                title: values.title,
                author: values.author,
                category: values.category,
                publicationDate: values.publicationDate?.format('YYYY-MM-DD'),
                content: values.content,
                tags: values.tags || [],
                description: values.description,
            };

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
                        name="author"
                        label="Автор"
                        rules={[
                            {required: true, message: 'Пожалуйста, введите автора'},
                        ]}
                    >
                        <Input size="large" placeholder="Введите имя автора"/>
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
        </div>
    );
}

