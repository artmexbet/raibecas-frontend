import React, {useCallback, useEffect, useState} from 'react';
import {Button, Empty, Flex, Masonry, Pagination, Spin, theme, Typography} from 'antd';
import {EditFilled, FileTextOutlined, MessageOutlined, TeamOutlined,} from '@ant-design/icons';
import {useNavigate} from '@tanstack/react-router';
import {documentService} from '@/services/document.service';
import type {Document, ListDocumentsQuery} from '@/types/document';
import {AppHeader, DocumentCard, PageBackground} from '@/components/common';

const {Text} = Typography;

const PAGE_SIZE = 20;

// Sidebar filters
const sidebarFilters = [
    {key: 'author', icon: EditFilled, label: 'Авторские'},
    {key: 'coauthor', icon: TeamOutlined, label: 'Соавторские'},
    {key: 'about', icon: FileTextOutlined, label: 'Тексты о Райбекасе'},
];

/** Высота карточки зависит от длины описания — имитация Masonry-разброса */
function estimateCardHeight(doc: Document): number {
    const base = 170;
    const descLen = doc.description?.length ?? 0;
    const tagsH = doc.tags.length > 0 ? 36 : 0;
    const descH = Math.min(Math.ceil(descLen / 55) * 22, 88);
    const coverH = doc.cover_url ? 160 : 0;
    return base + descH + tagsH + coverH;
}

export function CatalogPage() {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [categoryId] = useState<number | undefined>();
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const {token} = theme.useToken();

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
        fetchDocuments({page, limit: PAGE_SIZE, search: search || undefined, categoryId});
    }, [page, search, categoryId, fetchDocuments]);

    const masonryItems = documents.map((doc) => ({
        key: doc.id,
        height: estimateCardHeight(doc),
        data: doc,
        children: <DocumentCard doc={doc}/>,
    }));

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
                <aside
                    style={{
                        width: 240,
                        padding: '32px 16px',
                    }}
                >
                    <div
                        style={{
                            background: token.colorBgSidebar,
                            // backdropFilter: 'blur(20px)',
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
                            {sidebarFilters.map((filter) => {
                                const Icon = filter.icon;
                                const isActive = activeFilter === filter.key;
                                return (
                                    <Button
                                        key={filter.key}
                                        type="text"
                                        onClick={() => setActiveFilter(isActive ? null : filter.key)}
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
                                        <Icon style={{marginRight: 10, fontSize: 16}}/>
                                        {filter.label}
                                    </Button>
                                );
                            })}
                        </Flex>
                    </div>
                </aside>

                {/* Content */}
                <main style={{flex: 1, padding: '32px'}}>
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
        </div>
    );
}
