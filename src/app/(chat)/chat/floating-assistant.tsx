import React, { useState, useEffect } from 'react';
import { Space, Button } from 'antd';
import { Prompts, PromptsProps, Welcome } from '@ant-design/x';
import { CloseOutlined } from '@ant-design/icons';

const WELCOME_ICON = "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp";

type FloatingAssistantProps = {
  promptItems: PromptsProps['items'];
  handleSubmit: (value: string) => void;
  showBubble: boolean;
  onBubbleHide: () => void;
  handleFillInput?: (value: string) => void;
};

const FloatingAssistant: React.FC<FloatingAssistantProps> = ({
  promptItems,
  handleSubmit,
  showBubble,
  onBubbleHide,
  handleFillInput,
}) => {
  const [open, setOpen] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(showBubble);
  const [iconPosition, setIconPosition] = useState<{ top: number; right: number }>({ top: 32, right: 40 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [startPosition, setStartPosition] = useState<{ top: number; right: number }>({ top: 32, right: 40 });

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

  useEffect(() => {
    function handleMove(e: MouseEvent | TouchEvent) {
      if (!dragging || !dragStart) return;
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const deltaY = clientY - dragStart.y;
      const deltaX = dragStart.x - clientX;
      let newTop = startPosition.top + deltaY;
      let newRight = startPosition.right + deltaX;
      newTop = Math.max(0, Math.min(window.innerHeight - 60, newTop));
      newRight = Math.max(0, Math.min(window.innerWidth - 60, newRight));
      setIconPosition({ top: newTop, right: newRight });
    }
    function handleUp() {
      setDragging(false);
      setDragStart(null);
    }
    if (dragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [dragging, dragStart, startPosition]);

  if (open) {
    return (
      <div>
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.18)',
            zIndex: 1999,
          }}
          onClick={() => setOpen(false)}
        />
        <div
          className="floating-welcome-modal"
          style={{
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2000,
            background: '#fff',
            borderRadius: 18,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            padding: '32px 24px',
            width: '90vw',
            maxWidth: 700,
            minWidth: 320,
            boxSizing: 'border-box',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
          onClick={e => e.stopPropagation()}
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
              icon={<img className="modal-ai-avatar" src={WELCOME_ICON} alt="AI助手" />}
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
                  if (typeof handleFillInput === 'function') {
                    handleFillInput(data.description.toString());
                  }
                  setOpen(false);
                }
              }}
            />
          </Space>
        </div>
        <style>
          {`
            @media (max-width: 600px) {
              .floating-welcome-modal {
                padding: 10px 2vw !important;
                border-radius: 8px !important;
                max-width: 98vw !important;
                min-width: 0 !important;
                width: 98vw !important;
                max-height: 96vh !important;
              }
              .floating-welcome-modal h1, .floating-welcome-modal h2, .floating-welcome-modal h3 {
                font-size: 1.1em !important;
              }
              .floating-welcome-modal .ant-btn {
                min-width: 40px !important;
                min-height: 40px !important;
                font-size: 20px !important;
              }
              .modal-ai-avatar {
                display: block;
                margin: 0 auto;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.13);
                background: #fff;
                object-fit: contain;
              }
            }
            @media (max-width: 400px) {
              .modal-ai-avatar {
                width: 44px !important;
                height: 44px !important;
              }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        right: iconPosition.right,
        top: iconPosition.top,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        userSelect: dragging ? 'none' : undefined,
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
          cursor: dragging ? 'grabbing' : 'pointer',
          transition: 'all 0.2s',
          touchAction: 'none',
        }}
        onClick={() => {
          setOpen(true);
          setBubbleVisible(false);
          onBubbleHide();
        }}
        onMouseDown={e => {
          setDragging(true);
          setDragStart({ x: e.clientX, y: e.clientY });
          setStartPosition(iconPosition);
        }}
        onTouchStart={e => {
          setDragging(true);
          setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
          setStartPosition(iconPosition);
        }}
      >
        <img
          src={WELCOME_ICON}
          alt="AI助手"
          style={{ width: 44, height: 44, borderRadius: '50%' }}
          className="floating-welcome-avatar"
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
          @media (max-width: 600px) {
            .floating-welcome-avatar {
              width: 36px !important;
              height: 36px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default FloatingAssistant; 