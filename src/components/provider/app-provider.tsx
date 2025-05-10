'use client';

import React, {ReactNode} from 'react';
import ThemeProvider from "@/components/provider/theme-provider";

/**
 * 多个 Provider 嵌套使用
 *
 * @param children
 * @constructor
 */
const AppProvider = (
    {children}: {children: ReactNode}
) => {
    return (
        <ThemeProvider>
            {children}
        </ThemeProvider>
    );
};

export default AppProvider;