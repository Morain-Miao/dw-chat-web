import React from 'react';
import { Typography } from 'antd';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js'; // 高亮
import 'highlight.js/styles/atom-one-light.css'; // 高亮样式

// 代码块高亮渲染器
const CodeBlock = ({ className, children }: any) => {
    const language = className ? className.replace('language-', '') : '';
    const code = String(children).replace(/\n$/, '');
    const highlighted = language && hljs.getLanguage(language)
        ? hljs.highlight(code, { language }).value
        : hljs.highlightAuto(code).value;
    return (
        <pre className="hljs">
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
    );
};

type Props = {
    content: string;
};

// 判断是否为纯HTML（不含markdown语法）
function isPureHTML(content: string) {
    // 只要开头是 <，且没有 markdown 特有符号（如#、*、-、[、`等）
    return (
        /^\s*<([a-zA-Z]+)(.|\n)*?<\/\1>\s*$/.test(content.trim()) &&
        !/[\*#\[\]`_\-]/.test(content)
    );
}

// 检查是否为```html语法块
function extractHtmlCodeBlock(content: string): string | null {
    // 允许结尾```前有0个或多个空格或换行
    const match = content.match(/^```html\s*\n([\s\S]*?)\n*```$/i);
    if (match) {
        return match[1];
    }
    return null;
}

// 提取<body>标签内容
function extractBody(html: string): string {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
        return bodyMatch[1];
    }
    // 如果没有body标签，直接返回原内容
    return html;
}

/**
 * 支持 Markdown + HTML 混合渲染，带高亮
 */
const MarkdownRender = (props: Props) => {
    const raw = props.content;
    const htmlBlock = extractHtmlCodeBlock(raw);
    const safeContent = DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });

    if (htmlBlock) {
        // 如果是```html语法块，自动提取<body>内容
        const bodyContent = extractBody(htmlBlock);
        const safeHtml = DOMPurify.sanitize(bodyContent, { USE_PROFILES: { html: true } });
        return (
            <Typography>
                <div className="markdown-body" dangerouslySetInnerHTML={{ __html: safeHtml }} />
            </Typography>
        );
    }

    if (isPureHTML(raw)) {
        // 纯HTML，直接渲染
        return (
            <Typography>
                <div className="markdown-body" dangerouslySetInnerHTML={{ __html: safeContent }} />
            </Typography>
        );
    }

    // 否则走Markdown+HTML混合渲染
    return (
        <Typography>
            <div className="markdown-body">
                <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    components={{
                        code: CodeBlock
                    }}
                >
                    {safeContent}
                </ReactMarkdown>
            </div>
        </Typography>
    );
};

export default MarkdownRender;
export { MarkdownRender };