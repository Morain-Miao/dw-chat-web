import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {AntdRegistry} from "@ant-design/nextjs-registry";
import AppProvider from "@/components/provider/app-provider"; // 解决页面加载闪烁
import { appConfig } from "@/utils/appConfig";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: appConfig.appName,
  description: "Cambridge School App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body  className={`${geistSans.variable} ${geistMono.variable} antialiased`} >
      <AppProvider>
        <AntdRegistry>
          {children}
        </AntdRegistry>
      </AppProvider>
      </body>
    </html>
  );
}
