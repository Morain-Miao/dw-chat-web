'use server';

import {cookies} from 'next/headers';
import {COOKIE_USER} from "@/utils/constant";
import type {ApiResponse} from "@/apis";
import {User} from "@/components/provider/auth-provider";
import {appConfig} from "@/utils/appConfig";

/**
 * 服务端组件
 */

/**
 * 执行登录操作
 */
export async function loginAction(username: string, password: string) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        console.log('构建阶段，不执行')
        return null
    }
    console.log('执行登录操作: username: ' + username + ', password: ' + password);
    const url = `${appConfig.clientHost}/api/auth/login`;
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password
        }),
    }
    const resp: ApiResponse<string> = await fetch(url, options).then(resp => resp.json());
    if (resp.code === 200 && resp.data) {
        console.log('登录成功')
        // 使用 cookies 存储登录信息
        const user = resp.data as unknown as User;
        await setUserCookieAction(user);
        return user;
    }
    return null;
}

/**
 * 储存登录用户信息到 cookie
 *
 * @param username
 * @param token
 */
export async function setUserCookieAction(user: User) {
    const cookie = await cookies();
    cookie.set(COOKIE_USER,
        JSON.stringify(user),
        {
            path: '/',
            httpOnly: false, // ❗必须为 false，客户端才能读取
            //secure: process.env.NODE_ENV === 'production', // 设置了 secure: true，只能在 https 环境下  Cookies.get 到 Cookie。
            //sameSite: 'strict', // 设置了 sameSite: 'strict'，请求是从同一站点发起的，才能 Cookies.get 到 Cookie。
            maxAge: 60 * 60 * 24 * 7 // 7 days
        }
    );
    console.log('储存登录用户信息')
}


/**
 * 清除 cookie 中的登录用户信息
 */
export async function cleanUserCookieAction() {
    const cookie = await cookies();
    cookie.delete(COOKIE_USER);
    console.log('清除登录用户信息')
}

/**
 * 从 cookie 获取登录用户信息
 */
export async function getUserCookieAction() {
    try {
        const cookie = await cookies();
        const userCookie = cookie.get(COOKIE_USER);
        if (userCookie && userCookie.value) {
            try {
                const user: User = JSON.parse(userCookie.value);
                // 验证必要的字段是否存在
                if (user && user.userId && user.token) {
                    console.log('获取登录用户信息成功')
                    return user;
                }
            } catch (parseError) {
                console.error('Cookie 解析失败:', parseError);
                // 如果解析失败，清除可能损坏的 cookie
                await cleanUserCookieAction();
            }
        }
    } catch (e) {
        console.error('获取 Cookie 失败:', e);
        // 发生错误时也清除 cookie
        await cleanUserCookieAction();
    }
    return null;
}