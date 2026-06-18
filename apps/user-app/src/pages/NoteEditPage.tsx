import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, Form, Input, Result, Spin, Typography, message, theme } from 'antd';
import { useNavigate, useParams } from '@tanstack/react-router';
import { AppHeader } from '@/components/common/AppHeader';
import { BottomNavBar } from '@/components/common/BottomNavBar';
import { PageBackground } from '@/components/common/PageBackground';
import { noteService } from '@/services/note.service';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { NoteItem } from '@/types/note';

const { Title, Text } = Typography;
const { TextArea } = Input;

/** Извлекает plain text из EditorJS JSON для редактирования. */
function extractPlainText(content: string): string {
  const trimmed = content.trim();
  if (!trimmed.startsWith('{')) return trimmed;

  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed?.blocks)) return trimmed;

    return parsed.blocks
      .map((block: { type: string; data?: Record<string, unknown> }) => {
        const data = block.data ?? {};
        const text = typeof data.text === 'string' ? data.text.replace(/<[^>]+>/g, '') : '';
        return text;
      })
      .filter(Boolean)
      .join('\n\n');
  } catch {
    return trimmed;
  }
}

export function NoteEditPage() {
  const { id } = useParams({ from: '/notes/$id/edit' });
  const [note, setNote] = useState<NoteItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const isMobile = useIsMobile();

  const fetchNote = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await noteService.getById(id);
      setNote(result.item);
      form.setFieldsValue({
        title: result.item.title,
        content: extractPlainText(result.item.content),
      });
    } catch {
      setError('Не удалось загрузить заметку');
    } finally {
      setLoading(false);
    }
  }, [id, form]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const handleSubmit = async (values: { title: string; content: string }) => {
    setSubmitting(true);
    try {
      await noteService.update(id, {
        title: values.title.trim(),
        content: values.content.trim(),
      });
      message.success('Заметка обновлена');
      navigate({ to: '/notes/$id', params: { id } });
    } catch {
      message.error('Не удалось обновить заметку');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: token.colorBgLayout }}>
        <AppHeader showSearch={isMobile} />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
        <BottomNavBar />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div style={{ minHeight: '100vh', background: token.colorBgLayout }}>
        <AppHeader showSearch={isMobile} />
        <Result
          status="error"
          title="Ошибка"
          subTitle={error ?? 'Заметка не найдена'}
          extra={
            <Button type="primary" onClick={() => navigate({ to: '/notes' })}>
              К списку заметок
            </Button>
          }
        />
        <BottomNavBar />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: token.colorBgLayout, position: 'relative' }}>
      <PageBackground opacity={0.04} />

      <AppHeader showSearch={isMobile} />

      <div
        style={{
          maxWidth: 1600,
          margin: '0 auto',
          padding: isMobile ? '12px 16px 100px' : '28px 32px 48px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Breadcrumb */}
        <div style={{ marginBottom: isMobile ? 12 : 24 }}>
          <Text
            style={{ color: token.colorTextSecondary, fontSize: 14, cursor: 'pointer' }}
            onClick={() => navigate({ to: '/notes' })}
          >
            Заметки
          </Text>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, margin: '0 8px' }}>{'>'}</Text>
          <Text strong style={{ fontSize: 14 }}>
            Редактирование заметки
          </Text>
        </div>

        <Card
          style={{
            borderRadius: 16,
            maxWidth: 900,
            margin: '0 auto',
          }}
          styles={{
            body: { padding: isMobile ? '24px 20px' : '40px 48px' },
          }}
        >
          <Title level={isMobile ? 4 : 3} style={{ marginBottom: 32 }}>
            Редактирование заметки
          </Title>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
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
              <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  size="large"
                  block={isMobile}
                  style={{
                    borderRadius: 8,
                    background: token.colorFillSecondary,
                    color: token.colorText,
                    border: 'none',
                    fontWeight: 500,
                  }}
                >
                  Сохранить изменения
                </Button>
                <Button
                  size="large"
                  block={isMobile}
                  onClick={() => navigate({ to: '/notes/$id', params: { id } })}
                  style={{ borderRadius: 8 }}
                >
                  Отмена
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>

      <BottomNavBar />
    </div>
  );
}
