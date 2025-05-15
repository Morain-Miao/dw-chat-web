import {appConfig} from "@/utils/appConfig";
import type {ApiResponse, PageParam, PageResult} from "@/apis/index";
import {clientFetcher} from "@/utils/fetcher";


/**
 * 会话记录
 */
export interface ChatRecord {
    chatId: string;
    chatName: string;
    userId: string;
}

/**
 * 会话记录返参
 */
export interface ChatRecordVO extends ChatRecord {
    createTime: string;
}

/**
 * 分查询会话记录入参
 */
export interface RecordPageParam extends PageParam {
    chatName: string
}

/**
 * 流式对话入参
 */
export interface StreamChatParam {
    chatId: string;
    content: string;
    userId: string;
    modelId?: string;
    openReasoning?: boolean;
    openSearch?: boolean;
    fileIds?: number[];
}

/**
 * 对话消息返参
 */
export interface MessageVO {
    msgId: string;
    chatId: string;
    type: string;
    content: string;
    reasoningContent?: string;
    voteType?: string;
    modelId?: string;
}

export type UserAgentMessage = {
    type: 'user';
    id: string;
    content: string;
    reasoningContent?: string;
    chatId?: string;
    openReasoning?: boolean;
    openSearch?: boolean;
    fileIds?: number[];
};

export type AIAgentMessage = {
    type: 'ai';
    id: string;
    content: string;
    reasoningContent?: string;
    chatId?: string;
    voteType?: 'up' | 'down' | '';
    loading?: boolean;
    openReasoning?: boolean;
    openSearch?: boolean;
};

export type AgentMessage = UserAgentMessage | AIAgentMessage;

export type BubbleMessage = {
    role: string;
};


/**
 * 点赞评论入参
 */
export interface VoteParam {
    contentId: string;
    voteType: string;
}

// 文件上传响应
export interface UploadFileVO {
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
}

/**
 * 查询会话列表 API
 *
 * @param param
 */
export const  queryChatPageAPI = async (param: RecordPageParam) => {
    const url = `/chat/queryChatPage`;
    const options = {
        method: "POST",
        body: JSON.stringify(param),
    }
    const response: ApiResponse<PageResult<ChatRecordVO>> = await clientFetcher(url, options);
    return response;
}


/**
 * 保存会话 API
 */
export const  saveChatAPI = async (param: ChatRecord) => {
    const url = `/chat/save`;
    const options = {
        method: "POST",
        body: JSON.stringify(param),
    }
    const response: ApiResponse<string> = await clientFetcher(url, options);
    return response;
}


/**
 * 删除会话 API
 */
export const  deleteChatAPI = async (chatId: string) => {
    const url = `/chat/delete/${chatId}`;
    const options = {
        method: "DELETE",
    }
    const response: ApiResponse<number> = await clientFetcher(url, options);
    return response;
}




/**
 * 查询当前会话消息列表
 */
export const  queryMessageListAPI = async (chatId: string) => {
    const url = `/chat/queryMessageList/${chatId}`;
    const options = {
        method: "GET",
    }
    const response: ApiResponse<MessageVO[]> = await clientFetcher(url, options);
    return response;
}


/**
 * 点赞/踩 API
 */
export const  saveVoteAPI = async (param: VoteParam) => {
    const url = `/vote/save`;
    const options = {
        method: "POST",
        body: JSON.stringify(param),
    }
    const response: ApiResponse<string> = await clientFetcher(url, options);
    return response;
}

// 文件上传API
// 返回 Long 类型的文件ID
export const uploadFileAPI = async (file: File, userId?: string): Promise<ApiResponse<number>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (userId) {
        formData.append('userId', userId);
    }
    return await clientFetcher('/files/upload', {
        method: 'POST',
        body: formData,
        // 不要设置 Content-Type，浏览器会自动处理 multipart/form-data
    });
};

// 批量文件上传API
// 返回 Long 类型的文件ID数组
export const uploadFilesBatchAPI = async (
  files: File[],
  userId: string,
  expireHours?: number
): Promise<ApiResponse<number[]>> => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  formData.append('userId', userId);
  if (expireHours !== undefined) {
    formData.append('expireHours', expireHours.toString());
  }

  return await clientFetcher('/files/upload/batch', {
    method: 'POST',
    body: formData,
    // 不要设置 Content-Type，浏览器会自动处理 multipart/form-data
  });
};


