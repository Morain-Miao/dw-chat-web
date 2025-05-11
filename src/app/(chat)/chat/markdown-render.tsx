import React from 'react';
import {Typography} from "antd";

type Props = {
    content: string
}

const MarkdownRender = (props: Props) => {
    // 打印内容，排查换行符
    console.log('历史消息内容：', JSON.stringify(props.content));
    return (
        <Typography>
            <div style={{whiteSpace: 'pre-line'}}>{props.content}</div>
        </Typography>
    );
};

export default MarkdownRender;


