import {appConfig} from "@/utils/appConfig";
import type {ApiResponse} from "@/apis/index";
import {clientCoreFetcher, clientFetcher} from "@/utils/fetcher";
import type { User } from "@/components/provider/auth-provider";


/**
 * 注册参数
 */
export interface RegisterParam {
    username?: string;
    email?: string;
    password: string;
}

/**
 * 登录参数
 */
export interface LoginParam {
    username: string;
    password: string;
}

/**
 * 已登录用户信息
 */
export interface LoginUser {
    username: string;
    token: string;
}

/**
 * 用户注册 API
 *
 * @param username
 * @param email
 * @param password
 */
export const  registerAPI = async ({username, email, password}: RegisterParam) => {
    const url = `/user/register`;
    const options = {
        method: "POST",
        body: JSON.stringify({
            username,
            email,
            password,
        }),
    }
    const response: ApiResponse<string> = await clientCoreFetcher(url, options);
    //console.log('registerAPI response:', JSON.stringify(response));
    return response;
}

/**
 * 用户登录 API
 *
 * @param username
 * @param password
 */
export const loginAPI = async ({username, password}: LoginParam) => {
    const url = `/user/login`;
    const options = {
        method: "POST",
        body: JSON.stringify({
            username,
            password
        }),
    }
    console.log('loginAPI url:', url)
    const response: ApiResponse<User> = await clientCoreFetcher(url, options);
    //console.log('loginAPI response:', JSON.stringify(response));
    return response;
}


/**
 * 退出登录 API
 */
export const logoutAPI = async () => {
    const url = `/user/logout`;
    const options = {
        method: "DELETE",
    }
    const response: ApiResponse<void> = await clientCoreFetcher(url, options);
    return response;
}


/**
 * 查询用户信息 API
 */
export const queryUserAPI = async () => {
    const url = `/user/queryUser`;
    const options = {
        method: "GET",
    }
    const response: ApiResponse<string> = await clientCoreFetcher(url, options);
    return response;
}