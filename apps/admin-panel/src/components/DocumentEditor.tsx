import React, {useEffect, useRef} from "react";
import EditorJS, {type OutputData, type EditorConfig} from "@editorjs/editorjs";
// @ts-ignore
import Header from "@editorjs/header";
// @ts-ignore
import List from "@editorjs/list";
// @ts-ignore
import Checklist from "@editorjs/checklist";
// @ts-ignore
import CodeTool from "@editorjs/code";
// @ts-ignore
import Quote from "@editorjs/quote";
// @ts-ignore
import Delimiter from "@editorjs/delimiter";
// @ts-ignore
import InlineCode from "@editorjs/inline-code";
// @ts-ignore
import Marker from "@editorjs/marker";
// @ts-ignore
import Table from "@editorjs/table";
// @ts-ignore
import Underline from "@editorjs/underline";

const EDITOR_TOOLS = {
    header: {
        class: Header,
        config: {levels: [1, 2, 3, 4, 5, 6], defaultLevel: 2},
        inlineToolbar: ["bold", "italic", "marker", "inlineCode", "link"],
        shortcut: "CMD+SHIFT+H",
    },
    list: {
        class: List,
        inlineToolbar: true,
        config: {defaultStyle: "unordered"},
        shortcut: "CMD+SHIFT+L",
    },
    checklist: {
        class: Checklist,
        inlineToolbar: true,
    },
    code: {
        class: CodeTool,
        shortcut: "CMD+SHIFT+C",
    },
    quote: {
        class: Quote,
        inlineToolbar: true,
        config: {
            quotePlaceholder: "Введите цитату",
            captionPlaceholder: "Автор цитаты",
        },
        shortcut: "CMD+SHIFT+O",
    },
    delimiter: Delimiter,
    inlineCode: {
        class: InlineCode,
        shortcut: "CMD+SHIFT+C",
    },
    marker: {
        class: Marker,
        shortcut: "CMD+SHIFT+M",
    },
    table: {
        class: Table,
        inlineToolbar: true,
        shortcut: "CMD+ALT+T",
    },
    underline: Underline,
} as unknown as EditorConfig["tools"];

/** Parses stored JSON string into Editor.js OutputData, falls back to empty. */
function parseEditorData(value?: string): OutputData {
    if (!value) return {time: Date.now(), version: "2.31.0", blocks: []};
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed?.blocks)) return parsed as OutputData;
    } catch {
        // legacy plain text / markdown — wrap into single paragraph
    }
    return {
        time: Date.now(),
        version: "2.31.0",
        blocks: [{type: "paragraph", data: {text: value}}],
    };
}

interface DocumentEditorProps {
    /** Called with serialized Editor.js JSON (OutputData) on every change. */
    onChange: (json: string) => void;
    /** Serialized Editor.js JSON (OutputData) or legacy markdown/plain text. */
    value?: string;
}

/**
 * Block-editor на базе Editor.js.
 * Режим редактирования — EditorJS. Режим просмотра — editorjs-antd-renderer.
 * value/onChange оперируют JSON-строкой OutputData.
 */
export function DocumentEditor({onChange, value}: DocumentEditorProps) {
    const holderRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<EditorJS | null>(null);
    // advanced-use-latest: держим onChange актуальным без пересоздания редактора
    const onChangeRef = useRef(onChange);
    useEffect(() => { onChangeRef.current = onChange; });
    // rerender-use-ref-transient-values: последнее значение для определения внешних обновлений
    const lastValueRef = useRef<string | undefined>(value);
    // advanced-init-once: guard против Strict Mode двойного вызова
    const isInitialized = useRef(false);

    useEffect(() => {
        if (isInitialized.current || !holderRef.current) return;
        isInitialized.current = true;

        const holder = holderRef.current;
        const initialData = parseEditorData(value);

        const editor = new EditorJS({
            holder,
            tools: EDITOR_TOOLS,
            data: initialData,
            placeholder: "Начните вводить содержание документа...",
            autofocus: false,
            onChange: async () => {
                try {
                    const output = await editor.save();
                    const json = JSON.stringify(output);
                    lastValueRef.current = json;
                    onChangeRef.current(json);
                } catch {
                    // editor may be mid-destroy
                }
            },
        });

        editorRef.current = editor;

        return () => {
            editorRef.current = null;
            editor.isReady
                .then(() => editor.destroy())
                .catch(() => { holder.innerHTML = ""; })
                .finally(() => { isInitialized.current = false; });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (value === lastValueRef.current) return;
        lastValueRef.current = value;
        const data = parseEditorData(value);
        editorRef.current?.isReady
            .then(() => editorRef.current?.render(data))
            .catch(() => {});
    }, [value]);

    return (
        <div ref={holderRef} style={{minHeight: 420, padding: "12px 0"}}/>
    );
}