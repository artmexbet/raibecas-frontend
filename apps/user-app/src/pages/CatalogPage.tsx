import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Button, Empty, FloatButton, Flex, Masonry, message, Pagination, Spin, theme, Typography} from 'antd';
import {FileTextOutlined, MessageOutlined,} from '@ant-design/icons';
import {useNavigate} from '@tanstack/react-router';
import {documentService} from '@/services/document.service';
import {bookmarkService} from '@/services/bookmark.service';
import {documentTypeService} from '../services/documentType.service';
import type {Document, DocumentType, ListDocumentsQuery} from '@/types/document';
import {AppHeader, BottomNavBar, DocumentCard, MobileFilterTabs, PageBackground} from '@/components/common';
import type {MobileFilterTab} from '@/components/common';
import {useIsMobile} from '@/hooks/useIsMobile';

const {Text} = Typography;

const PAGE_SIZE = 20;

/** Высота карточки зависит от длины описания — имитация Masonry-разброса */
function estimateCardHeight(doc: Document): number {
    const base = 170;
    const descLen = doc.description?.length ?? 0;
    const tagsH = doc.tags.length > 0 ? 36 : 0;
    const descH = Math.min(Math.ceil(descLen / 55) * 22, 88);
    const coverH = doc.cover_url ? 160 : 0;
    return base + descH + tagsH + coverH;
}

/** Высота компактной горизонтальной карточки (мобильная вёрстка) */
function estimateMobileCardHeight(doc: Document): number {
    const headerH = 28 + 8;
    const titleLines = Math.min(4, Math.max(1, Math.ceil((doc.title?.length ?? 0) / 18)));
    const contentH = Math.max(titleLines * 21, doc.cover_url ? 130 : 0);
    const tagsH = doc.tags.length > 0 ? 12 + 24 : 0;
    const bodyPadding = 28;
    return headerH + contentH + tagsH + bodyPadding;
}

export function CatalogPage() {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [activeDocumentTypeId, setActiveDocumentTypeId] = useState<number | null>(null);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);

    // Bookmark state: Map<documentId, bookmarkId>
    const [bookmarkMap, setBookmarkMap] = useState<Map<string, string>>(new Map());
    const [bookmarkToggling, setBookmarkToggling] = useState<Set<string>>(new Set());
    const bookmarkLoadedRef = useRef(false);

    const {token} = theme.useToken();
    const isMobile = useIsMobile();

    /* Load document types once on mount */
    useEffect(() => {
        documentTypeService.getAll()
            .then((types) => setDocumentTypes(Array.isArray(types) ? types : []))
            .catch(() => setDocumentTypes([]));
    }, []);

    /* Load publication bookmarks once on mount */
    useEffect(() => {
        if (bookmarkLoadedRef.current) {
            return;
        }
        bookmarkLoadedRef.current = true;

        bookmarkService.getAll({ kind: 'publication', limit: 100 })
            .then((result) => {
                const map = new Map<string, string>();
                for (const item of result.items) {
                    map.set(item.document.id, item.id);
                }
                setBookmarkMap(map);
            })
            .catch(() => {
                // Silently fail — bookmarks are non-critical
            });
    }, []);

    const fetchDocuments = useCallback(async (query: ListDocumentsQuery) => {
        setLoading(true);
        try {
            const result = await documentService.getAll(query);
            setDocuments(result.documents);
            setTotal(result.total);
        } catch {
            // TODO: глобальная обработка ошибок
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDocuments({
            page,
            limit: PAGE_SIZE,
            search: search || undefined,
            documentTypeId: activeDocumentTypeId ?? undefined,
        });
    }, [page, search, activeDocumentTypeId, fetchDocuments]);

    const handleFilterClick = useCallback((typeId: number | null) => {
        setActiveDocumentTypeId((prev) => (prev === typeId ? null : typeId));
        setPage(1);
    }, []);

    const handleBookmarkToggle = useCallback(async (docId: string) => {
        if (bookmarkToggling.has(docId)) {
            return;
        }

        setBookmarkToggling((prev) => new Set(prev).add(docId));

        try {
            const existingBookmarkId = bookmarkMap.get(docId);

            if (existingBookmarkId) {
                // Remove bookmark
                await bookmarkService.delete(existingBookmarkId);
                setBookmarkMap((prev) => {
                    const next = new Map(prev);
                    next.delete(docId);
                    return next;
                });
                message.success('Убрано из закладок');
            } else {
                // Add bookmark
                const result = await bookmarkService.create({
                    documentId: docId,
                    kind: 'publication',
                });
                setBookmarkMap((prev) => new Map(prev).set(docId, result.item.id));
                message.success('Добавлено в закладки');
            }
        } catch {
            message.error('Не удалось обновить закладку. Попробуйте ещё раз.');
        } finally {
            setBookmarkToggling((prev) => {
                const next = new Set(prev);
                next.delete(docId);
                return next;
            });
        }
    }, [bookmarkMap, bookmarkToggling]);

    const masonryItems = documents.map((doc) => ({
        key: doc.id,
        height: isMobile ? estimateMobileCardHeight(doc) : estimateCardHeight(doc),
        data: doc,
        children: (
            <DocumentCard
                doc={doc}
                isBookmarked={bookmarkMap.has(doc.id)}
                onBookmarkToggle={handleBookmarkToggle}
                bookmarkLoading={bookmarkToggling.has(doc.id)}
            />
        ),
    }));

    const mobileFilterTabs: MobileFilterTab[] = [
        {key: 'all', label: 'Все'},
        ...documentTypes.map((dt) => ({key: String(dt.id), label: dt.name})),
    ];
    const mobileActiveKey = activeDocumentTypeId === null ? 'all' : String(activeDocumentTypeId);
    const handleMobileFilterChange = (key: string) => {
        handleFilterClick(key === 'all' ? null : Number(key));
    };

    return (
        <div style={{minHeight: '100vh', background: token.colorBgLayout, position: 'relative'}}>
            {/* Фон — подпись на всю страницу */}
            <PageBackground opacity={0.04}/>

            {/* Общий хедер */}
            <AppHeader
                search={search}
                onSearchChange={setSearch}
                onSearchSubmit={() => setPage(1)}
            />

            {/* Main Content */}
            <div style={{display: 'flex', maxWidth: 1600, margin: '0 auto', position: 'relative', zIndex: 1}}>
                {/* Sidebar */}
                {!isMobile && (
                    <aside
                        style={{
                            width: 240,
                            padding: '32px 16px',
                        }}
                    >
                        <div
                            style={{
                                background: token.colorBgSidebar,
                                borderRadius: 20,
                                padding: '8px 8px 8px',
                            }}
                        >
                            <div style={{padding: '12px 8px 8px'}}>
                                <Text
                                    style={{
                                        display: 'block',
                                        fontSize: 26,
                                        fontWeight: 400,
                                        color: token.colorText,
                                        marginBottom: 12,
                                        lineHeight: 1.3,
                                    }}
                                >
                                    Каталог работ
                                </Text>
                            </div>

                            <Flex vertical gap={4} style={{width: '100%'}}>
                                {/* «Все» */}
                                <Button
                                    type="text"
                                    onClick={() => handleFilterClick(null)}
                                    style={{
                                        width: '100%',
                                        justifyContent: 'flex-start',
                                        textAlign: 'left',
                                        borderRadius: 8,
                                        padding: '8px 12px',
                                        background: 'transparent',
                                        color: activeDocumentTypeId === null ? token.colorPrimary : token.colorText,
                                        fontWeight: activeDocumentTypeId === null ? 700 : 400,
                                    }}
                                >
                                    <FileTextOutlined style={{marginRight: 10, fontSize: 16}}/>
                                    Все
                                </Button>

                                {documentTypes.map((dt) => {
                                    const isActive = activeDocumentTypeId === dt.id;
                                    return (
                                        <Button
                                            key={dt.id}
                                            type="text"
                                            onClick={() => handleFilterClick(dt.id)}
                                            style={{
                                                width: '100%',
                                                justifyContent: 'flex-start',
                                                textAlign: 'left',
                                                borderRadius: 8,
                                                padding: '8px 12px',
                                                background: 'transparent',
                                                color: isActive ? token.colorPrimary : token.colorText,
                                                fontWeight: isActive ? 700 : 400,
                                            }}
                                        >
                                            <FileTextOutlined style={{marginRight: 10, fontSize: 16}}/>
                                            {dt.name}
                                        </Button>
                                    );
                                })}
                            </Flex>
                        </div>
                    </aside>
                )}

                {/* Content */}
                <main style={{flex: 1, padding: isMobile ? '8px 16px 100px' : '32px'}}>
                    {isMobile && (
                        <MobileFilterTabs
                            tabs={mobileFilterTabs}
                            activeKey={mobileActiveKey}
                            onChange={handleMobileFilterChange}
                        />
                    )}

                    {loading ? (
                        <div style={{display: 'flex', justifyContent: 'center', paddingTop: 100}}>
                            <Spin size="large"/>
                        </div>
                    ) : documents.length === 0 ? (
                        <Empty description="Документы не найдены" style={{paddingTop: 80}}/>
                    ) : (
                        <>
                            <Masonry
                                items={masonryItems}
                                columns={{xs: 1, sm: 2, md: 3, lg: 4}}
                                gutter={16}
                                fresh
                            />

                            {total > PAGE_SIZE && (
                                <div style={{display: 'flex', justifyContent: 'center', marginTop: 36}}>
                                    <Pagination
                                        current={page}
                                        pageSize={PAGE_SIZE}
                                        total={total}
                                        onChange={setPage}
                                        showSizeChanger={false}
                                        showTotal={(t) => `Всего ${t} документов`}
                                    />
                                </div>
                            )}

                            <Text type="secondary" style={{display: 'block', marginTop: 16, fontSize: 13}}>
                                Показано {documents.length} из {total}
                            </Text>
                        </>
                    )}
                </main>
            </div>

            {/* Chat button */}
            {!isMobile && (
                <Button
                    type="primary"
                    shape="circle"
                    icon={<MessageOutlined/>}
                    size="large"
                    onClick={() => navigate({to: '/chat'})}
                    style={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        width: 56,
                        height: 56,
                        boxShadow: token.boxShadowSecondary,
                        zIndex: 200,
                    }}
                />
            )}

            {isMobile && <FloatButton.BackTop style={{bottom: 100, right: 16}}/>}

            <BottomNavBar/>
        </div>
    );
}
