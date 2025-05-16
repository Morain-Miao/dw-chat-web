import React, { useState, useEffect } from 'react';
import { Select, Space, Tag, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import type { SelectProps } from 'antd';
import { 
    ClazzVo, 
    findClazzByDisplayNameAPI, 
    findAllClazzAPI, 
    findStudentsByClazzIdAPI, 
    StudentVo,
    findAllSchoolworkAPI,
    findSchoolworkByTitleAPI,
    SchoolworkVo 
} from '@/apis/clazz-api';

const { Title } = Typography;

interface Student {
    id: string;
    name: string;
}

interface BatchUploadProps {
    onStudentClick: (homework: string, student: string) => void;
}

const BatchUpload: React.FC<BatchUploadProps> = ({ onStudentClick }) => {
    const [homeworkTitle, setHomeworkTitle] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<ClazzVo | null>(null);
    const [students, setStudents] = useState<StudentVo[]>([]);
    const [homeworkOptions, setHomeworkOptions] = useState<SelectProps['options']>([]);
    const [classOptions, setClassOptions] = useState<SelectProps['options']>([]);

    // 获取作业标题列表
    const fetchHomeworkTitles = async (search: string) => {
        try {
            const response = await findSchoolworkByTitleAPI(search);
            if (response.code === 200 && response.data) {
                return response.data.map((homework: SchoolworkVo) => ({
                    label: homework.title,
                    value: homework.title
                }));
            }
            return [];
        } catch (error) {
            console.error('获取作业标题列表失败:', error);
            return [];
        }
    };

    // 获取班级列表
    const fetchClassNames = async (search: string) => {
        try {
            const response = await findClazzByDisplayNameAPI(search);
            if (response.code === 200 && response.data) {
                return response.data.map((clazz: ClazzVo) => ({
                    label: clazz.displayName,
                    value: JSON.stringify(clazz)
                }));
            }
            return [];
        } catch (error) {
            console.error('获取班级列表失败:', error);
            return [];
        }
    };

    // 处理作业标题搜索
    const handleHomeworkSearch = async (search: string) => {
        const options = await fetchHomeworkTitles(search);
        setHomeworkOptions(options);
    };

    // 处理班级搜索
    const handleClassSearch = async (search: string) => {
        const options = await fetchClassNames(search);
        setClassOptions(options);
    };

    // 处理作业标题搜索框点击
    const handleHomeworkClick = async () => {
        try {
            const response = await findAllSchoolworkAPI();
            if (response.code === 200 && response.data) {
                const options = response.data.map((homework: SchoolworkVo) => ({
                    label: homework.title,
                    value: homework.title
                }));
                setHomeworkOptions(options);
            }
        } catch (error) {
            console.error('获取所有作业标题列表失败:', error);
        }
    };

    // 处理班级选择框点击
    const handleClassClick = async () => {
        try {
            const response = await findAllClazzAPI();
            if (response.code === 200 && response.data) {
                const options = response.data.map((clazz: ClazzVo) => ({
                    label: clazz.displayName,
                    value: JSON.stringify(clazz)
                }));
                setClassOptions(options);
            }
        } catch (error) {
            console.error('获取所有班级列表失败:', error);
        }
    };

    // 处理班级选择
    const handleClassChange = (value: string) => {
        const clazz = JSON.parse(value) as ClazzVo;
        setSelectedClass(clazz);
    };

    // 当班级变化时，获取学生列表
    useEffect(() => {
        const loadStudents = async () => {
            if (selectedClass) {
                try {
                    const response = await findStudentsByClazzIdAPI(selectedClass.id);
                    if (response.code === 200 && response.data) {
                        setStudents(response.data);
                    } else {
                        setStudents([]);
                        console.error('获取学生列表失败:', response.message);
                    }
                } catch (error) {
                    console.error('获取学生列表出错:', error);
                    setStudents([]);
                }
            } else {
                setStudents([]);
            }
        };
        loadStudents();
    }, [selectedClass]);

    return (
        <div className="batch-upload" style={{
            background: 'rgb(242, 246, 255)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '16px'
        }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                {/* 标题区域 */}
                <div style={{ 
                    fontSize: '16px',
                    color: '#666',
                    marginBottom: '20px'
                }}>
                    点击学生姓名可快速生成提交作业提示词
                </div>

                {/* 搜索下拉框区域 */}
                <Space style={{ width: '100%' }} direction="vertical" size="middle">
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'row', 
                        gap: '12px',
                        flexWrap: 'wrap'
                    }}>
                        <Select
                            showSearch
                            placeholder="搜索作业标题"
                            style={{ flex: 1, minWidth: '200px' }}
                            options={homeworkOptions}
                            onSearch={handleHomeworkSearch}
                            onChange={value => setHomeworkTitle(value)}
                            onClick={handleHomeworkClick}
                            filterOption={false}
                            notFoundContent={null}
                        />
                        <Select
                            showSearch
                            placeholder="搜索班级"
                            style={{ flex: 1, minWidth: '200px' }}
                            options={classOptions}
                            onSearch={handleClassSearch}
                            onChange={handleClassChange}
                            onClick={handleClassClick}
                            filterOption={false}
                            notFoundContent={null}
                        />
                    </div>

                    {/* 学生列表区域 */}
                    <div className="student-list" style={{ 
                        padding: '16px',
                        background: 'white',
                        borderRadius: '8px',
                        minHeight: '100px',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}>
                        {students.length > 0 ? (
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '12px',
                                justifyContent: 'flex-start'
                            }}>
                                {students.map(student => (
                                    <Tag
                                        key={student.id}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '10px 16px',
                                            borderRadius: '16px',
                                            background: 'rgb(242, 246, 255)',
                                            border: 'none',
                                            color: '#666',
                                            fontSize: '16px',
                                            margin: 0,
                                            minWidth: '80px',
                                            textAlign: 'center',
                                            transition: 'all 0.3s',
                                            userSelect: 'none',
                                            WebkitTapHighlightColor: 'transparent'
                                        }}
                                        onClick={() => onStudentClick(homeworkTitle, student.userAlias)}
                                    >
                                        {student.userAlias}
                                    </Tag>
                                ))}
                            </div>
                        ) : (
                            <div style={{ 
                                color: '#666',
                                textAlign: 'center',
                                padding: '20px 0'
                            }}>
                                请选择班级以查看学生列表
                            </div>
                        )}
                    </div>
                </Space>
            </Space>
        </div>
    );
};

export default BatchUpload; 