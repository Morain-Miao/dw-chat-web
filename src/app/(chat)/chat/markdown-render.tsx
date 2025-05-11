import React from 'react';
import {Typography} from "antd";

type Props = {
    content: string
}

const MarkdownRender = (props: Props) => {
    return (
        <Typography>
            <div style={{whiteSpace: 'pre-line'}}>{props.content}</div>
        </Typography>
    );
};

export default MarkdownRender;


