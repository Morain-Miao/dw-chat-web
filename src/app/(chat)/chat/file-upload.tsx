import React, { useState } from 'react';
import { Button, message, Upload, Modal } from 'antd';
import { PaperClipOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { uploadFilesBatchAPI } from '@/apis/chat-api';
import { getCurrentUserId } from '@/utils/IdUtil';

interface FileUploadProps {
    onUploadSuccess: (files: { id: number, name: string } | Array<{ id: number, name: string }>) => void;
    fileList: UploadFile[];
    onRemoveFile: (file: UploadFile) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess, fileList, onRemoveFile }) => {
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const handleUpload = async () => {
        setUploading(true);
        try {
            const realFiles = fileList
                .map(f => f.originFileObj)
                .filter(Boolean) as File[];
            if (realFiles.length === 0) {
                messageApi.warning('请先选择文件');
                setUploading(false);
                return;
            }
            const userId = getCurrentUserId();
            const response = await uploadFilesBatchAPI(realFiles, userId);
            if (response.code === 200) {
                messageApi.success('上传成功！');
                setOpen(false);
                let filesInfo;
                if (Array.isArray(response.data)) {
                    filesInfo = response.data.map((id: number, idx: number) => ({
                        id,
                        name: fileList[idx]?.name || `文件${idx+1}`
                    }));
                } else {
                    filesInfo = { id: response.data, name: fileList[0]?.name || '文件' };
                }
                onUploadSuccess(filesInfo);
            }
        } catch (error) {
            messageApi.error('上传失败，请重试！');
        } finally {
            setUploading(false);
        }
    };

    const props = {
        onRemove: onRemoveFile,
        beforeUpload: (file: File) => {
            const rcFile = file as any; // 断言为 RcFile 以兼容 UploadFile
            const uploadFile: UploadFile = {
                uid: rcFile.uid || Date.now().toString() + Math.random().toString(36).slice(2),
                name: rcFile.name,
                status: 'done' as const,
                originFileObj: rcFile,
            };
            // 由父组件管理 fileList，这里只触发添加
            if (typeof onRemoveFile === 'function') {
                // 传递第二个参数 true 表示添加
                (onRemoveFile as any)(uploadFile, true);
            }
            return false;
        },
        fileList,
    };

    return (
        <>
            {contextHolder}
            <Button
                type="text"
                onClick={() => setOpen(true)}
                icon={<PaperClipOutlined rotate={135} style={{ fontSize: '18px', marginTop: '7px' }} />}
            />
            <Modal
                title="上传文件"
                open={open}
                onOk={handleUpload}
                onCancel={() => setOpen(false)}
                okText="上传"
                cancelText="取消"
                confirmLoading={uploading}
            >
                <Upload {...props} multiple>
                    <Button>选择文件</Button>
                </Upload>
            </Modal>
        </>
    );
};

export default FileUpload; 