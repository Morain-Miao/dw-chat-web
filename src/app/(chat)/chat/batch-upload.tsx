import React, { useState, useEffect } from 'react';
import { Select, Space, Tag, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import type { SelectProps } from 'antd';

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
    const [className, setClassName] = useState<string>('');
    const [students, setStudents] = useState<Student[]>([]);
    const [homeworkOptions, setHomeworkOptions] = useState<SelectProps['options']>([]);
    const [classOptions, setClassOptions] = useState<SelectProps['options']>([]);

    // 模拟获取作业标题列表
    const fetchHomeworkTitles = async (search: string) => {
        // TODO: 替换为实际的API调用
        const mockData = ['5.14英语作业', '5.15数学作业', '5.16语文作业'].filter(
            title => title.toLowerCase().includes(search.toLowerCase())
        );
        return mockData.map(title => ({ label: title, value: title }));
    };

    // 模拟获取班级列表
    const fetchClassNames = async (search: string) => {
        // TODO: 替换为实际的API调用
        const mockData = ['初二五班', '初二六班', '初二七班'].filter(
            name => name.toLowerCase().includes(search.toLowerCase())
        );
        return mockData.map(name => ({ label: name, value: name }));
    };

    // 模拟获取学生列表
    const fetchStudents = async (homework: string, className: string) => {
        // TODO: 替换为实际的API调用
        const mockStudents = [
            { id: '1', name: '张三' },
            { id: '2', name: '李四' },
            { id: '3', name: '王五' },
        ];
        return mockStudents;
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

    // 当作业标题或班级变化时，获取学生列表
    useEffect(() => {
        const loadStudents = async () => {
            if (homeworkTitle && className) {
                const studentList = await fetchStudents(homeworkTitle, className);
                setStudents(studentList);
            } else {
                setStudents([]);
            }
        };
        loadStudents();
    }, [homeworkTitle, className]);

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
                            filterOption={false}
                            notFoundContent={null}
                        />
                        <Select
                            showSearch
                            placeholder="搜索班级"
                            style={{ flex: 1, minWidth: '200px' }}
                            options={classOptions}
                            onSearch={handleClassSearch}
                            onChange={value => setClassName(value)}
                            filterOption={false}
                            notFoundContent={null}
                        />
                    </div>
                </Space>

                {/* 学生列表区域 */}
                <div className="student-list" style={{ 
                    padding: '16px',
                    background: 'white',
                    borderRadius: '8px',
                    minHeight: '100px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}>
                    {students.length > 0 ? (
                        <Space wrap>
                            {students.map(student => (
                                <Tag
                                    key={student.id}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '4px 8px',
                                        borderRadius: '16px',
                                        background: '#f0f2f5',
                                        marginBottom: '8px'
                                    }}
                                    onClick={() => onStudentClick(homeworkTitle, student.name)}
                                >
                                    <Space>
                                        <QuestionCircleOutlined />
                                        {student.name}
                                    </Space>
                                </Tag>
                            ))}
                        </Space>
                    ) : (
                        <div style={{ 
                            color: '#666',
                            textAlign: 'center',
                            padding: '20px 0'
                        }}>
                            请选择作业标题和班级以查看学生列表
                        </div>
                    )}
                </div>
            </Space>
        </div>
    );
};

export default BatchUpload; 