'use client'

import React, {
    createContext, ReactNode,
    useCallback, useContext,
    useEffect, useMemo, useState
} from 'react';
import {useRouter} from "next/navigation";
import {
    getUserCookieAction,
    cleanUserCookieAction,
    setUserCookieAction
} from "@/app/(auth)/actions";
import {loginAPI, logoutAPI} from "@/apis/user-api";
import {message} from "antd";
import Cookies from 'js-cookie';

export interface User {
    userId: string;
    username: string;
    token: string;
    expireTime: number;
    loginTime: number;
    ipaddr: string;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<User | undefined>;
    logout: () => Promise<void>;
    isLogin: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth 必须在 AuthProvider 内使用！');
    }
    return context;
}


/**
 * 用户信息 鉴权 Provider
 * @constructor
 */
const AuthProvider = ({children}: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    // 仅在客户端加载时检查 cookie
    useEffect(() => {
        console.log('AuthProvider useEffect running');
        if (typeof window !== 'undefined') {
            const userCookie = Cookies.get('userCookie');
            console.log('useEffect userCookie:', userCookie);
            if (userCookie) {
                try {
                    const user = JSON.parse(userCookie);
                    console.log('useEffect parsed user:', user);
                    if (user && user.userId && user.token) {
                        setUser(user);
                    }
                } catch (e) {
                    setUser(null);
                }
            }
            setLoading(false);
        }
    }, []);

    // 使用 useCallback 避免函数引用变化
    const login = useCallback(async (username: string, password: string) => {
        const resp = await loginAPI({username, password});
        if (resp.code === 200) {
            const u: User = {username, token: resp.data.token, userId: resp.data.userId, expireTime: resp.data.expireTime, loginTime: resp.data.loginTime, ipaddr: resp.data.ipaddr}
            setUser(u);
            // 使用 cookies 存储登录信息（服务端+前端都 set 一遍）
            await setUserCookieAction(resp.data);
            Cookies.set('userCookie', JSON.stringify(u), { path: '/' }); // 前端再 set 一遍
            return u;
        } else {
            setUser(null)
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            const resp = await logoutAPI()
            // 无论 API 是否成功，都执行清理操作
            // 先清除 cookie
            await cleanUserCookieAction()
            // 清除自动登录信息
            localStorage.removeItem('auto_login_info')
            // 再清除状态
            setUser(null)
            
            if (resp.code !== 200) {
                message.error(resp.message)
            }
            
            // 使用 window.location.href 替代 router.push
            window.location.href = '/login'
        } catch (error) {
            console.error('Logout error:', error)
            // 即使 API 调用失败，也要确保清理本地状态
            await cleanUserCookieAction()
            // 清除自动登录信息
            localStorage.removeItem('auto_login_info')
            setUser(null)
            // 使用 window.location.href 替代 router.push
            window.location.href = '/login'
        }
    }, []);

    // 使用 useMemo 避免 value 对象引用变化
    const value = useMemo(() => ({
        user,
        login,
        logout,
        isLogin: !!user,
        loading
    }), [user, login, logout, loading])

    console.log('AuthProvider render, user:', user);

    return (
        <AuthContext.Provider value={value}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;