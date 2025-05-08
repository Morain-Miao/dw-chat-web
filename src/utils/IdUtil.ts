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

export function getCurrentUserId(): string{
    const userCookie = Cookies.get(COOKIE_USER);
    console.log('userCookie', userCookie);
    if (userCookie) {
        try {
            const user = JSON.parse(userCookie);
            return user.userId;
        } catch (e) {
            console.error('Failed to parse user cookie.', e);
        }
    }
    return '';
}