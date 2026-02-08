import {Card, Input, Splitter, Button, Space, Tooltip, Typography} from "antd";
import {XMarkdown} from "@ant-design/x-markdown";
import React, {useRef, useMemo, useState, useCallback} from "react";
import {
    BoldOutlined,
    ItalicOutlined,
    StrikethroughOutlined,
    CodeOutlined,
    OrderedListOutlined,
    UnorderedListOutlined,
    LinkOutlined,
    FileImageOutlined,
    UndoOutlined,
    RedoOutlined,
} from "@ant-design/icons";

const {TextArea} = Input;
const {Text} = Typography;

interface MarkdownAction {
    prefix: string;
    suffix?: string;
    placeholder?: string;
}

interface HistoryState {
    value: string;
    cursorPos: number;
}

export function DocumentEditor(props: { onChange: (e: string) => void, value?: string }) {
    const textAreaRef = useRef<any>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const [history, setHistory] = useState<HistoryState[]>([{value: props.value || "", cursorPos: 0}]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [isUndoRedo, setIsUndoRedo] = useState(false);

    // Подсчет статистики
    const stats = useMemo(() => {
        const text = props.value || "";
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        const charsNoSpaces = text.replace(/\s/g, "").length;
        return {words, chars, charsNoSpaces};
    }, [props.value]);

    // Сохранение в историю
    const saveToHistory = useCallback((value: string, cursorPos: number) => {
        if (isUndoRedo) {
            setIsUndoRedo(false);
            return;
        }

        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push({value, cursorPos});
            // Ограничиваем историю 50 записями
            if (newHistory.length > 50) {
                newHistory.shift();
                return newHistory;
            }
            return newHistory;
        });
        setHistoryIndex(prev => Math.min(prev + 1, 49));
    }, [historyIndex, isUndoRedo]);

    // Undo
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const state = history[newIndex];
            if (!state) return;

            setHistoryIndex(newIndex);
            setIsUndoRedo(true);
            props.onChange(state.value);

            setTimeout(() => {
                const textarea = textAreaRef.current?.resizableTextArea?.textArea;
                if (textarea) {
                    textarea.focus();
                    textarea.setSelectionRange(state.cursorPos, state.cursorPos);
                }
            }, 0);
        }
    }, [historyIndex, history, props]);

    // Redo
    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const state = history[newIndex];
            if (!state) return;

            setHistoryIndex(newIndex);
            setIsUndoRedo(true);
            props.onChange(state.value);

            setTimeout(() => {
                const textarea = textAreaRef.current?.resizableTextArea?.textArea;
                if (textarea) {
                    textarea.focus();
                    textarea.setSelectionRange(state.cursorPos, state.cursorPos);
                }
            }, 0);
        }
    }, [historyIndex, history, props]);

    // Вставка Markdown форматирования
    const insertMarkdown = (action: MarkdownAction) => {
        const textarea = textAreaRef.current?.resizableTextArea?.textArea;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = props.value || "";
        const selectedText = text.substring(start, end);
        const placeholder = action.placeholder || "текст";

        const newText = selectedText || placeholder;
        const before = text.substring(0, start);
        const after = text.substring(end);

        const insertion = `${action.prefix}${newText}${action.suffix || ""}`;
        const result = before + insertion + after;

        props.onChange(result);

        // Устанавливаем курсор
        setTimeout(() => {
            const newCursorPos = start + action.prefix.length + (selectedText ? selectedText.length : 0);
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos + (selectedText ? 0 : placeholder.length));
            saveToHistory(result, newCursorPos);
        }, 0);
    };

    // Синхронная прокрутка
    const handleScroll = useCallback(() => {
        const textarea = textAreaRef.current?.resizableTextArea?.textArea;
        const preview = previewRef.current;

        if (textarea && preview) {
            const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
            preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
        }
    }, []);

    // Обработка горячих клавиш
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case "b":
                    e.preventDefault();
                    insertMarkdown({prefix: "**", suffix: "**", placeholder: "жирный текст"});
                    break;
                case "i":
                    e.preventDefault();
                    insertMarkdown({prefix: "_", suffix: "_", placeholder: "курсив"});
                    break;
                case "k":
                    e.preventDefault();
                    insertMarkdown({prefix: "[", suffix: "](url)", placeholder: "текст ссылки"});
                    break;
                case "z":
                    e.preventDefault();
                    if (e.shiftKey) {
                        redo();
                    } else {
                        undo();
                    }
                    break;
                case "y":
                    // Ctrl+Y также работает как redo
                    e.preventDefault();
                    redo();
                    break;
            }
        }
    };

    // Обработка изменений с сохранением в историю
    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        const value = textarea.value;
        const cursorPos = textarea.selectionStart;

        props.onChange(value);

        // Сохраняем в историю с дебаунсом
        const timeoutId = setTimeout(() => {
            saveToHistory(value, cursorPos);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [props, saveToHistory]);

    return (
        <div style={{display: "flex", flexDirection: "column", gap: 8}}>
            {/* Toolbar */}
            <Card size="small" style={{padding: "4px 8px"}}>
                <Space size="small">
                    <Space size="small">
                        <Tooltip title="Отменить (Ctrl+Z)">
                            <Button
                                size="small"
                                icon={<UndoOutlined/>}
                                onClick={undo}
                                disabled={historyIndex <= 0}
                            />
                        </Tooltip>
                        <Tooltip title="Вернуть (Ctrl+Shift+Z)">
                            <Button
                                size="small"
                                icon={<RedoOutlined/>}
                                onClick={redo}
                                disabled={historyIndex >= history.length - 1}
                            />
                        </Tooltip>
                    </Space>
                    <span style={{
                        width: 1,
                        height: 24,
                        backgroundColor: "#d9d9d9",
                        display: "inline-block",
                        margin: "0 8px"
                    }}/>
                    <Space size="small">
                        <Tooltip title="Жирный (Ctrl+B)">
                            <Button
                                size="small"
                                icon={<BoldOutlined/>}
                                onClick={() => insertMarkdown({prefix: "**", suffix: "**", placeholder: "жирный текст"})}
                            />
                        </Tooltip>
                        <Tooltip title="Курсив (Ctrl+I)">
                            <Button
                                size="small"
                                icon={<ItalicOutlined/>}
                                onClick={() => insertMarkdown({prefix: "_", suffix: "_", placeholder: "курсив"})}
                            />
                        </Tooltip>
                        <Tooltip title="Зачеркнутый">
                            <Button
                                size="small"
                                icon={<StrikethroughOutlined/>}
                                onClick={() => insertMarkdown({prefix: "~~", suffix: "~~", placeholder: "зачеркнутый"})}
                            />
                        </Tooltip>
                        <Tooltip title="Код">
                            <Button
                                size="small"
                                icon={<CodeOutlined/>}
                                onClick={() => insertMarkdown({prefix: "`", suffix: "`", placeholder: "код"})}
                            />
                        </Tooltip>
                    </Space>
                    <span style={{
                        width: 1,
                        height: 24,
                        backgroundColor: "#d9d9d9",
                        display: "inline-block",
                        margin: "0 8px"
                    }}/>
                    <Space size="small">
                        <Tooltip title="Заголовок">
                            <Button
                                size="small"
                                onClick={() => insertMarkdown({prefix: "## ", placeholder: "Заголовок"})}
                            >
                                H
                            </Button>
                        </Tooltip>
                        <Tooltip title="Нумерованный список">
                            <Button
                                size="small"
                                icon={<OrderedListOutlined/>}
                                onClick={() => insertMarkdown({prefix: "1. ", placeholder: "Элемент списка"})}
                            />
                        </Tooltip>
                        <Tooltip title="Маркированный список">
                            <Button
                                size="small"
                                icon={<UnorderedListOutlined/>}
                                onClick={() => insertMarkdown({prefix: "- ", placeholder: "Элемент списка"})}
                            />
                        </Tooltip>
                    </Space>
                    <span style={{
                        width: 1,
                        height: 24,
                        backgroundColor: "#d9d9d9",
                        display: "inline-block",
                        margin: "0 8px"
                    }}/>
                    <Space size="small">
                        <Tooltip title="Ссылка (Ctrl+K)">
                            <Button
                                size="small"
                                icon={<LinkOutlined/>}
                                onClick={() => insertMarkdown({prefix: "[", suffix: "](url)", placeholder: "текст ссылки"})}
                            />
                        </Tooltip>
                        <Tooltip title="Изображение">
                            <Button
                                size="small"
                                icon={<FileImageOutlined/>}
                                onClick={() => insertMarkdown({prefix: "![", suffix: "](image-url)", placeholder: "описание"})}
                            />
                        </Tooltip>
                    </Space>
                </Space>
                <div style={{float: "right"}}>
                    <Text type="secondary" style={{fontSize: 12}}>
                        Слов: {stats.words} | Символов: {stats.chars} ({stats.charsNoSpaces} без пробелов)
                    </Text>
                </div>
            </Card>

            {/* Editor and Preview */}
            <Splitter>
                <Splitter.Panel defaultSize="50%" min="20%" style={{paddingRight: 5}}>
                    <TextArea
                        ref={textAreaRef}
                        rows={15}
                        placeholder="Введите содержание документа (поддерживается Markdown) или загрузите файл выше"
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onScroll={handleScroll}
                        value={props.value}
                        style={{minHeight: 400, maxHeight: 600, overflow: "auto", fontFamily: "monospace"}}
                    />
                </Splitter.Panel>
                <Splitter.Panel defaultSize="50%" min="20%" style={{paddingLeft: 5}}>
                    <Card
                        variant="outlined"
                        style={{minHeight: 400, maxHeight: 600, overflow: "auto"}}
                        title={<Text type="secondary" style={{fontSize: 12}}>Предпросмотр</Text>}
                        size="small"
                        ref={previewRef}
                    >
                        {props.value ? (
                            <XMarkdown content={props.value}/>
                        ) : (
                            <div style={{color: "#999", padding: 20, textAlign: "center"}}>
                                Начните вводить текст для предпросмотра
                            </div>
                        )}
                    </Card>
                </Splitter.Panel>
            </Splitter>
        </div>
    );
}