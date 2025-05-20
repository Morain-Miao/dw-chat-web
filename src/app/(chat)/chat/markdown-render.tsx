import React from 'react';
import { Typography } from 'antd';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js'; // 高亮
import 'highlight.js/styles/atom-one-light.css'; // 高亮样式
import remarkGfm from 'remark-gfm';

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

// 自定义表格渲染组件
const Table = (props: any) => (
  <table className="markdown-table">{props.children}</table>
);
const Th = (props: any) => (
  <th className="markdown-th">{props.children}</th>
);
const Td = (props: any) => {
  function renderWithMarkdown(children: any): any {
    if (typeof children === 'string') {
      // 只对看起来像 markdown 的字符串做二次渲染
      if (/[*_#`\[\]-]/.test(children)) {
        const content = children.replace(/\n/g, '<br />');
        return (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {content}
          </ReactMarkdown>
        );
      } else {
        // 普通字符串直接渲染，保留换行
        return children.split('\n').map((line, idx, arr) =>
          idx < arr.length - 1 ? [line, <br key={idx} />] : line
        );
      }
    }
    if (Array.isArray(children)) {
      return children.map((child, idx) => (
        <React.Fragment key={idx}>{renderWithMarkdown(child)}</React.Fragment>
      ));
    }
    // 如果是 React 元素，直接返回
    if (React.isValidElement(children)) {
      return children;
    }
    return children;
  }
  return <td className="markdown-td">{renderWithMarkdown(props.children)}</td>;
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

// 自动修正一行伪表格为标准markdown表格，增强：去除blockquote和代码块包裹
function autoFixOneLineTable(content: string): string {
    content = content.trim();
    // 去除 blockquote 包裹
    if (content.startsWith('>')) {
        content = content.replace(/^> ?/gm, '');
    }
    // 去除代码块包裹
    if (content.startsWith('```') && content.endsWith('```')) {
        content = content.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '');
    }
    // 新增：如果内容有多行，每行都包含||，也自动修正
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 1 && lines.every(l => l.includes('||'))) {
        // 合并所有行为一行再处理
        content = lines.join(' ');
    }
    // 下面是原有的伪表格修正逻辑
    if (/\|.*\|.*\|.*\|.*\|/g.test(content) && content.includes('||')) {
        const groups = content.split('||').map(s => s.trim()).filter(Boolean);
        const lines = groups.map(line => {
            let l = line;
            if (!l.startsWith('|')) l = '| ' + l;
            if (!l.endsWith('|')) l = l + ' |';
            return l;
        });
        return lines.join('\n');
    }
    return content;
}

/**
 * 支持 Markdown + HTML 混合渲染，带高亮
 */
const MarkdownRender = (props: Props) => {
    
    let raw = props.content;
    // 自动修正一行伪表格
    raw = autoFixOneLineTable(raw);
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
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                        code: CodeBlock,
                        table: Table,
                        th: Th,
                        td: Td
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