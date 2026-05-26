import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Form, Input, Typography, message, theme } from 'antd';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { AppHeader } from '@/components/common/AppHeader';
import { PageBackground } from '@/components/common/PageBackground';
import { noteService } from '@/services/note.service';

const { Title, Text } = Typography;
const { TextArea } = Input;

export function NoteCreatePage() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { token } = theme.useToken();

  // Читаем query-параметры для привязки к документу/закладке
  const searchParams = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      documentId: params.get('documentId') ?? undefined,
      bookmarkId: params.get('bookmarkId') ?? undefined,
      selectedText: params.get('selectedText') ?? undefined,
      positionInDocument: params.get('positionInDocument') ?? undefined,
    };
  }, []);

  // Предзаполняем форму выделенным текстом
  const initialValues = useMemo(() => ({
    title: '',
    content: searchParams.selectedText ? `«${searchParams.selectedText}»\n\n` : '',
  }), [searchParams.selectedText]);

  const hasLinkedContext = Boolean(searchParams.documentId || searchParams.bookmarkId);

  const handleSubmit = async (values: { title: string; content: string }) => {
    setSubmitting(true);
    try {
      const result = await noteService.create({
        title: values.title.trim(),
        content: values.content.trim(),
        documentId: searchParams.documentId,
        bookmarkId: searchParams.bookmarkId,
        positionInDocument: searchParams.positionInDocument,
      });
      message.success('Заметка создана');
      navigate({ to: '/notes/$id', params: { id: result.item.id } });
    } catch {
      message.error('Не удалось создать заметку');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: token.colorBgLayout, position: 'relative' }}>
      <PageBackground opacity={0.04} />

      <AppHeader showSearch={false} />

      <div
        style={{
          maxWidth: 1600,
          margin: '0 auto',
          padding: '28px 32px 48px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Breadcrumb */}
        <div style={{ marginBottom: 24 }}>
          <Text
            style={{ color: token.colorTextSecondary, fontSize: 14, cursor: 'pointer' }}
            onClick={() => navigate({ to: '/notes' })}
          >
            Заметки
          </Text>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, margin: '0 8px' }}>{'>'}</Text>
          <Text strong style={{ fontSize: 14 }}>
            Создание заметки
          </Text>
        </div>

        <Card
          style={{
            borderRadius: 16,
            maxWidth: 900,
            margin: '0 auto',
          }}
          styles={{
            body: { padding: '40px 48px' },
          }}
        >
          <Title level={3} style={{ marginBottom: hasLinkedContext ? 16 : 32 }}>
            Создание заметки
          </Title>

          {hasLinkedContext && (
            <Alert
              type="info"
              showIcon
              message="Заметка будет привязана к выделенному фрагменту документа"
              description="Цитата сохранена в закладки. Заметка будет связана с документом и закладкой."
              style={{ marginBottom: 24, borderRadius: 8 }}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            initialValues={initialValues}
          >
            <Form.Item
              label={
                <Text strong style={{ textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.5 }}>
                  Заголовок заметки*
                </Text>
              }
              name="title"
              rules={[
                { required: true, message: 'Введите заголовок' },
                { max: 100, message: 'Не более 100 символов' },
              ]}
            >
              <Input
                placeholder="Введите заголовок не более 100 символов"
                maxLength={100}
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              label={
                <Text strong style={{ textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.5 }}>
                  Заметка*
                </Text>
              }
              name="content"
              rules={[
                { required: true, message: 'Введите текст заметки' },
                { max: 15000, message: 'Не более 15,000 символов' },
              ]}
            >
              <TextArea
                placeholder="Введите текст не более 15,000 символов"
                maxLength={15000}
                rows={10}
                style={{ borderRadius: 8, resize: 'vertical' }}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                size="large"
                style={{
                  borderRadius: 8,
                  background: token.colorFillSecondary,
                  color: token.colorText,
                  border: 'none',
                  fontWeight: 500,
                }}
              >
                Сохранить заметку
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
