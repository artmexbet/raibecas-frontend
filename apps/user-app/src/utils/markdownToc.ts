/**
 * Извлечение оглавления (структуры) из markdown-текста на стороне клиента.
 *
 * id строится по номеру строки исходного markdown, а не по slug-у текста, —
 * это устойчиво к повторяющимся заголовкам (например, несколько «Заголовок о мире»).
 * react-markdown (mdast) отдаёт `node.position.start.line` с тем же 1-based номером
 * строки, поэтому id из оглавления и id отрендеренного заголовка гарантированно совпадают.
 */

export interface TocEntry {
  /** Уровень заголовка: 1–6 (по числу `#`). */
  level: number;
  /** Текст заголовка без markdown-разметки. */
  text: string;
  /** 1-based номер строки в исходном markdown. */
  line: number;
  /** id, проставляемый отрендеренному заголовку: `doc-h-{line}`. */
  id: string;
}

export function headingId(line: number): string {
  return `doc-h-${line}`;
}

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const FENCE_RE = /^\s*(```|~~~)/;

/** Убирает базовую inline-разметку, чтобы в оглавлении был чистый текст. */
function stripInlineMarkdown(raw: string): string {
  return raw
    .replace(/`([^`]+)`/g, '$1') // `code`
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // ![alt](url)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // [text](url)
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // **bold** / __bold__
    .replace(/(\*|_)(.*?)\1/g, '$2') // *italic* / _italic_
    .replace(/~~(.*?)~~/g, '$1') // ~~strike~~
    .trim();
}

export function extractToc(markdown: string): TocEntry[] {
  if (!markdown) {
    return [];
  }

  const lines = markdown.split('\n');
  const entries: TocEntry[] = [];
  let inFence = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? '';

    if (FENCE_RE.test(line)) {
      inFence = !inFence;
      continue;
    }

    if (inFence) {
      continue;
    }

    const match = HEADING_RE.exec(line);
    if (!match) {
      continue;
    }

    const level = match[1]!.length;
    const text = stripInlineMarkdown(match[2]!);
    if (!text) {
      continue;
    }

    const lineNumber = i + 1; // mdast position.start.line is 1-based
    entries.push({ level, text, line: lineNumber, id: headingId(lineNumber) });
  }

  return entries;
}
