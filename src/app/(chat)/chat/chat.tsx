"use client";

import React, {useEffect, useRef, useState, useCallback, useMemo} from 'react';
import {useImmer} from 'use-immer';
import {
    Bubble,
    Conversations,
    ConversationsProps,
    Sender,
    useXAgent,
    useXChat,
    XProvider,
    XRequest
} from "@ant-design/x";
import {
    Button, GetProp, Space,
    message,
    Tooltip, theme,
    ThemeConfig, Flex,
    Modal, Input, Typography,
    type AvatarProps,
} from "antd";
import {
    CopyOutlined, DeleteOutlined, DislikeFilled,
    DislikeOutlined, DownOutlined, EditOutlined,
    GlobalOutlined, LikeFilled, LikeOutlined,
    NodeIndexOutlined, PaperClipOutlined,
    PlusOutlined, UpOutlined, UserOutlined
} from "@ant-design/icons";
import {BubbleDataType} from "@ant-design/x/es/bubble/BubbleList";
import zhCN from "antd/locale/zh_CN";
import '@ant-design/v5-patch-for-react-19'; // 兼容 React19
import {writeText} from "clipboard-polyfill";
import {ProLayout} from "@ant-design/pro-layout";
import type {ProTokenType} from "@ant-design/pro-provider";
import {SiderMenuProps} from "@ant-design/pro-layout/es/components/SiderMenu/SiderMenu";
import type {HeaderViewProps} from "@ant-design/pro-layout/es/components/Header";
import {Conversation} from "@ant-design/x/es/conversations";
import {MessageInfo} from "@ant-design/x/es/use-x-chat";
import Cookies from "js-cookie";
// Local components
import MarkdownRender from "@/app/(chat)/chat/markdown-render";
import InitWelcome from "@/app/(chat)/chat/init-welcome";
import Logo from "@/app/(chat)/chat/logo";
import Footer from "@/app/(chat)/chat/footer";
import HeaderActions from "@/app/(chat)/chat/header-actions";
import {DeepSeekIcon, PanelLeftClose, PanelLeftOpen} from "@/components/Icons";
import AvatarDropdown from "@/app/(chat)/chat/avatar-dropdown";
import FileUpload from "@/app/(chat)/chat/file-upload";
import FloatingWelcome from './FloatingWelcome';
import { promptItems } from './init-welcome';

// APIs
import {
    AgentMessage,
    AIAgentMessage,
    deleteChatAPI,
    MessageVO,
    queryChatPageAPI,
    queryMessageListAPI,
    saveChatAPI,
    saveVoteAPI,
    StreamChatParam,
    uploadFileAPI,
    uploadFilesBatchAPI
} from "@/apis/chat-api";

// Utils & Providers
import {appConfig} from "@/utils/appConfig";
import {useTheme} from "@/components/provider/theme-provider";
import {useAuth, User} from "@/components/provider/auth-provider";
import type {ProLayoutProps} from "@ant-design/pro-components";
import dynamic from 'next/dynamic';
import { COOKIE_USER } from '@/utils/constant';
import { getCurrentUserId } from '@/utils/IdUtil';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);


// 动态导入
/*const ProLayout = dynamic(
    () => import('@ant-design/pro-components').then(mod => mod.ProLayout),
    { ssr: false }
);*/

const defaultConversationsItems: GetProp<ConversationsProps, 'items'> = []


type ChatProps = {
    defaultConversationItems?: Conversation[];
}

const ChatPage = (props: ChatProps) => {
    // Hooks and state initialization
    const [messageApi, contextHolder] = message.useMessage();
    const {token} = theme.useToken();
    const {isDark} = useTheme();
    const {user} = useAuth();

    const [inputTxt, setInputTxt] = useState('');
    const [requestLoading, setRequestLoading] = useState(false);
    const [conversationsItems, setConversationsItems] = useState(props.defaultConversationItems);
    const [activeConversationKey, setActiveConversationKey] = useState('');
    const [openSearch, setOpenSearch] = useState(false);
    const [openReasoning, setOpenReasoning] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [messageItems, updateMessageItems] = useImmer<BubbleDataType[]>([]);
    const [showBubble, setShowBubble] = useState(false);
    const [bubbleShown, setBubbleShown] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: number, name: string }>>([]);

    const abortControllerRef = useRef<AbortController | null>(null);

    // 初始化加载历史消息
    useEffect(() => {
        const initData = async () => {
            // 初始化会话列表
            await initConversations();
        };
        initData();
    }, []);

    // 主题配置
    const customTheme: ThemeConfig = {
        algorithm: isDark() ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
            colorPrimary: token.colorPrimary,
        }
    }

    // ProLayout Token
    const proLayoutToken: ProTokenType['layout'] = {
        pageContainer: {
            colorBgPageContainer: isDark() ? '' : token.colorBgBase,
            paddingBlockPageContainerContent: 10,  // 上下内距离
            paddingInlinePageContainerContent: 5, // 左右内距离
        },
        sider: {
            paddingInlineLayoutMenu: 2,
        }
    }

    /* 侧边栏触发器 */
    const SidebarTrigger = useMemo(() => (
        <Tooltip title={collapsed ? '打开边栏' : '收起边栏'} placement='right'>
            <Button
                styles={{icon: {color: '#676767'}}}
                type='text'
                icon={collapsed ? <PanelLeftOpen/> : <PanelLeftClose/>}
                onClick={() => setCollapsed(!collapsed)}
            />
        </Tooltip>
    ), [collapsed]);

    // 处理 logo 和标题文字的样式
    const menuHeaderRender = (logo: React.ReactNode, title: React.ReactNode, props?: SiderMenuProps) => {
        // 只显示 logo，不显示文字
        if (props?.collapsed) {
            return <Flex align='center'>{logo}</Flex>;
        }
        return (
            <Flex align='center'>
                {logo}
                <div style={{ marginLeft: 10, lineHeight: 1.1, minWidth: 140, textAlign: 'left' }}>
                    <div
                        style={{
                            fontSize: 20, // 中文字号大一些
                            fontWeight: 'bold',
                            background: 'linear-gradient(to right, #22d3ee, #3b82f6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '0.5em', // 增加字间距让整体更宽
                        }}
                    >
                        燕桥中学
                    </div>
                    <div
                        style={{
                            fontSize: 7, // 英文字号适当
                            fontWeight: 'bold',
                            background: 'linear-gradient(to right, #22d3ee, #3b82f6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '0.15em', // 英文适当加字间距
                        }}
                    >
                        CAMBRIDGE HIGH SCHOOL
                    </div>
                </div>
            </Flex>
        )
    }

    // 开启新对话按钮
    const addConversationRender = (props: SiderMenuProps) => {
        return <>
            {props.collapsed ?
                <Tooltip title='开启新对话'>
                    <Button
                        style={{
                            backgroundColor: '#1677ff0f',
                            border: '1px solid #1677ff34',
                            width: ' 35px',
                            margin: '10px -7px',
                        }}
                        type='link'
                        icon={<PlusOutlined/>}
                        onClick={() => {
                            console.log('点击了开启新对话（收起状态）');
                            clickAddConversation();
                        }}
                    />
                </Tooltip>
                :
                <Button
                    style={{
                        backgroundColor: '#1677ff0f',
                        border: '1px solid #1677ff34',
                        borderRadius: '10px',
                        width: 'calc(100% - 25px)',
                        height: '35px',
                        margin: '12px',
                    }}
                    type={'link'}
                    icon={<PlusOutlined/>}
                    onClick={() => {
                        console.log('点击了开启新对话（展开状态）');
                        clickAddConversation();
                    }}
                >
                    开启新对话
                </Button>
            }
        </>
    }

    // 点击添加会话
    const clickAddConversation = () => {
        addConversation(''); // 新建空白对话
        setMessages([]);
    }

    // 添加会话
    const addConversation = async (msg: string) => {
        let chatId: string = ''
        let chatName = msg && msg.length > 0 ? (msg.length > 10 ? msg.substring(0, 10) : msg) : '空白对话';
        const resp = await saveChatAPI({
            chatId,
            chatName,
            userId: getCurrentUserId()
        })
        console.log('saveChatAPI 返回:', resp);
        if (resp.code === 200) {
            // 初始化会话记录列表
            await initConversations()
            // 自动选中新建的会话
            if (resp.data) {
                console.log('新建会话 chatId:', resp.data);
                setActiveConversationKey(resp.data);
            }
            return resp.data;
        }
    };


    /**
     * 初始化会话记录
     */
    const initConversations = async () => {
        const resp = await queryChatPageAPI({
            pageNum: 1, pageSize: 100, chatName: ''
        })
        console.log('queryChatPageAPI 返回:', resp);
        if (resp.data) {
            const initConversationItems: Conversation[] = resp.data.list.map((item) => {
                return {
                    key: item.chatId,
                    label: item.chatName,
                    createTime: item.createTime,
                }
            });
            console.log('setConversationsItems:', initConversationItems);
            setConversationsItems(initConversationItems)
            if (initConversationItems.length > 0) {
                handleSelectedConversation(initConversationItems[0].key)
            }
        }
    }

    /**
     * 选中会话项
     */
    const handleSelectedConversation = (conversationKey: string) => {
        setActiveConversationKey(conversationKey)
    }

    /**
     * 保存会话名称
     */
    const saveConversation = async (key: string, label: string) => {
        const resp = await saveChatAPI({
            chatId: key,
            chatName: label,
            userId: getCurrentUserId()
        })
        if (resp.code == 200) {
            await initConversations()
        } else {
            messageApi.error(resp.message)
        }
    }

    /**
     * 删除会话记录
     */
    const deleteConversation = async (conversationKey: string) => {
        if (conversationKey) {
            const resp = await deleteChatAPI(conversationKey)
            if (resp.code == 200) {
                await initConversations()
            } else {
                messageApi.error(resp.message)
            }
        }
    }

    /*useEffect(() => {
        initConversations().then()
    }, []);*/


    // 会话编辑
    const menuConfig: ConversationsProps['menu'] = (conversation) => ({
        items: [
            {
                label: '重命名',
                key: 'rename',
                icon: <EditOutlined/>,
            },
            {
                label: '删除',
                key: 'delete',
                icon: <DeleteOutlined/>,
                danger: true,
            },
        ],
        onClick: (menuInfo) => {
            menuInfo.domEvent.stopPropagation();
            let newLabel = '';
            // 重命名会话
            if (menuInfo.key === 'rename') {
                Modal.confirm({
                    title: '重命名会话',
                    content: (
                        <Input
                            placeholder="请输入新的会话名称"
                            defaultValue={conversation.label?.toString()}
                            onChange={(e) => {
                                newLabel = e.target.value;
                            }}
                        />
                    ),
                    onOk: async () => {
                        if (newLabel) {
                            await saveConversation(conversation.key, newLabel)
                            messageApi.success('重命名成功');
                        }
                    },
                    onCancel: () => {
                        messageApi.info('取消重命名');
                    },
                });
            }
            // 删除会话
            if (menuInfo.key === 'delete') {
                Modal.confirm({
                    title: '永久删除对话',
                    content: '删除后，该对话不可恢复，确认删除吗？',
                    okType: 'danger',
                    okText: '删除',
                    onOk: async () => {
                        await deleteConversation(conversation.key)
                        messageApi.success('删除成功')
                    }
                });
            }
        },
    });

    // 会话分组函数
    function groupConversationsByTime(items: Conversation[]) {
        const now = dayjs();
        // 以本自然周周一为一周的开始
        const startOfWeek = now.startOf('isoWeek');
        const groups: { [key: string]: Conversation[] } = { '本周': [], '更早': [] };
        items.forEach(item => {
            // 使用 createTime 字段
            // @ts-ignore
            const createTime = item.createTime ? dayjs(item.createTime) : null;
            if (createTime && createTime.isAfter(startOfWeek)) {
                groups['本周'].push(item);
            } else {
                groups['更早'].push(item);
            }
        });
        return groups;
    }

    // 会话管理列表
    const conversationRender = (props: SiderMenuProps, defaultDom: React.ReactNode) => {
        if (props.collapsed) return null;
        // 分组
        const groups = groupConversationsByTime(conversationsItems || []);
        return (
            <div className='h-full px-1 overflow-y-auto scrollbar-container'>
                {Object.entries(groups).map(([group, items]) => (
                    items.length > 0 && (
                        <div key={group} style={{marginBottom: 16}}>
                            <div style={{
                                fontWeight: 'bold',
                                color: '#b0b0b0',
                                fontSize: 14,
                                margin: '12px 0 6px 8px',
                                borderBottom: '1px solid #eee',
                                paddingBottom: 2
                            }}>{group}</div>
                            <Conversations
                                items={items}
                                menu={menuConfig}
                                activeKey={activeConversationKey}
                                onActiveChange={setActiveConversationKey}
                            />
                        </div>
                    )
                ))}
            </div>
        );
    }

    // actionsRender
    const actionsRender = (props: HeaderViewProps) => {
        return <HeaderActions headerProps={props}/>
    }

    /**
     * 用户头像渲染
     */
    const avatarRender: ProLayoutProps['avatarProps'] = {
        icon: (<UserOutlined/>),
        size: 'small',
        title: (<>{user?.username}</>),
        render: (avatarProps: AvatarProps, avatarChildren: React.ReactNode) => {
            return (<AvatarDropdown>{avatarChildren}</AvatarDropdown>);
        },
    }

    // 模型连接信息
    const xRequest = XRequest({
        baseURL: `${appConfig.apiStreamChatUrl}`,
        fetch: async (url, options) => {
            const headers: any = {
                ...options?.headers,
            };
            console.log('fetch前 user:', user);
            console.log('fetch前 user.token:', user?.token);
            if (user?.token) {
                headers["Authorization"] = `Bearer ${user.token}`;
            } else {
                console.warn('未获取到有效 token，当前 user:', user);
            }
            console.log('fetch headers:', headers);
            const resp = await fetch(url, {
                ...options,
                headers,
                signal: abortControllerRef.current?.signal,
            });
            // 可选：打印响应
            // const respText = await resp.clone().text();
            // console.log('fetch response:', respText);
            return resp;
        }
    });

    /**
     * 与大模型交互
     */
    const [agent] = useXAgent<AgentMessage>({
        request: async (info, callbacks) => {
            const {message, messages} = info
            const {onUpdate: onAgentUpdate, onSuccess: onAgentSuccess, onError: onAgentError} = callbacks;

            const aiMessage: AIAgentMessage = {
                type: 'ai',
                loading: true,
                chatId: '',
                id: '',
                content: '',
                reasoningContent: '',
            }
            await xRequest.create<StreamChatParam, MessageVO>(
                {
                    chatId: message?.chatId || '',
                    content: message?.content || '',
                    openReasoning: message?.openReasoning,
                    openSearch: message?.openSearch,
                    userId: getCurrentUserId(),
                    ...(message?.type === 'user' && (message as any)?.fileIds ? { fileIds: (message as any).fileIds } : {}),
                },
                {
                    onUpdate: (chunk) => {
                        try {
                            setRequestLoading(false);
                            //console.log('onUpdate', JSON.stringify(chunk));
                            // @ts-ignore
                            const data: MessageVO | null = JSON.parse(chunk.data);
                            if (data && typeof data === 'object') {
                                aiMessage.id = data.msgId;
                                aiMessage.chatId = data.chatId;
                                const reasoning_content: string = data.reasoningContent || '';
                                const resp_content: any = data.content || '';
                                // 思考中
                                if (reasoning_content) {
                                    aiMessage.reasoningContent += reasoning_content;
                                }
                                // 回答
                                if (resp_content) {
                                    aiMessage.content += resp_content;
                                }
                            }
                            //console.log('onAgentUpdate， aiMessage：', JSON.stringify(aiMessage));
                            onAgentUpdate(aiMessage);
                        } catch (e) {
                            console.error('onUpdate fail:', e);
                            console.error('Received chunk:', chunk);
                        }
                    },
                    onSuccess: (chunk) => {
                        //console.log('onSuccess， chunk：', JSON.stringify(chunk));
                        //console.log('onSuccess， aiMessage：', JSON.stringify(aiMessage));
                        onAgentSuccess(aiMessage);
                    },
                    onError: (error) => {
                        console.error('onError', error);
                        onAgentError(error);
                        setRequestLoading(false);
                    },
                },
            )
        }
    });

    const {onRequest, messages, setMessages} = useXChat({
        agent: agent,
        requestPlaceholder: {
            id: '1',
            type: 'ai',
            content: '请求中...',
        },
        /*defaultMessages: [
            {
                id: 'init',
                status: 'success',
                message: {
                    type: 'ai',
                    id: '11',
                    content: 'Hello, what can I do for you?',
                },
            },
        ],*/
    });


    /**
     * 思考过程
     */
    const MessageHeader = ({message}: { message: AIAgentMessage }) => {
        const [open, setOpen] = useState<boolean>(true)

        return (message.reasoningContent &&
            <Flex vertical>
                <Button
                    style={{
                        width: '130px',
                        marginBottom: '5px',
                        borderRadius: token.borderRadiusLG,
                    }}
                    color="default"
                    variant="filled"
                    onClick={() => setOpen(!open)}
                >
                    <NodeIndexOutlined/>
                    {'深度思考'}
                    {open ? <UpOutlined style={{fontSize: '10px'}}/>
                        : <DownOutlined style={{fontSize: '10px'}}/>}
                </Button>
                {open &&
                    <div className='max-w-[600px] border-l-2 my-2 mr-2 pl-4'>
                        <Typography.Text type='secondary'>
                            {message.reasoningContent}
                        </Typography.Text>

                        {/*<Bubble
                            content={message.reasoningContent}
                            variant='borderless'
                            typing={message.loading && {step: 5, interval: 50}}
                            style={{maxWidth: 600}}
                            messageRender={(content) =>
                                <Typography.Text type='secondary'>
                                    {content}
                                </Typography.Text>
                            }
                        />*/}
                    </div>
                }

            </Flex>
        )
    }

    /**
     * 消息点赞
     */
    const msgLike = async (message: AIAgentMessage) => {
        message.voteType = message.voteType === 'up' ? '' : 'up'
        await saveVoteAPI({'contentId': message.id, 'voteType': message.voteType})
        if (message.voteType === 'up') {
            messageApi.success('感谢您的支持')
        }
    }

    /**
     * 消息点踩
     */
    const msgDislike = async (message: AIAgentMessage) => {
        message.voteType = message.voteType === 'down' ? '' : 'down'
        await saveVoteAPI({'contentId': message.id, 'voteType': message.voteType})
        if (message.voteType === 'down') {
            messageApi.info('感谢您的反馈')
        }
    }

    const MessageFooter = ({message}: { message: AIAgentMessage }) => {
        return <Space>
            <Tooltip title='喜欢'>
                <Button
                    size={'small'} type={'text'} icon={message.voteType === 'up' ? <LikeFilled/> : <LikeOutlined/>}
                    onClick={() => msgLike(message)}
                />
            </Tooltip>
            <Tooltip title='不喜欢'>
                <Button
                    size={'small'} type={'text'}
                    icon={message.voteType === 'down' ? <DislikeFilled/> : <DislikeOutlined/>}
                    onClick={() => msgDislike(message)}
                />
            </Tooltip>
            <Tooltip title='复制'>
                <Button
                    size={'small'} type={'text'} icon={<CopyOutlined/>}
                    onClick={() => {
                        writeText(message.content);
                        messageApi.success('已复制');
                    }}
                />
            </Tooltip>
        </Space>
    }


    /*useEffect(() => {
        if (props.defaultMessages) {
            console.log('init Messages')
            setMessages(props.defaultMessages)
        }
    }, []);*/

    useEffect(() => {
        const finalMessageItems: BubbleDataType[] = messages.length > 0
            ? messages.map((
                {id, message, status}) =>
                ({
                    key: id || message.id || `msg-${Date.now()}-${Math.random()}`, // 确保 key 唯一
                    role: message.type,
                    header: (message.type?.toLowerCase() === 'ai' && <MessageHeader message={message as AIAgentMessage}/>),
                    content: message.content,
                    footer: ((!agent.isRequesting() && message.type?.toLowerCase() === 'ai') &&
                        <MessageFooter message={message as AIAgentMessage}/>
                    ),
                    loading: status === 'loading' && requestLoading,
                    placement: message.type?.toLowerCase() === 'ai' ? 'start' : 'end',
                    variant: message.type?.toLowerCase() === 'ai' ? (message.content ? 'outlined' : 'borderless') : undefined,
                    avatar: message.type?.toLowerCase() === 'ai' ?
                        {
                            icon: <DeepSeekIcon/>,
                            style: {border: '1px solid #c5eaee', backgroundColor: 'white'}
                        } : undefined,
                    typing: message.type?.toLowerCase() === 'ai' && 'loading' in message && message.loading ?
                        {step: 5, interval: 50} : undefined,
                    style: message.type?.toLowerCase() === 'ai' ? {maxWidth: 700} : undefined,
                    messageRender: message.type?.toLowerCase() === 'ai' ?
                        ((content) => (<MarkdownRender content={content}/>)) : undefined,
                }))
            : [{ 
                key: 'welcome-message',
                content: (<InitWelcome handleSubmit={handleSubmitMsg}/>),
                variant: 'borderless' 
            }];
        updateMessageItems(finalMessageItems);
    }, [messages]);


    /**
     * 查询消息列表
     */
    const queryMessageList = async (conversationKey: string) => {
        if (!conversationKey) {
            return
        }
        const resp = await queryMessageListAPI(conversationKey)
        if (!resp.data) {
            console.warn('No message data received for conversation:', conversationKey);
            setMessages([]);
            return;
        }
        // @ts-ignore
        const msgs: MessageInfo<AgentMessage>[] = resp.data.map((item) => ({
            id: item.msgId,
            status: item.type === 'user' ? 'local' : 'success',
            message: {
                type: item.type,
                id: item.msgId,
                content: item.content,
                reasoningContent: item.reasoningContent,
                chatId: item.chatId,
                voteType: item.voteType,
            }
        }))
        setMessages(msgs)
    }

    useEffect(() => {
        queryMessageList(activeConversationKey).then()
    }, [activeConversationKey]);


    // 发送消息
    const handleSubmitMsg = async (msg: string) => {
        setInputTxt('');
        setRequestLoading(true);
        let chatId: string | undefined = '';
        if (!activeConversationKey) {
            chatId = await addConversation(msg);
        }
        // 自动更新空白对话标题
        const currentConversation = (conversationsItems || []).find(item => item.key === (chatId ? chatId : activeConversationKey));
        if (currentConversation && currentConversation.label === '空白对话') {
            const newLabel = msg.length > 10 ? msg.substring(0, 10) : msg;
            await saveConversation(currentConversation.key, newLabel);
        }
        setTimeout(() => {
            onRequest({
                type: 'user',
                id: Date.now().toString(),
                chatId: chatId ? chatId : activeConversationKey,
                content: msg,
                openReasoning: openReasoning,
                openSearch: openSearch,
                fileIds: uploadedFiles.map(file => file.id),
            });
        }, 500);
        // 只在第一次触发时弹出气泡
        if (!bubbleShown) {
            setShowBubble(true);
            setBubbleShown(true);
        }
    };

    /* 自定义发送框底部 */
    const senderFooter = ({components}: any) => {
        const {SendButton, LoadingButton, SpeechButton} = components;

        return (
            <Flex justify='space-between' align='center'>
                <Flex gap='small'>
                    <Tooltip
                        title={openReasoning ? '' : '调用新模型 DeepSeek-R1，解决推理问题'}
                        placement='left'
                    >
                        <Button
                            size='small'
                            shape='round'
                            type={openReasoning ? 'primary' : 'default'}
                            onClick={() => setOpenReasoning(!openReasoning)}
                        >
                            <NodeIndexOutlined/>
                            深度思考
                        </Button>
                    </Tooltip>
                    <Tooltip
                        title={openSearch ? '' : '按需搜索网页'}
                        placement='right'
                    >
                        <Button
                            size='small'
                            shape='round'
                            type={openSearch ? 'primary' : 'default'}
                            onClick={() => setOpenSearch(!openSearch)}
                        >
                            <GlobalOutlined/>
                            联网搜索
                        </Button>
                    </Tooltip>
                </Flex>

                <Flex gap='small'>
                    <FileUpload onUploadSuccess={(filesInfo) => {
                        if (Array.isArray(filesInfo)) {
                            setUploadedFiles(prev => [...prev, ...filesInfo]);
                        } else {
                            setUploadedFiles(prev => [...prev, filesInfo]);
                        }
                    }} />
                    {
                        !agent.isRequesting() ?
                            (
                                <Tooltip title={inputTxt ? '发送' : '请输入你的问题'}>
                                    <SendButton/>
                                </Tooltip>)
                            : (
                                <Tooltip title='停止'>
                                    <LoadingButton/>
                                </Tooltip>
                            )
                    }
                </Flex>
            </Flex>
        );
    }


    // 停止
    const handleCancel = () => {
        try {
            setRequestLoading(false);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort('用户手动停止');
                // 清理当前的 AbortController
                abortControllerRef.current = null;
            }
            messageApi.info('已停止对话');
        } catch (error: any) {
            // 忽略 AbortError，因为这是预期的行为
            if (error.name !== 'AbortError') {
                console.error('停止对话时发生错误:', error);
                messageApi.error('停止对话时发生错误');
            }
        }
    }

    // 通过 useEffect 清理函数自动取消未完成的请求：
    useEffect(() => {
        const controller = new AbortController();
        abortControllerRef.current = controller;
        return () => {
            try {
                if (controller) {
                    controller.abort('组件卸载，取消请求');
                }
            } catch (error: any) {
                // 忽略清理阶段的错误
                console.debug('清理阶段取消请求:', error);
            }
        };
    }, []);

    return (
        <XProvider
            locale={zhCN}
            theme={customTheme}
        >
            {contextHolder}
            <ProLayout
                className='h-lvh'
                token={proLayoutToken}
                pure={false}
                navTheme={'light'}
                layout={'side'}
                siderWidth={250}
                logo={<Logo/>}
                title={appConfig.appName}
                menuHeaderRender={menuHeaderRender}
                menuExtraRender={addConversationRender}
                menuContentRender={conversationRender}
                actionsRender={actionsRender}
                avatarProps={avatarRender}
                footerRender={() => (<Footer/>)}
                collapsedButtonRender={false}
                collapsed={collapsed}
                onCollapse={setCollapsed}
            >
                <div className='fixed z-10 h-12 w-12'>
                    {SidebarTrigger}
                </div>

                {/* 悬浮欢迎页组件 */}
                <FloatingWelcome
                    promptItems={promptItems}
                    handleSubmit={handleSubmitMsg}
                    showBubble={showBubble}
                    onBubbleHide={() => setShowBubble(false)}
                />

                <Flex
                    vertical
                    gap={'large'}
                    className='w-full'
                    style={{margin: '0px auto', height: '94.5vh'}}
                >
                    <div className='h-full w-full px-1 overflow-y-auto scrollbar-container'>
                        <Bubble.List
                            className='max-w-2xl  mx-auto'
                            items={messageItems}
                        />
                    </div>
                    <Sender
                        className='max-w-2xl mx-auto'
                        style={{marginTop: 'auto', borderRadius: '20px'}}
                        autoSize={{minRows: 2, maxRows: 8}}
                        placeholder='请输入你的问题...'
                        loading={agent.isRequesting()}
                        value={inputTxt}
                        onChange={setInputTxt}
                        onSubmit={handleSubmitMsg}
                        onCancel={handleCancel}
                        actions={false}
                        footer={senderFooter}
                    />
                </Flex>
            </ProLayout>
        </XProvider>
    );
};

export default ChatPage;