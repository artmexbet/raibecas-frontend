import {Card, Input, Splitter} from "antd";
import {XMarkdown} from "@ant-design/x-markdown";
import React, {useState} from "react";

const {TextArea} = Input;

export function DocumentEditor(props: { onChange: (e: string) => void, value?: string }) {
    const [previewContent, setPreviewContent] = useState(props.value);
    return <Splitter>
        <Splitter.Panel defaultSize="50%" min="20%">
            <TextArea
                rows={15}
                placeholder="Введите содержание документа (поддерживается Markdown) или загрузите файл выше"
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const data = e.target.value;
                    setPreviewContent(data);
                    props.onChange(data);
                }}
                value={previewContent}
                style={{minHeight: 400, maxHeight: 600, overflow: "auto"}}
            />
        </Splitter.Panel>
        <Splitter.Panel defaultSize="50%" min="20%">
            <Card
                variant="outlined"
                style={{minHeight: 400, maxHeight: 600, overflow: "auto"}}
            >
                {previewContent ? (
                    <XMarkdown content={previewContent} />
                ) : (
                    <div style={{color: "#999", padding: 20, textAlign: "center"}}>
                        Начните вводить текст для предпросмотра
                    </div>
                )}
            </Card>
        </Splitter.Panel>
    </Splitter>;
}