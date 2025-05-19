## DW Chat

一个接入 DeepSeek-V3、DeepSeek-R1 大模型的极简 AI 对话页面.


演示地址：https://dw-chat.dw1898.top

效果图：
![demo1.png](public/demo1.png)


#### 主要技术：

1.DeepSeek-V3、DeepSeek-R1 LLM

2.React 19

3.NextJS 15

4.Ant Design X

5.tailwind css


### 项目结构

dw-chat-web-lite：纯前端版工程     Github：https://github.com/dawei1898/dw-chat-web-lite

dw-chat-web：前端工程        Github：https://github.com/dawei1898/dw-chat-web

dw-chat：后端工程        Github：https://github.com/dawei1898/dw-chat

dw-chat-next：next 全栈版工程      Github：https://github.com/dawei1898/dw-chat-next


### 本地启动项目

安装依赖
```shell
npm install
```

启动项目

```bash
npm run dev
```

打开项目 http://localhost:3000




### 本项目用到的库

安装 Ant Design
```shell
npm install antd --save
```

安装 Ant Design X
```shell
npm install @ant-design/x --save
```

安装 Ant Design icon图标
```shell
npm install @ant-design/icons --save
```

```shell
npm install antd-style
```

安装 ProComponents
```bash
npm i @ant-design/pro-components --save
```

兼容 React 19
```shell
npm install --save-dev @ant-design/v5-patch-for-react-19
```

在应用入口处引入兼容包
```ts
import '@ant-design/v5-patch-for-react-19';
```

安装 @ant-design/nextjs-registry，解决antd组件页面闪动的情况
```bash
npm install @ant-design/nextjs-registry --save
```

安装 openai
```shell
npm install openai
```

安装 markdown-it
```shell
npm install markdown-it --save
npm install @types/markdown-it --save-dev
```

渲染HTML标签
```shell
npm install react-markdown rehype-raw dompurify
```

Markdown格式化
```shell
npm install remark-gfm
```

代码高亮
```shell
npm install highlight.js
```
高亮样式
```ts
import 'highlight.js/styles/atom-one-light.css';
```

复制
```shell
npm install clipboard-polyfill
```

```shell
npm install use-immer
```

客户端 Cookie
```shell
npm install js-cookie @types/js-cookie
```

# Nacos 3.0.0 Docker 部署指南

## 环境要求

- Docker
- Docker Compose

## 部署步骤

1. 创建必要的目录：

```bash
mkdir -p logs init.d mysql
```

2. 启动服务：

```bash
docker-compose up -d
```

3. 检查服务状态：

```bash
docker-compose ps
```

4. 查看日志：

```bash
docker-compose logs -f
```

## 访问 Nacos

- 控制台地址：http://localhost:8848/nacos
- 默认用户名：nacos
- 默认密码：nacos

## 端口说明

- 8848: Nacos 控制台端口
- 9848: Nacos 客户端 gRPC 请求服务端端口
- 9849: Nacos 服务端 gRPC 请求服务端端口
- 3306: MySQL 数据库端口

## 数据持久化

- MySQL 数据存储在 `./mysql` 目录
- Nacos 日志存储在 `./logs` 目录

## 注意事项

1. 首次启动时，MySQL 容器会自动创建数据库和表
2. 默认使用 standalone 模式运行
3. 如果需要修改配置，可以编辑 docker-compose.yml 文件
4. 默认的 MySQL 密码为 123456，建议在生产环境中修改

## 停止服务

```bash
docker-compose down
```

## 重启服务

```bash
docker-compose restart
```
