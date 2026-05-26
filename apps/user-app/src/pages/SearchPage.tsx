import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Card, Empty, Flex, Input, Spin, Tag, theme, Typography} from 'antd';
import {FileTextOutlined, SearchOutlined} from '@ant-design/icons';
import {useNavigate} from '@tanstack/react-router';
import {searchService} from '@/services/search.service';
import type {SearchResult} from '@/services/search.service';
import {AppHeader} from '@/components/common/AppHeader';
import {PageBackground} from '@/components/common/PageBackground';

const {Text, Title, Paragraph} = Typography;

const DEBOUNCE_MS = 400;

/** Highlight matching text fragments in chunk */
function highlightText(text: string, query: string): React.ReactNode {
    if (!query.trim()) return text;

    const words = query
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 2)
        .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    if (words.length === 0) return text;

    const regex = new RegExp(`(${words.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
        regex.test(part) ? (
            <mark key={i} style={{background: '#ffe58f', padding: 0, borderRadius: 2}}>
                {part}
            </mark>
        ) : (
            part
        ),
    );
}

function ScoreBar({score}: { score: number }) {
    const {token} = theme.useToken();
    const pct = Math.round(score * 100);
    const color =
        pct >= 70 ? token.colorSuccess : pct >= 40 ? token.colorWarning : token.colorTextSecondary;

    return (
        <Flex align="center" gap={6}>
            <div
                style={{
                    width: 48,
                    height: 6,
                    borderRadius: 3,
                    background: token.colorBorderSecondary,
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        width: `${pct}%`,
                        height: '100%',
                        borderRadius: 3,
                        background: color,
                        transition: 'width 0.3s',
                    }}
                />
            </div>
            <Text type="secondary" style={{fontSize: 12}}>
                {pct}%
            </Text>
        </Flex>
    );
}

function SearchResultCard({
                              result,
                              query,
                              onClick,
                          }: {
    result: SearchResult;
    query: string;
    onClick: () => void;
}) {
    const {token} = theme.useToken();
    const topChunks = result.chunks.slice(0, 3);

    return (
        <Card
            hoverable
            onClick={onClick}
            style={{
                borderRadius: 12,
                border: `1px solid ${token.colorBorderSecondary}`,
                cursor: 'pointer',
            }}
            styles={{body: {padding: '16px 20px'}}}
        >
            <Flex justify="space-between" align="flex-start" style={{marginBottom: 8}}>
                <Flex align="center" gap={8}>
                    <FileTextOutlined style={{fontSize: 18, color: token.colorPrimary}}/>
                    <Title level={5} style={{margin: 0}}>
                        {result.title || 'Без названия'}
                    </Title>
                </Flex>
                <ScoreBar score={result.score}/>
            </Flex>

            {/* Metadata tags */}
            {(result.metadata.document_type || result.metadata.publication_date) && (
                <Flex gap={6} wrap="wrap" style={{marginBottom: 10}}>
                    {result.metadata.document_type && (
                        <Tag color="blue">{result.metadata.document_type}</Tag>
                    )}
                    {result.metadata.publication_date && (
                        <Tag>{result.metadata.publication_date}</Tag>
                    )}
                    {result.metadata.participant_names && (
                        <Tag color="green">{result.metadata.participant_names}</Tag>
                    )}
                </Flex>
            )}

            {/* Chunk previews */}
            <Flex vertical gap={6}>
                {topChunks.map((chunk, i) => (
                    <div
                        key={i}
                        style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            background: token.colorFillQuaternary,
                            fontSize: 13,
                            lineHeight: 1.6,
                        }}
                    >
                        <Paragraph
                            ellipsis={{rows: 3}}
                            style={{margin: 0, fontSize: 13, color: token.colorText}}
                        >
                            {highlightText(chunk.text, query)}
                        </Paragraph>
                    </div>
                ))}
                {result.chunks.length > 3 && (
                    <Text type="secondary" style={{fontSize: 12}}>
                        +{result.chunks.length - 3} ещё фрагмент(ов)
                    </Text>
                )}
            </Flex>
        </Card>
    );
}

export function SearchPage() {
    const navigate = useNavigate();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const {token} = theme.useToken();

    const doSearch = useCallback(async (q: string) => {
        if (!q.trim()) {
            setResults([]);
            setSearched(false);
            return;
        }

        setLoading(true);
        setSearched(true);
        try {
            const response = await searchService.search({q, limit: 20});
            setResults(response.results);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced search on query change
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            doSearch(query);
        }, DEBOUNCE_MS);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, doSearch]);

    const handleResultClick = (documentId: string, chunkText: string) => {
        const highlight = chunkText.slice(0, 60);
        navigate({
            to: '/documents/$id',
            params: {id: documentId},
            search: {highlight},
        });
    };

    return (
        <div style={{minHeight: '100vh', background: token.colorBgLayout, position: 'relative'}}>
            {/* Фон — подпись на всю страницу */}
            <PageBackground opacity={0.04}/>

            {/* Общий хедер */}
            <AppHeader showSearch={false}/>

            {/* Main Content */}
            <div style={{maxWidth: 800, margin: '0 auto', padding: '32px 24px', position: 'relative', zIndex: 1}}>
                {/* Search input */}
                <Input
                    size="large"
                    placeholder="Семантический поиск по документам..."
                    prefix={<SearchOutlined style={{color: token.colorTextSecondary}}/>}
                    allowClear
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onPressEnter={() => doSearch(query)}
                    style={{
                        borderRadius: 12,
                        marginBottom: 24,
                        fontSize: 16,
                    }}
                    autoFocus
                />

                {/* Results */}
                {loading ? (
                    <Flex justify="center" style={{padding: 64}}>
                        <Spin size="large" tip="Ищем по смыслу..."/>
                    </Flex>
                ) : results.length > 0 ? (
                    <Flex vertical gap={16}>
                        <Text type="secondary">
                            Найдено {results.length} документ(ов)
                        </Text>
                        {results.map((result) => (
                            <SearchResultCard
                                key={result.document_id}
                                result={result}
                                query={query}
                                onClick={() =>
                                    handleResultClick(
                                        result.document_id,
                                        result.chunks[0]?.text ?? '',
                                    )
                                }
                            />
                        ))}
                    </Flex>
                ) : searched ? (
                    <Empty
                        description="Ничего не найдено. Попробуйте переформулировать запрос."
                        style={{padding: 64}}
                    />
                ) : (
                    <Flex
                        vertical
                        align="center"
                        gap={12}
                        style={{padding: 64, color: token.colorTextSecondary}}
                    >
                        <SearchOutlined style={{fontSize: 48, opacity: 0.3}}/>
                        <Text type="secondary" style={{fontSize: 16}}>
                            Введите запрос для семантического поиска
                        </Text>
                        <Text type="secondary" style={{fontSize: 13}}>
                            Поиск работает по смыслу, а не по точному совпадению слов
                        </Text>
                    </Flex>
                )}
            </div>
        </div>
    );
}
