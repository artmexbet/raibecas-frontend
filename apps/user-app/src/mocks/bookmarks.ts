import type { Document } from '@/types/document';
import type { BookmarkItem, ListBookmarksQuery, ListBookmarksResponse } from '@/types/bookmark';

function createCover(title: string, accent: string, background: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 640">
      <rect width="480" height="640" fill="${background}" />
      <rect x="34" y="34" width="48" height="572" fill="${accent}" opacity="0.9" />
      <rect x="98" y="34" width="10" height="572" fill="${accent}" opacity="0.65" />
      <path d="M370 78 L430 78 L430 120 L370 120 Z" fill="#ede8df" opacity="0.92" />
      <path d="M148 178 L366 178" stroke="#2a231f" stroke-width="10" stroke-linecap="round" />
      <text x="148" y="276" font-family="Georgia, serif" font-size="38" fill="#2a231f" font-weight="700">
        ${title}
      </text>
      <text x="148" y="532" font-family="Georgia, serif" font-size="22" fill="#2a231f" opacity="0.85">
        Raibecas Archive
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createDocument(partial: Partial<Document> & Pick<Document, 'id' | 'title'>): Document {
  const now = '2026-03-31T09:00:00.000Z';

  return {
    id: partial.id,
    title: partial.title,
    description: partial.description ?? null,
    author: partial.author ?? { id: 'author-1', name: 'Архив Райбекаса' },
    category: partial.category ?? { id: 1, title: 'Философия' },
    documentType: partial.documentType ?? { id: 1, name: 'Статья' },
    participants: partial.participants ?? [
      {
        author: partial.author ?? { id: 'author-1', name: 'Архив Райбекаса' },
        authorshipType: { id: 1, title: 'автор' },
      },
    ],
    publication_date: partial.publication_date ?? '1987-01-01',
    tags: partial.tags ?? [],
    content: partial.content ?? null,
    cover_url: partial.cover_url ?? null,
    created_at: partial.created_at ?? now,
    updated_at: partial.updated_at ?? now,
  };
}

const documents: Document[] = [
  createDocument({
    id: 'doc-dialectics',
    title: 'К вопросу о природе диалектического противоречия',
    description:
      'Исследование структуры противоречия как формы развёртывания мысли: от категориальных связей к логике научного текста.',
    author: { id: 'author-kr', name: 'К. Р. Райбекас' },
    category: { id: 2, title: 'Статья в сборнике' },
    publication_date: '1987-04-12',
    tags: [
      { id: 1, title: 'диалектика' },
      { id: 2, title: 'категории' },
      { id: 3, title: 'методология' },
    ],
    cover_url: createCover('Проблема диалектического противоречия', '#2d2f5b', '#d4bf70'),
  }),
  createDocument({
    id: 'doc-system',
    title: 'Системность и детерминизм',
    description:
      'Текст о системной обусловленности научных понятий и о том, как причинность проявляется в сложных объектах исследования.',
    author: { id: 'author-kr', name: 'К. Р. Райбекас' },
    category: { id: 3, title: 'Публицистика' },
    publication_date: '1984-09-20',
    tags: [
      { id: 4, title: 'системность' },
      { id: 5, title: 'детерминизм' },
      { id: 6, title: 'логика' },
    ],
    cover_url: createCover('Системность и детерминизм', '#264a8a', '#efe7cf'),
  }),
  createDocument({
    id: 'doc-method',
    title: 'Методологические ориентиры научного чтения',
    description:
      'Краткий обзор принципов внимательного чтения, аннотирования и отбора опорных цитат для дальнейшего обсуждения.',
    author: { id: 'author-editor', name: 'Редакция архива' },
    category: { id: 4, title: 'Методические материалы' },
    publication_date: '1991-02-10',
    tags: [
      { id: 7, title: 'чтение' },
      { id: 8, title: 'заметки' },
    ],
    cover_url: createCover('Методологические ориентиры научного чтения', '#7d5a2f', '#d7c8b6'),
  }),
  createDocument({
    id: 'doc-dialogue',
    title: 'Диалог как форма научного уточнения',
    description:
      'О роли вопросов, реплик и уточняющих формулировок в коллективной работе с исследовательскими материалами.',
    author: { id: 'author-collective', name: 'Исследовательская группа' },
    category: { id: 5, title: 'Материалы семинара' },
    publication_date: '1993-11-04',
    tags: [
      { id: 9, title: 'диалог' },
      { id: 10, title: 'семинар' },
      { id: 11, title: 'обсуждение' },
    ],
    cover_url: createCover('Диалог как форма научного уточнения', '#5c3428', '#e1d8d3'),
  }),
];

const documentById = new Map(documents.map((document) => [document.id, document]));

const savedAt = {
  recent: '2026-03-30T18:10:00.000Z',
  dayBefore: '2026-03-29T14:25:00.000Z',
  week: '2026-03-24T09:40:00.000Z',
  earlier: '2026-03-18T12:05:00.000Z',
};

const rawBookmarks = [
  {
    id: 'bookmark-publication-dialectics',
    kind: 'publication',
    saved_at: savedAt.recent,
    document: documentById.get('doc-dialectics')!,
  },
  {
    id: 'bookmark-quote-dialectics-1',
    kind: 'quote',
    saved_at: savedAt.recent,
    document: documentById.get('doc-dialectics')!,
    quote_text:
      'Категории помогают увидеть взаимосвязи только тогда, когда они удерживают движение мысли, а не подменяют его готовой схемой.',
    context: 'Фрагмент о различии между формальной классификацией и живой логикой исследования.',
    page_label: '87',
  },
  {
    id: 'bookmark-publication-system',
    kind: 'publication',
    saved_at: savedAt.dayBefore,
    document: documentById.get('doc-system')!,
  },
  {
    id: 'bookmark-quote-system-1',
    kind: 'quote',
    saved_at: savedAt.dayBefore,
    document: documentById.get('doc-system')!,
    quote_text:
      'Системность не отменяет причины, а показывает, как отдельное основание действует внутри целой сети зависимостей.',
    context: 'Подходит как опорная цитата для обсуждения причинности в сложных объектах.',
    page_label: '41',
  },
  {
    id: 'bookmark-quote-method-1',
    kind: 'quote',
    saved_at: savedAt.week,
    document: documentById.get('doc-method')!,
    quote_text:
      'Хорошая заметка фиксирует не только ответ, но и траекторию вопроса, из которого этот ответ вырос.',
    context: 'Наблюдение о том, как превращать чтение в рабочий исследовательский материал.',
    page_label: '12',
  },
  {
    id: 'bookmark-publication-dialogue',
    kind: 'publication',
    saved_at: savedAt.week,
    document: documentById.get('doc-dialogue')!,
  },
  {
    id: 'bookmark-quote-dialogue-1',
    kind: 'quote',
    saved_at: savedAt.earlier,
    document: documentById.get('doc-dialogue')!,
    quote_text:
      'Уточняющий вопрос ценен тем, что делает предмет обсуждения общим, а не просто переносит внимание на другую реплику.',
    context: 'Фрагмент о коллективной работе и распределённом понимании текста.',
    page_label: '23',
  },
  {
    id: 'bookmark-quote-dialectics-2',
    kind: 'quote',
    saved_at: savedAt.earlier,
    document: documentById.get('doc-dialectics')!,
    quote_text:
      'Противоречие плодотворно там, где оно раскрывает переход между состояниями, а не фиксируется как неподвижная пара противоположностей.',
    context: 'Подборка для будущего обсуждения в RAG-чате и сопоставления с другими источниками.',
    page_label: '96',
  },
] satisfies BookmarkItem[];

export const MOCK_BOOKMARKS: BookmarkItem[] = rawBookmarks.toSorted(
  (left, right) => new Date(right.saved_at).getTime() - new Date(left.saved_at).getTime()
);

function includesSearch(bookmark: BookmarkItem, search: string) {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) {
    return true;
  }

  const haystack = [
    bookmark.document.title,
    bookmark.document.description,
    bookmark.document.author.name,
    bookmark.document.category.title,
    bookmark.document.tags.map((tag) => tag.title).join(' '),
    bookmark.kind === 'quote' ? bookmark.quote_text : '',
    bookmark.kind === 'quote' ? bookmark.context : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalizedSearch);
}

export async function getMockBookmarks(
  query: ListBookmarksQuery = {}
): Promise<ListBookmarksResponse> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 12;

  const filtered = MOCK_BOOKMARKS.filter((bookmark) => {
    if (query.kind && bookmark.kind !== query.kind) {
      return false;
    }

    return includesSearch(bookmark, query.search ?? '');
  });

  const total = filtered.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  await new Promise((resolve) => setTimeout(resolve, 180));

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}


