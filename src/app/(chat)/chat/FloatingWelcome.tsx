import React, { useState, useEffect } from 'react';
import { Space, Button } from 'antd';
import { Prompts, PromptsProps, Welcome } from '@ant-design/x';
import { CloseOutlined } from '@ant-design/icons';

const WELCOME_ICON = "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp";

type FloatingWelcomeProps = {
  promptItems: PromptsProps['items'];
  handleSubmit: (value: string) => void;
  showBubble: boolean;
  onBubbleHide: () => void;
};

const FloatingWelcome: React.FC<FloatingWelcomeProps> = ({
  promptItems,
  handleSubmit,
  showBubble,
  onBubbleHide,
}) => {
  const [open, setOpen] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(showBubble);

  // 监听 showBubble prop 变化
  useEffect(() => {
    if (showBubble) {
      setBubbleVisible(true);
      const timer = setTimeout(() => {
        setBubbleVisible(false);
        onBubbleHide();
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setBubbleVisible(false);
    }
  }, [showBubble, onBubbleHide]);

  // 展开时居中大框
  if (open) {
    return (
      <div
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2000,
          background: '#fff',
          borderRadius: 18,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          padding: 32,
          minWidth: 600,
          maxWidth: '90vw',
        }}
      >
        <div style={{ position: 'absolute', right: 18, top: 18 }}>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setOpen(false)}
            style={{ fontSize: 20 }}
          />
        </div>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Welcome
            variant="borderless"
            icon={WELCOME_ICON}
            title="您好,我是燕桥中学Ai智能助手,很高兴认识你!"
            description="模型基于DeepSeek和阿里千问,可以回答你关于燕桥中学的任何问题,包括学生档案、作业批改、学生成绩等。"
            extra={<Space />}
          />
          <Prompts
            title={'你想问什么?'}
            items={promptItems}
            wrap
            styles={{
              item: {
                flex: 1,
                width: "100%",
                backgroundImage: `linear-gradient(137deg, #e5f4ff 0%, #efe7ff 100%)`,
                border: 0,
              },
              subItem: {
                background: "rgba(255,255,255,0.45)",
                border: "1px solid #FFF",
              },
            }}
            onItemClick={({ data }) => {
              if (data.description) {
                handleSubmit(data.description.toString());
                setOpen(false);
              }
            }}
          />
        </Space>
      </div>
    );
  }

  // 收起时页面右上角悬浮头像和气泡
  return (
    <div
      style={{
        position: 'fixed',
        right: 40,
        top: 32,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {bubbleVisible && (
        <div
          style={{
            marginRight: 12,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
            padding: '8px 16px',
            color: '#333',
            fontSize: 15,
            whiteSpace: 'nowrap',
            animation: 'fadeInOut 3s forwards',
          }}
        >
          Ai提示小助手在这里哦！
        </div>
      )}
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.13)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onClick={() => {
          setOpen(true);
          setBubbleVisible(false);
          onBubbleHide();
        }}
      >
        <img
          src={WELCOME_ICON}
          alt="AI助手"
          style={{ width: 44, height: 44, borderRadius: '50%' }}
        />
      </div>
      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

export default FloatingWelcome; 