import React, { useState } from 'react';
import {Button, Space} from "antd";
import {Prompts, PromptsProps, Welcome} from "@ant-design/x";
import {
    CommentOutlined,
    EllipsisOutlined,
    FireOutlined,
    HeartOutlined,
    QuestionCircleOutlined,
    ReadOutlined,
    SearchOutlined,
    ShareAltOutlined,
    SmileOutlined,
    TagOutlined,
    LeftOutlined,
    RightOutlined
} from "@ant-design/icons";


const renderTitle = (icon: React.ReactElement, title: string) => (
    <Space align="start">
        {icon}
        <span>{title}</span>
    </Space>
);

export const promptItems: PromptsProps['items'] = [
    {
        key: '1',
        label: renderTitle(<FireOutlined style={{color: '#FF4D4F'}}/>, '热门问题'),
        description: '你对什么感兴趣?',
        children: [
            {
                key: '1-1',
                icon: <SmileOutlined/>,
                description: `告诉我你有什么Tool功能`,
            },
            {
                key: '1-2',
                icon: <QuestionCircleOutlined/>,
                description: `如何创建学生档案？`,
            },
            {
                key: '1-3',
                icon: <SearchOutlined/>,
                description: `查询初二五班的信息`,
            },
        ],
    },
    {
        key: '2',
        label: renderTitle(<ReadOutlined style={{color: '#1890FF'}}/>, '完成一个批改作业任务'),
        description: '如何进行作业批改?【共7步】',
        children: [
            {
                key: '2-1',
                icon: <TagOutlined />,
                label: `第一步: 点击文件上传,上传作业原题、答案到附件`,
                description: `请你帮我保存作业, 如果缺少信息请告诉我, 保存成功后告诉我返回的信息`,
            },
            {
                key: '2-2',
                icon: <TagOutlined />,
                label: `第二步: 输入刚才返回的作业id,然后发布一个作业给某班级`,
                description: `我要发布一个作业给某班级, 请告诉我如何发布作业`,
            },
            {
                key: '2-3',
                icon: <TagOutlined />,
                label: `第三步: 由学生自己或老师上传作业答题卡照片`,
                description: `请告诉我如何提交作业, 需要哪些信息`,
            },
            {
                key: '2-4',
                icon: <TagOutlined />,
                label: `第四步: 告诉Ai自动批改哪个班级的作业`,
                description: `请告诉我如何提交作业, 需要哪些信息`,
            },
            {
                key: '2-5',
                icon: <TagOutlined />,
                label: `第五步: 告诉Ai自动批改哪个班级的作业`,
                description: `请告诉我批改指定班级指定学科的作业?`,
            },
            {
                key: '2-6',
                icon: <TagOutlined />,
                label: `第六步: 查询作业批改结果`,
                description: `请告诉我如何查询作业批改结果, 需要提供哪些信息来查询`,
            },
            {
                key: '2-7',
                icon: <TagOutlined />,
                label: `第七步: 人工批改作业`,
                description: `请告诉我如何人工修改作业批改结果, 需要提供哪些信息`,
            }
        ],
    }
];


type Props = {
    handleSubmit: (value: string) => void;
}

const STEPS_PER_PAGE = 3;

/**
 * 初始态的欢迎语和提示词
 */
const InitWelcome = (props: Props) => {
    const [stepPage, setStepPage] = useState(1);
    const steps = promptItems[1].children || [];
    const totalPages = Math.ceil(steps.length / STEPS_PER_PAGE);
    const pagedSteps = steps.slice((stepPage - 1) * STEPS_PER_PAGE, stepPage * STEPS_PER_PAGE);

    // 组装新的 promptItems，第二组 children 替换为分页后的内容
    const pagedPromptItems = [
        promptItems[0],
        {
            ...promptItems[1],
            children: pagedSteps,
            label: (
                <Space align="center">
                    {renderTitle(<ReadOutlined style={{color: '#1890FF'}}/>, '完成一个批改作业任务')}
                    <Button
                        type="text"
                        icon={<LeftOutlined />}
                        size="small"
                        style={{marginLeft: 8}}
                        disabled={stepPage === 1}
                        onClick={e => {
                            e.stopPropagation();
                            setStepPage(p => Math.max(1, p - 1));
                        }}
                    />
                    <Button
                        type="text"
                        icon={<RightOutlined />}
                        size="small"
                        disabled={stepPage === totalPages}
                        onClick={e => {
                            e.stopPropagation();
                            setStepPage(p => Math.min(totalPages, p + 1));
                        }}
                    />
                </Space>
            ),
        }
    ];

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
                items={pagedPromptItems}
                wrap
                styles={{
                    item: {
                      flex: 1,
                      width: "100%",
                      backgroundImage: `linear-gradient(137deg, #e5f4ff 0%, #efe7ff 100%)`,
                      border: 0,
                    },
                    subItem: {
                      background: "rgba(255,255,255,0.45)",
                      border: "1px solid #FFF",
                    },
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