import type { NextConfig } from "next";
import {appConfig} from "@/utils/appConfig";

const nextConfig: NextConfig = {
    // 开发环境，在服务端代理
    async rewrites() {
        return [
            {
                //source: '/dev/dwc/api/:path*',
                //destination: 'http://localhost:9500/:path*', // 代理后的目标地址
                source: `${appConfig.apiBaseUrl}/:path*`,
                destination: `${appConfig.apiProxyTargetUrl}/:path*`, // 代理后的目标地址
            },
            {
                source: '/chat/stream',
                destination: `${appConfig.apiStreamChatUrl}`, // 代理到后端服务
            },
        ];
    },
};

export default nextConfig;
