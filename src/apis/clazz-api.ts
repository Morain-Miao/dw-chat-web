import {ApiResponse} from "@/apis/index";
import {clientCoreFetcher} from "@/utils/fetcher";

/**
 * 班级信息
 */
export interface ClazzVo {
    id: number;
    name: string;
    displayName: string;
    grade: string;
    entryYear: number;
    facultyAndStaffIds: number[];
    subjectIds: number[];
    studentIds: number[];
    createdAt: string;
    modifiedAt: string;
}

/**
 * 学生信息
 */
export interface StudentVo {
    id: number;
    userAlias: string;  // 学生中文名
    number: string;
    candidateNumber: string;
    gender: string;
    ethnicity: string;
    clazzIds: number[];
    roleId: number;
    userId: number;
    createdAt: string;
    modifiedAt: string;
}

/**
 * 作业信息
 */
export interface SchoolworkVo {
    id: number;
    title: string;
}

/**
 * 获取所有班级列表
 */
export const findAllClazzAPI = async () => {
    const url = `/clazz`;
    const options = {
        method: "GET"
    }
    const response: ApiResponse<ClazzVo[]> = await clientCoreFetcher(url, options);
    return response;
};

/**
 * 根据班级名称模糊查询班级列表
 * @param displayName 班级显示名称，传空字符串查询所有
 */
export const findClazzByDisplayNameAPI = async (displayName: string) => {
    const url = `/clazz/clazzs/${displayName}`;
    const options = {
        method: "GET"
    }
    const response: ApiResponse<ClazzVo[]> = await clientCoreFetcher(url, options);
    return response;
};

/**
 * 根据班级ID查询学生列表
 * @param clazzId 班级ID
 */
export const findStudentsByClazzIdAPI = async (clazzId: number) => {
    const url = `/student/clazz/${clazzId}/students`;
    const options = {
        method: "GET"
    }
    const response: ApiResponse<StudentVo[]> = await clientCoreFetcher(url, options);
    return response;
};

/**
 * 获取所有作业标题列表
 */
export const findAllSchoolworkAPI = async () => {
    const url = `/schoolwork/schoolworkAll`;
    const options = {
        method: "GET"
    }
    const response: ApiResponse<SchoolworkVo[]> = await clientCoreFetcher(url, options);
    return response;
};

/**
 * 根据作业标题模糊查询作业列表
 * @param title 作业标题
 */
export const findSchoolworkByTitleAPI = async (title: string) => {
    const url = `/schoolwork/titles/${title}`;
    const options = {
        method: "GET"
    }
    const response: ApiResponse<SchoolworkVo[]> = await clientCoreFetcher(url, options);
    return response;
}; 