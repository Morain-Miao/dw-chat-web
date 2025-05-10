import React from 'react';
import {Button, Space} from "antd";
import {Prompts, PromptsProps, Welcome} from "@ant-design/x";
import {
    CommentOutlined,
    EllipsisOutlined,
    FireOutlined,
    HeartOutlined,
    ReadOutlined,
    ShareAltOutlined,
    SmileOutlined
} from "@ant-design/icons";


const renderTitle = (icon: React.ReactElement, title: string) => (
    <Space align="start">
        {icon}
        <span>{title}</span>
    </Space>
);

const promptItems: PromptsProps['items'] = [
    {
        key: '1',
        label: renderTitle(<FireOutlined style={{color: '#FF4D4F'}}/>, '热门问题'),
        description: '你对什么感兴趣?',
        children: [
            {
                key: '1-1',
                description: `告诉我你有什么Tool功能`,
            },
            {
                key: '1-2',
                description: `如何创建学生档案？`,
            },
            {
                key: '1-3',
                description: `查询初二五班的信息`,
            },
        ],
    },
    {
        key: '2',
        label: renderTitle(<ReadOutlined style={{color: '#1890FF'}}/>, '完成一个批改作业任务'),
        description: '如何进行作业批改?',
        children: [
            {
                key: '2-1',
                icon: <HeartOutlined/>,
                description: `第一步:上传作业原题、答案到附件`,
            },
            {
                key: '2-2',
                icon: <SmileOutlined/>,
                description: `第二步:发布一个班级作业，并上传学生作业答案`,
            },
            {
                key: '2-3',
                icon: <CommentOutlined/>,
                description: `第三步:告诉AI你想要批改哪个班级哪个学科的作业`,
            },
        ],
    }
];


type Props = {
    handleSubmit: (value: string) => void;
}

/**
 * 初始态的欢迎语和提示词
 */
const InitWelcome = (props: Props) => {
    //const {styles} = useStyle();

    return (
        <Space
            className='pt-10'
            direction='vertical'
            size={16}
        >
            {/* 欢迎语 */}
            <Welcome
                variant="borderless"
                icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
                title="您好,我是燕桥中学Ai智能助手,很高兴认识你!"
                description="模型基于DeepSeek和阿里千问,可以回答你关于燕桥中学的任何问题,包括学生档案、作业批改、学生成绩等。"
                extra={
                    <Space>
                        <Button icon={<ShareAltOutlined/>}/>
                        <Button icon={<EllipsisOutlined/>}/>
                    </Space>
                }
            />
            {/* 提示词 */}
            <Prompts
                title={'你想问什么?'}
                items={promptItems}
                styles={{
                    list: {
                        width: '100%',
                    },
                    item: {
                        flex: 1,
                    }
                }}
                onItemClick={({data}) => {
                    if (data.description) {
                        props.handleSubmit(data.description.toString())
                    }
                }}
            />
        </Space>
    );
};

export default InitWelcome;