'use client'

import React, {useState, useEffect} from 'react';
import type {CSSProperties} from 'react';
import {Space, Tabs, message, theme, Flex} from 'antd';
import '@ant-design/v5-patch-for-react-19'; // 兼容 React19
import {
    DingtalkOutlined,
    LockOutlined,
    UserOutlined,
    WechatOutlined,
} from '@ant-design/icons';
import {
    LoginForm,
    ProConfigProvider,
    ProFormCheckbox,
    ProFormText,
    setAlpha,
} from '@ant-design/pro-components';
import {useRouter, useSearchParams} from "next/navigation";
import Logo from "@/app/(chat)/chat/logo";
import {appConfig} from "@/utils/appConfig";
import {useAuth} from "@/components/provider/auth-provider";


type LoginType = 'account' | 'email';

const AUTO_LOGIN_KEY = 'auto_login_info';

interface AutoLoginInfo {
    username: string;
    password: string;
    timestamp: number;
}

/**
 * 登录页
 */
const LoginPage = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const {token} = theme.useToken();
    const router = useRouter();
    const {login} = useAuth();
    const [loginType, setLoginType] = useState<LoginType>('account');
    const [autoLogin, setAutoLogin] = useState(false);

    //const searchParams = useSearchParams();
    //const redirect = searchParams.get('redirect') || '/';
    //console.log('redirect:', redirect)

    const iconStyles: CSSProperties = {
        marginInlineStart: '16px',
        color: setAlpha(token.colorTextBase, 0.2),
        fontSize: '24px',
        verticalAlign: 'middle',
        cursor: 'pointer',
    };

    // 检查自动登录
    useEffect(() => {
        const checkAutoLogin = async () => {
            const autoLoginInfo = localStorage.getItem(AUTO_LOGIN_KEY);
            if (autoLoginInfo) {
                try {
                    const info: AutoLoginInfo = JSON.parse(autoLoginInfo);
                    // 检查是否在7天内
                    if (Date.now() - info.timestamp < 7 * 24 * 60 * 60 * 1000) {
                        const user = await login(info.username, info.password);
                        if (user) {
                            messageApi.success('自动登录成功');
                            router.push('/');
                        } else {
                            // 如果自动登录失败，清除保存的信息
                            localStorage.removeItem(AUTO_LOGIN_KEY);
                        }
                    } else {
                        // 如果超过7天，清除保存的信息
                        localStorage.removeItem(AUTO_LOGIN_KEY);
                    }
                } catch (e) {
                    console.error('自动登录失败:', e);
                    localStorage.removeItem(AUTO_LOGIN_KEY);
                }
            }
        };
        checkAutoLogin();
    }, []);

    // 执行登录操作
    const handleLogin = async (formData: Record<string, any>) => {
        console.log('handleLogin 被触发', formData);
        const username: string = formData.username;
        const password: string = formData.password;
        const user = await login(username, password);
        
        console.log('user:', user);
        if (user) {
            // 如果选择了自动登录，保存登录信息
            if (formData.autoLogin) {
                const autoLoginInfo: AutoLoginInfo = {
                    username,
                    password,
                    timestamp: Date.now()
                };
                localStorage.setItem(AUTO_LOGIN_KEY, JSON.stringify(autoLoginInfo));
            } else {
                // 如果没有选择自动登录，清除之前保存的信息
                localStorage.removeItem(AUTO_LOGIN_KEY);
            }

            messageApi.success('登录成功');
            router.push('/');
        } else {
            messageApi.error('登录失败')
            console.log('user is null')
        }
    }

    //const resp: ApiResponse<string> = await loginAction(username, password);

    /*const handleLogin2 = async (formData: Record<string, any>) => {
        const username: string = formData.username;
        const password: string = formData.password;
        console.log('执行成功: username: ' + username + ', password: ' + password);
        const resp = await loginAPI({username, password});
        if (resp.code === 200) {
            console.log('登录成功')
            // 使用 cookies 存储登录信息
            await setUserCookieAction(username, resp.data)
            message.success('登录成功')
            // 登录成功后跳回之前要去的页面
            router.push("/");
        } else {
            message.error(resp.message)
        }
    }*/

    // 处理图标点击
    const handleIconClick = (type: string) => {
        messageApi.info(`${type}登录功能暂未开放，敬请期待！`);
    };

    // 处理忘记密码点击
    const handleForgotPassword = () => {
        messageApi.info('请联系燕桥中学系统管理员重置密码！');
    };

    return (
        <ProConfigProvider hashed={false}>
            {contextHolder}
            <Flex
                style={{
                    backgroundColor: token.colorBgContainer,
                    marginTop: '8%',
                }}
            >
                <LoginForm
                    logo={<Logo/>}
                    title={
                        <span
                            className="login-title-gradient"
                        >
                            {appConfig.appName}
                        </span>
                    }
                    subTitle={<span className="login-subtitle">AI 聊天式管理系统</span>}
                    actions={
                        <Space>
                            其他登录方式
                            <WechatOutlined 
                                style={iconStyles}
                                onClick={() => handleIconClick('微信')}
                            />
                            <DingtalkOutlined 
                                style={iconStyles}
                                onClick={() => handleIconClick('钉钉')}
                            />
                        </Space>
                    }
                    onFinish={handleLogin}
                >
                    <Tabs
                        centered
                        activeKey={loginType}
                        onChange={(activeKey) => setLoginType(activeKey as LoginType)}
                        items={[
                            {
                                key: 'account',
                                label: '账号密码登录',
                            },
                            {
                                key: 'email',
                                label: '邮箱登录',
                            },
                        ]}
                    >
                    </Tabs>
                    {loginType === 'account' && (
                        <>
                            <ProFormText
                                name="username"
                                placeholder={'用户名: '}
                                fieldProps={{
                                    size: 'large',
                                    prefix: <UserOutlined className={'prefixIcon'}/>,
                                }}
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入用户名!',
                                    },
                                ]}
                            />
                            <ProFormText.Password
                                name="password"
                                placeholder={'密码: '}
                                fieldProps={{
                                    size: 'large',
                                    prefix: <LockOutlined className={'prefixIcon'}/>,
                                    //strengthText: 'Password should contain numbers, letters and special characters, at least 8 characters long.',
                                }}
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入密码！',
                                    },
                                ]}
                            />
                        </>
                    )}
                    {loginType === 'email' && (
                        <>
                            <ProFormText
                                name="email"
                                fieldProps={{
                                    size: 'large',
                                    prefix: <UserOutlined className={'prefixIcon'}/>,
                                }}
                                placeholder={'邮箱: admin@gmail.com'}
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入邮箱!',
                                    },
                                ]}
                            />
                            <ProFormText.Password
                                name="password"
                                fieldProps={{
                                    size: 'large',
                                    prefix: <LockOutlined className={'prefixIcon'}/>,
                                    strengthText:
                                        'Password should contain numbers, letters and special characters, at least 8 characters long.',
                                    statusRender: (value) => {
                                        const getStatus = () => {
                                            if (value && value.length > 12) {
                                                return 'ok';
                                            }
                                            if (value && value.length > 6) {
                                                return 'pass';
                                            }
                                            return 'poor';
                                        };
                                        const status = getStatus();
                                        if (status === 'pass') {
                                            return (
                                                <div style={{color: token.colorWarning}}>
                                                    强度：中
                                                </div>
                                            );
                                        }
                                        if (status === 'ok') {
                                            return (
                                                <div style={{color: token.colorSuccess}}>
                                                    强度：强
                                                </div>
                                            );
                                        }
                                        return (
                                            <div style={{color: token.colorError}}>
                                                强度：弱
                                            </div>
                                        );
                                    },
                                }}
                                placeholder={'密码: 123456'}
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入密码！',
                                    },
                                ]}
                            />
                        </>
                    )}
                    <div style={{marginBlockEnd: 24,}}>
                        <ProFormCheckbox 
                            noStyle 
                            name="autoLogin"
                            fieldProps={{
                                onChange: (e) => setAutoLogin(e.target.checked)
                            }}
                        >
                            自动登录
                        </ProFormCheckbox>
                        <a 
                            style={{float: 'right',}}
                            onClick={handleForgotPassword}
                        >
                            忘记密码
                        </a>
                    </div>
                </LoginForm>
            </Flex>
            <style jsx global>{`
                .login-title-gradient {
                    font-size: 2.2rem;
                    font-weight: bold;
                    background: linear-gradient(to right, #22d3ee, #3b82f6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    display: block;
                    margin-left: 0.5rem;
                    text-align: center;
                    line-height: 1.1;
                }
                .login-subtitle {
                    display: block;
                    text-align: center;
                    color: #888;
                    font-size: 1.1rem;
                    margin-top: 0.2rem;
                    margin-bottom: 0.5rem;
                }
                @media (max-width: 600px) {
                    .login-title-gradient {
                        font-size: 1.3rem !important;
                        margin-left: 0 !important;
                        margin-top: 0.2rem;
                        margin-bottom: 0.2rem;
                    }
                    .login-subtitle {
                        font-size: 0.85rem !important;
                        margin-top: 0.1rem;
                        margin-bottom: 0.2rem;
                    }
                }
            `}</style>
        </ProConfigProvider>
    );
};

export default LoginPage;