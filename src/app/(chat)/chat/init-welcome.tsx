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
                label: `了解燕桥中学Ai的本地化功能`,
                description: `请列出你有什么Tool功能`,
            },
            {
                key: '1-2',
                icon: <QuestionCircleOutlined/>,
                label: `让Ai帮助你创建学生信息`,
                description: `如何创建学生档案?请列出Tool需要的参数, 不要模拟, 不要执行调用tool`,
            },
            {
                key: '1-3',
                icon: <SearchOutlined/>,
                label: `你的第一个查询类型对话`,
                description: `查询初二五班的信息`,
            },
        ],
    },
    {
        key: '2',
        label: renderTitle(<ReadOutlined style={{color: '#1890FF'}}/>, '完成一个批改作业任务'),
        description: '如何进行作业批改?【共6步】',
        children: [
            {
                key: '2-1',
                icon: <TagOutlined />,
                label: `第一步: 点击文件上传,上传作业原题、答案到附件`,
                description: `请帮我保存作业原题和答案, 作业标题: [5.14xxx作业], 学科: [英语]`,
            },
            {
                key: '2-2',
                icon: <TagOutlined />,
                label: `第二步: 输入刚才保存的作业标题, 发布作业给某班级`,
                description: `发布[xxx作业]给[xxx班级],提交截止时间[5](非必填,默认24小时)`,
            },
            {
                key: '2-3',
                icon: <TagOutlined />,
                label: `第三步: 由学生自己或老师上传作业答题卡照片到附件`,
                description: `我要提交作业, 作业标题: [xxx作业], 学生名: [张三]`,
            },
            {
                key: '2-4',
                icon: <TagOutlined />,
                label: `第四步: 告诉Ai自动批改哪个班级的作业`,
                description: `异步执行作业批改, 作业标题: [xxx作业], 班级名: [xxx班级], 学科:[xxx学科](非必填, 不填代表全学科)`,
            },
            {
                key: '2-5',
                icon: <TagOutlined />,
                label: `第五步: 等待Ai批改完成后查询`,
                description: `帮我查询作业批改结果, 作业标题: [xxx作业], 班级名: [xxx班级], 学科:[xxx学科](非必填, 不填代表全学科), 学生名: [张三](非必填, 不填代表全班)`,
            },
            {
                key: '2-6',
                icon: <TagOutlined />,
                label: `第六步: 对Ai批改的结果进行人工干预, 此操作不会修改Ai批改结果`,
                description: `对批改结果进行人工批改, 作业批改结果id: [12345], 人工批改意见: [xxxxxxxxxxxxxxxxxxxxxxxxxxxx]`,
            }
        ],
    }
];


type Props = {
    handleSubmit: (value: string) => void;
    handleFillInput?: (value: string) => void;
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
                        if (props.handleFillInput) {
                            props.handleFillInput(data.description.toString());
                        }
                    }
                }}
            />
        </Space>
    );
};

export default InitWelcome;