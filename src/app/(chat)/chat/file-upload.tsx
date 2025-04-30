import React, { useState } from 'react';
import { Button, message, Upload, Modal } from 'antd';
import { PaperClipOutlined } from '@ant-design/icons';
import type { UploadFile, UploadFileStatus } from 'antd/es/upload/interface';
import { uploadFileAPI } from '@/apis/chat-api';

interface FileUploadProps {
    onUploadSuccess: (files: UploadFile[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
    const [open, setOpen] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        setUploading(true);
        try {
            const uploadPromises = fileList.map(async (file) => {
                if (file.originFileObj) {
                    const response = await uploadFileAPI(file.originFileObj);
                    if (response.code === 200) {
                        const updatedFile: UploadFile = {
                            ...file,
                            status: 'done' as UploadFileStatus,
                            url: response.data.fileUrl,
                            response: response.data,
                        };
                        return updatedFile;
                    }
                }
                return file;
            });

            const updatedFiles = await Promise.all(uploadPromises);
            setFileList(updatedFiles);
            onUploadSuccess(updatedFiles);
            message.success('上传成功！');
            setOpen(false);
        } catch (error) {
            message.error('上传失败，请重试！');
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
        beforeUpload: (file: UploadFile) => {
            setFileList([...fileList, file]);
            return false;
        },
        fileList,
    };

    return (
        <>
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