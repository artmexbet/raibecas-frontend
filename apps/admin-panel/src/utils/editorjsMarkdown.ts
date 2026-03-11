/**
 * Утилиты для конвертации между форматами Editor.js (OutputData) и Markdown
 */

import type { OutputData, OutputBlockData } from "@editorjs/editorjs";

// ─── Editor.js → Markdown ────────────────────────────────────────────────────

function stripHtml(html: string): string {
    return html
        .replace(/<b>(.*?)<\/b>/gs, "**$1**")
        .replace(/<strong>(.*?)<\/strong>/gs, "**$1**")
        .replace(/<i>(.*?)<\/i>/gs, "_$1_")
        .replace(/<em>(.*?)<\/em>/gs, "_$1_")
        .replace(/<u>(.*?)<\/u>/gs, "__$1__")
        .replace(/<s>(.*?)<\/s>/gs, "~~$1~~")
        .replace(/<del>(.*?)<\/del>/gs, "~~$1~~")
        .replace(/<mark[^>]*>(.*?)<\/mark>/gs, "==$1==")
        .replace(/<code[^>]*>(.*?)<\/code>/gs, "`$1`")
        .replace(/<a href="([^"]*)"[^>]*>(.*?)<\/a>/gs, "[$2]($1)")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "");
}

function blockToMarkdown(block: OutputBlockData): string {
    const { type, data } = block;

    switch (type) {
        case "header": {
            const level = (data.level as number) ?? 2;
            const hashes = "#".repeat(level);
            return `${hashes} ${stripHtml((data.text as string) ?? "")}`;
        }

        case "paragraph": {
            return stripHtml((data.text as string) ?? "");
        }

        case "list": {
            const items = (data.items as (string | { content: string })[]) ?? [];
            const ordered = data.style === "ordered";
            return items
                .map((item, idx) => {
                    const text = typeof item === "string" ? item : item.content;
                    const prefix = ordered ? `${idx + 1}.` : "-";
                    return `${prefix} ${stripHtml(text)}`;
                })
                .join("\n");
        }

        case "checklist": {
            const items = (data.items as { text: string; checked: boolean }[]) ?? [];
            return items
                .map((item) => {
                    const check = item.checked ? "x" : " ";
                    return `- [${check}] ${stripHtml(item.text ?? "")}`;
                })
                .join("\n");
        }

        case "code": {
            const lang = (data.language as string) ?? "";
            return `\`\`\`${lang}\n${(data.code as string) ?? ""}\n\`\`\``;
        }

        case "quote": {
            const text = stripHtml((data.text as string) ?? "");
            const lines = text.split("\n").map((l) => `> ${l}`).join("\n");
            const caption = data.caption ? `\n>\n> — ${stripHtml(data.caption as string)}` : "";
            return `${lines}${caption}`;
        }

        case "delimiter": {
            return "---";
        }

        case "table": {
            const content = (data.content as string[][]) ?? [];
            if (content.length === 0) return "";

            const renderRow = (row: string[]) =>
                `| ${row.map((cell) => stripHtml(cell)).join(" | ")} |`;

            const lines: string[] = [];
            if (data.withHeadings) {
                const header = content[0];
                if (!header) return "";
                lines.push(renderRow(header));
                lines.push(`| ${header.map(() => "---").join(" | ")} |`);
                content.slice(1).forEach((row) => lines.push(renderRow(row)));
            } else {
                const firstRow = content[0];
                if (!firstRow) return "";
                lines.push(renderRow(firstRow));
                lines.push(`| ${firstRow.map(() => "---").join(" | ")} |`);
                content.slice(1).forEach((row) => lines.push(renderRow(row)));
            }
            return lines.join("\n");
        }

        case "image": {
            const url = (data.file as { url?: string })?.url ?? (data.url as string) ?? "";
            const caption = (data.caption as string) ?? "";
            return `![${stripHtml(caption)}](${url})`;
        }

        case "raw": {
            return (data.html as string) ?? "";
        }

        default:
            return data.text ? stripHtml(data.text as string) : "";
    }
}

export function editorjsToMarkdown(data: OutputData): string {
    return data.blocks.map(blockToMarkdown).join("\n\n");
}

// ─── Markdown → Editor.js blocks ────────────────────────────────────────────

type EditorBlock = {
    type: string;
    data: Record<string, unknown>;
};

/** Конвертирует inline-markdown разметку в HTML для Editor.js */
function inlineMarkdownToHtml(text: string): string {
    return text
        .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
        .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<i>$1</i>")
        .replace(/(?<!_)_([^_]+)_(?!_)/g, "<i>$1</i>")
        .replace(/~~([^~]+)~~/g, "<s>$1</s>")
        .replace(/__([^_]+)__/g, "<u>$1</u>")
        .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
        .replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

export function markdownToEditorjsBlocks(markdown: string): EditorBlock[] {
    const lines = markdown.split("\n");
    const blocks: EditorBlock[] = [];
    let i = 0;

    const getLine = (idx: number): string => lines[idx] ?? "";

    while (i < lines.length) {
        const line = getLine(i);

        if (line.trim() === "") { i++; continue; }

        // Заголовки
        const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
        if (headingMatch) {
            blocks.push({
                type: "header",
                data: {
                    text: inlineMarkdownToHtml(headingMatch[2] ?? ""),
                    level: (headingMatch[1] ?? "#").length,
                },
            });
            i++; continue;
        }

        // Горизонтальная черта
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
            blocks.push({ type: "delimiter", data: {} });
            i++; continue;
        }

        // Блок кода
        if (line.startsWith("```")) {
            const lang = line.slice(3).trim();
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !getLine(i).startsWith("```")) {
                codeLines.push(getLine(i));
                i++;
            }
            i++;
            blocks.push({ type: "code", data: { code: codeLines.join("\n"), language: lang } });
            continue;
        }

        // Цитата
        if (line.startsWith("> ")) {
            const quoteLines: string[] = [];
            while (i < lines.length && getLine(i).startsWith("> ")) {
                quoteLines.push(getLine(i).slice(2));
                i++;
            }
            blocks.push({
                type: "quote",
                data: { text: inlineMarkdownToHtml(quoteLines.join("\n")), caption: "", alignment: "left" },
            });
            continue;
        }

        // Чеклист (до маркированного, т.к. тоже начинается с "- ")
        if (/^- \[[ x]]/.test(line)) {
            const items: { text: string; checked: boolean }[] = [];
            while (i < lines.length && /^- \[[ x]]/.test(getLine(i))) {
                const cur = getLine(i);
                const checked = cur.startsWith("- [x]");
                items.push({ text: inlineMarkdownToHtml(cur.replace(/^- \[[ x]]\s*/, "")), checked });
                i++;
            }
            blocks.push({ type: "checklist", data: { items } });
            continue;
        }

        // Маркированный список
        if (/^[-*+]\s/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^[-*+]\s/.test(getLine(i))) {
                items.push(inlineMarkdownToHtml(getLine(i).replace(/^[-*+]\s/, "")));
                i++;
            }
            blocks.push({ type: "list", data: { style: "unordered", items } });
            continue;
        }

        // Нумерованный список
        if (/^\d+\.\s/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^\d+\.\s/.test(getLine(i))) {
                items.push(inlineMarkdownToHtml(getLine(i).replace(/^\d+\.\s/, "")));
                i++;
            }
            blocks.push({ type: "list", data: { style: "ordered", items } });
            continue;
        }

        // Таблица
        if (line.includes("|") && (lines[i + 1] ?? "").match(/^\|?[-| :]+\|?$/)) {
            const tableLines: string[] = [];
            while (i < lines.length && getLine(i).includes("|")) {
                tableLines.push(getLine(i));
                i++;
            }
            if (tableLines.length >= 2) {
                const parseRow = (r: string) =>
                    r.split("|").map((c) => c.trim()).filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1);
                const header = parseRow(tableLines[0] ?? "");
                const content = tableLines.slice(2)
                    .filter((r) => !r.match(/^\|?[-| :]+\|?$/))
                    .map(parseRow);
                blocks.push({ type: "table", data: { withHeadings: true, content: [header, ...content] } });
            }
            continue;
        }

        // Изображение
        const imgMatch = line.match(/^!\[([^\]]*)](\([^)]+\))/);
        if (imgMatch) {
            const url = (imgMatch[2] ?? "").slice(1, -1);
            blocks.push({
                type: "image",
                data: { file: { url }, caption: imgMatch[1] ?? "", withBorder: false, withBackground: false, stretched: false },
            });
            i++; continue;
        }

        // Параграф
        const paraLines: string[] = [];
        while (i < lines.length) {
            const cur = getLine(i);
            if (
                cur.trim() === "" ||
                cur.startsWith("#") ||
                cur.startsWith("```") ||
                cur.startsWith("> ") ||
                /^[-*+]\s/.test(cur) ||
                /^\d+\.\s/.test(cur) ||
                /^(-{3,}|\*{3,}|_{3,})$/.test(cur.trim())
            ) break;
            paraLines.push(cur);
            i++;
        }
        if (paraLines.length > 0) {
            blocks.push({ type: "paragraph", data: { text: inlineMarkdownToHtml(paraLines.join("<br>")) } });
        }
    }

    return blocks;
}
