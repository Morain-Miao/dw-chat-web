import React, { useState } from 'react';
import {Button, Space, message as antdMessage, Dropdown, MenuProps} from "antd";
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
    RightOutlined,
    UpOutlined,
    DownOutlined,
    VerticalAlignTopOutlined,
    VerticalAlignBottomOutlined
} from "@ant-design/icons";
import BatchUpload from './batch-upload';


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

const batchUploadPromptItems: PromptsProps['items'] = [
    {
        key: 'batch-1',
        label: '批量上传作业',
        description: '选择作业和班级，点击学生名字快速生成提交作业命令',
        children: [
            {
                key: 'batch-1-1',
                icon: <QuestionCircleOutlined />,
                label: '批量上传作业',
                description: '选择作业和班级，点击学生名字快速生成提交作业命令',
            }
        ],
    },
];

type Props = {
    handleSubmit: (value: string) => void;
    handleFillInput?: (value: string) => void;
    minimized?: boolean;
    onMinimize?: () => void;
    onRestore?: () => void;
}

const STEPS_PER_PAGE = 3;

// 最小化时欢迎区高度
export const MINIMIZED_WELCOME_HEIGHT = 56;

/**
 * 初始态的欢迎语和提示词
 */
const InitWelcome = (props: Props) => {
    const [stepPage, setStepPage] = useState(1);
    const [messageApi, contextHolder] = antdMessage.useMessage();
    const [showBatchUpload, setShowBatchUpload] = useState(false);
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

    const menuItems: MenuProps['items'] = [
        {
            key: 'welcome-page',
            label: '欢迎页面',
            onClick: () => setShowBatchUpload(false),
        },
        {
            key: 'batch-upload',
            label: '批量上传作业',
            onClick: () => setShowBatchUpload(true),
        },

        // 最小化功能从菜单中移除
    ];

    const handleShare = async () => {
        const shareData = {
            title: document.title,
            text: '燕桥中学Ai智能助手，立即体验！',
            url: window.location.href,
        };
        const copyText = `燕桥中学Ai智能助手，立即体验！\n${window.location.href}`;
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (e) {
                // 用户取消分享，无需处理
            }
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(copyText);
            messageApi.success('内容已复制到剪贴板！');
        } else {
            const input = document.createElement('input');
            input.value = copyText;
            document.body.appendChild(input);
            input.select();
            try {
                document.execCommand('copy');
                messageApi.success('内容已复制到剪贴板！');
            } catch (err) {
                messageApi.info('请手动复制内容：' + copyText);
            }
            document.body.removeChild(input);
        }
    };

    return (
        <Space
            className='pt-10'
            direction='vertical'
            size={16}
            style={{ width: '100%' }}
        >
            {contextHolder}
            <div style={{
                position: 'relative',
                minHeight: props.minimized ? MINIMIZED_WELCOME_HEIGHT : 120,
                maxWidth: 700,
                margin: '0 auto',
                width: '100%',
                background: '#fff',
                borderRadius: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {/* 右上角按钮区，始终显示在欢迎区右上角 */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    zIndex: 10,
                    display: 'flex',
                    gap: 8,
                    pointerEvents: 'auto',
                }}>
                    {/* 最小化/还原按钮 */}
                    <Button
                        icon={props.minimized ? <VerticalAlignBottomOutlined /> : <VerticalAlignTopOutlined />}
                        onClick={() => {
                            if (props.minimized) {
                                props.onRestore && props.onRestore();
                            } else {
                                props.onMinimize && props.onMinimize();
                            }
                        }}
                    />
                    <Button icon={<ShareAltOutlined/>} onClick={handleShare}/>
                    <Dropdown menu={{items: menuItems}} placement="bottomRight">
                        <Button icon={<EllipsisOutlined/>}/>
                    </Dropdown>
                </div>
                {/* 欢迎标题栏始终居中，最小化时隐藏AI头像 */}
                <Welcome
                    variant="borderless"
                    icon={props.minimized ? null : <img className="ai-welcome-avatar" src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp" alt="AI助手" />}
                    title={props.minimized ? '' : "您好,我是燕桥中学Ai智能助手,很高兴认识你!"}
                    description={props.minimized ? '' : "模型基于DeepSeek和阿里千问,可以回答你关于燕桥中学的任何问题,包括学生档案、作业批改、学生成绩等。"}
                    extra={null}
                    style={{ minHeight: 80, width: '100%' }}
                />
                <style jsx global>{`
                  .ai-welcome-avatar {
                    display: block;
                    margin: 0 auto;
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: #fff;
                    object-fit: contain;
                  }
                  @media (max-width: 600px) {
                    .ai-welcome-avatar {
                      width: 60px !important;
                      height: 60px !important;
                    }
                  }
                  @media (max-width: 400px) {
                    .ai-welcome-avatar {
                      width: 44px !important;
                      height: 44px !important;
                    }
                  }
                `}</style>
                {/* 提示词最小化时隐藏，用display:none而不是条件渲染 */}
                <div style={{ display: props.minimized ? 'none' : 'block', width: '100%' }}>
                    {showBatchUpload ? (
                        <div style={{ padding: '16px' }}>
                            <BatchUpload
                                onStudentClick={(homework, student) => {
                                    if (props.handleFillInput) {
                                        props.handleFillInput(`我要提交作业, 作业标题: [${homework}], 学生名: [${student}]`);
                                    }
                                }}
                            />
                        </div>
                    ) : (
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
                    )}
                </div>
            </div>
        </Space>
    );
};

export default InitWelcome;