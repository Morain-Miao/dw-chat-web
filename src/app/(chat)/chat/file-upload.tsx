import React, { useState } from 'react';
import { Button, message, Upload, Modal } from 'antd';
import { PaperClipOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { uploadFilesBatchAPI } from '@/apis/chat-api';
import { getCurrentUserId } from '@/utils/IdUtil';

interface FileUploadProps {
    onUploadSuccess: (files: { id: number, name: string } | Array<{ id: number, name: string }>) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
    const [open, setOpen] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
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
        onRemove: (file: UploadFile) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file: File) => {
            const rcFile = file as any; // 断言为 RcFile 以兼容 UploadFile
            const uploadFile: UploadFile = {
                uid: rcFile.uid || Date.now().toString() + Math.random().toString(36).slice(2),
                name: rcFile.name,
                status: 'done' as const,
                originFileObj: rcFile,
            };
            setFileList(prev => [...prev, uploadFile]);
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