import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Button, Card, Col, Empty, Pagination, Result, Row, Spin, Typography, theme } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { AppHeader } from '@/components/common/AppHeader';
import { BottomNavBar } from '@/components/common/BottomNavBar';
import { NoteCard } from '@/components/common/NoteCard';
import { PageBackground } from '@/components/common/PageBackground';
import { noteService } from '@/services/note.service';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { NoteItem } from '@/types/note';

const { Title, Text } = Typography;

const PAGE_SIZE = 16;

function getNoteErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? 'Не удалось загрузить заметки. Попробуйте ещё раз.';
  }

  return 'Не удалось загрузить заметки. Попробуйте ещё раз.';
}

export function NotesPage() {
  const [items, setItems] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const requestIdRef = useRef(0);
  const navigate = useNavigate();

  const { token } = theme.useToken();
  const isMobile = useIsMobile();

  const fetchNotes = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await noteService.getAll({
        page,
        limit: PAGE_SIZE,
        search: submittedSearch || undefined,
      });

      if (requestId !== requestIdRef.current) return;

      setItems(result.items);
      setTotal(result.total);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      setItems([]);
      setTotal(0);
      setErrorMessage(getNoteErrorMessage(error));
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [page, submittedSearch]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1);
      setSubmittedSearch(search.trim());
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 0;

  return (
    <div style={{ minHeight: '100vh', background: token.colorBgLayout, position: 'relative' }}>
      <PageBackground opacity={0.04} />

      <AppHeader
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={() => {
          setPage(1);
          setSubmittedSearch(search.trim());
        }}
      />

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
        {!isMobile && (
          <div style={{ marginBottom: 24 }}>
            <Text style={{ color: token.colorTextSecondary, fontSize: 14 }}>
              Заметки
            </Text>
            <Text style={{ color: token.colorTextSecondary, fontSize: 14, margin: '0 8px' }}>{'>'}</Text>
            <Text strong style={{ fontSize: 14 }}>
              Все
            </Text>
          </div>
        )}

        {/* Контент */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <Spin size="large" />
          </div>
        ) : errorMessage ? (
          <Result
            status="error"
            title="Ошибка загрузки"
            subTitle={errorMessage}
            extra={
              <Button type="primary" onClick={fetchNotes}>
                Попробовать снова
              </Button>
            }
          />
        ) : (
          <>
            <Row gutter={isMobile ? [12, 12] : [24, 24]}>
              {/* Карточка "Новая заметка" */}
              <Col xs={12} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  onClick={() => navigate({ to: '/notes/create' })}
                  style={{
                    borderRadius: 16,
                    border: `2px dashed ${token.colorBorderSecondary}`,
                    background: token.colorBgContainer,
                    cursor: 'pointer',
                    height: '100%',
                    minHeight: isMobile ? 160 : 280,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  styles={{
                    body: {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: isMobile ? '24px 12px' : '40px 24px',
                    },
                  }}
                >
                  <PlusOutlined
                    style={{
                      fontSize: isMobile ? 32 : 48,
                      color: token.colorTextQuaternary,
                      marginBottom: isMobile ? 8 : 16,
                    }}
                  />
                  <Title
                    level={5}
                    style={{
                      margin: 0,
                      color: token.colorTextSecondary,
                      fontWeight: 500,
                      textAlign: 'center',
                    }}
                  >
                    Новая заметка
                  </Title>
                </Card>
              </Col>

              {/* Карточки заметок */}
              {items.map((note) => (
                <Col xs={12} sm={12} md={8} lg={6} key={note.id}>
                  <NoteCard note={note} />
                </Col>
              ))}
            </Row>

            {items.length === 0 && !loading && (
              <Empty
                description="Заметок пока нет"
                style={{ padding: '60px 0' }}
              />
            )}

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
                <Pagination
                  current={page}
                  total={total}
                  pageSize={PAGE_SIZE}
                  onChange={(p) => setPage(p)}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}
      </div>

      <BottomNavBar />
    </div>
  );
}
