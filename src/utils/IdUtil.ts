import Cookies from "js-cookie";
import { COOKIE_USER } from "@/utils/constant";
/**
 * 生成UUID
 */
export const buildUUID = () => {
    return 'xxxxxxxxxxxxxxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * 重定向到登录页面
 */
export function redirectToLogin() {
    // 清除用户 cookie
    Cookies.remove(COOKIE_USER);
    // 跳转到登录页面
    window.location.href = '/login';
}

/**
 * 获取当前用户ID
 * @returns 用户ID，如果未登录则返回空字符串并重定向到登录页面
 */
export function getCurrentUserId(): string {
    const userCookie = Cookies.get(COOKIE_USER);
    console.log('userCookie', userCookie);
    if (userCookie) {
        try {
            const user = JSON.parse(userCookie);
            if (user && user.userId) {
                return user.userId;
            }
        } catch (e) {
            console.error('Failed to parse user cookie.', e);
        }
    }
    
    // 使用 setTimeout 确保在返回空字符串后再跳转
    setTimeout(redirectToLogin, 0);
    
    return ''; // 当无法获取用户ID时返回空字符串
}