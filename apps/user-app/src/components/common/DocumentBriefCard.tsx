import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Tag, Typography, message, theme } from 'antd';
import { ReadOutlined, TagsOutlined, UserOutlined } from '@ant-design/icons';
import type { Document } from '@/types/document';
import { bookmarkService } from '@/services/bookmark.service';
import { getParticipantsLabel } from '@/utils/participants';

const { Text, Paragraph } = Typography;

interface DocumentBriefCardProps {
  doc: Document;
  /** Switch to the full-text reading view. */
  onRead: () => void;
}

/**
 * State 1 of the work page: a brief-info card with the cover, author, tags,
 * abstract and a "Читать статью" action that opens the full text. Manages its
 * own "publication" bookmark state via the existing bookmark service so the
 * cover ribbon toggles the bookmark.
 */
export function DocumentBriefCard({ doc, onRead }: DocumentBriefCardProps) {
  const { token } = theme.useToken();
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    loadedRef.current = false;
    setBookmarkId(null);

    bookmarkService
      .getAll({ kind: 'publication', limit: 100 })
      .then((result) => {
        if (loadedRef.current) {
          return;
        }
        const existing = result.items.find((item) => item.document.id === doc.id);
        setBookmarkId(existing?.id ?? null);
      })
      .catch(() => {
        // Bookmarks are non-critical — silently ignore load failures.
      });

    return () => {
      loadedRef.current = true;
    };
  }, [doc.id]);

  const handleBookmarkToggle = useCallback(async () => {
    if (bookmarkLoading) {
      return;
    }

    setBookmarkLoading(true);

    try {
      if (bookmarkId) {
        await bookmarkService.delete(bookmarkId);
        setBookmarkId(null);
        message.success('Убрано из закладок');
      } else {
        const result = await bookmarkService.create({ documentId: doc.id, kind: 'publication' });
        setBookmarkId(result.item.id);
        message.success('Добавлено в закладки');
      }
    } catch {
      message.error('Не удалось обновить закладку. Попробуйте ещё раз.');
    } finally {
      setBookmarkLoading(false);
    }
  }, [bookmarkId, bookmarkLoading, doc.id]);

  const isBookmarked = bookmarkId !== null;

  return (
    <div className="doc-brief">
      {/* Обложка */}
      <div className="doc-brief__cover-wrap">
        <div
          className="doc-brief__cover"
          style={{
            borderRadius: 12,
            background: token.colorFillTertiary,
            border: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {doc.cover_url ? (
            <img src={doc.cover_url} alt={doc.title} />
          ) : (
            <div className="doc-brief__cover-placeholder" style={{ color: token.colorTextQuaternary }}>
              <ReadOutlined style={{ fontSize: 56 }} />
            </div>
          )}
        </div>

        {/* Закладка-лента */}
        <button
          type="button"
          className="doc-brief__ribbon"
          aria-label={isBookmarked ? 'Убрать из закладок' : 'Добавить в закладки'}
          aria-pressed={isBookmarked}
          disabled={bookmarkLoading}
          onClick={() => void handleBookmarkToggle()}
          style={{ cursor: bookmarkLoading ? 'wait' : 'pointer', opacity: bookmarkLoading ? 0.6 : 1 }}
        >
          <span
            aria-hidden
            className="doc-brief__ribbon-shape"
            style={{
              background: isBookmarked ? token.colorPrimary : token.colorTextQuaternary,
            }}
          />
        </button>
      </div>

      {/* Контент справа */}
      <div className="doc-brief__body">
        <div className="doc-brief__row">
          <UserOutlined style={{ color: token.colorTextSecondary }} />
          <Text style={{ fontSize: token.fontSizeLG, color: token.colorText }}>
            {getParticipantsLabel(doc)}
          </Text>
        </div>

        {doc.tags.length > 0 ? (
          <div className="doc-brief__row doc-brief__tags">
            <TagsOutlined style={{ color: token.colorTextSecondary }} />
            <div className="doc-brief__tag-list">
              {doc.tags.map((tag) => (
                <Tag
                  key={tag.id}
                  style={{
                    margin: 0,
                    borderRadius: 8,
                    padding: '2px 12px',
                    background: token.colorFillSecondary,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    color: token.colorTextSecondary,
                  }}
                >
                  {tag.title}
                </Tag>
              ))}
            </div>
          </div>
        ) : null}

        {doc.description ? (
          <div
            className="doc-brief__abstract"
            style={{
              borderRadius: 12,
              background: token.colorFillTertiary,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Paragraph
              style={{
                margin: 0,
                textAlign: 'justify',
                fontSize: token.fontSize,
                lineHeight: 1.8,
                color: token.colorTextSecondary,
              }}
            >
              {doc.description}
            </Paragraph>
          </div>
        ) : null}

        <div>
          <Button size="large" icon={<ReadOutlined />} onClick={onRead}>
            Читать статью
          </Button>
        </div>
      </div>
    </div>
  );
}
